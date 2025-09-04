/**
 * Unit Tests for Modbus Testable Core
 */

'use strict'

const assert = require('assert')
const {
  ModbusQueueManager,
  ModbusStateManager,
  ModbusMessageBuilder,
  ModbusErrorHandler,
  ModbusMetrics
} = require('../../src/core/modbus-testable-core')

describe('Modbus Testable Core', function () {
  describe('ModbusQueueManager', function () {
    let queueManager

    beforeEach(function () {
      queueManager = new ModbusQueueManager()
    })

    it('should add commands to queue', function () {
      const size1 = queueManager.addToQueue(1, { fc: 3, address: 0 })
      assert.strictEqual(size1, 1)

      const size2 = queueManager.addToQueue(1, { fc: 4, address: 100 })
      assert.strictEqual(size2, 2)

      const size3 = queueManager.addToQueue(2, { fc: 1, address: 0 })
      assert.strictEqual(size3, 1)
    })

    it('should get next command from queue', function () {
      queueManager.addToQueue(1, { fc: 3, address: 0 })
      queueManager.addToQueue(1, { fc: 4, address: 100 })

      const cmd1 = queueManager.getNext(1)
      assert.strictEqual(cmd1.fc, 3)
      assert.strictEqual(queueManager.getQueueSize(1), 1)

      const cmd2 = queueManager.getNext(1)
      assert.strictEqual(cmd2.fc, 4)
      assert.strictEqual(queueManager.getQueueSize(1), 0)

      const cmd3 = queueManager.getNext(1)
      assert.strictEqual(cmd3, null)
    })

    it('should handle queue overflow', function () {
      queueManager.maxQueueSize = 2

      queueManager.addToQueue(1, { fc: 1 })
      queueManager.addToQueue(1, { fc: 2 })

      assert.throws(() => {
        queueManager.addToQueue(1, { fc: 3 })
      }, /Queue full/)
    })

    it('should clear queues', function () {
      queueManager.addToQueue(1, { fc: 1 })
      queueManager.addToQueue(2, { fc: 2 })

      queueManager.clearQueue(1)
      assert.strictEqual(queueManager.getQueueSize(1), 0)
      assert.strictEqual(queueManager.getQueueSize(2), 1)

      queueManager.clearQueue()
      assert.strictEqual(queueManager.getQueueSize(2), 0)
    })

    it('should get active units', function () {
      queueManager.addToQueue(1, { fc: 1 })
      queueManager.addToQueue(3, { fc: 3 })
      queueManager.addToQueue(5, { fc: 5 })

      const activeUnits = queueManager.getActiveUnits()
      assert.deepStrictEqual(activeUnits, [1, 3, 5])
    })
  })

  describe('ModbusStateManager', function () {
    let stateManager

    beforeEach(function () {
      stateManager = new ModbusStateManager()
    })

    it('should get initial state', function () {
      const state = stateManager.getState('conn1')
      assert.strictEqual(state, 'init')
    })

    it('should set valid state transitions', function () {
      stateManager.setState('conn1', 'connecting')
      assert.strictEqual(stateManager.getState('conn1'), 'connecting')

      stateManager.setState('conn1', 'connected')
      assert.strictEqual(stateManager.getState('conn1'), 'connected')

      stateManager.setState('conn1', 'activated')
      assert.strictEqual(stateManager.getState('conn1'), 'activated')
    })

    it('should reject invalid state transitions', function () {
      assert.throws(() => {
        stateManager.setState('conn1', 'activated') // Can't go from init to activated
      }, /Invalid transition/)

      stateManager.setState('conn1', 'connecting')
      assert.throws(() => {
        stateManager.setState('conn1', 'queueing') // Can't go from connecting to queueing
      }, /Invalid transition/)
    })

    it('should reject invalid states', function () {
      assert.throws(() => {
        stateManager.setState('conn1', 'invalid_state')
      }, /Invalid state/)
    })

    it('should check if connection is active', function () {
      assert.strictEqual(stateManager.isActive('conn1'), false)

      stateManager.setState('conn1', 'connecting')
      stateManager.setState('conn1', 'connected')
      assert.strictEqual(stateManager.isActive('conn1'), true)

      stateManager.setState('conn1', 'activated')
      assert.strictEqual(stateManager.isActive('conn1'), true)

      stateManager.setState('conn1', 'closed')
      assert.strictEqual(stateManager.isActive('conn1'), false)
    })

    it('should check if ready to send', function () {
      assert.strictEqual(stateManager.isReadyToSend('conn1'), false)

      stateManager.setState('conn1', 'connecting')
      stateManager.setState('conn1', 'connected')
      assert.strictEqual(stateManager.isReadyToSend('conn1'), false)

      stateManager.setState('conn1', 'activated')
      assert.strictEqual(stateManager.isReadyToSend('conn1'), true)

      stateManager.setState('conn1', 'queueing')
      assert.strictEqual(stateManager.isReadyToSend('conn1'), true)

      stateManager.setState('conn1', 'sending')
      assert.strictEqual(stateManager.isReadyToSend('conn1'), false)
    })

    it('should reset connection state', function () {
      stateManager.setState('conn1', 'connecting')
      stateManager.setState('conn1', 'connected')
      stateManager.reset('conn1')
      assert.strictEqual(stateManager.getState('conn1'), 'init')
    })
  })

  describe('ModbusMessageBuilder', function () {
    describe('buildReadRequest', function () {
      it('should build valid read coils request', function () {
        const msg = ModbusMessageBuilder.buildReadRequest(1, 100, 16, 5)
        assert.strictEqual(msg.fc, 1)
        assert.strictEqual(msg.address, 100)
        assert.strictEqual(msg.quantity, 16)
        assert.strictEqual(msg.unitId, 5)
        assert(msg.timestamp)
      })

      it('should build valid read input registers request', function () {
        const msg = ModbusMessageBuilder.buildReadRequest(4, 0, 10)
        assert.strictEqual(msg.fc, 4)
        assert.strictEqual(msg.address, 0)
        assert.strictEqual(msg.quantity, 10)
        assert.strictEqual(msg.unitId, 1) // Default
      })

      it('should validate function code', function () {
        assert.throws(() => {
          ModbusMessageBuilder.buildReadRequest(0, 0, 10)
        }, /Invalid function code/)

        assert.throws(() => {
          ModbusMessageBuilder.buildReadRequest(5, 0, 10)
        }, /Invalid function code/)
      })

      it('should validate address', function () {
        assert.throws(() => {
          ModbusMessageBuilder.buildReadRequest(1, -1, 10)
        }, /Invalid address/)

        assert.throws(() => {
          ModbusMessageBuilder.buildReadRequest(1, 65536, 10)
        }, /Invalid address/)
      })

      it('should validate quantity', function () {
        assert.throws(() => {
          ModbusMessageBuilder.buildReadRequest(1, 0, 0)
        }, /Invalid quantity/)

        assert.throws(() => {
          ModbusMessageBuilder.buildReadRequest(1, 0, 2001)
        }, /Invalid quantity/)
      })
    })

    describe('buildWriteRequest', function () {
      it('should build valid write single coil request', function () {
        const msg = ModbusMessageBuilder.buildWriteRequest(5, 100, true, 3)
        assert.strictEqual(msg.fc, 5)
        assert.strictEqual(msg.address, 100)
        assert.strictEqual(msg.value, true)
        assert.strictEqual(msg.unitId, 3)
      })

      it('should build valid write single register request', function () {
        const msg = ModbusMessageBuilder.buildWriteRequest(6, 200, 12345)
        assert.strictEqual(msg.fc, 6)
        assert.strictEqual(msg.address, 200)
        assert.strictEqual(msg.value, 12345)
      })

      it('should build valid write multiple coils request', function () {
        const msg = ModbusMessageBuilder.buildWriteRequest(15, 0, [true, false, true])
        assert.strictEqual(msg.fc, 15)
        assert.deepStrictEqual(msg.value, [true, false, true])
      })

      it('should build valid write multiple registers request', function () {
        const msg = ModbusMessageBuilder.buildWriteRequest(16, 100, [100, 200, 300])
        assert.strictEqual(msg.fc, 16)
        assert.deepStrictEqual(msg.value, [100, 200, 300])
      })

      it('should validate value types', function () {
        assert.throws(() => {
          ModbusMessageBuilder.buildWriteRequest(5, 0, 'not boolean')
        }, /must be boolean/)

        assert.throws(() => {
          ModbusMessageBuilder.buildWriteRequest(6, 0, 70000)
        }, /must be 16-bit integer/)

        assert.throws(() => {
          ModbusMessageBuilder.buildWriteRequest(15, 0, [1, 2, 3])
        }, /must be array of booleans/)

        assert.throws(() => {
          ModbusMessageBuilder.buildWriteRequest(16, 0, [70000])
        }, /must be array of 16-bit integers/)
      })
    })

    describe('parseResponse', function () {
      it('should parse boolean data response', function () {
        const buffer = Buffer.from([0x55, 0xAA]) // 01010101 10101010
        const response = ModbusMessageBuilder.parseResponse(buffer, 1)

        assert.strictEqual(response.fc, 1)
        assert(response.timestamp)
        assert(Array.isArray(response.data))
        assert.strictEqual(response.data.length, 16)
        // Check pattern: 01010101
        assert.strictEqual(response.data[0], true)
        assert.strictEqual(response.data[1], false)
        assert.strictEqual(response.data[2], true)
        assert.strictEqual(response.data[3], false)
      })

      it('should parse register data response', function () {
        const buffer = Buffer.from([0x00, 0x64, 0x01, 0xC8]) // 100, 456
        const response = ModbusMessageBuilder.parseResponse(buffer, 3)

        assert.strictEqual(response.fc, 3)
        assert(Array.isArray(response.data))
        assert.strictEqual(response.data.length, 2)
        assert.strictEqual(response.data[0], 100)
        assert.strictEqual(response.data[1], 456)
      })

      it('should parse write response', function () {
        const buffer = Buffer.from([])
        const response = ModbusMessageBuilder.parseResponse(buffer, 5)

        assert.strictEqual(response.fc, 5)
        assert.deepStrictEqual(response.data, { success: true })
      })
    })
  })

  describe('ModbusErrorHandler', function () {
    it('should create Modbus error from code', function () {
      const error = ModbusErrorHandler.createModbusError(2, { address: 100 })
      assert.strictEqual(error.message, 'Illegal Data Address')
      assert.strictEqual(error.modbusCode, 2)
      assert.deepStrictEqual(error.context, { address: 100 })
    })

    it('should create timeout error', function () {
      const error = ModbusErrorHandler.createTimeoutError('read', 5000)
      assert(error.message.includes('timeout'))
      assert.strictEqual(error.code, 'ETIMEDOUT')
      assert.strictEqual(error.timeout, 5000)
      assert.strictEqual(error.operation, 'read')
    })

    it('should create connection error', function () {
      const error = ModbusErrorHandler.createConnectionError('host unreachable')
      assert(error.message.includes('connection error'))
      assert.strictEqual(error.code, 'ECONNREFUSED')
      assert.strictEqual(error.reason, 'host unreachable')
    })

    it('should check if error is recoverable', function () {
      const timeoutError = ModbusErrorHandler.createTimeoutError('read', 1000)
      assert.strictEqual(ModbusErrorHandler.isRecoverable(timeoutError), true)

      const ackError = ModbusErrorHandler.createModbusError(5, {})
      assert.strictEqual(ModbusErrorHandler.isRecoverable(ackError), true)

      const illegalError = ModbusErrorHandler.createModbusError(1, {})
      assert.strictEqual(ModbusErrorHandler.isRecoverable(illegalError), false)

      assert.strictEqual(ModbusErrorHandler.isRecoverable(null), false)
    })
  })

  describe('ModbusMetrics', function () {
    let metrics

    beforeEach(function () {
      metrics = new ModbusMetrics()
    })

    it('should record requests', function () {
      const start1 = metrics.recordRequest()
      const start2 = metrics.recordRequest()

      assert(start1 > 0)
      assert(start2 >= start1)
      assert.strictEqual(metrics.metrics.requests, 2)
    })

    it('should record responses', function () {
      const start = metrics.recordRequest()

      // Simulate delay
      const responseTime = metrics.recordResponse(start - 100)

      assert(responseTime >= 100)
      assert.strictEqual(metrics.metrics.responses, 1)
      assert(metrics.metrics.avgResponseTime > 0)
    })

    it('should record errors', function () {
      metrics.recordError(new Error('test'))
      assert.strictEqual(metrics.metrics.errors, 1)
      assert.strictEqual(metrics.metrics.timeouts, 0)

      const timeoutError = { code: 'ETIMEDOUT' }
      metrics.recordError(timeoutError)
      assert.strictEqual(metrics.metrics.errors, 2)
      assert.strictEqual(metrics.metrics.timeouts, 1)
    })

    it('should calculate success rate', function () {
      assert.strictEqual(metrics.getSuccessRate(), 100) // No requests yet

      metrics.recordRequest()
      metrics.recordRequest()
      metrics.recordRequest()

      const start = Date.now()
      metrics.recordResponse(start)
      metrics.recordResponse(start)

      assert.strictEqual(metrics.getSuccessRate(), 67) // 2/3 = 66.67%
    })

    it('should limit response time samples', function () {
      metrics.maxSamples = 3

      for (let i = 0; i < 5; i++) {
        metrics.recordRequest()
        metrics.recordResponse(Date.now() - 10)
      }

      assert.strictEqual(metrics.metrics.responseTimes.length, 3)
    })

    it('should reset metrics', function () {
      metrics.recordRequest()
      metrics.recordError(new Error('test'))

      metrics.reset()

      assert.strictEqual(metrics.metrics.requests, 0)
      assert.strictEqual(metrics.metrics.responses, 0)
      assert.strictEqual(metrics.metrics.errors, 0)
      assert.strictEqual(metrics.metrics.responseTimes.length, 0)
    })

    it('should get complete metrics', function () {
      metrics.recordRequest()
      const start = Date.now()
      metrics.recordResponse(start - 50)
      metrics.recordError(new Error('test'))

      const result = metrics.getMetrics()
      assert.strictEqual(result.requests, 1)
      assert.strictEqual(result.responses, 1)
      assert.strictEqual(result.errors, 1)
      assert.strictEqual(result.successRate, 100)
      assert(result.avgResponseTime >= 50)
    })
  })
})
