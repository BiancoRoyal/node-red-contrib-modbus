'use strict'

const assert = require('assert')
const {
  CLIENT_PRESETS,
  listClientPresetIds,
  applyClientPreset
} = require('../../src/core/client/config-presets')

describe('modbus client config presets', function () {
  it('should expose at least four presets', function () {
    assert(listClientPresetIds().length >= 4)
  })

  it('should apply plain-tcp preset without enabling TLS', function () {
    const result = applyClientPreset('plain-tcp', { tcpHost: '10.0.0.1' })
    assert.strictEqual(result.tlsEnabled, false)
    assert.strictEqual(result.tcpHost, '10.0.0.1')
    assert.strictEqual(result.configPreset, 'plain-tcp')
  })

  it('should apply tls-production with strict TLS defaults', function () {
    const result = applyClientPreset('tls-production', {})
    assert.strictEqual(result.tlsEnabled, true)
    assert.strictEqual(result.tlsRejectUnauthorized, true)
    assert.strictEqual(result.tlsCheckServerIdentity, true)
  })

  it('should apply tls-lab with relaxed verification', function () {
    const result = applyClientPreset('tls-lab', {})
    assert.strictEqual(result.tlsRejectUnauthorized, false)
    assert.strictEqual(result.tlsCheckServerIdentity, false)
  })

  it('should leave config unchanged for unknown preset', function () {
    const input = { tcpPort: 502 }
    assert.deepStrictEqual(applyClientPreset('unknown', input), input)
  })

  it('should include serial-rtu and high-latency presets', function () {
    assert(CLIENT_PRESETS['serial-rtu'])
    assert(CLIENT_PRESETS['high-latency'])
  })
})
