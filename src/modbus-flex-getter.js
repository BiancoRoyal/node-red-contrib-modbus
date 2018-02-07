/**
 Copyright (c) 2016,2017, Klaus Landsdorf (http://bianco-royal.de/)
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
    let modbusClient = RED.nodes.getNode(config.server)
    node.bufferMessageList = new Map()

    setNodeStatusTo('waiting')

    node.onModbusInit = function () {
      setNodeStatusTo('initialize')
    }

    node.onModbusConnect = function () {
      setNodeStatusTo('connected')
    }

    node.onModbusActive = function () {
      setNodeStatusTo('active')
    }

    node.onModbusError = function (failureMsg) {
      setNodeStatusTo('failure')
      if (node.showErrors) {
        node.warn(failureMsg)
      }
    }

    node.onModbusClose = function () {
      setNodeStatusTo('closed')
    }

    node.onModbusBroken = function () {
      setNodeStatusTo('reconnecting after ' + modbusClient.reconnectTimeout + ' msec.')
    }

    modbusClient.on('mbinit', node.onModbusInit)
    modbusClient.on('mbconnected', node.onModbusConnect)
    modbusClient.on('mbactive', node.onModbusActive)
    modbusClient.on('mberror', node.onModbusError)
    modbusClient.on('mbbroken', node.onModbusBroken)
    modbusClient.on('mbclosed', node.onModbusClose)

    node.on('input', function (msg) {
      if (!modbusClient.client) {
        return
      }

      if (msg.payload) {
        try {
          if (typeof msg.payload === 'string') {
            msg.payload = JSON.parse(msg.payload)
          }

          msg.messageId = mbCore.getObjectId()
          node.bufferMessageList.set(msg.messageId, msg)
          internalDebugLog('Add Message ' + msg.messageId)

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
          setNodeStatusTo(modbusClient.statlyMachine.getMachineState())
          verboseLog(msg)
        }
      } else {
        node.error('Payload Not Valid', msg)
      }
    })

    node.onModbusReadDone = function (resp, msg) {
      if (node.showStatusActivities) {
        setNodeStatusTo('reading done')
      }
      node.send(buildMessage(resp.data, resp, msg))
    }

    node.onModbusReadError = function (err, msg) {
      internalDebugLog(err.message)
      mbBasics.setModbusError(node, modbusClient, err, mbCore.getOriginalMessage(node.bufferMessageList, msg) || msg, setNodeStatusTo)
    }

    node.on('close', function () {
      setNodeStatusTo('closed')
    })

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        internalDebugLog((typeof logMessage === 'string') ? logMessage : JSON.stringify(logMessage))
      }
    }

    function buildMessage (values, response, msg) {
      let origMsg = mbCore.getOriginalMessage(node.bufferMessageList, msg) || msg
      origMsg.payload = values
      origMsg.topic = msg.topic
      origMsg.responseBuffer = response
      origMsg.input = msg

      let rawMsg = Object.assign({}, origMsg)
      rawMsg.payload = response
      rawMsg.values = values
      delete rawMsg['responseBuffer']

      if (node.useIOFile && node.ioFile.lastUpdatedAt) {
        let allValueNames = mbIOCore.nameValuesFromIOFile(msg, node.ioFile, values, response, parseInt(msg.payload.address) || 0)
        let valueNames = mbIOCore.filterValueNames(allValueNames, parseInt(msg.payload.fc) || 3,
          parseInt(msg.payload.address) || 0,
          parseInt(msg.payload.quantity) || 1)

        if (node.useIOForPayload) {
          origMsg.payload = valueNames
          origMsg.values = values
        } else {
          origMsg.payload = values
          origMsg.valueNames = valueNames
        }

        rawMsg.valueNames = valueNames
        return [origMsg, rawMsg]
      } else {
        return [origMsg, rawMsg]
      }
    }

    function setNodeStatusTo (statusValue) {
      let statusOptions = mbBasics.setNodeStatusProperties(statusValue, node.showStatusActivities)

      node.status({
        fill: statusOptions.fill,
        shape: statusOptions.shape,
        text: statusOptions.status
      })
    }
  }

  RED.nodes.registerType('modbus-flex-getter', ModbusFlexGetter)
}
