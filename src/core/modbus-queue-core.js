/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus
 node-red-contrib-modbusio

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

// eslint-disable-next-line no-var
var de = de || { biancoroyal: { modbus: { queue: { core: {} } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.queue.core.internalDebug = de.biancoroyal.modbus.queue.core.internalDebug || require('debug')('contribModbus:queue:core') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.queue.core.core = de.biancoroyal.modbus.queue.core.core || require('./modbus-core') // eslint-disable-line no-use-before-define

de.biancoroyal.modbus.queue.core.initQueue = function (node) {
  node.bufferCommandList.clear()
  node.sendingAllowed.clear()
  node.unitSendingAllowed = []

  for (let step = 0; step <= 255; step++) {
    node.bufferCommandList.set(step, [])
    node.sendingAllowed.set(step, true)
  }
}

de.biancoroyal.modbus.queue.core.checkQueuesAreEmpty = function (node) {
  let queuesAreEmpty = true
  for (let step = 0; step <= 255; step++) {
    queuesAreEmpty &= (node.bufferCommandList.get(step).length === 0)
  }
  return queuesAreEmpty
}

de.biancoroyal.modbus.queue.core.queueSerialUnlockCommand = function (node) {
  this.internalDebug('queue serial unlock command node name: ' + node.name + ' id: ' + node.id)
  node.serialSendingAllowed = true
}

de.biancoroyal.modbus.queue.core.queueSerialLockCommand = function (node) {
  this.internalDebug('queue serial lock command node name: ' + node.name + ' id: ' + node.id)
  node.serialSendingAllowed = false
}

de.biancoroyal.modbus.queue.core.sequentialDequeueCommand = function (node) {
  this.internalDebug('sequential de-queue command')
  return new Promise(
    function (resolve, reject) {
      const queueCore = de.biancoroyal.modbus.queue.core

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

de.biancoroyal.modbus.queue.core.sendQueueDataToModbus = function (node, unitId) {
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

de.biancoroyal.modbus.queue.core.dequeueLogEntry = function (node, state, info) {
  node.queueLog(JSON.stringify({
    state: state.value,
    message: `${info} ${node.clienttype}`,
    delay: node.commandDelay
  }))
}

de.biancoroyal.modbus.queue.core.dequeueCommand = function (node) {
  const queueCore = de.biancoroyal.modbus.queue.core
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

de.biancoroyal.modbus.queue.core.getUnitIdToQueue = function (node, msg) {
  return parseInt(msg.payload.unitid) || parseInt(node.unit_id) || 0
}

de.biancoroyal.modbus.queue.core.isValidUnitId = function (unitId) {
  return (unitId >= 0 && unitId <= 255)
}

de.biancoroyal.modbus.queue.core.getQueueLengthByUnitId = function (node, unitId) {
  if (this.isValidUnitId(unitId)) {
    return node.bufferCommandList.get(unitId).length
  } else {
    throw new Error('(0-255) Got A Wrong Unit-Id: ' + unitId)
  }
}

de.biancoroyal.modbus.queue.core.pushToQueueByUnitId = function (node, callModbus, msg, cb, cberr) {
  const coreQueue = de.biancoroyal.modbus.queue.core

  return new Promise(
    function (resolve, reject) {
      try {
        const unitId = coreQueue.getUnitIdToQueue(node, msg)
        if (!coreQueue.isValidUnitId(unitId)) {
          reject(new Error('UnitId ' + unitId + ' is not valid from msg or node'))
          return
        } else {
          node.queueLog(JSON.stringify({
            info: 'will push to Queue by Unit-Id',
            message: msg.payload,
            unitId
          }))
        }
        const queueLength = coreQueue.getQueueLengthByUnitId(node, unitId)

        msg.queueLengthByUnitId = { unitId, queueLength }
        msg.queueUnitId = unitId

        if (!node.parallelUnitIdsAllowed || node.clienttype === 'serial') {
          node.unitSendingAllowed.push(unitId)
        }

        node.bufferCommandList.get(unitId).push({ callModbus, msg, cb, cberr })
        node.queueLog(JSON.stringify({
          info: 'pushed to Queue by Unit-Id',
          message: msg.payload,
          unitId
        }))
        resolve()
      } catch (err) {
        /* istanbul ignore next */
        reject(err)
      }
    })
}

module.exports = de.biancoroyal.modbus.queue.core
