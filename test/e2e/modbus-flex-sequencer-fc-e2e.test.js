/**
 * E2E Tests for modbus-flex-sequencer — sequence FC reads
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
  buildServerClientFlow
} = require('../helper/fc-e2e-helper')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls') &&
  n !== require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls'))

describe('Modbus Flex Sequencer FC E2E Tests', function () {
  this.timeout(20000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  it('should process a valid FC3 sequence and return holding registers', async function () {
    const { flow } = await buildServerClientFlow({
      id: 'fc-sequencer',
      type: 'modbus-flex-sequencer',
      name: 'Flex Sequencer',
      sequences: [{ unitid: '1', fc: 'FC3', address: '0', quantity: '10' }],
      server: 'fc-client',
      emptyMsgOnFail: false,
      delayOnStart: false,
      showStatusActivities: false,
      wires: [['fc-helper'], []]
    })

    await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const sequencer = await waitForTestNode(helper, 'fc-sequencer')
    const pending = waitForHelper(helper, 'fc-helper', (msg) => {
      assert(Array.isArray(msg.payload))
      assert.strictEqual(msg.payload.length, 10)
      assert(msg.modbusRequest)
      assert.strictEqual(Number(msg.modbusRequest.fc), 3)
    })

    setTimeout(() => {
      sequencer.receive({
        payload: 'run',
        sequences: [{ unitid: 1, fc: 'FC3', address: 0, quantity: 10 }]
      })
    }, 300)

    await pending
  })

  it('should emit error output on sequence read failure when emptyMsgOnFail is true', async function () {
    const { flow } = await buildServerClientFlow({
      id: 'fc-sequencer',
      type: 'modbus-flex-sequencer',
      name: 'Flex Sequencer Error',
      sequences: [{ unitid: '1', fc: 'FC3', address: '0', quantity: '5' }],
      server: 'fc-client',
      emptyMsgOnFail: true,
      delayOnStart: false,
      wires: [[], ['fc-error-helper']]
    })
    flow.push({ id: 'fc-error-helper', type: 'helper', wires: [] })

    await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const client = await waitForTestNode(helper, 'fc-client')
    const sequencer = await waitForTestNode(helper, 'fc-sequencer')
    client.client.readHoldingRegisters = function () {
      return Promise.reject(new Error('Simulated sequencer read error'))
    }

    const pending = waitForHelper(helper, 'fc-error-helper', (msg) => {
      assert.strictEqual(msg.payload, '')
      assert(msg.error)
    })

    setTimeout(() => {
      sequencer.receive({
        payload: 'run',
        sequences: [{ unitid: 1, fc: 'FC3', address: 0, quantity: 5 }]
      })
    }, 300)

    await pending
  })
})
