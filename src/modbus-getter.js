/**
 Copyright (c) 2016,2017, Klaus Landsdorf (http://bianco-royal.de/)
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
  let mbBasics = require('./modbus-basics')
  let mbCore = require('./core/modbus-core')
  let mbIOCore = require('./core/modbus-io-core')
  let internalDebugLog = require('debug')('contribModbus:getter')

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
        msg.messageId = mbCore.getObjectId()
        node.bufferMessageList.set(msg.messageId, msg)
        internalDebugLog('Add Message ' + msg.messageId)

        msg = {
          topic: msg.topic || node.id,
          payload: {
            value: msg.payload.value || msg.payload,
            unitid: node.unitid,
            fc: mbCore.functionCodeModbus(node.dataType),
            address: node.adr,
            quantity: node.quantity,
            messageId: msg.messageId
          },
          _msgid: msg._msgid
        }

        modbusClient.emit('readModbus', msg, node.onModbusReadDone, node.onModbusReadError)

        if (node.showStatusActivities) {
          setNodeStatusTo(modbusClient.statlyMachine.getMachineState())
          verboseLog(msg)
        }
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

      let rawMsg = Object.assign({}, origMsg)
      rawMsg.payload = response
      rawMsg.values = values
      delete rawMsg['responseBuffer']

      if (node.useIOFile && node.ioFile.lastUpdatedAt) {
        let allValueNames = mbIOCore.nameValuesFromIOFile(msg, node.ioFile, values, response, node.adr)
        let valueNames = mbIOCore.filterValueNames(allValueNames, mbCore.functionCodeModbus(node.dataType), node.adr, node.quantity)

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

  RED.nodes.registerType('modbus-getter', ModbusGetter)
}
