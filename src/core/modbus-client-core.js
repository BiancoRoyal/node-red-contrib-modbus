/**
 Copyright (c) 2016,2017,2018,2019 Klaus Landsdorf (https://bianco-royal.com/)
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

var de = de || { biancoroyal: { modbus: { core: { client: {} } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.internalDebug = de.biancoroyal.modbus.core.client.internalDebug || require('debug')('contribModbus:core:client') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.internalDebugFSM = de.biancoroyal.modbus.core.client.internalDebugFSM || require('debug')('contribModbus:core:client:fsm') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.modbusSerialDebug = de.biancoroyal.modbus.core.client.modbusSerialDebug || require('debug')('modbus-serial') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.XStateFSM = de.biancoroyal.modbus.core.client.XStateFSM || require('@xstate/fsm') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.stateLogEnabled = de.biancoroyal.modbus.core.client.stateLogEnabled || false // eslint-disable-line no-use-before-define

de.biancoroyal.modbus.core.client.networkErrors = ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET', 'ENETRESET',
  'ECONNABORTED', 'ECONNREFUSED', 'ENETUNREACH', 'ENOTCONN',
  'ESHUTDOWN', 'EHOSTDOWN', 'ENETDOWN', 'EWOULDBLOCK', 'EAGAIN', 'EHOSTUNREACH']

de.biancoroyal.modbus.core.client.createStateMachineService = function () {
  this.stateLogEnabled = false

  return this.XStateFSM.createMachine({
    id: 'modbus',
    initial: 'new',
    states: {
      new: {
        on: { INIT: 'init', STOP: 'stopped' }
      },
      broken: {
        on: { INIT: 'init', STOP: 'stopped', FAILURE: 'failed', CLOSE: 'closed' }
      },
      init: {
        on: { OPENSERIAL: 'opened', CONNECT: 'connected', FAILURE: 'failed' }
      },
      opened: {
        on: { CONNECT: 'connected', FAILURE: 'failed', CLOSE: 'closed' }
      },
      connected: {
        on: { CLOSE: 'closed', ACTIVATE: 'activated', FAILURE: 'failed' }
      },
      activated: {
        on: {
          CLOSE: 'closed',
          READ: 'reading',
          WRITE: 'writing',
          QUEUE: 'queueing',
          FAILURE: 'failed'
        }
      },
      queueing: {
        on: {
          ACTIVATE: 'activated',
          READ: 'reading',
          WRITE: 'writing',
          EMPTY: 'empty',
          FAILURE: 'failed',
          CLOSE: 'closed'
        }
      },
      empty: { on: { QUEUE: 'queueing', FAILURE: 'failed', CLOSE: 'closed' } },
      reading: { on: { ACTIVATE: 'activated', FAILURE: 'failed' } },
      writing: { on: { ACTIVATE: 'activated', FAILURE: 'failed' } },
      closed: { on: { FAILURE: 'failed', BREAK: 'broken', CONNECT: 'connected' } },
      failed: { on: { CLOSE: 'closed', BREAK: 'broken', STOP: 'stopped' } },
      stopped: { on: { NEW: 'new', STOP: 'stopped' } }
    }
  })
}

de.biancoroyal.modbus.core.client.startStateService = function (toggleMachine) {
  return this.XStateFSM.interpret(toggleMachine).start()
}

de.biancoroyal.modbus.core.client.messagesAllowedStates = ['activated', 'queueing', 'empty']

module.exports = de.biancoroyal.modbus.core.client
