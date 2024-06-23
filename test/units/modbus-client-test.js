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
const { getPort } = require('../helper/test-helper-extensions')

describe('Client node Unit Testing', function () {
  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
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
  //   it('should be active when it receives a message', function (done) {
  //     const flow = Array.from(testFlows.testModbusReadNodeIsActive)

  //     getPort().then((port) => {
  //       flow[1].serverPort = port
  //       flow[5].tcpPort = port

  //       helper.load(testModbusClientNodes, flow, function () {
  //         const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
  //         modbusClientNode.on('mbactive', function (msg) {
  //           const isActive = modbusClientNode.isActive()
  //           isActive.should.be.true()
  //           done()
  //         })
  //       })
  //     })
  //   })
  //   it('should be state queueing - ready to send', function (done) {
  //     const flow = Array.from(testFlows.testModbusReadNodeIsActive)
  //     getPort().then((port) => {
  //       flow[1].serverPort = port
  //       flow[5].tcpPort = port

  //       helper.load(testModbusClientNodes, flow, function () {
  //         const modbusReadNode = helper.getNode('0d3a652b67ca73ac')
  //         const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
  //         const h1 = helper.getNode('h1')

  //         // be ready to receive the msg from the reader
  //         h1.on('input', function (msg) {
  //           msg.should.have.property('payload', [false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false,
  //             false])
  //           mBasics.setNodeStatusTo('queueing', modbusClientNode)
  //           const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
  //           isReady.should.be.true()
  //           done()
  //         })

  //         // if the client gets the state to be active
  //         modbusClientNode.on('mbactive', function (msg) {
  //           // send a msg to the reader
  //           modbusReadNode.emit('input', msg)
  //         })
  //       })
  //     })
  //   })

  //   it('should work with simple read on local server', function (done) {
  //     const flow = Array.from(testFlows.testModbusReadNodeIsActive)
  //     getPort().then((port) => {
  //       flow[1].serverPort = port
  //       flow[5].tcpPort = port
  //       helper.load(testModbusClientNodes, flow, function () {
  //         const h1 = helper.getNode('959c417207ae06ba')
  //         let counter = 0
  //         h1.on('input', function () {
  //           counter++
  //           if (counter === 1) {
  //             done()
  //           }
  //         })
  //       })
  //     })
  //   })
  //   it('should be active when it receives a message', function (done) {
  //     const flow = Array.from(testFlows.testModbusReadNodeIsActive)

  //     getPort().then((port) => {
  //       flow[1].serverPort = port
  //       flow[5].tcpPort = port

  //       helper.load(testModbusClientNodes, flow, function () {
  //         const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
  //         modbusClientNode.on('mbactive', function (msg) {
  //           const isActive = modbusClientNode.isActive()
  //           isActive.should.be.true()
  //           done()
  //         })
  //       })
  //     })
  //   })
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

        modbusClientNode.emit('dynamicReconnect', msg, cb, cberr)

        sinon.assert.calledWith(internalDebugSpy, 'Dynamic Reconnect Parameters ' + JSON.stringify(msg.payload))
        sinon.assert.calledWith(setNewNodeSettingsStub, modbusClientNode, msg)
        sinon.assert.calledWith(stateServiceSendStub, 'SWITCH')
        done()
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
        setTimeout(done, 800)
      })
    })

    // it('should be loaded with wrong TCP', function (done) {
    //   helper.load(testModbusClientNodes, testFlows.testShouldBeWrongTcpFlow, function () {
    //     const modbusReadNode = helper.getNode('384fb9f1.e96296')
    //     const modbusClientNode = helper.getNode('466860d5.3f6358')
    //     modbusReadNode.should.have.property('name', '')
    //     modbusClientNode.should.have.property('name', 'ModbusClientTCPDefault')
    //     setTimeout(done, 800)
    //   })
    // })

    it('should be loaded with TCP TELNET', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpTelnetFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6359')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPTelnet')
        setTimeout(done, 800)
      })
    })

    it('should be loaded with TCP RTU-BUFFERED', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpRtuBufferedFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6360')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPRTUB')
        setTimeout(done, 800)
      })
    })

    it('should be loaded with TCP C701', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpC701Flow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6361')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPC701')
        setTimeout(done, 800)
      })
    })

    it('should be loaded with Serial RTU-BUFFERED', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialRtuBufferedFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6362')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTUB')
        setTimeout(done, 800)
      })
    })

    it('should be loaded with Serial RTU', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialRtuFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6363')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTU')
        setTimeout(done, 800)
      })
    })

    it('should be loaded with Serial ASCII', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialAsciiFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6364')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialASCII')
        setTimeout(done, 800)
      })
    })

    it('should have messageAllowed defaults', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialAsciiFlow, function () {
        const modbusClientNode = helper.getNode('466860d5.3f6364')
        modbusClientNode.should.have.property('messageAllowedStates', coreModbusClient.messageAllowedStates)
        setTimeout(done, 800)
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

    it('should send a message to the server when it receives a message', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct Modbus function code', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { functionCode: 3 })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct slave ID', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { slave: 1 })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct starting address', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { startingAddress: 1 })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct number of registers', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { quantity: 1 })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct data type', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { dataType: 'float' })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct unit ID', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { unitId: 1 })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct TCP host', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { tcpHost: '127.0.0.1' })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct TCP port', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { tcpPort: 12345 })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct serial port', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { serialPort: '/dev/ttyUSB0' })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct serial baud rate', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { serialBaudrate: 9600 })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
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

    it('should send a message to the server with the correct serial data bits', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { serialDatabits: 8 })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
          done()
        })
      })
    })

    it('should send a message to the server with the correct serial stop bits', function (done) {
      const flow = Array.from(testFlows.testSimpleReadWithClientFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testModbusClientNodes, flow, function () {
          const modbusReadNode = helper.getNode('466860d5.3f6358')
          const serverNode = helper.getNode('serverNode')
          modbusReadNode.on('input', function (msg) {
            msg.should.have.property('payload', 'test message')
            msg.should.have.property('modbus', { serialStopbits: 1 })
            serverNode.receive(msg)
          })
          modbusReadNode.receive({ payload: 'test message' })
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
})
