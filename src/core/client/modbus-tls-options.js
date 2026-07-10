'use strict'
// SOURCE-MAP-REQUIRED

const fs = require('fs')

function resolveCertContent (value, deps = {}) {
  const readFileSync = deps.readFileSync || fs.readFileSync.bind(fs)
  const existsSync = deps.existsSync || fs.existsSync.bind(fs)

  if (!value) return ''
  if (typeof value !== 'string') return value
  if (value.includes('BEGIN')) return value
  if (existsSync(value)) {
    try {
      return readFileSync(value, 'utf8')
    } catch (err) {
      if (typeof deps.onReadFileError === 'function') {
        deps.onReadFileError(value, err)
      }
      return ''
    }
  }
  return value
}

function loadCertificateFromSources (credentialKey, credentials, env) {
  let content = ''

  if (credentials && credentials[credentialKey]) {
    content = credentials[credentialKey]
  }

  const envKey = `MODBUS_TLS_${credentialKey.toUpperCase().replace('TLS', '')}`
  if (!content && env && env[envKey]) {
    content = env[envKey]
  }

  return content
}

function resolveRejectUnauthorized (config, legacyTls) {
  if (config.tlsRejectUnauthorized !== undefined) {
    return config.tlsRejectUnauthorized !== false
  }
  if (config.rejectUnauthorized !== undefined) {
    return config.rejectUnauthorized !== false
  }
  if (legacyTls.rejectUnauthorized !== undefined) {
    return legacyTls.rejectUnauthorized !== false
  }
  return true
}

function buildTlsOptions ({ config, credentials, tcpHost, env, deps }) {
  if (!config || !config.tlsEnabled) {
    return null
  }

  const legacyTls = (config.tlsOptions && typeof config.tlsOptions === 'object')
    ? config.tlsOptions
    : {}

  const resolveDeps = { ...deps, env: env || process.env }

  const tlsOptions = {
    key: resolveCertContent(
      loadCertificateFromSources('tlsPrivateKey', credentials, env) ||
      legacyTls.key ||
      config.privateKey ||
      '',
      resolveDeps
    ),
    cert: resolveCertContent(
      loadCertificateFromSources('tlsCertificate', credentials, env) ||
      legacyTls.cert ||
      config.certificate ||
      '',
      resolveDeps
    ),
    ca: resolveCertContent(
      loadCertificateFromSources('tlsCa', credentials, env) ||
      legacyTls.ca ||
      config.ca ||
      '',
      resolveDeps
    ),
    rejectUnauthorized: resolveRejectUnauthorized(config, legacyTls),
    servername: config.tlsServername || config.servername || legacyTls.servername || tcpHost,
    secureProtocol: config.tlsSecureProtocol || config.secureProtocol || legacyTls.secureProtocol || 'TLSv1_3_method',
    checkServerIdentity: config.tlsCheckServerIdentity !== false && config.checkServerIdentity !== false
      ? undefined
      : () => undefined,
    minVersion: legacyTls.minVersion || 'TLSv1.2'
  }

  Object.keys(legacyTls).forEach((key) => {
    if (tlsOptions[key] === undefined || tlsOptions[key] === '') {
      tlsOptions[key] = legacyTls[key]
    }
  })

  Object.keys(tlsOptions).forEach((key) => {
    if (tlsOptions[key] === '') {
      delete tlsOptions[key]
    }
  })

  return tlsOptions
}

function getTlsOptionsLogKeys (tlsOptions) {
  if (!tlsOptions || typeof tlsOptions !== 'object') {
    return []
  }
  return Object.keys(tlsOptions).filter((key) => {
    const val = tlsOptions[key]
    if (typeof val === 'string' && val.includes('BEGIN')) {
      return false
    }
    return true
  })
}

module.exports = {
  resolveCertContent,
  loadCertificateFromSources,
  resolveRejectUnauthorized,
  buildTlsOptions,
  getTlsOptionsLogKeys
}
