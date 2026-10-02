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
const nodeUnderTest = require('../../src/modbus-write.js')
const functionNode = require('@node-red/nodes/core/function/10-function')

const sinon = require('sinon')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const expect = require('chai').expect

const testSimpleWriteParametersNodes = [injectNode, clientNode, serverNode, nodeUnderTest, functionNode]

const testFlows = require('./flows/modbus-write-flows')
const mbBasics = require('../../src/modbus-basics')
const { waitForModbusClientActive, withEphemeralPorts } = require('../helper/test-helper-extensions')

function loadFlowWithPort (nodes, flowTemplate, done, onLoaded) {
  withEphemeralPorts(flowTemplate).then((flow) => {
    helper.load(nodes, flow, function () {
      onLoaded(flow, done)
    })
  }).catch(done)
}

describe('Write node Testing', function () {
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
  describe('Unique Port', function () {

  })

  describe('Node', function () {
    it('should update status, send message, and emit event on successful write', function (done) {
      loadFlowWithPort(testSimpleWriteParametersNodes, testFlows.testWriteExampleFlow, done, function (_flow, done) {
        const modbusWriteNode = helper.getNode('e71050e54fc87ddf')
        const emitSpy = sinon.spy(modbusWriteNode, 'emit')

        const resp = { value: 'response' }
        const msg = { payload: 'request' }

        modbusWriteNode.onModbusWriteDone(resp, msg)

        sinon.assert.calledOnce(emitSpy)
        sinon.assert.calledWithExactly(emitSpy, 'modbusWriteNodeDone')

        done()
      })
    })

    it('should use the original message on write failure', function (done) {
      loadFlowWithPort(testSimpleWriteParametersNodes, testFlows.testWriteExampleFlow, done, function (_flow, done) {
        const modbusWriteNode = helper.getNode('e71050e54fc87ddf')
        const err = new Error('Test Modbus write error')
        const origMsg = {
          messageId: 'request-id',
          _linkSource: [{ id: 'link-call-id', node: 'link-in-id' }],
          custom: 'original value',
          payload: 'original payload'
        }
        const requestMsg = { payload: { messageId: 'request-id' } }
        const sendEmptyMsgOnFailStub = sinon.stub(mbBasics, 'sendEmptyMsgOnFail')
        modbusWriteNode.bufferMessageList.set('request-id', origMsg)

        modbusWriteNode.onModbusWriteError(err, requestMsg)

        sinon.assert.calledWithExactly(sendEmptyMsgOnFailStub, modbusWriteNode, err, origMsg)
        sendEmptyMsgOnFailStub.restore()
        done()
      })
    })

    it('should handle comma-separated string values correctly', function (done) {
      loadFlowWithPort(testSimpleWriteParametersNodes, testFlows.testWriteExampleFlow, done, function (_flow, done) {
        const modbusWriteNode = helper.getNode('e71050e54fc87ddf')

        const msg = {
          payload: {
            value: '{ "name": "John", "age": 30, "city": "New York" }'
          }
        }
        const processedMsg = modbusWriteNode.setMsgPayloadFromHTTPRequests(msg)
        setTimeout(function () {
          expect(processedMsg).to.equal(msg)
          done()
        }, 0)
      })
    })

    it('should handle boolean string values correctly', function (done) {
      loadFlowWithPort(testSimpleWriteParametersNodes, testFlows.testWriteExampleFlow, done, function (_flow, done) {
        const modbusWriteNode = helper.getNode('e71050e54fc87ddf')

        const msg = { payload: { value: 'false' } }
        const processedMsg = modbusWriteNode.setMsgPayloadFromHTTPRequests(msg)
        setTimeout(function () {
          expect(processedMsg.payload.value).to.equal(false)
          done()
        }, 0)
      })
    })

    it('simple Node should be loaded without client config', function (done) {
      loadFlowWithPort(testSimpleWriteParametersNodes, testFlows.testWriteFlow, done, function (_flow, done) {
        const inject = helper.getNode('67dded7e.025904')
        inject.should.have.property('name', 'injectTrue')

        const modbusServer = helper.getNode('e54529b9.952ea8')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('1f258d73662d6493')
        modbusClient.should.have.property('name', 'modbusClient')

        const modbusWrite = helper.getNode('8ad2951c.2df708')
        modbusWrite.should.have.property('name', 'modbusWrite')

        done()
      })
    })

    it('simple flow with boolean injects and write should be loaded', function (done) {
      this.timeout(15000)
      loadFlowWithPort(testSimpleWriteParametersNodes, testFlows.testWriteCycleFlow, done, function (_flow, done) {
        const h1 = helper.getNode('h1')
        h1.once('input', function () {
          done()
        })
      })
    })

    it('simple flow with string false http inject and write should be loaded', function (done) {
      this.timeout(15000)
      loadFlowWithPort(testSimpleWriteParametersNodes, testFlows.testSimpleWriteFlow, done, function (_flow, done) {
        const modbusWrite = helper.getNode('258dc103f99d2f2e')
        const modbusClient = helper.getNode('80aeec4c.0cb9e8')
        const h1 = helper.getNode('f780a7d088ac2b22')
        h1.once('input', function () {
          done()
        })
        waitForModbusClientActive(modbusClient, (err) => {
          if (err) {
            done(err)
            return
          }
          modbusWrite.receive({ payload: { value: 'false', fc: 5, unitid: 1, address: 0, quantity: 1 } })
        })
      })
    })

    it('simple flow with string with array of values input from http should be parsed and written', function (done) {
      this.timeout(15000)
      loadFlowWithPort(testSimpleWriteParametersNodes, testFlows.testSimpleWriteFlow, done, function (_flow, done) {
        const modbusWrite = helper.getNode('258dc103f99d2f2e')
        const modbusClient = helper.getNode('80aeec4c.0cb9e8')
        const h1 = helper.getNode('f780a7d088ac2b22')
        h1.once('input', function () {
          done()
        })
        waitForModbusClientActive(modbusClient, (err) => {
          if (err) {
            done(err)
            return
          }
          modbusWrite.receive({ payload: '{ "value": [0,1,0,1], "fc": 5, "unitid": 1,"address": 0, "quantity": 4 }' })
        })
      })
    })

    it('should inject at least 4 messages but only use one to test initial delay', function (done) {
      this.timeout(20000)
      loadFlowWithPort(testSimpleWriteParametersNodes, testFlows.testSimpleWriteFlow, done, function (_flow, done) {
        const writeNode = helper.getNode('258dc103f99d2f2e')
        const helperNode = helper.getNode('f780a7d088ac2b22')
        let getterCounter = 0
        let helperCounter = 0
        let startingTimestamp = null
        let endTimestamp = null

        writeNode.on('input', () => {
          getterCounter++

          if (getterCounter === 1) {
            startingTimestamp = Date.now()
          }
          endTimestamp = Date.now()
        })

        helperNode.on('input', () => {
          helperCounter++

          if (helperCounter > 3) {
            const difBetweenTimestamps = endTimestamp - startingTimestamp
            getterCounter.should.be.greaterThanOrEqual(6)
            helperCounter.should.be.greaterThanOrEqual(1)
            helperCounter.should.be.greaterThanOrEqual(3)
            difBetweenTimestamps.should.be.greaterThanOrEqual(1500)

            done()
          }
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      loadFlowWithPort(testSimpleWriteParametersNodes, testFlows.testSimpleWriteFlow, done, function (_flow, done) {
        helper.request().post('/modbus-write/invalid').expect(404).end(done)
      })
    })
  })
})
