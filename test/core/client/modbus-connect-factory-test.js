'use strict'

const assert = require('assert')
const sinon = require('sinon')
const {
  connectModbusTcpClient,
  warnTlsUnsupportedForTcpType
} = require('../../../src/core/client/modbus-connect-factory')

describe('modbus-connect-factory', function () {
  afterEach(function () {
    sinon.restore()
  })

  it('should use connectTCPSecure when tlsEnabled with DEFAULT tcpType', async function () {
    const client = {
      connectTCPSecure: sinon.stub().resolves(),
      connectTCP: sinon.stub().resolves()
    }
    const node = {
      clienttype: 'tcp',
      tcpType: 'DEFAULT',
      tcpHost: '127.0.0.1',
      tcpPort: 502,
      tlsEnabled: true,
      tlsOptions: { key: 'k', cert: 'c', ca: 'ca' }
    }
    const setTCPConnectionOptions = sinon.stub().resolves()
    const hooks = {
      verboseLog: sinon.stub(),
      modbusTcpErrorHandling: sinon.stub(),
      setTCPConnectionOptions,
      setTCPConnected: sinon.stub()
    }

    await connectModbusTcpClient(node, client, hooks)

    sinon.assert.calledOnce(client.connectTCPSecure)
    sinon.assert.calledWith(client.connectTCPSecure, '127.0.0.1', sinon.match({
      port: 502,
      tls: node.tlsOptions
    }))
    sinon.assert.notCalled(client.connectTCP)
  })

  it('should use connectTCP when tls is disabled', async function () {
    const client = {
      connectTCPSecure: sinon.stub().resolves(),
      connectTCP: sinon.stub().resolves()
    }
    const node = {
      clienttype: 'tcp',
      tcpType: 'DEFAULT',
      tcpHost: '127.0.0.1',
      tcpPort: 502,
      tlsEnabled: false
    }
    const hooks = {
      verboseLog: sinon.stub(),
      modbusTcpErrorHandling: sinon.stub(),
      setTCPConnectionOptions: sinon.stub().resolves(),
      setTCPConnected: sinon.stub()
    }

    await connectModbusTcpClient(node, client, hooks)

    sinon.assert.calledOnce(client.connectTCP)
    sinon.assert.notCalled(client.connectTCPSecure)
  })

  it('should warn and use plain Telnet when tlsEnabled on TELNET tcpType', async function () {
    const client = {
      connectTelnet: sinon.stub().resolves()
    }
    const warnings = []
    const node = {
      clienttype: 'tcp',
      tcpType: 'TELNET',
      tcpHost: '127.0.0.1',
      tcpPort: 502,
      tlsEnabled: true,
      tlsOptions: { ca: 'x' },
      warn: (msg) => warnings.push(msg)
    }
    const hooks = {
      verboseLog: sinon.stub(),
      modbusTcpErrorHandling: sinon.stub(),
      setTCPConnectionOptions: sinon.stub().resolves(),
      setTCPConnected: sinon.stub()
    }

    await connectModbusTcpClient(node, client, hooks)

    assert.strictEqual(warnings.length, 1)
    sinon.assert.calledOnce(client.connectTelnet)
  })

  it('should warn only once per node for unsupported TLS tcp types', function () {
    const warnings = []
    const node = { warn: (msg) => warnings.push(msg) }
    warnTlsUnsupportedForTcpType(node, 'C701')
    warnTlsUnsupportedForTcpType(node, 'C701')
    assert.strictEqual(warnings.length, 1)
  })
})
