'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const serverTlsNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls')
const clientNode = require('../../src/modbus-client')
const readNode = require('../../src/modbus-read')
const { getPort } = require('../helper/test-helper-extensions')
const { loadTestCertificates } = require('../helper/tls-e2e-helper')

helper.init(require.resolve('node-red'))

const integrationNodes = [serverTlsNode, clientNode, readNode]

function loadIntegrationFlow (flow) {
  return new Promise((resolve, reject) => {
    helper.load(integrationNodes, flow, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

describe('TLS integration (deploy + options)', function () {
  this.timeout(60000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  it('should deploy tlsEnabled client against modbus-server-tls with PEM fixtures', async function () {
    const certs = loadTestCertificates()
    const port = await getPort()
    const flow = [
      {
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
      },
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
        tlsSecureProtocol: 'TLSv1_3_method',
        tlsCheckServerIdentity: false,
        privateKey: certs.clientKey,
        certificate: certs.clientCert,
        ca: certs.ca,
        unit_id: 1,
        commandDelay: 10,
        clientTimeout: 1000,
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
        emptyMsgOnFail: true,
        wires: [[], []]
      }
    ]

    await loadIntegrationFlow(flow)

    const client = helper.getNode('fc-client')
    const server = helper.getNode('fc-server')
    const read = helper.getNode('fc-read')

    assert(client !== null && client !== undefined)
    assert(server !== null && server !== undefined)
    assert(read !== null && read !== undefined)
    assert.strictEqual(client.tlsEnabled, true)
    assert(client.tlsOptions)
    assert(client.tlsOptions.ca)
    assert.strictEqual(server.type, 'modbus-server-tls')
  })
})
