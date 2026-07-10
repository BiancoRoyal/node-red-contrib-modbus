/**
 * TCP / Serial / TLS connection factory (Task 8).
 * @module core/client/modbus-connection
 */
'use strict'
// SOURCE-MAP-REQUIRED

const legacyCore = require('../modbus-client-core')

/**
 * Network error codes treated as recoverable (delegates to legacy list).
 * @type {string[]}
 */
const NETWORK_ERRORS = legacyCore.networkErrors

module.exports = {
  NETWORK_ERRORS
}
