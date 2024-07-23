/**
 Copyright (c) since the year 2017 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */

/**
 * Flex Connector Node.
 * @module NodeRedModbusFlexConnector
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
    this.emptyMsgOnFail = config.emptyMsgOnFail
    this.configMsgOnChange = config.configMsgOnChange

    const node = this

    mbBasics.setNodeStatusTo('waiting', node)

    if (!node.server) {
      mbBasics.setNodeStatusTo('disconnected', node)
      return
    }

    mbBasics.setNodeStatusTo('connecting', node)

    node.server.registerForModbus(node)
    mbBasics.initModbusClientEvents(node, this.server)

    node.onConfigDone = function (msg) {
      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(node.server.actualServiceState, node)
      } else {
        mbBasics.setNodeDefaultStatus(node)
      }

      if (node.configMsgOnChange) {
        msg.payload = msg.payload || {}
        msg.payload.status = 'changed'
      } else {
        msg.config_change = 'emitted'
      }

      node.send(msg)
    }

    node.onConfigError = function (err, msg) {
      internalDebugLog(err.message)

      if (node.showErrors) {
        if (node.showStatusActivities) {
          mbBasics.setNodeStatusTo('error', node)
        } else {
          mbBasics.setNodeDefaultStatus(node)
        }

        if (err && err.message) {
          msg.error = err
        } else {
          msg.error = new Error(err)
        }

        msg.error.nodeStatus = node.statusText

        node.error(msg.error, msg)

        if (node.emptyMsgOnFail) {
          msg.payload = ''
        }

        node.send(msg)
      }
    }

    node.on('input', function (msg) {
      if (mbBasics.invalidPayloadIn(msg)) {
        return
      }

      if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo(node.server.actualServiceState, node)
      }

      if (msg.payload.connectorType) {
        internalDebugLog(`dynamicReconnect: ${JSON.stringify(msg.payload)}`)

        msg.payload.emptyQueue = node.emptyQueue
        node.server.emit('dynamicReconnect', msg, node.onConfigDone, node.onConfigError)
      } else {
        const error = new Error('Payload Not Valid - Connector Type')
        node.error(error, msg)

        node.send(msg)
      }
    })

    if (node.showStatusActivities) {
      mbBasics.setNodeStatusTo('active', node)
    } else {
      mbBasics.setNodeDefaultStatus(node)
    }
  }

  RED.nodes.registerType('modbus-flex-connector', ModbusFlexConnector)
}
