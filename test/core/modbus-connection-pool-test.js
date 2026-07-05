/**
 * Unit tests for modbus-connection-pool core module
 *
 * Tests use the class-based API of ModbusConnectionPool directly.
 * A connectionFactory mock is injected to avoid real network I/O.
 */

'use strict'

const assert = require('assert')
const sinon = require('sinon')

describe('Modbus Connection Pool Core Tests', function () {
  let ModbusConnectionPool
  let ConnectionState
  let sandbox
  let pool

  function mockFactory (sandbox) {
    return () => Promise.resolve({
      isOpen: true,
      close: sandbox.stub(),
      setID: sandbox.stub(),
      setTimeout: sandbox.stub()
    })
  }

  beforeEach(function () {
    sandbox = sinon.createSandbox()
    delete require.cache[require.resolve('../../src/core/modbus-connection-pool')]
    const mod = require('../../src/core/modbus-connection-pool')
    ModbusConnectionPool = mod.ModbusConnectionPool
    ConnectionState = mod.ConnectionState
  })

  afterEach(function () {
    if (pool) {
      try { pool.clear() } catch (_) {}
      pool = null
    }
    sandbox.restore()
  })

  describe('Connection Pool Management', function () {
    it('should export expected functions', function () {
      assert.strictEqual(typeof ModbusConnectionPool, 'function')
      assert.strictEqual(typeof ConnectionState, 'object')
    })

    it('should create a new connection pool', function () {
      pool = new ModbusConnectionPool({
        maxConnections: 5,
        connectionFactory: mockFactory(sandbox)
      })
      assert.notStrictEqual(pool, undefined)
      assert.strictEqual(pool.maxConnections, 5)
      assert.ok(pool.connections instanceof Map)
    })

    it('should get a connection from pool', async function () {
      pool = new ModbusConnectionPool({
        connectionFactory: mockFactory(sandbox)
      })
      const connection = await pool.getConnection({ host: '127.0.0.1', port: 502, type: 'tcp', unitId: 1 })
      assert.notStrictEqual(connection, undefined)
      assert.strictEqual(connection.state, ConnectionState.ACTIVE)
    })

    it('should release connection back to pool', async function () {
      pool = new ModbusConnectionPool({
        connectionFactory: mockFactory(sandbox)
      })
      const connection = await pool.getConnection({ host: '127.0.0.1', port: 502, type: 'tcp', unitId: 1 })
      assert.strictEqual(connection.state, ConnectionState.ACTIVE)
      pool.releaseConnection(connection)
      assert.strictEqual(connection.state, ConnectionState.IDLE)
    })

    it('should handle pool overflow via queue size limit', async function () {
      pool = new ModbusConnectionPool({
        maxConnections: 2,
        maxConnectionsPerHost: 2,
        maxQueueSize: 1,
        connectionTimeout: 5000,
        connectionFactory: mockFactory(sandbox)
      })

      await pool.getConnection({ host: '127.0.0.1', port: 502, type: 'tcp', unitId: 1 })
      await pool.getConnection({ host: '127.0.0.1', port: 503, type: 'tcp', unitId: 2 })

      // 3rd request: pool full, queued (queue not yet at limit)
      const pending = pool.getConnection({ host: '127.0.0.1', port: 504, type: 'tcp', unitId: 3 })
      pending.catch(() => {})

      // 4th request: queue is at maxQueueSize (1), must throw immediately
      try {
        await pool.getConnection({ host: '127.0.0.1', port: 505, type: 'tcp', unitId: 4 })
        assert.fail('Should have thrown queue limit error')
      } catch (error) {
        assert.ok(
          error.message.toLowerCase().includes('queue') || error.message.toLowerCase().includes('timeout'),
          `Unexpected error message: ${error.message}`
        )
      }
    })

    it('should close pool and all connections', async function () {
      const mockClose = sandbox.stub()
      pool = new ModbusConnectionPool({
        connectionFactory: () => Promise.resolve({ close: mockClose })
      })

      await pool.getConnection({ host: '127.0.0.1', port: 502, type: 'tcp', unitId: 1 })
      await pool.getConnection({ host: '127.0.0.1', port: 503, type: 'tcp', unitId: 2 })
      assert.strictEqual(pool.connections.size, 2)

      pool.clear()
      pool = null // prevent double-clear in afterEach

      assert.strictEqual(mockClose.callCount, 2)
    })

    it('should get pool statistics', async function () {
      pool = new ModbusConnectionPool({
        connectionFactory: mockFactory(sandbox)
      })
      await pool.getConnection({ host: '127.0.0.1', port: 502, type: 'tcp', unitId: 1 })
      await pool.getConnection({ host: '127.0.0.1', port: 503, type: 'tcp', unitId: 2 })

      const stats = pool.getStatistics()
      assert.strictEqual(typeof stats, 'object')
      assert.ok(stats.totalConnectionsCreated >= 2)
      assert.ok('currentActiveConnections' in stats)
      assert.ok('currentIdleConnections' in stats)
    })

    // Feature not in implementation: no retry mechanism — failed connections are removed immediately.
    it.skip('should handle connection retry on failure — retry not implemented', function () {})

    // Feature not in implementation: constructor does not validate options.
    it.skip('should validate pool configuration — validation not implemented', function () {})

    it('should handle concurrent connection requests', async function () {
      pool = new ModbusConnectionPool({
        maxConnections: 3,
        maxConnectionsPerHost: 3,
        connectionFactory: mockFactory(sandbox)
      })

      const configs = [
        { host: '127.0.0.1', port: 502, type: 'tcp', unitId: 1 },
        { host: '127.0.0.1', port: 503, type: 'tcp', unitId: 2 },
        { host: '127.0.0.1', port: 504, type: 'tcp', unitId: 3 }
      ]

      const connections = await Promise.all(configs.map(cfg => pool.getConnection(cfg)))
      assert.strictEqual(connections.length, 3)
      assert.ok(pool.connections.size <= 3)
      connections.forEach(c => assert.strictEqual(c.state, ConnectionState.ACTIVE))
    })

    it('should clean up stale connections', async function () {
      this.timeout(5000)
      pool = new ModbusConnectionPool({
        idleTimeout: 100, // cleanup interval fires every 50ms
        connectionFactory: mockFactory(sandbox)
      })

      const conn = await pool.getConnection({ host: '127.0.0.1', port: 502, type: 'tcp', unitId: 1 })
      pool.releaseConnection(conn)
      assert.strictEqual(pool.connections.size, 1)

      // Backdate lastUsed so the cleanup considers the connection stale
      for (const [, c] of pool.connections) {
        c.lastUsed = Date.now() - 200
      }

      // Wait for at least one cleanup interval (50ms) plus buffer
      await new Promise(resolve => setTimeout(resolve, 200))

      assert.strictEqual(pool.connections.size, 0)
    })

    it('should emit pool events', function (done) {
      pool = new ModbusConnectionPool({
        connectionFactory: mockFactory(sandbox)
      })

      pool.on('connectionCreated', (event) => {
        assert.ok(event.connectionId, 'connectionId should be defined')
        done()
      })

      pool.getConnection({ host: '127.0.0.1', port: 502, type: 'tcp', unitId: 1 }).catch(done)
    })

    it('should handle pool shutdown gracefully', async function () {
      pool = new ModbusConnectionPool({
        connectionFactory: mockFactory(sandbox)
      })

      const clearedEvents = []
      pool.on('poolCleared', () => clearedEvents.push('cleared'))

      await pool.getConnection({ host: '127.0.0.1', port: 502, type: 'tcp', unitId: 1 })

      // Queue a pending request (fill pool first)
      pool.maxConnections = 1
      const pending = pool.getConnection({ host: '127.0.0.1', port: 503, type: 'tcp', unitId: 2 })
      pending.catch(() => {}) // expected rejection on clear

      pool.clear()
      pool = null

      assert.strictEqual(clearedEvents.length, 1)
    })
  })

  describe('Connection Pool Monitoring', function () {
    // Feature not in implementation: no recordMetric()/getMetrics() public API.
    // Pool tracks stats via this.statistics but does not expose a metric recording API.
    it.skip('should track connection metrics — recordMetric/getMetrics not implemented', function () {})

    it('should calculate pool health score', async function () {
      pool = new ModbusConnectionPool({
        connectionFactory: mockFactory(sandbox)
      })

      const conn = await pool.getConnection({ host: '127.0.0.1', port: 502, type: 'tcp', unitId: 1 })
      pool.releaseConnection(conn)

      const health = pool.getHealthReport()
      assert.strictEqual(typeof health, 'object')
      assert.ok('totalConnections' in health, 'missing totalConnections')
      assert.ok('healthyConnections' in health, 'missing healthyConnections')
      assert.ok('unhealthyConnections' in health, 'missing unhealthyConnections')
    })
  })
})
