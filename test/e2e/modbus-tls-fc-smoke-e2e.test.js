/**
 * Smoke: TLS-enabled modbus-client (tlsEnabled) + FC write via flex-write (Mock-Tier)
 */

'use strict'

const helper = require('node-red-node-test-helper')
const allModbusTestNodes = require('../helper/all-modbus-test-nodes')
const { globalTestHelper } = require('../helper/mocha-global-setup')
const {
  buildTlsServerClientFlow,
  deployTlsFcFlow,
  waitForHelper,
  waitForTestNode,
  assertWriteFc
} = require('../helper/tls-e2e-helper')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls'))

describe('Modbus TLS FC Smoke E2E', function () {
  this.timeout(20000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  it('should deploy tlsEnabled client with PEM fixtures', async function () {
    const { flow } = await buildTlsServerClientFlow({
      id: 'fc-flex-write',
      type: 'modbus-flex-write',
      name: 'TLS Flex Write',
      server: 'fc-client',
      emptyMsgOnFail: false,
      delayOnStart: false,
      wires: [['fc-helper'], []]
    })

    await deployTlsFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const client = await waitForTestNode(helper, 'fc-client')
    const isTls = client.tlsEnabled === true || client.type === 'modbus-client-tls'
    if (!isTls) {
      throw new Error('expected tlsEnabled modbus-client')
    }
  })

  it('should write single coil (FC5) through tlsEnabled client (mock tier)', async function () {
    const { flow } = await buildTlsServerClientFlow({
      id: 'fc-flex-write',
      type: 'modbus-flex-write',
      name: 'TLS Flex Write FC5',
      server: 'fc-client',
      emptyMsgOnFail: false,
      delayOnStart: false,
      wires: [['fc-helper'], []]
    })

    await deployTlsFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const flexWrite = await waitForTestNode(helper, 'fc-flex-write')
    const pending = waitForHelper(helper, 'fc-helper', (msg) => {
      assertWriteFc(msg, 5)
    })

    setTimeout(() => {
      flexWrite.receive({
        payload: { value: true, fc: 5, unitid: 1, address: 10, quantity: 1 }
      })
    }, 300)

    await pending
  })
})
