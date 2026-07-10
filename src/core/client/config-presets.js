'use strict'
// SOURCE-MAP-REQUIRED

const CLIENT_PRESETS = {
  'plain-tcp': {
    clienttype: 'tcp',
    tlsEnabled: false,
    tcpType: 'DEFAULT',
    clientTimeout: 1000,
    reconnectOnTimeout: true,
    reconnectTimeout: 2000
  },
  'tls-production': {
    clienttype: 'tcp',
    tlsEnabled: true,
    tlsRejectUnauthorized: true,
    tlsCheckServerIdentity: true,
    tlsSecureProtocol: 'TLSv1_3_method'
  },
  'tls-lab': {
    clienttype: 'tcp',
    tlsEnabled: true,
    tlsRejectUnauthorized: false,
    tlsCheckServerIdentity: false,
    tlsSecureProtocol: 'TLSv1_3_method'
  },
  'serial-rtu': {
    clienttype: 'serial',
    serialType: 'RTU-BUFFERD',
    serialBaudrate: 9600,
    serialDatabits: 8,
    serialStopbits: 1,
    serialParity: 'none'
  },
  'high-latency': {
    clientTimeout: 5000,
    commandDelay: 50,
    reconnectOnTimeout: true,
    reconnectTimeout: 5000
  }
}

function listClientPresetIds () {
  return Object.keys(CLIENT_PRESETS)
}

function applyClientPreset (presetId, currentConfig = {}) {
  const preset = CLIENT_PRESETS[presetId]
  if (!preset) {
    return { ...currentConfig }
  }
  return {
    ...currentConfig,
    ...preset,
    configPreset: presetId
  }
}

module.exports = {
  CLIENT_PRESETS,
  listClientPresetIds,
  applyClientPreset
}
