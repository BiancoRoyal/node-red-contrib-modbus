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
const mBasics = require('../../src/modbus-basics.js')
const sinon = require('sinon')
const testModbusClientNodes = [serverNode, nodeUnderTest, readNode, flexGetterNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-client-flows')

describe('Client node Testing', function () {
  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })
  afterEach(function (done) {
    helper.unload()
    helper.stopServer(function () {
      done()
    })
  })
  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('Node', function () {
    it('should set serial connection options and open client', function (done) {
      helper.load(testModbusClientNodes, testFlows.testModbusReadFlow, function () {
        const modbusClientNode = helper.getNode('4')
        const stateServiceSendSpy = sinon.spy(modbusClientNode.stateService, 'send');
        modbusClientNode.setSerialConnectionOptions();
        sinon.assert.calledWith(stateServiceSendSpy, 'OPENSERIAL');
        stateServiceSendSpy.restore();

        done();
      });
    });

    it('should handle Modbus close event and call appropriate functions', function (done) {
      helper.load(testModbusClientNodes, testFlows.testModbusReadFlow, function () {
        const modbusClientNode = helper.getNode('4')
        const stateServiceSendStub = sinon.stub(modbusClientNode.stateService, 'send');

        modbusClientNode.onModbusClose();
        sinon.assert.calledWith(stateServiceSendStub, 'CLOSE');
        stateServiceSendStub.restore();

        done();
      });
    });
    it('should handle modbus errors', function (done) {
      helper.load(testModbusClientNodes, testFlows.testModbusReadFlow, function () {
        const modbusClientNode = helper.getNode('4')
        const stateServiceSendStub = sinon.stub(modbusClientNode.stateService, 'send');
        const errorWithMessageAndErrno = { message: 'Connection refused', errno: 'ECONNREFUSED' };

        modbusClientNode.modbusErrorHandling(errorWithMessageAndErrno);
        sinon.assert.calledWith(stateServiceSendStub, 'FAILURE');
        done();

      });
    });
    it('should be loaded with TCP DEFAULT', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6358')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPDefault')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with wrong TCP', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeWrongTcpFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6358')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPDefault')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP TELNET', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpTelnetFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6359')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPTelnet')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP RTU-BUFFERED', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpRtuBufferedFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6360')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPRTUB')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP C701', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpC701Flow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6361')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPC701')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial RTU-BUFFERED', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialRtuBufferedFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6362')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTUB')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial RTU', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialRtuFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6363')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTU')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial ASCII', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialAsciiFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6364')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialASCII')
        setTimeout(done, 1000)
      })
    })

    it('should work with simple read on local server', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function () {
          counter++
          if (counter === 1) {
            done()
          }
        })
      })
    })

    it('should have messageAllowed defaults', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialAsciiFlow, function () {
        const modbusClientNode = helper.getNode('466860d5.3f6364')
        modbusClientNode.should.have.property('messageAllowedStates', coreModbusClient.messageAllowedStates)
        setTimeout(done, 1000)
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

    it('should be state queueing - ready to send', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
        const modbusReadNode = helper.getNode('384fb9f1.e96296')
        const modbusClientNode = helper.getNode('466860d5.3f6358')
        const h1 = helper.getNode('h1')

        // be ready to receive the msg from the reader
        h1.on('input', function (msg) {
          msg.should.have.property('payload', [false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false])
          mBasics.setNodeStatusTo('queueing', modbusClientNode)
          const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.true()
          done()
        })

        // if the client gets the state to be active
        modbusClientNode.on('mbactive', function (msg) {
          // send a msg to the reader
          modbusReadNode.emit('input', msg)
        })
      })
    })

    it('should be inactive when first loaded', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6358')
        const isInactive = modbusReadNode.isInactive()
        isInactive.should.be.true()
        done()
      })
    })

    it('should be active when it receives a message', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
        const modbusClientNode = helper.getNode('466860d5.3f6358')
        modbusClientNode.on('mbactive', function (msg) {
          const isActive = modbusClientNode.isActive()
          isActive.should.be.true()
          done()
        })
      })
    })

    it('should send a message to the server when it receives a message', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct Modbus function code', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct slave ID', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct starting address', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct number of registers', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct data type', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct unit ID', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct TCP host', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct TCP port', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct serial port', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct serial baud rate', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should close client connection when no registered nodes', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct serial data bits', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should send a message to the server with the correct serial stop bits', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
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

    it('should have correct messageAllowedStates property', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6358')
        modbusReadNode.should.have.property('messageAllowedStates', coreModbusClient.messageAllowedStates)
        done()
      })
    })

    it('should fail for unsupported function code', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const h1 = helper.getNode('466860d5.3f6358')
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
        const h1 = helper.getNode('466860d5.3f6358')
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
        const h1 = helper.getNode('466860d5.3f6358')
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
        const h1 = helper.getNode('466860d5.3f6358')
        h1.on('input', function (msg) {
          msg.should.have.property('payload', 'Invalid TCP host')
          done()
        })
        h1.receive({ payload: 'test message', modbus: { tcpHost: 'invalid-host' } })
        done()
      })
    })

    it('should open serial client if actualServiceState is opened', function (done) {
      helper.load(testModbusClientNodes, testFlows.testClientFlow, function () {
        const modbusReadNode = helper.getNode('90d2529d94dbf5c8')
        modbusReadNode.actualServiceState = { value: 'opened' }
        modbusReadNode.unit_id = 1
        modbusReadNode.clientTimeout = 1
        modbusReadNode.client = {
          setID: sinon.spy(),
          setTimeout: sinon.spy(),
          _port: {
            on: sinon.spy()
          }
        }

        modbusReadNode.openSerialClient()

        sinon.assert.calledWith(modbusReadNode.client.setTimeout, 1)
        sinon.assert.calledWith(modbusReadNode.client.setID, 1)
        sinon.assert.calledWith(modbusReadNode.client._port.on, 'close', modbusReadNode.onModbusClose)
        sinon.assert.calledWith(modbusReadNode.stateService.send, 'CONNECT')
        modbusReadNode.client.setID.restore()
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
        helper.request().post('/modbus-client/invalid').expect(404).end(done)
      })
    })
  })
})
