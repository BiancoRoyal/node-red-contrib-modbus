/**
 Copyright (c) 2016,2017,2018,2019,2020,2021 Klaus Landsdorf (https://bianco-royal.space/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

@author <a>Andrea Verardi</a> (Anversoft)
 */
/**
 * Modbus Getter node.
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
    this.connection = null

    this.useIOFile = config.useIOFile
    this.ioFile = RED.nodes.getNode(config.ioFile)
    this.useIOForPayload = config.useIOForPayload
    this.logIOActivities = config.logIOActivities

    this.emptyMsgOnFail = config.emptyMsgOnFail
    this.keepMsgProperties = config.keepMsgProperties
    this.internalDebugLog = internalDebugLog
    this.verboseLogging = RED.settings.verbose

    const node = this
    node.bufferMessageList = new Map()
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
      mbBasics.logMsgError(node, err, msg)
      mbBasics.sendEmptyMsgOnFail(node, err, msg)
    }

    node.onModbusReadError = function (err, msg) {
      node.internalDebugLog(err.message)
      const origMsg = mbCore.getOriginalMessage(node.bufferMessageList, msg)
      node.errorProtocolMsg(err, origMsg)
      mbBasics.setModbusError(node, modbusClient, err, origMsg)
      node.emit('modbusFlexGetterNodeError')
    }

    node.prepareMsg = function (msg) {
      if (typeof msg === 'string') {
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
      let isValid = true

      if (!(Number.isInteger(msg.unitid) &&
          msg.unitid >= 1 &&
          msg.unitid <= 255)) {
        node.error('Unit ID Not Valid', msg)
        isValid &= false
      }

      if (isValid &&
        !(Number.isInteger(msg.address) &&
          msg.address >= 0 &&
          msg.address <= 65535)) {
        node.error('Address Not Valid', msg)
        isValid &= false
      }

      if (isValid &&
        !(Number.isInteger(msg.quantity) &&
          msg.quantity >= 1 &&
          msg.quantity <= 65535)) {
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

    node.on('input', function (msg) {
      // Se il client è nullo non eseguire niente
      if (!modbusClient.client) {
        return
      }
      // Copia le sequenze in una costante, se msg contiene sequences allora esegui l'override
      const seq = mbBasics.invalidSequencesIn(msg) ? node.sequences : msg.sequences

      // Mantieni l'origine
      const origMsgInput = Object.assign({}, msg)

      try {
        for (const m in seq) {
          const inputMsg = node.prepareMsg(seq[m])
          if (node.isValidModbusMsg(inputMsg)) {
            const newMsg = node.buildNewMessageObject(node, inputMsg)
            node.bufferMessageList.set(newMsg.messageId, mbBasics.buildNewMessage(node.keepMsgProperties, inputMsg, newMsg))
            modbusClient.emit('readModbus', newMsg, node.onModbusReadDone, node.onModbusReadError)
          }
        }
      } catch (err) {
        node.errorProtocolMsg(err, origMsgInput)
      }

      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(modbusClient.actualServiceState, node)
      }
    })

    node.on('close', function (done) {
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
