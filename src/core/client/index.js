/**
 * Public v6 client core API.
 * @module core/client
 */
'use strict'
// SOURCE-MAP-REQUIRED

const modbusFsm = require('./modbus-fsm')
const modbusFsmHandler = require('./modbus-fsm-handler')
const modbusConnection = require('./modbus-connection')
const modbusFcExecutor = require('./modbus-fc-executor')
const modbusClientState = require('./modbus-client-state')

module.exports = {
  ...modbusFsm,
  ...modbusFsmHandler,
  ...modbusConnection,
  ...modbusFcExecutor,
  ...modbusClientState
}
