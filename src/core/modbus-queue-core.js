/**
 Copyright (c) 2016,2017,2018,2019,2020 Klaus Landsdorf (https://bianco-royal.com/)
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
  node.sendingAllowed.clear()
  node.unitSendingAllowed = []

  for (let step = 0; step <= 255; step++) {
    node.bufferCommandList.set(step, [])
    node.sendingAllowed.set(step, true)
  }
}

de.biancoroyal.modbus.queue.core.checkQueuesAreEmpty = function (node) {
  let queueAreEmpty = true
  for (let step = 0; step <= 255; step++) {
    queueAreEmpty &= (node.bufferCommandList.get(step).length === 0)
  }
  return queueAreEmpty
}

de.biancoroyal.modbus.queue.core.sequentialDequeueCommand = function (node) {
  return new Promise(
    function (resolve, reject) {
      const queueCore = de.biancoroyal.modbus.queue.core

      if (node.parallelUnitIdsAllowed) {
        for (let unitId = 0; unitId < 256; unitId += 1) {
          queueCore.sendQueueDataToModbus(node, unitId)
        }
      } else {
        const unitId = node.unitSendingAllowed.shift()
        if (queueCore.isValidUnitId(unitId) && node.sendingAllowed.get(unitId)) {
          queueCore.sendQueueDataToModbus(node, unitId)
        }
      }
      resolve()
    })
}

de.biancoroyal.modbus.queue.core.sendQueueDataToModbus = function (node, unitId) {
  const queueLength = node.bufferCommandList.get(unitId).length
  if (!queueLength) {
    return
  }

  node.queueLog(JSON.stringify({
    type: 'queue sending data to Modbus',
    unitId,
    queueLength,
    sendingAllowed: node.sendingAllowed.get(unitId)
  }))

  const command = node.bufferCommandList.get(unitId).shift()
  if (command) {
    node.sendingAllowed.set(unitId, false)
    command.callModbus(node, command.msg, command.cb, command.cberr)
  } else {
    throw new Error('Command On Send Not Valid')
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
  return parseInt(msg.payload.unitid) || parseInt(node.unit_id)
}

de.biancoroyal.modbus.queue.core.isValidUnitId = function (unitId) {
  return (unitId >= 0 || unitId <= 255)
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
        const queueLength = coreQueue.getQueueLengthByUnitId(node, unitId)

        msg.queueLengthByUnitId = { unitId, queueLength }
        msg.queueUnitId = unitId

        if (!node.parallelUnitIdsAllowed) {
          node.unitSendingAllowed.push(unitId)
        }

        node.bufferCommandList.get(unitId).push({ callModbus: callModbus, msg: msg, cb: cb, cberr: cberr })
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

module.exports = de.biancoroyal.modbus.queue.core
