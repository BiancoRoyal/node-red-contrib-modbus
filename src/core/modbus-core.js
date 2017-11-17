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

module.exports = de.biancoroyal.modbus.core
