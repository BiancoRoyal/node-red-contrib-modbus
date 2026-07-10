/**
 * Timeout-safe Modbus client loading — uses global test-helper bootstrap.
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')
const clientNode = require('../../src/modbus-client.js')
const readNode = require('../../src/modbus-read.js')
const flexGetterNode = require('../../src/modbus-flex-getter.js')
const { getPort } = require('../helper/test-helper-extensions')

const testModbusNodes = [serverNode, clientNode, readNode, flexGetterNode]

function loadFlow (flow) {
  return new Promise((resolve, reject) => {
    helper.load(testModbusNodes, flow, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

describe('Modbus Client - Timeout Safe Tests', function () {
  this.timeout(15000)

  describe('Basic Node Loading', function () {
    it('should load modbus client without timeout', async function () {
      const port = await getPort()
      const flow = [{
        id: 'client1',
        type: 'modbus-client',
        name: 'Test Client',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
        queueLogEnabled: false,
        failureLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: String(port),
        tcpType: 'DEFAULT',
        unit_id: '1',
        commandDelay: '1',
        clientTimeout: '100',
        reconnectOnTimeout: false,
        reconnectTimeout: '100'
      }]

      await loadFlow(flow)

      const node = helper.getNode('client1')
      node.should.have.property('name', 'Test Client')
      node.should.have.property('clienttype', 'tcp')
      node.should.have.property('tcpHost', '127.0.0.1')
    })

    it('should load modbus read node without timeout', async function () {
      const port = await getPort()
      const flow = [
        {
          id: 'server1',
          type: 'modbus-server',
          hostname: '127.0.0.1',
          serverPort: String(port),
          responseDelay: 10,
          delayUnit: 'ms'
        },
        {
          id: 'client1',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: String(port),
          clientTimeout: '100',
          reconnectOnTimeout: false
        },
        {
          id: 'read1',
          type: 'modbus-read',
          name: 'Test Read',
          dataType: 'Coil',
          adr: '0',
          quantity: '10',
          rate: '3600',
          rateUnit: 's',
          server: 'client1'
        },
        {
          id: 'helper1',
          type: 'helper',
          wires: []
        }
      ]

      await loadFlow(flow)

      const node = helper.getNode('read1')
      node.should.have.property('name', 'Test Read')
      node.should.have.property('dataType', 'Coil')
    })
  })

  describe('Connection State Management', function () {
    it('should handle client state transitions without hanging', async function () {
      const port = await getPort()
      await loadFlow([{
        id: 'client1',
        type: 'modbus-client',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: String(port),
        clientTimeout: '100',
        reconnectOnTimeout: false
      }])

      const node = helper.getNode('client1')
      if (node.isInactive) {
        assert.strictEqual(typeof node.isInactive(), 'boolean')
      }
    })

    it('should handle failed connections gracefully', async function () {
      await loadFlow([{
        id: 'client1',
        type: 'modbus-client',
        clienttype: 'tcp',
        tcpHost: '192.0.2.1',
        tcpPort: '9999',
        clientTimeout: '50',
        reconnectOnTimeout: false
      }])

      helper.getNode('client1').should.be.ok()
    })
  })

  describe('Message Handling', function () {
    it('should process flex-getter messages with mocked client', async function () {
      const { globalTestHelper } = require('../helper/mocha-global-setup')
      const { setupFcMocks, buildServerClientFlow, waitForHelper } = require('../helper/fc-e2e-helper')
      const { deployModbusFlow } = require('../helper/test-helper-extensions')
      const allModbusTestNodes = require('../helper/all-modbus-test-nodes')

      const { flow } = await buildServerClientFlow({
        id: 'getter1',
        type: 'modbus-flex-getter',
        name: 'Flex Getter',
        server: 'fc-client',
        showStatusActivities: false,
        showErrors: false,
        wires: [['fc-helper'], []]
      })

      await setupFcMocks(globalTestHelper)
      await deployModbusFlow(helper, allModbusTestNodes, flow)

      const msgPromise = waitForHelper(helper, 'fc-helper', (msg) => {
        assert(Array.isArray(msg.payload))
        assert.strictEqual(msg.payload.length, 1)
        assert(msg.modbusRequest)
        assert.strictEqual(Number(msg.modbusRequest.fc), 3)
      })

      helper.getNode('getter1').receive({
        payload: { fc: 3, unitid: 1, address: 0, quantity: 1 }
      })

      await msgPromise
    })

    it('should handle invalid messages gracefully', function (done) {
      getPort().then((port) => {
        const flow = [
          {
            id: 'client1',
            type: 'modbus-client',
            clienttype: 'tcp',
            tcpHost: '127.0.0.1',
            tcpPort: String(port),
            reconnectOnTimeout: false
          },
          {
            id: 'getter1',
            type: 'modbus-flex-getter',
            server: 'client1',
            showErrors: true
          }
        ]

        loadFlow(flow).then(() => {
          const getterNode = helper.getNode('getter1')
          getterNode.receive({
            payload: { fc: 99, unitid: 1, address: 0, quantity: 1 }
          })
          setTimeout(done, 100)
        }).catch(done)
      })
    })
  })

  describe('Resource Cleanup', function () {
    it('should cleanup resources properly', async function () {
      const port = await getPort()
      await loadFlow([{
        id: 'client1',
        type: 'modbus-client',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: String(port),
        reconnectOnTimeout: false
      }])

      helper.getNode('client1').should.be.ok()
    })
  })
})
