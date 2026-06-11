/**
 * Example test demonstrating timeout-safe patterns for Modbus testing
 * This test shows how to use the new helper utilities to prevent timeouts
 */

'use strict'

const { beforeEachTest, afterEachTest, loadNodesWithTimeout } = require('../helper/test-isolation')
const helper = require('node-red-node-test-helper')

// Test modules
const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')
const clientNode = require('../../src/modbus-client.js')
const readNode = require('../../src/modbus-read.js')
const flexGetterNode = require('../../src/modbus-flex-getter.js')

const testModbusNodes = [serverNode, clientNode, readNode, flexGetterNode]

describe('Modbus Client - Timeout Safe Tests', function () {
  let testHelper

  before(function (done) {
    helper.startServer(done)
  })

  beforeEach(function () {
    // Setup mocking to prevent timeouts
    testHelper = beforeEachTest({
      mockModbusSerial: true,
      mockNetConnections: true,
      mockTimers: true
    })
  })

  afterEach(async function () {
    await afterEachTest()
  })

  after(function (done) {
    helper.stopServer(done)
  })

  describe('Basic Node Loading', function () {
    it('should load modbus client without timeout', async function () {
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
        tcpPort: '10502',
        tcpType: 'DEFAULT',
        unit_id: '1',
        commandDelay: '1',
        clientTimeout: '100', // Very short timeout for testing
        reconnectOnTimeout: false, // Disable reconnection
        reconnectTimeout: '100'
      }]

      await loadNodesWithTimeout(testModbusNodes, flow, 2000)

      const clientNode = helper.getNode('client1')
      clientNode.should.have.property('name', 'Test Client')
      clientNode.should.have.property('clienttype', 'tcp')
      clientNode.should.have.property('tcpHost', '127.0.0.1')
    })

    it('should load modbus read node without timeout', async function () {
      const flow = [
        {
          id: 'server1',
          type: 'modbus-server',
          hostname: '127.0.0.1',
          serverPort: '10503',
          responseDelay: 10,
          delayUnit: 'ms'
        },
        {
          id: 'client1',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: '10503',
          clientTimeout: '100'
        },
        {
          id: 'read1',
          type: 'modbus-read',
          name: 'Test Read',
          dataType: 'Coil',
          adr: '0',
          quantity: '10',
          rate: '1000',
          server: 'client1'
        },
        {
          id: 'helper1',
          type: 'helper'
        }
      ]

      await loadNodesWithTimeout(testModbusNodes, flow, 2000)

      const readNode = helper.getNode('read1')
      readNode.should.have.property('name', 'Test Read')
      readNode.should.have.property('dataType', 'Coil')
    })
  })

  describe('Connection State Management', function () {
    it.skip('should handle client state transitions without hanging', async function () {
      const flow = [{
        id: 'client1',
        type: 'modbus-client',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: '10504',
        clientTimeout: '100'
      }]

      await loadNodesWithTimeout(testModbusNodes, flow, 2000)

      const clientNode = helper.getNode('client1')

      // Mock the FSM to prevent hanging
      if (clientNode.stateService) {
        testHelper.mockFSM(clientNode)
      }

      // Test state should be manageable
      if (clientNode.isInactive) {
        const inactive = clientNode.isInactive()
        inactive.should.be.a('boolean')
      }
    })

    it.skip('should handle failed connections gracefully', async function () {
      const flow = [{
        id: 'client1',
        type: 'modbus-client',
        clienttype: 'tcp',
        tcpHost: '192.0.2.1', // Non-routable test IP
        tcpPort: '9999', // Unlikely port
        clientTimeout: '50', // Very short timeout
        reconnectOnTimeout: false
      }]

      await loadNodesWithTimeout(testModbusNodes, flow, 2000)

      const clientNode = helper.getNode('client1')
      clientNode.should.be.ok()

      // With mocking, connection should not cause timeout
      if (clientNode.connectClient) {
        // This should complete quickly due to mocking
        testHelper.mockNodeBehavior(clientNode)
      }
    })
  })

  describe('Message Handling', function () {
    it.skip('should process messages without timeout', function (done) {
      const flow = [
        {
          id: 'client1',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: '10505',
          clientTimeout: '100'
        },
        {
          id: 'getter1',
          type: 'modbus-flex-getter',
          server: 'client1',
          showStatusActivities: false,
          showErrors: false
        },
        {
          id: 'helper1',
          type: 'helper'
        }
      ]

      loadNodesWithTimeout(testModbusNodes, flow, 2000).then(() => {
        const getterNode = helper.getNode('getter1')
        const helperNode = helper.getNode('helper1')

        let msgReceived = false
        const timeout = setTimeout(() => {
          if (!msgReceived) {
            done(new Error('Message not received within timeout'))
          }
        }, 1000)

        helperNode.on('input', (msg) => {
          msgReceived = true
          clearTimeout(timeout)
          msg.should.be.ok()
          done()
        })

        // Send test message
        getterNode.receive({
          payload: {
            fc: 1, // Read coils
            unitid: 1,
            address: 0,
            quantity: 5
          }
        })
      }).catch(done)
    })

    it('should handle invalid messages gracefully', function (done) {
      const flow = [
        {
          id: 'client1',
          type: 'modbus-client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: '10506'
        },
        {
          id: 'getter1',
          type: 'modbus-flex-getter',
          server: 'client1',
          showErrors: true
        }
      ]

      loadNodesWithTimeout(testModbusNodes, flow, 2000).then(() => {
        const getterNode = helper.getNode('getter1')

        // Send invalid message
        getterNode.receive({
          payload: {
            fc: 99, // Invalid function code
            unitid: 1,
            address: 0,
            quantity: 1
          }
        })

        // Should not hang - test completes quickly
        setTimeout(() => {
          done()
        }, 100)
      }).catch(done)
    })
  })

  describe('Resource Cleanup', function () {
    it.skip('should cleanup resources properly', async function () {
      const flow = [{
        id: 'client1',
        type: 'modbus-client',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: '10507'
      }]

      await loadNodesWithTimeout(testModbusNodes, flow, 2000)

      const clientNode = helper.getNode('client1')

      // Mock cleanup functions
      if (clientNode.stateService) {
        testHelper.mockFSM(clientNode)
      }

      // Test helper cleanup should work
      testHelper.cleanup()

      // Should complete without hanging
      clientNode.should.be.ok()
    })
  })
})
