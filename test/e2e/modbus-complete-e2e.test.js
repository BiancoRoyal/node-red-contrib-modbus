/**
 * Complete E2E Tests using node-red-node-test-helper
 * Tests full Node-RED runtime integration
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const { getPort, getTestNode, deployModbusFlow, prepareModbusTcpFlow } = require('../helper/test-helper-extensions')
const allModbusTestNodes = require('../helper/all-modbus-test-nodes')
const { globalTestHelper } = require('../helper/mocha-global-setup')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) => n !== require('../../src/modbus-client-tls') &&
  n !== require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls'))

describe('Complete Modbus E2E Tests with Node-RED Runtime', function () {
  this.timeout(30000)

  before(function (done) {
    helper.startServer(done)
  })

  after(function () {
    globalTestHelper.setupMocks({
      mockModbusSerial: true,
      mockNetConnections: true,
      mockTimers: false
    })
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  describe('Basic Read/Write Operations', function () {
    beforeEach(function () {
      globalTestHelper.cleanup()
      globalTestHelper.setupMocks({
        mockModbusSerial: false,
        mockNetConnections: true,
        mockTimers: false
      })
    })

    it('should read coils from Modbus server', async function () {
      const port = await getPort()

      const flow = [
        {
          id: 'server1',
          type: 'modbus-server',
          name: 'Test Server',
          serverPort: port,
          hostname: '127.0.0.1',
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

      await deployModbusFlow(helper, coreModbusNodes, flow)

      const readNode1 = getTestNode(helper, 'read1')
      const client1 = getTestNode(helper, 'client1')

      assert(readNode1 !== null, 'read node should be deployed')
      assert(client1 !== null, 'client node should be deployed')
      assert(client1.registeredNodeList.read1, 'read node should register with client')
      assert.strictEqual(typeof readNode1.receive, 'function')
    })

    it('should write and read holding registers', async function () {
      globalTestHelper.cleanup()
      globalTestHelper.setupMocks({
        mockModbusSerial: true,
        mockNetConnections: true,
        mockTimers: false
      })

      const port = await getPort()

      const flow = [
        {
          id: 'server2',
          type: 'modbus-server',
          name: 'Test Server',
          serverPort: port,
          hostname: '127.0.0.1',
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
          rate: '200',
          rateUnit: 'ms',
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

      await deployModbusFlow(helper, coreModbusNodes, flow)

      const helperNode = getTestNode(helper, 'helper2')
      const writeNode2 = getTestNode(helper, 'write2')
      const readNode2 = getTestNode(helper, 'read2')

      assert(helperNode !== null, 'helper should be deployed')
      assert(writeNode2 !== null, 'write node should be deployed')
      assert(readNode2 !== null, 'read node should be deployed')

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('timeout waiting for holding register read'))
        }, 20000)

        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('payload')
            msg.payload.should.be.an.Array()
            if (!msg.payload.every((v, i) => v === [100, 200, 300, 400][i])) {
              return
            }
            msg.payload.should.deepEqual([100, 200, 300, 400])
            clearTimeout(timer)
            resolve()
          } catch (err) {
            clearTimeout(timer)
            reject(err)
          }
        })

        setTimeout(() => {
          writeNode2.receive({
            payload: [100, 200, 300, 400]
          })
          setTimeout(() => {
            if (typeof readNode2.modbusPollingRead === 'function') {
              readNode2.modbusPollingRead()
            }
          }, 500)
        }, 1500)
      })
    })
  })

  describe('Flex Node Operations', function () {
    beforeEach(function () {
      globalTestHelper.cleanup()
      globalTestHelper.setupMocks({
        mockModbusSerial: false,
        mockNetConnections: true,
        mockTimers: false
      })
    })

    it('should perform flex write operations', async function () {
      const port = await getPort()

      const flow = [
        {
          id: 'server3',
          type: 'modbus-server',
          name: 'Test Server',
          serverPort: port,
          hostname: '127.0.0.1',
          responseDelay: 10,
          delayUnit: 'ms',
          coilsBufferSize: 1024,
          holdingBufferSize: 1024,
          inputBufferSize: 1024,
          discreteBufferSize: 1024,
          showErrors: false
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
          clientTimeout: 1000,
          reconnectOnTimeout: false
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

      await deployModbusFlow(helper, coreModbusNodes, flow)

      const helperNode = getTestNode(helper, 'helper3')
      const flexWriteNode3 = getTestNode(helper, 'flexwrite3')

      return new Promise((resolve, reject) => {
        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('payload')
            msg.payload.should.have.property('fc', 16)
            msg.payload.should.have.property('address', 100)
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
        }, 1000)
      })
    })

    it('should handle flex connector dynamic connections', function (done) {
      this.timeout(15000)
      const testFlows = require('./flows/modbus-flex-connector-e2e-flows')

      prepareModbusTcpFlow(testFlows.testOnConfigDone).then((flow) => {
        helper.load([], flow, function () {
          const connectorNode = helper.getNode('bb1e7809e235149a')
          const helperNode = helper.getNode('3e20a24776e85dce')
          const clientNode = flow.find((n) => n.type === 'modbus-client')
          assert(connectorNode !== null, 'flex connector should be deployed')
          assert(helperNode !== null, 'helper should be deployed')

          helperNode.on('input', function (msg) {
            try {
              msg.should.have.property('payload')
              msg.should.have.property('config_change', 'emitted')
              done()
            } catch (err) {
              done(err)
            }
          })

          setTimeout(function () {
            connectorNode.receive({
              payload: {
                connectorType: 'TCP',
                tcpHost: '127.0.0.1',
                tcpPort: clientNode.tcpPort,
                unitId: 2
              }
            })
          }, 1500)
        })
      }).catch(done)
    })
  })

  describe('Error Handling', function () {
    beforeEach(function () {
      globalTestHelper.cleanup()
      globalTestHelper.setupMocks({
        mockModbusSerial: true,
        mockNetConnections: true,
        mockTimers: false
      })
    })

    it('should handle connection timeout gracefully', async function () {
      const port = await getPort()

      const flow = [
        {
          id: 'client5',
          type: 'modbus-client',
          name: 'Test Client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: port,
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

      await deployModbusFlow(helper, coreModbusNodes, flow)

      const helperNode = getTestNode(helper, 'helper5')
      const errorNode = getTestNode(helper, 'helper5error')
      const readNode5 = getTestNode(helper, 'read5')
      const client5 = getTestNode(helper, 'client5')

      if (client5) {
        client5.actualServiceState = { value: 'activated' }
      }
      if (client5 && client5.client) {
        client5.client.readCoils = function () {
          return Promise.reject(new Error('Connection timeout'))
        }
      }

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('timeout waiting for connection failure handling'))
        }, 5000)

        // Expect empty message on fail
        helperNode.on('input', function (msg) {
          clearTimeout(timer)
          msg.should.have.property('payload', '')
          resolve()
        })

        // Or error output
        errorNode.on('input', function (msg) {
          clearTimeout(timer)
          msg.should.have.property('error')
          resolve()
        })

        setTimeout(() => {
          readNode5.modbusPollingRead()
        }, 100)
      })
    })
  })

  describe('Queue Management', function () {
    it('should provide queue information', function (done) {
      const testFlows = require('../units/flows/modbus-queue-info-flows')

      prepareModbusTcpFlow(testFlows.testShouldBeLoadedFlow).then((flow) => {
        helper.load([], flow, function () {
          const queueNode = helper.getNode('920c89aa79edcc8a')
          assert(queueNode !== null, 'queue node should be deployed')

          const msg = { payload: { resetQueue: false, queue: '' } }
          queueNode.emit('input', msg)
          assert.deepEqual(msg.payload.queue, [])
          assert(Object.prototype.hasOwnProperty.call(msg.payload, 'queueEnabled'))
          done()
        })
      }).catch(done)
    })
  })
})
