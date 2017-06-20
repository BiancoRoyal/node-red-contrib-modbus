/**
 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
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
  let mbBasics = require('./modbus-basics')
  let internalDebugLog = require('debug')('node_red_contrib_modbus')

  function ModbusWrite (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

    this.unitid = config.unitid
    this.dataType = config.dataType
    this.adr = Number(config.adr)
    this.quantity = config.quantity

    let node = this
    let modbusClient = RED.nodes.getNode(config.server)

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
      if (!(msg && msg.hasOwnProperty('payload'))) return

      if (msg.payload == null) {
        setNodeStatusTo('payload error')
        node.error('invalid msg.payload', msg)
        return
      }

      if (!modbusClient.client) {
        return
      }

      msg.payload = {
        value: msg.payload,
        unitid: node.unitid,
        fc: node.functionCodeModbus(node.dataType),
        address: node.adr,
        quantity: node.quantity
      }

      if (node.showStatusActivities) {
        setNodeStatusTo(modbusClient.statlyMachine.getMachineState())
        verboseLog(JSON.toString(msg))
      }

      modbusClient.emit('writeModbus', msg, node.onModbusWriteDone, node.onModbusWriteError)
    })

    node.functionCodeModbus = function (dataType) {
      switch (dataType) {
        case 'Coil':
          return 5
        case 'HoldingRegister':
          return 6
        case 'MCoils':
          return 15
        case 'MHoldingRegisters':
          return 16
        default:
          return dataType
      }
    }

    node.onModbusWriteDone = function (resp, msg) {
      if (node.showStatusActivities) {
        setNodeStatusTo('write done')
      }
      node.send(buildMessage(msg.payload, resp, msg))
    }

    node.onModbusWriteError = function (err, msg) {
      setModbusError(err, msg)
    }

    node.on('close', function () {
      setNodeStatusTo('closed')
    })

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        internalDebugLog(logMessage)
      }
    }

    function buildMessage (values, response, msg) {
      return [{payload: values, responseBuffer: response, input: msg}, {payload: response, values: values, input: msg}]
    }

    function setNodeStatusTo (statusValue) {
      let statusOptions = mbBasics.set_node_status_properties(statusValue, false)
      if (mbBasics.statusLog) {
        verboseLog('status options: ' + JSON.stringify(statusOptions))
      }
      node.status({
        fill: statusOptions.fill,
        shape: statusOptions.shape,
        text: statusOptions.status
      })
    }

    function setModbusError (err, msg) {
      let working = false

      if (err) {
        switch (err.message) {
          case 'Timed out':
            setNodeStatusTo('timeout')
            working = true
            break
          case 'FSM Not Ready To Write':
            setNodeStatusTo('not ready to write')
            working = true
            break
          case 'Port Not Open':
            setNodeStatusTo('reconnect')
            modbusClient.emit('reconnect')
            working = true
            break
          default:
            setNodeStatusTo('error: ' + JSON.stringify(err))
            if (node.showErrors) {
              node.error(err, msg)
            }
        }
      }
      return working
    }
  }

  RED.nodes.registerType('modbus-write', ModbusWrite)
}
