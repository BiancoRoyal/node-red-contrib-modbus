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

var nodeUnderTest = require('../src/modbus-client.js')
var helper = require('../src/testing/nodered-helper.js')

describe('Client node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node', function () {
    it('should be loaded', function (done) {
      helper.load(nodeUnderTest, [{
        id: '61887595.bd460c',
        type: 'modbus-client',
        name: 'modbusClient'
      }], function () {
        var modbusReadNode = helper.getNode('61887595.bd460c')
        modbusReadNode.should.have.property('name', 'modbusClient')
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-cient/invalid').expect(404).end(done)
    })
  })
})
