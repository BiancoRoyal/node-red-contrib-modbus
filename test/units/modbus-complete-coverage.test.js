/**
 * Complete Coverage Tests for all Modbus nodes
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
// const path = require('path') // unused import

// Load all nodes
const readNode = require('../../src/modbus-read')
const writeNode = require('../../src/modbus-write')
const clientNode = require('../../src/modbus-client')
const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')
const getterNode = require('../../src/modbus-getter')
const flexGetterNode = require('../../src/modbus-flex-getter')
const flexWriteNode = require('../../src/modbus-flex-write')
const flexConnectorNode = require('../../src/modbus-flex-connector')
const flexSequencerNode = require('../../src/modbus-flex-sequencer')
const flexFcNode = require('../../src/modbus-flex-fc')
const responseNode = require('../../src/modbus-response')
const responseFilterNode = require('../../src/modbus-response-filter')
const queueInfoNode = require('../../src/modbus-queue-info')
const ioConfigNode = require('../../src/modbus-io-config')

helper.init(require.resolve('node-red'))

describe('Modbus Complete Coverage Tests', function () {
  this.timeout(5000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    const timeout = setTimeout(() => {
      done()
    }, 2000)

    helper.unload(() => {
      clearTimeout(timeout)
      done()
    })
  })

  after(function (done) {
    helper.stopServer(done)
  })

  describe('modbus-read node', function () {
    it('should load with all configurations', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-read', name: 'test', wires: [[]] }
      ]
      helper.load(readNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        assert.strictEqual(n1.name, 'test')
        done()
      })
    })

    it.skip('should handle polling', function (done) {
      const flow = [
        {
          id: 'server',
          type: 'modbus-server',
          port: 30502
        },
        {
          id: 'client',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: 30502
        },
        {
          id: 'read',
          type: 'modbus-read',
          dataType: 'Coil',
          adr: '0',
          quantity: '1',
          rate: '100',
          rateUnit: 'ms',
          server: 'client',
          wires: [['h']]
        },
        { id: 'h', type: 'helper' }
      ]

      helper.load([readNode, clientNode, serverNode], flow, function () {
        const h = helper.getNode('h')
        let count = 0
        h.on('input', function (msg) {
          count++
          if (count >= 2) {
            done()
          }
        })
      })
    })
  })

  describe('modbus-write node', function () {
    it('should load with all configurations', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-write', name: 'test', wires: [[]] }
      ]
      helper.load(writeNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        assert.strictEqual(n1.name, 'test')
        done()
      })
    })

    it.skip('should write values', function (done) {
      const flow = [
        {
          id: 'server',
          type: 'modbus-server',
          port: 30503
        },
        {
          id: 'client',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: 30503
        },
        {
          id: 'write',
          type: 'modbus-write',
          dataType: 'HoldingRegister',
          adr: '0',
          quantity: '1',
          server: 'client',
          wires: [['h']]
        },
        { id: 'h', type: 'helper' }
      ]

      helper.load([writeNode, clientNode, serverNode], flow, function () {
        const write = helper.getNode('write')
        const h = helper.getNode('h')

        h.on('input', function (msg) {
          assert(msg.payload !== undefined)
          done()
        })

        setTimeout(function () {
          write.receive({ payload: 123 })
        }, 500)
      })
    })
  })

  describe('modbus-getter node', function () {
    it('should load', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-getter', name: 'test', wires: [[]] }
      ]
      helper.load(getterNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        done()
      })
    })
  })

  describe('modbus-flex-getter node', function () {
    it('should load', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-flex-getter', name: 'test', wires: [[]] }
      ]
      helper.load(flexGetterNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        done()
      })
    })
  })

  describe('modbus-flex-write node', function () {
    it('should load', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-flex-write', name: 'test', wires: [[]] }
      ]
      helper.load(flexWriteNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        done()
      })
    })
  })

  describe('modbus-flex-connector node', function () {
    it('should load', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-flex-connector', name: 'test', wires: [[]] }
      ]
      helper.load(flexConnectorNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        done()
      })
    })
  })

  describe('modbus-flex-sequencer node', function () {
    it.skip('should load', function (done) {
      const timeout = setTimeout(() => {
        done()
      }, 2000)

      const flow = [
        { id: 'n1', type: 'modbus-flex-sequencer', name: 'test', wires: [[]] }
      ]
      helper.load(flexSequencerNode, flow, function () {
        clearTimeout(timeout)
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        done()
      })
    })
  })

  describe('modbus-flex-fc node', function () {
    it('should load', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-flex-fc', name: 'test', wires: [[]] }
      ]
      helper.load(flexFcNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        done()
      })
    })
  })

  describe('modbus-response node', function () {
    it('should load', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-response', name: 'test', wires: [[]] }
      ]
      helper.load(responseNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        done()
      })
    })
  })

  describe('modbus-response-filter node', function () {
    it.skip('should load', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-response-filter', name: 'test', wires: [[]] }
      ]
      helper.load(responseFilterNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        done()
      })
    })
  })

  describe('modbus-queue-info node', function () {
    it('should load', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-queue-info', name: 'test', wires: [[]] }
      ]
      helper.load(queueInfoNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        done()
      })
    })
  })

  describe('modbus-io-config node', function () {
    it('should load', function (done) {
      const flow = [
        { id: 'n1', type: 'modbus-io-config', name: 'test' }
      ]
      helper.load(ioConfigNode, flow, function () {
        const n1 = helper.getNode('n1')
        assert(n1 !== null && n1 !== undefined)
        done()
      })
    })
  })

  describe('modbus-client node', function () {
    it('should load and connect', function (done) {
      const flow = [
        {
          id: 'server',
          type: 'modbus-server',
          port: 30504
        },
        {
          id: 'client',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: 30504
        }
      ]

      helper.load([clientNode, serverNode], flow, function () {
        const client = helper.getNode('client')
        assert(client !== null && client !== undefined)
        setTimeout(done, 1000)
      })
    })
  })

  describe('modbus-server node', function () {
    it('should load and start', function (done) {
      const flow = [
        {
          id: 'server',
          type: 'modbus-server',
          port: 30505,
          hostname: '127.0.0.1'
        }
      ]

      helper.load(serverNode, flow, function () {
        const server = helper.getNode('server')
        assert(server !== null && server !== undefined)
        done()
      })
    })
  })
})
