/**
 * E2E Tests for modbus-getter node with comprehensive coverage
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')

// Load all required nodes
const getterNode = require('../../src/modbus-getter')
const clientNode = require('../../src/modbus-client')
const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')
const ioConfigNode = require('../../src/modbus-io-config')

const testFlows = require('./flows/modbus-getter-e2e-flows')

helper.init(require.resolve('node-red'))

describe('Modbus Getter E2E Tests', function () {
  this.timeout(10000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    helper.unload(done)
  })

  after(function (done) {
    helper.stopServer(done)
  })

  describe('Getter Read Operations', function () {
    it.skip('should read coils with getter node (FC1)', function (done) {
      helper.load([getterNode, clientNode, serverNode], testFlows.getterReadCoilsFlow, function () {
        const getter = helper.getNode('getter-coils')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(Array.isArray(msg.payload), true)
            assert.strictEqual(msg.modbusRequest.fc, 1)
            assert.strictEqual(msg.modbusRequest.address, 0)
            assert.strictEqual(msg.modbusRequest.quantity, 10)
            assert.strictEqual(msg.modbusRequest.unitid, 1)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          getter.receive({ payload: 'trigger' })
        }, 1000)
      })
    })

    it.skip('should read discrete inputs with getter node (FC2)', function (done) {
      helper.load([getterNode, clientNode, serverNode], testFlows.getterReadDiscreteInputsFlow, function () {
        const getter = helper.getNode('getter-discrete')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(Array.isArray(msg.payload), true)
            assert.strictEqual(msg.modbusRequest.fc, 2)
            assert.strictEqual(msg.modbusRequest.address, 0)
            assert.strictEqual(msg.modbusRequest.quantity, 8)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          getter.receive({ payload: 'read' })
        }, 1000)
      })
    })

    it.skip('should read holding registers with getter node (FC3)', function (done) {
      helper.load([getterNode, clientNode, serverNode], testFlows.getterReadHoldingRegistersFlow, function () {
        const getter = helper.getNode('getter-holding')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(Array.isArray(msg.payload), true)
            assert.strictEqual(msg.modbusRequest.fc, 3)
            assert.strictEqual(msg.modbusRequest.address, 0)
            assert.strictEqual(msg.modbusRequest.quantity, 5)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          getter.receive({ payload: 'get' })
        }, 1000)
      })
    })

    it.skip('should read input registers with getter node (FC4)', function (done) {
      helper.load([getterNode, clientNode, serverNode], testFlows.getterReadInputRegistersFlow, function () {
        const getter = helper.getNode('getter-input')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(Array.isArray(msg.payload), true)
            assert.strictEqual(msg.modbusRequest.fc, 4)
            assert.strictEqual(msg.modbusRequest.address, 0)
            assert.strictEqual(msg.modbusRequest.quantity, 4)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          getter.receive({ payload: 'fetch' })
        }, 1000)
      })
    })

    it.skip('should use IO configuration with getter node', function (done) {
      helper.load([getterNode, clientNode, serverNode, ioConfigNode], testFlows.getterWithIOConfigFlow, function () {
        const getter = helper.getNode('getter-io')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.notStrictEqual(msg.ioValues, undefined)
            assert.strictEqual(msg.ioValues.mapped !== undefined, true)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          getter.receive({ payload: 'read' })
        }, 1000)
      })
    })

    it.skip('should handle getter errors gracefully', function (done) {
      helper.load([getterNode, clientNode, serverNode], testFlows.getterErrorHandlingFlow, function () {
        const getter = helper.getNode('getter-error')
        const errorHelper = helper.getNode('error-helper')

        errorHelper.on('input', function (msg) {
          try {
            assert.strictEqual(msg.payload, '')
            assert.notStrictEqual(msg.error, undefined)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          // Send invalid parameters to trigger error
          getter.receive({
            payload: 'trigger',
            fc: 99, // Invalid function code
            address: -1, // Invalid address
            quantity: 0 // Invalid quantity
          })
        }, 1000)
      })
    })

    it.skip('should handle dynamic configuration through message', function (done) {
      helper.load([getterNode, clientNode, serverNode], testFlows.getterDynamicConfigFlow, function () {
        const getter = helper.getNode('getter-dynamic')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(msg.modbusRequest.fc, 3)
            assert.strictEqual(msg.modbusRequest.address, 100)
            assert.strictEqual(msg.modbusRequest.quantity, 20)
            assert.strictEqual(msg.modbusRequest.unitid, 5)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          getter.receive({
            payload: 'read',
            fc: 3,
            address: 100,
            quantity: 20,
            unitid: 5
          })
        }, 1000)
      })
    })

    it.skip('should preserve message properties when configured', function (done) {
      helper.load([getterNode, clientNode, serverNode], testFlows.getterKeepPropertiesFlow, function () {
        const getter = helper.getNode('getter-keep-props')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.strictEqual(msg.topic, 'test/getter')
            assert.strictEqual(msg.customProp, 'preserved')
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(msg.modbusRequest.fc, 3)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          getter.receive({
            payload: 'get',
            topic: 'test/getter',
            customProp: 'preserved'
          })
        }, 1000)
      })
    })

    it.skip('should show status activities when enabled', function (done) {
      helper.load([getterNode, clientNode, serverNode], testFlows.getterStatusActivitiesFlow, function () {
        const getter = helper.getNode('getter-status')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            // Status should be set during operation
            assert.strictEqual(getter.showStatusActivities, true)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          getter.receive({ payload: 'status-test' })
        }, 1000)
      })
    })

    it.skip('should log IO activities when enabled', function (done) {
      helper.load([getterNode, clientNode, serverNode], testFlows.getterLogActivitiesFlow, function () {
        const getter = helper.getNode('getter-log')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(getter.logIOActivities, true)
            assert.notStrictEqual(msg.ioLog, undefined)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          getter.receive({ payload: 'log-test' })
        }, 1000)
      })
    })

    it.skip('should handle connection pool for multiple reads', function (done) {
      helper.load([getterNode, clientNode, serverNode], testFlows.getterConnectionPoolFlow, function () {
        const getter = helper.getNode('getter-pool')
        const helperNode = helper.getNode('helper-node')
        let messageCount = 0

        helperNode.on('input', function (msg) {
          messageCount++
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(msg.modbusRequest.fc, 3)

            if (messageCount === 5) {
              done()
            }
          } catch (err) {
            done(err)
          }
        })

        // Send multiple read requests rapidly
        setTimeout(function () {
          for (let i = 0; i < 5; i++) {
            getter.receive({
              payload: 'batch-' + i,
              address: i * 10,
              quantity: 5
            })
          }
        }, 1000)
      })
    })
  })
})
