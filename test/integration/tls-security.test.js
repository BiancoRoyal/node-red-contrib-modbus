'use strict'

const assert = require('assert')
const { buildTlsOptions, resolveRejectUnauthorized } = require('../../src/core/client/modbus-tls-options')

describe('TLS security integration', function () {
  it('should default rejectUnauthorized to true for production-style config', function () {
    assert.strictEqual(resolveRejectUnauthorized({ tlsRejectUnauthorized: true }, {}), true)
  })

  it('should build options with custom CA for mutual TLS', function () {
    const ca = '-----BEGIN CERTIFICATE-----\nCA\n-----END CERTIFICATE-----'
    const options = buildTlsOptions({
      config: {
        tlsEnabled: true,
        tlsRejectUnauthorized: true,
        ca
      },
      tcpHost: '127.0.0.1'
    })
    assert.strictEqual(options.ca, ca)
    assert.strictEqual(options.rejectUnauthorized, true)
  })

  it('should allow lab mode with rejectUnauthorized disabled', function () {
    const options = buildTlsOptions({
      config: {
        tlsEnabled: true,
        tlsRejectUnauthorized: false
      },
      tcpHost: '127.0.0.1'
    })
    assert.strictEqual(options.rejectUnauthorized, false)
  })

  it('should not include PEM bodies in option keys used for logging', function () {
    const key = '-----BEGIN PRIVATE KEY-----\nK\n-----END PRIVATE KEY-----'
    const { getTlsOptionsLogKeys } = require('../../src/core/client/modbus-tls-options')
    const keys = getTlsOptionsLogKeys({
      key,
      rejectUnauthorized: false
    })
    assert.deepStrictEqual(keys, ['rejectUnauthorized'])
  })
})
