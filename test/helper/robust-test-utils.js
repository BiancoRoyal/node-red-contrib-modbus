/**
 * Robust Test Utilities for Node-RED Modbus
 * Simple interface for crash-free testing
 */

'use strict'

const { TestLifecycleManager } = require('./test-lifecycle-manager')
const { getPort, cleanup: cleanupPorts } = require('./enhanced-port-helper')
const { cleanFlowPositionData } = require('./test-helper-extensions')

/**
 * Simple wrapper for robust Node-RED Modbus testing
 */
class RobustTestRunner {
  constructor (testName) {
    this.testName = testName || `test-${Date.now()}`
    this.manager = null
    this.isSetup = false
  }

  /**
   * Setup test environment
   */
  async setup () {
    if (this.isSetup) {
      throw new Error('Test already set up. Call cleanup() first.')
    }

    this.manager = new TestLifecycleManager()
    await this.manager.setup({ helperTimeout: 10000 })
    this.isSetup = true

    return this
  }

  /**
   * Load nodes with automatic resource management
   */
  async loadNodes (nodes, flow, options = {}) {
    if (!this.isSetup) {
      throw new Error('Call setup() before loading nodes')
    }

    // Clean the flow data
    const cleanedFlow = cleanFlowPositionData(flow)

    // Load nodes with the manager
    return await this.manager.loadNodes(nodes, cleanedFlow, {
      loadTimeout: options.timeout || 10000
    })
  }

  /**
   * Wait for a condition with proper timeout handling
   */
  async waitFor (conditionFn, timeout = 3000) {
    if (!this.manager) {
      throw new Error('Test not set up')
    }

    return await this.manager.waitForCondition(conditionFn, timeout)
  }

  /**
   * Get a unique port for this test
   */
  async getPort () {
    return await getPort(this.testName)
  }

  /**
   * Clean up all resources
   */
  async cleanup () {
    if (!this.isSetup) {
      return
    }

    try {
      if (this.manager) {
        await this.manager.cleanup()
        this.manager = null
      }

      // Clean up ports
      cleanupPorts(this.testName)

      this.isSetup = false
    } catch (error) {
      console.warn(`Cleanup warning for ${this.testName}:`, error.message)
    }
  }
}

/**
 * Helper function to create standard modbus test flow
 */
function createModbusFlow (port, options = {}) {
  const flow = [
    {
      id: 'server-node',
      type: 'modbus-server',
      name: 'Test Server',
      serverPort: port,
      serverAddress: '127.0.0.1',
      responseDelay: 10,
      delayUnit: 'ms',
      coilsBufferSize: 1024,
      holdingBufferSize: 1024,
      inputBufferSize: 1024,
      discreteBufferSize: 1024,
      showErrors: false,
      wires: []
    },
    {
      id: 'client-node',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: port,
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB',
      serialType: 'RTU',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'none',
      serialConnectionDelay: '100',
      unit_id: '1',
      commandDelay: '10',
      clientTimeout: '1000',
      reconnectOnTimeout: false,
      reconnectTimeout: '200',
      wires: []
    }
  ]

  if (options.includeRead) {
    flow.push({
      id: 'read-node',
      type: 'modbus-read',
      name: 'Read Node',
      topic: '',
      showStatusActivities: false,
      logIOActivities: false,
      showErrors: false,
      unitid: '',
      dataType: options.dataType || 'Coil',
      adr: '0',
      quantity: '8',
      rate: '1',
      rateUnit: 's',
      delayOnStart: false,
      startDelayTime: '',
      server: 'client-node',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      wires: [['helper-node']]
    })
  }

  if (options.includeWrite) {
    flow.push({
      id: 'write-node',
      type: 'modbus-write',
      name: 'Write Node',
      showStatusActivities: false,
      showErrors: false,
      unitid: '',
      dataType: options.writeDataType || 'MHoldingRegisters',
      adr: '0',
      quantity: '4',
      server: 'client-node',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      wires: [['helper-node'], []]
    })
  }

  if (options.includeHelper !== false) {
    flow.push({
      id: 'helper-node',
      type: 'helper',
      wires: []
    })
  }

  return flow
}

/**
 * Convenience function for simple tests
 */
async function runSimpleTest (testName, testFn) {
  const runner = new RobustTestRunner(testName)

  try {
    await runner.setup()
    return await testFn(runner)
  } finally {
    await runner.cleanup()
  }
}

/**
 * Helper to create a test suite with proper lifecycle
 */
function createTestSuite (suiteName, tests) {
  describe(suiteName, function () {
    // Increase timeout for the entire suite
    this.timeout(15000)

    let runner

    beforeEach(async function () {
      runner = new RobustTestRunner(`${suiteName}-${this.currentTest.title}`)
      await runner.setup()
    })

    afterEach(async function () {
      if (runner) {
        await runner.cleanup()
        runner = null
      }
    })

    // Run the tests with the runner available
    tests(function () { return runner })
  })
}

module.exports = {
  RobustTestRunner,
  createModbusFlow,
  runSimpleTest,
  createTestSuite
}
