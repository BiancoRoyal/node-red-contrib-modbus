'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const clientNode = require('../../src/modbus-client')
const readNode = require('../../src/modbus-read')
const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')
const { globalTestHelper } = require('../helper/mocha-global-setup')
const { getPort, getTestNode, deployModbusFlow } = require('../helper/test-helper-extensions')
const { loadTestCertificates } = require('../helper/tls-e2e-helper')

helper.init(require.resolve('node-red'))

const nodes = [serverNode, clientNode, readNode]

describe('modbus-client settings flow', function () {
  this.timeout(30000)

  before(function () {
    globalTestHelper.setupMocks({
      mockModbusSerial: true,
      mockNetConnections: true,
      mockTimers: false
    })
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  it('should apply TLS settings from flow config after deploy', async function () {
    const certs = loadTestCertificates()
    const port = await getPort()
    const flow = [
      {
        id: 'srv',
        type: 'modbus-server',
        hostname: '127.0.0.1',
        serverPort: String(port),
        responseDelay: 10,
        delayUnit: 'ms',
        coilsBufferSize: 4096,
        holdingBufferSize: 4096,
        inputBufferSize: 4096,
        discreteBufferSize: 4096,
        showErrors: false
      },
      {
        id: 'cli',
        type: 'modbus-client',
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
        clientTimeout: 2000,
        reconnectOnTimeout: false
      },
      {
        id: 'read',
        type: 'modbus-read',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '1',
        rate: '3600',
        rateUnit: 's',
        server: 'cli',
        wires: [[], []]
      }
    ]

    await deployModbusFlow(helper, nodes, flow)
    const client = getTestNode(helper, 'cli')

    assert.strictEqual(client.tlsEnabled, true)
    assert(client.tlsOptions)
    assert.strictEqual(client.tlsOptions.rejectUnauthorized, false)
    assert.strictEqual(client.tlsOptions.secureProtocol, 'TLSv1_2_method')
    assert.strictEqual(client.clientTimeout, 2000)
  })

  it('should initialize resilience modules only when enabled in flow config', async function () {
    const port = await getPort()
    const flow = [
      {
        id: 'srv',
        type: 'modbus-server',
        hostname: '127.0.0.1',
        serverPort: String(port),
        responseDelay: 10,
        delayUnit: 'ms',
        coilsBufferSize: 4096,
        holdingBufferSize: 4096,
        inputBufferSize: 4096,
        discreteBufferSize: 4096,
        showErrors: false
      },
      {
        id: 'cli-resilience',
        type: 'modbus-client',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: String(port),
        unit_id: 1,
        reconnectOnTimeout: false,
        circuitBreakerEnabled: true,
        failureThreshold: 7,
        retryEnabled: true,
        maxRetries: 4,
        connectionPoolEnabled: true,
        maxConnections: 12,
        enableDiagnostics: true,
        metricsInterval: 15000
      }
    ]

    await deployModbusFlow(helper, nodes, flow)
    const client = getTestNode(helper, 'cli-resilience')

    assert(client.circuitBreaker, 'circuit breaker should be created when enabled')
    assert.strictEqual(client.circuitBreaker.failureThreshold, 7)
    assert(client.retryHandler, 'retry handler should be created when enabled')
    assert.strictEqual(client.retryHandler.maxRetries, 4)
    assert(client.connectionPool, 'connection pool should be created when enabled')
    assert.strictEqual(client.connectionPool.maxConnections, 12)
    assert(client.diagnostics, 'diagnostics should be created when enabled')
    assert.strictEqual(client.diagnostics.metricsInterval, 15000)
  })

  it('should map legacy modbus-client-tls resilience field names', async function () {
    const port = await getPort()
    const flow = [
      {
        id: 'srv',
        type: 'modbus-server',
        hostname: '127.0.0.1',
        serverPort: String(port),
        responseDelay: 10,
        delayUnit: 'ms',
        coilsBufferSize: 4096,
        holdingBufferSize: 4096,
        inputBufferSize: 4096,
        discreteBufferSize: 4096,
        showErrors: false
      },
      {
        id: 'cli-legacy',
        type: 'modbus-client-tls',
        tcpHost: '127.0.0.1',
        tcpPort: String(port),
        unit_id: 0,
        reconnectOnTimeout: false,
        retryHandlerEnabled: true,
        retryHandlerMaxRetries: 6,
        circuitBreakerEnabled: true,
        circuitBreakerFailureThreshold: 9
      }
    ]

    await deployModbusFlow(helper, nodes, flow)
    const client = getTestNode(helper, 'cli-legacy')

    assert.strictEqual(client.tlsEnabled, true)
    assert(client.retryHandler)
    assert.strictEqual(client.retryHandler.maxRetries, 6)
    assert(client.circuitBreaker)
    assert.strictEqual(client.circuitBreaker.failureThreshold, 9)
  })

  it('should apply serial connection delay from flow config', async function () {
    const flow = [
      {
        id: 'cli-serial',
        type: 'modbus-client',
        clienttype: 'serial',
        serialPort: '/dev/ttyUSB0',
        serialType: 'RTU-BUFFERD',
        serialBaudrate: 9600,
        serialDatabits: 8,
        serialStopbits: 1,
        serialParity: 'none',
        serialConnectionDelay: 750,
        unit_id: 1,
        reconnectOnTimeout: false
      }
    ]

    await deployModbusFlow(helper, [clientNode], flow)
    const client = getTestNode(helper, 'cli-serial')

    assert.strictEqual(client.serialConnectionDelay, 750)
    assert.strictEqual(client.tlsEnabled, false)
  })
})
