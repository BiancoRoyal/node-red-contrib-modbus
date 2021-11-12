/**
 Copyright (c) 2016,2017,2018,2019,2020,2021 Klaus Landsdorf (https://bianco-royal.space/)
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

// eslint-disable-next-line no-var
var de = de || { biancoroyal: { modbus: { core: { client: {} } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.internalDebug = de.biancoroyal.modbus.core.client.internalDebug || require('debug')('contribModbus:core:client') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.internalDebugFSM = de.biancoroyal.modbus.core.client.internalDebugFSM || require('debug')('contribModbus:core:client:fsm') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.modbusSerialDebug = de.biancoroyal.modbus.core.client.modbusSerialDebug || require('debug')('modbus-serial') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.XStateFSM = de.biancoroyal.modbus.core.client.XStateFSM || require('@xstate/fsm') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.stateLogEnabled = de.biancoroyal.modbus.core.client.stateLogEnabled || false // eslint-disable-line no-use-before-define

de.biancoroyal.modbus.core.client.networkErrors = ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET', 'ENETRESET',
  'ECONNABORTED', 'ECONNREFUSED', 'ENETUNREACH', 'ENOTCONN',
  'ESHUTDOWN', 'EHOSTDOWN', 'ENETDOWN', 'EWOULDBLOCK', 'EAGAIN', 'EHOSTUNREACH']

de.biancoroyal.modbus.core.client.createStateMachineService = function () {
  this.stateLogEnabled = false

  // failure is a general gate point in states to jump between states
  return this.XStateFSM.createMachine({
    id: 'modbus',
    initial: 'new',
    states: {
      new: {
        on: { INIT: 'init', BREAK: 'broken', STOP: 'stopped' }
      },
      broken: {
        on: { INIT: 'init', STOP: 'stopped', FAILURE: 'failed', ACTIVATE: 'activated', RECONNECT: 'reconnecting' }
      },
      reconnecting: {
        on: { INIT: 'init', STOP: 'stopped' }
      },
      init: {
        on: { OPENSERIAL: 'opened', CONNECT: 'connected', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' }
      },
      opened: {
        on: { CONNECT: 'connected', BREAK: 'broken', FAILURE: 'failed', CLOSE: 'closed', STOP: 'stopped', SWITCH: 'switch' }
      },
      connected: {
        on: { CLOSE: 'closed', ACTIVATE: 'activated', QUEUE: 'queueing', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' }
      },
      activated: {
        on: {
          READ: 'reading',
          WRITE: 'writing',
          QUEUE: 'queueing',
          BREAK: 'broken',
          CLOSE: 'closed',
          FAILURE: 'failed',
          STOP: 'stopped',
          SWITCH: 'switch'
        }
      },
      queueing: {
        on: {
          ACTIVATE: 'activated',
          SEND: 'sending',
          READ: 'reading',
          WRITE: 'writing',
          EMPTY: 'empty',
          BREAK: 'broken',
          CLOSE: 'closed',
          FAILURE: 'failed',
          STOP: 'stopped',
          SWITCH: 'switch'
        }
      },
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

de.biancoroyal.modbus.core.client.getActualUnitId = function (node, msg) {
  if (msg.payload && Number.isInteger(msg.payload.unitid)) {
    return parseInt(msg.payload.unitid)
  } else if (Number.isInteger(msg.queueUnitId)) {
    return parseInt(msg.queueUnitId)
  } else {
    return parseInt(node.unit_id)
  }
}

de.biancoroyal.modbus.core.client.startStateService = function (toggleMachine) {
  return this.XStateFSM.interpret(toggleMachine).start()
}

de.biancoroyal.modbus.core.client.checkUnitId = function (unitid, clientType) {
  if (clientType === 'tcp') {
    return unitid >= 0 && unitid <= 255
  } else {
    return unitid >= 0 && unitid <= 247
  }
}

de.biancoroyal.modbus.core.client.getLogFunction = function (node) {
  if (node.internalDebugLog) {
    return node.internalDebugLog
  } else {
    return de.biancoroyal.modbus.core.client.internalDebug
  }
}

de.biancoroyal.modbus.core.client.activateSendingOnSuccess = function (node, cb, cberr, resp, msg) {
  node.activateSending(msg).then(function () {
    cb(resp, msg)
    console.log('******** CB EXECUTED *************')
  }).catch(function (err) {
    cberr(err, msg)
    console.log('************* CB ERR **************')
  }).finally(function () {
    node.stateService.send('ACTIVATE')
  })
}

de.biancoroyal.modbus.core.client.activateSendingOnFailure = function (node, cberr, err, msg) {
  node.activateSending(msg).then(function () {
    cberr(err, msg)
  }).catch(function (err) {
    cberr(err, msg)
  }).finally(function () {
    node.stateService.send('ACTIVATE')
  })
}

de.biancoroyal.modbus.core.client.readModbusByFunctionCodeOne = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  node.client.readCoils(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
    node.modbusErrorHandling(err)
  })
}

de.biancoroyal.modbus.core.client.readModbusByFunctionCodeTwo = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  node.client.readDiscreteInputs(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
    node.modbusErrorHandling(err)
  })
}

de.biancoroyal.modbus.core.client.readModbusByFunctionCodeThree = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  node.client.readHoldingRegisters(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    console.log('******** ERROR READ *******')
    coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
    node.modbusErrorHandling(err)
  })
}

de.biancoroyal.modbus.core.client.readModbusByFunctionCodeFour = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  node.client.readInputRegisters(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
    node.modbusErrorHandling(err)
  })
}

de.biancoroyal.modbus.core.client.readModbusByFunctionCode = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)

  switch (parseInt(msg.payload.fc)) {
    case 1:
      coreClient.readModbusByFunctionCodeOne(node, msg, cb, cberr)
      break
    case 2:
      coreClient.readModbusByFunctionCodeTwo(node, msg, cb, cberr)
      break
    case 3:
      coreClient.readModbusByFunctionCodeThree(node, msg, cb, cberr)
      break
    case 4:
      coreClient.readModbusByFunctionCodeFour(node, msg, cb, cberr)
      break
    default:
      coreClient.activateSendingOnFailure(node, cberr, new Error('Function Code Unknown'), msg)
      nodeLog('Function Code Unknown %s', msg.payload.fc)
      break
  }
}

de.biancoroyal.modbus.core.client.readModbus = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)

  if (!node.client) {
    nodeLog('Client Not Ready As Object On Reading Modbus')
    return
  }

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
    nodeLog(err.message)
    node.modbusErrorHandling(err)
    coreClient.activateSendingOnFailure(node, cberr, err, msg)
  }
}

de.biancoroyal.modbus.core.client.writeModbusByFunctionCodeFive = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  if (msg.payload.value) {
    msg.payload.value = true
  } else {
    msg.payload.value = false
  }
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

de.biancoroyal.modbus.core.client.writeModbusByFunctionCodeFifteen = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
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

de.biancoroyal.modbus.core.client.writeModbusByFunctionCodeSix = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
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

de.biancoroyal.modbus.core.client.writeModbusByFunctionCodeSixteen = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
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

de.biancoroyal.modbus.core.client.writeModbus = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)

  if (!node.client) {
    nodeLog('Client Not Ready As Object On Writing Modbus')
    return
  }

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
    nodeLog(err.message)
    coreClient.activateSendingOnFailure(node, cberr, err, msg)
    node.modbusErrorHandling(err)
  }
}

de.biancoroyal.modbus.core.client.setNewTCPNodeSettings = function (node, msg) {
  node.tcpHost = msg.payload.tcpHost || node.tcpHost
  node.tcpPort = msg.payload.tcpPort || node.tcpPort
  node.tcpType = msg.payload.tcpType || node.tcpType
}

de.biancoroyal.modbus.core.client.setNewSerialNodeSettings = function (node, msg) {
  if (msg.payload.serialPort) {
    node.serialPort = msg.payload.serialPort || node.serialPort
  }

  if (msg.payload.serialBaudrate) {
    node.serialBaudrate = parseInt(msg.payload.serialBaudrate) || node.serialBaudrate
  }

  node.serialDatabits = msg.payload.serialDatabits || node.serialDatabits
  node.serialStopbits = msg.payload.serialStopbits || node.serialStopbits
  node.serialParity = msg.payload.serialParity || node.serialParity
  node.serialType = msg.payload.serialType || node.serialType

  if (msg.payload.serialConnectionDelay) {
    node.serialConnectionDelay = parseInt(msg.payload.serialConnectionDelay) || node.serialConnectionDelay
  }
}

de.biancoroyal.modbus.core.client.setNewNodeOptionalSettings = function (node, msg) {
  if (msg.payload.unitId) {
    node.unit_id = parseInt(msg.payload.unitId) || node.unit_id
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

de.biancoroyal.modbus.core.client.setNewNodeSettings = function (node, msg) {
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)
  const coreClient = de.biancoroyal.modbus.core.client

  if (!msg) {
    nodeLog('New Connection message invalid.')
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

de.biancoroyal.modbus.core.client.messagesAllowedStates = ['activated', 'queueing', 'sending', 'empty', 'connected']

module.exports = de.biancoroyal.modbus.core.client
