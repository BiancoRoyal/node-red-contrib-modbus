'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const ModbusRTU = require('@plus4nodered/node-modbus')
const serverTlsNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls')
const clientNode = require('../../src/modbus-client')
const readNode = require('../../src/modbus-read')
const { getPort, getTestNode, bootstrapModbusTestNodes, waitForFlowsStarted } = require('../helper/test-helper-extensions')
const { loadTestCertificates } = require('../helper/tls-e2e-helper')

helper.init(require.resolve('node-red'))

const integrationNodes = [serverTlsNode, clientNode, readNode]
const clientOnlyNodes = [clientNode, readNode]

async function waitForTlsClientReady (client, timeoutMs = 45000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const state = client.actualServiceState && client.actualServiceState.value
    const open = client.client && client.client.isOpen === true
    if (state === 'activated' && open) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  const state = client.actualServiceState && client.actualServiceState.value
  const open = client.client && client.client.isOpen
  throw new Error(`TLS client not ready (state=${state}, isOpen=${open})`)
}

async function deployTlsIntegrationFlow (flow, nodes = integrationNodes) {
  await bootstrapModbusTestNodes(helper, nodes)

  const serverBootstrap = flow.filter((node) => node.type === 'modbus-server-tls')
  if (serverBootstrap.length > 0) {
    await helper.setFlows(serverBootstrap)
    try {
      await waitForFlowsStarted(helper)
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
    await new Promise((resolve) => setTimeout(resolve, 800))
  }

  await helper.setFlows(flow)
  try {
    await waitForFlowsStarted(helper)
  } catch (e) {
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
}

function waitForHelperRead (helperId, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const helperNode = getTestNode(helper, helperId)
    if (!helperNode) {
      reject(new Error(`helper node ${helperId} not found`))
      return
    }
    const timer = setTimeout(() => {
      reject(new Error('timeout waiting for FC3 read payload'))
    }, timeoutMs)
    helperNode.on('input', (msg) => {
      if (!Array.isArray(msg.payload)) {
        return
      }
      clearTimeout(timer)
      resolve(msg)
    })
  })
}

async function startSdkTlsModbusServer (port, certs) {
  const vector = {
    getHoldingRegister: (addr) => 100 + addr,
    setRegister: () => {}
  }
  const server = new ModbusRTU.ServerTCPSecure(vector, {
    host: '127.0.0.1',
    port,
    unitID: 1,
    tls: {
      key: certs.serverKey,
      cert: certs.serverCert,
      ca: certs.ca,
      rejectUnauthorized: false
    }
  })

  await new Promise((resolve, reject) => {
    server.on('initialized', resolve)
    server.on('serverError', reject)
    setTimeout(() => reject(new Error('SDK TLS server init timeout')), 10000)
  })

  return server
}

function buildTlsIntegrationFlow (port, certs, options = {}) {
  const includeServerNode = options.includeServerNode !== false
  const flow = []

  if (includeServerNode) {
    flow.push({
      id: 'fc-server',
      type: 'modbus-server-tls',
      name: 'Integration TLS Server',
      hostname: '127.0.0.1',
      serverPort: String(port),
      responseDelay: 10,
      delayUnit: 'ms',
      coilsBufferSize: 4096,
      holdingBufferSize: 4096,
      inputBufferSize: 4096,
      discreteBufferSize: 4096,
      privateKey: certs.serverKey,
      certificate: certs.serverCert,
      ca: certs.ca,
      rejectUnauthorized: false,
      showErrors: false
    })
  }

  flow.push(
    {
      id: 'fc-client',
      type: 'modbus-client',
      name: 'Integration TLS Client',
      clienttype: 'tcp',
      tcpHost: '127.0.0.1',
      tcpPort: String(port),
      tlsEnabled: true,
      tlsRejectUnauthorized: false,
      tlsServername: '127.0.0.1',
      tlsSecureProtocol: 'TLSv1_2_method',
      tlsCheckServerIdentity: false,
      privateKey: certs.clientKey,
      certificate: certs.clientCert,
      ca: certs.ca,
      unit_id: 1,
      commandDelay: 10,
      clientTimeout: 15000,
      reconnectOnTimeout: false
    },
    {
      id: 'fc-read',
      type: 'modbus-read',
      name: 'Integration TLS Read',
      dataType: 'HoldingRegister',
      adr: '0',
      quantity: '2',
      rate: '3600',
      rateUnit: 's',
      server: 'fc-client',
      useIOFile: false,
      emptyMsgOnFail: false,
      delayOnStart: false,
      wires: [['fc-helper'], []]
    },
    { id: 'fc-helper', type: 'helper', wires: [] }
  )

  return flow
}

describe('TLS integration (deploy + options)', function () {
  this.timeout(90000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    if (this.sdkTlsServer && this.sdkTlsServer._server) {
      await new Promise((resolve) => this.sdkTlsServer._server.close(resolve))
      this.sdkTlsServer = null
    }
    await helper.setFlows([])
  })

  it('should deploy tlsEnabled client against modbus-server-tls with PEM fixtures', async function () {
    const certs = loadTestCertificates()
    const port = await getPort()
    const flow = buildTlsIntegrationFlow(port, certs)

    await deployTlsIntegrationFlow(flow)

    const client = getTestNode(helper, 'fc-client')
    const server = getTestNode(helper, 'fc-server')
    const read = getTestNode(helper, 'fc-read')

    assert(client !== null && client !== undefined)
    assert(server !== null && server !== undefined)
    assert(read !== null && read !== undefined)
    assert.strictEqual(client.tlsEnabled, true)
    assert(client.tlsOptions)
    assert(client.tlsOptions.ca)
    assert.strictEqual(server.type, 'modbus-server-tls')
  })

  it('should complete TLS handshake and read holding registers (FC3)', async function () {
    const certs = loadTestCertificates()
    const port = await getPort()
    this.sdkTlsServer = await startSdkTlsModbusServer(port, certs)

    const flow = buildTlsIntegrationFlow(port, certs, { includeServerNode: false })
    await deployTlsIntegrationFlow(flow, clientOnlyNodes)

    const client = getTestNode(helper, 'fc-client')
    const read = getTestNode(helper, 'fc-read')
    assert(client)
    assert(read)

    const pending = waitForHelperRead('fc-helper')

    await waitForTlsClientReady(client)
    assert.strictEqual(client.client.isOpen, true)
    assert(client.tlsOptions && client.tlsOptions.ca)

    read.modbusPollingRead()

    const msg = await pending
    assert(msg.payload.length >= 1, 'expected at least one register value')
    assert.strictEqual(msg.payload[0], 100)
    assert.strictEqual(msg.payload[1], 101)
  })
})
