/**
 * All Modbus node constructors for a single helper.load() bootstrap per Mocha run.
 * Includes Node-RED core nodes commonly used in unit/E2E flows.
 */
'use strict'

module.exports = [
  require('@node-red/nodes/core/common/20-inject.js'),
  require('@node-red/nodes/core/function/10-function.js'),
  require('@node-red/nodes/core/common/25-catch.js'),
  require('../../src/modbus-client'),
  require('../../src/modbus-client-tls'),
  require('../../src/modbus-read'),
  require('../../src/modbus-write'),
  require('../../src/modbus-getter'),
  require('../../src/modbus-flex-getter'),
  require('../../src/modbus-flex-write'),
  require('../../src/modbus-flex-connector'),
  require('../../src/modbus-flex-sequencer'),
  require('../../src/modbus-flex-fc'),
  require('../../src/modbus-response'),
  require('../../src/modbus-response-filter'),
  require('../../src/modbus-queue-info'),
  require('../../src/modbus-io-config'),
  require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server'),
  require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls')
]
