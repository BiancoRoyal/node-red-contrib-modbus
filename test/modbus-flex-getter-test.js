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
var getterNode = require('../src/modbus-flex-getter.js')
var helper = require('../src/testing/nodered-helper.js')

describe('Flex Getter node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node', function () {
    it('simple Node should be loaded', function (done) {
      helper.load([clientNode, serverNode, getterNode], [{
        id: '322daf89.be8dd',
        type: 'modbus-flex-getter',
        name: 'modbusFlexGetter',
        server: 'ce5293f4.1e1ac',
        wires: [[], [], []]
      }, {
        id: '996023fe.ea04b',
        type: 'modbus-server',
        name: 'modbusServer',
        logEnabled: false,
        serverPort: 11502,
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        wires: []
      }, {
        id: 'ce5293f4.1e1ac',
        type: 'modbus-client',
        name: 'modbusClient',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 11502,
        unit_id: 1,
        clientTimeout: 5000,
        reconnectTimeout: 5000
      }], function () {
        var modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        var modbusClient = helper.getNode('ce5293f4.1e1ac')
        modbusClient.should.have.property('name', 'modbusClient')

        var modbusFlexGetter = helper.getNode('322daf89.be8dd')
        modbusFlexGetter.should.have.property('name', 'modbusFlexGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-getter/invalid').expect(404).end(done)
    })
  })
})
