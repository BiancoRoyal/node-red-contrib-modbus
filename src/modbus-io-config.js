/**
 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus
 node-red-contrib-modbusio

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
module.exports = function (RED) {
  'use strict'
  // const fs = require('fs-extra')

  function ModbusIOConfigNode (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.path = config.path
    this.format = config.format

    // let node = this
  }

  RED.nodes.registerType('modbus-io-config', ModbusIOConfigNode)
}
