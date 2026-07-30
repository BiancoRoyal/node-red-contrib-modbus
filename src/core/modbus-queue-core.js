/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus
 node-red-contrib-modbusio

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

const internalDebug = require('debug')('contribModbus:queue:core')
const coreModule = require('./modbus-core')

const queueCore = {}

queueCore.internalDebug = internalDebug
queueCore.core = coreModule

/**
 * Notify pending buffered commands before wipe (FR-Q-WIPE).
 * Stable message for Catch / emptyMsgOnFail flows.
 */
queueCore.QUEUE_CLEARED_ON_RECONNECT = 'Modbus queue cleared on reconnect'

queueCore.failPendingQueueCommands = function (node, err) {
  const error = err || new Error(queueCore.QUEUE_CLEARED_ON_RECONNECT)
  if (!node.bufferCommandList || typeof node.bufferCommandList.get !== 'function') {
    return
  }
  for (let step = 0; step <= 255; step++) {
    const list = node.bufferCommandList.get(step)
    if (!list || !list.length) continue
    while (list.length) {
      const command = list.shift()
      if (command && typeof command.cberr === 'function') {
        try {
          command.cberr(error, command.msg)
        } catch (cbErr) {
          queueCore.internalDebug('failPendingQueueCommands cberr: ' + cbErr.message)
        }
      }
    }
  }
}

queueCore.initQueue = function (node) {
  // FR-Q-WIPE: deliver defined errors before dropping buffered work
  queueCore.failPendingQueueCommands(node)

  node.bufferCommandList.clear()
  node.sendingAllowed.clear()
  node.unitSendingAllowed = []

  for (let step = 0; step <= 255; step++) {
    node.bufferCommandList.set(step, [])
    node.sendingAllowed.set(step, true)
  }
}

queueCore.checkQueuesAreEmpty = function (node) {
  let queuesAreEmpty = true
  for (let step = 0; step <= 255; step++) {
    queuesAreEmpty &= (node.bufferCommandList.get(step).length === 0)
  }
  return queuesAreEmpty
}

queueCore.queueSerialUnlockCommand = function (node) {
  this.internalDebug('queue serial unlock command node name: ' + node.name + ' id: ' + node.id)
  node.serialSendingAllowed = true
}

queueCore.queueSerialLockCommand = function (node) {
  this.internalDebug('queue serial lock command node name: ' + node.name + ' id: ' + node.id)
  node.serialSendingAllowed = false
}

queueCore.sequentialDequeueCommand = function (node) {
  this.internalDebug('sequential de-queue command')
  return new Promise(
    function (resolve, reject) {
      if (node.parallelUnitIdsAllowed) {
        for (let unitId = 0; unitId < 256; unitId += 1) {
          queueCore.sendQueueDataToModbus(node, unitId)
        }
      } else {
        const unitId = node.unitSendingAllowed.shift()
        if (!queueCore.isValidUnitId(unitId)) {
          reject(new Error('UnitId ' + unitId + ' is not valid from dequeue of sending list'))
          return
        }

        node.queueLog(JSON.stringify({
          type: 'sequential dequeue command',
          unitId,
          isValidUnitId: queueCore.isValidUnitId(unitId),
          sendingAllowed: node.sendingAllowed.get(unitId),
          serialSendingAllowed: node.serialSendingAllowed
        }))

        if (queueCore.isValidUnitId(unitId) &&
          node.sendingAllowed.get(unitId)) {
          queueCore.sendQueueDataToModbus(node, unitId)
        } else {
          node.warn('sequential dequeue command not possible for Unit ' + unitId)
          let infoText = 'sending is allowed for Unit '
          if (node.sendingAllowed.get(unitId)) {
            node.warn(infoText + unitId)
          } else {
            node.warn('no ' + infoText + unitId)
          }
          infoText = 'valid Unit '
          if (queueCore.isValidUnitId(unitId)) {
            node.warn(infoText + unitId)
          } else {
            node.warn('no ' + infoText + unitId)
          }
          infoText = ' serial sending allowed for Unit '
          if (node.serialSendingAllowed) {
            node.warn(node.name + infoText + unitId)
          } else {
            node.warn(node.name + ' no' + infoText + unitId)
          }
        }
      }
      resolve()
    })
}

queueCore.sendQueueDataToModbus = function (node, unitId) {
  const queueLength = node.bufferCommandList.get(unitId).length
  node.queueLog(JSON.stringify({
    type: 'send queue data to Modbus',
    unitId,
    queueLength,
    sendingAllowed: node.sendingAllowed.get(unitId),
    serialSendingAllowed: node.serialSendingAllowed
  }))

  if (queueLength) {
    const command = node.bufferCommandList.get(unitId).shift()
    if (command) {
      node.sendingAllowed.set(unitId, false)
      command.callModbus(node, command.msg, command.cb, command.cberr)
    } else {
      throw new Error('Command On Send Not Valid')
    }
  }
}

queueCore.dequeueLogEntry = function (node, state, info) {
  node.queueLog(JSON.stringify({
    state: state.value,
    message: `${info} ${node.clienttype}`,
    delay: node.commandDelay
  }))
}

queueCore.dequeueCommand = function (node) {
  const state = node.actualServiceState

  if (node.messageAllowedStates.indexOf(state.value) === -1) {
    queueCore.dequeueLogEntry(node, state, 'dequeue command disallowed state')
  } else {
    queueCore.sequentialDequeueCommand(node).then(function () {
      queueCore.dequeueLogEntry(node, state, 'dequeue command done')
    }).catch(function (err) {
      queueCore.dequeueLogEntry(node, state, 'dequeue command error ' + err.message)
    })
  }
}

queueCore.getUnitIdToQueue = function (node, msg) {
  return parseInt(msg.payload.unitid) || parseInt(node.unit_id) || 0
}

queueCore.isValidUnitId = function (unitId) {
  return (unitId >= 0 && unitId <= 255)
}

queueCore.getQueueLengthByUnitId = function (node, unitId) {
  if (this.isValidUnitId(unitId)) {
    return node.bufferCommandList.get(unitId).length
  } else {
    throw new Error('(0-255) Got A Wrong Unit-Id: ' + unitId)
  }
}

queueCore.pushToQueueByUnitId = function (node, callModbus, msg, cb, cberr) {
  return new Promise(
    function (resolve, reject) {
      try {
        const unitId = queueCore.getUnitIdToQueue(node, msg)
        if (!queueCore.isValidUnitId(unitId)) {
          reject(new Error('UnitId ' + unitId + ' is not valid from msg or node'))
          return
        } else {
          node.queueLog(JSON.stringify({
            info: 'will push to Queue by Unit-Id',
            message: msg.payload,
            unitId
          }))
        }
        const queueLength = queueCore.getQueueLengthByUnitId(node, unitId)

        const maxDepth = node.maxQueueDepth || 100
        if (queueLength >= maxDepth) {
          reject(new Error('Queue full for UnitId ' + unitId + ' (max ' + maxDepth + ')'))
          return
        }

        msg.queueLengthByUnitId = { unitId, queueLength }
        msg.queueUnitId = unitId

        if (!node.parallelUnitIdsAllowed || node.clienttype === 'serial') {
          if (!node.unitSendingAllowed.includes(unitId)) {
            node.unitSendingAllowed.push(unitId)
          }
        }

        node.bufferCommandList.get(unitId).push({ callModbus, msg, cb, cberr })
        node.queueLog(JSON.stringify({
          info: 'pushed to Queue by Unit-Id',
          message: msg.payload,
          unitId
        }))
        resolve()
      } catch (err) {
        reject(err)
      }
    })
}

module.exports = queueCore
