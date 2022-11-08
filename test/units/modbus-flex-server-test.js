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

const injectNode = require('@node-red/nodes/core/common/20-inject.js')
const serverNode = require('../../src/modbus-flex-server.js')
const clientNode = require('../../src/modbus-client')
const nodeUnderTest = require('../../src/modbus-flex-sequencer')

const testFlexServerNodes = [injectNode, clientNode, serverNode, nodeUnderTest]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-flex-server-flows')

describe('Flex Server node Testing', function () {
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
    it('simple Node should be loaded', function (done) {
      helper.load(testFlexServerNodes, testFlows.testNodeShouldBeLoadedFlow, function () {
        var modbusServer = helper.getNode('ebd4bd0a.2f4af8')
        modbusServer.should.have.property('name', 'ModbusFlexServer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('should send data on input', function (done) {
      helper.load(testFlexServerNodes, testFlows.testShouldSendDataFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          done()
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should send discrete data on input', function (done) {
      helper.load(testFlexServerNodes, testFlows.testShouldSendDiscreteDataFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          done()
        })
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-server/invalid').expect(404).end(done)
    })
  })
})
