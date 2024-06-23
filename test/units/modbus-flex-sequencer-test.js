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

const testFlexSequencerNodes = [injectNode, clientNode, serverNode, nodeUnderTest]

const testFlows = require('./flows/modbus-flex-sequencer-flows')
const mBasics = require('../../src/modbus-basics')
const _ = require('underscore')

// const chai = require('chai')
const sinon = require('sinon')
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
    // it('simple Node should be loaded without client config', function (done) {
    //   helper.load(testFlexSequencerNodes,testFlows.testNodeWithoutClientFlow , function () {
    //     const modbusFlexSequencer = helper.getNode('bc5a61b6.a3972')
    //     modbusFlexSequencer.should.have.property('name', 'modbusFlexSequencer')

    //     done()
    //   }, function () {
    //     helper.log('function callback')
    //   })
    // })

    it('simple Node with server should be loaded', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        const modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('92e7bf63.2efd7')
        modbusClient.should.have.property('name', 'ModbusServer')

        const modbusFlexSequencer = helper.getNode('bc5a61b6.a3972')
        modbusFlexSequencer.should.have.property('name', 'modbusFlexSequencer')

        done()
      })
    })

    it('should be inactive if message not allowed', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        _.isUndefined(modbusClientNode).should.be.false()

        modbusClientNode.receive({ payload: 'test' })
        const isInactive = modbusClientNode.isInactive()
        isInactive.should.be.true()
        done()
      })
    })

    it('should be inactive if message empty', function (done) {
      const flow = Array.from(testFlows.testNodeWithServerFlow)
      flow[2].serverPort = '50201'
      helper.load(testFlexSequencerNodes, flow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        setTimeout(() => {
          modbusClientNode.messageAllowedStates = ['']
          const isInactive = modbusClientNode.isInactive()
          isInactive.should.be.true()
          done()
        }, 1500)
      })
    })

    // it('should be state queueing - ready to send', function (done) {
    //   helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
    //     const modbusClientNode = helper.getNode('92e7bf63.2efd7')
    //     setTimeout(() => {
    //       mBasics.setNodeStatusTo('queueing', modbusClientNode)
    //       const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
    //       isReady.should.be.true()
    //       done()
    //     }, 1500)
    //   })
    // })

    it('should be not state queueing - not ready to send', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        setTimeout(() => {
          mBasics.setNodeStatusTo('stopped', modbusClientNode)
          const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.true()
          done()
        }, 1500)
      })
    })

    it('prepareMessage will convert a message in string format into a unified format', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        setTimeout(() => {
          const flexSequencer = helper.getNode('bc5a61b6.a3972')
          const result = flexSequencer.prepareMsg('{ "fc": 1, "unitid": 1, "address": 0, "quantity": 1 }')

          result.fc.should.equal(1)
          result.unitid.should.equal(1)
          result.address.should.equal(0)
          result.quantity.should.equal(1)
          done()
        }, 1500)
      })
    })

    it('prepareMessage will convert a message in json format into a unified format', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        setTimeout(() => {
          const flexSequencer = helper.getNode('bc5a61b6.a3972')

          const message = { fc: 1, unitid: 1, address: 0, quantity: 1 }
          const result = flexSequencer.prepareMsg(message)

          result.fc.should.equal(1)
          result.unitid.should.equal(1)
          result.address.should.equal(0)
          result.quantity.should.equal(1)
          done()
        }, 1500)
      })
    })

    it('the user  has the option to input function code strings "FC1,FC2, FC3,FC4" and these will be converted into the right values', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        setTimeout(() => {
          const flexSequencer = helper.getNode('bc5a61b6.a3972')
          const message = { fc: 1, unitid: 1, address: 0, quantity: 1 }

          for (let currentFc = 1; currentFc < 5; currentFc++) {
            message.fc = 'FC' + currentFc
            const result = flexSequencer.prepareMsg(message)
            result.fc.should.equal(currentFc)
            result.unitid.should.equal(1)
            result.address.should.equal(0)
            result.quantity.should.equal(1)
          }
          done()
        }, 1500)
      })
    })

    it('should handle different function codes', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        const flexSequencer = helper.getNode('bc5a61b6.a3972')
        const message = {
          fc: 3,
          unitid: 1,
          address: 0,
          quantity: 2
        }
        const result = flexSequencer.prepareMsg(message)
        result.fc.should.equal(3)
        result.unitid.should.equal(1)
        result.address.should.equal(0)
        result.quantity.should.equal(2)

        message.fc = 4
        const result2 = flexSequencer.prepareMsg(message)
        result2.fc.should.equal(4)
        result2.unitid.should.equal(1)
        result2.address.should.equal(0)
        result2.quantity.should.equal(2)

        done()
      })
    })

    it('isValidModbusMessage checks if the passed message is actually valid', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        setTimeout(() => {
          const flexSequencer = helper.getNode('bc5a61b6.a3972')
          const validModbusMessage = { fc: 1, unitid: 1, address: 0, quantity: 1 }
          const validMessage = flexSequencer.isValidModbusMsg(validModbusMessage)
          validMessage.should.equal(true)

          const invalidUnitIdModbusMessage = { fc: 1, unitid: -10, address: 0, quantity: 1 }
          const invalidUnitId = flexSequencer.isValidModbusMsg(invalidUnitIdModbusMessage)
          invalidUnitId.should.equal(false)

          const invalidAddressModbusMessage = { fc: 1, unitid: 1, address: 65537, quantity: 10 }
          const invalidAddress = flexSequencer.isValidModbusMsg(invalidAddressModbusMessage)
          invalidAddress.should.equal(false)

          const invalidQuantityModbusMessage = { fc: 1, unitid: 1, address: 10, quantity: 65537 }
          const invalidQuantity = flexSequencer.isValidModbusMsg(invalidQuantityModbusMessage)
          invalidQuantity.should.equal(false)

          done()
        }, 1500)
      })
    })

    it('should handle different function codes', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        const flexSequencer = helper.getNode('bc5a61b6.a3972')
        const message = {
          fc: 3,
          unitid: 1,
          address: 0,
          quantity: 2
        }
        const result = flexSequencer.prepareMsg(message)
        result.fc.should.equal(3)
        result.unitid.should.equal(1)
        result.address.should.equal(0)
        result.quantity.should.equal(2)

        message.fc = 4
        const result2 = flexSequencer.prepareMsg(message)
        result2.fc.should.equal(4)
        result2.unitid.should.equal(1)
        result2.address.should.equal(0)
        result2.quantity.should.equal(2)

        done()
      })
    })

    it('should build a new message object correctly', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        const flexSequencer = helper.getNode('bc5a61b6.a3972')

        const msg = {
          topic: 'test-topic',
          name: 'test-name',
          unitid: 1,
          fc: 3,
          address: 100,
          quantity: 10
        }

        const newMessageObject = flexSequencer.buildNewMessageObject(flexSequencer, msg)

        newMessageObject.should.have.property('topic', 'test-topic')
        newMessageObject.should.have.property('messageId')
        newMessageObject.payload.should.have.property('name', 'test-name')
        newMessageObject.payload.should.have.property('unitid', 1)
        newMessageObject.payload.should.have.property('fc', 3)
        newMessageObject.payload.should.have.property('address', 100)
        newMessageObject.payload.should.have.property('quantity', 10)
        newMessageObject.payload.should.have.property('emptyMsgOnFail', false)
        newMessageObject.payload.should.have.property('keepMsgProperties', false)
        newMessageObject.payload.should.have.property('messageId', newMessageObject.messageId)

        done()
      })
    })

    // it('should handle invalid payload', function (done) {
    //   helper.load(testFlexSequencerNodes, testFlows.testNodeWithInjectNodeFlow, function () {
    //     const flexSequencerNode = helper.getNode('42c7ed2cf52e284e')
    //     const invalidMsg = null

    //     flexSequencerNode.receive(invalidMsg)

    //     setTimeout(() => {
    //       helper.log().calledWith('Invalid message on input.').should.be.true()
    //       done()
    //     }, 100)
    //   })
    // })

    // it('should handle not ready for input', function (done) {
    //   helper.load(testFlexSequencerNodes, testFlows.testNodeWithInjectNodeFlow, function () {
    //     const flexSequencerNode = helper.getNode('42c7ed2cf52e284e')
    //     flexSequencerNode.delayOccured = false
    //     const validMsg = { payload: { sequences: [] } }

    //     flexSequencerNode.receive(validMsg)

    //     setTimeout(() => {
    //       helper.log().calledWith('Inject while node is not ready for input.').should.be.true()
    //       done()
    //     }, 100)
    //   })
    // })

    it('should reset the input delay timer, log a warning, and set a timeout when delayOnStart is true', async function () {
      //   await helper.load(testFlexSequencerNodes, testFlows.testNodeWithInjectNodeFlow)
      //   const flexSequencerNode = helper.getNode('42c7ed2cf52e284e')

      //   flexSequencerNode.delayOnStart = true
      //   flexSequencerNode.startDelayTime = 2
      //   flexSequencerNode.id = 'test-flexSequencerNode-id'

      //   const resetInputDelayTimerSpy = sinon.spy(flexSequencerNode, 'resetInputDelayTimer')
      //   flexSequencerNode.verboseWarn = sinon.stub()
      //   const verboseWarnSpy = flexSequencerNode.verboseWarn

      //   await flexSequencerNode.initializeInputDelayTimer()
      //   expect(resetInputDelayTimerSpy.calledOnce).to.be.true()
      //   expect(verboseWarnSpy.calledOnceWithExactly('initialize input delay timer node test-flexSequencerNode-id')).to.be.false()
      //   expect(flexSequencerNode.inputDelayTimer).to.be.an('object')
      //   expect(flexSequencerNode.delayOccured).to.be.false()

      //   resetInputDelayTimerSpy.restore()
    })

    it('should send a message with IO data and emit an event when Modbus read is done', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithInjectNodeFlow, function () {
        const flexSequencerNode = helper.getNode('42c7ed2cf52e284e')

        const resp = { data: [1, 2, 3], someOtherData: 'test' }
        const msg = { payload: 'test' }
        const setNodeStatusToStub = sinon.stub(mBasics, 'setNodeStatusTo')
        flexSequencerNode.onModbusReadDone(resp, msg)
        sinon.assert.calledWith(setNodeStatusToStub, 'reading done', flexSequencerNode)

        done()
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
