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
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
const nodeUnderTest = require('../../src/modbus-flex-sequencer.js')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlexSequencerNodes = [injectNode, clientNode, serverNode, nodeUnderTest]

const testFlows = require('./flows/modbus-flex-sequencer-flows')

describe('Flex Sequencer node Testing', function () {
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
    it('simple Node should be loaded without client config', function (done) {
      helper.load(testFlexSequencerNodes,testFlows.testNodeWithoutClientFlow , function () {
        const modbusFlexSequencer = helper.getNode('bc5a61b6.a3972')
        modbusFlexSequencer.should.have.property('name', 'modbusFlexSequencer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node with server should be loaded', function (done) {
      helper.load(testFlexSequencerNodes,testFlows.testNodeWithServerFlow , function () {
        const modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('92e7bf63.2efd7')
        modbusClient.should.have.property('name', 'ModbusServer')

        const modbusFlexSequencer = helper.getNode('bc5a61b6.a3972')
        modbusFlexSequencer.should.have.property('name', 'modbusFlexSequencer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-sequencer/invalid').expect(404).end(done)
    })
  })
})
