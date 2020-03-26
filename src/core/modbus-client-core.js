/**
 Copyright (c) 2016,2017,2018,2019 Klaus Landsdorf (https://bianco-royal.com/)
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

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
        on: { INIT: 'init', STOP: 'stopped', FAILURE: 'failed', CLOSE: 'closed', ACTIVATE: 'activated' }
      },
      init: {
        on: { OPENSERIAL: 'opened', CONNECT: 'connected', BREAK: 'broken', FAILURE: 'failed' }
      },
      opened: {
        on: { CONNECT: 'connected', BREAK: 'broken', FAILURE: 'failed', CLOSE: 'closed' }
      },
      connected: {
        on: { CLOSE: 'closed', ACTIVATE: 'activated', BREAK: 'broken', FAILURE: 'failed' }
      },
      activated: {
        on: {
          CLOSE: 'closed',
          READ: 'reading',
          WRITE: 'writing',
          QUEUE: 'queueing',
          BREAK: 'broken',
          FAILURE: 'failed'
        }
      },
      queueing: {
        on: {
          ACTIVATE: 'activated',
          READ: 'reading',
          WRITE: 'writing',
          EMPTY: 'empty',
          FAILURE: 'failed',
          BREAK: 'broken',
          CLOSE: 'closed'
        }
      },
      empty: { on: { QUEUE: 'queueing', BREAK: 'broken', FAILURE: 'failed', CLOSE: 'closed' } },
      reading: { on: { ACTIVATE: 'activated', BREAK: 'broken', FAILURE: 'failed' } },
      writing: { on: { ACTIVATE: 'activated', BREAK: 'broken', FAILURE: 'failed' } },
      closed: { on: { FAILURE: 'failed', BREAK: 'broken', CONNECT: 'connected' } },
      failed: { on: { CLOSE: 'closed', BREAK: 'broken', STOP: 'stopped' } },
      stopped: { on: { NEW: 'new', STOP: 'stopped' } }
    }
  })
}

de.biancoroyal.modbus.core.client.startStateService = function (toggleMachine) {
  return this.XStateFSM.interpret(toggleMachine).start()
}

de.biancoroyal.modbus.core.client.checkUnitId = function (unitid, clientType) {
  if (clientType === 'tcp') {
    return unitid >= 0 && unitid <= 255
  } else {
    return unitid >= 1 && unitid <= 247
  }
}

de.biancoroyal.modbus.core.client.getLogFunction = function (node) {
  if (node.internalDebugLog) {
    return node.internalDebugLog
  } else {
    return de.biancoroyal.modbus.core.client.internalDebug
  }
}

de.biancoroyal.modbus.core.client.readModbus = function (node, msg, cb, cberr) {
  if (!node.client) {
    return
  }

  if (!node.bufferCommands) {
    node.stateService.send('READ')
  }

  node.setUnitIdFromPayload(msg)
  node.client.setTimeout(node.clientTimeout)

  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)

  node.queueLog(JSON.stringify({
    info: 'read msg',
    message: msg.payload,
    unitid: msg.queueUnitId,
    timeout: node.client.getTimeout(),
    state: node.actualServiceState.value
  }))

  try {
    switch (parseInt(msg.payload.fc)) {
      case 1: // FC: 1
        node.client.readCoils(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
          node.activateSending(msg)
          cb(resp, msg)
        }).catch(function (err) {
          node.activateSending(msg)
          cberr(err, msg)
          node.modbusErrorHandling(err)
        })
        break
      case 2: // FC: 2
        node.client.readDiscreteInputs(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
          node.activateSending(msg)
          cb(resp, msg)
        }).catch(function (err) {
          node.activateSending(msg)
          cberr(err, msg)
          node.modbusErrorHandling(err)
        })
        break
      case 3: // FC: 3
        node.client.readHoldingRegisters(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
          node.activateSending(msg)
          cb(resp, msg)
        }).catch(function (err) {
          node.activateSending(msg)
          cberr(err, msg)
          node.modbusErrorHandling(err)
        })
        break
      case 4: // FC: 4
        node.client.readInputRegisters(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
          node.activateSending(msg)
          cb(resp, msg)
        }).catch(function (err) {
          node.activateSending(msg)
          cberr(err, msg)
          node.modbusErrorHandling(err)
        })
        break
      default:
        node.activateSending(msg)
        cberr(new Error('Function Code Unknown'), msg)
        nodeLog('Function Code Unknown %s', msg.payload.fc)
        break
    }
  } catch (e) {
    nodeLog(e.message)
    node.modbusErrorHandling(e)
  }
}

de.biancoroyal.modbus.core.client.writeModbus = function (node, msg, cb, cberr) {
  if (!node.client) {
    return
  }

  if (!node.bufferCommands) {
    node.stateService.send('WRITE')
  }

  node.setUnitIdFromPayload(msg)
  node.client.setTimeout(node.clientTimeout)

  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)

  node.queueLog(JSON.stringify({
    info: 'write msg',
    message: msg.payload,
    unitid: msg.queueUnitId,
    timeout: node.client.getTimeout(),
    state: node.actualServiceState.value
  }))

  try {
    switch (parseInt(msg.payload.fc)) {
      case 15: // FC: 15
        if (parseInt(msg.payload.value.length) !== parseInt(msg.payload.quantity)) {
          node.activateSending(msg)
          cberr(new Error('Quantity should be less or equal to coil payload array length: ' +
            msg.payload.value.length + ' Addr: ' + msg.payload.address + ' Q: ' + msg.payload.quantity), msg)
        } else {
          node.client.writeCoils(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
            node.activateSending(msg)
            cb(resp, msg)
          }).catch(function (err) {
            node.activateSending(msg)
            cberr(err, msg)
            node.modbusErrorHandling(err)
          })
        }
        break
      case 5: // FC: 5
        if (msg.payload.value) {
          msg.payload.value = true
        } else {
          msg.payload.value = false
        }
        node.client.writeCoil(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
          node.activateSending(msg)
          cb(resp, msg)
        }).catch(function (err) {
          node.activateSending(msg)
          cberr(err, msg)
          node.modbusErrorHandling(err)
        })
        break
      case 16: // FC: 16
        if (parseInt(msg.payload.value.length) !== parseInt(msg.payload.quantity)) {
          node.activateSending(msg)
          cberr(new Error('Quantity should be less or equal to register payload array length: ' +
            msg.payload.value.length + ' Addr: ' + msg.payload.address + ' Q: ' + msg.payload.quantity), msg)
        } else {
          node.client.writeRegisters(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
            node.activateSending(msg)
            cb(resp, msg)
          }).catch(function (err) {
            node.activateSending(msg)
            cberr(err, msg)
            node.modbusErrorHandling(err)
          })
        }
        break
      case 6: // FC: 6
        node.client.writeRegister(parseInt(msg.payload.address), parseInt(msg.payload.value)).then(function (resp) {
          node.activateSending(msg)
          cb(resp, msg)
        }).catch(function (err) {
          node.activateSending(msg)
          cberr(err, msg)
          node.modbusErrorHandling(err)
        })
        break
      default:
        node.activateSending(msg)
        cberr(new Error('Function Code Unknown'), msg)
        nodeLog('Function Code Unknown %s', msg.payload.fc)
        break
    }
  } catch (e) {
    nodeLog(e.message)
    node.modbusErrorHandling(e)
  }
}

de.biancoroyal.modbus.core.client.setNewNodeSettings = function (node, msg) {
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)

  if (!msg) {
    nodeLog('New Connection message invalid.')
    return false
  }

  switch (msg.payload.connectorType) {
    case 'TCP':
      node.tcpHost = msg.payload.tcpHost || node.tcpHost
      node.tcpPort = msg.payload.tcpPort || node.tcpPort
      node.tcpType = msg.payload.tcpType || node.tcpType
      nodeLog('New Connection Data ' + node.tcpHost + ' ' + node.tcpPort + ' ' + node.tcpType)
      break

    case 'SERIAL':
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
      nodeLog('New Connection Data ' + node.serialPort + ' ' + node.serialBaudrate + ' ' + node.serialType)
      break

    default:
      nodeLog('Unknown Dynamic Reconnect Type ' + msg.payload.connectorType)
  }

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

  return true
}

de.biancoroyal.modbus.core.client.messagesAllowedStates = ['activated', 'queueing', 'empty']

module.exports = de.biancoroyal.modbus.core.client
