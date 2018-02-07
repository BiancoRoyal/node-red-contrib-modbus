/**
 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

var de = de || {biancoroyal: {modbus: {core: {client: {}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.internalDebug = de.biancoroyal.modbus.core.client.internalDebug || require('debug')('contribModbus:core:client') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.modbusSerialDebug = de.biancoroyal.modbus.core.client.modbusSerialDebug || require('debug')('modbus-serial') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.Stately = de.biancoroyal.modbus.core.client.Stately || require('stately.js') // eslint-disable-line no-use-before-define

de.biancoroyal.modbus.core.client.networkErrors = ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET', 'ENETRESET',
  'ECONNABORTED', 'ECONNREFUSED', 'ENETUNREACH', 'ENOTCONN',
  'ESHUTDOWN', 'EHOSTDOWN', 'ENETDOWN', 'EWOULDBLOCK', 'EAGAIN', 'EHOSTUNREACH']

de.biancoroyal.modbus.core.client.createStatelyMachine = function () {
  return new de.biancoroyal.modbus.core.client.Stately({
    'NEW': {'init': 'INIT', 'stop': 'STOPED'},
    'BROKEN': {'init': 'INIT', 'stop': 'STOPED'},
    'INIT': {'openserial': 'OPENED', 'connect': 'CONNECTED', 'failure': 'FAILED'},
    'OPENED': {'connect': 'CONNECTED', 'failure': 'FAILED'},
    'CONNECTED': {'close': 'CLOSED', 'activate': 'ACTIVATED', 'failure': 'FAILED'},
    'ACTIVATED': {
      'close': 'CLOSED',
      'read': 'READING',
      'write': 'WRITING',
      'queue': 'QUEUEING',
      'failure': 'FAILED'
    },
    'QUEUEING': {
      'activate': 'ACTIVATED',
      'read': 'READING',
      'write': 'WRITING',
      'empty': 'EMPTY',
      'failure': 'FAILED',
      'close': 'CLOSED'
    },
    'EMPTY': {'queue': 'QUEUEING', 'failure': 'FAILED'},
    'READING': {'activate': 'ACTIVATED', 'failure': 'FAILED'},
    'WRITING': {'activate': 'ACTIVATED', 'failure': 'FAILED'},
    'CLOSED': {'failure': 'FAILED', 'break': 'BROKEN'},
    'FAILED': {'close': 'CLOSED', 'break': 'BROKEN', 'stop': 'STOPED'},
    'STOPED': {'queue': 'STOPED', 'activate': 'STOPED'}
  }, 'NEW')
}

de.biancoroyal.modbus.core.client.messagesAllowedStates = ['ACTIVATED', 'QUEUEING', 'EMPTY']

module.exports = de.biancoroyal.modbus.core.client
