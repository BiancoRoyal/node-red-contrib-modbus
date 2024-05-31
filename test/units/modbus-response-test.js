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

  after(function (done) {
    helper.stopServer(function () {
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
      helper.load(testResponseNodes, testFlows.testShortLengthInjectDataFlow, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.on('input', function () {
          modbusResponseNode.should.have.property('name', 'shortLengthInjectData')
          done()
        })
      })
    })

    it('should work with long data', function (done) {
      helper.load(testResponseNodes, testFlows.testLongLengthInjectDataFlow, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.on('input', function () {
          modbusResponseNode.should.have.property('name', 'longLengthInjectData')
          done()
        })
      })
    })

    it('should work with short address', function (done) {
      helper.load(testResponseNodes, testFlows.testShortLengthInjectAddressFlow, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.on('input', function () {
          modbusResponseNode.should.have.property('name', 'shortLengthInjectAddress')
          done()
        })
      })
    })

    it('should work with long address', function (done) {
      helper.load(testResponseNodes, testFlows.testLongLengthInjectAddressFlow, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.on('input', function () {
          modbusResponseNode.should.have.property('name', 'longLengthInjectAddress')
          done()
        })
      })
    })

    it('should work with just payload', function (done) {
      helper.load(testResponseNodes, testFlows.testInjectJustPayloadFlow, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.on('input', function () {
          modbusResponseNode.should.have.property('name', 'injectJustPayload')
          done()
        })
      })
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
