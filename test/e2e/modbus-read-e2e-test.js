const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const testFlow = require('../e2e/flows/modbus-read-e2e-flows')
const nodeUnderTest = require('../../src/modbus-read')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
// const mbIOCore = require('../../src/core/modbus-io-core.js')
// const EventEmitter = require('events').EventEmitter

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

  // it('simple Node should be loaded without client config', function (done) {
  //   helper.load(testReadNodes, testFlow.testFlowFore2eTesting, function () {
  //     const readNode = helper.getNode('7ae5c3a814b3c02b')
  //     expect(readNode.name).to.equal('Modbus Read With IO')
  //     expect(readNode.unitid).to.equal('1')
  //     expect(readNode.dataType).to.equal('HoldingRegister')
  //     expect(readNode.adr).to.equal('1')
  //     expect(readNode.quantity).to.equal('8')
  //     expect(readNode.rate).to.equal('5')
  //     expect(readNode.rateUnit).to.equal('s')
  //     expect(readNode.delayOnStart).to.equal(false)
  //     expect(readNode.startDelayTime).to.equal(10)
  //     expect(readNode.showStatusActivities).to.equal(false)
  //     expect(readNode.showErrors).to.equal(false)
  //     expect(readNode.showWarnings).to.equal(true)
  //     expect(readNode.connection).to.equal(null)
  //     expect(readNode.useIOFile).to.equal(false)
  //     expect(readNode.ioFile).to.equal(null)
  //     expect(readNode.useIOForPayload).to.equal(false)
  //     expect(readNode.logIOActivities).to.equal(false)
  //     expect(readNode.emptyMsgOnFail).to.equal(false)
  //     done()
  //   })
  // })
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

  it('should send message with value names as payload when useIOForPayload is true', function (done) {
    helper.load(testReadNodes, testFlow.testFlowForSendingDataTesting, async () => {
      const readNode = helper.getNode('7ae5c3a814b3c02b')
      readNode.useIOForPayload = true
      const testPayload = {
        unitid: 1,
        fc: 0x01,
        address: 0x0001,
        quantity: 1,
        messageId: 'test-id',
        valueNames: ['value1']
      }

      readNode.on('input', function (msg) {
        expect(msg.payload).to.deep.equal(testPayload)
        done()
      })

      readNode.emit('input', { payload: testPayload })
    })
  })
  it('should send message with only values as payload when useIOForPayload is false', function (done) {
    helper.load(testReadNodes, testFlow.testFlowForSendingDataTesting, async () => {
      const readNode = helper.getNode('7ae5c3a814b3c02b')
      readNode.useIOForPayload = false
      const testPayload = {
        unitid: 1,
        fc: 0x01,
        address: 0x0001,
        quantity: 1,
        messageId: 'test-id',
        values: [1]
      }

      readNode.on('input', function (msg) {
        expect(msg.payload).to.deep.equal([1])
        done()
      })

      readNode.emit('input', { payload: testPayload })
    })
  })
  it('should send message with payload and valueNames from ioFile when useIOForPayload is true and useIOFile is true', function (done) {
    helper.load(testReadNodes, testFlow.testFlowForSendingDataTesting, async () => {
      const readNode = helper.getNode('7ae5c3a814b3c02b')
      readNode.useIOFile = true
      readNode.ioFile = { lastUpdatedAt: Date.now() }
      readNode.logIOActivities = true
      const testPayload = {
        unitid: 1,
        fc: 0x01,
        address: 0x0001,
        quantity: 1,
        messageId: 'test-id',
        values: [1]
      }
      readNode.on('send', function (msg) {
        expect(msg.payload).to.deep.equal(['value1'])
        expect(msg.values).to.deep.equal([1])
        done()
      })

      readNode.onModbusReadDone({ data: testPayload.values }, { topic: 'testTopic', input: 'inputMsg' })
    })
  })
})
