/**
 Copyright (c) since the year 2017 Klaus Landsdorf (http://plus4nodered.com/)
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
    this.server = RED.nodes.getNode(config.server)

    const node = this
    mbBasics.setNodeStatusTo('waiting', node)

    if (!this.server) {
      return
    }
    this.server.registerForModbus(node)
    mbBasics.initModbusClientEvents(node, this.server)

    node.onConfigDone = function (msg) {
      const shouldShowStatus = node.showStatusActivities
      if (shouldShowStatus) {
        mbBasics.setNodeStatusTo('config done', node)
      }
      if (shouldShowStatus) {
        mbBasics.setNodeStatusTo(this.server.actualServiceState, node)
      }

      if (!shouldShowStatus) {
        mbBasics.setNodeDefaultStatus(node)
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

      if (!this.server) {
        return
      }

      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(this.server.actualServiceState, node)
      }

      if (msg.payload.connectorType) {
        internalDebugLog(`dynamicReconnect: ${JSON.stringify(msg.payload)}`)
        msg.payload.emptyQueue = node.emptyQueue
        this.server.emit('dynamicReconnect', msg, node.onConfigDone, node.onConfigError)
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
