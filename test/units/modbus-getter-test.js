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
const getterNode = require('../../src/modbus-getter.js')
const ioConfigNode = require('../../src/modbus-io-config')
const sinon = require('sinon')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const expect = require('chai').expect

const testGetterNodes = [injectNode, ioConfigNode, clientNode, serverNode, getterNode]

const testFlows = require('./flows/modbus-getter-flows')
const mbBasics = require('../../src/modbus-basics')
const { getPort } = require('../helper/test-helper-extensions')
// const mBasics = require('../../src/modbus-basics')

describe('Getter node Unit Testing', function () {
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
    let invalidPayloadInStub, isNotReadyForInputStub,
      isInactiveStub, setNodeStatusToSpy, buildNewMessageObjectStub,
      buildNewMessageStub, emitSpy, verboseWarnSpy

    afterEach(function () {
      if (invalidPayloadInStub) invalidPayloadInStub.restore()
      if (isNotReadyForInputStub) isNotReadyForInputStub.restore()
      if (isInactiveStub) isInactiveStub.restore()
      if (setNodeStatusToSpy) setNodeStatusToSpy.restore()
      if (buildNewMessageObjectStub) buildNewMessageObjectStub.restore()
      if (buildNewMessageStub) buildNewMessageStub.restore()
      if (emitSpy) emitSpy.restore()
      if (verboseWarnSpy) verboseWarnSpy.restore()
    })

    it('should handle error protocol message correctly', function () {
      const flow = Array.from(testFlows.testGetterNodeFlowExample)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusWriteNode = helper.getNode('09f8f0e2049ace2d')
          modbusWriteNode.showErrors = true
          const msg = {
            payload: {
              value: 'payloadValue'
            }
          }
          const err = new Error('test error')

          sinon.stub(mbBasics, 'logMsgError').returns()

          modbusWriteNode.errorProtocolMsg(err, msg)

          sinon.assert.calledOnce(mbBasics.logMsgError)
          sinon.assert.calledWith(mbBasics.logMsgError, modbusWriteNode, err, msg)

          sinon.restore()
        })
      })
    })

    it('should build new message object correctly', function (done) {
      const flow = Array.from(testFlows.testGetterNodeFlowExample)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusWriteNode = helper.getNode('09f8f0e2049ace2d')
          const msg = {
            topic: 'topic',
            payload: {
              value: 'payloadValue'
            }
          }

          const newMsg = modbusWriteNode.buildNewMessageObject(modbusWriteNode, msg)
          expect(newMsg.topic).to.equal('topic')
          expect(newMsg.payload.value).to.equal('payloadValue')
          expect(newMsg.payload.fc).to.equal(3)
          expect(newMsg.payload.address).to.equal('1')
          expect(newMsg.payload.quantity).to.equal('10')
          done()
        })
      })
    })

    it('should handle onModbusCommandDone correctly', function (done) {
      const flow = Array.from(testFlows.testGetterNodeFlowExample)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusWriteNode = helper.getNode('09f8f0e2049ace2d')
          modbusWriteNode.showStatusActivities = true
          const emitSpy = sinon.spy(modbusWriteNode, 'emit')
          const resp = { data: [1, 2, 3, 4] }
          const msg = { payload: 'test payload' }
          modbusWriteNode.onModbusCommandDone(resp, msg)
          sinon.assert.calledOnce(emitSpy)
          sinon.assert.calledWith(emitSpy, 'modbusGetterNodeDone')
          emitSpy.restore()

          done()
        })
      })
    })

    it('should initialize input delay timer when delayOnStart is true', function (done) {
      const flow = Array.from(testFlows.testInjectGetterWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('cea01c8.36f8f6')
          modbusGetter.delayOnStart = true

          const verboseWarnSpy = sinon.spy()
          const resetInputDelayTimerSpy = sinon.spy(modbusGetter, 'resetInputDelayTimer')

          const setTimeoutStub = sinon.stub(global, 'setTimeout').callsFake((callback, delay) => {
            callback()
          })

          modbusGetter.verboseWarn = verboseWarnSpy
          modbusGetter.initializeInputDelayTimer()
          sinon.assert.calledOnce(resetInputDelayTimerSpy)
          sinon.assert.calledOnce(setTimeoutStub)
          sinon.assert.calledWith(setTimeoutStub, sinon.match.func, modbusGetter.INPUT_TIMEOUT_MILLISECONDS * modbusGetter.startDelayTime)

          setTimeoutStub.restore()
          resetInputDelayTimerSpy.restore()

          done()
        })
      })
    })

    it('simple Node should be loaded without client config', function (done) {
      helper.load(testGetterNodes, testFlows.testGetterWithoutClientConfigFlow, function () {
        const modbusGetter = helper.getNode('3ffe153acc21d72b')
        modbusGetter.should.have.property('name', 'modbusGetter')

        done()
      })
    })

    it('simple Node should be loaded', function (done) {
      const flow = Array.from(testFlows.testGetterWithClientFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusServer = helper.getNode('996023fe.ea04b')
          modbusServer.should.have.property('name', 'modbusServer')

          const modbusClient = helper.getNode('9660d4a8f8cc2b44')
          modbusClient.should.have.property('name', 'modbusClient')

          const modbusGetter = helper.getNode('322daf89.be8dd')
          modbusGetter.should.have.property('name', 'modbusGetter')

          done()
        })
      })
    })

    it('should work as simple flow with wrong write inject and IO', function (done) {
      const flow = Array.from(testFlows.testGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('cea01c8.36f8f6')
          modbusGetter.receive({ payload: '{ "value": "true", "fc": 5, "unitid": 1,"address": 0, "quantity": 4 }' })
          done()
        })
      })
    })

    it('should work as simple flow with wrong address inject and IO', function (done) {
      const flow = Array.from(testFlows.testGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('cea01c8.36f8f6')
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": -1, "quantity": 4 }' })
          done()
        })
      })
    })

    it('should work as simple flow with wrong quantity inject and IO', function (done) {
      const flow = Array.from(testFlows.testGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('cea01c8.36f8f6')
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 0, "quantity": -1 }' })
          done()
        })
      })
    })

    it('should handle modbus command error correctly', async () => {
      const flow = Array.from(testFlows.testGetterFlowWithInjectIo)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusClientNode = helper.getNode('a2adb6ed727a01d6')
          const errorMessage = new Error('Test error')
          const msg = { payload: 'test' }

          getterNode.onModbusCommandError(errorMessage, msg)
          sinon.assert.calledWith(modbusClientNode.internalDebugLog, errorMessage)

          modbusClientNode.internalDebugLog = sinon.spy()
          modbusClientNode.errorProtocolMsg = sinon.spy()
          modbusClientNode.emit = sinon.spy()
          modbusClientNode.bufferMessageList = []

          modbusClientNode.modbusClient = {}

          sinon.stub(modbusClientNode, 'internalDebugLog')
          sinon.stub(modbusClientNode, 'errorProtocolMsg')
          sinon.stub(mbBasics, 'sendEmptyMsgOnFail')
          sinon.stub(mbBasics, 'setModbusError')
        })
      })
    })

    it('should handle modbus command error correctly', function (done) {
      const flow = Array.from(testFlows.testGetterFlowWithInjectIo)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('a2adb6ed727a01d6')
          const errorMessage = new Error('Test error')
          const msg = { payload: 'test' }
          const emitSpy = sinon.spy(modbusGetter, 'emit')
          modbusGetter.onModbusCommandError(errorMessage, msg)
          sinon.assert.calledWith(emitSpy, 'modbusGetterNodeError')
          emitSpy.restore()

          done()
        })
      })
    })

    it('should use the original message on command failure', function (done) {
      const flow = Array.from(testFlows.testGetterFlowWithInjectIo)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('a2adb6ed727a01d6')
          const err = new Error('Test Modbus command error')
          const origMsg = {
            messageId: 'request-id',
            _linkSource: [{ id: 'link-call-id', node: 'link-in-id' }],
            custom: 'original value',
            payload: 'original payload'
          }
          const requestMsg = { payload: { messageId: 'request-id' } }
          const sendEmptyMsgOnFailStub = sinon.stub(mbBasics, 'sendEmptyMsgOnFail')
          modbusGetter.bufferMessageList.set('request-id', origMsg)

          modbusGetter.onModbusCommandError(err, requestMsg)

          sinon.assert.calledWithExactly(sendEmptyMsgOnFailStub, modbusGetter, err, origMsg)
          sendEmptyMsgOnFailStub.restore()
          done()
        })
      }).catch(done)
    })
  })

  describe('post', function () {
    it('should handle input correctly and emit readModbus event', function (done) {
      const msg = { payload: 'valid' }
      const flow = Array.from(testFlows.testGetterNodeFlowExample)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testGetterNodes, flow, function () {
          const modbusGetterNode = helper.getNode('09f8f0e2049ace2d')
          const modbusClient = helper.getNode('80aeec4c.0cb9e8')
          modbusGetterNode.showStatusActivities = true
          const isNotReadyForInputStub = sinon.stub(modbusGetterNode, 'isNotReadyForInput').returns(false)
          const isInactiveStub = sinon.stub(modbusClient, 'isInactive').returns(false)
          const invalidPayloadInStub = sinon.stub(mbBasics, 'invalidPayloadIn').returns(false)

          const buildNewMessageObjectStub = sinon.stub(modbusGetterNode, 'buildNewMessageObject').returns({ messageId: '12345' })
          const buildNewMessageStub = sinon.stub(mbBasics, 'buildNewMessage').returns({ builtMessage: true })
          const emitStub = sinon.stub(modbusClient, 'emit')

          modbusGetterNode.emit('input', msg)

          sinon.assert.calledOnce(buildNewMessageObjectStub)
          sinon.assert.calledOnce(buildNewMessageStub)
          sinon.assert.calledOnce(emitStub)

          isNotReadyForInputStub.restore()
          isInactiveStub.restore()
          invalidPayloadInStub.restore()
          buildNewMessageObjectStub.restore()
          buildNewMessageStub.restore()
          emitStub.restore()
          done()
        })
      })
    })

    it('should fail for invalid node', function (done) {
      helper.load(testGetterNodes, [], function () {
        helper.request().post('/modbus-getter/invalid').expect(404).end(done)
      })
    })
  })
})
