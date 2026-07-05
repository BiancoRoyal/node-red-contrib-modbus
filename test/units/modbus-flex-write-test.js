/**
 * Simple unit tests for modbus-flex-write node
 */

'use strict'

const assert = require('assert')

// Mock RED object
const mockRED = {
  nodes: {
    createNode: function (node, config) {
      node.id = config.id
      node.name = config.name
      node.type = config.type
      // Preserve existing node methods set by test; only add defaults for missing ones
      node.on = node.on || function () {}
      node.emit = node.emit || function () {}
      node.status = node.status || function () {}
      node.error = node.error || function () {}
      node.warn = node.warn || function () {}
      node.log = node.log || function () {}
      node.send = node.send || function () {}
      node.receive = node.receive || function () {}
      return node
    },
    registerType: function () {},
    getNode: function () {
      return {
        queueLog: function () {},
        stateLog: function () {},
        register: function () {},
        deregister: function () {},
        registerForModbus: function () {},
        deregisterForModbus: function (id, done) { if (typeof done === 'function') done() },
        unit_id: '1',
        isInactive: function () { return false },
        isActive: function () { return true },
        isClientReadyToSend: function () { return true },
        client: {},
        emit: function () {},
        on: function () {},
        removeListener: function () {},
        removeAllListeners: function () {}
      }
    }
  },
  httpNode: {
    get: function () {},
    post: function () {}
  },
  settings: { verbose: false },
  _: function (text) { return text },
  log: {
    info: function () {},
    debug: function () {},
    trace: function () {},
    warn: function () {},
    error: function () {}
  }
}

describe('Modbus Flex Write Unit Tests', function () {
  let flexWriteModule

  beforeEach(function () {
    // Clear require cache
    delete require.cache[require.resolve('../../src/modbus-flex-write')]
    flexWriteModule = require('../../src/modbus-flex-write')
  })

  it('should load the module', function () {
    assert.strictEqual(typeof flexWriteModule, 'function')
  })

  it('should register with RED', function () {
    let registered = false
    const testRED = Object.assign({}, mockRED)
    testRED.nodes.registerType = function (name, constructor) {
      if (name === 'modbus-flex-write') {
        registered = true
      }
    }
    flexWriteModule(testRED)
    assert.strictEqual(registered, true)
  })

  it('should create node with config', function () {
    const config = {
      id: 'test-id',
      name: 'Test Flex Write',
      type: 'modbus-flex-write',
      showStatusActivities: true,
      showErrors: true,
      server: 'server-id',
      emptyMsgOnFail: false,
      keepMsgProperties: true
    }

    let nodeCreated = false
    const testRED = Object.assign({}, mockRED, { nodes: Object.assign({}, mockRED.nodes) })
    testRED.nodes.createNode = function (node, conf) {
      nodeCreated = true
      node.on = node.on || function () {}
      node.emit = node.emit || function () {}
      node.status = node.status || function () {}
      node.error = node.error || function () {}
      node.warn = node.warn || function () {}
      node.log = node.log || function () {}
      node.send = node.send || function () {}
      node.receive = node.receive || function () {}
      Object.assign(node, conf)
      return node
    }
    testRED.nodes.registerType = function (name, constructor) {
      const node = {}
      constructor.call(node, config)
      assert.strictEqual(node.name, 'Test Flex Write')
      assert.strictEqual(node.showStatusActivities, true)
      assert.strictEqual(node.showErrors, true)
    }

    flexWriteModule(testRED)
    assert.strictEqual(nodeCreated, true)
  })

  it('should handle message with FC5 (write single coil)', function (done) {
    const testRED = Object.assign({}, mockRED, { nodes: Object.assign({}, mockRED.nodes) })
    let inputHandler = null

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {},
        registerForModbus: function () {},
        deregisterForModbus: function (id, cb) { if (typeof cb === 'function') cb() },
        unit_id: '1',
        isInactive: function () { return false },
        isActive: function () { return true },
        isClientReadyToSend: function () { return true },
        client: {},
        emit: function (event, msg, onDone) {
          if (event === 'writeModbus' && typeof onDone === 'function') {
            process.nextTick(() => onDone({ buffer: Buffer.alloc(0), data: [] }, msg))
          }
        },
        on: function () {},
        removeListener: function () {},
        removeAllListeners: function () {}
      }
    }

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        name: 'Test Node',
        send: function (msgs) {
          const msg = Array.isArray(msgs) ? msgs[0] : msgs
          assert.notStrictEqual(msg, undefined)
          done()
        },
        status: function () {},
        error: function () {},
        warn: function () {},
        log: function () {},
        emit: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            inputHandler = handler
          }
        }
      }

      constructor.call(node, { id: 'test-id', name: 'Test', server: 'server-id' })

      if (inputHandler) {
        setTimeout(() => {
          inputHandler({ payload: { value: true, fc: 5, unitid: 1, address: 10, quantity: 1 } })
        }, 10)
      }
    }

    flexWriteModule(testRED)
  })

  it('should handle message with FC6 (write single register)', function (done) {
    const testRED = Object.assign({}, mockRED, { nodes: Object.assign({}, mockRED.nodes) })
    let inputHandler = null

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {},
        registerForModbus: function () {},
        deregisterForModbus: function (id, cb) { if (typeof cb === 'function') cb() },
        unit_id: '1',
        isInactive: function () { return false },
        isActive: function () { return true },
        isClientReadyToSend: function () { return true },
        client: {},
        emit: function (event, msg, onDone) {
          if (event === 'writeModbus' && typeof onDone === 'function') {
            process.nextTick(() => onDone({ buffer: Buffer.alloc(0), data: [] }, msg))
          }
        },
        on: function () {},
        removeListener: function () {},
        removeAllListeners: function () {}
      }
    }

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        send: function (msgs) {
          const msg = Array.isArray(msgs) ? msgs[0] : msgs
          assert.notStrictEqual(msg, undefined)
          done()
        },
        status: function () {},
        error: function () {},
        emit: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            inputHandler = handler
          }
        }
      }

      constructor.call(node, { id: 'test-id', server: 'server-id' })

      if (inputHandler) {
        setTimeout(() => {
          inputHandler({ payload: { value: 1234, fc: 6, unitid: 1, address: 20, quantity: 1 } })
        }, 10)
      }
    }

    flexWriteModule(testRED)
  })

  it('should handle message with FC15 (write multiple coils)', function (done) {
    const testRED = Object.assign({}, mockRED, { nodes: Object.assign({}, mockRED.nodes) })
    let inputHandler = null

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {},
        registerForModbus: function () {},
        deregisterForModbus: function (id, cb) { if (typeof cb === 'function') cb() },
        unit_id: '1',
        isInactive: function () { return false },
        isActive: function () { return true },
        isClientReadyToSend: function () { return true },
        client: {},
        emit: function (event, msg, onDone) {
          if (event === 'writeModbus' && typeof onDone === 'function') {
            process.nextTick(() => onDone({ buffer: Buffer.alloc(0), data: [] }, msg))
          }
        },
        on: function () {},
        removeListener: function () {},
        removeAllListeners: function () {}
      }
    }

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        send: function (msgs) {
          const msg = Array.isArray(msgs) ? msgs[0] : msgs
          assert.notStrictEqual(msg, undefined)
          done()
        },
        status: function () {},
        error: function () {},
        emit: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            inputHandler = handler
          }
        }
      }

      constructor.call(node, { id: 'test-id', server: 'server-id' })

      if (inputHandler) {
        setTimeout(() => {
          inputHandler({ payload: { value: [true, false, true, false], fc: 15, unitid: 1, address: 0, quantity: 4 } })
        }, 10)
      }
    }

    flexWriteModule(testRED)
  })

  it('should handle message with FC16 (write multiple registers)', function (done) {
    const testRED = Object.assign({}, mockRED, { nodes: Object.assign({}, mockRED.nodes) })
    let inputHandler = null

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {},
        registerForModbus: function () {},
        deregisterForModbus: function (id, cb) { if (typeof cb === 'function') cb() },
        unit_id: '1',
        isInactive: function () { return false },
        isActive: function () { return true },
        isClientReadyToSend: function () { return true },
        client: {},
        emit: function (event, msg, onDone) {
          if (event === 'writeModbus' && typeof onDone === 'function') {
            process.nextTick(() => onDone({ buffer: Buffer.alloc(0), data: [] }, msg))
          }
        },
        on: function () {},
        removeListener: function () {},
        removeAllListeners: function () {}
      }
    }

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        send: function (msgs) {
          const msg = Array.isArray(msgs) ? msgs[0] : msgs
          assert.notStrictEqual(msg, undefined)
          done()
        },
        status: function () {},
        error: function () {},
        emit: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            inputHandler = handler
          }
        }
      }

      constructor.call(node, { id: 'test-id', server: 'server-id' })

      if (inputHandler) {
        setTimeout(() => {
          inputHandler({ payload: { value: [100, 200, 300], fc: 16, unitid: 1, address: 0, quantity: 3 } })
        }, 10)
      }
    }

    flexWriteModule(testRED)
  })

  it('should handle invalid function code', function (done) {
    const testRED = Object.assign({}, mockRED, { nodes: Object.assign({}, mockRED.nodes) })
    let inputHandler = null
    let doneCalled = false

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {},
        registerForModbus: function () {},
        deregisterForModbus: function (id, cb) { if (typeof cb === 'function') cb() },
        unit_id: '1',
        isInactive: function () { return false },
        isActive: function () { return true },
        isClientReadyToSend: function () { return true },
        client: {},
        emit: function () {},
        on: function () {},
        removeListener: function () {},
        removeAllListeners: function () {}
      }
    }

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        send: function () {},
        status: function () {},
        error: function (err) {
          if (!doneCalled) {
            assert.notStrictEqual(err, undefined)
            doneCalled = true
            done()
          }
        },
        emit: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            inputHandler = handler
          }
        }
      }

      constructor.call(node, { id: 'test-id', server: 'server-id', showErrors: true })

      if (inputHandler) {
        setTimeout(() => {
          inputHandler({ payload: { value: [1, 2, 3], fc: 99, unitid: 1, address: 0, quantity: 3 } })
        }, 10)
      }
    }

    flexWriteModule(testRED)
  })

  it('should handle missing server configuration', function () {
    const testRED = Object.assign({}, mockRED, { nodes: Object.assign({}, mockRED.nodes) })
    let constructorCompleted = false

    testRED.nodes.getNode = function () {
      return null // Server not found
    }

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        status: function () {},
        error: function () {},
        emit: function () {},
        on: function () {}
      }

      constructor.call(node, { id: 'test-id', server: null })
      constructorCompleted = true
    }

    flexWriteModule(testRED)
    // In v6, constructor returns early when no server is found (no error thrown)
    assert.strictEqual(constructorCompleted, true)
  })

  it('should preserve message properties when configured', function (done) {
    const testRED = Object.assign({}, mockRED, { nodes: Object.assign({}, mockRED.nodes) })
    let inputHandler = null

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {},
        registerForModbus: function () {},
        deregisterForModbus: function (id, cb) { if (typeof cb === 'function') cb() },
        unit_id: '1',
        isInactive: function () { return false },
        isActive: function () { return true },
        isClientReadyToSend: function () { return true },
        client: {},
        emit: function (event, msg, onDone) {
          if (event === 'writeModbus' && typeof onDone === 'function') {
            process.nextTick(() => onDone({ buffer: Buffer.alloc(0), data: [] }, msg))
          }
        },
        on: function () {},
        removeListener: function () {},
        removeAllListeners: function () {}
      }
    }

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        send: function (msgs) {
          const msg = Array.isArray(msgs) ? msgs[0] : msgs
          assert.strictEqual(msg.topic, 'test/topic')
          assert.strictEqual(msg.customProp, 'preserved')
          assert.notStrictEqual(msg.payload, undefined)
          done()
        },
        status: function () {},
        error: function () {},
        emit: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            inputHandler = handler
          }
        }
      }

      constructor.call(node, { id: 'test-id', server: 'server-id', keepMsgProperties: true })

      if (inputHandler) {
        setTimeout(() => {
          inputHandler({
            payload: { value: [1, 2], fc: 16, unitid: 1, address: 0, quantity: 2 },
            topic: 'test/topic',
            customProp: 'preserved'
          })
        }, 10)
      }
    }

    flexWriteModule(testRED)
  })
})
