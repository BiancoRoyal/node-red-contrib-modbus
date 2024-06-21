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
const assert = require('assert')
const testResponseFilterNodes = [functionNode, injectNode, nodeUnderTest, nodeIOConfig, clientNode, serverNode, flexGetterNode]
// const mbCore = require('../../src/core/modbus-core.js')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-response-filter-flows')

describe('Response Filter node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    helper.unload().then(() => done()).catch(done)
  })

  after(function (done) {
    helper.stopServer(done)
  })

  describe('Node', function () {
    it('should return modbusIOFileValuNames when accessing /modbus/iofile/valuenames', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testToFilterFlow, function () {
        const modbusResponseFilter = helper.getNode('e8041f6236cbaee4')
        const newConfigData = ''
        modbusResponseFilter.ioFile.configData = newConfigData

        helper.request()
          .get('/modbus/iofile/valuenames')
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
              return
            }
            assert.strictEqual(res.body, newConfigData)
            done()
          })
      })
    })

    it('should log an error if payload length does not match register length and showErrors is true', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testToFilterFlow, function () {
        const responseFilterNode = helper.getNode('e8041f6236cbaee4')
        responseFilterNode.showErrors = true
        responseFilterNode.registers = 5
        responseFilterNode.error = sinon.stub()

        const msg = {
          payload: [{ name: 'test' }]
        }
        responseFilterNode.emit('input', msg)

        sinon.assert.calledOnce(responseFilterNode.error)
        sinon.assert.calledWithMatch(responseFilterNode.error, sinon.match.instanceOf(Error).and(sinon.match.has('message', '1 does not match 5')))
        done()
      })
    })

    it('should send the filtered message when registers is not set or less than or equal to 0', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testToFilterFlow, function () {
        const responseFilterNode = helper.getNode('e8041f6236cbaee4')
        responseFilterNode.registers = 0 // or set to a negative value to test that case as well
        responseFilterNode.send = sinon.spy()
        const filterFromPayloadSpy = sinon.stub(responseFilterNode, 'filterFromPayload').callsFake((msg) => msg)

        const msg = {
          payload: [{ name: 'test' }]
        }
        responseFilterNode.emit('input', msg)
        sinon.assert.calledOnce(filterFromPayloadSpy)
        sinon.assert.calledOnce(responseFilterNode.send)
        done()
      })
    })

    it('should update modbusIOFileValuNames when updatedConfig event is emitted', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testToFilterFlow, function () {
        const responseFilterNode = helper.getNode('e8041f6236cbaee4')
        const modbusIOFileValuNames = [{ name: 'newConfig' }]
        responseFilterNode.ioFile.emit('updatedConfig', modbusIOFileValuNames)
        assert.deepStrictEqual(modbusIOFileValuNames, [{ name: 'newConfig' }])
        done()
      })
    })

    it('should filter payload based on node.filter', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testToFilterFlow, function () {
        const responseFilterNode = helper.getNode('e8041f6236cbaee4')
        const msg = {
          payload: [{ name: 'testFilter' }, { name: 'otherFilter' }]
        }
        responseFilterNode.filter = 'testFilter'
        const result = responseFilterNode.filterFromPayload(msg)
        assert.strictEqual(result.payload.length, 1)
        assert.strictEqual(result.payload[0].name, 'testFilter')
        done()
      })
    })

    // it('should log a warning if payload length does not match register length and showWarnings is true', function (done) {
    //   helper.load(testResponseFilterNodes, testFlows.testToFilterFlow, function () {
    //     const responseFilterNode = helper.getNode('e8041f6236cbaee4')
    //     const internalDebugStub = sinon.stub(mbCore, 'internalDebug')
    //     const msg = {
    //       payload: [{ name: 'test' }]
    //     }
    //     responseFilterNode.emit('input', msg)
    //     sinon.assert.calledWith(internalDebugStub, '1 Registers And Filter Length Of 5 Does Not Match')
    //     internalDebugStub.restore()
    //     done()
    //   })
    // })

    it('should send the filtered message if payload length matches register length', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testToFilterFlowWithNoWarnings, function () {
        const responseFilterNode = helper.getNode('8b8a4538d916fd59')
        responseFilterNode.send = sinon.spy()
        const filterFromPayloadStub = sinon.stub(responseFilterNode, 'filterFromPayload')
        const msg = {
          payload: [{ name1: 'test1' }, { name2: 'test2' }]
        }
        responseFilterNode.emit('input', msg)
        sinon.assert.calledOnce(filterFromPayloadStub)
        sinon.assert.calledOnce(responseFilterNode.send)
        done()
      })
    })

    it('should call internalDebug with appropriate debug messages', function () {
      helper.load(testResponseFilterNodes, testFlows.testFlowResponse, function () {
        const modbusClientNode = helper.getNode('4f8c0e22.48b8b4')
        const mbBasicsStub = {
          invalidPayloadIn: sinon.stub().returns(false)
        }
        const mbCoreStub = {
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
        assert(mbBasicsStub.invalidPayloadIn.calledOnceWith(msg))
        assert(modbusClientNode.error.calledWithMatch(sinon.match.instanceOf(Error).and(sinon.match.has('message', '2 does not match 3'))))
        assert(mbCoreStub.internalDebug.calledOnceWith('2 Registers And Filter Length Of 3 Does Not Match'))
        assert(modbusClientNode.send.notCalled)
      })
    })

    it('should be loaded', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusNode = helper.getNode('50f41d03.d1eff4')
        assert.strictEqual(modbusNode.name, 'ModbusResponseFilter')
        assert.strictEqual(modbusNode.filter, 'FilterTest')
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

    //   it('should be inactive if message not allowed', function (done) {
    //     helper.load(testResponseFilterNodes, testFlows.testWorkWithFlexGetterFlow, function () {
    //       const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
    //       assert.isDefined(modbusClientNode)

  //       modbusClientNode.receive({ payload: 'test' })
  //       const isInactive = modbusClientNode.isInactive()
  //       assert.isTrue(isInactive)
  //       done()
  //     })
  //   })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testResponseFilterNodes, [], function () {
        helper.request().post('/modbus-response-filter/invalid').expect(404).end(done)
      })
    })
  })
})
