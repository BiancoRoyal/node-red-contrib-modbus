/**
 The BSD 3-Clause License

 Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation and/or
 other materials provided with the distribution.

 3. Neither the name of the copyright holder nor the names of its contributors may be
 used to endorse or promote products derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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
        node.log(logMessage)
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
      node.server.close()
      node.server = null
    })
  }

  RED.nodes.registerType('modbus-server', ModbusServer)
}
