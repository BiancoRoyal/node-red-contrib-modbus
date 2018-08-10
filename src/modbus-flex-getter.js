/**
 Copyright (c) 2016,2017,2018 Klaus Landsdorf (http://bianco-royal.de/)
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
  let mbBasics = require('./modbus-basics')
  let mbCore = require('./core/modbus-core')
  let mbIOCore = require('./core/modbus-io-core')
  let internalDebugLog = require('debug')('contribModbus:flex:getter')

  function ModbusFlexGetter (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connection = null

    this.useIOFile = config.useIOFile
    this.ioFile = RED.nodes.getNode(config.ioFile)
    this.useIOForPayload = config.useIOForPayload

    let node = this
    node.bufferMessageList = new Map()
    let modbusClient = RED.nodes.getNode(config.server)
    modbusClient.registerForModbus(node)
    mbBasics.initModbusClientEvents(node, modbusClient)
    mbBasics.setNodeStatusTo('waiting', node)

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
      mbBasics.setModbusError(node, modbusClient, err, mbCore.getOriginalMessage(node.bufferMessageList, msg))
    }

    node.on('input', function (msg) {
      if (mbBasics.invalidPayloadIn(msg)) {
        return
      }

      if (!modbusClient.client) {
        return
      }

      try {
        if (typeof msg.payload === 'string') {
          msg.payload = JSON.parse(msg.payload)
        }

        msg.messageId = mbCore.getObjectId()
        node.bufferMessageList.set(msg.messageId, msg)

        msg.payload.fc = parseInt(msg.payload.fc) || 3
        msg.payload.unitid = parseInt(msg.payload.unitid)
        msg.payload.address = parseInt(msg.payload.address) || 0
        msg.payload.quantity = parseInt(msg.payload.quantity) || 1

        if (!(Number.isInteger(msg.payload.fc) &&
              msg.payload.fc >= 1 &&
              msg.payload.fc <= 4)) {
          node.error('FC Not Valid', msg)
          return
        }

        if (!(Number.isInteger(msg.payload.address) &&
              msg.payload.address >= 0 &&
              msg.payload.address <= 65535)) {
          node.error('Address Not Valid', msg)
          return
        }

        if (!(Number.isInteger(msg.payload.quantity) &&
              msg.payload.quantity >= 1 &&
              msg.payload.quantity <= 65535)) {
          node.error('Quantity Not Valid', msg)
          return
        }

        msg = {
          topic: msg.topic || node.id,
          payload: {
            value: msg.payload.value || msg.value,
            unitid: msg.payload.unitid,
            fc: msg.payload.fc,
            address: msg.payload.address,
            quantity: msg.payload.quantity,
            messageId: msg.messageId
          },
          _msgid: msg._msgid
        }

        modbusClient.emit('readModbus', msg, node.onModbusReadDone, node.onModbusReadError)
      } catch (err) {
        node.error(err, msg)
      }

      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(modbusClient.statlyMachine.getMachineState(), node)
      }
    })

    node.on('close', function (done) {
      mbBasics.setNodeStatusTo('closed', node)
      modbusClient.deregisterForModbus(node, done)
    })
  }

  RED.nodes.registerType('modbus-flex-getter', ModbusFlexGetter)
}
