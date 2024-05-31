/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

const _ = require('underscore')

// eslint-disable-next-line no-var
var de = de || { biancoroyal: { modbus: { core: { server: { } } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.server.internalDebug = de.biancoroyal.modbus.core.server.internalDebug || require('debug')('contribModbus:core:server') // eslint-disable-line no-use-before-define

de.biancoroyal.modbus.core.server.bufferFactor = 8
de.biancoroyal.modbus.core.server.memoryTypes = ['holding', 'coils', 'input', 'discrete']
de.biancoroyal.modbus.core.server.memoryUint16Types = ['holding', 'input']
de.biancoroyal.modbus.core.server.memoryUint8Types = ['coils', 'discrete']

de.biancoroyal.modbus.core.server.getLogFunction = function (node) {
  if (node.internalDebugLog) {
    return node.internalDebugLog
  } else {
    return de.biancoroyal.modbus.core.server.internalDebug
  }
}

de.biancoroyal.modbus.core.server.isValidMemoryMessage = function (msg) {
  return _.isUndefined(msg.payload) === false &&
    msg.payload.register &&
    Number.isInteger(msg.payload.address) &&
    msg.payload.address >= 0 &&
    msg.payload.address <= 65535
}

de.biancoroyal.modbus.core.server.isValidMessage = function (msg) {
  return _.isUndefined(msg) === false && _.isUndefined(msg.payload) === false
}

de.biancoroyal.modbus.core.server.copyToModbusFlexBuffer = function (node, msg) {
  switch (msg.payload.register) {
    case 'holding':
      msg.bufferData.copy(node.registers, msg.bufferSplitAddress)
      break
    case 'coils':
      msg.bufferData.copy(node.coils, msg.bufferAddress)
      break
    case 'input':
      msg.bufferData.copy(node.registers, msg.bufferAddress)
      break
    case 'discrete':
      msg.bufferData.copy(node.coils, msg.bufferSplitAddress)
      break
    default:
      return false
  }
  return true
}

de.biancoroyal.modbus.core.server.writeToModbusFlexBuffer = function (node, msg) {
  switch (msg.payload.register) {
    case 'holding':
      node.registers.writeUInt16BE((Buffer.isBuffer(msg.bufferPayload)) ? msg.bufferPayload.readUInt16BE(0) : msg.bufferPayload, msg.bufferSplitAddress)
      break
    case 'coils':
      node.coils.writeUInt8((Buffer.isBuffer(msg.bufferPayload)) ? msg.bufferPayload.readUInt8(0) : msg.bufferPayload, msg.bufferAddress)
      break
    case 'input':
      node.registers.writeUInt16BE((Buffer.isBuffer(msg.bufferPayload)) ? msg.bufferPayload.readUInt16BE(0) : msg.bufferPayload, msg.bufferAddress)
      break
    case 'discrete':
      node.coils.writeUInt8((Buffer.isBuffer(msg.bufferPayload)) ? msg.bufferPayload.readUInt8(0) : msg.bufferPayload, msg.bufferSplitAddress)
      break
    default:
      return false
  }
  return true
}

de.biancoroyal.modbus.core.server.writeModbusFlexServerMemory = function (node, msg) {
  const coreServer = de.biancoroyal.modbus.core.server
  msg.bufferSplitAddress = (parseInt(msg.payload.address) + parseInt(node.splitAddress)) * coreServer.bufferFactor
  msg.bufferAddress = parseInt(msg.payload.address) * coreServer.bufferFactor

  if (coreServer.convertInputForBufferWrite(msg)) {
    return coreServer.copyToModbusFlexBuffer(node, msg)
  } else {
    return coreServer.writeToModbusFlexBuffer(node, msg)
  }
}

de.biancoroyal.modbus.core.server.convertInputForBufferWrite = function (msg) {
  let isMultipleWrite = false
  if (msg.payload.value?.length) {
    msg.bufferPayload = new Uint8Array(msg.payload?.value)
    msg.bufferData = Buffer.alloc(msg.bufferPayload.buffer.byteLength, msg.bufferPayload)
    isMultipleWrite = true
    msg.wasMultipleWrite = true
  } else {
    msg.bufferPayload = Number(msg.payload.value)
    msg.wasMultipleWrite = false
  }

  return isMultipleWrite
}

de.biancoroyal.modbus.core.server.copyToModbusBuffer = function (node, msg) {
  switch (msg.payload.register) {
    case 'holding':
      msg.bufferData.copy(node.modbusServer.holding, msg.bufferAddress)
      break
    case 'coils':
      msg.bufferData.copy(node.modbusServer.coils, msg.bufferAddress)
      break
    case 'input':
      msg.bufferData.copy(node.modbusServer.input, msg.bufferAddress)
      break
    case 'discrete':
      msg.bufferData.copy(node.modbusServer.discrete, msg.bufferAddress)
      break
    default:
      return false
  }
  return true
}

de.biancoroyal.modbus.core.server.writeToModbusBuffer = function (node, msg) {
  switch (msg.payload.register) {
    case 'holding':
      node.modbusServer.holding.writeUInt16BE((Buffer.isBuffer(msg.bufferPayload)) ? msg.bufferPayload.readUInt16BE(0) : msg.bufferPayload, msg.bufferAddress)
      break
    case 'coils':
      node.modbusServer.coils.writeUInt8((Buffer.isBuffer(msg.bufferPayload)) ? msg.bufferPayload.readUInt8(0) : msg.bufferPayload, msg.bufferAddress)
      break
    case 'input':
      node.modbusServer.input.writeUInt16BE((Buffer.isBuffer(msg.bufferPayload)) ? msg.bufferPayload.readUInt16BE(0) : msg.bufferPayload, msg.bufferAddress)
      break
    case 'discrete':
      node.modbusServer.discrete.writeUInt8((Buffer.isBuffer(msg.bufferPayload)) ? msg.bufferPayload.readUInt8(0) : msg.bufferPayload, msg.bufferAddress)
      break
    default:
      return false
  }
  return true
}

de.biancoroyal.modbus.core.server.writeModbusServerMemory = function (node, msg) {
  const coreServer = de.biancoroyal.modbus.core.server
  msg.bufferAddress = parseInt(msg.payload.address) * coreServer.bufferFactor

  if (coreServer.convertInputForBufferWrite(msg)) {
    return coreServer.copyToModbusBuffer(node, msg)
  } else {
    return coreServer.writeToModbusBuffer(node, msg)
  }
}

de.biancoroyal.modbus.core.server.writeToServerMemory = function (node, msg) {
  const coreServer = de.biancoroyal.modbus.core.server
  msg.payload.register = msg.payload.register.toLowerCase()
  try {
    if (coreServer.memoryTypes.includes(msg.payload.register)) {
      coreServer.writeModbusServerMemory(node, msg)
    }
  } catch (err) {
    msg.error = err
    node.error(err)
  }
}

de.biancoroyal.modbus.core.server.writeToFlexServerMemory = function (node, msg) {
  const coreServer = de.biancoroyal.modbus.core.server
  msg.payload.register = msg.payload.register ? msg.payload.register.toLowerCase() : undefined; try {
    if (coreServer.memoryTypes.includes(msg.payload.register)) {
      coreServer.writeModbusFlexServerMemory(node, msg)
    }
  } catch (err) {
    msg.error = err
    node.error(err)
  }
}

module.exports = de.biancoroyal.modbus.core.server
