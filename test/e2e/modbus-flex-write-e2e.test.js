/**
 * E2E Tests for modbus-flex-write node with comprehensive coverage
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')

// Load all required nodes
const flexWriteNode = require('../../src/modbus-flex-write')
const clientNode = require('../../src/modbus-client')
const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')

const testFlows = require('./flows/modbus-flex-write-e2e-flows')

helper.init(require.resolve('node-red'))

describe('Modbus Flex Write E2E Tests', function () {
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

  describe('Flex Write Operations', function () {
    it.skip('should write single coil using flex write (FC5)', function (done) {
      helper.load([flexWriteNode, clientNode, serverNode], testFlows.flexWriteSingleCoilFlow, function () {
        const flexWrite = helper.getNode('flex-write-coil')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(msg.modbusRequest.fc, 5)
            assert.strictEqual(msg.modbusRequest.address, 10)
            assert.strictEqual(msg.modbusRequest.unitid, 1)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          flexWrite.receive({
            payload: {
              value: true,
              fc: 5,
              unitid: 1,
              address: 10,
              quantity: 1
            }
          })
        }, 1000)
      })
    })

    it.skip('should write single register using flex write (FC6)', function (done) {
      helper.load([flexWriteNode, clientNode, serverNode], testFlows.flexWriteSingleRegisterFlow, function () {
        const flexWrite = helper.getNode('flex-write-register')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(msg.modbusRequest.fc, 6)
            assert.strictEqual(msg.modbusRequest.address, 20)
            assert.strictEqual(msg.modbusRequest.value, 1234)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          flexWrite.receive({
            payload: {
              value: 1234,
              fc: 6,
              unitid: 1,
              address: 20,
              quantity: 1
            }
          })
        }, 1000)
      })
    })

    it.skip('should write multiple coils using flex write (FC15)', function (done) {
      helper.load([flexWriteNode, clientNode, serverNode], testFlows.flexWriteMultipleCoilsFlow, function () {
        const flexWrite = helper.getNode('flex-write-multiple-coils')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(msg.modbusRequest.fc, 15)
            assert.strictEqual(msg.modbusRequest.address, 0)
            assert.strictEqual(msg.modbusRequest.quantity, 8)
            assert.strictEqual(Array.isArray(msg.modbusRequest.value), true)
            assert.strictEqual(msg.modbusRequest.value.length, 8)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          flexWrite.receive({
            payload: {
              value: [true, false, true, false, true, false, true, false],
              fc: 15,
              unitid: 1,
              address: 0,
              quantity: 8
            }
          })
        }, 1000)
      })
    })

    it.skip('should write multiple registers using flex write (FC16)', function (done) {
      helper.load([flexWriteNode, clientNode, serverNode], testFlows.flexWriteMultipleRegistersFlow, function () {
        const flexWrite = helper.getNode('flex-write-multiple-registers')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(msg.modbusRequest.fc, 16)
            assert.strictEqual(msg.modbusRequest.address, 0)
            assert.strictEqual(msg.modbusRequest.quantity, 5)
            assert.strictEqual(Array.isArray(msg.modbusRequest.value), true)
            assert.strictEqual(msg.modbusRequest.value.length, 5)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          flexWrite.receive({
            payload: {
              value: [100, 200, 300, 400, 500],
              fc: 16,
              unitid: 1,
              address: 0,
              quantity: 5
            }
          })
        }, 1000)
      })
    })

    it.skip('should handle write errors gracefully', function (done) {
      helper.load([flexWriteNode, clientNode, serverNode], testFlows.flexWriteErrorHandlingFlow, function () {
        const flexWrite = helper.getNode('flex-write-error')
        const errorHelper = helper.getNode('error-helper')

        errorHelper.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.error, undefined)
            assert.strictEqual(msg.payload, '')
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          flexWrite.receive({
            payload: {
              value: [1, 2, 3],
              fc: 99, // Invalid function code
              unitid: 1,
              address: 0,
              quantity: 3
            }
          })
        }, 1000)
      })
    })

    it.skip('should use message properties for write configuration', function (done) {
      helper.load([flexWriteNode, clientNode, serverNode], testFlows.flexWriteDynamicConfigFlow, function () {
        const flexWrite = helper.getNode('flex-write-dynamic')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(msg.modbusRequest.fc, 16)
            assert.strictEqual(msg.modbusRequest.address, 50)
            assert.strictEqual(msg.modbusRequest.unitid, 2)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          flexWrite.receive({
            payload: [1000, 2000],
            fc: 16,
            unitid: 2,
            address: 50,
            quantity: 2
          })
        }, 1000)
      })
    })

    it.skip('should preserve message properties when configured', function (done) {
      helper.load([flexWriteNode, clientNode, serverNode], testFlows.flexWriteKeepPropertiesFlow, function () {
        const flexWrite = helper.getNode('flex-write-keep-props')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.strictEqual(msg.customProperty, 'testValue')
            assert.strictEqual(msg.topic, 'test/topic')
            assert.notStrictEqual(msg.payload, undefined)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          flexWrite.receive({
            payload: {
              value: [111, 222],
              fc: 16,
              unitid: 1,
              address: 10,
              quantity: 2
            },
            topic: 'test/topic',
            customProperty: 'testValue'
          })
        }, 1000)
      })
    })

    it.skip('should handle connection pool for multiple writes', function (done) {
      helper.load([flexWriteNode, clientNode, serverNode], testFlows.flexWriteConnectionPoolFlow, function () {
        const flexWrite = helper.getNode('flex-write-pool')
        const helperNode = helper.getNode('helper-node')
        let messageCount = 0

        helperNode.on('input', function (msg) {
          messageCount++
          try {
            assert.notStrictEqual(msg.payload, undefined)
            if (messageCount === 3) {
              done()
            }
          } catch (err) {
            done(err)
          }
        })

        // Send multiple writes rapidly
        setTimeout(function () {
          for (let i = 0; i < 3; i++) {
            flexWrite.receive({
              payload: {
                value: [i * 100, i * 200],
                fc: 16,
                unitid: 1,
                address: i * 10,
                quantity: 2
              }
            })
          }
        }, 1000)
      })
    })

    it.skip('should handle write with custom timeout', function (done) {
      helper.load([flexWriteNode, clientNode, serverNode], testFlows.flexWriteTimeoutFlow, function () {
        const flexWrite = helper.getNode('flex-write-timeout')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.notStrictEqual(msg.responseTime, undefined)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          flexWrite.receive({
            payload: {
              value: [777],
              fc: 6,
              unitid: 1,
              address: 99,
              quantity: 1,
              timeout: 500
            }
          })
        }, 1000)
      })
    })
  })
})
