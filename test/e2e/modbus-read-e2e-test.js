/**
 * E2E tests for modbus-read node
 */
'use strict'

const helper = require('node-red-node-test-helper')
const testFlow = require('../e2e/flows/modbus-read-e2e-flows')
const nodeUnderTest = require('../../src/modbus-read')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')
const sinon = require('sinon')
const mbBasics = require('../../src/modbus-basics.js')
const { getTestNode, deployModbusFlow } = require('../helper/test-helper-extensions')

const testReadNodes = [clientNode, serverNode, nodeUnderTest]
const assert = require('assert')

helper.init(require.resolve('node-red'))

describe('ModbusRead node', function () {
  this.timeout(15000)

  afterEach(function (done) {
    helper.setFlows([]).then(() => done()).catch(() => done())
  })

  it('should update status correctly during different stages', function (done) {
    deployModbusFlow(helper, testReadNodes, testFlow.testFlowFore2eTesting).then(() => {
      const readNode = getTestNode(helper, '7ae5c3a814b3c02b')
      const modbusClient = getTestNode(helper, '6e3a8b60f1522f98')
      modbusClient.serialSendingAllowed = true
      modbusClient.actualServiceState = { value: 'activated' }

      let setStatus = {}
      readNode.status = function (status) {
        setStatus = status
      }
      readNode.onModbusConnect()
      setTimeout(function () {
        assert.strictEqual(setStatus.fill, 'green')
        assert.strictEqual(setStatus.shape, 'ring')
        assert.ok(setStatus.text, 'expected status text')
        done()
      }, 1500)
    }).catch(done)
  })

  it('should send message with values and valueNames when useIOFile is false', function (done) {
    deployModbusFlow(helper, testReadNodes, testFlow.testFlowForuseIOFileFalse).then(() => {
      const readNode = getTestNode(helper, 'd06a1a340e4c0ffc')
      readNode.ioFile = { lastUpdatedAt: Date.now() }
      const response = { data: [1, 2, 3] }
      const msg = { topic: 'testTopic' }
      const values = [1, 2, 3]
      const valueNames = []
      readNode.onModbusReadDone(response, msg)
      assert.deepStrictEqual(values, [1, 2, 3])
      assert.deepStrictEqual(valueNames, [])
      done()
    }).catch(done)
  })

  it('should initialize delay timer when delayOnStart is true', function (done) {
    deployModbusFlow(helper, testReadNodes, testFlow.testFlowForDelayOnStart).then(() => {
      const readNode = getTestNode(helper, '3f7265d250258d75')
      const clock = sinon.useFakeTimers()
      readNode.initializeReadingTimer()
      clock.tick(readNode.INPUT_TIMEOUT_MILLISECONDS * readNode.startDelayTime)
      clock.restore()
      done()
    }).catch(done)
  })

  it('should log error message when showErrors is true', function (done) {
    deployModbusFlow(helper, testReadNodes, testFlow.testFlowForuseIOFileFalse).then(() => {
      const readNode = getTestNode(helper, 'd06a1a340e4c0ffc')
      readNode.showErrors = true
      const error = new Error('Test error')
      const msg = { payload: 'test' }
      const errorProtocolMsgSpy = sinon.spy(readNode, 'errorProtocolMsg')
      readNode.onModbusReadError(error, msg)
      assert.strictEqual(errorProtocolMsgSpy.calledOnce, true)
      errorProtocolMsgSpy.restore()
      done()
    }).catch(done)
  })

  it('should call mbBasics.logMsgError when showErrors is true', function (done) {
    deployModbusFlow(helper, testReadNodes, testFlow.testFlowForuseIOFileFalse).then(() => {
      const readNode = getTestNode(helper, 'd06a1a340e4c0ffc')
      readNode.showErrors = true
      const error = new Error('Test error')
      const msg = { payload: 'test' }
      const logMsgErrorSpy = sinon.spy(mbBasics, 'logMsgError')
      readNode.errorProtocolMsg(error, msg)
      assert.strictEqual(logMsgErrorSpy.calledOnce, true)
      logMsgErrorSpy.restore()
      done()
    }).catch(done)
  })
})
