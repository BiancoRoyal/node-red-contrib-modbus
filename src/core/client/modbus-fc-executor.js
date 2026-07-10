/**
 * Modbus FC 1–16 read/write execution (Task 7).
 * @module core/client/modbus-fc-executor
 */
'use strict'
// SOURCE-MAP-REQUIRED

const legacyCore = require('../modbus-client-core')

module.exports = {
  readModbusByFunctionCode: legacyCore.readModbusByFunctionCode,
  activateSendingOnSuccess: legacyCore.activateSendingOnSuccess,
  activateSendingOnFailure: legacyCore.activateSendingOnFailure
}
