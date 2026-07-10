'use strict'

const assert = require('assert')
const path = require('path')
const {
  resolveCertContent,
  loadCertificateFromSources,
  resolveRejectUnauthorized,
  buildTlsOptions,
  getTlsOptionsLogKeys
} = require('../../../src/core/client/modbus-tls-options')

const PEM_KEY = '-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----'
const PEM_CERT = '-----BEGIN CERTIFICATE-----\nTEST\n-----END CERTIFICATE-----'

describe('modbus-tls-options', function () {
  describe('resolveCertContent', function () {
    it('should return inline PEM content unchanged', function () {
      assert.strictEqual(resolveCertContent(PEM_KEY), PEM_KEY)
    })

    it('should read certificate content from file path', function () {
      const certPath = path.join(__dirname, '../../certificates/ca-cert.pem')
      const content = resolveCertContent(certPath)
      assert(content.includes('BEGIN'))
    })

    it('should call onReadFileError when file read fails', function () {
      let reported = null
      resolveCertContent('/no/such/cert.pem', {
        existsSync: () => true,
        readFileSync: () => {
          throw new Error('read failed')
        },
        onReadFileError: (filePath, err) => {
          reported = { filePath, err }
        }
      })
      assert.strictEqual(reported.filePath, '/no/such/cert.pem')
      assert(reported.err)
    })
  })

  describe('loadCertificateFromSources', function () {
    it('should prefer credentials over environment variables', function () {
      const fromCred = loadCertificateFromSources('tlsPrivateKey', {
        tlsPrivateKey: PEM_KEY
      }, {
        MODBUS_TLS_PRIVATEKEY: 'from-env'
      })
      assert.strictEqual(fromCred, PEM_KEY)
    })

    it('should fall back to MODBUS_TLS_* environment variables', function () {
      const fromEnv = loadCertificateFromSources('tlsCertificate', {}, {
        MODBUS_TLS_CERTIFICATE: PEM_CERT
      })
      assert.strictEqual(fromEnv, PEM_CERT)
    })
  })

  describe('resolveRejectUnauthorized', function () {
    it('should default to true when unset', function () {
      assert.strictEqual(resolveRejectUnauthorized({}, {}), true)
    })

    it('should honor tlsRejectUnauthorized false', function () {
      assert.strictEqual(resolveRejectUnauthorized({ tlsRejectUnauthorized: false }, {}), false)
    })

    it('should honor legacy rejectUnauthorized', function () {
      assert.strictEqual(resolveRejectUnauthorized({}, { rejectUnauthorized: false }), false)
    })
  })

  describe('buildTlsOptions', function () {
    it('should return null when tls is disabled', function () {
      assert.strictEqual(buildTlsOptions({ config: { tlsEnabled: false } }), null)
    })

    it('should build options from credentials and config', function () {
      const options = buildTlsOptions({
        config: {
          tlsEnabled: true,
          tlsSecureProtocol: 'TLSv1_2_method',
          tlsCheckServerIdentity: false,
          tlsServername: 'modbus.local'
        },
        credentials: {
          tlsPrivateKey: PEM_KEY,
          tlsCertificate: PEM_CERT,
          tlsCa: PEM_CERT
        },
        tcpHost: '127.0.0.1'
      })

      assert.strictEqual(options.key, PEM_KEY)
      assert.strictEqual(options.cert, PEM_CERT)
      assert.strictEqual(options.ca, PEM_CERT)
      assert.strictEqual(options.rejectUnauthorized, true)
      assert.strictEqual(options.servername, 'modbus.local')
      assert.strictEqual(options.secureProtocol, 'TLSv1_2_method')
      assert.strictEqual(typeof options.checkServerIdentity, 'function')
    })

    it('should merge legacy tlsOptions and drop empty strings', function () {
      const options = buildTlsOptions({
        config: {
          tlsEnabled: true,
          tlsOptions: {
            ciphers: 'AES256-GCM-SHA384',
            key: '',
            minVersion: 'TLSv1.3'
          },
          privateKey: PEM_KEY,
          certificate: PEM_CERT
        },
        tcpHost: '10.0.0.5'
      })

      assert.strictEqual(options.key, PEM_KEY)
      assert.strictEqual(options.ciphers, 'AES256-GCM-SHA384')
      assert.strictEqual(options.minVersion, 'TLSv1.3')
      assert.strictEqual(options.servername, '10.0.0.5')
      assert.strictEqual(Object.prototype.hasOwnProperty.call(options, 'key'), true)
    })
  })

  describe('getTlsOptionsLogKeys', function () {
    it('should omit PEM bodies from log key list', function () {
      const keys = getTlsOptionsLogKeys({
        key: PEM_KEY,
        cert: PEM_CERT,
        rejectUnauthorized: true,
        secureProtocol: 'TLSv1_3_method'
      })
      assert.deepStrictEqual(keys, ['rejectUnauthorized', 'secureProtocol'])
    })
  })
})
