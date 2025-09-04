/**
 * Test Isolation Utilities with timeout prevention
 * Provides isolation strategies for Node-RED Modbus tests with comprehensive timeout fixes
 */

'use strict'

const sinon = require('sinon')
const { ModbusTestHelper } = require('./modbus-test-helper')
const helper = require('node-red-node-test-helper')

/**
 * Global test helper instance for shared cleanup
 */
let globalTestHelper = null

/**
 * Setup test isolation before each test
 */
function beforeEachTest (options = {}) {
  // Clean up any previous test helper
  if (globalTestHelper) {
    globalTestHelper.cleanup()
  }

  // Create new test helper
  globalTestHelper = new ModbusTestHelper()
  globalTestHelper.setupMocks(options)

  return globalTestHelper
}

/**
 * Cleanup after each test
 */
async function afterEachTest () {
  // Clean up test helper
  if (globalTestHelper) {
    globalTestHelper.cleanup()
    globalTestHelper = null
  }

  // Unload helper nodes with timeout protection
  try {
    const unloadPromise = helper.unload()
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(), 2000) // 2 second timeout
    })

    await Promise.race([unloadPromise, timeoutPromise])
  } catch (error) {
    // Ignore unload errors to prevent test failures
    console.warn('Helper unload warning:', error.message)
  }

  // Force cleanup of any remaining resources
  if (global.gc) {
    global.gc()
  }
}

/**
 * Load nodes with timeout protection and automatic mocking
 */
async function loadNodesWithTimeout (nodes, flow, timeout = 5000, mockOptions = {}) {
  const testHelper = globalTestHelper || new ModbusTestHelper()

  if (!globalTestHelper) {
    testHelper.setupMocks(mockOptions)
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Node loading timeout after ${timeout}ms`))
    }, timeout)

    helper.load(nodes, flow)
      .then((result) => {
        clearTimeout(timeoutId)

        // Auto-mock any loaded client nodes
        try {
          flow.forEach(nodeConfig => {
            if (nodeConfig.type === 'modbus-client') {
              const node = helper.getNode(nodeConfig.id)
              if (node) {
                testHelper.mockNodeBehavior(node)
              }
            }
          })
        } catch (error) {
          console.warn('Auto-mocking warning:', error.message)
        }

        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

class TestIsolation {
  constructor () {
    this.sandbox = null
    this.stubs = new Map()
    this.timers = []
    this.servers = []
    this.originalTimeout = null
  }

  /**
   * Setup test isolation environment
   */
  setup () {
    // Create sinon sandbox for automatic cleanup
    this.sandbox = sinon.createSandbox()

    // Store original timeout
    this.originalTimeout = global.setTimeout

    // Use fake timers to control async operations
    this.sandbox.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']
    })

    return this
  }

  /**
   * Cleanup test isolation environment
   */
  cleanup () {
    // Restore all stubs
    if (this.sandbox) {
      this.sandbox.restore()
      this.sandbox = null
    }

    // Clear all tracked timers
    this.timers.forEach(timer => {
      if (timer) clearTimeout(timer)
    })
    this.timers = []

    // Close all test servers
    this.servers.forEach(server => {
      if (server && server.close) {
        try {
          server.close()
        } catch (e) {
          // Ignore close errors
        }
      }
    })
    this.servers = []

    // Clear stubs map
    this.stubs.clear()

    return this
  }

  /**
   * Create isolated Node-RED runtime mock
   */
  createIsolatedRuntime () {
    const runtime = {
      nodes: new Map(),
      flows: [],
      events: new Map(),
      settings: {
        available: () => true,
        get: (key) => undefined,
        set: (key, value) => {}
      },
      log: {
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
        trace: () => {}
      },
      util: {
        generateId: () => 'test-' + Math.random().toString(36).substr(2, 9),
        ensureString: (val) => String(val),
        evaluateNodeProperty: (value, type) => value
      }
    }

    return runtime
  }

  /**
   * Create isolated RED object for testing
   */
  createIsolatedRED () {
    const RED = {
      nodes: {
        createNode: function (node, config) {
          node.id = config.id || 'test-node-' + Date.now()
          node.type = config.type
          node.name = config.name || ''
          node.wires = config.wires || []

          // Add event emitter capabilities
          node._events = {}
          node.on = function (event, handler) {
            if (!this._events[event]) {
              this._events[event] = []
            }
            this._events[event].push(handler)
          }

          node.emit = function (event, ...args) {
            if (this._events[event]) {
              this._events[event].forEach(handler => {
                try {
                  handler.apply(this, args)
                } catch (e) {
                  console.error('Event handler error:', e)
                }
              })
            }
          }

          node.send = function (msg) {
            this.emit('send', msg)
          }

          node.error = function (err, msg) {
            this.emit('error', err, msg)
          }

          node.warn = function (warning) {
            this.emit('warn', warning)
          }

          node.status = function (status) {
            this.emit('status', status)
          }

          node.close = function (done) {
            if (done) done()
          }

          return node
        },

        registerType: function (type, constructor, opts) {
          // Store type registration for testing
          this._registeredTypes = this._registeredTypes || {}
          this._registeredTypes[type] = { constructor, opts }
        },

        getNode: function (id) {
          return this._nodeMap && this._nodeMap[id]
        },

        eachNode: function (cb) {
          if (this._nodeMap) {
            Object.values(this._nodeMap).forEach(cb)
          }
        }
      },

      log: {
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
        trace: () => {}
      },

      util: {
        generateId: () => 'test-' + Math.random().toString(36).substr(2, 9),
        ensureString: (val) => String(val),
        evaluateNodeProperty: (value, type, node, msg, callback) => {
          if (callback) {
            callback(null, value)
          } else {
            return value
          }
        }
      },

      settings: {
        available: () => true,
        get: (key) => undefined,
        set: (key, value) => {}
      },

      _: (key) => key // Simple i18n mock
    }

    // Add httpAdmin mock for HTTP endpoint registration
    RED.httpAdmin = {
      get: function (path, ...handlers) {
        // Mock HTTP GET endpoint registration
      },
      post: function (path, ...handlers) {
        // Mock HTTP POST endpoint registration
      }
    }

    // Add auth mock
    RED.auth = {
      needsPermission: function (permission) {
        return function (req, res, next) {
          if (next) next()
        }
      }
    }

    // Add node map for tracking
    RED.nodes._nodeMap = {}

    return RED
  }

  /**
   * Create mock Modbus client for testing
   */
  createMockModbusClient () {
    const client = {
      isOpen: false,

      connectTCP: function (host, options, callback) {
        setTimeout(() => {
          this.isOpen = true
          if (callback) callback()
        }, 10)
      },

      connectTcpRTUBuffered: function (host, options, callback) {
        setTimeout(() => {
          this.isOpen = true
          if (callback) callback()
        }, 10)
      },

      connectRTUBuffered: function (path, options, callback) {
        setTimeout(() => {
          this.isOpen = true
          if (callback) callback()
        }, 10)
      },

      connectAsciiSerial: function (path, options, callback) {
        setTimeout(() => {
          this.isOpen = true
          if (callback) callback()
        }, 10)
      },

      close: function (callback) {
        this.isOpen = false
        if (callback) callback()
      },

      setID: function (id) {
        this.unitId = id
      },

      setTimeout: function (timeout) {
        this.timeout = timeout
      },

      // Modbus function mocks
      readCoils: function (address, quantity, callback) {
        if (callback) callback(null, { data: Array(quantity).fill(false) })
      },

      readDiscreteInputs: function (address, quantity, callback) {
        if (callback) callback(null, { data: Array(quantity).fill(false) })
      },

      readHoldingRegisters: function (address, quantity, callback) {
        if (callback) callback(null, { data: Array(quantity).fill(0), buffer: Buffer.alloc(quantity * 2) })
      },

      readInputRegisters: function (address, quantity, callback) {
        if (callback) callback(null, { data: Array(quantity).fill(0), buffer: Buffer.alloc(quantity * 2) })
      },

      writeSingleCoil: function (address, value, callback) {
        if (callback) callback(null, { address, value })
      },

      writeSingleRegister: function (address, value, callback) {
        if (callback) callback(null, { address, value })
      },

      writeMultipleCoils: function (address, values, callback) {
        if (callback) callback(null, { address, quantity: values.length })
      },

      writeMultipleRegisters: function (address, values, callback) {
        if (callback) callback(null, { address, quantity: values.length })
      }
    }

    return client
  }

  /**
   * Create mock FSM for state machine testing
   */
  createMockFSM (initialState = 'init') {
    return {
      value: initialState,
      actions: [],

      transition: function (state, event) {
        const oldState = this.value
        this.value = state
        this.actions.push({ from: oldState, to: state, event })
        return { value: state, actions: this.actions }
      }
    }
  }

  /**
   * Wait for condition with timeout
   */
  waitForCondition (conditionFn, timeout = 1000, interval = 10) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()

      const check = () => {
        if (conditionFn()) {
          resolve()
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Condition timeout'))
        } else {
          setTimeout(check, interval)
        }
      }

      check()
    })
  }

  /**
   * Advance fake timers safely
   */
  async advanceTimers (ms) {
    if (this.sandbox && this.sandbox.clock) {
      await this.sandbox.clock.tickAsync(ms)
    }
  }

  /**
   * Run all pending timers
   */
  async runAllTimers () {
    if (this.sandbox && this.sandbox.clock) {
      await this.sandbox.clock.runAllAsync()
    }
  }
}

module.exports = {
  TestIsolation,
  beforeEachTest,
  afterEachTest,
  loadNodesWithTimeout
}
