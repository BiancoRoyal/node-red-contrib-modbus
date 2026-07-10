/**
 * E2E smoke: modbus-queue-info against a live client queue
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const allModbusTestNodes = require('../helper/all-modbus-test-nodes')
const { globalTestHelper } = require('../helper/mocha-global-setup')
const {
  deployFcFlow,
  waitForTestNode,
  buildServerClientFlow
} = require('../helper/fc-e2e-helper')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls') &&
  n !== require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls'))

describe('Modbus Queue Info E2E Tests', function () {
  this.timeout(20000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  it('should return queue metadata for the configured client', async function () {
    const { flow } = await buildServerClientFlow({
      id: 'fc-read',
      type: 'modbus-read',
      name: 'Queue Read',
      dataType: 'HoldingRegister',
      adr: '0',
      quantity: '1',
      rate: '3600',
      rateUnit: 's',
      server: 'fc-client',
      useIOFile: false,
      emptyMsgOnFail: false,
      wires: [[], []]
    })

    flow.push({
      id: 'fc-queue-info',
      type: 'modbus-queue-info',
      name: 'Queue Info',
      server: 'fc-client',
      unitid: 0,
      queueReadIntervalTime: '3600',
      lowLowLevel: 10,
      lowLevel: 20,
      highLevel: 30,
      highHighLevel: 40,
      wires: [['fc-helper']]
    })

    await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const queueInfo = await waitForTestNode(helper, 'fc-queue-info')
    const helperNode = await waitForTestNode(helper, 'fc-helper')

    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout waiting for queue info')), 10000)
      helperNode.on('input', (msg) => {
        clearTimeout(timer)
        resolve(msg)
      })
      queueInfo.receive({ payload: { resetQueue: false, queue: '' } })
    })

    assert(Array.isArray(result.payload.queue))
    assert(Object.prototype.hasOwnProperty.call(result.payload, 'queueEnabled'))
  })
})
