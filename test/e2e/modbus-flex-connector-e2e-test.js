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
const mbBasics = require('../../src/modbus-basics.js')
const testFlows = require('./flows/modbus-flex-connector-e2e-flows.js')
const { getPort } = require('../helper/test-helper-extensions')

const testFlexConnectorNodes = [nodeUnderTest, serverNode, clientNode, injectNode]

describe('Flex Connector E2E node Testing', function () {
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
    it('should return early if server node is not found', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testFlowWithNoServer, function () {
        const modbusFlexNode = helper.getNode('e9315827bb3e24d4')
        assert.strictEqual(modbusFlexNode.server, null)
        done()
      })
    })

    it('should log an error and send the message when payload.connectorType is invalid', function (done) {
      const flow = Array.from(testFlows.testOnConfigDone)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexConnectorNodes, flow, function () {
          const modbusFlexNode = helper.getNode('0dfcf9fabf5f0bd7')
          const msg = { payload: 'invalid', error: {}, _msgid: 'd8e2af2a7b0a9f37' }
          modbusFlexNode.emit('input', msg)

          expect(modbusFlexNode.error.calledWith(sinon.match.instanceOf(Error), 'Payload Not Valid - Connector Type'))
          done()
        })
      })
    })

    it('should set payload to an empty string and send message when emptyMsgOnFail is true', function (done) {
      const flow = Array.from(testFlows.testOnConfigDone)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexConnectorNodes, flow, function () {
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
    })

    it('should handle invalid payload', function (done) {
      const flow = Array.from(testFlows.testShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexConnectorNodes, flow, function () {
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
    })

    it('should set node status if showStatusActivities is true', function (done) {
      const flow = Array.from(testFlows.testFlowWithShowActivities)

      getPort().then((port) => {
        flow[3].serverPort = port
        flow[5].tcpPort = port

        helper.load(testFlexConnectorNodes, flow, function () {
          const modbusFlexNode = helper.getNode('e2fd753c95dec330')
          modbusFlexNode.emit('input', { payload: 'test' })
          done()
        })
      })
    })

    it('should return early if the payload is invalid', function (done) {
      const flow = Array.from(testFlows.testFlowWithShowActivities)

      getPort().then((port) => {
        flow[3].serverPort = port
        flow[5].tcpPort = port

        helper.load(testFlexConnectorNodes, flow, function () {
          const modbusFlexNode = helper.getNode('e2fd753c95dec330')
          const invalidPayloadStub = sinon.stub(mbBasics, 'invalidPayloadIn').returns(true)
          modbusFlexNode.emit('input', { payload: undefined })
          sinon.assert.calledOnce(invalidPayloadStub)

          invalidPayloadStub.restore()
          done()
        })
      })
    })

    it('should set payload to empty string and send message when emptyMsgOnFail is true', function (done) {
      const flow = Array.from(testFlows.testShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexConnectorNodes, flow, function () {
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
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      const flow = Array.from(testFlows.testShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexConnectorNodes, flow, function () {
          helper.request().post('/modbus-flex-connector/invalid').expect(404).end(done)
        })
      })
    })
  })
})
