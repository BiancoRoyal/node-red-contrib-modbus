/**
 * E2E smoke: modbus-client registers I/O nodes (connection-flow pattern)
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
  assertReadFc,
  buildServerClientFlow
} = require('../helper/fc-e2e-helper')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls') &&
  n !== require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls'))

describe('Modbus Client Connection E2E Tests', function () {
  this.timeout(20000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  it('should register read node with client and complete FC3 poll', async function () {
    const { flow } = await buildServerClientFlow({
      id: 'fc-read',
      type: 'modbus-read',
      name: 'Connection Read',
      dataType: 'HoldingRegister',
      adr: '0',
      quantity: '4',
      rate: '3600',
      rateUnit: 's',
      server: 'fc-client',
      useIOFile: false,
      emptyMsgOnFail: false,
      wires: [['fc-helper'], []]
    })

    await deployFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const client = await waitForTestNode(helper, 'fc-client')
    const readNode = await waitForTestNode(helper, 'fc-read')

    assert(client.registeredNodeList['fc-read'], 'read node should register with client')
    assert.strictEqual(client.registeredNodeList['fc-read'].id, 'fc-read')

    const pending = waitForHelper(helper, 'fc-helper', (msg) => {
      assertReadFc(msg, 3, 4)
    })

    readNode.modbusPollingRead()
    await pending
  })
})
