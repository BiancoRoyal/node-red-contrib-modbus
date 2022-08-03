/**
 Copyright (c) 2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
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
  const internalDebugLog = require('debug')('contribModbus:flex:connector')

  function ModbusFlexConnector (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.maxReconnectsPerMinute = config.maxReconnectsPerMinute || 4
    this.emptyQueue = config.emptyQueue
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connection = null

    this.internalDebugLog = internalDebugLog
    this.verboseLogging = RED.settings.verbose

    const node = this
    mbBasics.setNodeStatusTo('waiting', node)

    const modbusClient = RED.nodes.getNode(config.server)
    if (!modbusClient) {
      return
    }
    modbusClient.registerForModbus(node)
    mbBasics.initModbusClientEvents(node, modbusClient)

    node.onConfigDone = function (msg) {
      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo('config done', node)
      }
      msg.config_change = 'emitted'
      node.send(msg)
    }

    node.onConfigError = function (err, msg) {
      internalDebugLog(err.message)
      if (node.showErrors) {
        node.error(err, msg)
      }

      if (err && err.message) {
        msg.error = err
      } else {
        msg.error = new Error(err)
      }
      msg.error.nodeStatus = node.statusText

      if (node.emptyMsgOnFail) {
        msg.payload = ''
      }

      node.send(msg)
    }

    node.on('input', function (msg) {
      if (mbBasics.invalidPayloadIn(msg)) {
        return
      }

      if (!modbusClient.client) {
        return
      }

      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(modbusClient.actualServiceState, node)
      }

      if (msg.payload.connectorType) {
        internalDebugLog('dynamicReconnect: ' + JSON.stringify(msg.payload))
        msg.payload.emptyQueue = node.emptyQueue
        modbusClient.emit('dynamicReconnect', msg, node.onConfigDone, node.onConfigError)
      } else {
        const error = new Error('Payload Not Valid - Connector Type')
        node.error(error, msg)

        node.send(msg)
      }
    })

    if (!node.showStatusActivities) {
      mbBasics.setNodeDefaultStatus(node)
    }
  }

  RED.nodes.registerType('modbus-flex-connector', ModbusFlexConnector)
}
