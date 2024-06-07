/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a>Andrea Verardi</a> (Anversoft)
 */

/**
 * Modbus Sequencer node.
 * @module NodeRedModbusFlexSequencer
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const mbCore = require('./core/modbus-core')
  const mbIOCore = require('./core/modbus-io-core')
  const internalDebugLog = require('debug')('contribModbus:poller')

  function ModbusFlexSequencer (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.sequences = config.sequences

    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.showWarnings = config.showWarnings
    this.connection = null

    this.useIOFile = config.useIOFile
    this.ioFile = RED.nodes.getNode(config.ioFile)
    this.useIOForPayload = config.useIOForPayload
    this.logIOActivities = config.logIOActivities

    this.emptyMsgOnFail = config.emptyMsgOnFail
    this.keepMsgProperties = config.keepMsgProperties
    this.internalDebugLog = internalDebugLog
    this.verboseLogging = RED.settings.verbose

    this.delayOnStart = config.delayOnStart
    this.startDelayTime = Number(config.startDelayTime) || 10

    const node = this
    node.bufferMessageList = new Map()
    node.INPUT_TIMEOUT_MILLISECONDS = 1000
    node.delayOccured = false
    node.inputDelayTimer = null

    mbBasics.setNodeStatusTo('waiting', node)

    const modbusClient = RED.nodes.getNode(config.server)
    if (!modbusClient) {
      throw new Error('Modbus client not found')
    }

    modbusClient.registerForModbus(node)
    mbBasics.initModbusClientEvents(node, modbusClient)

    node.onModbusReadDone = function (resp, msg) {
      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo('reading done', node)
      }

      node.send(mbIOCore.buildMessageWithIO(node, resp.data, resp, msg))
      node.emit('modbusFlexSequencerNodeDone')
    }

    node.errorProtocolMsg = function (err, msg) {
      if (node.showErrors) {
        mbBasics.logMsgError(node, err, msg)
      }
    }

    node.onModbusReadError = function (err, msg) {
      node.internalDebugLog(err.message)
      const origMsg = mbCore.getOriginalMessage(node.bufferMessageList, msg)
      node.errorProtocolMsg(err, origMsg)
      mbBasics.sendEmptyMsgOnFail(node, err, msg)
      mbBasics.setModbusError(node, modbusClient, err, origMsg)
      node.emit('modbusFlexSequencerNodeError')
    }

    node.prepareMsg = (msg) => {
      if (typeof msg === 'string') {
        // NOTE: The operation can fail!
        msg = JSON.parse(msg)
      }

      switch (msg.fc) {
        case 'FC1':
          msg.fc = 1
          break
        case 'FC2':
          msg.fc = 2
          break
        case 'FC3':
          msg.fc = 3
          break
        case 'FC4':
          msg.fc = 4
          break
      }

      msg.unitid = parseInt(msg.unitid)
      msg.address = parseInt(msg.address) || 0
      msg.quantity = parseInt(msg.quantity) || 1

      return msg
    }

    node.isValidModbusMsg = function (msg) {
      // let isValid = true
      // The original author did isValid &= false i replaced it with a simple early return if that breaks something
      // we should change it back to the original value.
      if (!(Number.isInteger(msg.unitid) &&
          msg.unitid >= 0 &&
          msg.unitid <= 255)) {
        node.error('Unit ID Not Valid', msg)
        return false
      }

      if (!(Number.isInteger(msg.address) &&
          msg.address >= 0 &&
          msg.address <= 65535)) {
        node.error('Address Not Valid', msg)
        return false
      }

      if (!(Number.isInteger(msg.quantity) &&
          msg.quantity >= 1 &&
          msg.quantity <= 65535)) {
        node.error('Quantity Not Valid', msg)
        return false
      }

      return true
    }

    node.buildNewMessageObject = function (node, msg) {
      const messageId = mbCore.getObjectId()
      return {
        topic: msg.topic || node.id,
        messageId,
        payload: {
          name: msg.name,
          unitid: msg.unitid,
          fc: msg.fc,
          address: msg.address,
          quantity: msg.quantity,
          emptyMsgOnFail: node.emptyMsgOnFail,
          keepMsgProperties: node.keepMsgProperties,
          messageId
        }
      }
    }
    /* istanbul ignore next */
    function verboseWarn (logMessage) {
      if (RED.settings.verbose && node.showWarnings) {
        node.warn('Flex-Sequencer -> ' + logMessage)
      }
    }

    node.isReadyForInput = function () {
      return (modbusClient.client && modbusClient.isActive() && node.delayOccured)
    }

    node.isNotReadyForInput = function () {
      return !node.isReadyForInput()
    }

    node.resetInputDelayTimer = function () {
      /* istanbul ignore next */
      if (node.inputDelayTimer) {
        verboseWarn('reset input delay timer node ' + node.id)
        clearTimeout(node.inputDelayTimer)
      }
      node.inputDelayTimer = null
      node.delayOccured = false
    }

    node.initializeInputDelayTimer = function () {
      node.resetInputDelayTimer()
      if (node.delayOnStart) {
        /* istanbul ignore next */
        verboseWarn('initialize input delay timer node ' + node.id)
        node.inputDelayTimer = setTimeout(() => {
          node.delayOccured = true
        }, node.INPUT_TIMEOUT_MILLISECONDS * node.startDelayTime)
      } else {
        node.delayOccured = true
      }
    }

    node.initializeInputDelayTimer()

    node.on('input', (msg) => {
      /* istanbul ignore next */
      if (mbBasics.invalidPayloadIn(msg)) {
        verboseWarn('Invalid message on input.')
        return
      }
      /* istanbul ignore next */
      if (node.isNotReadyForInput()) {
        verboseWarn('Inject while node is not ready for input.')
        return
      }
      /* istanbul ignore next */
      if (modbusClient.isInactive()) {
        verboseWarn('You sent an input to inactive client. Please use initial delay on start or send data more slowly.')
        return
      }

      const origMsgInput = Object.assign({}, msg)
      const sequences = mbBasics.invalidSequencesIn(msg) ? node.sequences : msg.sequences

      try {
        sequences.forEach(msg => {
          const inputMsg = node.prepareMsg(msg)
          if (node.isValidModbusMsg(inputMsg)) {
            const newMsg = node.buildNewMessageObject(node, inputMsg)
            node.bufferMessageList.set(newMsg.messageId, mbBasics.buildNewMessage(node.keepMsgProperties, inputMsg, newMsg))
            modbusClient.emit('readModbus', newMsg, node.onModbusReadDone, node.onModbusReadError)
          }
        })
      } catch (err) {
        node.errorProtocolMsg(err, origMsgInput)
        mbBasics.sendEmptyMsgOnFail(node, err, origMsgInput)
      }

      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(modbusClient.actualServiceState, node)
      }
    })

    node.on('close', (done) => {
      mbBasics.setNodeStatusTo('closed', node)
      node.bufferMessageList.clear()
      modbusClient.deregisterForModbus(node.id, done)
    })

    if (!node.showStatusActivities) {
      mbBasics.setNodeDefaultStatus(node)
    }
  }

  RED.nodes.registerType('modbus-flex-sequencer', ModbusFlexSequencer)
}
