/**
 * E2E Tests for modbus-client-tls node with TLS/SSL support
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')

const clientTlsNode = require('../../src/modbus-client-tls')
const serverTlsNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls')
const readNode = require('../../src/modbus-read')
const writeNode = require('../../src/modbus-write')

const testFlows = require('./flows/modbus-tls-e2e-flows')
const { getTestNode, deployModbusFlow, getPort, assignModbusTcpPorts } = require('../helper/test-helper-extensions')
const { globalTestHelper } = require('../helper/mocha-global-setup')

helper.init(require.resolve('node-red'))

const ALL_TLS_NODES = [serverTlsNode, clientTlsNode, readNode, writeNode]

describe('Modbus Client TLS E2E Tests', function () {
  this.timeout(30000)

  before(function () {
    globalTestHelper.cleanup()
    globalTestHelper.setupMocks({
      mockModbusSerial: true,
      mockNetConnections: true,
      mockTimers: false
    })
  })

  function runFlowTest (flowTemplate, testFn, flowOptions) {
    return async function () {
      let flow = flowTemplate
      const needsPort = flowTemplate.some((n) =>
        n.type === 'modbus-server' || n.type === 'modbus-server-tls'
      )
      if (needsPort) {
        const port = await getPort()
        flow = assignModbusTcpPorts(JSON.parse(JSON.stringify(flowTemplate)), port)
      }
      await deployModbusFlow(helper, ALL_TLS_NODES, flow, flowOptions)
      await new Promise((resolve, reject) => {
        try {
          testFn((err) => (err ? reject(err) : resolve()))
        } catch (e) {
          reject(e)
        }
      })
    }
  }

  describe('TLS Connection Tests', function () {
    it('should load TLS client node with basic configuration', runFlowTest(
      testFlows.basicTlsClientFlow,
      (finish) => {
        const tlsClient = getTestNode(helper, 'tls-client')
        assert(tlsClient !== null && tlsClient !== undefined)
        assert.strictEqual(tlsClient.name, 'ModbusTLSClient')
        assert.strictEqual(tlsClient.clienttype, 'tcp')
        assert.strictEqual(tlsClient.tcpType, 'TLS')
        finish()
      }
    ))

    it('should establish TLS connection with server', runFlowTest(
      testFlows.tlsClientServerFlow,
      (finish) => {
        const tlsClient = getTestNode(helper, 'tls-client')
        const tlsServer = getTestNode(helper, 'tls-server')
        assert(tlsClient !== null)
        assert(tlsServer !== null)
        assert.strictEqual(tlsClient.clienttype, 'tcp')
        assert.strictEqual(tlsClient.tcpType, 'TLS')
        finish()
      }
    ))

    it('should handle TLS certificate configuration', runFlowTest(
      testFlows.tlsWithCertificatesFlow,
      (finish) => {
        const tlsClient = getTestNode(helper, 'tls-client-cert')
        assert(tlsClient !== null)
        assert.strictEqual(tlsClient.name, 'TLSClientWithCert')
        assert.strictEqual(tlsClient.tlsOptions.rejectUnauthorized, false)
        assert.strictEqual(tlsClient.tlsOptions.ca !== undefined, true)
        finish()
      }
    ))

    it('should read data over TLS connection', runFlowTest(
      testFlows.tlsReadFlow,
      (finish) => {
        const readNodeInstance = getTestNode(helper, 'tls-read')
        const tlsClient = getTestNode(helper, 'tls-client')

        assert(readNodeInstance !== null)
        assert(tlsClient !== null)
        assert.ok(tlsClient.registeredNodeList['tls-read'])
        assert.strictEqual(tlsClient.registeredNodeList['tls-read'].id, 'tls-read')
        assert.strictEqual(tlsClient.tcpType, 'TLS')
        assert.strictEqual(typeof readNodeInstance.receive, 'function')
        finish()
      }
    ))

    it('should write data over TLS connection', runFlowTest(
      testFlows.tlsWriteFlow,
      (finish) => {
        const writeNodeInstance = getTestNode(helper, 'tls-write')
        const tlsClient = getTestNode(helper, 'tls-client')

        assert(writeNodeInstance !== null)
        assert(tlsClient !== null)
        assert.ok(tlsClient.registeredNodeList['tls-write'])
        assert.strictEqual(tlsClient.registeredNodeList['tls-write'].id, 'tls-write')
        assert.strictEqual(tlsClient.tcpType, 'TLS')
        assert.strictEqual(typeof writeNodeInstance.receive, 'function')
        finish()
      }
    ))

    it('should handle TLS connection errors gracefully', runFlowTest(
      testFlows.tlsErrorHandlingFlow,
      (finish) => {
        const tlsClient = getTestNode(helper, 'tls-client-error')
        assert(tlsClient !== null)

        setTimeout(function () {
          assert(tlsClient.actualServiceState !== 'CONNECTED')
          finish()
        }, 2000)
      }
    ))

    it('should reconnect on TLS connection loss', runFlowTest(
      testFlows.tlsReconnectFlow,
      (finish) => {
        const tlsClient = getTestNode(helper, 'tls-client-reconnect')
        const tlsServer = getTestNode(helper, 'tls-server-reconnect')

        assert(tlsClient !== null)
        assert(tlsServer !== null)

        setTimeout(function () {
          if (tlsClient.client) {
            tlsClient.client.close()
          }

          setTimeout(function () {
            assert.strictEqual(tlsClient.reconnectOnTimeout, true)
            finish()
          }, 2000)
        }, 1000)
      },
      { preserveReconnect: true }
    ))

    it('should validate TLS options configuration', runFlowTest(
      testFlows.tlsOptionsValidationFlow,
      (finish) => {
        const tlsClient = getTestNode(helper, 'tls-client-options')
        assert(tlsClient !== null)
        assert.strictEqual(tlsClient.tlsOptions.rejectUnauthorized, true)
        assert.strictEqual(tlsClient.tlsOptions.secureProtocol, 'TLSv1_2_method')
        assert.strictEqual(tlsClient.tlsOptions.ciphers !== undefined, true)
        finish()
      }
    ))
  })
})
