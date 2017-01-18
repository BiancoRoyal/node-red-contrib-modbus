/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-modbus
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

'use strict'

var clientNode = require('../src/modbus-client.js')
var serverNode = require('../src/modbus-server.js')
var readNode = require('../src/modbus-read.js')
var helper = require('../src/testing/nodered-helper.js')

describe('Getter node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node', function () {
    it('simple Node should be loaded', function (done) {
      helper.load([clientNode, serverNode, readNode], [{
        id: 'e54529b9.952ea8',
        type: 'modbus-server',
        z: '5dcb7dec.f36a24',
        name: 'modbusServer',
        logEnabled: false,
        serverPort: 11502,
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        x: 260,
        y: 200,
        wires: []
      }, {
        id: 'b9cf4e9c.4d53a',
        type: 'modbus-read',
        z: '5dcb7dec.f36a24',
        name: 'modbusRead',
        dataType: 'HoldingRegister',
        adr: 0,
        quantity: 10,
        rate: 1,
        rateUnit: 's',
        server: 'dc764ad7.580238',
        x: 340,
        y: 260,
        wires: [[], []]
      }, {
        id: 'dc764ad7.580238',
        type: 'modbus-client',
        z: '5dcb7dec.f36a24',
        name: 'modbusClient',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 11502,
        unit_id: '1',
        clientTimeout: 5000,
        reconnectTimeout: 5000
      }], function () {
        var modbusServer = helper.getNode('e54529b9.952ea8')
        modbusServer.should.have.property('name', 'modbusServer')

        var modbusClient = helper.getNode('dc764ad7.580238')
        modbusClient.should.have.property('name', 'modbusClient')

        var modbusRead = helper.getNode('b9cf4e9c.4d53a')
        modbusRead.should.have.property('name', 'modbusRead')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-read/invalid').expect(404).end(done)
    })
  })
})
