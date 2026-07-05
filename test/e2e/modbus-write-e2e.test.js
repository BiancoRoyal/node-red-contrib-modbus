/**
 * E2E Tests for modbus-write node — FC5, FC6, FC15, FC16
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const allModbusTestNodes = require('../helper/all-modbus-test-nodes')
const { globalTestHelper } = require('../helper/mocha-global-setup')
const {
  deployFcFlow,
  waitForHelper,
  assertWriteFc,
  buildServerClientFlow,
  getTestNode
} = require('../helper/fc-e2e-helper')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls') &&
  n !== require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls'))

describe('Modbus Write E2E Tests', function () {
  this.timeout(20000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  async function runWriteTest (writeConfig, payload, assertFn) {
    const { flow } = await buildServerClientFlow({
      id: 'fc-write',
      type: 'modbus-write',
      server: 'fc-client',
      emptyMsgOnFail: false,
      delayOnStart: false,
      wires: [['fc-helper'], []],
      ...writeConfig
    })

    await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const writeNode = getTestNode(helper, 'fc-write')
    const pending = waitForHelper(helper, 'fc-helper', assertFn)

    setTimeout(() => writeNode.receive({ payload }), 300)
    await pending
  }

  describe('Write Single Coil (FC5)', function () {
    it('should write single coil and verify response', function () {
      return runWriteTest(
        { name: 'Write Coil', dataType: 'Coil', adr: '10', quantity: '1' },
        true,
        (msg) => {
          assertWriteFc(msg, 5)
          assert.strictEqual(msg.input.payload.address, 10)
          assert.strictEqual(msg.input.payload.value, true)
        }
      )
    })
  })

  describe('Write Single Register (FC6)', function () {
    it('should write single register and verify response', function () {
      return runWriteTest(
        { name: 'Write Register', dataType: 'HoldingRegister', adr: '100', quantity: '1' },
        12345,
        (msg) => {
          assertWriteFc(msg, 6)
          assert.strictEqual(msg.input.payload.address, 100)
          assert.strictEqual(msg.input.payload.value, 12345)
        }
      )
    })
  })

  describe('Write Multiple Coils (FC15)', function () {
    it('should write multiple coils and verify response', function () {
      return runWriteTest(
        { name: 'Write Coils', dataType: 'MCoils', adr: '20', quantity: '8' },
        [true, false, true, false, true, false, true, false],
        (msg) => {
          assertWriteFc(msg, 15)
          assert.strictEqual(msg.input.payload.address, 20)
          assert(Array.isArray(msg.input.payload.value))
          assert.strictEqual(msg.input.payload.value.length, 8)
        }
      )
    })
  })

  describe('Write Multiple Registers (FC16)', function () {
    it('should write multiple registers and verify response', function () {
      return runWriteTest(
        { name: 'Write Registers', dataType: 'MHoldingRegisters', adr: '200', quantity: '4' },
        [1000, 2000, 3000, 4000],
        (msg) => {
          assertWriteFc(msg, 16)
          assert.strictEqual(msg.input.payload.address, 200)
          assert(Array.isArray(msg.input.payload.value))
          assert.strictEqual(msg.input.payload.value.length, 4)
        }
      )
    })
  })
})
