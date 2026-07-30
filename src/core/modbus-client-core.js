/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

const internalDebug = require('debug')('contribModbus:core:client')
const internalDebugFSM = require('debug')('contribModbus:core:client:fsm')
const modbusSerialDebug = require('debug')('modbus-serial')
const XStateFSM = require('@xstate/fsm')

const READ_FC_DISPATCH = {
  1: 'readModbusByFunctionCodeOne',
  2: 'readModbusByFunctionCodeTwo',
  3: 'readModbusByFunctionCodeThree',
  4: 'readModbusByFunctionCodeFour'
}

const MODBUS_ADDRESS_MIN = 0
const MODBUS_ADDRESS_MAX = 65535
const MODBUS_FC_QUANTITY_LIMITS = {
  1: { min: 1, max: 2000 },
  2: { min: 1, max: 2000 },
  3: { min: 1, max: 125 },
  4: { min: 1, max: 125 },
  15: { min: 1, max: 1968 },
  16: { min: 1, max: 123 }
}

const FORBIDDEN_PAYLOAD_KEYS = ['__proto__', 'constructor', 'prototype']

const coreClient = {}

coreClient.internalDebug = internalDebug
coreClient.internalDebugFSM = internalDebugFSM
coreClient.modbusSerialDebug = modbusSerialDebug
coreClient.XStateFSM = XStateFSM
coreClient.stateLogEnabled = false

coreClient.networkErrors = ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET', 'ENETRESET',
  'ECONNABORTED', 'ECONNREFUSED', 'ENETUNREACH', 'ENOTCONN',
  'ESHUTDOWN', 'EHOSTDOWN', 'ENETDOWN', 'EWOULDBLOCK', 'EAGAIN', 'EHOSTUNREACH',
  'EAI_AGAIN', 'ENOTFOUND']

/** States where ACTIVATE is safe (drain / ready) — not recovery Fake-Ready. */
coreClient.activateAllowedStates = ['connected', 'activated', 'queueing', 'sending', 'empty', 'reading', 'writing']

/**
 * Timeout, DNS, and transport errors that must enter FAILURE/BREAK recovery
 * (FR-TO-01 / FR-TO-02 — client-timeout-reconnect-honesty).
 */
coreClient.isRecoverableModbusError = function (err) {
  if (!err) return false
  if (err.errno && coreClient.networkErrors.includes(err.errno)) return true
  if (err.code && coreClient.networkErrors.includes(err.code)) return true
  const msg = (err.message && String(err.message)) || ''
  if (msg === 'Timed out' || msg.indexOf('Timed out') !== -1) return true
  if (msg.indexOf('EAI_AGAIN') !== -1 || msg.indexOf('ENOTFOUND') !== -1) return true
  if (msg.indexOf('getaddrinfo') !== -1) return true
  if (msg === 'Port Not Open') return true
  return false
}

coreClient.canSendActivate = function (node) {
  const value = node && node.actualServiceState && node.actualServiceState.value
  return !!value && coreClient.activateAllowedStates.indexOf(value) !== -1
}

coreClient.sendActivateIfAllowed = function (node) {
  if (coreClient.canSendActivate(node)) {
    node.stateService.send('ACTIVATE')
  }
}

coreClient.createStateMachineService = function () {
  this.stateLogEnabled = false

  return this.XStateFSM.createMachine({
    id: 'modbus',
    initial: 'new',
    states: {
      new: { on: { INIT: 'init', BREAK: 'broken', STOP: 'stopped' } },
      // No ACTIVATE from broken — late completion must not Fake-Ready (FR-FSM-ACT)
      broken: { on: { INIT: 'init', STOP: 'stopped', FAILURE: 'failed', RECONNECT: 'reconnecting' } },
      reconnecting: { on: { INIT: 'init', STOP: 'stopped' } },
      init: { on: { OPENSERIAL: 'opened', CONNECT: 'connected', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' } },
      opened: { on: { CONNECT: 'connected', BREAK: 'broken', FAILURE: 'failed', CLOSE: 'closed', STOP: 'stopped', SWITCH: 'switch' } },
      connected: { on: { CLOSE: 'closed', ACTIVATE: 'activated', QUEUE: 'queueing', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' } },
      activated: { on: { READ: 'reading', WRITE: 'writing', QUEUE: 'queueing', BREAK: 'broken', CLOSE: 'closed', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' } },
      queueing: { on: { ACTIVATE: 'activated', SEND: 'sending', READ: 'reading', WRITE: 'writing', EMPTY: 'empty', BREAK: 'broken', CLOSE: 'closed', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' } },
      empty: { on: { QUEUE: 'queueing', BREAK: 'broken', FAILURE: 'failed', CLOSE: 'closed', STOP: 'stopped', SWITCH: 'switch' } },
      sending: { on: { ACTIVATE: 'activated', READ: 'reading', WRITE: 'writing', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' } },
      reading: { on: { ACTIVATE: 'activated', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped' } },
      writing: { on: { ACTIVATE: 'activated', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped' } },
      closed: { on: { FAILURE: 'failed', BREAK: 'broken', CONNECT: 'connected', RECONNECT: 'reconnecting', INIT: 'init', STOP: 'stopped', SWITCH: 'switch' } },
      failed: { on: { CLOSE: 'closed', BREAK: 'broken', STOP: 'stopped', SWITCH: 'switch' } },
      switch: { on: { CLOSE: 'closed', BREAK: 'broken', STOP: 'stopped' } },
      stopped: { on: { NEW: 'new', STOP: 'stopped' } }
    }
  })
}

coreClient.getActualUnitId = function (node, msg) {
  if (msg.payload && Number.isInteger(msg.payload.unitId)) {
    return parseInt(msg.payload.unitId)
  } else if (msg.payload && Number.isInteger(msg.payload.unitid)) {
    return parseInt(msg.payload.unitid)
  } else if (Number.isInteger(msg.queueUnitId)) {
    return parseInt(msg.queueUnitId)
  } else {
    const unitId = parseInt(node.unit_id)
    return Number.isInteger(unitId) ? unitId : 0
  }
}

coreClient.validateAddressAndQuantity = function (msg, fc, cberr, node) {
  const rejectValidation = function (err) {
    // When a dequeued command fails validation, unlock the unit / FSM (#574 related)
    if (node && typeof node.activateSending === 'function') {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
    } else {
      cberr(err, msg)
    }
  }

  if (msg.payload.address !== undefined && msg.payload.address !== null) {
    const address = parseInt(msg.payload.address, 10)
    if (!Number.isFinite(address) || address < MODBUS_ADDRESS_MIN || address > MODBUS_ADDRESS_MAX) {
      rejectValidation(new Error('Modbus address out of range: ' + msg.payload.address))
      return false
    }
  }
  const limits = MODBUS_FC_QUANTITY_LIMITS[fc]
  if (limits && msg.payload.quantity !== undefined && msg.payload.quantity !== null) {
    const quantity = parseInt(msg.payload.quantity, 10)
    if (!Number.isFinite(quantity) || quantity < limits.min || quantity > limits.max) {
      rejectValidation(new Error('Modbus quantity out of range for FC' + fc + ': ' + msg.payload.quantity))
      return false
    }
  }
  return true
}

coreClient.startStateService = function (toggleMachine) {
  return this.XStateFSM.interpret(toggleMachine).start()
}

coreClient.checkUnitId = function (unitid, clientType) {
  if (clientType === 'tcp') {
    return unitid >= 0 && unitid <= 255
  } else {
    return unitid >= 0 && unitid <= 247
  }
}

coreClient.getLogFunction = function (node) {
  if (node.internalDebugLog) {
    return node.internalDebugLog
  } else {
    return coreClient.internalDebug
  }
}

coreClient.activateSendingOnSuccess = function (node, cb, cberr, resp, msg) {
  node.activateSending(msg).then(function () {
    cb(resp, msg)
  }).catch(function (err) {
    cberr(err, msg)
  }).finally(function () {
    coreClient.sendActivateIfAllowed(node)
  })
}

coreClient.activateSendingOnFailure = function (node, cberr, err, msg) {
  node.activateSending(msg).then(function () {
    cberr(err, msg)
  }).catch(function (err) {
    cberr(err, msg)
  }).finally(function () {
    coreClient.sendActivateIfAllowed(node)
  })
}

coreClient.readModbusByFunctionCodeOne = function (node, msg, cb, cberr) {
  if (msg.payload.enableDeformedMessages) {
    node.client.readCoils_deformedReadEnabled(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
      node.modbusErrorHandling(err)
    })
  } else {
    node.client.readCoils(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
      node.modbusErrorHandling(err)
    })
  }
}

coreClient.readModbusByFunctionCodeTwo = function (node, msg, cb, cberr) {
  if (msg.payload.enableDeformedMessages) {
    node.client.readDiscreteInputs_deformedReadEnabled(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
      node.modbusErrorHandling(err)
    })
  } else {
    node.client.readDiscreteInputs(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
      node.modbusErrorHandling(err)
    })
  }
}

coreClient.readModbusByFunctionCodeThree = function (node, msg, cb, cberr) {
  if (msg.payload.enableDeformedMessages) {
    node.client.readHoldingRegisters_deformedReadEnabled(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
      node.modbusErrorHandling(err)
    })
  } else {
    node.client.readHoldingRegisters(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
      node.modbusErrorHandling(err)
    })
  }
}

coreClient.readModbusByFunctionCodeFour = function (node, msg, cb, cberr) {
  if (msg.payload.enableDeformedMessages) {
    node.client.readInputRegisters_deformedReadEnabled(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
      node.modbusErrorHandling(err)
    })
  } else {
    node.client.readInputRegisters(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
      node.modbusErrorHandling(err)
    })
  }
}

coreClient.sendCustomFunctionCode = function (node, msg, cb, cberr) {
  node.client.sendCustomFc(msg.payload.unitid, msg.payload.fc, msg.payload.requestCard, msg.payload.responseCard).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
    node.modbusErrorHandling(err)
  })
}

coreClient.readModbusByFunctionCode = function (node, msg, cb, cberr) {
  const nodeLog = coreClient.getLogFunction(node)
  const fc = parseInt(msg.payload.fc)

  if (!coreClient.validateAddressAndQuantity(msg, fc, cberr, node)) {
    return
  }

  const method = READ_FC_DISPATCH[fc]

  if (method) {
    coreClient[method](node, msg, cb, cberr)
  } else {
    coreClient.activateSendingOnFailure(node, cberr, new Error('Function Code Unknown'), msg)
    nodeLog('Function Code Unknown %s', msg.payload.fc)
  }
}

coreClient.customModbusMessage = function (node, msg, cb, cberr) {
  const nodeLog = coreClient.getLogFunction(node)
  const delayTime = 1

  if (!node.client) {
    nodeLog('Client Not Ready As Object On Reading Modbus')
    return
  }

  // FR-FSM-CONN: never heal half-open sockets via in-band connectClient (FSM only)
  if (node.client._port && node.client._port._client && !node.client._port._client.readable) {
    const sockErr = new Error('Modbus client socket not readable')
    sockErr.errno = 'ECONNRESET'
    sockErr.code = 'ECONNRESET'
    coreClient.activateSendingOnFailure(node, cberr, sockErr, msg)
    node.modbusErrorHandling(sockErr)
    return
  }

  setTimeout(function () {
    if (!node.bufferCommands) {
      if (node.clienttype !== 'tcp') {
        node.stateService.send('READ')
      }
    } else {
      node.queueLog(JSON.stringify({
        info: 'read msg via Modbus',
        message: msg.payload,
        queueUnitId: msg.queueUnitId,
        timeout: node.client.getTimeout(),
        state: node.actualServiceState.value
      }))
    }

    node.setUnitIdFromPayload(msg)
    node.client.setTimeout(node.clientTimeout)

    try {
      coreClient.sendCustomFunctionCode(node, msg, cb, cberr)
    } catch (err) {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
      nodeLog(err.message)
      node.modbusErrorHandling(err)
    }
  }, delayTime)
}

coreClient.readModbus = function (node, msg, cb, cberr) {
  const nodeLog = coreClient.getLogFunction(node)
  const delayTime = 1

  if (!node.client) {
    nodeLog('Client Not Ready As Object On Reading Modbus')
    return
  }

  // FR-FSM-CONN: never heal half-open sockets via in-band connectClient (FSM only)
  if (node.client._port && node.client._port._client && !node.client._port._client.readable) {
    const sockErr = new Error('Modbus client socket not readable')
    sockErr.errno = 'ECONNRESET'
    sockErr.code = 'ECONNRESET'
    coreClient.activateSendingOnFailure(node, cberr, sockErr, msg)
    node.modbusErrorHandling(sockErr)
    return
  }

  setTimeout(function () {
    if (!node.bufferCommands) {
      if (node.clienttype !== 'tcp') {
        node.stateService.send('READ')
      }
    } else {
      node.queueLog(JSON.stringify({
        info: 'read msg via Modbus',
        message: msg.payload,
        queueUnitId: msg.queueUnitId,
        timeout: node.client.getTimeout(),
        state: node.actualServiceState.value
      }))
    }

    node.setUnitIdFromPayload(msg)
    node.client.setTimeout(node.clientTimeout)

    try {
      coreClient.readModbusByFunctionCode(node, msg, cb, cberr)
    } catch (err) {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
      nodeLog(err.message)
      node.modbusErrorHandling(err)
    }
  }, delayTime)
}

coreClient.writeModbusByFunctionCodeFive = function (node, msg, cb, cberr) {
  if (!coreClient.validateAddressAndQuantity(msg, 5, cberr, node)) {
    return
  }
  const rawValue = msg.payload.value
  msg.payload.value = (rawValue !== 0 && rawValue !== '0' && rawValue !== false &&
    rawValue !== null && rawValue !== undefined)
  node.client.writeCoil(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    if (node.client.getID() === 0) {
      const resp = {
        address: parseInt(msg.payload.address),
        value: parseInt(msg.payload.value)
      }
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    } else {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
      node.modbusErrorHandling(err)
    }
  })
}

coreClient.writeModbusByFunctionCodeFifteen = function (node, msg, cb, cberr) {
  if (!coreClient.validateAddressAndQuantity(msg, 15, cberr, node)) {
    return
  }
  if (parseInt(msg.payload.value.length) !== parseInt(msg.payload.quantity)) {
    coreClient.activateSendingOnFailure(node, cberr, new Error('Quantity should be less or equal to coil payload array length: ' +
      msg.payload.value.length + ' Addr: ' + msg.payload.address + ' Q: ' + msg.payload.quantity), msg)
  } else {
    node.client.writeCoils(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      if (node.client.getID() === 0) {
        const resp = {
          address: parseInt(msg.payload.address),
          value: parseInt(msg.payload.value)
        }
        coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
      } else {
        coreClient.activateSendingOnFailure(node, cberr, err, msg)
        node.modbusErrorHandling(err)
      }
    })
  }
}

coreClient.writeModbusByFunctionCodeSix = function (node, msg, cb, cberr) {
  if (!coreClient.validateAddressAndQuantity(msg, 6, cberr, node)) {
    return
  }
  node.client.writeRegister(parseInt(msg.payload.address), parseInt(msg.payload.value)).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    if (node.client.getID() === 0) {
      const resp = {
        address: parseInt(msg.payload.address),
        value: parseInt(msg.payload.value)
      }
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    } else {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
      node.modbusErrorHandling(err)
    }
  })
}

coreClient.writeModbusByFunctionCodeSixteen = function (node, msg, cb, cberr) {
  if (!coreClient.validateAddressAndQuantity(msg, 16, cberr, node)) {
    return
  }
  if (parseInt(msg.payload.value.length) !== parseInt(msg.payload.quantity)) {
    coreClient.activateSendingOnFailure(node, cberr, new Error('Quantity should be less or equal to register payload array length: ' +
      msg.payload.value.length + ' Addr: ' + msg.payload.address + ' Q: ' + msg.payload.quantity), msg)
  } else {
    node.client.writeRegisters(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      if (node.client.getID() === 0) {
        const resp = {
          address: parseInt(msg.payload.address),
          value: parseInt(msg.payload.value)
        }
        coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
      } else {
        coreClient.activateSendingOnFailure(node, cberr, err, msg)
        node.modbusErrorHandling(err)
      }
    })
  }
}

coreClient.writeModbus = function (node, msg, cb, cberr) {
  const nodeLog = coreClient.getLogFunction(node)
  const delayTime = 1
  if (!node.client) {
    nodeLog('Client Not Ready As Object On Writing Modbus')
    return
  }

  // FR-FSM-CONN: never heal half-open sockets via in-band connectClient (FSM only)
  if (node.client._port && node.client._port._client && !node.client._port._client.writable) {
    const sockErr = new Error('Modbus client socket not writable')
    sockErr.errno = 'ECONNRESET'
    sockErr.code = 'ECONNRESET'
    coreClient.activateSendingOnFailure(node, cberr, sockErr, msg)
    node.modbusErrorHandling(sockErr)
    return
  }

  setTimeout(function () {
    if (!node.bufferCommands) {
      if (node.clienttype !== 'tcp') {
        node.stateService.send('WRITE')
      }
    } else {
      node.queueLog(JSON.stringify({
        info: 'write msg',
        message: msg.payload,
        queueUnitId: msg.queueUnitId,
        timeout: node.client.getTimeout(),
        state: node.actualServiceState.value
      }))
    }

    node.setUnitIdFromPayload(msg)
    node.client.setTimeout(node.clientTimeout)

    try {
      switch (parseInt(msg.payload.fc)) {
        case 15: // FC: 15
          coreClient.writeModbusByFunctionCodeFifteen(node, msg, cb, cberr)
          break
        case 5: // FC: 5
          coreClient.writeModbusByFunctionCodeFive(node, msg, cb, cberr)
          break
        case 16: // FC: 16
          coreClient.writeModbusByFunctionCodeSixteen(node, msg, cb, cberr)
          break
        case 6: // FC: 6
          coreClient.writeModbusByFunctionCodeSix(node, msg, cb, cberr)
          break
        default:
          coreClient.activateSendingOnFailure(node, cberr, new Error('Function Code Unknown'), msg)
          nodeLog('Function Code Unknown %s', msg.payload.fc)
          break
      }
    } catch (err) {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
      nodeLog(err.message)
    }
  }, delayTime)
}

coreClient.setNewTCPNodeSettings = function (node, msg) {
  node.clienttype = 'tcp'
  node.tcpHost = msg.payload.tcpHost || node.tcpHost
  node.tcpPort = msg.payload.tcpPort || node.tcpPort
  node.tcpType = msg.payload.tcpType || node.tcpType
}

coreClient.setNewSerialNodeSettings = function (node, msg) {
  if (msg.payload.serialPort) {
    node.serialPort = msg.payload.serialPort || node.serialPort
  }

  if (msg.payload.serialBaudrate) {
    node.serialBaudrate = parseInt(msg.payload.serialBaudrate) || node.serialBaudrate
  }

  node.clienttype = 'serial'
  node.serialDatabits = msg.payload.serialDatabits || node.serialDatabits
  node.serialStopbits = msg.payload.serialStopbits || node.serialStopbits
  node.serialParity = msg.payload.serialParity || node.serialParity
  node.serialType = msg.payload.serialType || node.serialType

  if (msg.payload.serialAsciiResponseStartDelimiter && typeof msg.payload.serialAsciiResponseStartDelimiter === 'string') {
    node.serialAsciiResponseStartDelimiter = parseInt(msg.payload.serialAsciiResponseStartDelimiter, 16)
  } else {
    node.serialAsciiResponseStartDelimiter = msg.payload.serialAsciiResponseStartDelimiter || node.serialAsciiResponseStartDelimiter
  }

  if (msg.payload.serialConnectionDelay) {
    node.serialConnectionDelay = parseInt(msg.payload.serialConnectionDelay) || node.serialConnectionDelay
  }
}

coreClient.setNewNodeOptionalSettings = function (node, msg) {
  const nodeLog = coreClient.getLogFunction(node)

  try {
    let unitId = parseInt(msg.payload.unitId)
    if (!node.checkUnitId(unitId, node.clienttype)) {
      unitId = node.unit_id
    }
    node.unit_id = unitId
  } catch (err) {
    nodeLog(err.message)
  }

  if (msg.payload.commandDelay) {
    node.commandDelay = parseInt(msg.payload.commandDelay) || node.commandDelay
  }

  if (msg.payload.clientTimeout) {
    node.clientTimeout = parseInt(msg.payload.clientTimeout) || node.clientTimeout
  }

  if (msg.payload.reconnectTimeout) {
    node.reconnectTimeout = parseInt(msg.payload.reconnectTimeout) || node.reconnectTimeout
  }
}

coreClient.setNewNodeSettings = function (node, msg) {
  const nodeLog = coreClient.getLogFunction(node)

  if (!msg) {
    nodeLog('New Connection message invalid.')
    return false
  }

  const payload = msg.payload || {}
  if (FORBIDDEN_PAYLOAD_KEYS.some(function (key) {
    return Object.prototype.hasOwnProperty.call(payload, key)
  })) {
    nodeLog('Rejected payload with forbidden prototype keys')
    return false
  }

  switch (msg.payload.connectorType.toUpperCase()) {
    case 'TCP':
      coreClient.setNewTCPNodeSettings(node, msg)
      nodeLog('New Connection TCP Settings ' + node.tcpHost + ' ' + node.tcpPort + ' ' + node.tcpType)
      break

    case 'SERIAL':
      coreClient.setNewSerialNodeSettings(node, msg)
      nodeLog('New Connection Serial Settings ' + node.serialPort + ' ' + node.serialBaudrate + ' ' + node.serialType)
      break

    default:
      nodeLog('Unknown Dynamic Reconnect Type ' + msg.payload.connectorType)
  }

  coreClient.setNewNodeOptionalSettings(node, msg)

  return true
}

coreClient.messageAllowedStates = ['activated', 'queueing', 'sending', 'empty', 'connected']

module.exports = coreClient
