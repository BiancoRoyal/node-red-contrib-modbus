/**
 * E2E Tests for modbus-flex-write node — FC5, FC6, FC15, FC16
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const allModbusTestNodes = require('../helper/all-modbus-test-nodes')
const { globalTestHelper } = require('../helper/mocha-global-setup')
const {
  deployFcFlow,
  waitForHelper,
  waitForTestNode,
  assertWriteFc,
  buildServerClientFlow,
  getTestNode,
  setupFcMocks
} = require('../helper/fc-e2e-helper')
const { deployModbusFlow } = require('../helper/test-helper-extensions')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls') &&
  n !== require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls'))

describe('Modbus Flex Write E2E Tests', function () {
  this.timeout(20000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  async function runFlexWrite (flexPayload, assertFn, flexConfig = {}) {
    const { flow } = await buildServerClientFlow({
      id: 'fc-flex-write',
      type: 'modbus-flex-write',
      name: 'Flex Write',
      server: 'fc-client',
      emptyMsgOnFail: false,
      delayOnStart: false,
      wires: [['fc-helper'], []],
      ...flexConfig
    })

    await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const flexWrite = await waitForTestNode(helper, 'fc-flex-write')
    const pending = waitForHelper(helper, 'fc-helper', assertFn)

    setTimeout(() => flexWrite.receive({ payload: flexPayload }), 300)
    await pending
  }

  describe('Flex Write Operations', function () {
    it('should write single coil using flex write (FC5)', function () {
      return runFlexWrite(
        { value: true, fc: 5, unitid: 1, address: 10, quantity: 1 },
        (msg) => {
          assertWriteFc(msg, 5)
          assert.strictEqual(msg.input.payload.address, 10)
        }
      )
    })

    it('should write single register using flex write (FC6)', function () {
      return runFlexWrite(
        { value: 1234, fc: 6, unitid: 1, address: 20, quantity: 1 },
        (msg) => {
          assertWriteFc(msg, 6)
          assert.strictEqual(msg.input.payload.address, 20)
          assert.strictEqual(msg.input.payload.value, 1234)
        }
      )
    })

    it('should write multiple coils using flex write (FC15)', function () {
      return runFlexWrite(
        {
          value: [true, false, true, false, true, false, true, false],
          fc: 15,
          unitid: 1,
          address: 0,
          quantity: 8
        },
        (msg) => {
          assertWriteFc(msg, 15)
          assert.strictEqual(msg.input.payload.quantity, 8)
        }
      )
    })

    it('should write multiple registers using flex write (FC16)', function () {
      return runFlexWrite(
        {
          value: [100, 200, 300, 400, 500],
          fc: 16,
          unitid: 1,
          address: 0,
          quantity: 5
        },
        (msg) => {
          assertWriteFc(msg, 16)
          assert.strictEqual(msg.input.payload.quantity, 5)
        }
      )
    })

    it('should handle write errors gracefully', async function () {
      await setupFcMocks(globalTestHelper)
      const { flow } = await buildServerClientFlow({
        id: 'fc-flex-write',
        type: 'modbus-flex-write',
        name: 'Flex Write Error',
        server: 'fc-client',
        emptyMsgOnFail: true,
        delayOnStart: false,
        wires: [[], ['fc-error-helper']]
      })
      flow.push({ id: 'fc-error-helper', type: 'helper', wires: [] })

      await deployModbusFlow(helper, coreModbusNodes, flow)

      const client = getTestNode(helper, 'fc-client')
      const flexWrite = getTestNode(helper, 'fc-flex-write')
      client.client.writeRegisters = function () {
        return Promise.reject(new Error('Simulated flex write error'))
      }

      const pending = waitForHelper(helper, 'fc-error-helper', (msg) => {
        assert.strictEqual(msg.payload, '')
        assert(msg.error)
      })

      setTimeout(() => {
        flexWrite.receive({
          payload: { value: [1, 2, 3], fc: 16, unitid: 1, address: 0, quantity: 3 }
        })
      }, 300)
      await pending
    })

    it('should preserve message properties when configured', async function () {
      const { flow } = await buildServerClientFlow({
        id: 'fc-flex-write',
        type: 'modbus-flex-write',
        name: 'Flex Write Keep Props',
        server: 'fc-client',
        emptyMsgOnFail: false,
        delayOnStart: false,
        keepMsgProperties: true,
        wires: [['fc-helper'], []]
      })

      await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

      const flexWrite = getTestNode(helper, 'fc-flex-write')
      const pending = waitForHelper(helper, 'fc-helper', (msg) => {
        assert.strictEqual(msg.customProperty, 'testValue')
        assert.strictEqual(msg.topic, 'test/topic')
        assertWriteFc(msg, 16)
      })

      setTimeout(() => {
        flexWrite.receive({
          payload: { value: [111, 222], fc: 16, unitid: 1, address: 10, quantity: 2 },
          topic: 'test/topic',
          customProperty: 'testValue'
        })
      }, 300)
      await pending
    })

    it('should handle multiple sequential flex writes', async function () {
      const { flow } = await buildServerClientFlow({
        id: 'fc-flex-write',
        type: 'modbus-flex-write',
        name: 'Flex Write Batch',
        server: 'fc-client',
        emptyMsgOnFail: false,
        delayOnStart: false,
        wires: [['fc-helper'], []]
      })

      await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

      const flexWrite = getTestNode(helper, 'fc-flex-write')
      let count = 0

      const pending = new Promise((resolve, reject) => {
        const helperNode = getTestNode(helper, 'fc-helper')
        const timer = setTimeout(() => reject(new Error('timeout waiting for batch writes')), 15000)
        helperNode.on('input', () => {
          count++
          if (count >= 3) {
            clearTimeout(timer)
            resolve()
          }
        })
      })

      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          flexWrite.receive({
            payload: { value: [i * 100, i * 200], fc: 16, unitid: 1, address: i * 10, quantity: 2 }
          })
        }, 300 + i * 300)
      }
      await pending
    })
  })
})
