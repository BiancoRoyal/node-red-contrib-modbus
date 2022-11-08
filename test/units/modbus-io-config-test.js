/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

const nodeUnderTest = require('../../src/modbus-io-config.js')
const readNode = require('../../src/modbus-read.js')
const catchNode = require('@node-red/nodes/core/common/25-catch')
const injectNode = require('@node-red/nodes/core/common/20-inject')
const functionNode = require('@node-red/nodes/core/function/10-function')
const clientNode = require('../../src/modbus-client')
const serverNode = require('../../src/modbus-server')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testIoConfigNodes = [catchNode, injectNode, functionNode, clientNode, serverNode, nodeUnderTest, readNode]

const testFlows = require('./flows/modbus-io-config-flows')


describe('IO Config node Testing', function () {
  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      done()
    }).catch(function () {
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('Node', function () {
    it('should be loaded', function (done) {
      helper.load(testIoConfigNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusIOConfigNode = helper.getNode('2f5a90d.bcaa1f')
        modbusIOConfigNode.should.have.property('name', 'ModbusIOConfig')
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-io-config/invalid').expect(404).end(done)
    })
  })
})
