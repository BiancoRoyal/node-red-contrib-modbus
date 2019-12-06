/**
 Copyright (c) 2016,2017,2018,2019 Klaus Landsdorf (https://bianco-royal.com/)
 All rights reserved.
 node-red-contrib-modbus
 node-red-contrib-modbusio

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

var de = de || { biancoroyal: { modbus: { queue: { core: {} } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.queue.core.internalDebug = de.biancoroyal.modbus.queue.core.internalDebug || require('debug')('contribModbus:queue:core') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.queue.core.core = de.biancoroyal.modbus.queue.core.core || require('./modbus-core') // eslint-disable-line no-use-before-define
