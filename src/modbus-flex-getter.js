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
  let mbBasics = require('./modbus-basics')
  let mbCore = require('./core/modbus-core')
  let internalDebugLog = require('debug')('contribModbus:flex:getter')

  function ModbusFlexGetter (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connection = null

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

    modbusClient.on('mbinit', node.onModbusInit)
    modbusClient.on('mbconnected', node.onModbusConnect)
    modbusClient.on('mbactive', node.onModbusActive)
    modbusClient.on('mberror', node.onModbusError)
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
      setModbusError(err, mbCore.getOriginalMessage(node.bufferMessageList, msg) || msg)
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
      origMsg.responseBuffer = response
      origMsg.input = msg

      let rawMsg = origMsg
      rawMsg.payload = response
      rawMsg.values = values
      delete rawMsg['responseBuffer']

      return [origMsg, rawMsg]
    }

    function setNodeStatusTo (statusValue) {
      let statusOptions = mbBasics.set_node_status_properties(statusValue, node.showStatusActivities)

      node.status({
        fill: statusOptions.fill,
        shape: statusOptions.shape,
        text: statusOptions.status
      })
    }

    function setModbusError (err, msg) {
      let working = false

      if (err) {
        internalDebugLog(err.message)

        switch (err.message) {
          case 'Timed out':
            setNodeStatusTo('timeout')
            working = true
            break
          case 'FSM Not Ready To Read':
            setNodeStatusTo('not ready to read')
            working = true
            break
          case 'Port Not Open':
            setNodeStatusTo('reconnect')
            modbusClient.emit('reconnect')
            working = true
            break
          default:
            setNodeStatusTo('error ' + err.message)
            if (node.showErrors) {
              node.error(err, msg)
            }
        }
      }
      return working
    }
  }

  RED.nodes.registerType('modbus-flex-getter', ModbusFlexGetter)
}
