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
const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')
const nodeUnderTest = require('../../src/modbus-flex-sequencer.js')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const testFlexSequencerNodes = [injectNode, clientNode, serverNode, nodeUnderTest]
// const mbBasics = require('../../src/modbus-basics.js')

const testFlows = require('./flows/modbus-flex-sequencer-e2e-flows.js')
// const assert = require('assert')
const sinon = require('sinon')
const { getPort, assignModbusTcpPorts, deployModbusFlow, getTestNode } = require('../helper/test-helper-extensions')
const { globalTestHelper } = require('../helper/mocha-global-setup')

describe('Flex Sequencer node Testing (Task 16 — E2E port isolation)', function () {
  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    const timeout = setTimeout(() => {
      done()
    }, 2000)

    helper.unload().then(function () {
      clearTimeout(timeout)
      done()
    }).catch(function () {
      clearTimeout(timeout)
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
      getPort().then(async (port) => {
        const flow = assignModbusTcpPorts(Array.from(testFlows.testNodeWithValidSequence), port)
        globalTestHelper.setupMocks({
          mockModbusSerial: true,
          mockNetConnections: true,
          mockTimers: false
        })
        await deployModbusFlow(helper, testFlexSequencerNodes, flow)
        const flexSequencerNode = getTestNode(helper, '2b7063dbd84388c7')
        flexSequencerNode.onModbusConnect()
        done()
      }).catch(done)
    })

    it('should handle modbus read error', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithModbusReadError, () => {
        const flexSequencerNode = helper.getNode('a60a969b9c758802')
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
        const flexSequencerNode = helper.getNode('227c0ce1950c49dd')
        const modbusClient = helper.getNode('2a5ef5fd62f7a4a0')
        modbusClient.isInactive = () => false
        const msg = { payload: undefined }
        flexSequencerNode.emit('input', msg)
        done()
      })
    })
  })
})
