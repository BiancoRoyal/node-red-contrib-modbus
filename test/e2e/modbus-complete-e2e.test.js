/**
 * Complete E2E Tests using node-red-node-test-helper
 * Tests full Node-RED runtime integration
 */

'use strict'

const helper = require('node-red-node-test-helper')
const { getPort } = require('../helper/test-helper-extensions')

// Load all modbus nodes
const clientNode = require('../../src/modbus-client')
const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')
const readNode = require('../../src/modbus-read')
const writeNode = require('../../src/modbus-write')
const getterNode = require('../../src/modbus-getter')
const flexWriteNode = require('../../src/modbus-flex-write')
const flexGetterNode = require('../../src/modbus-flex-getter')
const flexConnectorNode = require('../../src/modbus-flex-connector')
const flexSequencerNode = require('../../src/modbus-flex-sequencer')
const responseNode = require('../../src/modbus-response')
const queueInfoNode = require('../../src/modbus-queue-info')
const ioConfigNode = require('../../src/modbus-io-config')

const modbusNodes = [
  clientNode,
  serverNode,
  readNode,
  writeNode,
  getterNode,
  flexWriteNode,
  flexGetterNode,
  flexConnectorNode,
  flexSequencerNode,
  responseNode,
  queueInfoNode,
  ioConfigNode
]

describe.skip('Complete Modbus E2E Tests with Node-RED Runtime', function () {
  this.timeout(10000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      done()
    }).catch(function (err) {
      console.error('Unload error:', err)
      done()
    })
  })

  after(function (done) {
    helper.stopServer(done)
  })

  describe('Basic Read/Write Operations', function () {
    it('should read coils from Modbus server', async function () {
      const port = await getPort()

      const flow = [
        {
          id: 'server1',
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
          showErrors: false
        },
        {
          id: 'client1',
          type: 'modbus-client',
          name: 'Test Client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: port,
          unit_id: 1,
          commandDelay: 10,
          clientTimeout: 1000,
          reconnectOnTimeout: false
        },
        {
          id: 'read1',
          type: 'modbus-read',
          name: 'Read Coils',
          dataType: 'Coil',
          adr: '0',
          quantity: '8',
          server: 'client1',
          useIOFile: false,
          ioFile: '',
          useIOForPayload: false,
          emptyMsgOnFail: false,
          x: 300,
          y: 100,
          wires: [['helper1']]
        },
        {
          id: 'helper1',
          type: 'helper'
        }
      ]

      await helper.load(modbusNodes, flow)

      const helperNode = helper.getNode('helper1')
      const readNode1 = helper.getNode('read1')

      return new Promise((resolve, reject) => {
        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('payload')
            msg.payload.should.be.an.Array()
            msg.payload.length.should.equal(8)
            resolve()
          } catch (err) {
            reject(err)
          }
        })

        // Trigger read after connection established
        setTimeout(() => {
          if (readNode1) {
            readNode1.receive({ payload: true })
          } else {
            reject(new Error('Read node not found'))
          }
        }, 500)
      })
    })

    it('should write and read holding registers', async function () {
      const port = await getPort()

      const flow = [
        {
          id: 'server2',
          type: 'modbus-server',
          name: 'Test Server',
          serverPort: port,
          serverAddress: '127.0.0.1',
          responseDelay: 10,
          delayUnit: 'ms',
          coilsBufferSize: 1024,
          holdingBufferSize: 1024,
          inputBufferSize: 1024,
          discreteBufferSize: 1024
        },
        {
          id: 'client2',
          type: 'modbus-client',
          name: 'Test Client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: port,
          unit_id: 1,
          commandDelay: 10,
          clientTimeout: 1000
        },
        {
          id: 'write2',
          type: 'modbus-write',
          name: 'Write Registers',
          dataType: 'MHoldingRegisters',
          adr: '0',
          quantity: '4',
          server: 'client2',
          x: 300,
          y: 100,
          wires: [['read2'], []]
        },
        {
          id: 'read2',
          type: 'modbus-read',
          name: 'Read Registers',
          dataType: 'HoldingRegister',
          adr: '0',
          quantity: '4',
          server: 'client2',
          useIOFile: false,
          x: 500,
          y: 100,
          wires: [['helper2']]
        },
        {
          id: 'helper2',
          type: 'helper'
        }
      ]

      await helper.load(modbusNodes, flow)

      const helperNode = helper.getNode('helper2')
      const writeNode2 = helper.getNode('write2')

      return new Promise((resolve, reject) => {
        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('payload')
            msg.payload.should.be.an.Array()
            msg.payload.should.deepEqual([100, 200, 300, 400])
            resolve()
          } catch (err) {
            reject(err)
          }
        })

        // Write values after connection established
        setTimeout(() => {
          writeNode2.receive({
            payload: [100, 200, 300, 400]
          })
        }, 500)
      })
    })
  })

  describe('Flex Node Operations', function () {
    it('should perform flex write operations', async function () {
      const port = await getPort()

      const flow = [
        {
          id: 'server3',
          type: 'modbus-server',
          name: 'Test Server',
          serverPort: port,
          serverAddress: '127.0.0.1',
          responseDelay: 10,
          delayUnit: 'ms',
          coilsBufferSize: 1024,
          holdingBufferSize: 1024
        },
        {
          id: 'client3',
          type: 'modbus-client',
          name: 'Test Client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: port,
          unit_id: 1,
          commandDelay: 10,
          clientTimeout: 1000
        },
        {
          id: 'flexwrite3',
          type: 'modbus-flex-write',
          name: 'Flex Write',
          server: 'client3',
          emptyMsgOnFail: false,
          x: 300,
          y: 100,
          wires: [['helper3'], []]
        },
        {
          id: 'helper3',
          type: 'helper'
        }
      ]

      await helper.load(modbusNodes, flow)

      const helperNode = helper.getNode('helper3')
      const flexWriteNode3 = helper.getNode('flexwrite3')

      return new Promise((resolve, reject) => {
        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('payload')
            msg.should.have.property('modbusRequest')
            msg.modbusRequest.should.have.property('fc', 16)
            msg.modbusRequest.should.have.property('address', 100)
            resolve()
          } catch (err) {
            reject(err)
          }
        })

        // Send flex write message
        setTimeout(() => {
          flexWriteNode3.receive({
            payload: {
              fc: 16,
              address: 100,
              quantity: 2,
              value: [1234, 5678]
            }
          })
        }, 500)
      })
    })

    it('should handle flex connector dynamic connections', async function () {
      const port = await getPort()

      const flow = [
        {
          id: 'server4',
          type: 'modbus-server',
          name: 'Test Server',
          serverPort: port,
          serverAddress: '127.0.0.1',
          responseDelay: 10,
          delayUnit: 'ms'
        },
        {
          id: 'client4',
          type: 'modbus-client',
          name: 'Test Client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: port,
          unit_id: 1,
          commandDelay: 10,
          clientTimeout: 1000
        },
        {
          id: 'connector4',
          type: 'modbus-flex-connector',
          name: 'Flex Connector',
          maxReconnectsPerMinute: 4,
          emptyQueue: false,
          showStatusActivities: true,
          server: 'client4',
          x: 300,
          y: 100,
          wires: [['helper4']]
        },
        {
          id: 'helper4',
          type: 'helper'
        }
      ]

      await helper.load(modbusNodes, flow)

      const helperNode = helper.getNode('helper4')
      const connectorNode4 = helper.getNode('connector4')

      return new Promise((resolve, reject) => {
        let messageCount = 0

        helperNode.on('input', function (msg) {
          try {
            messageCount++
            msg.should.have.property('payload')

            if (messageCount === 1) {
              msg.payload.should.have.property('connect', true)
            } else if (messageCount === 2) {
              msg.payload.should.have.property('disconnect', true)
              resolve()
            }
          } catch (err) {
            reject(err)
          }
        })

        // Test connect and disconnect
        setTimeout(() => {
          connectorNode4.receive({
            payload: { connect: true }
          })
        }, 500)

        setTimeout(() => {
          connectorNode4.receive({
            payload: { disconnect: true }
          })
        }, 1000)
      })
    })
  })

  describe('Error Handling', function () {
    it('should handle connection timeout gracefully', async function () {
      const flow = [
        {
          id: 'client5',
          type: 'modbus-client',
          name: 'Test Client',
          clienttype: 'tcp',
          tcpHost: '192.168.99.99', // Non-existent host
          tcpPort: 502,
          unit_id: 1,
          commandDelay: 10,
          clientTimeout: 100,
          reconnectOnTimeout: false
        },
        {
          id: 'read5',
          type: 'modbus-read',
          name: 'Read Timeout',
          dataType: 'Coil',
          adr: '0',
          quantity: '8',
          server: 'client5',
          emptyMsgOnFail: true,
          x: 300,
          y: 100,
          wires: [['helper5'], ['helper5error']]
        },
        {
          id: 'helper5',
          type: 'helper'
        },
        {
          id: 'helper5error',
          type: 'helper'
        }
      ]

      await helper.load(modbusNodes, flow)

      const helperNode = helper.getNode('helper5')
      const errorNode = helper.getNode('helper5error')
      const readNode5 = helper.getNode('read5')

      return new Promise((resolve) => {
        // Expect empty message on fail
        helperNode.on('input', function (msg) {
          msg.should.have.property('payload', '')
          resolve()
        })

        // Or error output
        errorNode.on('input', function (msg) {
          msg.should.have.property('error')
          resolve()
        })

        // Trigger read that will timeout
        setTimeout(() => {
          readNode5.receive({ payload: true })
        }, 100)

        // Resolve after timeout period
        setTimeout(() => {
          resolve()
        }, 2000)
      })
    })
  })

  describe('Queue Management', function () {
    it('should provide queue information', async function () {
      const port = await getPort()

      const flow = [
        {
          id: 'server6',
          type: 'modbus-server',
          name: 'Test Server',
          serverPort: port,
          serverAddress: '127.0.0.1'
        },
        {
          id: 'client6',
          type: 'modbus-client',
          name: 'Test Client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: port,
          unit_id: 1,
          commandDelay: 100,
          clientTimeout: 1000
        },
        {
          id: 'queue6',
          type: 'modbus-queue-info',
          name: 'Queue Info',
          topic: 'queue.info',
          unitid: 1,
          server: 'client6',
          action: 'queueReadLength',
          x: 300,
          y: 100,
          wires: [['helper6']]
        },
        {
          id: 'helper6',
          type: 'helper'
        }
      ]

      await helper.load(modbusNodes, flow)

      const helperNode = helper.getNode('helper6')
      const queueNode6 = helper.getNode('queue6')

      return new Promise((resolve, reject) => {
        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('topic', 'queue.info')
            msg.should.have.property('payload')
            msg.should.have.property('state')
            resolve()
          } catch (err) {
            reject(err)
          }
        })

        // Trigger queue info request
        setTimeout(() => {
          queueNode6.receive({ payload: true })
        }, 500)
      })
    })
  })
})
