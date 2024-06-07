/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
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
// const assert=require('assert')
const testFlexSequencerNodes = [injectNode, clientNode, serverNode, nodeUnderTest]

const testFlows = require('./flows/modbus-flex-sequencer-e2e-flows.js')
// const mBasics = require('../../src/modbus-basics')
// const _ = require('underscore')

// const chai = require('chai')
// const sinon = require('sinon')
// const expect = chai.expect

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
    it('should handle invalid payload in input message', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithInjectNodeFlow, function () {
        const flexSequencerNode = helper.getNode('42c7ed2cf52e284e')
        const modbusClient = helper.getNode('92e7bf63.2efd7')
        modbusClient.isInactive = () => false
        const msg = { payload: undefined }
        setTimeout(() => {
          flexSequencerNode.emit('input', msg)
          done()
        }, 1500)
      })
    })
  })
  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        helper.request().post('/modbus-flex-sequencer/invalid').expect(404).end(done)
      })
    })
  })
})
