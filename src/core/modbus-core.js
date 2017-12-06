/**
 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'

var de = de || {biancoroyal: {modbus: {core: {}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.internalDebug = de.biancoroyal.modbus.core.internalDebug || require('debug')('contribModbus:core') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.ObjectID = de.biancoroyal.modbus.core.ObjectID || require('bson').ObjectID // eslint-disable-line no-use-before-define

de.biancoroyal.modbus.core.getObjectId = function () {
  return new de.biancoroyal.modbus.core.ObjectID()
}

de.biancoroyal.modbus.core.getOriginalMessage = function (messageList, msg) {
  let origMsg = messageList.get(msg.payload.messageId) || undefined

  if (origMsg && origMsg.payload.messageId) {
    messageList.delete(origMsg.payload.messageId)
    de.biancoroyal.modbus.core.internalDebug('Remove Message ' + msg.payload.messageId)
  } else {
    de.biancoroyal.modbus.core.internalDebug('Message Not Found ' + msg.payload.messageId)
  }

  return origMsg
}

module.exports = de.biancoroyal.modbus.core
