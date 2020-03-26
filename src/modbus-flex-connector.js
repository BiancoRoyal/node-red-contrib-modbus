/**
 Copyright (c) 2017,2018,2019,2020 Klaus Landsdorf (https://bianco-royal.com/)
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

    const node = this
    mbBasics.setNodeStatusTo('waiting', node)

    const modbusClient = RED.nodes.getNode(config.server)
    if (!modbusClient) {
      return
    }
    modbusClient.registerForModbus(node)
    mbBasics.initModbusClientEvents(node, modbusClient)

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
        modbusClient.emit('dynamicReconnect', msg)
        msg.payload.config_change = 'emitted'
        node.send(msg)
      } else {
        const errorMessage = 'Payload Not Valid - Connector Type'
        node.error(new Error(errorMessage), msg)
        msg.error = errorMessage
        node.send(msg)
      }
    })
  }

  RED.nodes.registerType('modbus-flex-connector', ModbusFlexConnector)
}
