/**
 * Per-unit command queue (Task 6 — lazy init migration pending).
 * @module core/queue/modbus-queue
 */
'use strict'
// SOURCE-MAP-REQUIRED

const legacyQueue = require('../modbus-queue-core')

module.exports = {
  initQueue: legacyQueue.initQueue,
  clearUnitQueue: legacyQueue.clearUnitQueue,
  checkQueuesAreEmpty: legacyQueue.checkQueuesAreEmpty,
  pushToQueueByUnitId: legacyQueue.pushToQueueByUnitId,
  dequeueCommand: legacyQueue.dequeueCommand
}
