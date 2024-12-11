/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/
'use strict'
// SOURCE-MAP-REQUIRED

// eslint-disable-next-line no-var
var de = de || { biancoroyal: { modbus: { basics: {} } } } // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.basics.internalDebug = de.biancoroyal.modbus.basics.internalDebug || require('debug')('contribModbus:basics') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.basics.util = de.biancoroyal.modbus.basics.util || require('util') // eslint-disable-line no-use-before-define

/**
 * Modbus core node basics.
 * @module NodeRedModbusBasics
 */
de.biancoroyal.modbus.basics.statusLog = false
/**
 *
 * @param unit
 * @returns {string}
 */
de.biancoroyal.modbus.basics.get_timeUnit_name = function (unit) {
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

de.biancoroyal.modbus.basics.calc_rateByUnit = function (rate, rateUnit) {
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
de.biancoroyal.modbus.basics.setNodeStatusProperties = function (statusValue, showActivities) {
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

de.biancoroyal.modbus.basics.setNodeStatusByResponseTo = function (statusValue, response, node) {
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

de.biancoroyal.modbus.basics.setNodeStatusResponse = function (length, node) {
  node.status({
    fill: 'green',
    shape: 'dot',
    text: 'active got length: ' + length
  })
}

de.biancoroyal.modbus.basics.setModbusError = function (node, modbusClient, err, msg) {
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

de.biancoroyal.modbus.basics.setNodeStatusTo = function (statusValue, node) {
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

de.biancoroyal.modbus.basics.onModbusInit = function (node) {
  this.setNodeStatusTo('initialize', node)
}

de.biancoroyal.modbus.basics.onModbusConnect = function (node) {
  this.setNodeStatusTo('connected', node)
}

de.biancoroyal.modbus.basics.onModbusActive = function (node) {
  this.setNodeStatusTo('active', node)
}

de.biancoroyal.modbus.basics.onModbusError = function (node, failureMsg) {
  this.setNodeStatusTo('failure', node)
  if (node.showErrors) {
    node.warn(failureMsg)
  }
}

de.biancoroyal.modbus.basics.onModbusClose = function (node) {
  this.setNodeStatusTo('closed', node)
}

de.biancoroyal.modbus.basics.onModbusQueue = function (node) {
  this.setNodeStatusTo('queueing', node)
}

de.biancoroyal.modbus.basics.onModbusBroken = function (node, modbusClient) {
  this.setNodeStatusTo('reconnecting after ' + modbusClient.reconnectTimeout + ' msec.', node)
}

de.biancoroyal.modbus.basics.setNodeDefaultStatus = function (node) {
  node.status({ fill: 'green', shape: 'ring', text: 'active' })
}

de.biancoroyal.modbus.basics.initModbusClientEvents = function (node, modbusClient) {
  if (node.showStatusActivities) {
    modbusClient.on('mbinit', () => { this.onModbusInit(node) })
    modbusClient.on('mbqueue', () => { this.onModbusQueue(node) })
    modbusClient.on('mbconnected', () => { this.onModbusConnect(node) })
    modbusClient.on('mbbroken', () => { this.onModbusBroken(node, modbusClient) })
    modbusClient.on('mbactive', () => { this.onModbusActive(node) })
    modbusClient.on('mberror', (failureMsg) => { this.onModbusError(node, failureMsg) })
    modbusClient.on('mbclosed', () => { this.onModbusClose(node) })
  } else {
    this.setNodeDefaultStatus(node)
  }
}

de.biancoroyal.modbus.registeredNodeIds = {}
de.biancoroyal.modbus.dispatchReady = false

de.biancoroyal.modbus.setupDispatcherEvents = function (modbusClient) {
  modbusClient.on('mbinit', (id, data) => { de.biancoroyal.modbus.basics.messageDispatch(id, data) })
  modbusClient.on('mbqueue', (id, data) => { de.biancoroyal.modbus.basics.messageDispatch(id, data) })
  modbusClient.on('mbconnected', (id, data) => { de.biancoroyal.modbus.basics.messageDispatch(id, data) })
  modbusClient.on('mbbroken', (id, data) => { de.biancoroyal.modbus.basics.messageDispatch(id, data) })
  modbusClient.on('mbactive', (id, data) => { de.biancoroyal.modbus.basics.messageDispatch(id, data) })
  modbusClient.on('mberror', (id, data) => { de.biancoroyal.modbus.basics.messageDispatch(id, data) })
  modbusClient.on('mbclosed', (id, data) => { de.biancoroyal.modbus.basics.messageDispatch(id, data) })
}
de.biancoroyal.modbus.basics.registerNode = function (node, modbusClient) {
  const registeredNodes = de.biancoroyal.modbus.registeredNodeIds
  if (Object.hasOwn(registeredNodes, node.id)) {
    return
  }

  if (!de.biancoroyal.modbus.dispatchReady) {
    de.biancoroyal.modbus.setupDispatcherEvents(modbusClient)
    de.biancoroyal.modbus.dispatchReady = true
  }

  registeredNodes[node.id] = node
  modbusClient.registerForModbus(node)
}

de.biancoroyal.modbus.basics.deregisterNode = function (node) {
  const registeredNodes = de.biancoroyal.modbus.registeredNodeIds
  if (!Object.hasOwn(registeredNodes, node.id)) {
    return
  }

  // TODO: Can we remove all listeners here?! If there are no active listeners?
  // TODO: Maybe clear the modbus client from the registered node id as well?
  delete registeredNodes[node.id]
}
de.biancoroyal.modbus.basics.messageDispatch = function (nodeId, actionObj) {
  const registeredNodes = de.biancoroyal.modbus.registeredNodeIds

  if (Object.hasOwn(registeredNodes, nodeId)) {
    switch (actionObj.type) {
      case 'init':
        registeredNodes[nodeId].onModbusInit(actionObj.data)
        break
      case 'queue':
        registeredNodes[nodeId].onModbusQueue(actionObj.data)
        break
      case 'connected':
        registeredNodes[nodeId].onModbusConnect(actionObj.data)
        break
      case 'broken':
        registeredNodes[nodeId].onModbusBroken(actionObj.data)
        break
      case 'active':
        registeredNodes[nodeId].onModbusActive(actionObj.data)
        break
      case 'error':
        registeredNodes[nodeId].onModbusError(actionObj.data)
        break
      case 'closed':
        registeredNodes[nodeId].onModbusClose(actionObj.data)
        break
    }
  }
}

de.biancoroyal.modbus.basics.deinitModbusClientEvents = function (modbusClient) {
  modbusClient.removeListener('mbinit', this.onModbusInit)
  modbusClient.removeListener('mbqueue', this.onModbusQueue)
  modbusClient.removeListener('mbconnected', this.onModbusConnect)
  modbusClient.removeListener('mbbroken', this.onModbusBroken)
  modbusClient.removeListener('mbactive', this.onModbusActive)
  modbusClient.removeListener('mberror', this.onModbusError)
  modbusClient.removeListener('mbclosed', this.onModbusClose)
}

de.biancoroyal.modbus.basics.invalidPayloadIn = function (msg) {
  return !(msg && Object.prototype.hasOwnProperty.call(msg, 'payload'))
}

de.biancoroyal.modbus.basics.invalidSequencesIn = function (msg) {
  return !(msg && Object.prototype.hasOwnProperty.call(msg, 'sequences'))
}

de.biancoroyal.modbus.basics.sendEmptyMsgOnFail = function (node, err, msg) {
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

de.biancoroyal.modbus.basics.logMsgError = function (node, err, msg) {
  if (node.showErrors) {
    node.error(err, msg)
  }
}

de.biancoroyal.modbus.basics.buildNewMessage = function (keepMsgProperties, msg, minMsg) {
  if (keepMsgProperties) {
    return Object.assign(msg, minMsg)
  } else {
    return minMsg
  }
}

module.exports = de.biancoroyal.modbus.basics
