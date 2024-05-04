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
  origMsg.responseBuffer = response
  origMsg.input = Object.assign({}, msg)

  const rawMsg = Object.assign({}, origMsg)
  rawMsg.payload = response
  rawMsg.values = values
  delete rawMsg.responseBuffer

  return [origMsg, rawMsg]
}

module.exports = de.biancoroyal.modbus.core
