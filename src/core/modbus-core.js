/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

// eslint-disable-next-line no-var
var de = de || { biancoroyal: { modbus: { core: {} } } } // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.internalDebug = de.biancoroyal.modbus.core.internalDebug || require('debug')('contribModbus:core') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.ObjectID = de.biancoroyal.modbus.core.ObjectID || require('bson').BSON.ObjectId // eslint-disable-line no-use-before-define

de.biancoroyal.modbus.core.getObjectId = function () {
  return new de.biancoroyal.modbus.core.ObjectID()
}

/**
 * Deep clone a Buffer to prevent corruption in Node-RED 4.1.0+
 *
 * Node-RED 4.1.0+ requires explicit buffer cloning to prevent message corruption
 * when buffers are modified downstream. This function creates a safe copy.
 *
 * @param {Buffer} buffer - The buffer to clone
 * @returns {Buffer|*} - Deep cloned buffer or original value if not a buffer
 * @example
 * const originalBuffer = Buffer.from([0x01, 0x02, 0x03]);
 * const safeBuffer = cloneBuffer(originalBuffer);
 * safeBuffer[0] = 0xFF; // Won't affect originalBuffer
 */
de.biancoroyal.modbus.core.cloneBuffer = function (buffer) {
  // Node-RED 4.1.0+ compatibility: Deep clone buffers to prevent corruption
  if (Buffer.isBuffer(buffer)) {
    const clone = Buffer.allocUnsafe(buffer.length)
    buffer.copy(clone)
    return clone
  }
  return buffer
}

de.biancoroyal.modbus.core.getOriginalMessage = function (messageList, msg) {
  let origMsg = messageList.get(msg.payload.messageId || msg.messageId)

  if (origMsg && origMsg.messageId) {
    if (!messageList.delete(origMsg.messageId)) {
      de.biancoroyal.modbus.core.internalDebug('WARNING: getOriginalMessage could not delete message from map ' + origMsg.messageId)
    }
  } else {
    de.biancoroyal.modbus.core.internalDebug('Message Not Found ' + msg.payload.messageId)
    origMsg = msg
  }

  return origMsg
}

/**
 * Get Modbus function code for read operations
 *
 * Maps data type strings to their corresponding Modbus function codes for reading.
 * Used by read nodes to determine the appropriate Modbus command.
 *
 * @param {string} dataType - The type of data to read
 * @param {string} dataType.Coil - Read coils (discrete outputs)
 * @param {string} dataType.Input - Read discrete inputs
 * @param {string} dataType.HoldingRegister - Read holding registers (read/write)
 * @param {string} dataType.InputRegister - Read input registers (read-only)
 * @returns {number} Modbus function code (1-4) or -1 if invalid
 * @example
 * functionCodeModbusRead('HoldingRegister'); // Returns 3
 * functionCodeModbusRead('Coil'); // Returns 1
 * functionCodeModbusRead('Invalid'); // Returns -1
 */
de.biancoroyal.modbus.core.functionCodeModbusRead = function (dataType) {
  switch (dataType) {
    case 'Coil':
      return 1
    case 'Input':
      return 2
    case 'HoldingRegister':
      return 3
    case 'InputRegister':
      return 4
    default:
      return -1
  }
}

/**
 * Get Modbus function code for write operations
 *
 * Maps data type strings to their corresponding Modbus function codes for writing.
 * Used by write nodes to determine the appropriate Modbus command.
 *
 * @param {string} dataType - The type of data to write
 * @param {string} dataType.Coil - Write single coil (FC 5)
 * @param {string} dataType.HoldingRegister - Write single holding register (FC 6)
 * @param {string} dataType.MCoils - Write multiple coils (FC 15)
 * @param {string} dataType.MHoldingRegisters - Write multiple holding registers (FC 16)
 * @returns {number} Modbus function code (5, 6, 15, 16) or -1 if invalid
 * @example
 * functionCodeModbusWrite('HoldingRegister'); // Returns 6
 * functionCodeModbusWrite('MCoils'); // Returns 15
 * functionCodeModbusWrite('Invalid'); // Returns -1
 */
de.biancoroyal.modbus.core.functionCodeModbusWrite = function (dataType) {
  switch (dataType) {
    case 'Coil':
      return 5
    case 'HoldingRegister':
      return 6
    case 'MCoils':
      return 15
    case 'MHoldingRegisters':
      return 16
    default:
      return -1
  }
}

de.biancoroyal.modbus.core.buildMessage = function (messageList, values, response, msg) {
  const origMsg = this.getOriginalMessage(messageList, msg)
  origMsg.payload = values
  origMsg.topic = msg.topic
  origMsg.responseBuffer = this.cloneBuffer(response)
  origMsg.input = Object.assign({}, msg)

  const rawMsg = Object.assign({}, origMsg)
  rawMsg.payload = this.cloneBuffer(response)
  rawMsg.values = values
  delete rawMsg.responseBuffer

  return [origMsg, rawMsg]
}

module.exports = de.biancoroyal.modbus.core
