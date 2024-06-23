const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const testFlow = require('../e2e/flows/modbus-read-e2e-flows')
const nodeUnderTest = require('../../src/modbus-read')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
// const mbIOCore = require('../../src/core/modbus-io-core.js')
// const EventEmitter = require('events').EventEmitter
const sinon = require('sinon')
const mbBasics = require('../../src/modbus-basics.js')
const testReadNodes = [clientNode, serverNode, nodeUnderTest]
const expect = require('chai').expect

describe('ModbusRead node', () => {
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

  it('should update status correctly during different stages', (done) => {
    helper.load(testReadNodes, testFlow.testFlowFore2eTesting, async () => {
      const readNode = helper.getNode('7ae5c3a814b3c02b')
      const modbusClient = helper.getNode('699247754b70bb94')
      modbusClient.serialSendingAllowed = true

      let setStatus = {}

      readNode.status = function (status) {
        setStatus = status
      }
      modbusClient.emit('mbregister', readNode.onModbusRegister)
      setTimeout(function () {
        expect(setStatus).to.deep.equal({ fill: 'green', shape: 'ring', text: 'connected' })
        done()
      }, 1500)
    })
  })
  it('should send message with values and valueNames when useIOFile is false', function (done) {
    helper.load(testReadNodes, testFlow.testFlowForuseIOFileFalse, async () => {
      const readNode = helper.getNode('7ae5c3a814b3c02b')
      readNode.ioFile = { lastUpdatedAt: Date.now() }
      const response = { data: [1, 2, 3] }
      const msg = { topic: 'testTopic' }
      const values = [1, 2, 3]
      const valueNames = []
      readNode.onModbusReadDone(response, msg)

      expect(values).to.deep.equal([1, 2, 3])
      expect(valueNames).to.deep.equal([])
      done()
    })
  })

  it('should initialize delay timer when delayOnStart is true', function (done) {
    helper.load(testReadNodes, testFlow.testFlowForDelayOnStart, async () => {
      const readNode = helper.getNode('7ae5c3a814b3c02b')

      const clock = sinon.useFakeTimers()

      readNode.initializeReadingTimer()

      clock.tick(readNode.INPUT_TIMEOUT_MILLISECONDS * readNode.startDelayTime)

      clock.restore()

      done()
    })
  })
  it('should log error message when showErrors is true', function (done) {
    helper.load(testReadNodes, testFlow.testFlowForuseIOFileFalse, function () {
      const readNode = helper.getNode('7ae5c3a814b3c02b')

      const error = new Error('Test error')
      const errorMessage = 'Test error message'

      readNode.showErrors = true

      const logMsgErrorSpy = sinon.spy(mbBasics, 'logMsgError')

      readNode.errorProtocolMsg(error, errorMessage)

      sinon.assert.calledWith(logMsgErrorSpy, readNode, error, errorMessage)

      logMsgErrorSpy.restore()

      done()
    })
  })

  it('should send message with values and response when useIOFile and useIOForPayload are true', function (done) {
    helper.load(testReadNodes, testFlow.testFlowForSendingDataTesting, async () => {
      const readNode = helper.getNode('7ae5c3a814b3c02b')
      readNode.ioFile = { lastUpdatedAt: Date.now() }
      const response = { data: [1, 2, 3] }
      const msg = { topic: 'testTopic' }
      let msgOutput = ''
      readNode.send = function (msg) {
        msgOutput = msg
      }
      readNode.onModbusReadDone(response, msg)
      expect(msgOutput).to.deep.equal([
        {
          topic: 'testTopic',
          responseBuffer: { data: [1, 2, 3] },
          input: { topic: 'testTopic' },
          sendingNodeId: '7ae5c3a814b3c02b',
          payload: [],
          values: [1, 2, 3]
        },
        {
          topic: 'testTopic',
          payload: { data: [1, 2, 3] },
          values: [1, 2, 3],
          input: { topic: 'testTopic' },
          valueNames: [],
          sendingNodeId: '7ae5c3a814b3c02b'
        }
      ])
      done()
    })
  })
})
