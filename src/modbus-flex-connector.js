/**
 Copyright (c) 2017,2018 Klaus Landsdorf (http://bianco-royal.de/)
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
  let internalDebugLog = require('debug')('contribModbus:flex:connector')

  function ModbusFlexConnector (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.maxReconnectsPerMinute = config.maxReconnectsPerMinute | 4
    this.emptyQueue = config.emptyQueue
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connection = null

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

      if (msg && msg.payload) {
        if (node.showStatusActivities) {
          setNodeStatusTo(modbusClient.statlyMachine.getMachineState())
          verboseLog(msg)
        }

        if (msg.payload.connectorType) {
          internalDebugLog('dynamicReconnect: ' + JSON.stringify(msg.payload))
          msg.payload.emptyQueue = node.emptyQueue
          modbusClient.emit('dynamicReconnect', msg)
        } else {
          node.error(new Error('Payload Not Valid - Connector Type'), msg)
        }
      } else {
        node.error(new Error('Payload Not Valid'), msg)
      }
    })

    node.onModbusReconnectDone = function (resp, msg) {
      if (node.showStatusActivities) {
        setNodeStatusTo('reading done')
      }
    }

    node.onModbusReconnectError = function (err, msg) {
      internalDebugLog(err.message)
      mbBasics.setModbusError(node, modbusClient, err, msg, setNodeStatusTo)
    }

    node.on('close', function () {
      setNodeStatusTo('closed')
    })

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        internalDebugLog((typeof logMessage === 'string') ? logMessage : JSON.stringify(logMessage))
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

  RED.nodes.registerType('modbus-flex-connector', ModbusFlexConnector)
}
