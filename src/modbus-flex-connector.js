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
    this.maxReconnectsPerMinute = config.maxReconnectsPerMinute || 4
    this.emptyQueue = config.emptyQueue
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connection = null

    let node = this
    let modbusClient = RED.nodes.getNode(config.server)

    mbBasics.initModbusClientEvents(node, modbusClient)
    mbBasics.setNodeStatusTo('waiting', node)

    node.on('input', function (msg) {
      if (mbBasics.invalidPayloadIn(msg)) {
        return
      }

      if (!modbusClient.client) {
        return
      }

      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(modbusClient.statlyMachine.getMachineState(), node)
      }

      if (msg.payload.connectorType) {
        internalDebugLog('dynamicReconnect: ' + JSON.stringify(msg.payload))
        msg.payload.emptyQueue = node.emptyQueue
        modbusClient.emit('dynamicReconnect', msg)
      } else {
        node.error(new Error('Payload Not Valid - Connector Type'), msg)
      }
    })
  }

  RED.nodes.registerType('modbus-flex-connector', ModbusFlexConnector)
}
