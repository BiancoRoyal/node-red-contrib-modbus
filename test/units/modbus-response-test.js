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
const nodeUnderTest = require('../../src/modbus-response.js')

const testResponseNodes = [injectNode, nodeUnderTest]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-response-flows')

function triggerInjectAndAssert (flow, injectId, responseNodeId, expectedName, payload, done) {
  helper.load(testResponseNodes, flow, function () {
    const modbusResponseNode = helper.getNode(responseNodeId)
    const inject = helper.getNode(injectId)
    modbusResponseNode.on('input', function () {
      modbusResponseNode.should.have.property('name', expectedName)
      done()
    })
    inject.receive({ payload, topic: '' })
  })
}

describe('Response node Testing', function () {
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

  describe('Node', function () {
    it('should be loaded', function (done) {
      const flow = [
        {
          id: 'f1ff9252.b5ce18',
          type: 'modbus-response',
          name: 'modbusNode',
          registerShowMax: 20,
          wires: []
        }
      ]

      helper.load(nodeUnderTest, flow, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.should.have.property('name', 'modbusNode')
        done()
      })
    })

    it('should work with short data', function (done) {
      triggerInjectAndAssert(
        testFlows.testShortLengthInjectDataFlow,
        '8827b34f.682e8',
        'f1ff9252.b5ce18',
        'shortLengthInjectData',
        { data: { length: 2 } },
        done
      )
    })

    it('should work with long data', function (done) {
      triggerInjectAndAssert(
        testFlows.testLongLengthInjectDataFlow,
        '6f658b96c679e24b',
        'd2e1ea25b04bb763',
        'longLengthInjectData',
        { data: { length: 22 } },
        done
      )
    })

    it('should work with short address', function (done) {
      triggerInjectAndAssert(
        testFlows.testShortLengthInjectAddressFlow,
        'ca4b13300ce76a24',
        '975548ef841a5c36',
        'shortLengthInjectAddress',
        { length: 2, address: {} },
        done
      )
    })

    it('should work with long address', function (done) {
      triggerInjectAndAssert(
        testFlows.testLongLengthInjectAddressFlow,
        '74e5fa89a94c1baf',
        '945f19a0f84d2de2',
        'longLengthInjectAddress',
        { length: 22, address: {} },
        done
      )
    })

    it('should work with just payload', function (done) {
      triggerInjectAndAssert(
        testFlows.testInjectJustPayloadFlow,
        '0a6d1e3947f56aa8',
        '672b5322fc5e27c5',
        'injectJustPayload',
        {},
        done
      )
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testResponseNodes, testFlows.testInjectJustPayloadFlow, function () {
        helper.request().post('/modbus-response/invalid').expect(404).end(done)
      })
    })
  })
})
