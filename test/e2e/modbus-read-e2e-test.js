// const sinon = require('sinon')
const { expect } = require('chai')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const testFlow = require('../e2e/flows/modbus-read-e2e-flows')
const nodeUnderTest = require('../../src/modbus-read')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')

const testReadNodes = [clientNode, serverNode, nodeUnderTest]

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

  it('simple Node should be loaded without client config', function (done) {
    helper.load(testReadNodes, testFlow.testFlowFore2eTesting, function () {
      helper.getNode('7ae5c3a814b3c02b')
      expect(readNode.name).to.equal('Modbus Read With IO')
      expect(readNode.unitid).to.equal('1')
      expect(readNode.dataType).to.equal('HoldingRegister')
      expect(readNode.adr).to.equal('1')
      expect(readNode.quantity).to.equal('8')
      expect(readNode.rate).to.equal('5')
      expect(readNode.rateUnit).to.equal('s')
      expect(readNode.delayOnStart).to.equal(false)
      expect(readNode.startDelayTime).to.equal(10)
      expect(readNode.showStatusActivities).to.equal(false)
      expect(readNode.showErrors).to.equal(false)
      expect(readNode.showWarnings).to.equal(true)
      expect(readNode.connection).to.equal(null)
      expect(readNode.useIOFile).to.equal(false)
      expect(readNode.ioFile).to.equal(null)
      expect(readNode.useIOForPayload).to.equal(false)
      expect(readNode.logIOActivities).to.equal(false)
      expect(readNode.emptyMsgOnFail).to.equal(false)
      done()
    })
  })
})
