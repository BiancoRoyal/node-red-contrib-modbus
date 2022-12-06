/**
 Copyright (c) 2016,2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */

/**
 * Modbus flexible Getter node.
 * @module NodeRedModbusFlexGetter
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const mbCore = require('./core/modbus-core')
  const mbIOCore = require('./core/modbus-io-core')
  const internalDebugLog = require('debug')('contribModbus:flex:getter')

  function ModbusFlexGetter (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
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
    this.startDelayTime = parseInt(config.startDelayTime) || 10

    const node = this
    node.bufferMessageList = new Map()
    node.INPUT_TIMEOUT_MILLISECONDS = 1000
    node.delayOccured = false
    node.delayTimerFlexGetter = null
    mbBasics.setNodeStatusTo('waiting', node)

    const modbusClient = RED.nodes.getNode(config.server)
    if (!modbusClient) {
      return
    }
    modbusClient.registerForModbus(node)
    mbBasics.initModbusClientEvents(node, modbusClient)

    node.onModbusReadDone = function (resp, msg) {
      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo('reading done', node)
      }

      node.send(mbIOCore.buildMessageWithIO(node, resp.data, resp, msg))
      node.emit('modbusFlexGetterNodeDone')
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
      node.emit('modbusFlexGetterNodeError')
    }

    node.prepareMsg = function (msg) {
      if (typeof msg.payload === 'string') {
        msg.payload = JSON.parse(msg.payload)
      }

      msg.payload.fc = parseInt(msg.payload.fc) || 3
      msg.payload.unitid = parseInt(msg.payload.unitid)
      msg.payload.address = parseInt(msg.payload.address) || 0
      msg.payload.quantity = parseInt(msg.payload.quantity) || 1

      return msg
    }

    node.isValidModbusMsg = function (msg) {
      let isValid = true

      if (!(Number.isInteger(msg.payload.fc) &&
              msg.payload.fc >= 1 &&
              msg.payload.fc <= 4)) {
        node.error('FC Not Valid', msg)
        isValid &= false
      }

      if (isValid &&
            !(Number.isInteger(msg.payload.address) &&
            msg.payload.address >= 0 &&
            msg.payload.address <= 65535)) {
        node.error('Address Not Valid', msg)
        isValid &= false
      }

      if (isValid &&
            !(Number.isInteger(msg.payload.quantity) &&
            msg.payload.quantity >= 1 &&
            msg.payload.quantity <= 65535)) {
        node.error('Quantity Not Valid', msg)
        isValid &= false
      }

      return isValid
    }

    node.buildNewMessageObject = function (node, msg) {
      const messageId = mbCore.getObjectId()
      return {
        topic: msg.topic || node.id,
        messageId,
        payload: {
          value: msg.payload.value || msg.value,
          unitid: msg.payload.unitid,
          fc: msg.payload.fc,
          address: msg.payload.address,
          quantity: msg.payload.quantity,
          emptyMsgOnFail: node.emptyMsgOnFail,
          keepMsgProperties: node.keepMsgProperties,
          messageId
        }
      }
    }

    function verboseWarn (logMessage) {
      if (RED.settings.verbose && node.showWarnings) {
        // node.updateServerinfo()
        node.warn('Flex-Getter -> ' + logMessage)
      }
    }

    node.isReadyForInput = function (msg) {
      return (modbusClient.client && modbusClient.isActive() && node.delayOccured)
    }

    node.isNotReadyForInput = function (msg) {
      return !node.isReadyForInput(msg)
    }

    node.resetDelayTimerToFlexGetter = function () {
      if (node.delayTimerFlexGetter) {
        verboseWarn('resetDelayTimerToFlexGetter node ' + node.id)
        clearTimeout(node.delayTimerFlexGetter)
      }
      node.delayTimerFlexGetter = null
      node.delayOccured = false
    }

    node.initializeFlexGetterTimer = function () {
      node.resetDelayTimerToFlexGetter()
      if (node.delayOnStart) {
        verboseWarn('initializeFlexGetterTimer delay timer node ' + node.id)
        node.delayTimerFlexGetter = setTimeout(() => {
          node.delayOccured = true
        }, node.INPUT_TIMEOUT_MILLISECONDS * node.startDelayTime)
      } else {
        node.delayOccured = true
      }
    }

    node.initializeFlexGetterTimer()

    node.on('input', function (msg) {
      if (mbBasics.invalidPayloadIn(msg)) {
        verboseWarn('Invalid message: no payload on msg')
        return
      }

      if (node.isNotReadyForInput(msg)) {
        if (node.delayOccured) {
          if (modbusClient.isInactive()) {
            verboseWarn('Not ready for Input: Client is not active. Please use initial delay on start or ' +
              'send data more slowly.')
          } else {
            verboseWarn('Not ready for Input. Use initial delay on start for possible fix')
          }
        }
        return
      }

      const origMsgInput = Object.assign({}, msg) // keep it origin
      try {
        const inputMsg = node.prepareMsg(origMsgInput)
        if (node.isValidModbusMsg(inputMsg)) {
          const newMsg = node.buildNewMessageObject(node, inputMsg)
          node.bufferMessageList.set(newMsg.messageId, mbBasics.buildNewMessage(node.keepMsgProperties, inputMsg, newMsg))
          modbusClient.emit('readModbus', newMsg, node.onModbusReadDone, node.onModbusReadError)
        }
      } catch (err) {
        node.errorProtocolMsg(err, origMsgInput)
        mbBasics.sendEmptyMsgOnFail(node, err, origMsgInput)
      }

      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(modbusClient.actualServiceState, node)
      }
    })

    node.on('close', function (done) {
      node.resetDelayTimerToFlexGetter()
      mbBasics.setNodeStatusTo('closed', node)
      node.bufferMessageList.clear()
      modbusClient.deregisterForModbus(node.id, done)
    })

    if (!node.showStatusActivities) {
      mbBasics.setNodeDefaultStatus(node)
    }
  }

  RED.nodes.registerType('modbus-flex-getter', ModbusFlexGetter)
}
