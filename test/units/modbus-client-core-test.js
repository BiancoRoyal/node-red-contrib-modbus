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

    it('should return true for the modbus-serial TransactionTimedOutError shape (errno ETIMEDOUT, no code)', function () {
      // Exactly what @openp4nr/modbus-serial builds in _startTimeout (#586)
      const err = { name: 'TransactionTimedOutError', message: 'Timed out', errno: 'ETIMEDOUT' }
      assert.strictEqual(coreClient.isApplicationTimeoutError(err), true)
    })

    it('should return true for a Timed out message carrying only errno ETIMEDOUT', function () {
      const err = { message: 'Timed out', errno: 'ETIMEDOUT' }
      assert.strictEqual(coreClient.isApplicationTimeoutError(err), true)
    })

    it('should return false for a socket ETIMEDOUT (code and syscall set by net)', function () {
      const err = { message: 'read ETIMEDOUT', errno: -110, code: 'ETIMEDOUT', syscall: 'read' }
      assert.strictEqual(coreClient.isApplicationTimeoutError(err), false)
    })

    it('should return false for a Timed out message that carries a transport code', function () {
      const err = { message: 'Timed out', code: 'ETIMEDOUT', syscall: 'connect' }
      assert.strictEqual(coreClient.isApplicationTimeoutError(err), false)
    })

    it('should return false when code is ESOCKETTIMEDOUT (transport error)', function () {
      const err = { message: 'Timed out', code: 'ESOCKETTIMEDOUT' }
      assert.strictEqual(coreClient.isApplicationTimeoutError(err), false)
    })

    it('should return false for a Timed out message with a non-timeout errno', function () {
      const err = { message: 'Timed out', errno: 'ECONNRESET' }
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

  describe('real modbus-serial timeout (guards the error shape across library upgrades)', function () {
    const net = require('net')
    const ModbusRTU = require('@openp4nr/modbus-serial')
    let server
    let client
    const sockets = new Set()

    beforeEach(function (done) {
      // accepts connections but never answers → application-level transaction timeout
      server = net.createServer(function (socket) {
        sockets.add(socket)
        socket.on('close', function () { sockets.delete(socket) })
      }).listen(0, '127.0.0.1', done)
    })

    afterEach(function (done) {
      sockets.forEach(function (socket) { socket.destroy() })
      if (client) {
        client.destroy(function () {})
      }
      server.close(function () { done() })
    })

    it('should classify the real TransactionTimedOutError as application timeout and still as recoverable', async function () {
      client = new ModbusRTU()
      await client.connectTCP('127.0.0.1', { port: server.address().port })
      client.setID(5)
      client.setTimeout(150)

      let caught
      try {
        await client.readHoldingRegisters(0, 1)
      } catch (err) {
        caught = err
      }

      assert.ok(caught, 'read against a silent server must fail')
      assert.strictEqual(caught.name, 'TransactionTimedOutError')
      assert.strictEqual(coreClient.isApplicationTimeoutError(caught), true)
      assert.strictEqual(coreClient.isRecoverableModbusError(caught), true)
    })
  })
})
