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

const functionNode = require('@node-red/nodes/core/function/10-function.js')
const injectNode = require('@node-red/nodes/core/common/20-inject.js')
const nodeUnderTest = require('../../src/modbus-response-filter.js')
const nodeIOConfig = require('../../src/modbus-io-config.js')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
const flexGetterNode = require('../../src/modbus-flex-getter.js')
const sinon = require('sinon')
const testResponseFilterNodes = [functionNode, injectNode, nodeUnderTest, nodeIOConfig, clientNode, serverNode, flexGetterNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-response-filter-flows')
const mBasics = require('../../src/modbus-basics')
const _ = require('underscore')

describe('Response Filter node Testing', function () {
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
      helper.load(testResponseFilterNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusNode = helper.getNode('50f41d03.d1eff4')
        modbusNode.should.have.property('name', 'ModbusResponseFilter')
        modbusNode.should.have.property('filter', 'FilterTest')
        done()
      })
    })

    it('should be loaded and handle wrong input without crash', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testHandleWrongInputWithoutCrashFlow, function () {
        const modbusResponseFilter = helper.getNode('50f41d03.d1eff4')
        setTimeout(function () {
          modbusResponseFilter.receive({})
          done()
        }, 800)
      })
    })

    it('should stop on input with wrong count of registers', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testStopOnInputWrongCountFlow, function () {
        const modbusResponseFilter = helper.getNode('50f41d03.d1eff4')
        setTimeout(function () {
          modbusResponseFilter.receive({ payload: {}, registers: [0, 1, 0, 1] })
          done()
        }, 800)
      })
    })

    it('should work on input with exact count registers', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testWorkOnInputExactCountFlow, function () {
        const modbusResponseFilter = helper.getNode('50f41d03.d1eff4')
        setTimeout(function () {
          modbusResponseFilter.receive({ payload: {}, registers: [0, 1, 0, 1] })
          done()
        }, 800)
      })
    })

    it('should work with Flex Getter', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testWorkWithFlexGetterFlow, function () {
        const modbusNode = helper.getNode('5a7d9b84.a543a4')
        modbusNode.should.have.property('name', 'ModbusResponseFilter')
        modbusNode.should.have.property('filter', 'bOperationActive')

        const h1 = helper.getNode('h1')
        h1.on('input', function () {
          done()
        })
      })
    })

    it('should be inactive if message not allowed', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testWorkWithFlexGetterFlow, function () {
        const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
        _.isUndefined(modbusClientNode).should.be.false()

        modbusClientNode.receive({ payload: 'test' })
        const isInactive = modbusClientNode.isInactive()
        isInactive.should.be.true()
        done()
      })
    })

    it('should be inactive if message empty', function (done) {
      const flow = Array.from(testFlows.testWorkWithFlexGetterFlow)
      flow[1].serverPort = '50201'
      helper.load(testResponseFilterNodes, flow, function () {
        const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
        setTimeout(() => {
          modbusClientNode.messageAllowedStates = ['']
          const isInactive = modbusClientNode.isInactive()
          isInactive.should.be.true()
          done()
        }, 1500)
      })
    })

    it('should be state queueing - ready to send', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testWorkWithFlexGetterFlow, function () {
        const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
        setTimeout(() => {
          mBasics.setNodeStatusTo('queueing', modbusClientNode)
          const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.true()
          done()
        }, 1500)
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testWorkWithFlexGetterFlow, function () {
        const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
        setTimeout(() => {
          mBasics.setNodeStatusTo('stopped', modbusClientNode)
          const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false()
          done()
        }, 1500)
      })
    })
  })
  // circular dependency error
  it('should be state queueing - ready to send', function () {
    helper.load(testResponseFilterNodes, testFlows.testFlowForE2E, function () {
      const modbusClientNode = helper.getNode('542529cd4e4e8a14')
      const msg = { payload: [{ name: 'testFilter', value: 123 }] }

      const clock = sinon.useFakeTimers()

      modbusClientNode.emit('input', msg)
      expect(msg.payload).to.deep.equal([{ name: 'testFilter', value: 123 }])
      clock.tick(1500)

      clock.restore()
    })
  })
  it('should call internalDebug with appropriate debug messages', () => {
    helper.load(testResponseFilterNodes, testFlows.testFlowResponse, function () {
      const modbusClientNode = helper.getNode('4f8c0e22.48b8b4')
      console.log(modbusClientNode, 'njjj')
      const mbBasics = {
        invalidPayloadIn: sinon.stub().returns(false)
      }
      const mbCore = {
        internalDebug: sinon.stub()
      }
      const msg = {
        payload: [{ name: 'testFilter' }, { name: 'otherFilter' }]
      }
      modbusClientNode.registers = 7
      modbusClientNode.showErrors = true
      modbusClientNode.showWarnings = true
      modbusClientNode.filterFromPayload = sinon.stub()
      modbusClientNode.error = sinon.stub()

      modbusClientNode.emit('input', msg)
      assert(mbBasics.invalidPayloadIn.calledOnceWith(msg))
      assert(modbusClientNode.error.calledWithMatch(sinon.match.instanceOf(Error).and(sinon.match.has('message', '2 does not match 3'))))
      assert(mbCore.internalDebug.calledOnceWith('2 Registers And Filter Length Of 3 Does Not Match'))
      assert(modbusClientNode.send.notCalled)
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testWorkWithFlexGetterFlow, function () {
        helper.request().post('/modbus-response-filter/invalid').expect(404).end(done)
      })
    })
  })
})
