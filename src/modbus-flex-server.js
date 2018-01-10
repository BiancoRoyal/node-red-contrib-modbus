/**
 Copyright (c) 2017, Klaus Landsdorf (http://bianco-royal.de/)
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
  let ModbusRTU = require('modbus-serial')
  let mbBasics = require('./modbus-basics')
  let internalDebugLog = require('debug')('contribModbus:flex:server')

  function ModbusFlexServer (config) {
    RED.nodes.createNode(this, config)
    const {VM, VMScript} = require('vm2')

    this.name = config.name
    this.logEnabled = config.logEnabled
    this.serverPort = parseInt(config.serverPort)
    this.responseDelay = parseInt(config.responseDelay)
    this.delayUnit = config.delayUnit
    this.unitId = config.unitId
    this.minAddress = config.minAddress
    this.splitAddress = config.splitAddress

    this.funcGetCoil = new VMScript(config.funcGetCoil).compile()
    this.funcGetInputRegister = new VMScript(config.funcGetInputRegister).compile()
    this.funcGetHoldingRegister = new VMScript(config.funcGetHoldingRegister).compile()

    this.funcSetCoil = new VMScript(config.funcSetCoil).compile()
    this.funcSetRegister = new VMScript(config.funcSetRegister).compile()

    let node = this
    node.bufferFactor = 8

    node.coilsBufferSize = parseInt(config.coilsBufferSize * node.bufferFactor)
    node.registersBufferSize = parseInt(config.registersBufferSize * node.bufferFactor)

    node.coils = Buffer.alloc(node.coilsBufferSize, 0)
    node.registers = Buffer.alloc(node.registersBufferSize, 0)

    node.server = null

    setNodeStatusTo('initialized')

    function verboseWarn (logMessage) {
      if (RED.settings.verbose) {
        node.warn((node.name) ? node.name + ': ' + logMessage : 'Modbus response: ' + logMessage)
      }
    }

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        internalDebugLog((typeof logMessage === 'string') ? logMessage : JSON.stringify(logMessage))
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

    //     1...10000*  address - 1      Coils (outputs)    0   Read/Write
    // 10001...20000*  address - 10001  Discrete Inputs    01  Read
    // 30001...40000*  address - 30001  Input Registers    04  Read
    // 40001...50000*  address - 40001  Holding Registers  03  Read/Write

    node.vector = {}

    const vm = new VM({
      sandbox: {node}
    })

    vm.run('node.vector.getCoil = ' + config.funcGetCoil)
    vm.run('node.vector.getInputRegister = ' + config.funcGetInputRegister)
    vm.run('node.vector.getHoldingRegister = ' + config.funcGetHoldingRegister)
    vm.run('node.vector.setCoil = ' + config.funcSetCoil)
    vm.run('node.vector.setRegister = ' + config.funcSetRegister)

    node.startServer = function () {
      verboseLog('starting modbus flex server')

      try {
        internalDebugLog('ModbusTCP flex server listening on modbus://0.0.0.0:' + node.serverPort)
        if (node.server === null) {
          node.server = new ModbusRTU.ServerTCP(node.vector, {
            host: '0.0.0.0',
            port: node.serverPort,
            debug: node.logEnabled,
            unitID: node.unitId
          })

          node.server.on('socketError', function (err) {
            verboseWarn(err)
            setNodeStatusTo('error')
            internalDebugLog(err.message)

            node.server.close(function () {
              verboseLog('closed modbus flex server by socket error and restart now')
              node.startServer()
            })
          })
        }
      } catch (err) {
        verboseWarn(err)
        setNodeStatusTo('error')
      }

      if (node.server != null) {
        verboseLog('modbus flex server started')
        setNodeStatusTo('active')
      } else {
        verboseWarn('modbus flex server isn\'t ready')
        setNodeStatusTo('error')
      }
    }

    node.startServer()

    node.on('input', function (msg) {
      verboseLog('Input:' + msg)

      node.send(buildMessage(msg, node.registers.slice((node.splitAddress + 1) * node.bufferFactor),
        node.coils, node.registers.slice(0, node.splitAddress * node.bufferFactor)))
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
      if (node.server._server) {
        node.server._server.close()
      }
      node.server = null
    })
  }

  RED.nodes.registerType('modbus-flex-server', ModbusFlexServer)
}
