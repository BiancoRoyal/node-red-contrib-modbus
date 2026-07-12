'use strict'
// SOURCE-MAP-REQUIRED

const MODBUS_PACKAGE = '@plus4nodered/node-modbus'

function warnTlsUnsupportedForTcpType (node, tcpType) {
  if (node._tlsUnsupportedTcpTypeWarned) {
    return
  }
  node._tlsUnsupportedTcpTypeWarned = true
  if (typeof node.warn === 'function') {
    node.warn(`TLS applies to DEFAULT TCP only; connecting ${tcpType} without TLS`)
  }
}

function connectModbusTcpClient (node, client, hooks) {
  const {
    verboseLog,
    modbusTcpErrorHandling,
    setTCPConnectionOptions,
    setTCPConnected
  } = hooks

  const host = node.tcpHost
  const tcpType = node.tcpType || 'DEFAULT'
  const baseOptions = {
    port: node.tcpPort,
    autoOpen: true
  }

  const onTcpError = (err) => {
    modbusTcpErrorHandling(err)
    return false
  }

  switch (tcpType) {
    case 'C701': {
      if (node.tlsEnabled) {
        warnTlsUnsupportedForTcpType(node, 'C701')
      }
      verboseLog('C701 port UDP bridge')
      return client.connectC701(host, baseOptions)
        .then(setTCPConnectionOptions)
        .then(setTCPConnected)
        .catch(onTcpError)
    }
    case 'TELNET': {
      if (node.tlsEnabled) {
        warnTlsUnsupportedForTcpType(node, 'TELNET')
      }
      verboseLog('Telnet port')
      return client.connectTelnet(host, baseOptions)
        .then(setTCPConnectionOptions)
        .catch(onTcpError)
    }
    case 'TCP-RTU-BUFFERED': {
      if (node.tlsEnabled) {
        warnTlsUnsupportedForTcpType(node, 'TCP-RTU-BUFFERED')
      }
      verboseLog('TCP RTU buffered port')
      return client.connectTcpRTUBuffered(host, baseOptions)
        .then(setTCPConnectionOptions)
        .catch(onTcpError)
    }
    case 'UDP':
      verboseLog('UDP port')
      if (node.tlsEnabled) {
        warnTlsUnsupportedForTcpType(node, 'UDP')
      }
      return client.connectUDP(host, baseOptions)
        .then(setTCPConnectionOptions)
        .catch(onTcpError)
    default: {
      if (node.tlsEnabled && node.tlsOptions) {
        verboseLog('TCP secure port (connectTCPSecure)')
        return client.connectTCPSecure(host, {
          port: node.tcpPort,
          autoOpen: true,
          tls: node.tlsOptions
        })
          .then(setTCPConnectionOptions)
          .catch(onTcpError)
      }
      verboseLog('TCP port')
      return client.connectTCP(host, baseOptions)
        .then(setTCPConnectionOptions)
        .catch(onTcpError)
    }
  }
}

function connectModbusSerialClient (node, client, hooks) {
  const {
    verboseLog,
    modbusSerialErrorHandling,
    setSerialConnectionOptions
  } = hooks

  const serialPortOptions = {
    baudRate: parseInt(node.serialBaudrate),
    dataBits: parseInt(node.serialDatabits),
    stopBits: parseInt(node.serialStopbits),
    parity: node.serialParity,
    autoOpen: false
  }

  const onSerialError = (err) => {
    modbusSerialErrorHandling(err)
    return false
  }

  switch (node.serialType) {
    case 'ASCII': {
      verboseLog('ASCII port serial')
      if (node.serialAsciiResponseStartDelimiter && typeof node.serialAsciiResponseStartDelimiter === 'string') {
        serialPortOptions.startOfSlaveFrameChar = parseInt(node.serialAsciiResponseStartDelimiter, 16)
      } else {
        serialPortOptions.startOfSlaveFrameChar = node.serialAsciiResponseStartDelimiter
      }
      verboseLog('Using response delimiter: 0x' + serialPortOptions.startOfSlaveFrameChar.toString(16))
      return client.connectAsciiSerial(node.serialPort, serialPortOptions)
        .then(setSerialConnectionOptions)
        .catch(onSerialError)
    }
    case 'RTU':
      verboseLog('RTU port serial')
      return client.connectRTU(node.serialPort, serialPortOptions)
        .then(setSerialConnectionOptions)
        .catch(onSerialError)
    default:
      verboseLog('RTU buffered port serial')
      return client.connectRTUBuffered(node.serialPort, serialPortOptions)
        .then(setSerialConnectionOptions)
        .catch(onSerialError)
  }
}

function connectModbusClientTransport (node, client, hooks) {
  if (node.clienttype === 'tcp') {
    return connectModbusTcpClient(node, client, hooks)
  }
  return connectModbusSerialClient(node, client, hooks)
}

module.exports = {
  MODBUS_PACKAGE,
  connectModbusClientTransport,
  connectModbusTcpClient,
  connectModbusSerialClient,
  warnTlsUnsupportedForTcpType
}
