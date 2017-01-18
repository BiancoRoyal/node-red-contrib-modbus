/**
 Original Work Copyright 2015 Valmet Automation Inc.

 Licensed under the Apache License, Version 2.0 (the "License")
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 The BSD 3-Clause License

 Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus

 merged back from
 Modified work Copyright © 2016, UChicago Argonne, LLC
 All Rights Reserved
 node-red-contrib-modbustcp (ANL-SF-16-004)
 Jason D. Harper, Argonne National Laboratory

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
 * Modbus Write node.
 * @module NodeRedModbusWrite
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  let mbBasics = require('./modbus-basics')

  function ModbusWrite (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.showStatusActivities = config.showStatusActivities

    this.unitid = config.unitid
    this.dataType = config.dataType
    this.adr = Number(config.adr)
    this.quantity = config.quantity

    let node = this
    let modbusClient = RED.nodes.getNode(config.server)

    setNodeStatusTo('waiting')

    node.onModbusInit = function () {
      setNodeStatusTo('initialize')
    }

    node.onModbusConnect = function () {
      setNodeStatusTo('connected')
    }

    node.onModbusActive = function () {
      setNodeStatusTo('active')
    }

    node.onModbusError = function (failureMsg) {
      setNodeStatusTo('failure')
      node.warn(failureMsg)
    }

    node.onModbusClose = function () {
      setNodeStatusTo('closed')
    }

    modbusClient.on('mbinit', node.onModbusInit)
    modbusClient.on('mbconnected', node.onModbusConnect)
    modbusClient.on('mbactive', node.onModbusActive)
    modbusClient.on('mberror', node.onModbusError)
    modbusClient.on('mbclosed', node.onModbusClose)

    node.on('input', function (msg) {
      if (!(msg && msg.hasOwnProperty('payload'))) return

      if (msg.payload == null) {
        setNodeStatusTo('payload error')
        node.error('invalid msg.payload', msg)
        return
      }

      if (!modbusClient.client) {
        return
      }

      if (node.showStatusActivities) {
        setNodeStatusTo(modbusClient.statlyMachine.getMachineState())
      }

      msg.payload = {
        value: msg.payload,
        unitid: node.unitid,
        fc: node.functionCodeModbus(node.dataType),
        address: node.adr,
        quantity: node.quantity
      }
      modbusClient.emit('writeModbus', msg, node.onModbusWriteDone, node.onModbusWriteError)
    })

    node.functionCodeModbus = function (dataType) {
      switch (dataType) {
        case 'Coil':
          return 5
        case 'HoldingRegister':
          return 6
        case 'MCoils':
          return 15
        case 'MHoldingRegisters':
          return 16
        default:
          return dataType
      }
    }

    node.onModbusWriteDone = function (resp, msg) {
      if (node.showStatusActivities) {
        setNodeStatusTo('write done')
      }
      node.send(buildMessage(msg.payload, resp))
    }

    node.onModbusWriteError = function (err, msg) {
      setModbusError(err, msg)
    }

    node.on('close', function () {
      setNodeStatusTo('closed')
    })

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        node.log(logMessage)
      }
    }

    function buildMessage (values, response) {
      return [{payload: values}, {payload: response}]
    }

    function setNodeStatusTo (statusValue) {
      let statusOptions = mbBasics.set_node_status_properties(statusValue, false)
      if (mbBasics.statusLog) {
        verboseLog('status options: ' + JSON.stringify(statusOptions))
      }
      node.status({
        fill: statusOptions.fill,
        shape: statusOptions.shape,
        text: statusOptions.status
      })
    }

    function setModbusError (err, msg) {
      let working = false

      if (err) {
        node.error(err, msg)
        switch (err) {
          case 'Timed out':
            setNodeStatusTo('timeout')
            working = true
            break
          case 'Port Not Open':
            setNodeStatusTo('reconnect')
            modbusClient.emit('reconnect')
            working = true
            break
          default:
            setNodeStatusTo('error: ' + JSON.stringify(err))
        }
      }
      return working
    }
  }

  RED.nodes.registerType('modbus-write', ModbusWrite)
}
