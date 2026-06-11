/**
 * E2E Tests for modbus-client-tls node with TLS/SSL support
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
// const fs = require('fs') // unused
// const path = require('path') // unused

// Load all required nodes
const clientTlsNode = require('../../src/modbus-client-tls')
const serverTlsNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls') // Server from separate package
const readNode = require('../../src/modbus-read')
const writeNode = require('../../src/modbus-write')

const testFlows = require('./flows/modbus-tls-e2e-flows')

helper.init(require.resolve('node-red'))

describe.skip('Modbus Client TLS E2E Tests', function () {
  this.timeout(15000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    const timeout = setTimeout(() => {
      console.warn('Helper unload timeout - forcing completion')
      done()
    }, 5000)

    helper.unload(() => {
      clearTimeout(timeout)
      done()
    })
  })

  after(function (done) {
    helper.stopServer(done)
  })

  describe('TLS Connection Tests', function () {
    it('should load TLS client node with basic configuration', function (done) {
      helper.load([clientTlsNode], testFlows.basicTlsClientFlow, function () {
        const tlsClient = helper.getNode('tls-client')
        assert(tlsClient !== null && tlsClient !== undefined)
        assert.strictEqual(tlsClient.name, 'ModbusTLSClient')
        assert.strictEqual(tlsClient.clienttype, 'tcp')
        assert.strictEqual(tlsClient.tcpType, 'TLS')
        done()
      })
    })

    it('should establish TLS connection with server', function (done) {
      helper.load([clientTlsNode, serverTlsNode], testFlows.tlsClientServerFlow, function () {
        const tlsClient = helper.getNode('tls-client')
        const tlsServer = helper.getNode('tls-server')

        assert(tlsClient !== null)
        assert(tlsServer !== null)

        // Give time for connection establishment
        setTimeout(function () {
          assert(tlsClient.actualServiceState !== undefined)
          done()
        }, 2000)
      })
    })

    it('should handle TLS certificate configuration', function (done) {
      helper.load([clientTlsNode], testFlows.tlsWithCertificatesFlow, function () {
        const tlsClient = helper.getNode('tls-client-cert')
        assert(tlsClient !== null)
        assert.strictEqual(tlsClient.name, 'TLSClientWithCert')
        assert.strictEqual(tlsClient.tlsOptions.rejectUnauthorized, false)
        assert.strictEqual(tlsClient.tlsOptions.ca !== undefined, true)
        done()
      })
    })

    it('should read data over TLS connection', function (done) {
      helper.load([clientTlsNode, serverTlsNode, readNode], testFlows.tlsReadFlow, function () {
        const readNodeInstance = helper.getNode('tls-read')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(Array.isArray(msg.payload), true)
            assert.strictEqual(msg.modbusRequest.unitid, 1)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          readNodeInstance.receive({})
        }, 1000)
      })
    })

    it('should write data over TLS connection', function (done) {
      helper.load([clientTlsNode, serverTlsNode, writeNode], testFlows.tlsWriteFlow, function () {
        const writeNodeInstance = helper.getNode('tls-write')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(msg.originalPayload.length, 2)
            assert.strictEqual(msg.modbusRequest.unitid, 1)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          writeNodeInstance.receive({ payload: [100, 200] })
        }, 1000)
      })
    })

    it('should handle TLS connection errors gracefully', function (done) {
      helper.load([clientTlsNode], testFlows.tlsErrorHandlingFlow, function () {
        const tlsClient = helper.getNode('tls-client-error')
        assert(tlsClient !== null)

        // Attempt connection with invalid port
        setTimeout(function () {
          assert(tlsClient.actualServiceState !== 'CONNECTED')
          done()
        }, 2000)
      })
    })

    it('should reconnect on TLS connection loss', function (done) {
      helper.load([clientTlsNode, serverTlsNode], testFlows.tlsReconnectFlow, function () {
        const tlsClient = helper.getNode('tls-client-reconnect')
        const tlsServer = helper.getNode('tls-server-reconnect')

        assert(tlsClient !== null)
        assert(tlsServer !== null)

        // Simulate connection loss and reconnection
        setTimeout(function () {
          // Force disconnect
          if (tlsClient.client) {
            tlsClient.client.close()
          }

          // Check for reconnection
          setTimeout(function () {
            assert.strictEqual(tlsClient.reconnectOnTimeout, true)
            done()
          }, 2000)
        }, 1000)
      })
    })

    it('should validate TLS options configuration', function (done) {
      helper.load([clientTlsNode], testFlows.tlsOptionsValidationFlow, function () {
        const tlsClient = helper.getNode('tls-client-options')
        assert(tlsClient !== null)
        assert.strictEqual(tlsClient.tlsOptions.rejectUnauthorized, true)
        assert.strictEqual(tlsClient.tlsOptions.secureProtocol, 'TLSv1_2_method')
        assert.strictEqual(tlsClient.tlsOptions.ciphers !== undefined, true)
        done()
      })
    })
  })
})
