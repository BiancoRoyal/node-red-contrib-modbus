/**
 * E2E Tests for modbus-flex-getter — FC1–FC4 via msg.payload
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
  buildServerClientFlow,
  getTestNode
} = require('../helper/fc-e2e-helper')
const { deployModbusFlow } = require('../helper/test-helper-extensions')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls') &&
  n !== require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls'))

describe('Modbus Flex Getter E2E Tests', function () {
  this.timeout(20000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  function assertFlexGetterRead (msg, fc, quantity, address) {
    assert(Array.isArray(msg.payload), 'payload should be array')
    assert(msg.modbusRequest, 'modbusRequest expected')
    assert.strictEqual(Number(msg.modbusRequest.fc), fc)
    assert.strictEqual(Number(msg.modbusRequest.quantity), quantity)
    assert.strictEqual(Number(msg.modbusRequest.address), address)
  }

  async function runFlexGetter (flexPayload, assertFn, flexConfig = {}, msgExtras = {}) {
    const { flow } = await buildServerClientFlow({
      id: 'fc-flex-getter',
      type: 'modbus-flex-getter',
      name: 'Flex Getter',
      server: 'fc-client',
      emptyMsgOnFail: false,
      delayOnStart: false,
      wires: [['fc-helper'], []],
      ...flexConfig
    })

    await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const flexGetter = await waitForTestNode(helper, 'fc-flex-getter')
    const pending = waitForHelper(helper, 'fc-helper', assertFn)

    setTimeout(() => flexGetter.receive({ payload: flexPayload, ...msgExtras }), 300)
    await pending
  }

  describe('Flex Getter Read Operations', function () {
    it('should read coils using flex getter (FC1)', function () {
      return runFlexGetter(
        { fc: 1, unitid: 1, address: 0, quantity: 10 },
        (msg) => assertFlexGetterRead(msg, 1, 10, 0)
      )
    })

    it('should read discrete inputs using flex getter (FC2)', function () {
      return runFlexGetter(
        { fc: 2, unitid: 1, address: 0, quantity: 8 },
        (msg) => assertFlexGetterRead(msg, 2, 8, 0)
      )
    })

    it('should read holding registers using flex getter (FC3)', function () {
      return runFlexGetter(
        { fc: 3, unitid: 1, address: 0, quantity: 5 },
        (msg) => assertFlexGetterRead(msg, 3, 5, 0)
      )
    })

    it('should read input registers using flex getter (FC4)', function () {
      return runFlexGetter(
        { fc: 4, unitid: 1, address: 0, quantity: 4 },
        (msg) => assertFlexGetterRead(msg, 4, 4, 0)
      )
    })

    it('should handle flex getter errors gracefully', async function () {
      const { flow } = await buildServerClientFlow({
        id: 'fc-flex-getter',
        type: 'modbus-flex-getter',
        name: 'Flex Getter Error',
        server: 'fc-client',
        emptyMsgOnFail: true,
        delayOnStart: false,
        wires: [[], ['fc-error-helper']]
      })
      flow.push({ id: 'fc-error-helper', type: 'helper', wires: [] })

      await deployModbusFlow(helper, coreModbusNodes, flow)

      const client = getTestNode(helper, 'fc-client')
      const flexGetter = await waitForTestNode(helper, 'fc-flex-getter')
      client.client.readHoldingRegisters = function () {
        return Promise.reject(new Error('Simulated flex getter error'))
      }

      const pending = waitForHelper(helper, 'fc-error-helper', (msg) => {
        assert.strictEqual(msg.payload, '')
        assert(msg.error)
      })

      setTimeout(() => {
        flexGetter.receive({ payload: { fc: 3, unitid: 1, address: 0, quantity: 5 } })
      }, 300)
      await pending
    })

    it('should preserve message properties when configured', function () {
      return runFlexGetter(
        { fc: 3, unitid: 1, address: 0, quantity: 5 },
        (msg) => {
          assert.strictEqual(msg.topic, 'flex/getter')
          assert.strictEqual(msg.customProp, 'flexValue')
          assertFlexGetterRead(msg, 3, 5, 0)
        },
        { keepMsgProperties: true },
        { topic: 'flex/getter', customProp: 'flexValue' }
      )
    })
  })
})
