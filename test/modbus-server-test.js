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

var serverNode = require('../src/modbus-server.js')
var helper = require('../src/testing/nodered-helper.js')

describe('Server node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node', function () {
    it('simple Node should be loaded', function (done) {
      helper.load(serverNode, [{
        id: '8cd6ca70.0dd188',
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
        x: 500,
        y: 300,
        wires: []
      }], function () {
        var modbusServer = helper.getNode('8cd6ca70.0dd188')
        modbusServer.should.have.property('name', 'modbusServer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-server/invalid').expect(404).end(done)
    })
  })
})
