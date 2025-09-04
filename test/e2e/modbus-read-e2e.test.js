/**
 * Original Open Source MIT License Copyright (c) 2016-2024 Klaus Landsdorf
 * E2E Tests for modbus-read node with full flow testing
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')

// Load all required nodes
const inputNode = require('../../src/modbus-read')
const clientNode = require('../../src/modbus-client')
const serverNode = require('../../src/modbus-server')

const testFlows = require('./flows/modbus-read-e2e-flows')

helper.init(require.resolve('node-red'))

describe('Modbus Read E2E Tests', function () {
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

  describe('Reading Different Data Types', function () {
    it.skip('should read coils (FC1) and verify message output', function (done) {
      helper.load([inputNode, clientNode, serverNode], testFlows.testReadCoilsFlow, function () {
        const modbusRead = helper.getNode('read-coils-node')
        const helperNode = helper.getNode('helper-node')

        let msgCount = 0
        helperNode.on('input', function (msg) {
          msgCount++
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(Array.isArray(msg.payload), true)
            assert.strictEqual(msg.payload.length, 8)
            assert.strictEqual(msg.modbusRequest.fc, 1)
            assert.strictEqual(msg.modbusRequest.address, 0)
            assert.strictEqual(msg.modbusRequest.quantity, 8)

            if (msgCount >= 2) {
              done()
            }
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          modbusRead.receive({})
        }, 500)
      })
    })

    it.skip('should read discrete inputs (FC2)', function (done) {
      helper.load([inputNode, clientNode, serverNode], testFlows.testReadDiscreteInputsFlow, function () {
        const modbusRead = helper.getNode('read-discrete-node')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(Array.isArray(msg.payload), true)
            assert.strictEqual(msg.modbusRequest.fc, 2)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          modbusRead.receive({})
        }, 500)
      })
    })

    it.skip('should read holding registers (FC3)', function (done) {
      helper.load([inputNode, clientNode, serverNode], testFlows.testReadHoldingRegistersFlow, function () {
        const modbusRead = helper.getNode('read-holding-node')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(Array.isArray(msg.payload), true)
            assert.strictEqual(msg.modbusRequest.fc, 3)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          modbusRead.receive({})
        }, 500)
      })
    })

    it.skip('should read input registers (FC4)', function (done) {
      helper.load([inputNode, clientNode, serverNode], testFlows.testReadInputRegistersFlow, function () {
        const modbusRead = helper.getNode('read-input-node')
        const helperNode = helper.getNode('helper-node')

        helperNode.on('input', function (msg) {
          try {
            assert.notStrictEqual(msg.payload, undefined)
            assert.strictEqual(Array.isArray(msg.payload), true)
            assert.strictEqual(msg.modbusRequest.fc, 4)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          modbusRead.receive({})
        }, 500)
      })
    })
  })
})
