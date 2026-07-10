'use strict'

const fs = require('fs')
const path = require('path')
const {
  baseServer,
  setupFcMocks,
  deployFcFlow,
  waitForHelper,
  waitForTestNode,
  assertWriteFc,
  assertReadFc,
  getTestNode
} = require('./fc-e2e-helper')
const { getPort, deployModbusFlow } = require('./test-helper-extensions')

const CERT_DIR = path.join(__dirname, '../certificates')

let cachedCertificates = null

function loadTestCertificates () {
  if (cachedCertificates) {
    return cachedCertificates
  }
  cachedCertificates = {
    ca: fs.readFileSync(path.join(CERT_DIR, 'ca-cert.pem'), 'utf8'),
    serverKey: fs.readFileSync(path.join(CERT_DIR, 'server-key.pem'), 'utf8'),
    serverCert: fs.readFileSync(path.join(CERT_DIR, 'server-cert.pem'), 'utf8'),
    clientKey: fs.readFileSync(path.join(CERT_DIR, 'client-key.pem'), 'utf8'),
    clientCert: fs.readFileSync(path.join(CERT_DIR, 'client-cert.pem'), 'utf8')
  }
  return cachedCertificates
}

function baseTlsServer (id, port, certs) {
  return {
    id,
    type: 'modbus-server-tls',
    name: 'TLS Test Server',
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
  }
}

/**
 * v6 integrated client — tlsEnabled on modbus-client (preferred over legacy modbus-client-tls).
 */
function baseTlsClient (id, port, certs) {
  return {
    id,
    type: 'modbus-client',
    name: 'TLS Test Client',
    clienttype: 'tcp',
    tcpHost: '127.0.0.1',
    tcpPort: String(port),
    tlsEnabled: true,
    tlsRejectUnauthorized: false,
    tlsServername: '127.0.0.1',
    tlsSecureProtocol: 'TLSv1_3_method',
    tlsCheckServerIdentity: false,
    privateKey: certs.clientKey,
    certificate: certs.clientCert,
    ca: certs.ca,
    unit_id: 1,
    commandDelay: 10,
    clientTimeout: 1000,
    reconnectOnTimeout: false
  }
}

async function buildTlsServerClientFlow (nodeConfig, options = {}) {
  const certs = options.certificates || loadTestCertificates()
  const port = await getPort()
  const useTlsServer = options.useTlsServer !== false

  const serverNode = useTlsServer
    ? baseTlsServer('fc-server', port, certs)
    : baseServer('fc-server', port)

  return {
    port,
    certificates: certs,
    flow: [
      serverNode,
      baseTlsClient('fc-client', port, certs),
      nodeConfig,
      { id: 'fc-helper', type: 'helper', wires: [] }
    ]
  }
}

async function deployTlsFcFlow (helper, nodes, globalTestHelper, flow) {
  await setupFcMocks(globalTestHelper)
  await deployModbusFlow(helper, nodes, flow)
}

module.exports = {
  CERT_DIR,
  loadTestCertificates,
  baseTlsServer,
  baseTlsClient,
  buildTlsServerClientFlow,
  deployTlsFcFlow,
  waitForHelper,
  waitForTestNode,
  assertWriteFc,
  assertReadFc,
  getTestNode
}
