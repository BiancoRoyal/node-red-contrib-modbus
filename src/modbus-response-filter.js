/**
 Copyright (c) 2017, Klaus Landsdorf (http://bianco-royal.de/)
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
  let mbCore = require('./core/modbus-core')
  var modbusIOFileValuNames = []

  function ModbusResponseFilter (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.filter = config.filter
    this.registers = config.registers || 0

    this.filterResponseBuffer = config.filterResponseBuffer
    this.filterValues = config.filterValues
    this.filterInput = config.filterInput

    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

    this.ioFile = RED.nodes.getNode(config.ioFile)

    let node = this

    modbusIOFileValuNames = node.ioFile.configData

    node.ioFile.on('updatedConfig', function (configData) {
      modbusIOFileValuNames = configData
      mbCore.internalDebug('Filter Config Data Update')
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
      if (node.registers) {
        if (!msg.payload.length || msg.payload.length !== node.registers) {
          if (node.showErrors) {
            node.error(new Error('Register Length Does Not Match Setting ' + node.registers))
          }
          mbCore.internalDebug('Register Length Does Not Match Setting ' + node.registers)
        } else {
          node.send(node.filterFromPayload(msg))
        }
      } else {
        // without register safety
        node.send(node.filterFromPayload(msg))
      }
    })
  }

  RED.nodes.registerType('modbus-response-filter', ModbusResponseFilter)

  RED.httpAdmin.get('/modbus/iofile/valuenames', RED.auth.needsPermission('iofile.read'), function (req, res) {
    res.json(modbusIOFileValuNames)
  })
}
