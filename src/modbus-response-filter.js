/**
 Copyright (c) since the year 2017 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */

/**
 * Modbus Response Filter node.
 * @module NodeRedModbusResponseFilter
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbCore = require('./core/modbus-core')
  const mbBasics = require('./modbus-basics')
  let modbusIOFileValuNames = []

  function ModbusResponseFilter (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.filter = config.filter
    this.registers = parseInt(config.registers) || null

    this.filterResponseBuffer = config.filterResponseBuffer
    this.filterValues = config.filterValues
    this.filterInput = config.filterInput

    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.showWarnings = config.showWarnings

    this.ioFile = RED.nodes.getNode(config.ioFile)

    const node = this

    modbusIOFileValuNames = node.ioFile.configData

    mbBasics.setNodeStatusTo('active', node)

    node.ioFile.on('updatedConfig', function (configData) {
      modbusIOFileValuNames = configData
    })

    node.filterFromPayload = function (msg) {
      msg.payload = msg.payload.filter((item) => {
        return item.name === node.filter
      })

      if (node.filterResponseBuffer) {
        delete msg.responseBuffer
      }

      if (node.filterValues) {
        delete msg.values
      }

      if (node.filterInput) {
        delete msg.input
      }

      return msg
    }

    node.on('input', function (msg) {
      if (mbBasics.invalidPayloadIn(msg)) {
        return
      }

      if (node.registers && node.registers > 0) {
        if (!msg.payload.length || msg.payload.length !== node.registers) {
          if (node.showErrors) {
            node.error(new Error(msg.payload.length + ' does not match ' + node.registers))
          }
          if (node.showWarnings) {
            mbCore.internalDebug(msg.payload.length + ' Registers And Filter Length Of ' + node.registers + ' Does Not Match')
          }
        } else {
          node.send(node.filterFromPayload(msg))
        }
      } else {
        // without register safety
        node.send(node.filterFromPayload(msg))
      }
    })

    node.on('close', function () {
      mbBasics.setNodeStatusTo('closed', node)
    })
  }

  RED.nodes.registerType('modbus-response-filter', ModbusResponseFilter)

  RED.httpAdmin.get('/modbus/iofile/valuenames', RED.auth.needsPermission('iofile.read'), function (req, res) {
    res.json(modbusIOFileValuNames)
  })
}
