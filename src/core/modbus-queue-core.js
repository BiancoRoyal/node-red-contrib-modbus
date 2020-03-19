/**
 Copyright (c) 2016,2017,2018,2019 Klaus Landsdorf (https://bianco-royal.com/)
 All rights reserved.
 node-red-contrib-modbus
 node-red-contrib-modbusio

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

var de = de || { biancoroyal: { modbus: { queue: { core: {} } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.queue.core.internalDebug = de.biancoroyal.modbus.queue.core.internalDebug || require('debug')('contribModbus:queue:core') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.queue.core.core = de.biancoroyal.modbus.queue.core.core || require('./modbus-core') // eslint-disable-line no-use-before-define

de.biancoroyal.modbus.queue.core.initQueue = function (node) {
  node.bufferCommandList.clear()
  node.sendAllowed.clear()
  node.sendToDeviceAllowed = []
  node.unitSendingAllowed = []

  for (let step = 0; step <= 255; step++) {
    node.bufferCommandList.set(step, [])
    node.sendAllowed.set(step, true)
  }
}

de.biancoroyal.modbus.queue.core.checkQueuesAreEmpty = function (node) {
  let queueIsEmpty = true
  for (let step = 0; step <= 255; step++) {
    queueIsEmpty &= (node.bufferCommandList.get(step).length > 0)
  }
  return queueIsEmpty
}

de.biancoroyal.modbus.queue.core.sequentialDequeueCommand = function (node) {
  const queueCore = de.biancoroyal.modbus.queue.core
  const nodesToWaitCount = node.unitSendingAllowed.length
  const serialUnit = parseInt(node.unitSendingAllowed.shift())
  let noneCommandToSent = true

  if (Number.isInteger(serialUnit) &&
    node.bufferCommandList.get(serialUnit).length > 0) {
    if (node.parallelUnitIdsAllowed) {
      noneCommandToSent = queueCore.sendDataInParallel(node, serialUnit, nodesToWaitCount)
    } else {
      noneCommandToSent = queueCore.sendDataPerDevice(node, serialUnit, nodesToWaitCount)
    }
  } else {
    node.queueLog(JSON.stringify({
      type: 'queue check is not a unit',
      unitid: serialUnit
    }))
  }

  if (noneCommandToSent) {
    node.stateService.send('EMPTY')
  }
}

de.biancoroyal.modbus.queue.core.sendDataInParallel = function (node, serialUnit, nodesToWaitCount) {
  let command = null
  let noneCommandToSent = true

  node.queueLog(JSON.stringify({
    type: 'queue check',
    unitid: serialUnit,
    sendAllowed: node.sendAllowed.get(serialUnit),
    queueLength: node.bufferCommandList.get(serialUnit).length
  }))

  if (node.sendAllowed.get(serialUnit)) {
    command = node.bufferCommandList.get(serialUnit).shift()
    if (command) {
      node.sendAllowed.set(serialUnit, false)
      node.queueLog(JSON.stringify({
        type: 'serial sending and wait per unitid',
        unitid: serialUnit,
        // commandData: command,
        queueLength: node.bufferCommandList.get(serialUnit).length,
        sendAllowedForNext: node.sendAllowed.get(serialUnit),
        delay: node.commandDelay
      }))

      if (node.bufferCommandList.get(serialUnit).length > 0) {
        node.unitSendingAllowed.push(serialUnit)
      }
      noneCommandToSent = false
      command.callModbus(node, command.msg, command.cb, command.cberr)
    }
  }

  return noneCommandToSent
}

de.biancoroyal.modbus.queue.core.sendDataPerDevice = function (node, serialUnit, nodesToWaitCount) {
  let command = null
  let noneCommandToSent = true

  node.queueLog(JSON.stringify({
    type: 'queue check',
    unitid: serialUnit,
    sendAllowed: node.sendAllowed.get(serialUnit),
    queueLength: node.bufferCommandList.get(serialUnit).length
  }))

  if (node.sendToDeviceAllowed.length === 0) {
    command = node.bufferCommandList.get(serialUnit).shift()
    if (command) {
      node.sendToDeviceAllowed.push(serialUnit)
      node.queueLog(JSON.stringify({
        type: 'serial sending and wait',
        unitid: serialUnit,
        // commandData: command,
        queueLength: node.bufferCommandList.get(serialUnit).length,
        sendAllowedForNext: node.sendToDeviceAllowed.length,
        delay: node.commandDelay
      }))

      if (node.bufferCommandList.get(serialUnit).length > 0) {
        node.unitSendingAllowed.push(serialUnit)
      }
      noneCommandToSent = false
      command.callModbus(node, command.msg, command.cb, command.cberr)
    }
  }

  return noneCommandToSent
}

de.biancoroyal.modbus.queue.core.dequeueCommand = function (node) {
  const queueCore = de.biancoroyal.modbus.queue.core
  const state = node.actualServiceState

  if (node.messageAllowedStates.indexOf(state.value) === -1) {
    node.queueLog(JSON.stringify({
      state: state.value,
      message: 'dequeue command disallowed state',
      delay: node.commandDelay
    }))
  } else {
    node.queueLog(JSON.stringify({
      state: state.value,
      message: 'dequeue command ' + node.clienttype,
      delay: node.commandDelay
    }))

    queueCore.sequentialDequeueCommand(node)
  }

  if (queueCore.checkQueuesAreEmpty(node)) {
    node.stateService.send('EMPTY')
  }
}

de.biancoroyal.modbus.queue.core.getQueueNumber = function (node, msg) {
  const unit = parseInt(msg.payload.unitid)

  if (Number.isInteger(unit)) {
    return node.bufferCommandList.get(unit).length
  } else {
    return node.bufferCommandList.get(node.unit_id).length
  }
}

de.biancoroyal.modbus.queue.core.pushToQueueByUnitId = function (node, callModbus, msg, cb, cberr) {
  const unit = parseInt(msg.payload.unitid)

  if (Number.isInteger(unit)) {
    msg.queueUnit = unit
    node.queueLog(JSON.stringify({
      info: 'push to Queue by Unit-Id',
      message: msg.payload,
      unit: unit,
      sendingListLength: node.unitSendingAllowed.length
    }))

    node.unitSendingAllowed.push(unit)
    node.bufferCommandList.get(unit).push({ callModbus: callModbus, msg: msg, cb: cb, cberr: cberr })
  } else {
    msg.queueUnit = node.unit_id
    node.queueLog(JSON.stringify({
      info: 'push to Queue by default Unit-Id',
      message: msg.payload,
      unit: node.unit_id,
      sendingListLength: node.unitSendingAllowed.length
    }))

    if (node.unitSendingAllowed.indexOf(node.unit_id) === -1) {
      node.unitSendingAllowed.push(node.unit_id)
    }

    node.bufferCommandList.get(node.unit_id).push({ callModbus: callModbus, msg: msg, cb: cb, cberr: cberr })
  }
}

module.exports = de.biancoroyal.modbus.queue.core
