'use strict'

const assert = require('assert')
const {
  buildTlsOptions,
  getTlsOptionsLogKeys,
  resolveRejectUnauthorized
} = require('../../src/core/client/modbus-tls-options')

const PEM = '-----BEGIN CERTIFICATE-----\nSECRET\n-----END CERTIFICATE-----'

describe('modbus client security (TLS options)', function () {
  it('should not expose PEM material in TLS log keys', function () {
    const tlsOptions = buildTlsOptions({
      config: {
        tlsEnabled: true,
        privateKey: PEM,
        certificate: PEM,
        ca: PEM
      },
      tcpHost: '127.0.0.1'
    })

    const keys = getTlsOptionsLogKeys(tlsOptions)
    keys.forEach((key) => {
      const value = tlsOptions[key]
      if (typeof value === 'string') {
        assert(!value.includes('BEGIN'), `log key ${key} must not contain PEM`)
      }
    })
  })

  it('should default rejectUnauthorized to true for production-safe presets', function () {
    assert.strictEqual(resolveRejectUnauthorized({ tlsEnabled: true }, {}), true)
  })

  it('should allow disabling server identity check explicitly', function () {
    const options = buildTlsOptions({
      config: {
        tlsEnabled: true,
        tlsCheckServerIdentity: false,
        checkServerIdentity: false
      },
      tcpHost: '127.0.0.1'
    })
    assert.strictEqual(typeof options.checkServerIdentity, 'function')
  })

  it('should use strict rejectUnauthorized when tlsRejectUnauthorized is true', function () {
    const options = buildTlsOptions({
      config: {
        tlsEnabled: true,
        tlsRejectUnauthorized: true
      },
      tcpHost: '127.0.0.1'
    })
    assert.strictEqual(options.rejectUnauthorized, true)
  })
})
