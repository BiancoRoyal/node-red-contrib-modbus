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
const nodeUnderTest = require('../../src/modbus-flex-getter.js')
const functionNode = require('@node-red/nodes/core/function/10-function')
const mbIOCore = require('../../src/core/modbus-io-core.js')
const testFlexGetterNodes = [injectNode, clientNode, serverNode, nodeUnderTest, functionNode]
const sinon = require('sinon')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-flex-getter-flows')
const mBasics = require('../../src/modbus-basics')
const _ = require('underscore')

const { getPort } = require('../helper/test-helper-extensions')

describe('Flex Getter node Testing', function () {
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
      const flow = Array.from(testFlows.testNodeWithoutClientFlow)
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
        modbusFlexGetter.should.have.property('name', 'modbusFlexGetter')

        done()
      })
    })

    it('simple Node should be loaded', function (done) {
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusServer = helper.getNode('996023fe.ea04b')
          modbusServer.should.have.property('name', 'modbusServer')

          const modbusClient = helper.getNode('92e7bf63.2efd7')
          modbusClient.should.have.property('name', 'ModbusServer')

          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
          modbusFlexGetter.should.have.property('name', 'modbusFlexGetter')

          done()
        })
      })
    })

    it('simple flow with inject should be loaded', function (done) {
      const flow = Array.from(testFlows.testFlexGetterWithInjectFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[6].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('6d373a8628c3fc70')
          const h1 = helper.getNode('ba2b29b9cb35764c')
          let counter = 0
          h1.on('input', function () {
            counter++
            if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
              done()
            }
          })
        })
      })
    })

    it('simple flow with inject should be loaded and read be done and some msgs are queued', function (done) {
      const flow = Array.from(testFlows.testFlexGetterWithInjectFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[6].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('6d373a8628c3fc70')
          let counter = 0
          modbusGetter.on('modbusFlexGetterNodeDone', function () {
            counter++
            if (modbusGetter.bufferMessageList.size >= 0 && counter === 1) {
              done()
            }
          })
        })
      })
    })

    it('simple flow should be loaded and with receive got input', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('bc5a61b6.a3972')
          const h1 = helper.getNode('d7d5a41f495c591e')
          let counter = 0
          h1.on('input', function () {
            counter++
            if (modbusGetter.bufferMessageList.size >= 0 && counter === 1) {
              done()
            }
          })
          setTimeout(function () {
            modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 0, "quantity": 4 }' })
          }, 800)
        })
      })
    })

    it('simple flow with wrong write inject should not crash', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('bc5a61b6.a3972')
          setTimeout(function () {
            modbusGetter.receive({ payload: '{ "value": "true", "fc": 5, "unitid": 1,"address": 0, "quantity": 1 }' })
            done()
          }, 800)
        })
      })
    })

    it('simple flow with wrong address inject should not crash', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('bc5a61b6.a3972')
          setTimeout(function () {
            modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": -1, "quantity": 1 }' })
            done()
          }, 800)
        })
      })
    })

    it('simple flow with wrong quantity inject should not crash', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('bc5a61b6.a3972')
          setTimeout(function () {
            modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 1, "quantity": -1 }' })
            done()
          }, 800)
        })
      })
    })

    it('should be inactive if message not allowed', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusClientNode = helper.getNode('92e7bf63.2efd7')
          _.isUndefined(modbusClientNode).should.be.false()

          setTimeout(() => {
            modbusClientNode.receive({ payload: 'test' })
            const isInactive = modbusClientNode.isInactive()
            isInactive.should.be.false()
            done()
          }, 1500)
        })
      })
    })

    it('should be inactive if message empty', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusClientNode = helper.getNode('92e7bf63.2efd7')
          setTimeout(() => {
            modbusClientNode.messageAllowedStates = ['']
            const isInactive = modbusClientNode.isInactive()
            isInactive.should.be.true()
            done()
          }, 1500)
        })
      })
    })

    it('should be state queueing - ready to send', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetterNode = helper.getNode('bc5a61b6.a3972')
          setTimeout(() => {
            mBasics.setNodeStatusTo('queueing', modbusFlexGetterNode)
            modbusFlexGetterNode.statusText.should.be.equal('queueing')
            done()
          }, 1500)
        })
      })
    })

    it('should be not state stopped - not ready to send', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetterNode = helper.getNode('bc5a61b6.a3972')
          setTimeout(() => {
            mBasics.setNodeStatusTo('stopped', modbusFlexGetterNode)
            modbusFlexGetterNode.statusText.should.be.equal('stopped')
            done()
          }, 1500)
        })
      })
    })
    it('should handle null or undefined input message', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetterNode = helper.getNode('bc5a61b6.a3972')
          setTimeout(() => {
            let isReady = modbusGetterNode.isReadyForInput(null)
            isReady.should.be.true()
            isReady = modbusGetterNode.isReadyForInput(undefined)
            isReady.should.be.true()
            done()
          }, 1500)
        })
      })
    })

    it('should return true for valid Modbus message', function (done) {
      const modbusMsg = {
        payload: {
          fc: 1,
          address: 10,
          quantity: 5,
          unitId: NaN
        }
      }
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const n1 = helper.getNode('bc5a61b6.a3972')
          setTimeout(() => {
            n1.on('input', function (msg) {
              const isValid = msg.payload.fc.should.equal(modbusMsg.payload.fc)
              if (isValid) {
                done()
              }
            }, 1500)
          })
        })
      })
    })

    /**
     it('should not be ready for input - no client', function (done) {
     const flow = Array.from(testFlows.testFlexGetterShowWarningsWithoutClientFlow)
     helper.load(testFlexGetterNodes, flow, function () {
     const modbusGetterNode = helper.getNode('bc5a61b6.a3972')
     setTimeout(() => {
     let isReady = modbusGetterNode.isReadyForInput({ payload: '{"value": 0, "fc": 1, "unitid": 1, "address": 0, "quantity": 1}' })  //TODO: modbusGetterNode.isReadyForInput is not a function
     isReady.should.be.false
     done()
     } , 1500)
     })
     })
     */
  })

  describe('Modbus Node Test Cases', function () {
    it('should process a valid Modbus message', function (done) {
      const msg = { payload: 'valid' }
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
          const modbusClient = helper.getNode('92e7bf63.2efd7')
          modbusFlexGetter.showStatusActivities = true
          const isNotReadyForInputStub = sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          const isInactiveStub = sinon.stub(modbusClient, 'isInactive').returns(false)
          const invalidPayloadInStub = sinon.stub(mBasics, 'invalidPayloadIn').returns(false)
          const buildNewMessageObjectStub = sinon.stub(modbusFlexGetter, 'buildNewMessageObject')
          buildNewMessageObjectStub.throws(new Error('Error in buildNewMessageObject'))

          const errorProtocolMsgStub = sinon.stub(modbusFlexGetter, 'errorProtocolMsg')
          const sendEmptyMsgOnFailStub = sinon.stub(mBasics, 'sendEmptyMsgOnFail')

          modbusFlexGetter.emit('input', msg)
          sinon.assert.calledOnce(errorProtocolMsgStub)
          sinon.assert.calledOnce(sendEmptyMsgOnFailStub)

          isNotReadyForInputStub.restore()
          isInactiveStub.restore()
          invalidPayloadInStub.restore()
          buildNewMessageObjectStub.restore()
          errorProtocolMsgStub.restore()
          sendEmptyMsgOnFailStub.restore()
          done()
        })
      })
    })
    it('should process a valid Modbus message and call the required methods', function (done) {
      const msg = { payload: 'valid' }
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
          const modbusClient = helper.getNode('92e7bf63.2efd7')

          const isNotReadyForInputStub = sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          const isInactiveStub = sinon.stub(modbusClient, 'isInactive').returns(false)
          const invalidPayloadInStub = sinon.stub(mBasics, 'invalidPayloadIn').returns(false)

          const prepareMsgStub = sinon.stub(modbusFlexGetter, 'prepareMsg').returns({ baz: 'qux' })
          const isValidModbusMsgStub = sinon.stub(modbusFlexGetter, 'isValidModbusMsg').returns(true)
          const buildNewMessageObjectStub = sinon.stub(modbusFlexGetter, 'buildNewMessageObject').returns({ messageId: '12345' })
          const buildNewMessageStub = sinon.stub(mBasics, 'buildNewMessage').returns({ builtMessage: true })
          const emitStub = sinon.stub(modbusClient, 'emit')

          modbusFlexGetter.emit('input', msg)

          sinon.assert.calledOnce(prepareMsgStub)
          sinon.assert.calledOnce(isValidModbusMsgStub)
          sinon.assert.calledOnce(buildNewMessageObjectStub)
          sinon.assert.calledOnce(buildNewMessageStub)
          sinon.assert.calledOnce(emitStub)

          isNotReadyForInputStub.restore()
          isInactiveStub.restore()
          invalidPayloadInStub.restore()
          prepareMsgStub.restore()
          isValidModbusMsgStub.restore()
          buildNewMessageObjectStub.restore()
          buildNewMessageStub.restore()
          emitStub.restore()
          done()
        })
      })
    })
  })

  describe('Modbus Node Input Handler', function () {
    it('should handle onModbusReadDone correctly', function (done) {
      const msg = { payload: 'valid' }
      const resp = { data: 'response data' }
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')

          const setNodeStatusToStub = sinon.stub(mBasics, 'setNodeStatusTo')
          const buildMessageWithIOStub = sinon.stub(mbIOCore, 'buildMessageWithIO').returns({ payload: 'built message' })
          const sendStub = sinon.stub(modbusFlexGetter, 'send')
          const emitStub = sinon.stub(modbusFlexGetter, 'emit')

          modbusFlexGetter.showStatusActivities = true

          modbusFlexGetter.onModbusReadDone(resp, msg)

          sinon.assert.calledOnce(setNodeStatusToStub)
          sinon.assert.calledWith(setNodeStatusToStub, 'reading done', modbusFlexGetter)

          sinon.assert.calledOnce(buildMessageWithIOStub)
          sinon.assert.calledWith(buildMessageWithIOStub, modbusFlexGetter, resp.data, resp, msg)

          sinon.assert.calledOnce(sendStub)
          sinon.assert.calledWith(sendStub, { payload: 'built message' })

          sinon.assert.calledOnce(emitStub)
          sinon.assert.calledWith(emitStub, 'modbusFlexGetterNodeDone')

          setNodeStatusToStub.restore()
          buildMessageWithIOStub.restore()
          sendStub.restore()
          emitStub.restore()
          done()
        })
      })
    })
  })
  describe('Modbus Node Error Handling', function () {
    it('should handle onModbusReadError correctly', function (done) {
      const msg = { payload: 'valid' }
      const err = new Error('Test error')
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
          const modbusClient = helper.getNode('92e7bf63.2efd7')

          const internalDebugLogStub = sinon.stub(modbusFlexGetter, 'internalDebugLog')
          const errorProtocolMsgStub = sinon.stub(modbusFlexGetter, 'errorProtocolMsg')
          const sendEmptyMsgOnFailStub = sinon.stub(mBasics, 'sendEmptyMsgOnFail')
          const setModbusErrorStub = sinon.stub(mBasics, 'setModbusError')
          const emitStub = sinon.stub(modbusFlexGetter, 'emit')

          modbusFlexGetter.onModbusReadError(err, msg)

          sinon.assert.calledOnce(internalDebugLogStub)
          sinon.assert.calledWith(internalDebugLogStub, err.message)

          sinon.assert.calledOnce(errorProtocolMsgStub)
          sinon.assert.calledWith(errorProtocolMsgStub, err, sinon.match(msg))

          sinon.assert.calledOnce(sendEmptyMsgOnFailStub)
          sinon.assert.calledWith(sendEmptyMsgOnFailStub, modbusFlexGetter, err, sinon.match(msg))

          sinon.assert.calledOnce(setModbusErrorStub)
          sinon.assert.calledWith(setModbusErrorStub, modbusFlexGetter, modbusClient, err, sinon.match(msg))

          sinon.assert.calledOnce(emitStub)
          sinon.assert.calledWith(emitStub, 'modbusFlexGetterNodeError')

          internalDebugLogStub.restore()
          errorProtocolMsgStub.restore()
          sendEmptyMsgOnFailStub.restore()
          setModbusErrorStub.restore()
          emitStub.restore()
          done()
        })
      })
    })
  })
  describe('Modbus Node Input Delay Timer', function () {
    it('should initialize and trigger input delay timer', function (done) {
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
          const verboseWarnStub = sinon.stub()
          modbusFlexGetter.verboseWarn = verboseWarnStub

          modbusFlexGetter.delayOnStart = true
          modbusFlexGetter.INPUT_TIMEOUT_MILLISECONDS = 1000
          modbusFlexGetter.startDelayTime = 1

          const resetInputDelayTimerSpy = sinon.spy(modbusFlexGetter, 'resetInputDelayTimer')

          const setTimeoutStub = sinon.stub(global, 'setTimeout').callsFake((callback, delay) => {
            callback()
          })

          modbusFlexGetter.initializeInputDelayTimer()
          sinon.assert.calledOnce(resetInputDelayTimerSpy)
          sinon.assert.calledOnce(setTimeoutStub)
          sinon.assert.calledWith(setTimeoutStub, sinon.match.func, modbusFlexGetter.INPUT_TIMEOUT_MILLISECONDS * modbusFlexGetter.startDelayTime)

          setTimeoutStub.restore()
          resetInputDelayTimerSpy.restore()
          done()
        })
      })
    })
  })

  describe('ModbusFlexGetter', () => {
    it('should send requests sequentially and not get stuck in a queueing state', (done) => {
      const flow = Array.from(testFlows.testFlexGetterRequest)

      getPort().then((port) => {
        flow[5].serverPort = port
        flow[6].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          let count = 0
          const modbusFlexGetter = helper.getNode('22809a5a7e0bac07')

          const msg = [
            { payload: { fc: 4, unitid: 1, address: 0, quantity: 1 } }, // timeout
            { payload: { fc: 3, unitid: 1, address: 20, quantity: 2 } },
            { payload: { fc: 3, unitid: 1, address: 10, quantity: 2 } }
          ]

          setTimeout(() => {
            modbusFlexGetter.on('modbusFlexGetterNodeDone', () => {
              count++
              if (count === msg.length) {
                done()
              }
            })

            msg.forEach((m) => {
              modbusFlexGetter.receive(m)
            })
          }, 1000)
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testFlexGetterNodes, [], function () {
        helper.request().post('/modbus-flex-getter/invalid').expect(404).end(done)
      })
    })
  })
})
