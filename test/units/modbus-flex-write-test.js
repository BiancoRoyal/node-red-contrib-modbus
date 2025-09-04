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
      return {
        queueLog: function () {},
        stateLog: function () {},
        register: function () {},
        deregister: function () {}
      }
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

  it.skip('should create node with config', function () {
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
    const testRED = Object.assign({}, mockRED)
    testRED.nodes.createNode = function (node, conf) {
      nodeCreated = true
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

  it.skip('should handle message with FC5 (write single coil)', function (done) {
    const testRED = Object.assign({}, mockRED)
    // let msgSent = false - unused variable

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        name: 'Test Node',
        send: function (msg) {
          // msgSent = true - variable was removed
          assert.notStrictEqual(msg, undefined)
          done()
        },
        status: function () {},
        error: function () {},
        warn: function () {},
        log: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            // Simulate input message
            setTimeout(() => {
              handler({
                payload: {
                  value: true,
                  fc: 5,
                  unitid: 1,
                  address: 10,
                  quantity: 1
                }
              })
            }, 10)
          }
        }
      }

      constructor.call(node, {
        id: 'test-id',
        name: 'Test',
        server: 'server-id'
      })
    }

    testRED.nodes.getNode = function () {
      return {
        register: function (node) {
          // Node registered
        },
        queueLog: function () {},
        stateLog: function () {}
      }
    }

    flexWriteModule(testRED)
  })

  it.skip('should handle message with FC6 (write single register)', function (done) {
    const testRED = Object.assign({}, mockRED)

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        send: function (msg) {
          assert.notStrictEqual(msg, undefined)
          done()
        },
        status: function () {},
        error: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            setTimeout(() => {
              handler({
                payload: {
                  value: 1234,
                  fc: 6,
                  unitid: 1,
                  address: 20,
                  quantity: 1
                }
              })
            }, 10)
          }
        }
      }

      constructor.call(node, {
        id: 'test-id',
        server: 'server-id'
      })
    }

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {}
      }
    }

    flexWriteModule(testRED)
  })

  it.skip('should handle message with FC15 (write multiple coils)', function (done) {
    const testRED = Object.assign({}, mockRED)

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        send: function (msg) {
          assert.notStrictEqual(msg, undefined)
          done()
        },
        status: function () {},
        error: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            setTimeout(() => {
              handler({
                payload: {
                  value: [true, false, true, false],
                  fc: 15,
                  unitid: 1,
                  address: 0,
                  quantity: 4
                }
              })
            }, 10)
          }
        }
      }

      constructor.call(node, {
        id: 'test-id',
        server: 'server-id'
      })
    }

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {}
      }
    }

    flexWriteModule(testRED)
  })

  it.skip('should handle message with FC16 (write multiple registers)', function (done) {
    const testRED = Object.assign({}, mockRED)

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        send: function (msg) {
          assert.notStrictEqual(msg, undefined)
          done()
        },
        status: function () {},
        error: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            setTimeout(() => {
              handler({
                payload: {
                  value: [100, 200, 300],
                  fc: 16,
                  unitid: 1,
                  address: 0,
                  quantity: 3
                }
              })
            }, 10)
          }
        }
      }

      constructor.call(node, {
        id: 'test-id',
        server: 'server-id'
      })
    }

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {}
      }
    }

    flexWriteModule(testRED)
  })

  it.skip('should handle invalid function code', function (done) {
    const testRED = Object.assign({}, mockRED)

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        send: function () {},
        status: function () {},
        error: function (err) {
          assert.notStrictEqual(err, undefined)
          done()
        },
        on: function (event, handler) {
          if (event === 'input') {
            setTimeout(() => {
              handler({
                payload: {
                  value: [1, 2, 3],
                  fc: 99, // Invalid FC
                  unitid: 1,
                  address: 0,
                  quantity: 3
                }
              })
            }, 10)
          }
        }
      }

      constructor.call(node, {
        id: 'test-id',
        server: 'server-id',
        showErrors: true
      })
    }

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {}
      }
    }

    flexWriteModule(testRED)
  })

  it.skip('should handle missing server configuration', function () {
    const testRED = Object.assign({}, mockRED)
    let errorLogged = false

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        error: function (msg) {
          errorLogged = true
        },
        status: function () {},
        on: function () {}
      }

      constructor.call(node, {
        id: 'test-id',
        server: null // No server
      })
    }

    testRED.nodes.getNode = function () {
      return null // Server not found
    }

    flexWriteModule(testRED)
    assert.strictEqual(errorLogged, true)
  })

  it.skip('should preserve message properties when configured', function (done) {
    const testRED = Object.assign({}, mockRED)

    testRED.nodes.registerType = function (name, constructor) {
      const node = {
        id: 'test-node',
        send: function (msg) {
          assert.strictEqual(msg.topic, 'test/topic')
          assert.strictEqual(msg.customProp, 'preserved')
          done()
        },
        status: function () {},
        error: function () {},
        on: function (event, handler) {
          if (event === 'input') {
            setTimeout(() => {
              handler({
                payload: {
                  value: [1, 2],
                  fc: 16,
                  unitid: 1,
                  address: 0,
                  quantity: 2
                },
                topic: 'test/topic',
                customProp: 'preserved'
              })
            }, 10)
          }
        }
      }

      constructor.call(node, {
        id: 'test-id',
        server: 'server-id',
        keepMsgProperties: true
      })
    }

    testRED.nodes.getNode = function () {
      return {
        register: function () {},
        queueLog: function () {},
        stateLog: function () {}
      }
    }

    flexWriteModule(testRED)
  })
})
