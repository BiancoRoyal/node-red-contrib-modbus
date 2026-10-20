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

  describe('computeReconnectDelay (backoff with jitter)', function () {
    const middle = function () { return 0.5 } // jitter factor 1.0

    it('should keep the configured delay for the first three attempts (fast recovery from blips)', function () {
      ;[1, 2, 3].forEach(function (attempt) {
        assert.strictEqual(coreClient.computeReconnectDelay(2000, attempt, middle), 2000)
      })
    })

    it('should double the delay per attempt after the third', function () {
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 4, middle), 4000)
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 5, middle), 8000)
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 6, middle), 16000)
    })

    it('should cap the delay at 30 s', function () {
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 7, middle), 30000)
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 50, middle), 30000)
    })

    it('should never cap below the configured delay', function () {
      assert.strictEqual(coreClient.computeReconnectDelay(60000, 9, middle), 60000)
    })

    it('should never jitter below the configured delay', function () {
      assert.strictEqual(coreClient.computeReconnectDelay(29000, 4, function () { return 0 }), 29000)
      assert.strictEqual(coreClient.computeReconnectDelay(60000, 9, function () { return 0 }), 60000)
    })

    it('should keep the ±10 % jitter around the 30 s cap', function () {
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 50, function () { return 0 }), 27000)
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 50, function () { return 1 }), 33000)
    })

    it('should spread attempts by ±10 % jitter', function () {
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 4, function () { return 0 }), 3600)
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 4, function () { return 1 }), 4400)
    })

    it('should not apply jitter to the free attempts', function () {
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 1, function () { return 0 }), 2000)
    })

    it('should fall back to attempt 1 for missing or invalid attempts', function () {
      assert.strictEqual(coreClient.computeReconnectDelay(2000, undefined, middle), 2000)
      assert.strictEqual(coreClient.computeReconnectDelay(2000, 0, middle), 2000)
    })
  })

  describe('describeError', function () {
    it('should use the message and serialise errors without one', function () {
      assert.strictEqual(coreClient.describeError(new Error('boom')), 'boom')
      assert.strictEqual(coreClient.describeError({ code: 'X' }), '{"code":"X"}')
    })
  })

  describe('transport liveness evidence', function () {
    it('should derive the window from the client timeout with a 10 s minimum', function () {
      assert.strictEqual(coreClient.livenessWindow({ clientTimeout: 1000 }), 10000)
      assert.strictEqual(coreClient.livenessWindow({ clientTimeout: 5000 }), 20000)
      assert.strictEqual(coreClient.livenessWindow({}), 10000)
    })

    it('should let a node override the window', function () {
      assert.strictEqual(coreClient.livenessWindow({ clientTimeout: 1000, livenessWindowMs: 600 }), 600)
    })

    it('should escalate when nothing ever proved the transport alive', function () {
      assert.strictEqual(coreClient.shouldEscalateTimeout({ clientTimeout: 1000 }, 50000), true)
    })

    it('should not escalate while another unit answered inside the window', function () {
      const node = { clientTimeout: 1000, lastAliveAt: 45000 }
      assert.strictEqual(coreClient.shouldEscalateTimeout(node, 50000), false)
    })

    it('should escalate once the last proof of life left the window', function () {
      const node = { clientTimeout: 1000, lastAliveAt: 39999 }
      assert.strictEqual(coreClient.shouldEscalateTimeout(node, 50000), true)
    })

    it('should escalate when lastAliveAt was never set to a time', function () {
      assert.strictEqual(coreClient.shouldEscalateTimeout({ clientTimeout: 1000, lastAliveAt: undefined }), true)
      assert.strictEqual(coreClient.shouldEscalateTimeout(null), true)
    })

    it('should measure the window on a monotonic clock, not on the wall clock', function () {
      const node = { clientTimeout: 1000 }
      coreClient.markAlive(node)
      const realNow = Date.now
      try {
        // NTP correction or RTC set at boot: the wall clock jumps by hours
        Date.now = function () { return realNow() - 3600000 }
        assert.strictEqual(coreClient.shouldEscalateTimeout(node), false)
        Date.now = function () { return realNow() + 3600000 }
        assert.strictEqual(coreClient.shouldEscalateTimeout(node), false)
      } finally {
        Date.now = realNow
      }
      assert.strictEqual(coreClient.shouldEscalateTimeout(node, node.lastAliveAt + 10000), true)
    })

    it('should record proof of life with the current time', function () {
      const node = {}
      coreClient.markAlive(node, 1234)
      assert.strictEqual(node.lastAliveAt, 1234)
    })

    it('should treat a Modbus exception response as the device answering', function () {
      const err = new Error('Modbus exception 2: Illegal data address')
      err.modbusCode = 2
      assert.strictEqual(coreClient.isDeviceAnswerError(err), true)
    })

    it('should not treat timeouts, transport errors or null as the device answering', function () {
      assert.strictEqual(coreClient.isDeviceAnswerError({ name: 'TransactionTimedOutError', message: 'Timed out', errno: 'ETIMEDOUT' }), false)
      assert.strictEqual(coreClient.isDeviceAnswerError({ message: 'x', code: 'ECONNRESET' }), false)
      assert.strictEqual(coreClient.isDeviceAnswerError(null), false)
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
