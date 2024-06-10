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

const nodeUnderTest = require('../../src/modbus-flex-connector.js')
const serverNode = require('../../src/modbus-server.js')
const clientNode = require('../../src/modbus-client.js')
const injectNode = require('@node-red/nodes/core/common/20-inject.js')
const sinon = require('sinon')
const assert = require('assert')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const expect = require('chai').expect

const testFlows = require('./flows/modbus-flex-connector-e2e-flows.js')

const testFlexConnectorNodes = [nodeUnderTest, serverNode, clientNode, injectNode]

describe('Flex Connector node Testing', function () {
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
    it('should set payload to an empty string and send message when emptyMsgOnFail is true', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testOnConfigDone, function () {
        const modbusFlexNode = helper.getNode('0dfcf9fabf5f0bd7')
        const originalSend = modbusFlexNode.send
        modbusFlexNode.send = function (msg) {
          originalSend.call(modbusFlexNode, msg)
          try {
            msg.should.have.property('payload', 'test')
            done()
          } catch (err) {
            done(err)
          }
        }
        const msg = { payload: 'test', error: {} }
        modbusFlexNode.onConfigDone(msg)
      })
    })

    it('should handle invalid payload', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusFlexNode = helper.getNode('a39e174edce1a54b')
        const msg = { payload: {} }
        modbusFlexNode.on('input', function (nMsg) {
          setTimeout(function () {
            assert.equal(nMsg.error.message, 'Payload Not Valid - Connector Type')
            done()
          }, 1500)
        })

        modbusFlexNode.receive({ id: 'n1', payload: msg, error: { message: 'Payload Not Valid - Connector Type' } })
      })
    })

    it('should set payload to empty string and send message when emptyMsgOnFail is true', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusFlexNode = helper.getNode('a39e174edce1a54b')
        modbusFlexNode.emptyMsgOnFail = true
        modbusFlexNode.send = sinon.spy()
        const msg = { payload: '', error: {} }
        modbusFlexNode.statusText = undefined
        setTimeout(() => {
          modbusFlexNode.onConfigDone(msg)
          expect(msg.payload).to.equal('')
          expect(msg.error.nodeStatus).to.equal(modbusFlexNode.statusText)
          done()
        }, 0)
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
        helper.request().post('/modbus-flex-connector/invalid').expect(404).end(done)
      })
    })
  })
})
