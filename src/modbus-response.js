/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 Copyright 2016 - Jason D. Harper, Argonne National Laboratory
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc.
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

/**
 * Modbus Response node.
 * @module NodeRedModbusResponse
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')

  function ModbusResponse (config) {
    RED.nodes.createNode(this, config)

    this.registerShowMax = config.registerShowMax

    const node = this

    mbBasics.setNodeStatusTo('initialized', node)

    node.on('input', function (msg) {
      let inputType = 'default'

      if (Object.prototype.hasOwnProperty.call(msg.payload, 'data')) {
        inputType = 'data'
      }

      if (Object.prototype.hasOwnProperty.call(msg.payload, 'address')) {
        inputType = 'address'
      }

      switch (inputType) {
        case 'data':
          if (msg.payload.data.length > node.registerShowMax) {
            mbBasics.setNodeStatusResponse(msg.payload.data.length, node)
          } else {
            mbBasics.setNodeStatusByResponseTo('active', msg.payload, node)
          }
          break
        case 'address':
          if (msg.payload.length && msg.payload.length > node.registerShowMax) {
            mbBasics.setNodeStatusResponse(msg.payload.length, node)
          } else {
            mbBasics.setNodeStatusByResponseTo('active', msg.payload, node)
          }
          break
        default:
          mbBasics.setNodeStatusByResponseTo('active', JSON.stringify(msg.payload), node)
      }
    })

    node.on('close', function () {
      mbBasics.setNodeStatusTo('closed', node)
    })
  }

  RED.nodes.registerType('modbus-response', ModbusResponse)
}
