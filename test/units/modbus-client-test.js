/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'
const coreModbusClient = require('../../src/core/modbus-client-core')
const serverNode = require('../../src/modbus-server.js')
const nodeUnderTest = require('../../src/modbus-client.js')
const readNode = require('../../src/modbus-read.js')
const flexGetterNode = require('../../src/modbus-flex-getter.js')
// const mBasics = require('../../src/modbus-basics.js')
const sinon = require('sinon')
const testModbusClientNodes = [serverNode, nodeUnderTest, readNode, flexGetterNode]
const assert = require('assert')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-client-flows')
const {
  getPort,
  useFakeTimers,
  withEphemeralPorts,
  waitForLiveClientServer,
  waitForHelperModbusExchange,
  onceDone
} = require('../helper/test-helper-extensions')

describe('Client node Unit Testing', function () {
  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    try {
      sinon.restore()
    } catch (e) { /* ignore */ }
    helper.unload().then(function () {
      done()
    }).catch(function () {
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })
  // describe('client node is Active', function () {

  // })

  describe('Node', function () {
    it('should handle error and log warning on deregister node for modbus', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        const clientUserNodeId = 'clientUserNodeId'
        modbusClientNode.registeredNodeList[clientUserNodeId] = true
        const error = new Error('Error on deregister node')
        sinon.stub(modbusClientNode, 'closeConnectionWithoutRegisteredNodes').throws(error)

        modbusClientNode.deregisterForModbus(clientUserNodeId, function () {
          done()
        })
      })
    })

    it('should handle error without a message in modbusSerialErrorHandling and log JSON stringified error', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        const errorObject = { code: 'TestError', info: 'Some info' }

        // Stubbing the necessary functions and properties
        const coreModbusQueue = {
          queueSerialUnlockCommand: sinon.stub()
        }

        const coreModbusClient = {
          modbusSerialDebug: sinon.stub()
        }

        modbusClientNode.coreModbusQueue = coreModbusQueue
        modbusClientNode.coreModbusClient = coreModbusClient
        modbusClientNode.showErrors = true
        modbusClientNode.failureLogEnabled = true

        // Creating an error object without a message
        const error = {}
        Object.assign(error, errorObject)

        modbusClientNode.error = sinon.stub()
        modbusClientNode.stateService = { send: sinon.stub() }

        modbusClientNode.modbusSerialErrorHandling(error)
        sinon.assert.calledWith(modbusClientNode.stateService.send, 'BREAK')
        done()
      })
    })

    it('should handle error with a message in modbusSerialErrorHandling', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        const errorMessage = 'Test error message'
        const coreModbusQueue = {
          queueSerialUnlockCommand: sinon.stub()
        }

        const coreModbusClient = {
          modbusSerialDebug: sinon.stub()
        }

        modbusClientNode.coreModbusQueue = coreModbusQueue
        modbusClientNode.coreModbusClient = coreModbusClient
        modbusClientNode.showErrors = true
        modbusClientNode.failureLogEnabled = true

        const error = new Error(errorMessage)

        modbusClientNode.error = sinon.stub()
        modbusClientNode.stateService = { send: sinon.stub() }

        modbusClientNode.modbusSerialErrorHandling(error)
        sinon.assert.calledWith(modbusClientNode.stateService.send, 'BREAK')
        done()
      })
    })

    it('should initialize default values when parallelUnitIdsAllowed is undefined', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        assert.strictEqual(modbusClientNode.clienttype, 'tcp')
        assert.strictEqual(modbusClientNode.bufferCommands, true)
        assert.strictEqual(modbusClientNode.queueLogEnabled, false)
        assert.strictEqual(modbusClientNode.stateLogEnabled, false)
        assert.strictEqual(modbusClientNode.failureLogEnabled, true)
        assert.strictEqual(modbusClientNode.closingModbus, false)
        done()
      })
    })

    it('should call closeConnectionWithoutRegisteredNodes when closingModbus is false', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')

        modbusClientNode.registeredNodeList = {
          clientUserNodeId: {}
        }
        modbusClientNode.closingModbus = false
        sinon.stub(modbusClientNode, 'closeConnectionWithoutRegisteredNodes').callsFake(function (clientUserNodeId, done) {
          done()
        })

        modbusClientNode.deregisterForModbus('clientUserNodeId', function () {
          sinon.assert.calledWith(modbusClientNode.closeConnectionWithoutRegisteredNodes, 'clientUserNodeId', sinon.match.func)

          done()
        })
      })
    })

    it('should register consumers by node id string not object key (#423)', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        modbusClientNode.registeredNodeList = {}
        const sendStub = sinon.stub(modbusClientNode.stateService, 'send')

        modbusClientNode.registerForModbus({ id: 'flex-a' })
        modbusClientNode.registerForModbus({ id: 'flex-b' })

        assert.strictEqual(Object.keys(modbusClientNode.registeredNodeList).length, 2)
        assert.ok(modbusClientNode.registeredNodeList['flex-a'])
        assert.ok(modbusClientNode.registeredNodeList['flex-b'])
        assert.strictEqual(modbusClientNode.registeredNodeList['[object Object]'], undefined)
        // NEW/INIT only when going from 0 → 1
        sinon.assert.calledWith(sendStub, 'NEW')
        sinon.assert.calledWith(sendStub, 'INIT')
        assert.strictEqual(sendStub.withArgs('NEW').callCount, 1)

        sendStub.restore()
        done()
      })
    })

    it('should not STOP client when deregistering one of multiple consumers (#423)', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        modbusClientNode.registeredNodeList = {
          'flex-a': 'flex-a',
          'flex-b': 'flex-b'
        }
        modbusClientNode.closingModbus = false
        const sendStub = sinon.stub(modbusClientNode.stateService, 'send')
        const setStoppedStub = sinon.stub(modbusClientNode, 'setStoppedState')
        const closeStub = sinon.stub(modbusClientNode, 'closeConnectionWithoutRegisteredNodes')

        modbusClientNode.deregisterForModbus('flex-a', function () {
          assert.strictEqual(modbusClientNode.registeredNodeList['flex-a'], undefined)
          assert.strictEqual(modbusClientNode.registeredNodeList['flex-b'], 'flex-b')
          sinon.assert.notCalled(closeStub)
          sinon.assert.notCalled(setStoppedStub)
          assert.strictEqual(sendStub.calledWith('STOP'), false)
          sendStub.restore()
          setStoppedStub.restore()
          closeStub.restore()
          done()
        })
      })
    })

    it('should not STOP when siblings remain even if list was non-empty in closeConnection (#423)', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        modbusClientNode.registeredNodeList = { 'flex-b': 'flex-b' }
        const setStoppedStub = sinon.stub(modbusClientNode, 'setStoppedState')
        const doneSpy = sinon.spy()

        modbusClientNode.closeConnectionWithoutRegisteredNodes('flex-a', doneSpy)

        sinon.assert.calledOnce(doneSpy)
        sinon.assert.notCalled(setStoppedStub)
        setStoppedStub.restore()
        done()
      })
    })

    it('should finish last-consumer deregister without waiting for hung client.close (#423 deploy)', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        modbusClientNode.registeredNodeList = {}
        modbusClientNode.actualServiceState = { value: 'queueing' }
        modbusClientNode.client = {
          isOpen: true,
          close: function () { /* never calls back — simulates hung socket */ }
        }
        const setStoppedStub = sinon.stub(modbusClientNode, 'setStoppedState').callsFake(function (id, cb) {
          cb()
        })
        const started = Date.now()
        modbusClientNode.closeConnectionWithoutRegisteredNodes('last-id', function () {
          assert.ok(Date.now() - started < 500, 'must not block on hung client.close')
          sinon.assert.calledOnce(setStoppedStub)
          setStoppedStub.restore()
          done()
        })
      })
    })

    it('should call cberr with error when setNewNodeSettings returns false', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        modbusClientNode.actualServiceState = { value: 'opened' }
        modbusClientNode.unit_id = 1
        modbusClientNode.clientTimeout = 1
        modbusClientNode.client = {
          setID: sinon.spy(),
          setTimeout: sinon.spy(),
          _port: {
            on: sinon.spy()
          }
        }
        const msg = {
          payload: {
          }
        }
        const internalDebugSpy = sinon.spy(coreModbusClient, 'internalDebug')
        const setNewNodeSettingsStub = sinon.stub(coreModbusClient, 'setNewNodeSettings').returns(false)
        const stateServiceSendStub = sinon.stub(modbusClientNode.stateService, 'send')
        const cb = sinon.spy()
        const cberr = sinon.spy()
        modbusClientNode.emit('dynamicReconnect', msg, cb, cberr)
        sinon.assert.calledWith(internalDebugSpy, 'Dynamic Reconnect Parameters ' + JSON.stringify(msg.payload))
        sinon.assert.calledOnce(setNewNodeSettingsStub)
        sinon.assert.calledWith(setNewNodeSettingsStub, modbusClientNode, msg)
        sinon.assert.notCalled(cb)
        sinon.assert.calledOnce(cberr)
        sinon.assert.calledWith(cberr, sinon.match.instanceOf(Error), msg)

        internalDebugSpy.restore()
        setNewNodeSettingsStub.restore()
        stateServiceSendStub.restore()

        done()
      })
    })

    it('should handle dynamicReconnect event correctly', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        modbusClientNode.actualServiceState = { value: 'opened' }
        modbusClientNode.unit_id = 1
        modbusClientNode.clientTimeout = 1
        modbusClientNode.client = {
          setID: sinon.spy(),
          setTimeout: sinon.spy(),
          _port: {
            on: sinon.spy()
          }
        }
        const msg = {
          payload: {
          }
        }
        const internalDebugSpy = sinon.spy(coreModbusClient, 'internalDebug')
        const setNewNodeSettingsStub = sinon.stub(coreModbusClient, 'setNewNodeSettings').returns(true)
        const stateServiceSendStub = sinon.stub(modbusClientNode.stateService, 'send')
        const cb = sinon.spy()
        const cberr = sinon.spy()

        try {
          modbusClientNode.emit('dynamicReconnect', msg, cb, cberr)

          sinon.assert.calledWith(internalDebugSpy, 'Dynamic Reconnect Parameters ' + JSON.stringify(msg.payload))
          sinon.assert.calledWith(setNewNodeSettingsStub, modbusClientNode, msg)
          sinon.assert.calledWith(stateServiceSendStub, 'SWITCH')
          done()
        } catch (err) {
          done(err)
        } finally {
          internalDebugSpy.restore()
          setNewNodeSettingsStub.restore()
          stateServiceSendStub.restore()
        }
      })
    })

    it('should send FAILURE state and log an error when serialPort is falsy', function (done) {
      helper.load(testModbusClientNodes, testFlows.testModbusReadFlowFailure, function () {
        const modbusClientNode = helper.getNode('4')
        modbusClientNode.serialPort = null
        const sendSpy = sinon.spy(modbusClientNode.stateService, 'send')

        modbusClientNode.connectClient()
        sinon.assert.calledWithExactly(sendSpy, 'FAILURE')

        done()
      })
    })

    it('should open serial client if actualServiceState is opened', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const modbusClientNode = helper.getNode('3')
        modbusClientNode.actualServiceState = { value: 'opened' }
        modbusClientNode.unit_id = 1
        modbusClientNode.clientTimeout = 1
        modbusClientNode.client = {
          setID: sinon.spy(),
          setTimeout: sinon.spy(),
          _port: {
            on: sinon.spy()
          }
        }

        modbusClientNode.openSerialClient()

        sinon.assert.calledWith(modbusClientNode.client.setTimeout, 1)
        sinon.assert.calledWith(modbusClientNode.client.setID, 1)
        sinon.assert.calledWith(modbusClientNode.client._port.on, 'close', modbusClientNode.onModbusClose)
        done()
      })
    })

    it('should handle error during deregistration', function (done) {
      const flow = Array.from(testFlows.testModbusReadFlow)
      getPort().then((port) => {
        flow[0].serverPort = port
        flow[3].tcpPort = port

        helper.load(testModbusClientNodes, testFlows.testModbusReadFlow, function () {
          const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
          modbusClientNode.closingModbus = false
          const closeConnectionWithoutRegisteredNodesSpy = sinon.spy(modbusClientNode, 'closeConnectionWithoutRegisteredNodes')

          modbusClientNode.closeConnectionWithoutRegisteredNodes('client_user_node_id_1', function () {
            sinon.assert.calledWith(closeConnectionWithoutRegisteredNodesSpy, 'client_user_node_id_1', sinon.match.func)

            closeConnectionWithoutRegisteredNodesSpy.restore()

            done()
          })
        })
      })
    })

    it('should set serial connection options and open client', function (done) {
      const flow = Array.from(testFlows.testModbusReadFlow)

      getPort().then((port) => {
        flow[0].serverPort = port
        flow[3].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
          const stateServiceSendSpy = sinon.spy(modbusClientNode.stateService, 'send')
          modbusClientNode.setSerialConnectionOptions()
          sinon.assert.calledWith(stateServiceSendSpy, 'OPENSERIAL')
          stateServiceSendSpy.restore()

          done()
        })
      })
    })

    it('should handle Modbus close event and call appropriate functions', function (done) {
      const flow = Array.from(testFlows.testModbusReadFlow)

      getPort().then((port) => {
        flow[0].serverPort = port
        flow[3].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
          const stateServiceSendStub = sinon.stub(modbusClientNode.stateService, 'send')

          modbusClientNode.onModbusClose()
          sinon.assert.calledWith(stateServiceSendStub, 'CLOSE')
          stateServiceSendStub.restore()

          done()
        })
      })
    })

    it('should handle modbus errors', function (done) {
      const flow = Array.from(testFlows.testModbusReadFlow)

      getPort().then((port) => {
        flow[0].serverPort = port
        flow[3].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
          const stateServiceSendStub = sinon.stub(modbusClientNode.stateService, 'send')
          const errorWithMessageAndErrno = { message: 'Connection refused', errno: 'ECONNREFUSED' }

          modbusClientNode.modbusErrorHandling(errorWithMessageAndErrno)
          sinon.assert.calledWith(stateServiceSendStub, 'FAILURE')
          done()
        })
      })
    })

    it('should be loaded with TCP DEFAULT', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const modbusReadNode = helper.getNode('115bd58ae573c942')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPDefault')
        done()
      })
    })

    it('should be loaded with TCP TELNET', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpTelnetFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6359')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPTelnet')
        done()
      })
    })

    it('should be loaded with TCP RTU-BUFFERED', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpRtuBufferedFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6360')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPRTUB')
        done()
      })
    })

    it('should be loaded with TCP C701', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpC701Flow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6361')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPC701')
        done()
      })
    })

    it('should be loaded with Serial RTU-BUFFERED', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialRtuBufferedFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6362')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTUB')
        done()
      })
    })

    it('should be loaded with Serial RTU', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialRtuFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6363')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTU')
        done()
      })
    })

    it('should be loaded with Serial ASCII', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialAsciiFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6364')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialASCII')
        done()
      })
    })

    it('should have messageAllowed defaults', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialAsciiFlow, function () {
        const modbusClientNode = helper.getNode('466860d5.3f6364')
        modbusClientNode.should.have.property('messageAllowedStates', coreModbusClient.messageAllowedStates)
        done()
      })
    })

    it('should be inactive if message not allowed', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeInactiveFlow, function () {
        const modbusClientNode = helper.getNode('53f6fb33a3f90ead')
        setTimeout(() => {
          modbusClientNode.messageAllowedStates = ['']
          const isInactive = modbusClientNode.isInactive()
          isInactive.should.be.true()
          done()
        }, 1500)
      })
    })

    it('should be inactive when first loaded', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const modbusReadNode = helper.getNode('115bd58ae573c942')
        const isInactive = modbusReadNode.isInactive()
        isInactive.should.be.true()
        done()
      })
    })

    it('should exchange Coil data with a live Modbus-Server over TCP', function (done) {
      const finish = onceDone(done)
      withEphemeralPorts(testFlows.testSimpleReadWithClientFlow).then((flow) => {
        // Speed up polling for the test
        const readCfg = flow.find((n) => n && n.type === 'modbus-read')
        if (readCfg) {
          readCfg.rate = '200'
          readCfg.rateUnit = 'ms'
        }
        helper.load(testModbusClientNodes, flow, function (loadErr) {
          if (loadErr) return finish(loadErr)
          const server = helper.getNode('445454e4.968564')
          const client = helper.getNode('466860d5.3f6358')
          const helperOut = helper.getNode('h1')
          waitForLiveClientServer(server, client, function (readyErr) {
            if (readyErr) return finish(readyErr)
            waitForHelperModbusExchange(helperOut, function (exErr) {
              if (exErr) return finish(exErr)
              finish()
            }, {
              requireArray: true,
              timeoutMessage: 'timeout waiting for Modbus-Read payload from live server'
            })
          })
        })
      }).catch(finish)
    })

    it('should close client connection when no registered nodes', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusClientNode = helper.getNode('466860d5.3f6358')
          modbusClientNode.registeredNodeList = {}
          modbusClientNode.closingModbus = true
          modbusClientNode.actualServiceState.value = 'started'
          const mockClient = {
            isOpen: true,
            close: function (inner) {
              inner()
            }
          }
          modbusClientNode.setStoppedState = sinon.spy()
          modbusClientNode.client = mockClient
          const _done = sinon.spy()
          const clientUserNodeId = sinon.spy()

          modbusClientNode.closeConnectionWithoutRegisteredNodes(clientUserNodeId, _done)

          sinon.assert.calledWith(modbusClientNode.setStoppedState, clientUserNodeId, _done)
          mockClient.isOpen = false
          modbusClientNode.closeConnectionWithoutRegisteredNodes(clientUserNodeId, _done)

          sinon.assert.calledWith(modbusClientNode.setStoppedState, clientUserNodeId, _done)
          modbusClientNode.actualServiceState.value = 'stopped'
          modbusClientNode.closeConnectionWithoutRegisteredNodes(clientUserNodeId, _done)
          sinon.assert.calledWith(modbusClientNode.setStoppedState, clientUserNodeId, _done)
          done()
        })
      })
    })

    it('should have correct messageAllowedStates property', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const modbusReadNode = helper.getNode('115bd58ae573c942')
        modbusReadNode.should.have.property('messageAllowedStates', coreModbusClient.messageAllowedStates)
        done()
      })
    })

    it('should fail for unsupported function code', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const h1 = helper.getNode('115bd58ae573c942')
        h1.on('input', function (msg) {
          msg.should.have.property('payload', 'Function code not supported')
          done()
        })
        h1.receive({ payload: 'test message', modbus: { functionCode: 64 } })
        done()
      })
    })

    it('should fail for invalid slave ID', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const h1 = helper.getNode('115bd58ae573c942')
        h1.on('input', function (msg) {
          msg.should.have.property('payload', 'Invalid slave ID')
          done()
        })
        h1.receive({ payload: 'test message', modbus: { slave: 256 } })
        done()
      })
    })

    it('should fail for invalid unit ID', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const h1 = helper.getNode('115bd58ae573c942')
        h1.on('input', function (msg) {
          msg.should.have.property('payload', 'Invalid unit ID')
          done()
        })
        h1.receive({ payload: 'test message', modbus: { unitId: 256 } })
        done()
      })
    })

    it('should fail for invalid TCP host', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const h1 = helper.getNode('115bd58ae573c942')
        h1.on('input', function (msg) {
          msg.should.have.property('payload', 'Invalid TCP host')
          done()
        })
        h1.receive({ payload: 'test message', modbus: { tcpHost: 'invalid-host' } })
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testModbusClientNodes, [], function () {
        helper.request().post('/modbus-client/invalid').expect(404).end(done)
      })
    })
  })

  describe('Phase 2 — FSM reconnect hardening', function () {
    it('should clear pending reconnect timer before scheduling new one', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        const clearSpy = sinon.spy(global, 'clearTimeout')
        node.closingModbus = false
        node.reconnectOnTimeout = true
        node.reconnectTimeout = 2000
        node.reconnectTimeoutId = 42
        node.stateService.send('NEW')
        node.stateService.send('INIT')
        node.stateService.send('CONNECT')
        node.stateService.send('CLOSE')
        clearSpy.resetHistory()
        node.reconnectTimeoutId = 99
        node.stateService.send('INIT')
        node.stateService.send('CONNECT')
        node.stateService.send('CLOSE')
        sinon.assert.called(clearSpy)
        clearSpy.restore()
        done()
      })
    })

    it('should not send RECONNECT from closed state when closingModbus is true', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        const sendSpy = sinon.spy(node.stateService, 'send')
        node.closingModbus = false
        node.stateService.send('NEW')
        node.stateService.send('INIT')
        node.stateService.send('CONNECT')
        sendSpy.resetHistory()
        node.closingModbus = true
        node.stateService.send('CLOSE')
        sinon.assert.neverCalledWith(sendSpy, 'RECONNECT')
        sendSpy.restore()
        done()
      })
    })

    it('should send INIT (not ACTIVATE) from broken state when reconnectOnTimeout is false', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        const sendSpy = sinon.spy(node.stateService, 'send')
        node.reconnectOnTimeout = false
        node.stateService.send('NEW')
        node.stateService.send('INIT')
        node.stateService.send('CONNECT')
        node.stateService.send('ACTIVATE')
        sendSpy.resetHistory()
        node.stateService.send('BREAK')
        sinon.assert.calledWith(sendSpy, 'INIT')
        sinon.assert.neverCalledWith(sendSpy, 'ACTIVATE')
        sendSpy.restore()
        done()
      })
    })
  })

  describe('Coverage uplift — client FSM and I/O paths', function () {
    function loadClient (done, fn) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        sinon.stub(node, 'connectClient')
        node.isFirstInitOfConnection = false
        node.stateService.send('NEW')
        node.stateService.send('INIT')
        node.stateService.send('CONNECT')
        node.stateService.send('ACTIVATE')
        fn(node, done)
      })
    }

    it('should send INIT after reconnecting timeout elapses', function (done) {
      loadClient(done, function (node, done) {
        const clock = useFakeTimers(sinon)
        const sendSpy = sinon.spy(node.stateService, 'send')
        node.closingModbus = false
        node.reconnectOnTimeout = true
        node.reconnectTimeout = 2000
        node.stateService.send('CLOSE')
        sendSpy.resetHistory()
        clock.tick(2000)
        sinon.assert.calledWith(sendSpy, 'INIT')
        clock.restore()
        sendSpy.restore()
        done()
      })
    })

    it('should not send INIT from reconnecting when closingModbus is true', function (done) {
      loadClient(done, function (node, done) {
        const clock = useFakeTimers(sinon)
        const sendSpy = sinon.spy(node.stateService, 'send')
        node.closingModbus = false
        node.reconnectTimeout = 2000
        node.stateService.send('CLOSE')
        node.closingModbus = true
        sendSpy.resetHistory()
        clock.tick(2000)
        sinon.assert.neverCalledWith(sendSpy, 'INIT')
        clock.restore()
        sendSpy.restore()
        done()
      })
    })

    it('should call readModbus directly when bufferCommands is false', function (done) {
      loadClient(done, function (node, done) {
        const readStub = sinon.stub(coreModbusClient, 'readModbus')
        node.bufferCommands = false
        const msg = { payload: { fc: 3, address: 0, quantity: 1, unitid: 1 } }
        node.emit('readModbus', msg, sinon.spy(), sinon.spy())
        sinon.assert.calledOnce(readStub)
        readStub.restore()
        done()
      })
    })

    it('should call writeModbus directly when bufferCommands is false', function (done) {
      loadClient(done, function (node, done) {
        const writeStub = sinon.stub(coreModbusClient, 'writeModbus')
        node.bufferCommands = false
        const msg = { payload: { fc: 6, address: 0, value: 1, unitid: 1 } }
        node.emit('writeModbus', msg, sinon.spy(), sinon.spy())
        sinon.assert.calledOnce(writeStub)
        writeStub.restore()
        done()
      })
    })

    it('should cberr on readModbus when client is inactive', function (done) {
      loadClient(done, function (node, done) {
        const cberr = sinon.spy()
        node.stateService.send('STOP')
        node.emit('readModbus', { payload: { unitid: 1 } }, sinon.spy(), cberr)
        sinon.assert.calledOnce(cberr)
        done()
      })
    })

    it('should cberr on writeModbus when client is inactive', function (done) {
      loadClient(done, function (node, done) {
        const cberr = sinon.spy()
        node.stateService.send('STOP')
        node.emit('writeModbus', { payload: { unitid: 1 } }, sinon.spy(), cberr)
        sinon.assert.calledOnce(cberr)
        done()
      })
    })

    it('should cberr when queue depth exceeds maxQueueDepth on readModbus', function (done) {
      loadClient(done, function (node, done) {
        const unitId = 1
        node.maxQueueDepth = 1
        node.bufferCommandList.set(unitId, [{
          callModbus: sinon.spy(),
          msg: {},
          cb: sinon.spy(),
          cberr: sinon.spy()
        }])
        const cberr = sinon.spy()
        node.emit('readModbus', { payload: { unitid: unitId, fc: 3, address: 0, quantity: 1 } }, sinon.spy(), cberr)
        setTimeout(function () {
          sinon.assert.calledOnce(cberr)
          sinon.assert.match(cberr.firstCall.args[0].message, /Queue full/)
          done()
        }, 50)
      })
    })

    it('should return true from isReadyToSend in activated state', function (done) {
      loadClient(done, function (node, done) {
        assert.strictEqual(node.isReadyToSend(node), true)
        done()
      })
    })

    it('should return false from isReadyToSend in stopped state', function (done) {
      loadClient(done, function (node, done) {
        node.stateService.send('STOP')
        assert.strictEqual(node.isReadyToSend(node), false)
        done()
      })
    })

    it('should send EMPTY from activateSending when all queues are empty', function (done) {
      loadClient(done, function (node, done) {
        const sendSpy = sinon.spy(node.stateService, 'send')
        const msg = { queueUnitId: 1, payload: {} }
        node.activateSending(msg).then(function () {
          sinon.assert.calledWith(sendSpy, 'EMPTY')
          sendSpy.restore()
          done()
        }).catch(done)
      })
    })

    it('should re-arm unitSendingAllowed when remaining queue depth > 0 (#574)', function (done) {
      loadClient(done, function (node, done) {
        const unitId = 1
        node.parallelUnitIdsAllowed = false
        node.clienttype = 'tcp'
        node.unitSendingAllowed = []
        node.bufferCommandList.set(unitId, [{
          callModbus: sinon.spy(),
          msg: { queueUnitId: unitId },
          cb: sinon.spy(),
          cberr: sinon.spy()
        }])
        node.activateSending({ queueUnitId: unitId, payload: {} }).then(function () {
          assert.deepStrictEqual(node.unitSendingAllowed, [unitId])
          done()
        }).catch(done)
      })
    })

    it('should not duplicate unitSendingAllowed on re-arm when already pending (#574)', function (done) {
      loadClient(done, function (node, done) {
        const unitId = 2
        node.parallelUnitIdsAllowed = false
        node.clienttype = 'tcp'
        node.unitSendingAllowed = [unitId]
        node.bufferCommandList.set(unitId, [{
          callModbus: sinon.spy(),
          msg: {},
          cb: sinon.spy(),
          cberr: sinon.spy()
        }])
        node.activateSending({ queueUnitId: unitId, payload: {} }).then(function () {
          assert.deepStrictEqual(node.unitSendingAllowed, [unitId])
          done()
        }).catch(done)
      })
    })

    it('should drain all buffered commands for same unitId when parallelUnitIdsAllowed is false (#574)', function (done) {
      const coreModbusQueue = require('../../src/core/modbus-queue-core')
      loadClient(done, function (node, done) {
        const unitId = 1
        const callOrder = []
        node.parallelUnitIdsAllowed = false
        node.clienttype = 'tcp'
        node.commandDelay = 0
        node.serialSendingAllowed = true
        node.unitSendingAllowed = []
        coreModbusQueue.initQueue(node)

        function makeCallModbus (seq) {
          return function (n, msg, onSuccess) {
            callOrder.push(seq)
            n.activateSending(msg).then(function () {
              onSuccess({ data: [seq] }, msg)
            }).catch(function (err) {
              done(err)
            })
          }
        }

        const pushes = [0, 1, 2].map(function (seq) {
          return coreModbusQueue.pushToQueueByUnitId(
            node,
            makeCallModbus(seq),
            { payload: { unitid: unitId, fc: 3, address: seq, quantity: 1 } },
            sinon.spy(),
            sinon.spy()
          )
        })

        Promise.all(pushes).then(function () {
          assert.strictEqual(node.unitSendingAllowed.length, 1, 'push-time dedupe keeps one pending slot')
          assert.strictEqual(node.bufferCommandList.get(unitId).length, 3)

          let steps = 0
          function step () {
            steps++
            if (callOrder.length === 3 && coreModbusQueue.checkQueuesAreEmpty(node)) {
              assert.deepStrictEqual(callOrder, [0, 1, 2])
              assert.deepStrictEqual(node.unitSendingAllowed, [])
              done()
              return
            }
            if (steps > 20) {
              done(new Error('drain stalled after ' + callOrder.length + ' calls; unitSendingAllowed=' +
                JSON.stringify(node.unitSendingAllowed)))
              return
            }
            node.sendingAllowed.set(unitId, true)
            node.serialSendingAllowed = true
            coreModbusQueue.dequeueCommand(node)
            setTimeout(step, 15)
          }
          step()
        }).catch(done)
      })
    })

    it('should drain buffered commands across multiple unitIds sequentially (#574)', function (done) {
      const coreModbusQueue = require('../../src/core/modbus-queue-core')
      loadClient(done, function (node, done) {
        const callOrder = []
        node.parallelUnitIdsAllowed = false
        node.clienttype = 'tcp'
        node.serialSendingAllowed = true
        node.unitSendingAllowed = []
        coreModbusQueue.initQueue(node)

        function makeCallModbus (label) {
          return function (n, msg, onSuccess) {
            callOrder.push(label)
            n.activateSending(msg).then(function () {
              onSuccess({ data: [1] }, msg)
            }).catch(done)
          }
        }

        Promise.all([
          coreModbusQueue.pushToQueueByUnitId(node, makeCallModbus('u1a'), { payload: { unitid: 1, fc: 3, address: 0, quantity: 1 } }, sinon.spy(), sinon.spy()),
          coreModbusQueue.pushToQueueByUnitId(node, makeCallModbus('u1b'), { payload: { unitid: 1, fc: 3, address: 1, quantity: 1 } }, sinon.spy(), sinon.spy()),
          coreModbusQueue.pushToQueueByUnitId(node, makeCallModbus('u2a'), { payload: { unitid: 2, fc: 3, address: 0, quantity: 1 } }, sinon.spy(), sinon.spy()),
          coreModbusQueue.pushToQueueByUnitId(node, makeCallModbus('u2b'), { payload: { unitid: 2, fc: 3, address: 1, quantity: 1 } }, sinon.spy(), sinon.spy())
        ]).then(function () {
          assert.deepStrictEqual(node.unitSendingAllowed, [1, 2])
          let steps = 0
          function step () {
            steps++
            if (callOrder.length === 4 && coreModbusQueue.checkQueuesAreEmpty(node)) {
              assert.strictEqual(callOrder.filter(function (x) { return x.indexOf('u1') === 0 }).length, 2)
              assert.strictEqual(callOrder.filter(function (x) { return x.indexOf('u2') === 0 }).length, 2)
              done()
              return
            }
            if (steps > 30) {
              done(new Error('multi-unit drain stalled: ' + JSON.stringify(callOrder)))
              return
            }
            ;[1, 2].forEach(function (id) { node.sendingAllowed.set(id, true) })
            node.serialSendingAllowed = true
            coreModbusQueue.dequeueCommand(node)
            setTimeout(step, 15)
          }
          step()
        }).catch(done)
      })
    })
  })

  describe('client-timeout-reconnect-honesty (#564 / #569)', function () {
    it('should send FAILURE on Timed out when reconnectOnTimeout is true', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        const sendSpy = sinon.spy(node.stateService, 'send')
        node.reconnectOnTimeout = true
        node.modbusErrorHandling(new Error('Timed out'))
        sinon.assert.calledWith(sendSpy, 'FAILURE')
        sendSpy.restore()
        done()
      })
    })

    it('should send FAILURE on EAI_AGAIN DNS errors', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        const sendSpy = sinon.spy(node.stateService, 'send')
        const err = new Error('getaddrinfo EAI_AGAIN host.local')
        err.code = 'EAI_AGAIN'
        err.errno = 'EAI_AGAIN'
        node.modbusErrorHandling(err)
        sinon.assert.calledWith(sendSpy, 'FAILURE')
        sendSpy.restore()
        done()
      })
    })

    it('should not Fake-Ready via ACTIVATE while broken', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        node.reconnectOnTimeout = true
        node.reconnectTimeout = 60000
        node.isFirstInitOfConnection = false
        sinon.stub(node, 'connectClient')
        node.stateService.send('NEW')
        node.stateService.send('INIT')
        node.stateService.send('CONNECT')
        node.stateService.send('ACTIVATE')
        node.stateService.send('BREAK')
        assert.strictEqual(node.actualServiceState.value, 'reconnecting')
        node.stateService.send('ACTIVATE')
        assert.notStrictEqual(node.actualServiceState.value, 'activated')
        assert.strictEqual(node.actualServiceState.value, 'reconnecting')
        done()
      })
    })

    it('should notify pending commands on INIT queue wipe', function (done) {
      const coreModbusQueue = require('../../src/core/modbus-queue-core')
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        const cberr = sinon.spy()
        coreModbusQueue.initQueue(node)
        node.bufferCommandList.get(1).push({
          callModbus: function () {},
          msg: { payload: { fc: 3, unitid: 1, address: 0, quantity: 1 } },
          cb: function () {},
          cberr
        })
        coreModbusQueue.initQueue(node)
        sinon.assert.calledOnce(cberr)
        assert.ok(cberr.firstCall.args[0].message.indexOf('queue cleared on reconnect') !== -1)
        assert.ok(coreModbusQueue.checkQueuesAreEmpty(node))
        done()
      })
    })
  })

  describe('client-timeout-reconnect-recovery (#569 / 5.60.2)', function () {
    it('should ACTIVATE after CONNECT without a prior command (FR-CONN-READY)', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        sinon.stub(node, 'connectClient')
        node.stateService.send('NEW')
        node.stateService.send('INIT')
        assert.strictEqual(node.actualServiceState.value, 'init')
        node.stateService.send('CONNECT')
        assert.strictEqual(node.actualServiceState.value, 'activated')
        done()
      })
    })

    it('should connect immediately on init after reconnecting wait (FR-TMR-SINGLE)', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        const clock = useFakeTimers(sinon)
        const connectStub = sinon.stub(node, 'connectClient')
        node.closingModbus = false
        node.reconnectOnTimeout = true
        node.reconnectTimeout = 2000
        node.isFirstInitOfConnection = false
        node.stateService.send('NEW')
        node.stateService.send('INIT')
        node.stateService.send('CONNECT')
        assert.strictEqual(node.actualServiceState.value, 'activated')
        node.stateService.send('BREAK')
        assert.strictEqual(node.actualServiceState.value, 'reconnecting')
        connectStub.resetHistory()
        clock.tick(2000)
        assert.strictEqual(node.actualServiceState.value, 'init')
        sinon.assert.calledOnce(connectStub)
        // Must not require a second full reconnectTimeout before connect
        clock.tick(2000)
        sinon.assert.calledOnce(connectStub)
        clock.restore()
        done()
      })
    })

    it('should still delay non-first init when not coming from reconnecting', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        const clock = useFakeTimers(sinon)
        const connectStub = sinon.stub(node, 'connectClient')
        node.closingModbus = false
        node.reconnectOnTimeout = false
        node.reconnectTimeout = 2000
        node.isFirstInitOfConnection = false
        node.stateService.send('NEW')
        node.stateService.send('INIT')
        node.stateService.send('CONNECT')
        node.stateService.send('BREAK')
        assert.strictEqual(node.actualServiceState.value, 'init')
        connectStub.resetHistory()
        // broken → INIT (not reconnecting): still waits reconnectTimeout
        clock.tick(0)
        sinon.assert.notCalled(connectStub)
        clock.tick(2000)
        sinon.assert.calledOnce(connectStub)
        clock.restore()
        done()
      })
    })

    it('should reset reconnectAttempt on connected', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, function () {
        const node = helper.getNode('3')
        sinon.stub(node, 'connectClient')
        node.reconnectOnTimeout = true
        node.reconnectTimeout = 60000
        node.isFirstInitOfConnection = false
        node.stateService.send('NEW')
        node.stateService.send('INIT')
        node.stateService.send('CONNECT')
        node.stateService.send('BREAK')
        assert.ok(node.reconnectAttempt >= 1)
        node.stateService.send('INIT')
        node.stateService.send('CONNECT')
        assert.strictEqual(node.reconnectAttempt, 0)
        assert.strictEqual(node.actualServiceState.value, 'activated')
        done()
      })
    })
  })
})
