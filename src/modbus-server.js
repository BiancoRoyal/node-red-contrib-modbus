/**
 Copyright (c) 2016,2017, Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/
/**
 * Modbus Server node.
 * @module NodeRedModbusServer
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  let stampit = require('stampit')
  let modbus = require('node-modbus')
  let mbBasics = require('./modbus-basics')
  let internalDebugLog = require('debug')('node_red_contrib_modbus')

  function ModbusServer (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.logEnabled = config.logEnabled
    this.serverPort = parseInt(config.serverPort)
    this.responseDelay = parseInt(config.responseDelay)
    this.delayUnit = config.delayUnit

    this.coilsBufferSize = parseInt(config.coilsBufferSize)
    this.holdingBufferSize = parseInt(config.holdingBufferSize)
    this.inputBufferSize = parseInt(config.inputBufferSize)

    let node = this

    node.server = null

    setNodeStatusTo('initialized')

    function verboseWarn (logMessage) {
      if (RED.settings.verbose) {
        node.warn((node.name) ? node.name + ': ' + logMessage : 'Modbus response: ' + logMessage)
      }
    }

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        internalDebugLog(logMessage)
      }
    }

    function setNodeStatusTo (statusValue) {
      if (mbBasics.statusLog) {
        verboseLog('server status: ' + statusValue)
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

      node.status({fill: fillValue, shape: shapeValue, text: statusValue})
    }

    let modbusLogLevel = 'warn'
    if (RED.settings.verbose) {
      modbusLogLevel = 'debug'
    }

    let ModbusServer = stampit().refs({
      'logLabel': 'ModbusServer',
      'logLevel': modbusLogLevel,
      'logEnabled': node.logEnabled,
      'port': node.serverPort,
      'responseDelay': mbBasics.calc_rateByUnit(node.responseDelay, node.delayUnit),
      'coils': Buffer.alloc(node.coilsBufferSize, 0),
      'holding': Buffer.alloc(node.holdingBufferSize, 0),
      'input': Buffer.alloc(node.inputBufferSize, 0)
    })
      .compose(modbus.server.tcp.complete)
      .init(function () {
        let init = function () {
          this.coils.fill(0)
          this.holding.fill(0)
          this.input.fill(0)
        }.bind(this)
        init()
      })

    verboseLog('starting modbus server')

    try {
      node.server = ModbusServer()
    } catch (err) {
      verboseWarn(err)
      setNodeStatusTo('error')
    }

    if (node.server != null) {
      verboseLog('modbus server started')
      setNodeStatusTo('active')
    } else {
      verboseWarn("modbus server isn't ready")
      setNodeStatusTo('error')
    }

    node.on('input', function (msg) {
      verboseLog('Input:' + msg)

      node.send(buildMessage(msg, node.server.getHolding(), node.server.getCoils(), node.server.getInput()))
    })

    function buildMessage (msg, modbusHolding, modbusCoils, modbusInput) {
      return [
        {type: 'holding', message: msg, payload: modbusHolding},
        {type: 'coils', message: msg, payload: modbusCoils},
        {type: 'input', message: msg, payload: modbusInput}
      ]
    }

    node.on('close', function () {
      setNodeStatusTo('closed')
      if (node.server.close) {
        node.server.close()
      }
      node.server = null
    })
  }

  RED.nodes.registerType('modbus-server', ModbusServer)
}
