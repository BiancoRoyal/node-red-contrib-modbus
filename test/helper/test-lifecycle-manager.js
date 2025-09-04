/**
 * Node-RED Test Lifecycle Manager
 * Comprehensive solution for preventing test crashes and timeouts in node-red-contrib-modbus
 *
 * Addresses:
 * - Resource leaks (connections, servers, timers)
 * - Event emitter memory leaks
 * - Port conflicts between tests
 * - FSM state persistence
 * - Helper unload issues
 */

'use strict'

const helper = require('node-red-node-test-helper')
const { PortHelper } = require('./test-helper-port')
const sinon = require('sinon')
// const { EventEmitter } = require('events')

/**
 * Global registry for tracking test resources
 */
const GLOBAL_TEST_REGISTRY = {
  activeServers: new Map(),
  activeConnections: new Map(),
  activeTimers: new Set(),
  activeIntervals: new Set(),
  activeFSMs: new Map(),
  portHelper: new PortHelper(),
  isShuttingDown: false
}

/**
 * Enhanced Test Lifecycle Manager for Node-RED Modbus Tests
 */
class TestLifecycleManager {
  constructor () {
    this.testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.resources = {
      servers: new Map(),
      connections: new Map(),
      timers: new Set(),
      intervals: new Set(),
      fsms: new Map(),
      nodes: new Map(),
      eventListeners: new Map()
    }
    this.sandbox = null
    this.originalSetTimeout = global.setTimeout
    this.originalSetInterval = global.setInterval
    this.originalClearTimeout = global.clearTimeout
    this.originalClearInterval = global.clearInterval
    this.isCleanedUp = false
  }

  /**
   * Setup test environment with proper resource tracking
   */
  async setup (options = {}) {
    if (this.sandbox) {
      throw new Error('Test already set up. Call cleanup() first.')
    }

    // Create sinon sandbox for automatic stub cleanup
    this.sandbox = sinon.createSandbox()

    // Setup fake timers to control async operations
    this.setupTimerMocking()

    // Setup Node-RED helper with timeout protection
    await this.setupNodeRedHelper(options)

    // Setup process cleanup handlers
    this.setupProcessCleanup()

    return this
  }

  /**
   * Setup timer mocking to prevent leaks
   */
  setupTimerMocking () {
    const self = this

    // Wrap setTimeout to track timers
    global.setTimeout = function (callback, delay, ...args) {
      const timerId = self.originalSetTimeout.call(this, (...cbArgs) => {
        // Remove from tracking when timer executes
        self.resources.timers.delete(timerId)
        GLOBAL_TEST_REGISTRY.activeTimers.delete(timerId)
        return callback(null, ...cbArgs)
      }, delay, ...args)

      // Track timer for cleanup
      self.resources.timers.add(timerId)
      GLOBAL_TEST_REGISTRY.activeTimers.add(timerId)
      return timerId
    }

    // Wrap setInterval to track intervals
    global.setInterval = function (callback, delay, ...args) {
      const intervalId = self.originalSetInterval.call(this, callback, delay, ...args)
      self.resources.intervals.add(intervalId)
      GLOBAL_TEST_REGISTRY.activeIntervals.add(intervalId)
      return intervalId
    }

    // Wrap clearTimeout to update tracking
    global.clearTimeout = function (timerId) {
      self.resources.timers.delete(timerId)
      GLOBAL_TEST_REGISTRY.activeTimers.delete(timerId)
      return self.originalClearTimeout.call(this, timerId)
    }

    // Wrap clearInterval to update tracking
    global.clearInterval = function (intervalId) {
      self.resources.intervals.delete(intervalId)
      GLOBAL_TEST_REGISTRY.activeIntervals.delete(intervalId)
      return self.originalClearInterval.call(this, intervalId)
    }
  }

  /**
   * Setup Node-RED helper with proper error handling
   */
  async setupNodeRedHelper (options = {}) {
    const timeout = options.helperTimeout || 5000

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Helper startServer timeout after ${timeout}ms`))
      }, timeout)

      helper.startServer((err) => {
        clearTimeout(timeoutId)
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Setup process cleanup handlers for emergencies
   */
  setupProcessCleanup () {
    const self = this
    // Handle process exit
    const processCleanup = () => {
      if (!self.isCleanedUp && !GLOBAL_TEST_REGISTRY.isShuttingDown) {
        console.warn(`Emergency cleanup for test ${self.testId}`)
        self.emergencyCleanup()
      }
    }

    process.on('exit', processCleanup)
    process.on('SIGINT', processCleanup)
    process.on('SIGTERM', processCleanup)
    process.on('uncaughtException', processCleanup)
  }

  /**
   * Load nodes with comprehensive resource tracking
   */
  async loadNodes (nodes, flow, options = {}) {
    const timeout = options.loadTimeout || 5000
    const port = await GLOBAL_TEST_REGISTRY.portHelper.getPort()

    // Update flow with dynamic port
    const updatedFlow = this.updateFlowPorts(flow, port)

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Node loading timeout after ${timeout}ms for test ${this.testId}`))
      }, timeout)

      helper.load(nodes, updatedFlow, (err) => {
        clearTimeout(timeoutId)

        if (err) {
          reject(err)
          return
        }

        try {
          // Track loaded nodes
          updatedFlow.forEach(nodeConfig => {
            const node = helper.getNode(nodeConfig.id)
            if (node) {
              this.trackNode(nodeConfig.id, node, nodeConfig)
            }
          })

          resolve({ port, flow: updatedFlow })
        } catch (trackingError) {
          reject(trackingError)
        }
      })
    })
  }

  /**
   * Update flow configuration with dynamic ports to prevent conflicts
   */
  updateFlowPorts (flow, port) {
    return flow.map(nodeConfig => {
      const updatedConfig = { ...nodeConfig }

      // Update server nodes with dynamic port
      if (nodeConfig.type === 'modbus-server' && !nodeConfig.serverPort) {
        updatedConfig.serverPort = port
      }

      // Update client nodes with dynamic port
      if (nodeConfig.type === 'modbus-client' && !nodeConfig.tcpPort) {
        updatedConfig.tcpPort = port
      }

      return updatedConfig
    })
  }

  /**
   * Track a node for proper cleanup
   */
  trackNode (nodeId, node, config) {
    this.resources.nodes.set(nodeId, { node, config })

    // Track modbus server resources
    if (config.type === 'modbus-server' && node.modbusServer) {
      this.resources.servers.set(nodeId, node.modbusServer)
      GLOBAL_TEST_REGISTRY.activeServers.set(`${this.testId}-${nodeId}`, node.modbusServer)
    }

    // Track modbus client connections
    if (config.type === 'modbus-client' && node.modbusClient) {
      this.resources.connections.set(nodeId, node.modbusClient)
      GLOBAL_TEST_REGISTRY.activeConnections.set(`${this.testId}-${nodeId}`, node.modbusClient)
    }

    // Track FSM state machines
    if (node.fsm || node.actualServiceState) {
      const fsm = node.fsm || node.actualServiceState
      this.resources.fsms.set(nodeId, fsm)
      GLOBAL_TEST_REGISTRY.activeFSMs.set(`${this.testId}-${nodeId}`, fsm)
    }

    // Track event listeners to prevent memory leaks
    if (node._events) {
      this.resources.eventListeners.set(nodeId, Object.keys(node._events))
    }
  }

  /**
   * Wait for condition with timeout and cleanup
   */
  async waitForCondition (conditionFn, timeout = 2000, interval = 50) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()

      const check = () => {
        if (this.isCleanedUp) {
          reject(new Error('Test cleaned up while waiting'))
          return
        }

        try {
          if (conditionFn()) {
            resolve()
          } else if (Date.now() - startTime > timeout) {
            reject(new Error(`Wait condition timeout after ${timeout}ms`))
          } else {
            setTimeout(check, interval)
          }
        } catch (error) {
          reject(error)
        }
      }

      check()
    })
  }

  /**
   * Comprehensive cleanup of all test resources
   */
  async cleanup () {
    if (this.isCleanedUp) {
      console.warn(`Test ${this.testId} already cleaned up`)
      return
    }

    this.isCleanedUp = true

    try {
      // 1. Close modbus servers first (they hold ports)
      await this.cleanupServers()

      // 2. Close modbus connections
      await this.cleanupConnections()

      // 3. Clear all timers and intervals
      this.cleanupTimers()

      // 4. Reset FSM states
      this.cleanupFSMs()

      // 5. Remove event listeners to prevent memory leaks
      this.cleanupEventListeners()

      // 6. Unload Node-RED helper with timeout protection
      await this.cleanupNodeRedHelper()

      // 7. Restore original timer functions
      this.restoreTimers()

      // 8. Clean up sinon sandbox
      if (this.sandbox) {
        this.sandbox.restore()
        this.sandbox = null
      }

      // 9. Clear resource tracking
      this.clearResourceTracking()

      console.log(`✅ Test ${this.testId} cleanup completed successfully`)
    } catch (error) {
      console.error(`⚠️  Test ${this.testId} cleanup error:`, error.message)
      // Continue with emergency cleanup
      this.emergencyCleanup()
    }
  }

  /**
   * Close all modbus servers
   */
  async cleanupServers () {
    const serverCleanupPromises = []

    for (const [nodeId, server] of this.resources.servers) {
      serverCleanupPromises.push(
        new Promise(resolve => {
          try {
            if (server && typeof server.close === 'function') {
              server.close(() => resolve())
            } else {
              resolve()
            }
          } catch (error) {
            console.warn(`Server ${nodeId} close error:`, error.message)
            resolve()
          }
        })
      )
    }

    // Wait for all servers to close with timeout
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000))
    await Promise.race([Promise.all(serverCleanupPromises), timeoutPromise])

    // Clear global registry
    for (const key of GLOBAL_TEST_REGISTRY.activeServers.keys()) {
      if (key.startsWith(this.testId)) {
        GLOBAL_TEST_REGISTRY.activeServers.delete(key)
      }
    }

    this.resources.servers.clear()
  }

  /**
   * Close all modbus connections
   */
  async cleanupConnections () {
    const connectionCleanupPromises = []

    for (const [nodeId, connection] of this.resources.connections) {
      connectionCleanupPromises.push(
        new Promise(resolve => {
          try {
            if (connection && typeof connection.close === 'function') {
              connection.close(() => resolve())
            } else {
              resolve()
            }
          } catch (error) {
            console.warn(`Connection ${nodeId} close error:`, error.message)
            resolve()
          }
        })
      )
    }

    // Wait for all connections to close with timeout
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000))
    await Promise.race([Promise.all(connectionCleanupPromises), timeoutPromise])

    // Clear global registry
    for (const key of GLOBAL_TEST_REGISTRY.activeConnections.keys()) {
      if (key.startsWith(this.testId)) {
        GLOBAL_TEST_REGISTRY.activeConnections.delete(key)
      }
    }

    this.resources.connections.clear()
  }

  /**
   * Clear all timers and intervals
   */
  cleanupTimers () {
    // Clear test-specific timers
    for (const timerId of this.resources.timers) {
      try {
        this.originalClearTimeout.call(global, timerId)
      } catch (error) {
        // Timer may already be cleared
      }
    }

    // Clear test-specific intervals
    for (const intervalId of this.resources.intervals) {
      try {
        this.originalClearInterval.call(global, intervalId)
      } catch (error) {
        // Interval may already be cleared
      }
    }

    // Update global registry
    for (const timerId of this.resources.timers) {
      GLOBAL_TEST_REGISTRY.activeTimers.delete(timerId)
    }
    for (const intervalId of this.resources.intervals) {
      GLOBAL_TEST_REGISTRY.activeIntervals.delete(intervalId)
    }

    this.resources.timers.clear()
    this.resources.intervals.clear()
  }

  /**
   * Reset FSM states to prevent state persistence between tests
   */
  cleanupFSMs () {
    for (const [nodeId, fsm] of this.resources.fsms) {
      try {
        if (fsm && typeof fsm.transition === 'function') {
          // Reset FSM to initial state
          fsm.transition('init')
        }
      } catch (error) {
        console.warn(`FSM ${nodeId} reset error:`, error.message)
      }
    }

    // Clear global registry
    for (const key of GLOBAL_TEST_REGISTRY.activeFSMs.keys()) {
      if (key.startsWith(this.testId)) {
        GLOBAL_TEST_REGISTRY.activeFSMs.delete(key)
      }
    }

    this.resources.fsms.clear()
  }

  /**
   * Remove event listeners to prevent memory leaks
   */
  cleanupEventListeners () {
    for (const [nodeId, node] of this.resources.nodes) {
      try {
        if (node.node && typeof node.node.removeAllListeners === 'function') {
          node.node.removeAllListeners()
        }
      } catch (error) {
        console.warn(`Event listener cleanup ${nodeId} error:`, error.message)
      }
    }

    this.resources.eventListeners.clear()
  }

  /**
   * Unload Node-RED helper with timeout protection
   */
  async cleanupNodeRedHelper () {
    return new Promise(resolve => {
      // Set timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.warn(`Helper unload timeout for test ${this.testId}`)
        resolve()
      }, 3000)

      try {
        const unloadPromise = helper.unload()

        if (unloadPromise && typeof unloadPromise.then === 'function') {
          unloadPromise
            .then(() => {
              clearTimeout(timeoutId)
              resolve()
            })
            .catch(error => {
              console.warn(`Helper unload error for test ${this.testId}:`, error.message)
              clearTimeout(timeoutId)
              resolve() // Don't fail the test due to unload issues
            })
        } else {
          clearTimeout(timeoutId)
          resolve()
        }
      } catch (error) {
        console.warn(`Helper unload error for test ${this.testId}:`, error.message)
        clearTimeout(timeoutId)
        resolve()
      }

      // Also try to stop the server if it's running
      setTimeout(() => {
        try {
          helper.stopServer(() => {})
        } catch (error) {
          // Ignore stop errors
        }
      }, 500)
    })
  }

  /**
   * Restore original timer functions
   */
  restoreTimers () {
    global.setTimeout = this.originalSetTimeout
    global.setInterval = this.originalSetInterval
    global.clearTimeout = this.originalClearTimeout
    global.clearInterval = this.originalClearInterval
  }

  /**
   * Clear all resource tracking
   */
  clearResourceTracking () {
    this.resources.servers.clear()
    this.resources.connections.clear()
    this.resources.timers.clear()
    this.resources.intervals.clear()
    this.resources.fsms.clear()
    this.resources.nodes.clear()
    this.resources.eventListeners.clear()
  }

  /**
   * Emergency cleanup when normal cleanup fails
   */
  emergencyCleanup () {
    console.warn(`🚨 Emergency cleanup for test ${this.testId}`)

    try {
      // Force close all global servers
      for (const [key, server] of GLOBAL_TEST_REGISTRY.activeServers) {
        if (key.startsWith(this.testId)) {
          try {
            if (server && typeof server.close === 'function') {
              server.close()
            }
          } catch (e) {}
          GLOBAL_TEST_REGISTRY.activeServers.delete(key)
        }
      }

      // Force close all global connections
      for (const [key, connection] of GLOBAL_TEST_REGISTRY.activeConnections) {
        if (key.startsWith(this.testId)) {
          try {
            if (connection && typeof connection.close === 'function') {
              connection.close()
            }
          } catch (e) {}
          GLOBAL_TEST_REGISTRY.activeConnections.delete(key)
        }
      }

      // Clear all global timers
      for (const timerId of GLOBAL_TEST_REGISTRY.activeTimers) {
        try {
          clearTimeout(timerId)
        } catch (e) {}
      }
      GLOBAL_TEST_REGISTRY.activeTimers.clear()

      // Clear all global intervals
      for (const intervalId of GLOBAL_TEST_REGISTRY.activeIntervals) {
        try {
          clearInterval(intervalId)
        } catch (e) {}
      }
      GLOBAL_TEST_REGISTRY.activeIntervals.clear()

      // Restore timer functions
      this.restoreTimers()

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
    } catch (error) {
      console.error('Emergency cleanup failed:', error)
    }

    this.isCleanedUp = true
  }
}

/**
 * Global shutdown handler for process cleanup
 */
function setupGlobalShutdown () {
  if (GLOBAL_TEST_REGISTRY.isShuttingDown) {
    return
  }

  const globalCleanup = () => {
    if (GLOBAL_TEST_REGISTRY.isShuttingDown) return
    GLOBAL_TEST_REGISTRY.isShuttingDown = true

    console.warn('🚨 Global test cleanup initiated')

    // Stop Node-RED helper server
    try {
      helper.stopServer(() => {})
    } catch (e) {}

    // Clear all global resources
    for (const [, server] of GLOBAL_TEST_REGISTRY.activeServers) {
      try {
        server.close()
      } catch (e) {}
    }

    for (const [, connection] of GLOBAL_TEST_REGISTRY.activeConnections) {
      try {
        connection.close()
      } catch (e) {}
    }

    for (const timerId of GLOBAL_TEST_REGISTRY.activeTimers) {
      try {
        clearTimeout(timerId)
      } catch (e) {}
    }

    for (const intervalId of GLOBAL_TEST_REGISTRY.activeIntervals) {
      try {
        clearInterval(intervalId)
      } catch (e) {}
    }

    // Clean up port helper
    if (GLOBAL_TEST_REGISTRY.portHelper) {
      try {
        GLOBAL_TEST_REGISTRY.portHelper.tearDown()
      } catch (e) {}
    }
  }

  process.on('exit', globalCleanup)
  process.on('SIGINT', globalCleanup)
  process.on('SIGTERM', globalCleanup)
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error)
    globalCleanup()
  })
}

// Setup global cleanup handlers
setupGlobalShutdown()

module.exports = {
  TestLifecycleManager,
  GLOBAL_TEST_REGISTRY
}
