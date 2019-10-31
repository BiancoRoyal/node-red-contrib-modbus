/**
 Copyright (c) 2016,2017,2018,2019 Klaus Landsdorf (http://bianco-royal.de/)
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
  // SOURCE-MAP-REQUIRED
  const modbus = require('jsmodbus')
  const net = require('net')

  const mbBasics = require('./modbus-basics')
  const internalDebugLog = require('debug')('contribModbus:server')

  function ModbusServer (config) {
    RED.nodes.createNode(this, config)
    const bufferFactor = 8

    this.name = config.name
    this.logEnabled = config.logEnabled
    this.hostname = config.hostname || '0.0.0.0'
    this.serverPort = parseInt(config.serverPort)
    this.responseDelay = parseInt(config.responseDelay)
    this.delayUnit = config.delayUnit

    this.coilsBufferSize = parseInt(config.coilsBufferSize * bufferFactor)
    this.holdingBufferSize = parseInt(config.holdingBufferSize * bufferFactor)
    this.inputBufferSize = parseInt(config.inputBufferSize * bufferFactor)
    this.discreteBufferSize = parseInt(config.discreteBufferSize * bufferFactor)

    this.showErrors = config.showErrors

    const node = this

    node.netServer = null
    node.modbusServer = null

    mbBasics.setNodeStatusTo('initialized', node)

    let modbusLogLevel = 'warn'
    if (RED.settings.verbose) {
      modbusLogLevel = 'debug'
    }

    try {
      node.netServer = new net.Server()
      node.modbusServer = new modbus.server.TCP(node.netServer, {
        logLabel: 'ModbusServer',
        logLevel: modbusLogLevel,
        logEnabled: node.logEnabled,
        responseDelay: mbBasics.calc_rateByUnit(node.responseDelay, node.delayUnit),
        coils: Buffer.alloc(node.coilsBufferSize, 0),
        holding: Buffer.alloc(node.holdingBufferSize, 0),
        input: Buffer.alloc(node.inputBufferSize, 0),
        discrete: Buffer.alloc(node.discreteBufferSize, 0)
      })

      node.modbusServer.on('connection', function (client) {
        internalDebugLog('Modbus Server client connection')
        if (client && client.socket) {
          internalDebugLog('Modbus Server client to ' + JSON.stringify(client.socket.address()) + ' from ' + client.socket.remoteAddress + ' ' + client.socket.remotePort)
        }
        mbBasics.setNodeStatusTo('active', node)
      })

      node.netServer.listen(node.serverPort, node.hostname, () => {
        internalDebugLog('Modbus Server listening on modbus://' + node.hostname + ':' + node.serverPort)
        mbBasics.setNodeStatusTo('initialized', node)
      })
    } catch (err) {
      internalDebugLog(err.message)
      if (node.showErrors) {
        node.warn(err)
      }
      mbBasics.setNodeStatusTo('error', node)
    }

    node.on('input', function (msg) {
      node.send(buildMessage(msg))
    })

    function buildMessage (msg) {
      return [
        { type: 'holding', message: msg, payload: node.modbusServer.holding },
        { type: 'coils', message: msg, payload: node.modbusServer.coils },
        { type: 'input', message: msg, payload: node.modbusServer.input },
        { type: 'discrete', message: msg, payload: node.modbusServer.discrete }
      ]
    }

    node.on('close', function (done) {
      mbBasics.setNodeStatusTo('closed', node)
      if (node.netServer) {
        node.netServer.close(() => {
          internalDebugLog('Modbus Server closed')
          done()
        })
      }
      node.modbusServer = null
    })
  }

  try {
    RED.nodes.registerType('modbus-server', ModbusServer)
  } catch (err) {
    internalDebugLog(err.message)
  }
}
