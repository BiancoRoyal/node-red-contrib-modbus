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

const injectNode = require('@node-red/nodes/core/common/20-inject')

const modbusServerNode = require('../../src/modbus-server.js')
const modbusClientNode = require('../../src/modbus-client.js')
const modbusFlexFc = require('../../src/modbus-flex-fc.js')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const expect = require('chai').expect
const sinon = require('sinon')
const mbBasics = require('../../src/modbus-basics.js')
const nodeList = [injectNode, modbusServerNode, modbusClientNode, modbusFlexFc]

const testFcFlexFlows = require('./flows/modbus-fc-flex-e2e-flows')

describe('Modbus E2E Flex FC-Functionality tests', function () {
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

  describe('Modbus Node Test Cases', function () {
    let invalidPayloadInStub, isNotReadyForInputStub, isInactiveStub, setNodeStatusToSpy, buildNewMessageObjectStub

    afterEach(function () {
      if (invalidPayloadInStub) invalidPayloadInStub.restore()
      if (isNotReadyForInputStub) isNotReadyForInputStub.restore()
      if (isInactiveStub) isInactiveStub.restore()
      if (setNodeStatusToSpy) setNodeStatusToSpy.restore()
      if (buildNewMessageObjectStub) buildNewMessageObjectStub.restore()
    })

    it('should handle error and send empty message on fail', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlowWithError, function () {
        const flexNode = helper.getNode('5bd25e14c9c67f95')
        const modbusClient = helper.getNode('a24bea7c.848da')
        flexNode.showStatusActivities = false

        invalidPayloadInStub = sinon.stub(mbBasics, 'invalidPayloadIn').returns(false)
        isNotReadyForInputStub = sinon.stub(flexNode, 'isNotReadyForInput').returns(false)
        isInactiveStub = sinon.stub(modbusClient, 'isInactive').returns(false)
        buildNewMessageObjectStub = sinon.stub(flexNode, 'buildNewMessageObject')
        buildNewMessageObjectStub.throws(new Error('Error in buildNewMessageObject'))

        const errorProtocolMsgStub = sinon.stub(flexNode, 'errorProtocolMsg')
        const sendEmptyMsgOnFailStub = sinon.stub(mbBasics, 'sendEmptyMsgOnFail')

        const msg = {
          topic: 'customFc',
          from: flexNode.name,
          payload: null
        }

        flexNode.emit('input', msg)

        /* eslint-disable no-unused-expressions */
        expect(errorProtocolMsgStub.calledOnce).to.be.true
        expect(sendEmptyMsgOnFailStub.calledOnce).to.be.true

        errorProtocolMsgStub.restore()
        sendEmptyMsgOnFailStub.restore()
        done()
      })
    })

    it('should set node status if showStatusActivities is true', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlowForReading, function () {
        const flexNode = helper.getNode('e7027eb89e7951dc')
        const clientNode = helper.getNode('aaa97cb90fe9cf75')

        flexNode.showStatusActivities = true
        invalidPayloadInStub = sinon.stub(mbBasics, 'invalidPayloadIn').returns(false)
        isNotReadyForInputStub = sinon.stub(flexNode, 'isNotReadyForInput').returns(false)
        isInactiveStub = sinon.stub(clientNode, 'isInactive').returns(false)
        setNodeStatusToSpy = sinon.spy(mbBasics, 'setNodeStatusTo')

        const msg = {
          topic: 'customFc',
          from: flexNode.name,
          payload: {
            unitid: 1,
            fc: '0x04',
            requestCard: [{ name: 'startingAddress', data: 0, offset: 0, type: 'uint16be' }],
            responseCard: [{ name: 'byteCount', data: 0, offset: 0, type: 'uint8be' }]
          }
        }

        flexNode.emit('input', msg)

        const callArgs = setNodeStatusToSpy.firstCall.args
        expect(callArgs[0]).to.equal(clientNode.actualServiceState)
        expect(callArgs[1]).to.equal(flexNode)
        done()
      })
    })
  })

  describe('Flex-FC-Read-Coil', function () {
    it('should set node status to waiting if modbusClient.client is not defined', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlowWithError, function () {
        const flexNode = helper.getNode('5bd25e14c9c67f95')

        let setStatus = {}
        flexNode.status = function (status) {
          setStatus = status
        }

        const setNodeStatusPropertiesStub = sinon.stub(mbBasics, 'setNodeStatusProperties').returns({
          status: 'waiting',
          fill: 'yellow',
          shape: 'ring'
        })

        flexNode.modbusRead()

        expect(setNodeStatusPropertiesStub.calledWith('waiting')).to.be.true
        expect(setStatus).to.deep.equal({ fill: 'yellow', shape: 'ring', text: 'waiting' })

        setNodeStatusPropertiesStub.restore()
        done()
      })
    })

    it('should set node status and call modbusRead on modbus connect', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlowForReading, function () {
        const flexNode = helper.getNode('e7027eb89e7951dc')
        flexNode.onModbusConnect()
        done()
      })
    })

    it('should call internalDebugLog, errorProtocolMsg, sendEmptyMsgOnFail, and setModbusError', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlowForReading, function () {
        const flexNode = helper.getNode('e7027eb89e7951dc')
        const internalDebugLogStub = sinon.stub(flexNode, 'internalDebugLog')
        const errorProtocolMsgStub = sinon.stub(flexNode, 'errorProtocolMsg')
        const sendEmptyMsgOnFailStub = sinon.stub(mbBasics, 'sendEmptyMsgOnFail')
        const fakeError = new Error('Fake error')
        const fakeMsg = { payload: 'fakePayload' }
        flexNode.onModbusReadError(fakeError, fakeMsg)
        sinon.assert.calledOnceWithExactly(internalDebugLogStub, fakeError.message)
        sinon.assert.calledOnceWithExactly(errorProtocolMsgStub, fakeError, fakeMsg)
        internalDebugLogStub.restore()
        errorProtocolMsgStub.restore()
        sendEmptyMsgOnFailStub.restore()
        done()
      })
    })

    it('should call resetAllReadingTimer, removeNodeListenerFromModbusClient, setNodeStatusWithTimeTo, and deregisterForModbus', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlowForReading, function () {
        const flexNode = helper.getNode('e7027eb89e7951dc')
        const doneMock = sinon.stub()
        flexNode.emit('close', doneMock)
        done()
      })
    })

    it('should call mbBasics.logMsgError when showErrors is true', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlowForReading, function () {
        const flexNode = helper.getNode('e7027eb89e7951dc')
        const logMsgErrorStub = sinon.stub(mbBasics, 'logMsgError')
        const fakeError = new Error('Fake error')
        const fakeMsg = { payload: 'fakePayload' }

        flexNode.errorProtocolMsg(fakeError, fakeMsg)

        sinon.assert.calledOnceWithExactly(logMsgErrorStub, flexNode, fakeError, fakeMsg)

        logMsgErrorStub.restore()
        done()
      })
    })

    it('should set status to waiting if modbusClient is not available', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlowWithNoServer, function () {
        const flexNode = helper.getNode('e096a175bb6a77ae')

        let setStatus = {}

        flexNode.status = function (status) {
          setStatus = status
        }
        flexNode.modbusRead()
        setTimeout(function () {
          expect(setStatus).to.deep.equal({
            text: 'broken',
            fill: 'yellow',
            shape: 'ring'
          })
          done()
        }, 1500)
      })
    })

    it('should set status to waiting if client is not available in modbusRead', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlowForReading, function () {
        const flexNode = helper.getNode('e7027eb89e7951dc')
        flexNode.modbusRead()

        done()
      })
    })

    it('the request-map-editor should contain the correct map', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlexFCFunctionality, function () {
        const flexNode = helper.getNode('4f80ae4fa5b8af80')
        flexNode.should.have.property('fc', '0x01')
        const result = flexNode.requestCard
        const expectedJson =
          [
            {
              name: 'startingAddress',
              data: 0,
              offset: 0,
              type: 'uint16be'
            },
            {
              name: 'quantityCoils',
              data: 8,
              offset: 2,
              type: 'uint16be'
            }
          ]

        expect(result).deep.equal(expectedJson)
        done()
      })
    })

    it('the response-map-editor should contain the correct map', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlexFCFunctionality, function () {
        const flexNode = helper.getNode('4f80ae4fa5b8af80')
        const result = flexNode.responseCard
        const expectedJson = [
          {
            name: 'byteCount',
            data: 0,
            offset: 0,
            type: 'uint8be'
          },
          {
            name: 'coilStatus',
            data: 0,
            offset: 1,
            type: 'uint8be'
          }
        ]

        expect(result).deep.equal(expectedJson)
        done()
      })
    })

    it('the node can successfully receive data from the outside world', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlexFCFunctionality, function () {
        const flexNode = helper.getNode('4f80ae4fa5b8af80')
        const counter = 0
        flexNode.on('input', function (msg) {
          if (counter === 1 && msg.topic === 'polling') {
            done()
          }
        })
        done()
      })
    })

    it('the node can load the default files from the drive via a POST Request', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlexFCFunctionality, function () {
        helper.request().post('/modbus/fc/4f80ae4fa5b8af80').expect(200).end(done)
      })
    })

    it('should return 400 for invalid file extension', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlexFCFunctionality, function () {
        helper.request()
          .post('/modbus/fc/4f80ae4fa5b8af80')
          .send({ mapPath: './extras/argumentMaps/defaults/codes.txt' })
          .expect(400)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              done()
            }
          })
      })
    })
  })
})
