/**
 * TLS FC matrix (Mock-Tier) — tlsEnabled client across Read/Write/Getter/Flex nodes
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const allModbusTestNodes = require('../helper/all-modbus-test-nodes')
const { globalTestHelper } = require('../helper/mocha-global-setup')
const {
  buildTlsOptions
} = require('../../src/core/client/modbus-tls-options')
const {
  buildTlsServerClientFlow,
  deployTlsFcFlow,
  waitForHelper,
  waitForTestNode,
  assertReadFc,
  assertWriteFc,
  loadTestCertificates,
  getTestNode
} = require('../helper/tls-e2e-helper')
const { deployModbusFlow } = require('../helper/test-helper-extensions')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls'))

describe('Modbus FC TLS Matrix E2E (Mock-Tier)', function () {
  this.timeout(25000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  it('should build tlsOptions on deployed tlsEnabled client', async function () {
    const certs = loadTestCertificates()
    const { flow } = await buildTlsServerClientFlow({
      id: 'fc-read',
      type: 'modbus-read',
      name: 'TLS Read',
      dataType: 'HoldingRegister',
      adr: '0',
      quantity: '1',
      rate: '3600',
      rateUnit: 's',
      server: 'fc-client',
      wires: [[], []]
    }, { certificates: certs })

    await deployTlsFcFlow(helper, coreModbusNodes, globalTestHelper, flow)

    const client = await waitForTestNode(helper, 'fc-client')
    assert.strictEqual(client.tlsEnabled, true)
    const opts = buildTlsOptions({
      config: { tlsEnabled: true, privateKey: certs.clientKey, certificate: certs.clientCert, ca: certs.ca },
      tcpHost: client.tcpHost
    })
    assert(opts.ca)
    assert(opts.key)
  })

  describe('Read TLS', function () {
    async function runTlsRead (dataType, fc, quantity) {
      const { flow } = await buildTlsServerClientFlow({
        id: 'fc-read',
        type: 'modbus-read',
        name: `TLS Read FC${fc}`,
        dataType,
        adr: '0',
        quantity: String(quantity),
        rate: '3600',
        rateUnit: 's',
        server: 'fc-client',
        useIOFile: false,
        emptyMsgOnFail: false,
        wires: [['fc-helper'], []]
      })
      await deployTlsFcFlow(helper, coreModbusNodes, globalTestHelper, flow)
      const readNode = await waitForTestNode(helper, 'fc-read')
      const pending = waitForHelper(helper, 'fc-helper', (msg) => assertReadFc(msg, fc, quantity))
      readNode.modbusPollingRead()
      await pending
    }

    it('FC1 coils', () => runTlsRead('Coil', 1, 10))
    it('FC2 discrete inputs', () => runTlsRead('Input', 2, 8))
    it('FC3 holding registers', () => runTlsRead('HoldingRegister', 3, 5))
    it('FC4 input registers', () => runTlsRead('InputRegister', 4, 4))
  })

  describe('Write TLS', function () {
    async function runTlsWrite (dataType, fc, payload) {
      const { flow } = await buildTlsServerClientFlow({
        id: 'fc-write',
        type: 'modbus-write',
        name: `TLS Write FC${fc}`,
        dataType,
        adr: '0',
        quantity: String(Array.isArray(payload) ? payload.length : 1),
        server: 'fc-client',
        emptyMsgOnFail: false,
        wires: [['fc-helper'], []]
      })
      await deployTlsFcFlow(helper, coreModbusNodes, globalTestHelper, flow)
      const writeNode = await waitForTestNode(helper, 'fc-write')
      const pending = waitForHelper(helper, 'fc-helper', (msg) => assertWriteFc(msg, fc))
      setTimeout(() => writeNode.receive({ payload }), 300)
      await pending
    }

    it('FC5 single coil', () => runTlsWrite('Coil', 5, true))
    it('FC6 single register', () => runTlsWrite('HoldingRegister', 6, 42))
    it('FC15 multiple coils', () => runTlsWrite('MCoils', 15, [true, false, true]))
    it('FC16 multiple registers', () => runTlsWrite('MHoldingRegisters', 16, [100, 200, 300]))
  })

  describe('Getter / Flex TLS', function () {
    it('getter FC3 via tlsEnabled client', async function () {
      const { flow } = await buildTlsServerClientFlow({
        id: 'fc-getter',
        type: 'modbus-getter',
        name: 'TLS Getter',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '5',
        unitid: '1',
        server: 'fc-client',
        emptyMsgOnFail: false,
        wires: [['fc-helper'], []]
      })
      await deployTlsFcFlow(helper, coreModbusNodes, globalTestHelper, flow)
      const getter = await waitForTestNode(helper, 'fc-getter')
      const pending = waitForHelper(helper, 'fc-helper', (msg) => {
        assert(Array.isArray(msg.payload))
        assert(msg.modbusRequest)
        assert.strictEqual(Number(msg.modbusRequest.fc), 3)
      })
      setTimeout(() => getter.receive({ payload: 'trigger' }), 300)
      await pending
    })

    it('flex-getter FC4 via tlsEnabled client', async function () {
      const { flow } = await buildTlsServerClientFlow({
        id: 'fc-flex-getter',
        type: 'modbus-flex-getter',
        name: 'TLS Flex Getter',
        server: 'fc-client',
        emptyMsgOnFail: false,
        wires: [['fc-helper'], []]
      })
      await deployTlsFcFlow(helper, coreModbusNodes, globalTestHelper, flow)
      const flexGetter = await waitForTestNode(helper, 'fc-flex-getter')
      const pending = waitForHelper(helper, 'fc-helper', (msg) => {
        assert(Array.isArray(msg.payload))
        assert.strictEqual(Number(msg.modbusRequest.fc), 4)
      })
      setTimeout(() => {
        flexGetter.receive({ payload: { fc: 4, unitid: 1, address: 0, quantity: 4 } })
      }, 300)
      await pending
    })

    it('flex-write FC5 error path with emptyMsgOnFail', async function () {
      const { flow } = await buildTlsServerClientFlow({
        id: 'fc-flex-write',
        type: 'modbus-flex-write',
        name: 'TLS Flex Write Error',
        server: 'fc-client',
        emptyMsgOnFail: true,
        wires: [[], ['fc-error-helper']]
      })
      flow.push({ id: 'fc-error-helper', type: 'helper', wires: [] })
      await deployModbusFlow(helper, coreModbusNodes, flow)
      const client = getTestNode(helper, 'fc-client')
      const flexWrite = await waitForTestNode(helper, 'fc-flex-write')
      client.client.writeCoil = function () {
        return Promise.reject(new Error('TLS flex write error'))
      }
      const pending = waitForHelper(helper, 'fc-error-helper', (msg) => {
        assert.strictEqual(msg.payload, '')
        assert(msg.error)
      })
      setTimeout(() => {
        flexWrite.receive({ payload: { fc: 5, unitid: 1, address: 0, quantity: 1, value: true } })
      }, 300)
      await pending
    })
  })
})
