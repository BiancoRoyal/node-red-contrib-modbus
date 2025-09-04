/**
 * Connection Pool for Modbus TCP/Serial connections
 * Manages multiple connections efficiently with reuse and limits
 */

'use strict'

const EventEmitter = require('events')

const ConnectionState = {
  IDLE: 'idle',
  ACTIVE: 'active',
  CONNECTING: 'connecting',
  FAILED: 'failed',
  CLOSING: 'closing'
}

class ModbusConnectionPool extends EventEmitter {
  constructor (options = {}) {
    super()

    // Configuration
    this.maxConnections = options.maxConnections || 10
    this.maxConnectionsPerHost = options.maxConnectionsPerHost || 3
    this.connectionTimeout = options.connectionTimeout || 30000
    this.idleTimeout = options.idleTimeout || 120000
    this.retryDelay = options.retryDelay || 5000
    this.enableStatistics = options.enableStatistics !== false
    this.connectionFactory = options.connectionFactory || null
    this.healthCheckInterval = options.healthCheckInterval || 30000
    this.maxQueueSize = options.maxQueueSize || 100
    this.priorityLevels = options.priorityLevels || 3

    // Pool state
    this.connections = new Map() // key: connectionId, value: connection object
    this.hostConnections = new Map() // key: host, value: Set of connectionIds
    this.waitingQueue = [] // queue of pending connection requests
    this.priorityQueues = Array(this.priorityLevels).fill(null).map(() => [])
    this.connectionStats = new Map() // key: connectionId, value: statistics
    this.connectionHealth = new Map() // key: connectionId, value: health status

    // Statistics
    this.statistics = {
      totalConnectionsCreated: 0,
      totalConnectionsReused: 0,
      totalConnectionsClosed: 0,
      totalConnectionsFailed: 0,
      totalRequestsQueued: 0,
      totalRequestsServed: 0,
      averageWaitTime: 0,
      currentActiveConnections: 0,
      currentIdleConnections: 0
    }

    // Start idle connection cleanup and health checks
    this.startIdleConnectionCleanup()
    this.startHealthChecks()
  }

  /**
   * Get a connection from the pool
   * @param {Object} config - Connection configuration
   * @param {Object} options - Additional options
   * @returns {Promise} - Resolves with connection or rejects if unavailable
   */
  async getConnection (config, options = {}) {
    const priority = options.priority || 1
    const connectionId = this.generateConnectionId(config)

    // Check if we have an existing idle connection
    const existingConnection = this.connections.get(connectionId)
    if (existingConnection && existingConnection.state === ConnectionState.IDLE) {
      // Check connection health before reusing
      if (await this.isConnectionHealthy(existingConnection)) {
        return this.reuseConnection(existingConnection)
      } else {
        // Connection is not healthy, remove it
        this.removeConnection(connectionId)
      }
    }

    // Check if we can create a new connection
    if (this.canCreateConnection(config.host)) {
      return this.createConnection(config)
    }

    // Check queue limits to prevent memory exhaustion
    const totalQueued = this.priorityQueues.reduce((sum, queue) => sum + queue.length, 0)
    if (totalQueued >= this.maxQueueSize) {
      const error = new Error('Connection pool queue limit exceeded')
      error.code = 'QUEUE_LIMIT_EXCEEDED'
      error.context = {
        maxQueueSize: this.maxQueueSize,
        currentQueueSize: totalQueued,
        host: config.host,
        port: config.port
      }
      throw error
    }

    // Queue the request with priority
    return this.queueRequest(config, priority)
  }

  /**
   * Release a connection back to the pool
   * @param {Object} connection - The connection to release
   */
  releaseConnection (connection) {
    if (!connection || !connection.id) {
      return
    }

    const conn = this.connections.get(connection.id)
    if (conn) {
      conn.state = ConnectionState.IDLE
      conn.lastUsed = Date.now()
      conn.releaseCount = (conn.releaseCount || 0) + 1
      this.statistics.currentActiveConnections--
      this.statistics.currentIdleConnections++

      this.emit('connectionReleased', { connectionId: connection.id })

      // Process waiting queue
      this.processWaitingQueue()
    }
  }

  /**
   * Remove a connection from the pool
   * @param {string} connectionId - The connection ID to remove
   */
  removeConnection (connectionId) {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      return
    }

    // Clean up connection
    if (connection.client && connection.client.close) {
      try {
        connection.client.close()
      } catch (error) {
        this.emit('error', { error, connectionId })
      }
    }

    // Update statistics
    this.statistics.totalConnectionsClosed++
    if (connection.state === 'active') {
      this.statistics.currentActiveConnections--
    } else {
      this.statistics.currentIdleConnections--
    }

    // Remove from maps
    this.connections.delete(connectionId)

    if (connection.config && connection.config.host) {
      const hostConnections = this.hostConnections.get(connection.config.host)
      if (hostConnections) {
        hostConnections.delete(connectionId)
        if (hostConnections.size === 0) {
          this.hostConnections.delete(connection.config.host)
        }
      }
    }

    this.emit('connectionRemoved', { connectionId })

    // Process waiting queue
    this.processWaitingQueue()
  }

  /**
   * Generate a unique connection ID based on configuration
   * @param {Object} config - Connection configuration
   * @returns {string} - Unique connection ID
   */
  generateConnectionId (config) {
    const parts = [
      config.type || 'tcp',
      config.host || 'localhost',
      config.port || 502,
      config.unitId || 1
    ]

    if (config.type === 'serial') {
      parts.push(config.serialPort || '/dev/ttyUSB0')
      parts.push(config.serialBaudrate || 9600)
    }

    return parts.join(':')
  }

  /**
   * Check if we can create a new connection
   * @param {string} host - The host to check
   * @returns {boolean} - True if we can create a connection
   */
  canCreateConnection (host) {
    // Check global limit
    if (this.connections.size >= this.maxConnections) {
      return false
    }

    // Check per-host limit
    const hostConns = this.hostConnections.get(host)
    if (hostConns && hostConns.size >= this.maxConnectionsPerHost) {
      return false
    }

    return true
  }

  /**
   * Create a new connection
   * @param {Object} config - Connection configuration
   * @returns {Promise} - Resolves with new connection
   */
  async createConnection (config) {
    const connectionId = this.generateConnectionId(config)

    // Create connection object
    const connection = {
      id: connectionId,
      config,
      state: ConnectionState.CONNECTING,
      created: Date.now(),
      lastUsed: Date.now(),
      useCount: 0,
      releaseCount: 0,
      errorCount: 0,
      lastError: null,
      client: null
    }

    // Add to maps
    this.connections.set(connectionId, connection)

    if (!this.hostConnections.has(config.host)) {
      this.hostConnections.set(config.host, new Set())
    }
    this.hostConnections.get(config.host).add(connectionId)

    // Update statistics
    this.statistics.totalConnectionsCreated++
    this.statistics.currentActiveConnections++

    // Create actual connection
    try {
      if (this.connectionFactory) {
        connection.client = await this.connectionFactory(config)
      } else {
        connection.client = await this.createModbusClient(config)
      }
      connection.state = ConnectionState.ACTIVE
      connection.useCount++

      // Initialize statistics for this connection
      if (this.enableStatistics) {
        this.connectionStats.set(connectionId, {
          created: Date.now(),
          requests: 0,
          errors: 0,
          totalResponseTime: 0,
          averageResponseTime: 0
        })
      }

      this.emit('connectionCreated', { connectionId })

      return connection
    } catch (error) {
      // Connection failed
      connection.state = ConnectionState.FAILED
      connection.lastError = error
      connection.errorCount++
      this.statistics.totalConnectionsFailed++
      this.statistics.currentActiveConnections--

      this.removeConnection(connectionId)

      // Emit error event for monitoring
      this.emit('connectionError', { connectionId, error })

      throw error
    }
  }

  /**
   * Reuse an existing connection
   * @param {Object} connection - The connection to reuse
   * @returns {Object} - The reused connection
   */
  reuseConnection (connection) {
    connection.state = ConnectionState.ACTIVE
    connection.lastUsed = Date.now()
    connection.useCount++

    this.statistics.totalConnectionsReused++
    this.statistics.currentIdleConnections--
    this.statistics.currentActiveConnections++

    this.emit('connectionReused', { connectionId: connection.id })

    return connection
  }

  /**
   * Queue a connection request with priority
   * @param {Object} config - Connection configuration
   * @param {number} priority - Request priority (0 = highest)
   * @returns {Promise} - Resolves when connection becomes available
   */
  queueRequest (config, priority = 1) {
    // Check queue size limit
    const totalQueued = this.priorityQueues.reduce((sum, q) => sum + q.length, 0)
    if (totalQueued >= this.maxQueueSize) {
      return Promise.reject(new Error('Connection pool queue is full'))
    }

    return new Promise((resolve, reject) => {
      const request = {
        config,
        resolve,
        reject,
        priority,
        queued: Date.now(),
        timeout: setTimeout(() => {
          this.dequeueRequest(request, priority)
          reject(new Error('Connection request timed out'))
        }, this.connectionTimeout)
      }

      // Add to priority queue
      const queueIndex = Math.min(priority, this.priorityLevels - 1)
      this.priorityQueues[queueIndex].push(request)
      this.statistics.totalRequestsQueued++

      this.emit('requestQueued', {
        queueLength: totalQueued + 1,
        priority,
        config
      })
    })
  }

  /**
   * Remove a request from the queue
   * @param {Object} request - The request to remove
   * @param {number} priority - Request priority
   */
  dequeueRequest (request, priority) {
    const queueIndex = Math.min(priority, this.priorityLevels - 1)
    const queue = this.priorityQueues[queueIndex]
    const index = queue.indexOf(request)
    if (index > -1) {
      queue.splice(index, 1)
      clearTimeout(request.timeout)
    }
  }

  /**
   * Process waiting queue with priority
   */
  processWaitingQueue () {
    // Process queues by priority
    for (let priority = 0; priority < this.priorityLevels; priority++) {
      const queue = this.priorityQueues[priority]

      while (queue.length > 0) {
        const request = queue[0]

        // Try to get a connection for this request
        const connectionId = this.generateConnectionId(request.config)
        const existingConnection = this.connections.get(connectionId)

        if (existingConnection && existingConnection.state === ConnectionState.IDLE) {
          // Reuse existing connection
          this.dequeueRequest(request, priority)
          const connection = this.reuseConnection(existingConnection)

          // Update wait time statistics
          const waitTime = Date.now() - request.queued
          this.updateAverageWaitTime(waitTime)
          this.statistics.totalRequestsServed++

          request.resolve(connection)
        } else if (this.canCreateConnection(request.config.host)) {
          // Create new connection
          this.dequeueRequest(request, priority)

          this.createConnection(request.config)
            .then(connection => {
              const waitTime = Date.now() - request.queued
              this.updateAverageWaitTime(waitTime)
              this.statistics.totalRequestsServed++
              request.resolve(connection)
            })
            .catch(error => {
              request.reject(error)
            })
        } else {
          // Can't process this request yet, try next priority
          break
        }
      }
    }
  }

  /**
   * Update average wait time
   * @param {number} waitTime - The wait time in milliseconds
   */
  updateAverageWaitTime (waitTime) {
    const total = this.statistics.totalRequestsServed
    const currentAvg = this.statistics.averageWaitTime
    this.statistics.averageWaitTime = (currentAvg * (total - 1) + waitTime) / total
  }

  /**
   * Start idle connection cleanup timer
   */
  startIdleConnectionCleanup () {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      const connectionsToRemove = []

      for (const [connectionId, connection] of this.connections) {
        if (connection.state === ConnectionState.IDLE &&
            (now - connection.lastUsed) > this.idleTimeout) {
          connectionsToRemove.push(connectionId)
        }

        // Also remove connections with too many errors
        if (connection.errorCount > 5) {
          connectionsToRemove.push(connectionId)
        }
      }

      for (const connectionId of connectionsToRemove) {
        this.removeConnection(connectionId)
      }

      if (connectionsToRemove.length > 0) {
        this.emit('idleConnectionsCleaned', {
          count: connectionsToRemove.length
        })
      }
    }, this.idleTimeout / 2)
  }

  /**
   * Create actual Modbus client
   * @param {Object} config - Connection configuration
   * @returns {Promise} - Resolves with client instance
   */
  async createModbusClient (config) {
    // This should be overridden or use connectionFactory
    const ModbusRTU = require('@openp4nr/node-modbus')
    const client = new ModbusRTU()

    if (config.type === 'tcp') {
      await client.connectTCP(config.host, { port: config.port })
    } else if (config.type === 'serial') {
      await client.connectRTU(config.serialPort, {
        baudRate: config.serialBaudrate,
        dataBits: config.serialDatabits,
        stopBits: config.serialStopbits,
        parity: config.serialParity
      })
    }

    client.setID(config.unitId || 1)
    client.setTimeout(config.timeout || 5000)

    return client
  }

  /**
   * Get pool statistics
   * @returns {Object} - Current pool statistics
   */
  getStatistics () {
    return {
      ...this.statistics,
      queueLength: this.waitingQueue.length,
      connectionDetails: Array.from(this.connections.values()).map(conn => ({
        id: conn.id,
        state: conn.state,
        useCount: conn.useCount,
        age: Date.now() - conn.created,
        idleTime: conn.state === 'idle' ? Date.now() - conn.lastUsed : 0
      }))
    }
  }

  /**
   * Check if a connection is healthy
   * @param {Object} connection - Connection to check
   * @returns {Promise<boolean>} - True if healthy
   */
  async isConnectionHealthy (connection) {
    if (!connection.client) return false

    try {
      // Perform a simple health check operation
      if (connection.client.isOpen && typeof connection.client.isOpen === 'function') {
        return connection.client.isOpen()
      }

      // Default to checking if client exists
      return true
    } catch (error) {
      connection.errorCount++
      connection.lastError = error
      return false
    }
  }

  /**
   * Start health checks for all connections
   */
  startHealthChecks () {
    this.healthCheckInterval = setInterval(async () => {
      for (const [connectionId, connection] of this.connections) {
        if (connection.state === ConnectionState.IDLE) {
          const healthy = await this.isConnectionHealthy(connection)

          this.connectionHealth.set(connectionId, {
            healthy,
            lastCheck: Date.now(),
            errorCount: connection.errorCount
          })

          if (!healthy && connection.errorCount > 3) {
            // Remove unhealthy connection
            this.removeConnection(connectionId)
          }
        }
      }

      this.emit('healthCheck', this.getHealthReport())
    }, this.healthCheckInterval)
  }

  /**
   * Get health report for all connections
   * @returns {Object} - Health report
   */
  getHealthReport () {
    const report = {
      totalConnections: this.connections.size,
      healthyConnections: 0,
      unhealthyConnections: 0,
      connections: []
    }

    for (const [connectionId, health] of this.connectionHealth) {
      if (health.healthy) {
        report.healthyConnections++
      } else {
        report.unhealthyConnections++
      }

      const connection = this.connections.get(connectionId)
      if (connection) {
        report.connections.push({
          id: connectionId,
          healthy: health.healthy,
          state: connection.state,
          useCount: connection.useCount,
          errorCount: connection.errorCount,
          age: Date.now() - connection.created
        })
      }
    }

    return report
  }

  /**
   * Clear all connections and reset pool
   */
  clear () {
    // Clear all priority queues
    for (let i = 0; i < this.priorityLevels; i++) {
      for (const request of this.priorityQueues[i]) {
        clearTimeout(request.timeout)
        request.reject(new Error('Connection pool cleared'))
      }
      this.priorityQueues[i] = []
    }

    // Close all connections
    for (const connectionId of this.connections.keys()) {
      this.removeConnection(connectionId)
    }

    // Clear statistics
    this.connectionStats.clear()

    // Stop intervals
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    this.emit('poolCleared')
  }

  /**
   * Update connection statistics
   * @param {string} connectionId - Connection ID
   * @param {Object} stats - Statistics to update
   */
  updateConnectionStats (connectionId, stats) {
    if (!this.enableStatistics) {
      return
    }

    const connStats = this.connectionStats.get(connectionId)
    if (connStats) {
      if (stats.request) {
        connStats.requests++
      }
      if (stats.error) {
        connStats.errors++
      }
      if (stats.responseTime) {
        connStats.totalResponseTime += stats.responseTime
        connStats.averageResponseTime = connStats.totalResponseTime / connStats.requests
      }
    }
  }
}

module.exports = { ModbusConnectionPool, ConnectionState }
