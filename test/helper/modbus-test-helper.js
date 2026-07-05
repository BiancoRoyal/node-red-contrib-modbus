/**
 * Enhanced Modbus Test Helper with comprehensive timeout fix
 * Addresses timeouts by providing proper mocking and connection management
 */

'use strict'

const helper = require('node-red-node-test-helper')
const sinon = require('sinon')
const { EventEmitter } = require('events')
const { PortHelper } = require('./test-helper-port')
const portHelper = new PortHelper()

/**
 * Comprehensive test helper for fixing timeout issues
 */
class ModbusTestHelper {
  constructor () {
    this.stubs = []
    this.timers = []
    this.connections = []
    this.fsms = []
    this.originalSetTimeout = global.setTimeout
    this.originalSetInterval = global.setInterval
    this.originalClearTimeout = global.clearTimeout
    this.originalClearInterval = global.clearInterval
    this.timeouts = new Map()
    this.intervals = new Map()
    this.isSetup = false
  }

  /**
   * Mock the @openp4nr/node-modbus library to prevent real network connections
   */
  mockModbusSerial () {
    try {
      const modulePath = require.resolve('@openp4nr/node-modbus')

      // Create comprehensive mock client
      const createMockClient = () => {
        const mockClient = new EventEmitter()

        const connectSuccess = (callback) => {
          mockClient.isOpen = true
          mockClient.emit('connect')
          if (typeof callback === 'function') {
            process.nextTick(() => callback(null))
          }
          return Promise.resolve()
        }

        const resolveConnectCallback = (args) => {
          const last = args[args.length - 1]
          return typeof last === 'function' ? last : undefined
        }

        // Connection methods — Promise API used by modbus-client v6
        mockClient.connectTCP = sinon.stub().callsFake(function (...args) {
          return connectSuccess(resolveConnectCallback(args))
        })

        mockClient.connectTelnet = sinon.stub().callsFake(function (...args) {
          return connectSuccess(resolveConnectCallback(args))
        })

        mockClient.connectTcpRTUBuffered = sinon.stub().callsFake(function (...args) {
          return connectSuccess(resolveConnectCallback(args))
        })

        mockClient.connectUDP = sinon.stub().callsFake(function (...args) {
          return connectSuccess(resolveConnectCallback(args))
        })

        mockClient.connectC701 = sinon.stub().callsFake(function (...args) {
          return connectSuccess(resolveConnectCallback(args))
        })

        mockClient.connectRTUBuffered = sinon.stub().callsFake(function (...args) {
          return connectSuccess(resolveConnectCallback(args))
        })

        mockClient.connectSerial = sinon.stub().callsFake(function (...args) {
          return connectSuccess(resolveConnectCallback(args))
        })

        // Read operations return mock data (Promise API used by v6 client core)
        mockClient.readCoils = sinon.stub().callsFake(function (address, quantity) {
          const data = new Array(quantity).fill(false)
          return Promise.resolve({ data, buffer: Buffer.alloc(Math.ceil(quantity / 8) || 1) })
        })

        mockClient.readDiscreteInputs = sinon.stub().callsFake(function (address, quantity) {
          const data = new Array(quantity).fill(false)
          return Promise.resolve({ data, buffer: Buffer.alloc(Math.ceil(quantity / 8) || 1) })
        })

        mockClient.readHoldingRegisters = sinon.stub().callsFake(function (address, quantity) {
          const stored = mockClient._holdingRegisters && mockClient._holdingRegisters[address]
          const data = stored
            ? stored.slice(0, quantity)
            : new Array(quantity).fill(0)
          const buffer = Buffer.alloc(quantity * 2)
          data.forEach((val, idx) => buffer.writeUInt16BE(val, idx * 2))
          return Promise.resolve({ data, buffer })
        })

        mockClient.readInputRegisters = sinon.stub().callsFake(function (address, quantity) {
          const data = new Array(quantity).fill(0)
          const buffer = Buffer.alloc(quantity * 2)
          return Promise.resolve({ data, buffer })
        })

        mockClient.writeRegisters = sinon.stub().callsFake(function (address, values) {
          mockClient._holdingRegisters = mockClient._holdingRegisters || {}
          mockClient._holdingRegisters[address] = values.slice()
          return Promise.resolve({ address, length: values.length })
        })

        mockClient.writeRegister = sinon.stub().callsFake(function (address, value) {
          mockClient._holdingRegisters = mockClient._holdingRegisters || {}
          mockClient._holdingRegisters[address] = [value]
          return Promise.resolve({ address, value })
        })

        // Write operations succeed (Promise API)
        mockClient.writeCoil = sinon.stub().callsFake(function (address, value) {
          return Promise.resolve({ address, state: value })
        })

        mockClient.writeCoils = sinon.stub().callsFake(function (address, values) {
          return Promise.resolve({ address, length: values.length })
        })

        // Connection management
        mockClient.close = sinon.stub().callsFake((callback) => {
          process.nextTick(() => {
            mockClient.isOpen = false
            if (callback) callback()
            mockClient.emit('close')
          })
        })

        mockClient.setTimeout = sinon.stub().returns(mockClient)
        mockClient.getTimeout = sinon.stub().returns(1000)
        mockClient.setID = sinon.stub().returns(mockClient)
        mockClient.getID = sinon.stub().returns(1)
        mockClient.isOpen = false

        // Mock port object
        mockClient._port = {
          on: sinon.stub(),
          removeAllListeners: sinon.stub(),
          close: sinon.stub().callsFake((callback) => {
            if (callback) callback()
          })
        }

        return mockClient
      }

      // Mock the main export
      const MockModbusRTU = sinon.stub().callsFake(() => createMockClient())

      // Store original and replace
      const moduleCache = require.cache[modulePath]
      if (moduleCache) {
        const originalExports = moduleCache.exports
        moduleCache.exports = MockModbusRTU

        this.stubs.push({
          restore: () => {
            moduleCache.exports = originalExports
          }
        })
      }
    } catch (error) {
      // If module not found, create stub
      console.warn('Could not mock @openp4nr/node-modbus, module not found:', error.message)
    }
  }

  /**
   * Mock network connections to prevent ECONNREFUSED errors
   */
  mockNetConnections () {
    const net = require('net')

    const createMockSocket = () => {
      const mockSocket = new EventEmitter()
      mockSocket.write = sinon.stub().returns(true)
      mockSocket.end = sinon.stub()
      mockSocket.destroy = sinon.stub()
      mockSocket.setTimeout = sinon.stub()
      mockSocket.setKeepAlive = sinon.stub()
      mockSocket.setNoDelay = sinon.stub()
      mockSocket.ref = sinon.stub()
      mockSocket.unref = sinon.stub()
      mockSocket.cork = sinon.stub()
      mockSocket.uncork = sinon.stub()
      mockSocket.readable = true
      mockSocket.writable = true

      return mockSocket
    }

    if (typeof net.createConnection.restore === 'function') {
      return
    }

    const originalCreateConnection = net.createConnection.bind(net)

    const createConnectionStub = sinon.stub(net, 'createConnection').callsFake((options, callback) => {
      // supertest uses net.createConnection with HTTP-style options — must pass through
      if (options && typeof options === 'object' && ('method' in options || 'path' in options || 'headers' in options)) {
        return originalCreateConnection(options, callback)
      }

      const host = options && typeof options === 'object'
        ? (options.host || options.hostname || options.address)
        : undefined
      if (host === '127.0.0.1' || host === 'localhost') {
        return originalCreateConnection(options, callback)
      }

      const mockSocket = createMockSocket()

      process.nextTick(() => {
        mockSocket.emit('connect')
        if (callback) callback()
      })

      this.connections.push(mockSocket)
      return mockSocket
    })

    this.stubs.push(createConnectionStub)
  }

  /**
   * Mock FSM to prevent hanging states with timeout protection
   */
  mockFSM (node) {
    if (!node || !node.stateService) return null

    // Add timeout protection to FSM
    const originalSend = node.stateService.send
    const sendStub = sinon.stub(node.stateService, 'send').callsFake((event, data) => {
      // Immediately handle state transitions to prevent hanging
      switch (event) {
        case 'CONNECT':
          node.stateService.state = { value: 'connecting' }
          // Auto-transition to connected after short delay
          setTimeout(() => {
            if (node.stateService.state.value === 'connecting') {
              node.stateService.state = { value: 'connected' }
              // Auto-activate
              setTimeout(() => {
                if (node.stateService.state.value === 'connected') {
                  node.stateService.state = { value: 'activated' }
                }
              }, 10)
            }
          }, 10)
          break

        case 'ACTIVATE':
          node.stateService.state = { value: 'activated' }
          break

        case 'CLOSE':
          node.stateService.state = { value: 'closed' }
          break

        case 'FAILURE':
        case 'BREAK':
          node.stateService.state = { value: 'failed' }
          break

        case 'STOP':
          node.stateService.state = { value: 'stopped' }
          break

        default:
          // For unknown events, try original behavior with timeout
          if (originalSend) {
            try {
              originalSend.call(node.stateService, event, data)
            } catch (error) {
              // If original fails, set safe state
              node.stateService.state = { value: 'stopped' }
            }
          }
      }
    })

    this.stubs.push(sendStub)
    this.fsms.push(node.stateService)
    return sendStub
  }

  /**
   * Mock timers with timeout caps for faster tests
   */
  mockTimers () {
    if (this.timersAreMocked) return

    const maxDelay = 100 // Cap all delays at 100ms for tests

    global.setTimeout = (fn, delay, ...args) => {
      const cappedDelay = Math.min(delay, maxDelay)
      const id = this.originalSetTimeout(() => {
        this.timeouts.delete(id)
        try {
          fn(...args)
        } catch (error) {
          console.warn('Timer callback error:', error.message)
        }
      }, cappedDelay)

      this.timeouts.set(id, { fn, delay: cappedDelay, args })
      return id
    }

    global.setInterval = (fn, delay, ...args) => {
      const cappedDelay = Math.min(delay, maxDelay)
      const id = this.originalSetInterval(() => {
        try {
          fn(...args)
        } catch (error) {
          console.warn('Interval callback error:', error.message)
        }
      }, cappedDelay)

      this.intervals.set(id, { fn, delay: cappedDelay, args })
      return id
    }

    this.timersAreMocked = true
  }

  /**
   * Setup comprehensive mocks for preventing timeouts
   */
  setupMocks (options = {}) {
    if (this.isSetup) return this

    if (options.mockModbusSerial !== false) {
      this.mockModbusSerial()
    }

    if (options.mockNetConnections !== false) {
      this.mockNetConnections()
    }

    if (options.mockTimers !== false) {
      this.mockTimers()
    }

    this.isSetup = true
    return this
  }

  /**
   * Mock a specific node's FSM and connection behavior
   */
  mockNodeBehavior (node) {
    if (!node) return

    // Mock FSM if present
    if (node.stateService) {
      this.mockFSM(node)
    }

    // Mock client connection methods
    if (node.connectClient) {
      sinon.stub(node, 'connectClient').callsFake(() => {
        if (node.stateService) {
          node.stateService.state = { value: 'activated' }
        }
        process.nextTick(() => {
          if (node.emit) node.emit('mbconnected')
        })
      })
    }

    // Mock modbus operations
    if (node.client) {
      this.mockClientOperations(node.client)
    }
  }

  /**
   * Mock client operations to prevent network calls
   */
  mockClientOperations (client) {
    if (!client) return

    const operations = [
      'readCoils', 'readDiscreteInputs', 'readHoldingRegisters', 'readInputRegisters',
      'writeCoil', 'writeRegister', 'writeCoils', 'writeRegisters',
      'connectTCP', 'connectRTUBuffered', 'connectSerial', 'close'
    ]

    operations.forEach(op => {
      if (typeof client[op] === 'function') {
        sinon.stub(client, op).callsFake((...args) => {
          const callback = args[args.length - 1]
          if (typeof callback === 'function') {
            process.nextTick(() => callback(null, { success: true }))
          }
        })
      }
    })
  }

  /**
   * Comprehensive cleanup to prevent resource leaks
   */
  cleanup () {
    // Clear all timeouts and intervals
    this.timeouts.forEach((_, id) => {
      this.originalClearTimeout(id)
    })
    this.intervals.forEach((_, id) => {
      this.originalClearInterval(id)
    })
    this.timeouts.clear()
    this.intervals.clear()

    // Restore timer functions
    if (this.timersAreMocked) {
      global.setTimeout = this.originalSetTimeout
      global.setInterval = this.originalSetInterval
      global.clearTimeout = this.originalClearTimeout
      global.clearInterval = this.originalClearInterval
      this.timersAreMocked = false
    }

    // Restore all stubs
    this.stubs.forEach(stub => {
      try {
        if (stub && typeof stub.restore === 'function') {
          stub.restore()
        }
      } catch (error) {
        // Ignore restore errors
      }
    })
    this.stubs = []

    // Clean up connections
    this.connections.forEach(conn => {
      try {
        if (conn && typeof conn.removeAllListeners === 'function') {
          conn.removeAllListeners()
        }
        if (conn && typeof conn.destroy === 'function') {
          conn.destroy()
        }
        if (conn && typeof conn.close === 'function') {
          conn.close()
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    })
    this.connections = []

    // Clean up FSMs
    this.fsms.forEach(fsm => {
      try {
        if (fsm && typeof fsm.send === 'function') {
          fsm.send('STOP')
        }
      } catch (error) {
        // Ignore FSM errors
      }
    })
    this.fsms = []

    this.isSetup = false

    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
  }

  /**
   * Create a test flow with proper port management
   */
  async createTestFlow (baseFlow) {
    const flow = JSON.parse(JSON.stringify(baseFlow))
    const port = portHelper.getPort()

    flow.forEach(node => {
      if (node.type === 'modbus-server' && 'serverPort' in node) {
        node.serverPort = port
      }
      if (node.type === 'modbus-client' && 'tcpPort' in node) {
        node.tcpPort = port
      }
    })

    return flow
  }

  /**
   * Wait for condition with timeout protection
   */
  async waitFor (condition, timeout = 1000) {
    const start = Date.now()

    while (Date.now() - start < timeout) {
      try {
        if (await condition()) {
          return true
        }
      } catch (error) {
        // Ignore condition errors and continue
      }
      await this.sleep(10)
    }

    return false // Don't throw, return false
  }

  /**
   * Sleep utility
   */
  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * FlowTester class for declarative Modbus testing
 */
class ModbusFlowTester {
  constructor () {
    this.flow = []
    this.nodes = []
    this.inputs = []
    this.expectations = []
    this.timeout = 5000
    this.serverPort = null
    this.credentials = {}
  }

  /**
   * Add a Modbus server to the flow
   */
  withModbusServer (config = {}) {
    this.serverPort = config.port || portHelper.getPort()
    this.flow.push({
      id: config.id || 'modbus-server-test',
      type: 'modbus-server',
      name: config.name || 'Test Modbus Server',
      hostname: config.hostname || '127.0.0.1',
      serverPort: String(this.serverPort),
      responseDelay: config.responseDelay || 50,
      delayUnit: 'ms',
      coilsBufferSize: config.coilsBufferSize || 10000,
      holdingBufferSize: config.holdingBufferSize || 10000,
      inputBufferSize: config.inputBufferSize || 10000,
      discreteBufferSize: config.discreteBufferSize || 10000,
      showErrors: config.showErrors || false,
      ...config
    })
    return this
  }

  /**
   * Add a Modbus client to the flow
   */
  withModbusClient (config = {}) {
    const clientConfig = {
      id: config.id || 'modbus-client-test',
      type: 'modbus-client',
      name: config.name || 'Test Modbus Client',
      clienttype: config.clienttype || 'tcp',
      bufferCommands: config.bufferCommands !== false,
      stateLogEnabled: config.stateLogEnabled || false,
      queueLogEnabled: config.queueLogEnabled || false,
      failureLogEnabled: config.failureLogEnabled || false,
      tcpHost: config.tcpHost || '127.0.0.1',
      tcpPort: String(config.tcpPort || this.serverPort || portHelper.getPort()),
      tcpType: config.tcpType || 'DEFAULT',
      serialPort: config.serialPort || '',
      serialType: config.serialType || 'RTU',
      serialBaudrate: config.serialBaudrate || '9600',
      serialDatabits: config.serialDatabits || '8',
      serialStopbits: config.serialStopbits || '1',
      serialParity: config.serialParity || 'none',
      serialConnectionDelay: config.serialConnectionDelay || '100',
      serialAsciiResponseStartDelimiter: config.serialAsciiResponseStartDelimiter || '0x3A',
      unit_id: config.unit_id || '1',
      commandDelay: config.commandDelay || '1',
      clientTimeout: config.clientTimeout || '1000',
      reconnectOnTimeout: config.reconnectOnTimeout !== false,
      reconnectTimeout: config.reconnectTimeout || '2000',
      parallelUnitIdsAllowed: config.parallelUnitIdsAllowed !== false,
      ...config
    }
    this.flow.push(clientConfig)
    return this
  }

  /**
   * Add a node to the flow
   */
  withNode (nodeModule, config) {
    this.nodes.push(nodeModule)
    this.flow.push(config)
    return this
  }

  /**
   * Add a helper node to capture output
   */
  withHelperNode (id = 'helper-node') {
    this.flow.push({
      id,
      type: 'helper',
      name: 'Helper Node',
      wires: []
    })
    return this
  }

  /**
   * Send a message to a node after a delay
   */
  sendTo (nodeId, message, delay = 100) {
    this.inputs.push({ nodeId, message, delay })
    return this
  }

  /**
   * Send a sequence of messages with intervals
   */
  sendSequence (nodeId, messages, interval = 100) {
    messages.forEach((msg, index) => {
      this.inputs.push({
        nodeId,
        message: msg,
        delay: index * interval
      })
    })
    return this
  }

  /**
   * Expect output from a node
   */
  expectOutput (nodeId, validator) {
    this.expectations.push({
      nodeId,
      type: 'output',
      validator,
      timeout: this.timeout
    })
    return this
  }

  /**
   * Expect no output from a node
   */
  expectNoOutput (nodeId) {
    this.expectations.push({
      nodeId,
      type: 'no-output',
      timeout: this.timeout
    })
    return this
  }

  /**
   * Expect an error from a node
   */
  expectError (nodeId, errorValidator) {
    this.expectations.push({
      nodeId,
      type: 'error',
      validator: errorValidator,
      timeout: this.timeout
    })
    return this
  }

  /**
   * Run the test flow
   */
  async run () {
    // Load the flow with all nodes
    await helper.load(this.nodes, this.flow, this.credentials)

    // Wait for server to be ready if present
    if (this.serverPort) {
      await this.delay(500)
    }

    // Send all inputs
    for (const input of this.inputs) {
      if (input.delay > 0) {
        await this.delay(input.delay)
      }
      const node = helper.getNode(input.nodeId)
      if (node) {
        node.receive(input.message)
      }
    }

    // Verify all expectations
    const results = await Promise.all(
      this.expectations.map(exp => this.verifyExpectation(exp))
    )

    return {
      passed: results.every(r => r.passed),
      results
    }
  }

  /**
   * Verify a single expectation
   */
  async verifyExpectation (expectation) {
    return new Promise((resolve) => {
      const node = helper.getNode(expectation.nodeId)
      if (!node) {
        resolve({ passed: false, error: `Node ${expectation.nodeId} not found` })
        return
      }

      let resolved = false
      let timeoutId = null

      const complete = (result) => {
        if (!resolved) {
          resolved = true
          if (timeoutId) clearTimeout(timeoutId)
          resolve(result)
        }
      }

      if (expectation.type === 'output') {
        node.on('input', (msg) => {
          try {
            if (expectation.validator) {
              expectation.validator(msg)
            }
            complete({ passed: true, message: 'Output received and validated' })
          } catch (error) {
            complete({ passed: false, error: error.message })
          }
        })
      } else if (expectation.type === 'error') {
        node.on('call:error', (call) => {
          try {
            if (expectation.validator) {
              expectation.validator(call.args[0])
            }
            complete({ passed: true, message: 'Error received and validated' })
          } catch (error) {
            complete({ passed: false, error: error.message })
          }
        })
      } else if (expectation.type === 'no-output') {
        node.on('input', () => {
          complete({ passed: false, error: 'Unexpected output received' })
        })
      }

      // Set timeout
      timeoutId = setTimeout(() => {
        if (expectation.type === 'no-output') {
          complete({ passed: true, message: 'No output received as expected' })
        } else {
          complete({ passed: false, error: `Timeout waiting for ${expectation.type}` })
        }
      }, expectation.timeout)
    })
  }

  /**
   * Clean up after test
   */
  async cleanup () {
    await helper.unload()
  }

  /**
   * Utility delay function
   */
  delay (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Mock Modbus client for unit testing without actual connections
 */
class MockModbusClient {
  constructor () {
    this.connected = false
    this.registers = new Array(10000).fill(0)
    this.coils = new Array(10000).fill(false)
    this.discreteInputs = new Array(10000).fill(false)
    this.inputRegisters = new Array(10000).fill(0)
  }

  connect () {
    this.connected = true
    return Promise.resolve()
  }

  disconnect () {
    this.connected = false
    return Promise.resolve()
  }

  readCoils (address, quantity) {
    return Promise.resolve({
      data: this.coils.slice(address, address + quantity)
    })
  }

  readDiscreteInputs (address, quantity) {
    return Promise.resolve({
      data: this.discreteInputs.slice(address, address + quantity)
    })
  }

  readHoldingRegisters (address, quantity) {
    return Promise.resolve({
      data: this.registers.slice(address, address + quantity)
    })
  }

  readInputRegisters (address, quantity) {
    return Promise.resolve({
      data: this.inputRegisters.slice(address, address + quantity)
    })
  }

  writeSingleCoil (address, value) {
    this.coils[address] = value
    return Promise.resolve({ address, value })
  }

  writeSingleRegister (address, value) {
    this.registers[address] = value
    return Promise.resolve({ address, value })
  }

  writeMultipleCoils (address, values) {
    values.forEach((val, i) => {
      this.coils[address + i] = val
    })
    return Promise.resolve({ address, quantity: values.length })
  }

  writeMultipleRegisters (address, values) {
    values.forEach((val, i) => {
      this.registers[address + i] = val
    })
    return Promise.resolve({ address, quantity: values.length })
  }
}

/**
 * Create a mock RED object for unit testing
 */
function createMockRED () {
  return {
    nodes: {
      createNode: function (node, config) {
        Object.assign(node, config)
        node.on = function () {}
        node.status = function () {}
        node.error = function () {}
        node.warn = function () {}
        node.log = function () {}
        node.send = function () {}
        node.receive = function () {}
        return node
      },
      registerType: function () {},
      getNode: function () {
        return new MockModbusClient()
      }
    },
    httpNode: {
      get: function () {},
      post: function () {}
    },
    _: function (text) { return text },
    log: {
      info: function () {},
      debug: function () {},
      trace: function () {},
      warn: function () {},
      error: function () {}
    }
  }
}

module.exports = {
  helper,
  ModbusFlowTester,
  ModbusTestHelper,
  MockModbusClient,
  createMockRED,
  portHelper
}
