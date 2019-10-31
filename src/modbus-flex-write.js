/**
 Copyright (c) 2016,2017,2018,2019 Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/
/**
 * Modbus flexible Write node.
 * @module NodeRedModbusFlexWrite
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const mbCore = require('./core/modbus-core')
  const internalDebugLog = require('debug')('contribModbus:flex:write')

  function ModbusFlexWrite (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

    const node = this
    const modbusClient = RED.nodes.getNode(config.server)
    modbusClient.registerForModbus(node)
    node.bufferMessageList = new Map()

    mbBasics.initModbusClientEvents(node, modbusClient)
    mbBasics.setNodeStatusTo('waiting', node)

    node.onModbusWriteDone = function (resp, msg) {
      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo('writing done', node)
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

      try {
        if (typeof msg.payload === 'string') {
          msg.payload = JSON.parse(msg.payload)
        }

        msg.payload.fc = parseInt(msg.payload.fc)
        msg.payload.unitid = parseInt(msg.payload.unitid)
        msg.payload.address = parseInt(msg.payload.address)
        msg.payload.quantity = parseInt(msg.payload.quantity)

        if (!(Number.isInteger(msg.payload.fc) &&
              (msg.payload.fc === 5 ||
                msg.payload.fc === 6 ||
                msg.payload.fc === 15 ||
                msg.payload.fc === 16))) {
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

        /* HTTP requests for boolean and multiple data string [1,2,3,4,5] */
        if (Object.prototype.hasOwnProperty.call(msg.payload, 'value') && typeof msg.payload.value === 'string') {
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

        modbusClient.emit('writeModbus', msg, node.onModbusWriteDone, node.onModbusWriteError)
      } catch (err) {
        internalDebugLog(err.message)
        if (node.showErrors) {
          node.error(err, msg)
        }
      }

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

  RED.nodes.registerType('modbus-flex-write', ModbusFlexWrite)
}
