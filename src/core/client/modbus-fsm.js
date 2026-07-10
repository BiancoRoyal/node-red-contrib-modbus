/**
 * Modbus client FSM — v6 (12 states)
 * @module core/client/modbus-fsm
 */
'use strict'
// SOURCE-MAP-REQUIRED

const XStateFSM = require('@xstate/fsm')

/** v6 FSM state names (16 to 12 simplification) */
const V6_FSM_STATES = Object.freeze([
  'init',
  'opened',
  'connected',
  'activated',
  'queueing',
  'sending',
  'closed',
  'reconnecting',
  'failed',
  'broken',
  'switch',
  'stopped'
])

/**
 * Create the v6 Modbus client state machine definition.
 * Removed vs v5: new, reading, writing, empty (mapped in handler — Task 3).
 * @returns {object} XState state machine config
 */
function createModbusFsm () {
  return XStateFSM.createMachine({
    id: 'modbus',
    initial: 'init',
    states: {
      init: {
        on: {
          OPENSERIAL: 'opened',
          CONNECT: 'connected',
          BREAK: 'broken',
          FAILURE: 'failed',
          STOP: 'stopped',
          SWITCH: 'switch'
        }
      },
      opened: {
        on: {
          CONNECT: 'connected',
          BREAK: 'broken',
          FAILURE: 'failed',
          CLOSE: 'closed',
          STOP: 'stopped',
          SWITCH: 'switch'
        }
      },
      connected: {
        on: {
          CLOSE: 'closed',
          ACTIVATE: 'activated',
          QUEUE: 'queueing',
          BREAK: 'broken',
          FAILURE: 'failed',
          STOP: 'stopped',
          SWITCH: 'switch'
        }
      },
      activated: {
        on: {
          QUEUE: 'queueing',
          BREAK: 'broken',
          CLOSE: 'closed',
          FAILURE: 'failed',
          STOP: 'stopped',
          SWITCH: 'switch'
        }
      },
      queueing: {
        on: {
          ACTIVATE: 'activated',
          SEND: 'sending',
          BREAK: 'broken',
          CLOSE: 'closed',
          FAILURE: 'failed',
          STOP: 'stopped',
          SWITCH: 'switch'
        }
      },
      sending: {
        on: {
          ACTIVATE: 'activated',
          BREAK: 'broken',
          FAILURE: 'failed',
          STOP: 'stopped',
          SWITCH: 'switch'
        }
      },
      closed: {
        on: {
          FAILURE: 'failed',
          BREAK: 'broken',
          CONNECT: 'connected',
          RECONNECT: 'reconnecting',
          INIT: 'init',
          STOP: 'stopped',
          SWITCH: 'switch'
        }
      },
      reconnecting: {
        on: {
          INIT: 'init',
          STOP: 'stopped'
        }
      },
      failed: {
        on: {
          CLOSE: 'closed',
          BREAK: 'broken',
          STOP: 'stopped',
          SWITCH: 'switch'
        }
      },
      broken: {
        on: {
          INIT: 'init',
          STOP: 'stopped',
          FAILURE: 'failed',
          ACTIVATE: 'activated',
          RECONNECT: 'reconnecting'
        }
      },
      switch: {
        on: {
          CLOSE: 'closed',
          BREAK: 'broken',
          STOP: 'stopped'
        }
      },
      stopped: {
        on: {
          INIT: 'init',
          STOP: 'stopped'
        }
      }
    }
  })
}

/**
 * Interpret and start an FSM instance.
 * @param {object} machine - machine from createModbusFsm
 * @returns {object} started XState interpreter
 */
function startFsmService (machine) {
  return XStateFSM.interpret(machine).start()
}

module.exports = {
  V6_FSM_STATES,
  createModbusFsm,
  startFsmService
}
