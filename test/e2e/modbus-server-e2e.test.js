/**
 * E2E Tests for modbus-server node
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')

const serverNode = require('../../src/modbus-server')
const clientNode = require('../../src/modbus-client')
const readNode = require('../../src/modbus-read')
const writeNode = require('../../src/modbus-write')

helper.init(require.resolve('node-red'))

describe('Modbus Server E2E Tests', function () {
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

  it.skip('should handle read and write requests', function (done) {
    const flow = [
      {
        id: 'server',
        type: 'modbus-server',
        name: 'Test Server',
        hostname: '127.0.0.1',
        serverPort: 28530,
        responseDelay: 10,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        discreteBufferSize: 1024,
        showStatusActivities: true
      },
      {
        id: 'client',
        type: 'modbus-client',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 28530
      },
      {
        id: 'write',
        type: 'modbus-write',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '1',
        server: 'client',
        wires: [['write-helper']]
      },
      {
        id: 'read',
        type: 'modbus-read',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '1',
        server: 'client',
        wires: [['read-helper']]
      },
      { id: 'write-helper', type: 'helper' },
      { id: 'read-helper', type: 'helper' }
    ]

    helper.load([serverNode, clientNode, readNode, writeNode], flow, function () {
      const write = helper.getNode('write')
      const read = helper.getNode('read')
      const writeHelper = helper.getNode('write-helper')
      const readHelper = helper.getNode('read-helper')

      writeHelper.on('input', function (msg) {
        try {
          assert.strictEqual(msg.payload.fc, 6)
          assert.strictEqual(msg.payload.value, 42)
          // After write, trigger read
          setTimeout(() => read.receive({}), 100)
        } catch (err) {
          done(err)
        }
      })

      readHelper.on('input', function (msg) {
        try {
          assert.strictEqual(Array.isArray(msg.payload), true)
          assert.strictEqual(msg.payload[0], 42)
          done()
        } catch (err) {
          done(err)
        }
      })

      setTimeout(function () {
        write.receive({ payload: 42 })
      }, 500)
    })
  })

  it.skip('should handle multiple clients', function (done) {
    const flow = [
      {
        id: 'server',
        type: 'modbus-server',
        hostname: '127.0.0.1',
        serverPort: 28531,
        showStatusActivities: true
      },
      {
        id: 'client1',
        type: 'modbus-client',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 28531
      },
      {
        id: 'client2',
        type: 'modbus-client',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 28531
      },
      {
        id: 'read1',
        type: 'modbus-read',
        dataType: 'Coil',
        adr: '0',
        quantity: '1',
        server: 'client1',
        wires: [['helper1']]
      },
      {
        id: 'read2',
        type: 'modbus-read',
        dataType: 'Coil',
        adr: '1',
        quantity: '1',
        server: 'client2',
        wires: [['helper2']]
      },
      { id: 'helper1', type: 'helper' },
      { id: 'helper2', type: 'helper' }
    ]

    helper.load([serverNode, clientNode, readNode], flow, function () {
      const read1 = helper.getNode('read1')
      const read2 = helper.getNode('read2')
      const helper1 = helper.getNode('helper1')
      const helper2 = helper.getNode('helper2')
      let count = 0

      helper1.on('input', function (msg) {
        count++
        if (count === 2) done()
      })

      helper2.on('input', function (msg) {
        count++
        if (count === 2) done()
      })

      setTimeout(function () {
        read1.receive({})
        read2.receive({})
      }, 500)
    })
  })
})
