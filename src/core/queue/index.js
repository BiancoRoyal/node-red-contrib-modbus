/**
 * Public v6 queue core API.
 * @module core/queue
 */
'use strict'
// SOURCE-MAP-REQUIRED

const modbusQueue = require('./modbus-queue')
const modbusSerialLock = require('./modbus-serial-lock')

module.exports = {
  ...modbusQueue,
  ...modbusSerialLock
}
