/**
 * Async unit tests for modbus-flex-write using enhanced test helper
 */

'use strict'

const assert = require('assert')
const { ModbusFlowTester, createMockRED } = require('../helper/modbus-test-helper')

// Load nodes
const flexWriteNode = require('../../src/modbus-flex-write')
// const clientNode = require('../../src/modbus-client') - unused
// const serverNode = require('../../src/modbus-server') - unused

describe('Modbus Flex Write Async Tests', function () {
  this.timeout(5000)
  let tester

  beforeEach(function () {
    tester = new ModbusFlowTester()
  })

  afterEach(async function () {
    if (tester) {
      await tester.cleanup()
    }
  })

  it.skip('should write single coil (FC5) successfully', async function () {
    // Build test flow
    tester
      .withModbusServer({ id: 'server1' })
      .withModbusClient({ id: 'client1', tcpPort: tester.serverPort })
      .withNode(flexWriteNode, {
        id: 'flex-write-1',
        type: 'modbus-flex-write',
        name: 'Test Flex Write',
        server: 'client1',
        showStatusActivities: false,
        showErrors: false,
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        wires: [['helper1'], []]
      })
      .withHelperNode('helper1')

    // Set expectations
    tester.expectOutput('helper1', (msg) => {
      assert.notStrictEqual(msg.payload, undefined)
      assert.strictEqual(msg.modbusRequest.fc, 5)
      assert.strictEqual(msg.modbusRequest.address, 10)
      assert.strictEqual(msg.modbusRequest.value, true)
    })

    // Send input
    tester.sendTo('flex-write-1', {
      payload: {
        value: true,
        fc: 5,
        unitid: 1,
        address: 10,
        quantity: 1
      }
    }, 1000)

    // Run test
    const result = await tester.run()
    assert.strictEqual(result.passed, true, result.results[0]?.error)
  })

  it.skip('should write single register (FC6) successfully', async function () {
    tester
      .withModbusServer({ id: 'server2' })
      .withModbusClient({ id: 'client2', tcpPort: tester.serverPort })
      .withNode(flexWriteNode, {
        id: 'flex-write-2',
        type: 'modbus-flex-write',
        name: 'Test Flex Write FC6',
        server: 'client2',
        showStatusActivities: false,
        showErrors: false,
        wires: [['helper2'], []]
      })
      .withHelperNode('helper2')

    tester.expectOutput('helper2', (msg) => {
      assert.notStrictEqual(msg.payload, undefined)
      assert.strictEqual(msg.modbusRequest.fc, 6)
      assert.strictEqual(msg.modbusRequest.address, 20)
      assert.strictEqual(msg.modbusRequest.value, 1234)
    })

    tester.sendTo('flex-write-2', {
      payload: {
        value: 1234,
        fc: 6,
        unitid: 1,
        address: 20,
        quantity: 1
      }
    }, 1000)

    const result = await tester.run()
    assert.strictEqual(result.passed, true, result.results[0]?.error)
  })

  it.skip('should write multiple coils (FC15) successfully', async function () {
    tester
      .withModbusServer({ id: 'server3' })
      .withModbusClient({ id: 'client3', tcpPort: tester.serverPort })
      .withNode(flexWriteNode, {
        id: 'flex-write-3',
        type: 'modbus-flex-write',
        name: 'Test Flex Write FC15',
        server: 'client3',
        showStatusActivities: false,
        showErrors: false,
        wires: [['helper3'], []]
      })
      .withHelperNode('helper3')

    tester.expectOutput('helper3', (msg) => {
      assert.notStrictEqual(msg.payload, undefined)
      assert.strictEqual(msg.modbusRequest.fc, 15)
      assert.strictEqual(msg.modbusRequest.address, 0)
      assert.strictEqual(msg.modbusRequest.quantity, 4)
      assert.strictEqual(Array.isArray(msg.modbusRequest.value), true)
      assert.strictEqual(msg.modbusRequest.value.length, 4)
    })

    tester.sendTo('flex-write-3', {
      payload: {
        value: [true, false, true, false],
        fc: 15,
        unitid: 1,
        address: 0,
        quantity: 4
      }
    }, 1000)

    const result = await tester.run()
    assert.strictEqual(result.passed, true, result.results[0]?.error)
  })

  it.skip('should write multiple registers (FC16) successfully', async function () {
    tester
      .withModbusServer({ id: 'server4' })
      .withModbusClient({ id: 'client4', tcpPort: tester.serverPort })
      .withNode(flexWriteNode, {
        id: 'flex-write-4',
        type: 'modbus-flex-write',
        name: 'Test Flex Write FC16',
        server: 'client4',
        showStatusActivities: false,
        showErrors: false,
        wires: [['helper4'], []]
      })
      .withHelperNode('helper4')

    tester.expectOutput('helper4', (msg) => {
      assert.notStrictEqual(msg.payload, undefined)
      assert.strictEqual(msg.modbusRequest.fc, 16)
      assert.strictEqual(msg.modbusRequest.address, 100)
      assert.strictEqual(msg.modbusRequest.quantity, 3)
      assert.deepStrictEqual(msg.modbusRequest.value, [100, 200, 300])
    })

    tester.sendTo('flex-write-4', {
      payload: {
        value: [100, 200, 300],
        fc: 16,
        unitid: 1,
        address: 100,
        quantity: 3
      }
    }, 1000)

    const result = await tester.run()
    assert.strictEqual(result.passed, true, result.results[0]?.error)
  })

  it.skip('should handle invalid function code with error', async function () {
    tester
      .withModbusServer({ id: 'server5' })
      .withModbusClient({ id: 'client5', tcpPort: tester.serverPort })
      .withNode(flexWriteNode, {
        id: 'flex-write-5',
        type: 'modbus-flex-write',
        name: 'Test Invalid FC',
        server: 'client5',
        showStatusActivities: false,
        showErrors: true,
        emptyMsgOnFail: true,
        wires: [[], ['error-helper']]
      })
      .withHelperNode('error-helper')

    tester.expectOutput('error-helper', (msg) => {
      assert.strictEqual(msg.payload, '')
      assert.notStrictEqual(msg.error, undefined)
    })

    tester.sendTo('flex-write-5', {
      payload: {
        value: [1, 2, 3],
        fc: 99, // Invalid function code
        unitid: 1,
        address: 0,
        quantity: 3
      }
    }, 1000)

    const result = await tester.run()
    assert.strictEqual(result.passed, true, result.results[0]?.error)
  })

  it.skip('should preserve message properties when configured', async function () {
    tester
      .withModbusServer({ id: 'server6' })
      .withModbusClient({ id: 'client6', tcpPort: tester.serverPort })
      .withNode(flexWriteNode, {
        id: 'flex-write-6',
        type: 'modbus-flex-write',
        name: 'Test Keep Properties',
        server: 'client6',
        showStatusActivities: false,
        showErrors: false,
        keepMsgProperties: true,
        wires: [['helper6'], []]
      })
      .withHelperNode('helper6')

    tester.expectOutput('helper6', (msg) => {
      assert.strictEqual(msg.topic, 'test/topic')
      assert.strictEqual(msg.customProp, 'preserved')
      assert.notStrictEqual(msg.payload, undefined)
    })

    tester.sendTo('flex-write-6', {
      payload: {
        value: [111, 222],
        fc: 16,
        unitid: 1,
        address: 10,
        quantity: 2
      },
      topic: 'test/topic',
      customProp: 'preserved'
    }, 1000)

    const result = await tester.run()
    assert.strictEqual(result.passed, true, result.results[0]?.error)
  })

  it.skip('should handle multiple writes in sequence', async function () {
    tester
      .withModbusServer({ id: 'server7' })
      .withModbusClient({ id: 'client7', tcpPort: tester.serverPort })
      .withNode(flexWriteNode, {
        id: 'flex-write-7',
        type: 'modbus-flex-write',
        name: 'Test Sequential Writes',
        server: 'client7',
        showStatusActivities: false,
        showErrors: false,
        wires: [['helper7'], []]
      })
      .withHelperNode('helper7')

    // let messageCount = 0 - unused variable
    tester.expectOutput('helper7', (msg) => {
      // messageCount++
      assert.notStrictEqual(msg.payload, undefined)
      assert.strictEqual(msg.modbusRequest.fc, 16)
    })

    // Send multiple writes
    const messages = [
      { value: [10, 20], fc: 16, unitid: 1, address: 0, quantity: 2 },
      { value: [30, 40], fc: 16, unitid: 1, address: 10, quantity: 2 },
      { value: [50, 60], fc: 16, unitid: 1, address: 20, quantity: 2 }
    ]

    tester.sendSequence('flex-write-7',
      messages.map(m => ({ payload: m })),
      200
    )

    const result = await tester.run()

    // Wait a bit more for all messages
    await new Promise(resolve => setTimeout(resolve, 1000))

    assert.strictEqual(result.passed, true, result.results[0]?.error)
  })
})

describe('Modbus Flex Write Unit Tests (Mocked)', function () {
  it('should load the module correctly', function () {
    const flexWriteModule = require('../../src/modbus-flex-write')
    assert.strictEqual(typeof flexWriteModule, 'function')
  })

  it('should register with RED correctly', function () {
    const flexWriteModule = require('../../src/modbus-flex-write')
    const mockRED = createMockRED()
    let registered = false

    mockRED.nodes.registerType = function (name, constructor) {
      if (name === 'modbus-flex-write') {
        registered = true
      }
    }

    flexWriteModule(mockRED)
    assert.strictEqual(registered, true)
  })

  it.skip('should handle configuration correctly', function () {
    const flexWriteModule = require('../../src/modbus-flex-write')
    const mockRED = createMockRED()
    let nodeConfig = null

    mockRED.nodes.registerType = function (name, constructor) {
      const node = {}
      const config = {
        id: 'test-id',
        name: 'Test Node',
        showStatusActivities: true,
        showErrors: true,
        server: 'server-id',
        emptyMsgOnFail: true,
        keepMsgProperties: true
      }
      constructor.call(node, config)
      nodeConfig = node
    }

    flexWriteModule(mockRED)
    assert.strictEqual(nodeConfig.name, 'Test Node')
    assert.strictEqual(nodeConfig.showStatusActivities, true)
    assert.strictEqual(nodeConfig.showErrors, true)
  })
})
