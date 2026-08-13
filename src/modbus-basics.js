/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/
'use strict'
// SOURCE-MAP-REQUIRED

const internalDebug = require('debug')('contribModbus:basics')
const util = require('util')

/**
 * Modbus core node basics.
 * @module NodeRedModbusBasics
 */
const basics = {}

basics.internalDebug = internalDebug
basics.util = util
basics.statusLog = false

/**
 *
 * @param unit
 * @returns {string}
 */
basics.get_timeUnit_name = function (unit) {
  let unitAbbreviation = ''

  switch (unit) {
    case 'ms':
      unitAbbreviation = 'msec.'
      break
    case 's':
      unitAbbreviation = 'sec.'
      break
    case 'm':
      unitAbbreviation = 'min.'
      break
    case 'h':
      unitAbbreviation = 'h.'
      break
    default:
      break
  }

  return unitAbbreviation
}

basics.calc_rateByUnit = function (rate, rateUnit) {
  switch (rateUnit) {
    case 'ms':
      break
    case 's':
      rate = parseInt(rate) * 1000 // seconds
      break
    case 'm':
      rate = parseInt(rate) * 60000 // minutes
      break
    case 'h':
      rate = parseInt(rate) * 3600000 // hours
      break
    default:
      rate = 10000 // 10 sec.
      break
  }

  return rate
}
/**
 *
 * @param statusValue
 * @param showActivities
 * @returns {{fill: string, shape: string, status: *}}
 */
basics.setNodeStatusProperties = function (statusValue, showActivities) {
  let fillValue = 'yellow'
  let shapeValue = 'ring'

  if (!statusValue) {
    statusValue = 'waiting'
  }

  let statusText = statusValue.value || statusValue

  switch (statusText) {
    case 'connecting':
      fillValue = 'yellow'
      shapeValue = 'ring'
      break

    case 'error':
      fillValue = 'red'
      shapeValue = 'ring'
      break

    case 'initialized':
    case 'init':
      fillValue = 'yellow'
      shapeValue = 'dot'
      break

    case 'not ready to read':
    case 'not ready to write':
      fillValue = 'yellow'
      shapeValue = 'ring'
      break

    case 'connected':
    case 'queueing':
    case 'queue':
      fillValue = 'green'
      shapeValue = 'ring'
      break

    case 'timeout':
      fillValue = 'red'
      shapeValue = 'ring'
      break

    case 'active':
    case 'reading':
    case 'writing':
    case 'active reading':
    case 'active writing':
      if (!showActivities) {
        statusText = 'active'
      }
      fillValue = 'green'
      shapeValue = 'dot'
      break

    case 'disconnected':
    case 'terminated':
      fillValue = 'red'
      shapeValue = 'ring'
      break

    case 'stopped':
      fillValue = 'red'
      shapeValue = 'dot'
      break

    case 'polling':
      fillValue = 'green'
      if (showActivities) {
        shapeValue = 'ring'
      } else {
        statusText = 'active'
        shapeValue = 'dot'
      }
      break

    default:
      if (statusText === 'waiting') {
        fillValue = 'blue'
        statusText = 'waiting ...'
      }
      break
  }

  return { fill: fillValue, shape: shapeValue, status: statusText }
}

basics.setNodeStatusByResponseTo = function (statusValue, response, node) {
  let fillValue = 'red'
  let shapeValue = 'dot'

  switch (statusValue) {
    case 'initialized':
    case 'queue':
      fillValue = 'green'
      shapeValue = 'ring'
      break

    case 'active':
      fillValue = 'green'
      shapeValue = 'dot'
      break

    default:
      if (!statusValue || statusValue === 'waiting') {
        fillValue = 'blue'
        statusValue = 'waiting ...'
      }
      break
  }

  node.status({ fill: fillValue, shape: shapeValue, text: this.util.inspect(response, false, null) })
}

basics.setNodeStatusResponse = function (length, node) {
  node.status({
    fill: 'green',
    shape: 'dot',
    text: 'active got length: ' + length
  })
}

basics.setModbusError = function (node, modbusClient, err, msg) {
  if (err) {
    switch (err.message) {
      case 'Timed out':
        this.setNodeStatusTo('timeout', node)
        break
      case 'FSM Not Ready To Reconnect':
        this.setNodeStatusTo('not ready to reconnect', node)
        break
      case 'Port Not Open':
        this.setNodeStatusTo('reconnect', node)
        modbusClient.emit('reconnect')
        break
      default:
        this.internalDebug(err.message)
        if (node.showErrors) {
          this.setNodeStatusTo('error ' + err.message, node)
        }
    }
  }
}

basics.setNodeStatusTo = function (statusValue, node) {
  if (node.showStatusActivities) {
    if (statusValue !== node.statusText) {
      const statusOptions = this.setNodeStatusProperties(statusValue, node.showStatusActivities)
      node.statusText = statusValue
      node.status({
        fill: statusOptions.fill,
        shape: statusOptions.shape,
        text: statusOptions.status
      })
    } else {
      this.setNodeDefaultStatus(node)
    }
  }
}

basics.onModbusInit = function (node) {
  this.setNodeStatusTo('initialize', node)
}

basics.onModbusConnect = function (node) {
  this.setNodeStatusTo('connected', node)
}

basics.onModbusActive = function (node) {
  this.setNodeStatusTo('active', node)
}

basics.onModbusError = function (node, failureMsg) {
  this.setNodeStatusTo('failure', node)
  if (node.showErrors) {
    node.warn(failureMsg)
  }
}

basics.onModbusClose = function (node) {
  this.setNodeStatusTo('closed', node)
}

basics.onModbusQueue = function (node) {
  this.setNodeStatusTo('queueing', node)
}

basics.onModbusBroken = function (node, modbusClient) {
  this.setNodeStatusTo('broken', node)
  if (modbusClient && modbusClient.reconnectOnTimeout) {
    // Attempt counter is set when entering reconnecting (mbreconnecting)
    this.setNodeStatusTo(
      'retrying after ' + modbusClient.reconnectTimeout + ' msec.',
      node
    )
  }
}

basics.onModbusReconnecting = function (node, modbusClient, attempt) {
  const n = attempt || (modbusClient && modbusClient.reconnectAttempt) || 0
  const attemptSuffix = n > 0 ? ' (attempt ' + n + ')' : ''
  this.setNodeStatusTo(
    'retrying after ' + modbusClient.reconnectTimeout + ' msec.' + attemptSuffix,
    node
  )
}

basics.setNodeDefaultStatus = function (node) {
  node.status({ fill: 'green', shape: 'ring', text: 'active' })
}

basics.initModbusClientEvents = function (node, modbusClient) {
  if (node.showStatusActivities) {
    modbusClient.on('mbinit', () => { this.onModbusInit(node) })
    modbusClient.on('mbqueue', () => { this.onModbusQueue(node) })
    modbusClient.on('mbconnected', () => { this.onModbusConnect(node) })
    modbusClient.on('mbbroken', () => { this.onModbusBroken(node, modbusClient) })
    modbusClient.on('mbreconnecting', (attempt) => { this.onModbusReconnecting(node, modbusClient, attempt) })
    modbusClient.on('mbactive', () => { this.onModbusActive(node) })
    modbusClient.on('mberror', (failureMsg) => { this.onModbusError(node, failureMsg) })
    modbusClient.on('mbclosed', () => { this.onModbusClose(node) })
  } else {
    this.setNodeDefaultStatus(node)
  }
}

basics.invalidPayloadIn = function (msg) {
  return !(msg && Object.prototype.hasOwnProperty.call(msg, 'payload'))
}

basics.invalidSequencesIn = function (msg) {
  return !(msg && Object.prototype.hasOwnProperty.call(msg, 'sequences'))
}

basics.sendEmptyMsgOnFail = function (node, err, msg) {
  if (node.emptyMsgOnFail) {
    msg.payload = ''

    if (err && err.message && err.name) {
      msg.error = err
    } else {
      msg.error = Error(err)
    }
    msg.error.nodeStatus = node.statusText

    node.send([msg, msg])
  }
}

basics.logMsgError = function (node, err, msg) {
  if (node.showErrors) {
    node.error(err, msg)
  }
}

basics.buildNewMessage = function (keepMsgProperties, msg, minMsg) {
  if (keepMsgProperties) {
    return Object.assign(msg, minMsg)
  } else {
    return minMsg
  }
}

module.exports = basics
