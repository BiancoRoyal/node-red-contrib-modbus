/**
 * E2E Tests for modbus-write node
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')

const writeNode = require('../../src/modbus-write')
const clientNode = require('../../src/modbus-client')
const serverNode = require('../../src/modbus-server')

helper.init(require.resolve('node-red'))

describe('Modbus Write E2E Tests', function () {
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

  describe('Write Single Coil (FC5)', function () {
    it.skip('should write single coil and verify response', function (done) {
      const flow = [
        {
          id: 'server',
          type: 'modbus-server',
          hostname: '127.0.0.1',
          serverPort: 28510
        },
        {
          id: 'client',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: 28510
        },
        {
          id: 'write-coil',
          type: 'modbus-write',
          name: 'Write Single Coil',
          dataType: 'Coil',
          adr: '10',
          quantity: '1',
          server: 'client',
          wires: [['helper'], ['helper2']]
        },
        { id: 'helper', type: 'helper' },
        { id: 'helper2', type: 'helper' }
      ]

      helper.load([writeNode, clientNode, serverNode], flow, function () {
        const write = helper.getNode('write-coil')
        const helperNode = helper.getNode('helper')

        helperNode.on('input', function (msg) {
          try {
            assert.strictEqual(msg.payload.fc, 5)
            assert.strictEqual(msg.payload.address, 10)
            assert.strictEqual(msg.payload.value, true)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          write.receive({ payload: true })
        }, 500)
      })
    })
  })

  describe('Write Single Register (FC6)', function () {
    it.skip('should write single register and verify response', function (done) {
      const flow = [
        {
          id: 'server',
          type: 'modbus-server',
          hostname: '127.0.0.1',
          serverPort: 28511
        },
        {
          id: 'client',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: 28511
        },
        {
          id: 'write-register',
          type: 'modbus-write',
          name: 'Write Single Register',
          dataType: 'HoldingRegister',
          adr: '100',
          quantity: '1',
          server: 'client',
          wires: [['helper']]
        },
        { id: 'helper', type: 'helper' }
      ]

      helper.load([writeNode, clientNode, serverNode], flow, function () {
        const write = helper.getNode('write-register')
        const helperNode = helper.getNode('helper')

        helperNode.on('input', function (msg) {
          try {
            assert.strictEqual(msg.payload.fc, 6)
            assert.strictEqual(msg.payload.address, 100)
            assert.strictEqual(msg.payload.value, 12345)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          write.receive({ payload: 12345 })
        }, 500)
      })
    })
  })

  describe('Write Multiple Coils (FC15)', function () {
    it.skip('should write multiple coils and verify response', function (done) {
      const flow = [
        {
          id: 'server',
          type: 'modbus-server',
          hostname: '127.0.0.1',
          serverPort: 28512
        },
        {
          id: 'client',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: 28512
        },
        {
          id: 'write-coils',
          type: 'modbus-write',
          name: 'Write Multiple Coils',
          dataType: 'MCoils',
          adr: '20',
          quantity: '8',
          server: 'client',
          wires: [['helper']]
        },
        { id: 'helper', type: 'helper' }
      ]

      helper.load([writeNode, clientNode, serverNode], flow, function () {
        const write = helper.getNode('write-coils')
        const helperNode = helper.getNode('helper')

        helperNode.on('input', function (msg) {
          try {
            assert.strictEqual(msg.payload.fc, 15)
            assert.strictEqual(msg.payload.address, 20)
            assert.strictEqual(msg.payload.valuesAsArray.length, 8)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          write.receive({ payload: [true, false, true, false, true, false, true, false] })
        }, 500)
      })
    })
  })

  describe('Write Multiple Registers (FC16)', function () {
    it.skip('should write multiple registers and verify response', function (done) {
      const flow = [
        {
          id: 'server',
          type: 'modbus-server',
          hostname: '127.0.0.1',
          serverPort: 28513
        },
        {
          id: 'client',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: 28513
        },
        {
          id: 'write-registers',
          type: 'modbus-write',
          name: 'Write Multiple Registers',
          dataType: 'MHoldingRegisters',
          adr: '200',
          quantity: '4',
          server: 'client',
          wires: [['helper']]
        },
        { id: 'helper', type: 'helper' }
      ]

      helper.load([writeNode, clientNode, serverNode], flow, function () {
        const write = helper.getNode('write-registers')
        const helperNode = helper.getNode('helper')

        helperNode.on('input', function (msg) {
          try {
            assert.strictEqual(msg.payload.fc, 16)
            assert.strictEqual(msg.payload.address, 200)
            assert.strictEqual(msg.payload.valuesAsArray.length, 4)
            done()
          } catch (err) {
            done(err)
          }
        })

        setTimeout(function () {
          write.receive({ payload: [1000, 2000, 3000, 4000] })
        }, 500)
      })
    })
  })
})
