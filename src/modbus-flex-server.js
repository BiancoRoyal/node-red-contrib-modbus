/**
 Copyright (c) 2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
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
  const ModbusRTU = require('@open-p4nr/modbus-serial')
  const coreServer = require('./core/modbus-server-core')
  const mbBasics = require('./modbus-basics')
  const internalDebugLog = require('debug')('contribModbus:flex:server')

  function ModbusFlexServer (config) {
    RED.nodes.createNode(this, config)
    const { VM, VMScript } = require('vm2')

    this.name = config.name
    this.logEnabled = config.logEnabled
    this.serverAddress = config.serverAddress || '0.0.0.0'
    this.serverPort = parseInt(config.serverPort)
    this.responseDelay = parseInt(config.responseDelay)
    this.delayUnit = config.delayUnit
    this.unitId = parseInt(config.unitId) || 1
    this.minAddress = parseInt(config.minAddress) || 0
    this.splitAddress = parseInt(config.splitAddress) || 10000
    this.showErrors = config.showErrors

    this.funcGetCoil = new VMScript(config.funcGetCoil).compile()
    this.funcGetDiscreteInput = new VMScript(config.funcGetDiscreteInput).compile()
    this.funcGetInputRegister = new VMScript(config.funcGetInputRegister).compile()
    this.funcGetHoldingRegister = new VMScript(config.funcGetHoldingRegister).compile()

    this.funcSetCoil = new VMScript(config.funcSetCoil).compile()
    this.funcSetRegister = new VMScript(config.funcSetRegister).compile()

    this.internalDebugLog = internalDebugLog
    this.verboseLogging = RED.settings.verbose

    const node = this
    node.bufferFactor = coreServer.bufferFactor

    node.coilsBufferSize = parseInt(config.coilsBufferSize * coreServer.bufferFactor)
    node.registersBufferSize = parseInt(config.registersBufferSize * coreServer.bufferFactor)

    node.coils = Buffer.alloc(node.coilsBufferSize, 0)
    node.registers = Buffer.alloc(node.registersBufferSize, 0)

    node.modbusServer = null

    mbBasics.setNodeStatusTo('initialized', node)

    //     1...10000*  address - 1      Coils (outputs)    0   Read/Write
    // 10001...20000*  address - 10001  Discrete Inputs    01  Read
    // 30001...40000*  address - 30001  Input Registers    04  Read
    // 40001...50000*  address - 40001  Holding Registers  03  Read/Write

    node.vector = {}

    const vm = new VM({
      sandbox: { node }
    })

    vm.run('node.vector.getCoil = ' + config.funcGetCoil)
    vm.run('node.vector.getDiscreteInput = ' + config.funcGetDiscreteInput)
    vm.run('node.vector.getInputRegister = ' + config.funcGetInputRegister)
    vm.run('node.vector.getHoldingRegister = ' + config.funcGetHoldingRegister)

    vm.run('node.vector.setCoil = ' + config.funcSetCoil)
    vm.run('node.vector.setRegister = ' + config.funcSetRegister)

    node.startServer = function () {
      try {
        if (node.modbusServer === null) {
          try {
            node.modbusServer = new ModbusRTU.ServerTCP(node.vector, {
              host: node.serverAddress,
              port: node.serverPort,
              debug: node.logEnabled,
              unitID: node.unitId
            })
          } catch (err) {
            node.error(err, { payload: 'server net error -> for port 502 on unix, you have to be a super user' })
          }

          node.modbusServer.on('socketError', function (err) {
            internalDebugLog(err.message)
            if (node.showErrors) {
              node.warn(err)
            }
            mbBasics.setNodeStatusTo('error', node)

            node.modbusServer.close(function () {
              node.startServer()
            })
          })

          node.modbusServer.on('error', function (err) {
            internalDebugLog('Modbus Flex Server error')
            if (node.showErrors) {
              node.error(err)
            }
            mbBasics.setNodeStatusTo('error', node)
          })

          node.modbusServer._server.on('connection', function (sock) {
            internalDebugLog('Modbus Flex Server client connection')
            if (sock) {
              internalDebugLog('Modbus Flex Server client to ' + JSON.stringify(sock.address()) + ' from ' + sock.remoteAddress + ' ' + sock.remotePort)
            }
            mbBasics.setNodeStatusTo('active', node)
          })

          node.modbusServer._server.on('error', function (err) {
            internalDebugLog('Modbus Flex Server client error')
            if (node.showErrors) {
              node.error(err)
            }
            mbBasics.setNodeStatusTo('error', node)
          })
        }

        if (!node.showStatusActivities) {
          mbBasics.setNodeDefaultStatus(node)
        }
      } catch (err) {
        internalDebugLog(err.message)
        if (node.showErrors) {
          node.warn(err)
        }
        mbBasics.setNodeStatusTo('error', node)
      }

      if (node.modbusServer != null) {
        internalDebugLog('Modbus Flex Server listening on modbus://' + node.serverAddress + ':' + node.serverPort)
        mbBasics.setNodeStatusTo('initialized', node)
      } else {
        internalDebugLog('Modbus Flex Server isn\'t ready')
        mbBasics.setNodeStatusTo('error', node)
      }
    }

    node.startServer()

    node.on('input', function (msg) {
      if (coreServer.isValidMemoryMessage(msg)) {
        coreServer.writeToFlexServerMemory(node, msg)
        if (msg.payload.disableMsgOutput !== 1) {
          node.send(buildMessage(msg))
        }
      } else {
        if (node.showErrors) {
          node.error('Is Not A Valid Memory Write Message To Server', msg)
        }
        if (coreServer.isValidMessage(msg) && !msg.payload.disableMsgOutput) {
          node.send(buildMessage(msg))
        }
      }
    })

    function buildMessage (msg) {
      return [
        { type: 'holding', message: msg, payload: node.registers.slice(node.splitAddress * coreServer.bufferFactor) },
        { type: 'coils', message: msg, payload: node.coils.slice(0, node.splitAddress * coreServer.bufferFactor) },
        { type: 'input', message: msg, payload: node.registers.slice(0, node.splitAddress * coreServer.bufferFactor) },
        { type: 'discrete', message: msg, payload: node.coils.slice(node.splitAddress * coreServer.bufferFactor) },
        { payload: 'request', type: 'message', message: msg }
      ]
    }

    node.on('close', function () {
      mbBasics.setNodeStatusTo('closed', node)
      if (node.modbusServer._server) {
        node.modbusServer._server.close()
      }
      if (node.modbusServer) {
        node.modbusServer.close()
      }
      node.modbusServer = null
    })
  }

  try {
    RED.nodes.registerType('modbus-flex-server', ModbusFlexServer)
  } catch (err) {
    internalDebugLog(err.message)
  }
}
