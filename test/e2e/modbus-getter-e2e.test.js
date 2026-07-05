/**
 * E2E Tests for modbus-getter node — FC1–FC4 and related behaviour
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const allModbusTestNodes = require('../helper/all-modbus-test-nodes')
const { globalTestHelper } = require('../helper/mocha-global-setup')
const {
  deployFcFlow,
  waitForHelper,
  buildServerClientFlow,
  getTestNode
} = require('../helper/fc-e2e-helper')
const { deployModbusFlow } = require('../helper/test-helper-extensions')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls') &&
  n !== require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls'))

describe('Modbus Getter E2E Tests', function () {
  this.timeout(20000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  function assertGetterRead (msg, fc, quantity, address) {
    assert(Array.isArray(msg.payload), 'payload should be array')
    assert(msg.modbusRequest, 'modbusRequest expected')
    assert.strictEqual(Number(msg.modbusRequest.fc), fc)
    assert.strictEqual(Number(msg.modbusRequest.quantity), quantity)
    assert.strictEqual(Number(msg.modbusRequest.address), address)
  }

  async function runGetterTest (getterConfig, triggerPayload, assertFn) {
    const { flow } = await buildServerClientFlow({
      id: 'fc-getter',
      type: 'modbus-getter',
      server: 'fc-client',
      emptyMsgOnFail: false,
      delayOnStart: false,
      wires: [['fc-helper'], []],
      ...getterConfig
    })

    await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const getter = getTestNode(helper, 'fc-getter')
    const pending = waitForHelper(helper, 'fc-helper', assertFn)

    setTimeout(() => getter.receive(triggerPayload || { payload: 'trigger' }), 300)
    await pending
  }

  describe('Getter Read Operations', function () {
    it('should read coils with getter node (FC1)', function () {
      return runGetterTest(
        { name: 'Getter Coils', dataType: 'Coil', adr: '0', quantity: '10', unitid: '1' },
        null,
        (msg) => assertGetterRead(msg, 1, 10, 0)
      )
    })

    it('should read discrete inputs with getter node (FC2)', function () {
      return runGetterTest(
        { name: 'Getter Discrete', dataType: 'Input', adr: '0', quantity: '8', unitid: '1' },
        null,
        (msg) => assertGetterRead(msg, 2, 8, 0)
      )
    })

    it('should read holding registers with getter node (FC3)', function () {
      return runGetterTest(
        { name: 'Getter Holding', dataType: 'HoldingRegister', adr: '0', quantity: '5', unitid: '1' },
        null,
        (msg) => assertGetterRead(msg, 3, 5, 0)
      )
    })

    it('should read input registers with getter node (FC4)', function () {
      return runGetterTest(
        { name: 'Getter Input', dataType: 'InputRegister', adr: '0', quantity: '4', unitid: '1' },
        null,
        (msg) => assertGetterRead(msg, 4, 4, 0)
      )
    })

    it('should handle getter errors gracefully', async function () {
      globalTestHelper.cleanup()
      globalTestHelper.setupMocks({
        mockModbusSerial: true,
        mockNetConnections: true,
        mockTimers: false
      })

      const { flow } = await buildServerClientFlow({
        id: 'fc-getter',
        type: 'modbus-getter',
        name: 'Getter Error',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '5',
        unitid: '1',
        server: 'fc-client',
        emptyMsgOnFail: true,
        delayOnStart: false,
        wires: [[], ['fc-error-helper']]
      })
      flow.push({ id: 'fc-error-helper', type: 'helper', wires: [] })

      await deployModbusFlow(helper, coreModbusNodes, flow)

      const client = getTestNode(helper, 'fc-client')
      const getter = getTestNode(helper, 'fc-getter')
      client.client.readHoldingRegisters = function () {
        return Promise.reject(new Error('Simulated read error'))
      }

      const pending = waitForHelper(helper, 'fc-error-helper', (msg) => {
        assert.strictEqual(msg.payload, '')
        assert(msg.error)
      })

      setTimeout(() => getter.receive({ payload: 'trigger' }), 300)
      await pending
    })

    it('should preserve message properties when configured', function () {
      return runGetterTest(
        {
          name: 'Getter Keep Props',
          dataType: 'HoldingRegister',
          adr: '0',
          quantity: '5',
          unitid: '1',
          keepMsgProperties: true
        },
        { payload: 'get', topic: 'test/getter', customProp: 'preserved' },
        (msg) => {
          assert.strictEqual(msg.topic, 'test/getter')
          assert.strictEqual(msg.customProp, 'preserved')
          assertGetterRead(msg, 3, 5, 0)
        }
      )
    })

    it('should show status activities when enabled', function () {
      return runGetterTest(
        {
          name: 'Getter Status',
          dataType: 'HoldingRegister',
          adr: '0',
          quantity: '5',
          unitid: '1',
          showStatusActivities: true
        },
        null,
        (msg) => {
          assert(Array.isArray(msg.payload))
          const getter = getTestNode(helper, 'fc-getter')
          assert.strictEqual(getter.showStatusActivities, true)
        }
      )
    })

    it('should handle multiple sequential reads', async function () {
      const { flow } = await buildServerClientFlow({
        id: 'fc-getter',
        type: 'modbus-getter',
        name: 'Getter Batch',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '5',
        unitid: '1',
        server: 'fc-client',
        emptyMsgOnFail: false,
        delayOnStart: false,
        wires: [['fc-helper'], []]
      })

      await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

      const getterNode = getTestNode(helper, 'fc-getter')
      let count = 0

      const pending = new Promise((resolve, reject) => {
        const helperNode = getTestNode(helper, 'fc-helper')
        const timer = setTimeout(() => reject(new Error('timeout waiting for batch reads')), 15000)
        helperNode.on('input', (msg) => {
          try {
            assertGetterRead(msg, 3, 5, 0)
            count++
            if (count >= 3) {
              clearTimeout(timer)
              resolve()
            }
          } catch (err) {
            clearTimeout(timer)
            reject(err)
          }
        })
      })

      for (let i = 0; i < 3; i++) {
        setTimeout(() => getterNode.receive({ payload: 'batch-' + i }), 300 + i * 200)
      }
      await pending
    })
  })
})
