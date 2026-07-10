/**
 * Serial bus lock gating (Task 6 extraction).
 * @module core/queue/modbus-serial-lock
 */
'use strict'
// SOURCE-MAP-REQUIRED

const legacyQueue = require('../modbus-queue-core')

module.exports = {
  queueSerialLockCommand: legacyQueue.queueSerialLockCommand,
  queueSerialUnlockCommand: legacyQueue.queueSerialUnlockCommand
}
