/**
 Copyright (c) 2016,2017,2018,2019,2020 Klaus Landsdorf (https://bianco-royal.com/)
 Copyright 2016 - Jason D. Harper, Argonne National Laboratory
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc.
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/
/**
 * Modbus Write node.
 * @module NodeRedModbusWrite
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const mbCore = require('./core/modbus-core')
  const internalDebugLog = require('debug')('contribModbus:write')

  function ModbusWrite (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

    this.unitid = config.unitid
    this.dataType = config.dataType
    this.adr = Number(config.adr)
    this.quantity = config.quantity

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

    node.onModbusWriteDone = function (resp, msg) {
      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo('write done', node)
      }

      node.send(mbCore.buildMessage(node.bufferMessageList, msg.payload, resp, msg))
    }

    node.onModbusWriteError = function (err, msg) {
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

      /* HTTP requests for boolean and multiple data string [1,2,3,4,5] */
      if (Object.prototype.hasOwnProperty.call(msg.payload, 'value') &&
        typeof msg.payload.value === 'string') {
        if (msg.payload.value === 'true' || msg.payload.value === 'false') {
          msg.payload.value = (msg.payload.value === 'true')
        } else {
          if (msg.payload.value.indexOf(',') > -1) {
            msg.payload.value = JSON.parse(msg.payload.value)
          }
        }
      }

      msg.messageId = mbCore.getObjectId()
      node.bufferMessageList.set(msg.messageId, msg)

      msg = {
        payload: {
          value: msg.payload.value || msg.payload,
          unitid: node.unitid,
          fc: mbCore.functionCodeModbusWrite(node.dataType),
          address: node.adr,
          quantity: node.quantity,
          messageId: msg.messageId
        },
        _msgid: msg._msgid
      }

      modbusClient.emit('writeModbus', msg, node.onModbusWriteDone, node.onModbusWriteError)

      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(modbusClient.actualServiceState, node)
      }
    })

    node.on('close', function (done) {
      mbBasics.setNodeStatusTo('closed', node)
      node.bufferMessageList.clear()
      modbusClient.deregisterForModbus(node.id, done)
    })
  }

  RED.nodes.registerType('modbus-write', ModbusWrite)
}
