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
// const mbBasics = require('../../src/modbus-basics.js')

const testFlows = require('./flows/modbus-flex-sequencer-e2e-flows.js')
// const assert = require('assert')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect

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
    // it('should handle error in input message processing', function () {
    //   helper.load(testFlexSequencerNodes, testFlows.testNodeResponseFromServer, () => {
    //     const flexSequencerNode = helper.getNode('bae63bd33cee1ff2')
    //     console.log(flexSequencerNode)
    //     const origMsgInput = { sequences: [{ fc: 'FC1', unitid: '1', address: '10', quantity: '2' }] }
    //     // const error = new Error('Error processing input message')

    //     // flexSequencerNode.isValidModbusMsg = function () {
    //     //   throw error
    //     // }

    //     flexSequencerNode.emit('input', origMsgInput)

    //     //   expect(flexSequencerNode.errorProtocolMsg).toHaveBeenCalledTimes(1)
    //     //   expect(flexSequencerNode.errorProtocolMsg).toHaveBeenCalledWith(error, origMsgInput)

    //   //   expect(mbBasics.sendEmptyMsgOnFail).toHaveBeenCalledTimes(1)
    //   //   expect(mbBasics.sendEmptyMsgOnFail).toHaveBeenCalledWith(flexSequencerNode, error, origMsgInput)
    //   })
    // })

    it('should process valid sequences', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithValidSequence, () => {
        const flexSequencerNode = helper.getNode('607b91b18be2a9ee')
        const msg = {
          payload: 'test payload',
          sequences: [
            {
              unitid: 1,
              fc: 'FC3',
              address: 0,
              quantity: 10
            }
          ]
        }
        let setStatus = {}

        flexSequencerNode.status = function (status) {
          setStatus = status
        }
        setTimeout(function () {
          flexSequencerNode.emit('input', msg)
          expect(setStatus).to.deep.equal({ fill: 'green', shape: 'ring', text: 'connected' })
          done()
        }, 1500)
      })
    })

    it('should handle modbus read error', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithModbusReadError, () => {
        const flexSequencerNode = helper.getNode('bc5a61b6.a3972')
        const error = new Error('Test error')
        const msg = { payload: 'test payload' }
        const emitSpy = sinon.spy(flexSequencerNode, 'emit')
        flexSequencerNode.onModbusReadError(error, msg)
        sinon.assert.calledWith(emitSpy, 'modbusFlexSequencerNodeError')
        done()
      })
    })

    it('should handle invalid payload in input message', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithInvalidMessage, function () {
        const flexSequencerNode = helper.getNode('42c7ed2cf52e284e')
        const modbusClient = helper.getNode('92e7bf63.2efd7')
        modbusClient.isInactive = () => false
        const msg = { payload: undefined }
        flexSequencerNode.emit('input', msg)
        done()
      })
    })
  })
})
