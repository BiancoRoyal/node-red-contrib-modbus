/**
 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
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
  let util = require('util')
  let mbBasics = require('./modbus-basics')
  let internalDebugLog = require('debug')('contribModbus:response')

  function ModbusResponse (config) {
    RED.nodes.createNode(this, config)

    this.registerShowMax = config.registerShowMax

    let node = this

    setNodeStatusTo('initialized')

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        internalDebugLog((typeof logMessage === 'string') ? logMessage : JSON.stringify(logMessage))
      }
    }

    function setNodeStatusTo (statusValue, response) {
      if (mbBasics.statusLog) {
        verboseLog('response status: ' + statusValue)
      }

      let fillValue = 'red'
      let shapeValue = 'dot'

      switch (statusValue) {
        case 'initialized':
          fillValue = 'green'
          shapeValue = 'ring'
          break

        case 'active':
          fillValue = 'green'
          shapeValue = 'dot'
          break

        default:
          if (!statusValue || statusValue === 'waiting') {
            fillValue = 'blue'
            statusValue = 'waiting ...'
          }
          break
      }

      node.status({fill: fillValue, shape: shapeValue, text: util.inspect(response, false, null)})
    }

    function setNodeStatusResponse (length) {
      node.status({
        fill: 'green',
        shape: 'dot',
        text: 'active got length: ' + length
      })
    }

    node.on('input', function (msg) {
      let inputType = 'default'

      if (msg.payload.hasOwnProperty('data')) {
        inputType = 'data'
      }

      if (msg.payload.hasOwnProperty('address')) {
        inputType = 'address'
      }

      switch (inputType) {
        case 'data':
          if (msg.payload.data.length > node.registerShowMax) {
            setNodeStatusResponse(msg.payload.data.length)
          } else {
            setNodeStatusTo('active', msg.payload)
          }
          break
        case 'address':
          if (msg.payload.length && msg.payload.length > node.registerShowMax) {
            setNodeStatusResponse(msg.payload.length)
          } else {
            setNodeStatusTo('active', msg.payload)
          }
          break
        default:
          setNodeStatusTo('active', JSON.stringify(msg.payload))
      }
    })

    node.on('close', function () {
      setNodeStatusTo('closed')
    })
  }

  RED.nodes.registerType('modbus-response', ModbusResponse)
}
