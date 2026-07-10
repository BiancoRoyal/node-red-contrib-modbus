/**
 * Client ready-to-send and state helpers (Task 4).
 * @module core/client/modbus-client-state
 */
'use strict'
// SOURCE-MAP-REQUIRED

const _ = require('underscore')

/** v6: only activated accepts external Modbus commands (breaking vs v5) */
const MESSAGE_ALLOWED_STATES_V6 = Object.freeze(['activated'])

/** Internal FSM states that may dequeue the command queue */
const INTERNAL_QUEUE_STATES_V6 = Object.freeze(['activated', 'queueing', 'sending'])

/**
 * Whether the client rejects messages for the current FSM state.
 * @param {object} clientNode - modbus-client config node
 * @returns {boolean}
 */
function isClientInactive (clientNode) {
  if (!clientNode) {
    return true
  }
  return _.isUndefined(clientNode.actualServiceState) ||
    clientNode.messageAllowedStates.indexOf(clientNode.actualServiceState.value) === -1
}

/**
 * Whether the client accepts Modbus commands (v6 contract).
 * @param {object} clientNode - modbus-client config node
 * @returns {boolean}
 */
function isClientReadyToSend (clientNode) {
  if (!clientNode) {
    return false
  }
  if (isClientInactive(clientNode)) {
    return false
  }
  const state = clientNode.actualServiceState && clientNode.actualServiceState.value
  return MESSAGE_ALLOWED_STATES_V6.includes(state)
}

module.exports = {
  MESSAGE_ALLOWED_STATES_V6,
  INTERNAL_QUEUE_STATES_V6,
  isClientInactive,
  isClientReadyToSend
}
