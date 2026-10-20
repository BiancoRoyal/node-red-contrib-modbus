/**
 * Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 */

'use strict'

const assert = require('assert')
const coreClient = require('../../src/core/modbus-client-core')

describe('modbus-client-core', function () {
  describe('isRecoverableModbusError', function () {
    it('should return true for Timed out message', function () {
      assert.strictEqual(coreClient.isRecoverableModbusError(new Error('Timed out')), true)
    })

    it('should return true for errno ETIMEDOUT', function () {
      const err = new Error('socket error')
      err.errno = 'ETIMEDOUT'
      assert.strictEqual(coreClient.isRecoverableModbusError(err), true)
    })

    it('should return false for null', function () {
      assert.strictEqual(coreClient.isRecoverableModbusError(null), false)
    })
  })

  describe('isApplicationTimeoutError', function () {
    it('should return true for plain "Timed out" message (AC-SEM-04)', function () {
      assert.strictEqual(coreClient.isApplicationTimeoutError(new Error('Timed out')), true)
    })

    it('should return true for "Port Timed out after 500ms" message (AC-SEM-04)', function () {
      assert.strictEqual(coreClient.isApplicationTimeoutError(new Error('Port Timed out after 500ms')), true)
    })

    it('should return false when errno is ETIMEDOUT (transport error, not application)', function () {
      const err = { message: 'Timed out', errno: 'ETIMEDOUT' }
      assert.strictEqual(coreClient.isApplicationTimeoutError(err), false)
    })

    it('should return false when code is ESOCKETTIMEDOUT (transport error)', function () {
      const err = { message: 'Timed out', code: 'ESOCKETTIMEDOUT' }
      assert.strictEqual(coreClient.isApplicationTimeoutError(err), false)
    })

    it('should return false for ECONNRESET transport error', function () {
      const err = { message: 'error', errno: 'ECONNRESET' }
      assert.strictEqual(coreClient.isApplicationTimeoutError(err), false)
    })

    it('should return false for null', function () {
      assert.strictEqual(coreClient.isApplicationTimeoutError(null), false)
    })

    it('should return false for empty object', function () {
      assert.strictEqual(coreClient.isApplicationTimeoutError({}), false)
    })

    it('should return false for object with empty message', function () {
      assert.strictEqual(coreClient.isApplicationTimeoutError({ message: '' }), false)
    })
  })
})
