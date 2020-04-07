/**
 Copyright (c) 2016,2017,2018,2019,2020 Klaus Landsdorf (https://bianco-royal.com/)
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
    this.connection = null

    this.useIOFile = config.useIOFile
    this.ioFile = RED.nodes.getNode(config.ioFile)
    this.useIOForPayload = config.useIOForPayload
    this.logIOActivities = config.logIOActivities

    this.emptyMsgOnFail = config.emptyMsgOnFail
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
    }

    node.onModbusReadError = function (err, msg) {
      internalDebugLog(err.message)
      if (node.showErrors) {
        node.error(err, msg)
      }

      mbBasics.emptyMsgOnFail(node, err, msg)
      mbBasics.setModbusError(node, modbusClient, err, mbCore.getOriginalMessage(node.bufferMessageList, msg))
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
      const newMsg = Object.assign({}, msg)
      newMsg.topic = msg.topic || node.id
      newMsg.payload = {
        value: msg.payload.value || msg.value,
        unitid: msg.payload.unitid,
        fc: msg.payload.fc,
        address: msg.payload.address,
        quantity: msg.payload.quantity,
        messageId: msg.messageId,
        emptyMsgOnFail: node.emptyMsgOnFail
      }
      return newMsg
    }

    node.on('input', function (msg) {
      if (mbBasics.invalidPayloadIn(msg) || !modbusClient.client) {
        return
      }

      try {
        msg = node.prepareMsg(msg)
        if (node.isValidModbusMsg(msg)) {
          msg.messageId = mbCore.getObjectId()
          node.bufferMessageList.set(msg.messageId, msg)
          const newMsg = node.buildNewMessageObject(node, msg)
          modbusClient.emit('readModbus', newMsg, node.onModbusReadDone, node.onModbusReadError)
        }
      } catch (err) {
        internalDebugLog(err.message)
        if (node.showErrors) {
          node.error(err, msg)
        }

        mbBasics.emptyMsgOnFail(node, err, msg)
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

  RED.nodes.registerType('modbus-flex-getter', ModbusFlexGetter)
}
