/**
 Copyright (c) 2016,2017,2018,2019 Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
/**
 * Modbus Getter node.
 * @module NodeRedModbusGetter
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const mbCore = require('./core/modbus-core')
  const mbIOCore = require('./core/modbus-io-core')
  const internalDebugLog = require('debug')('contribModbus:getter')

  function ModbusGetter (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.unitid = config.unitid

    this.dataType = config.dataType
    this.adr = config.adr
    this.quantity = config.quantity

    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.msgThruput = config.msgThruput
    this.connection = null

    this.useIOFile = config.useIOFile
    this.ioFile = RED.nodes.getNode(config.ioFile)
    this.useIOForPayload = config.useIOForPayload
    this.logIOActivities = config.logIOActivities

    const node = this
    node.bufferMessageList = new Map()

    const modbusClient = RED.nodes.getNode(config.server)
    modbusClient.registerForModbus(node)
    mbBasics.initModbusClientEvents(node, modbusClient)
    mbBasics.setNodeStatusTo('waiting', node)

    node.onModbusCommandDone = function (resp, msg) {
      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo('reading done', node)
      }
      node.send(mbIOCore.buildMessageWithIO(node, resp.data, resp, msg))
    }

    node.onModbusCommandError = function (err, msg) {
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

      msg.messageId = mbCore.getObjectId()
      node.bufferMessageList.set(msg.messageId, msg)

      msg = {
        topic: msg.topic || node.id,
        payload: {
          value: msg.payload.value || msg.payload,
          unitid: node.unitid,
          fc: mbCore.functionCodeModbusRead(node.dataType),
          address: node.adr,
          quantity: node.quantity,
          messageId: msg.messageId
        },
        _msgid: msg._msgid
      }

      modbusClient.emit('readModbus', msg, node.onModbusCommandDone, node.onModbusCommandError)

      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(modbusClient.statlyMachine.getMachineState(), node)
      }
    })

    node.on('close', function (done) {
      mbBasics.setNodeStatusTo('closed', node)
      node.bufferMessageList.clear()
      modbusClient.deregisterForModbus(node, done)
    })
  }

  RED.nodes.registerType('modbus-getter', ModbusGetter)
}
