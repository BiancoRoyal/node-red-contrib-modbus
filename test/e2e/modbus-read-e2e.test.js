/**
 * E2E Tests for modbus-read node — FC1–FC4
 */

'use strict'

const helper = require('node-red-node-test-helper')
const allModbusTestNodes = require('../helper/all-modbus-test-nodes')
const { globalTestHelper } = require('../helper/mocha-global-setup')
const {
  deployFcFlow,
  waitForHelper,
  assertReadFc,
  buildServerClientFlow,
  getTestNode
} = require('../helper/fc-e2e-helper')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls') &&
  n !== require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls'))

describe('Modbus Read E2E Tests', function () {
  this.timeout(20000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  async function runReadFcTest (dataType, fc, quantity, adr) {
    const { flow } = await buildServerClientFlow({
      id: 'fc-read',
      type: 'modbus-read',
      name: `Read FC${fc}`,
      dataType,
      adr: String(adr),
      quantity: String(quantity),
      rate: '3600',
      rateUnit: 's',
      server: 'fc-client',
      useIOFile: false,
      emptyMsgOnFail: false,
      wires: [['fc-helper'], []]
    })

    await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const readNode = getTestNode(helper, 'fc-read')
    const pending = waitForHelper(helper, 'fc-helper', (msg) => {
      assertReadFc(msg, fc, quantity)
    })

    readNode.modbusPollingRead()
    await pending
  }

  describe('Reading Different Data Types', function () {
    it('should read coils (FC1) and verify message output', function () {
      return runReadFcTest('Coil', 1, 8, 0)
    })

    it('should read discrete inputs (FC2)', function () {
      return runReadFcTest('Input', 2, 8, 0)
    })

    it('should read holding registers (FC3)', function () {
      return runReadFcTest('HoldingRegister', 3, 5, 0)
    })

    it('should read input registers (FC4)', function () {
      return runReadFcTest('InputRegister', 4, 5, 0)
    })
  })
})
