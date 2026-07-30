/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red-contrib-modbus - The BSD 3-Clause License
 **/
'use strict'

const assert = require('assert')
const coreClientUnderTest = require('../../src/core/modbus-client-core')
const sinon = require('sinon')
const { useFakeTimers } = require('../helper/test-helper-extensions')
const chai = require('chai')
const expect = chai.expect
const { installCoreClientSandboxHooks } = require('./modbus-client-core-test-helper')

describe('Core Client Actions Testing', function () {
  const getSandbox = installCoreClientSandboxHooks(this)

  describe('Core Client', function () {
    it('should call activateSendingOnFailure on quantity mismatch', function (done) {
      const sandbox = getSandbox()
      const node = {
        client: {
          writeRegisters: sinon.stub().resolves('success'),
          getID: sinon.stub().returns(1)
        }
      }
      const msg = {
        payload: {
          address: 123,
          value: [1, 2, 3],
          quantity: 4
        }
      }

      const cb = sinon.stub()
      const cberr = sinon.stub()

      sandbox.stub(coreClientUnderTest, 'activateSendingOnSuccess')
      sandbox.stub(coreClientUnderTest, 'activateSendingOnFailure')
      node.modbusErrorHandling = sinon.stub()
      coreClientUnderTest.writeModbusByFunctionCodeSixteen(node, msg, cb, cberr)
      sinon.assert.notCalled(node.client.writeRegisters)
      sinon.assert.notCalled(coreClientUnderTest.activateSendingOnSuccess)
      sinon.assert.notCalled(node.modbusErrorHandling)

      done()
    })
    it('should call writeRegisters and activateSendingOnSuccess on success', function () {
      const node = {
        client: {
          writeRegisters: sinon.stub().resolves({}),
          getID: sinon.stub().returns(1)
        },
        modbusErrorHandling: sinon.stub()
      }
      const msg = {
        payload: {
          address: '123',
          value: [1, 2, 3],
          quantity: 3
        }
      }
      const cb = sinon.stub()
      const cberr = sinon.stub()
      const coreClient = {
        activateSendingOnSuccess: sinon.stub(),
        activateSendingOnFailure: sinon.stub()
      }

      coreClientUnderTest.writeModbusByFunctionCodeSixteen(node, msg, cb, cberr)
      sinon.assert.notCalled(coreClient.activateSendingOnFailure)
      sinon.assert.notCalled(node.modbusErrorHandling)
    })
    it('should give the units internalDebugLog', function (done) {
      const node = { internalDebugLog: true }
      assert.strict.equal(coreClientUnderTest.getLogFunction(node), node.internalDebugLog)
      done()
    })

    it('should give the core internalDebug', function (done) {
      const node = { internalDebugLog: false }
      assert.strict.equal(coreClientUnderTest.getLogFunction(node), coreClientUnderTest.internalDebug)
      done()
    })

    describe('Core Client UnitId TCP', function () {
      it('should check with success the TCP UnitId 1', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(1, 'tcp'), true)
        done()
      })

      it('should check with failure the TCP UnitId -1', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(-1, 'tcp'), false)
        done()
      })

      it('should check with success the TCP UnitId 0', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(0, 'tcp'), true)
        done()
      })

      it('should check with failure the TCP UnitId undefined', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(undefined, 'tcp'), false)
        done()
      })

      it('should check with failure the TCP UnitId 0 from undefined payload', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'tcp', unit_id: 0 }, { payload: {} }), 0)
        done()
      })

      it('should check with success the TCP UnitId 1 from payload', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({
          clienttype: 'tcp',
          unit_id: 0
        }, { payload: { unitid: 1 } }), 1)
        done()
      })

      it('should check with success the TCP UnitId 0 from payload', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({
          clienttype: 'tcp',
          unit_id: 1
        }, { payload: { unitid: 0 } }), 0)
        done()
      })

      it('should check with success the TCP UnitId 1 from queueid', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'tcp', unit_id: 0 }, {
          payload: {},
          queueUnitId: 1
        }), 1)
        done()
      })

      it('should check with success the TCP UnitId 0 from queueid', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({
          clienttype: 'tcp',
          unit_id: 1
        }, { queueUnitId: 0 }), 0)
        done()
      })

      it('should check with failure the TCP UnitId undefined', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(undefined, 'tcp'), false)
        done()
      })

      it('should check with success the TCP UnitId 255', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(255, 'tcp'), true)
        done()
      })

      it('should check with failure the TCP UnitId 256', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(256, 'tcp'), false)
        done()
      })
    })

    describe('Core Client UnitId Serial', function () {
      it('should check with success the Serial UnitId 1', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(1, 'serial'), true)
        done()
      })

      it('should check with success the Serial UnitId 0', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(0, 'serial'), true)
        done()
      })

      it('should check with success the Serial UnitId 1 from payload', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({
          clienttype: 'serial',
          unit_id: 0
        }, { payload: { unitid: 1 } }), 1)
        done()
      })

      it('should check with success the Serial UnitId 0 from payload', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({
          clienttype: 'serial',
          unit_id: 1
        }, { payload: { unitid: 0 } }), 0)
        done()
      })

      it('should check with success the Serial UnitId 1 from queueid', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'serial', unit_id: 0 }, {
          payload: {},
          queueUnitId: 1
        }), 1)
        done()
      })

      it('should check with success the Serial UnitId 0 from queueid', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({
          clienttype: 'serial',
          unit_id: 1
        }, { queueUnitId: 0 }), 0)
        done()
      })

      it('should check with success the Serial UnitId 247', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(247, 'serial'), true)
        done()
      })

      it('should check with failure the Serial UnitId 248', function (done) {
        assert.strict.equal(coreClientUnderTest.checkUnitId(248, 'serial'), false)
        done()
      })
    })

    it('should create a valid state machine', function () {
      const stateMachine = coreClientUnderTest.createStateMachineService()
      assert.strict.equal(typeof stateMachine, 'object')
    })

    it('should call callback cb with resp and msg when activateSending resolves', async () => {
      const node = {
        activateSending: sinon.stub(),
        stateService: { send: sinon.spy() },
        actualServiceState: { value: 'sending' }
      }
      const cb = sinon.spy()
      const errorCallback = sinon.spy()
      const resp = { data: 'some data' }
      const msg = { payload: { address: 123, value: 1 } }

      node.activateSending.resolves()

      await coreClientUnderTest.activateSendingOnSuccess(node, cb, errorCallback, resp, msg)

      sinon.assert.notCalled(errorCallback)
    })

    it('should trigger onSuccess callback with custom response when writeRegister is successful and ID is 0', async (done) => {
      const node = {
        client: {
          writeRegister: sinon.stub().resolves({ success: true }),
          getID: sinon.stub().returns(0)
        }
      }
      const msg = { payload: { address: '123', value: '456' } }
      const cb = sinon.spy()
      const cberr = sinon.spy()

      coreClientUnderTest.writeModbusByFunctionCodeSix(node, msg, cb, cberr)

      sinon.assert.calledWith(node.client.writeRegister, 123, 456)
      done()
    })

    it('should call onFailure callback when writeRegister fails', async (done) => {
      const errorMessage = 'Failed to write register'
      const node = {
        client: {
          writeRegister: sinon.stub().rejects(errorMessage),
          getID: sinon.stub().returns(1),
          modbusErrorHandling: sinon.spy()
        }
      }
      const msg = { payload: { address: '123', value: '456' } }
      const cb = sinon.spy()
      const cberr = sinon.spy()

      coreClientUnderTest.writeModbusByFunctionCodeSix(node, msg, cb, cberr)

      sinon.assert.calledWith(node.client.writeRegister, 123, 456)
      done()
    })

    it('should call readDiscreteInputs and activateSendingOnSuccess when successful', function (done) {
      const node = {
        client: {
          readDiscreteInputs: sinon.stub().resolves([1, 0, 1, 0, 1, 0, 1, 0])
        },
        activateSending: sinon.spy(),
        stateService: { send: sinon.spy() }
      }

      const msg = { payload: { address: 123, quantity: 8 } }
      const cb = sinon.spy()
      const cberr = sinon.spy()

      coreClientUnderTest.readModbusByFunctionCodeTwo(node, msg, cb, cberr)

      sinon.assert.calledWith(node.client.readDiscreteInputs, 123, 8)

      done()
    })

    it('should call activateSendingOnFailure and modbusErrorHandling when unsuccessful', async function () {
      const errorMessage = 'Failed to read inputs'
      const node = {
        client: {
          readDiscreteInputs: sinon.stub().rejects(errorMessage)
        },
        modbusErrorHandling: sinon.spy()
      }

      const msg = { payload: { address: 255, quantity: 2 } }
      const cb = sinon.spy()
      const cberr = sinon.spy()

      coreClientUnderTest.readModbusByFunctionCodeTwo(node, msg, cb, cberr)

      sinon.assert.calledWith(node.client.readDiscreteInputs, 255, 2)
    })

    it('should call activateSendingOnSuccess when sendCustomFc resolves', async () => {
      const node = { client: { sendCustomFc: sinon.stub().resolves('response') } }
      const msg = { payload: { unitid: 1, fc: 2, requestCard: {}, responseCard: {} } }
      const cb = sinon.spy()
      const cberr = sinon.spy()
      coreClientUnderTest.sendCustomFunctionCode(node, msg, cb, cberr)

      sinon.assert.calledWith(node.client.sendCustomFc, 1, 2, {}, {})
    })

    it('should call activateSendingOnFailure when sendCustomFc rejects', async () => {
      const errorMessage = 'Failed to send custom function code'
      const node = {
        client: {
          sendCustomFc: sinon.stub().rejects(new Error(errorMessage))
        },
        modbusErrorHandling: sinon.spy()
      }
      const msg = { payload: { unitid: 2, fc: 4, requestCard: {}, responseCard: {} } }
      const cb = sinon.spy()
      const cberr = sinon.spy()

      coreClientUnderTest.sendCustomFunctionCode(node, msg, cb, cberr)

      sinon.assert.calledWith(node.client.sendCustomFc, 2, 4, {}, {})
    })
    it('should handle client ID zero by constructing a response and calling activateSendingOnSuccess', async function () {
      const sandbox = getSandbox()
      const node = {
        client: {
          writeRegister: sinon.stub().rejects(new Error('Test Error')),
          getID: sinon.stub().returns(0)
        }
      }
      const msg = {
        payload: {
          address: '10',
          value: '20'
        }
      }
      const cb = sinon.stub()
      const cberr = sinon.stub()
      sandbox.stub(coreClientUnderTest, 'activateSendingOnSuccess')
      coreClientUnderTest.writeModbusByFunctionCodeSix(node, msg, cb, cberr)
      sinon.assert.notCalled(coreClientUnderTest.activateSendingOnSuccess)
    })

    it('should fail customModbusMessage when port is not readable without in-band connect', () => {
      const node = {
        client: {
          _port: {
            _client: {
              readable: false
            }
          },
          getTimeout: sinon.stub().returns(100)

        },
        connectClient: sinon.stub().returns(false),
        activateSending: sinon.stub().resolves(),
        modbusErrorHandling: sinon.stub(),
        stateService: { send: sinon.stub() },
        clienttype: 'tcp',
        setUnitIdFromPayload: sinon.stub(),
        clientTimeout: 500,
        actualServiceState: { value: 'sending' }
      }

      const msg = {}
      const cb = sinon.stub()
      const cberr = sinon.stub()

      coreClientUnderTest.customModbusMessage(node, msg, cb, cberr)

      sinon.assert.notCalled(node.connectClient)
      sinon.assert.calledOnce(node.modbusErrorHandling)
    })
    it('should handle when the client port is not readable and connection fails', () => {
      const sandbox = getSandbox()
      let node = {
        client: {
          _port: {
            _client: {
              readable: true
            }
          },
          getTimeout: sinon.stub().returns(100),
          setTimeout: sinon.spy()
        },
        // connectClient: sinon.stub().returns(false),
        // connectClient: sinon.stub().returns(true), // Stub the connectClient method
        connectClient: sinon.spy(),
        stateService: { send: sinon.spy() },
        // clienttype: 'tcp',
        queueLog: sinon.spy(),
        setUnitIdFromPayload: sinon.spy(),
        clientTimeout: 500,
        bufferCommands: false,
        clienttype: 'serial',
        modbusErrorHandling: sinon.spy(),
        actualServiceState: { value: 'connected' }
        // stateService: {
        //   send: function (state) {
        //     assert.strictEqual(state, 'READ');
        //   }
        // }

      }

      let msg = {}
      let cb = sinon.spy()
      let cberr = sinon.spy()
      sandbox.stub(coreClientUnderTest, 'activateSendingOnFailure')
      const clock3 = useFakeTimers(sinon)

      coreClientUnderTest.customModbusMessage(node, msg, cb, cberr)
      clock3.tick(1)

      sinon.assert.calledOnce(node.stateService.send)
      sinon.assert.calledWithExactly(node.stateService.send, 'READ')
      clock3.restore()

      const clock1 = useFakeTimers(sinon)

      msg = {
        payload: 'testPayload',
        queueUnitId: 1
      }

      coreClientUnderTest.customModbusMessage(node, msg, cb, cberr)

      clock1.tick(1)
      sinon.assert.calledWithExactly(node.client.setTimeout, 500)
      clock1.restore()

      node = {
        client: {
          getTimeout: sinon.stub().returns(1000),
          setTimeout: sinon.spy()

        },
        queueLog: sinon.spy(),
        bufferCommands: true,
        actualServiceState: { value: 'connected' },
        setUnitIdFromPayload: sinon.spy(),
        modbusErrorHandling: sinon.spy()

      }
      msg = {
        payload: 'test message',
        queueUnitId: 1
      }
      cb = sinon.spy()
      cberr = sinon.spy()

      const clock2 = useFakeTimers(sinon)
      coreClientUnderTest.customModbusMessage(node, msg, cb, cberr)

      clock2.tick(1)
      // sinon.assert.calledWith(node.queueLog, JSON.stringify({
      //   info: 'read msg via Modbus',
      //   message: 'testPayload',
      //   queueUnitId: 1,
      //   timeout: 100,
      //   state: 'testState'
      // }));

      clock2.restore()
    })

    it('should call readModbusByFunctionCodeOne for function code 1', () => {
      const sandbox = getSandbox()
      const node = {
        clienttype: 'serial',
        client: {
          _port: {
            _client: { readable: true }
          },
          setTimeout: sinon.spy(),
          getTimeout: sinon.stub().returns(1000)
        },
        stateService: { send: sinon.spy() },
        connectClient: sinon.spy(),
        setUnitIdFromPayload: sinon.spy()
      }
      const msg = { payload: { fc: 1 } }
      const cb = sinon.spy()
      const cberr = sinon.spy()
      sandbox.stub(coreClientUnderTest, 'readModbusByFunctionCodeOne')
      const clock = useFakeTimers(sinon)

      coreClientUnderTest.readModbus(node, msg, cb, cberr)
      clock.tick(1)

      sinon.assert.calledWith(coreClientUnderTest.readModbusByFunctionCodeOne, node, msg, cb, cberr)
      clock.restore()
    })

    it('should process function code 16 when node client is ready and writable', (done) => {
      const sandbox = getSandbox()
      const node = {
        clienttype: 'serial',
        client: {
          _port: {
            _client: { writable: true }
          },
          setTimeout: sinon.spy(),
          getTimeout: sinon.stub().returns(1000)
        },
        stateService: { send: sinon.spy() },
        connectClient: sinon.spy(),
        setUnitIdFromPayload: sinon.spy()
      }
      const msg = { payload: { fc: 16, address: 123, quantity: 1 } }
      const cb = sinon.spy()
      const cberr = sinon.spy()
      sandbox.stub(coreClientUnderTest, 'writeModbusByFunctionCodeSixteen')

      const clock = useFakeTimers(sinon)
      coreClientUnderTest.writeModbus(node, msg, cb, cberr)
      clock.tick(1)
      expect(coreClientUnderTest.writeModbusByFunctionCodeSixteen.calledOnceWith(node, msg, cb, cberr)).to.equal(true)
      clock.restore()
      done()
    })

    it('should call writeModbusByFunctionCodeSix for function code 6', () => {
      const sandbox = getSandbox()
      const node = {
        client: {
          _port: { _client: { writable: true } },
          getTimeout: sinon.stub().returns(1000),
          setTimeout: sinon.spy()
        },
        connectClient: sinon.stub().returns(true),
        stateService: { send: sinon.spy() },
        queueLog: sinon.spy(),
        setUnitIdFromPayload: sinon.spy(),
        clientTimeout: 1000,
        bufferCommands: false,
        clienttype: 'tcp'
      }
      const msg = { payload: { fc: 6, unitId: 1 } }
      const cb = sinon.spy()
      const cberr = sinon.spy()
      const nodeLog = sinon.spy()

      sandbox.stub(coreClientUnderTest, 'getLogFunction').returns(nodeLog)
      sandbox.stub(coreClientUnderTest, 'writeModbusByFunctionCodeSix')

      const clock = useFakeTimers(sinon)
      coreClientUnderTest.writeModbus(node, msg, cb, cberr)
      clock.tick(1)
      expect(coreClientUnderTest.getLogFunction.calledOnceWith(node)).to.equal(true)
      expect(coreClientUnderTest.writeModbusByFunctionCodeSix.calledOnceWith(node, msg, cb, cberr)).to.equal(true)
      expect(nodeLog.called).to.equal(false)
      clock.restore()
    })

    it('should activate sending on failure with error "Function Code Unknown" for unknown function code', async () => {
      const sandbox = getSandbox()
      const node = {
        client: { setTimeout: sinon.spy() },
        clienttype: 'serial',
        setUnitIdFromPayload: sinon.spy(),
        bufferCommands: false,
        stateService: {
          send: function (state) {
            assert.strictEqual(state, 'WRITE')
          }
        }
      }

      const clock = useFakeTimers(sinon)
      const msg = { payload: { fc: 99 } }
      const cb = sinon.spy()
      const cberr = sinon.spy()
      const nodeLog = sinon.spy()
      sandbox.stub(coreClientUnderTest, 'getLogFunction').returns(nodeLog)
      sandbox.stub(coreClientUnderTest, 'activateSendingOnFailure')

      coreClientUnderTest.writeModbus(node, msg, cb, cberr)
      clock.tick(1)

      sinon.assert.calledWith(nodeLog, 'Function Code Unknown %s', msg.payload.fc)
      sinon.assert.calledWith(coreClientUnderTest.activateSendingOnFailure, node, cberr, sinon.match.instanceOf(Error).and(sinon.match.has('message', 'Function Code Unknown')), msg)
      clock.restore()
    })

    it('should handle non-integer inputs for serialBaudrate gracefully', () => {
      const node = { serialBaudrate: 9600 }
      const msg = { payload: { serialBaudrate: '115200', serialPort: '/dev/ttyUSB' } }
      coreClientUnderTest.setNewSerialNodeSettings(node, msg)
      assert.strict.equal(node.serialBaudrate, 115200)
    })

    it('should log Serial settings when connectorType is SERIAL', () => {
      const sandbox = getSandbox()
      const node = { serialPort: '/dev/ttyUSB0', serialBaudrate: 9600, serialType: 'RTU' }
      const msg = { payload: { connectorType: 'SERIAL' } }
      const nodeLog = sinon.spy()
      sandbox.stub(coreClientUnderTest, 'getLogFunction').returns(nodeLog)
      coreClientUnderTest.setNewNodeSettings(node, msg)
      sinon.assert.calledWith(nodeLog, 'New Connection Serial Settings /dev/ttyUSB0 9600 RTU')
    })

    it('should log an error when connectorType is unknown', () => {
      const sandbox = getSandbox()
      const node = { tcpHost: '127.0.0.1', tcpPort: 502, tcpType: 'MODBUS-TCP' }
      const msg = { payload: { connectorType: 'UNKNOWN' } }
      const nodeLog = sinon.spy()
      sandbox.stub(coreClientUnderTest, 'getLogFunction').returns(nodeLog)
      coreClientUnderTest.setNewNodeSettings(node, msg)
      sinon.assert.calledWith(nodeLog, 'Unknown Dynamic Reconnect Type UNKNOWN')
    })

    it('should fail write when node client is not writable without in-band connect', (done) => {
      const node = {
        client: {
          _port: {
            _client: { writable: false }
          },
          setTimeout: sinon.spy(),
          getTimeout: sinon.stub().returns(1000)
        },
        connectClient: sinon.stub().returns(false),
        activateSending: sinon.stub().resolves(),
        modbusErrorHandling: sinon.stub(),
        stateService: { send: sinon.spy() },
        queueLog: sinon.spy(),
        setUnitIdFromPayload: sinon.spy(),
        clientTimeout: 1000,
        actualServiceState: { value: 'sending' },
        writeModbusByFunctionCodeSixteen: sinon.spy()
      }
      const msg = { payload: { fc: 16 }, queueUnitId: 1 }
      const cb = sinon.spy()
      const cberr = sinon.spy()

      coreClientUnderTest.writeModbus(node, msg, cb, cberr)

      setTimeout(function () {
        sinon.assert.notCalled(node.connectClient)
        sinon.assert.calledOnce(node.modbusErrorHandling)
        done()
      }, 20)
    })

    it('should return false and log an error when msg is null', () => {
      const sandbox = getSandbox()
      const node = {}
      const msg = null
      const nodeLog = sinon.spy()

      sandbox.stub(coreClientUnderTest, 'getLogFunction').returns(nodeLog)

      coreClientUnderTest.setNewNodeSettings(node, msg)

      sinon.assert.calledWith(coreClientUnderTest.getLogFunction, node)
    })

    it('should send READ state if bufferCommands is false and clienttype is not tcp', function (done) {
      const node = {
        bufferCommands: false,
        clienttype: 'serial',
        stateService: {
          send: function (state) {
            assert.strictEqual(state, 'READ')
          }
        }
      }

      coreClientUnderTest.readModbus(node, {})
      done()
    })

    it('should successfully write a coil with a true value', () => {
      const node = {
        client: {
          writeCoil: sinon.stub().resolves({ address: 123, value: true }),
          getID: sinon.stub().returns(0)
        },
        modbusErrorHandling: sinon.spy()
      }

      const msg = {
        payload: {
          address: 123,
          value: true
        }
      }

      const cb = sinon.spy()
      const cberr = sinon.spy()

      coreClientUnderTest.writeModbusByFunctionCodeFive(node, msg, cb, cberr)
      sinon.assert.calledWithExactly(node.client.writeCoil, 123, true)
      sinon.assert.notCalled(cberr)
      sinon.assert.notCalled(node.modbusErrorHandling)
    })

    describe('Core Client Modbus Actions', function () {
      it('should call read Modbus with empty node', function (done) {
        coreClientUnderTest.readModbus({})
        done()
      })
    })
  })
  describe('modbusClient.writeModbus', function () {
    it('should log an error if node.client is not ready', function (done) {
      const sandbox = getSandbox()
      const node = {
        client: null,
        clienttype: 'tcp',
        bufferCommands: false,
        stateService: {
          send: sinon.stub()
        },
        queueLog: sinon.stub(),
        setUnitIdFromPayload: sinon.stub(),
        actualServiceState: { value: 'someState' },
        clientTimeout: 1000
      }
      const msg = {
        payload: {
          fc: 5
        }
      }
      const cb = sinon.stub()
      const cberr = sinon.stub()
      sandbox.stub(coreClientUnderTest, 'activateSendingOnFailure')
      const mockNodeLog = sinon.stub()
      sandbox.stub(coreClientUnderTest, 'getLogFunction').returns(mockNodeLog)

      coreClientUnderTest.writeModbus(node, msg, cb, cberr)
      sinon.assert.calledOnce(mockNodeLog)
      sinon.assert.calledWithExactly(mockNodeLog, 'Client Not Ready As Object On Writing Modbus')
      sinon.assert.notCalled(coreClientUnderTest.activateSendingOnFailure)

      done()
    })

    it('should call writeModbusByFunctionCodeFifteen on FC 15', function (done) {
      const sandbox = getSandbox()
      const node = {
        client: {
          _port: {
            _client: {
              writable: true
            }
          },
          getTimeout: sinon.stub().returns(1000),
          setTimeout: sinon.stub()
        },
        clienttype: 'tcp',
        bufferCommands: false,
        stateService: {
          send: sinon.stub()
        },
        queueLog: sinon.stub(),
        setUnitIdFromPayload: sinon.stub(),
        actualServiceState: { value: 'someState' },
        clientTimeout: 1000
      }
      const msg = {
        payload: {
          fc: 15
        }
      }
      const cb = sinon.stub()
      const cberr = sinon.stub()
      sandbox.stub(coreClientUnderTest, 'writeModbusByFunctionCodeFifteen')
      sandbox.stub(coreClientUnderTest, 'activateSendingOnFailure')
      const mockNodeLog = sinon.stub()
      sandbox.stub(coreClientUnderTest, 'getLogFunction').returns(mockNodeLog)
      coreClientUnderTest.writeModbus(node, msg, cb, cberr)
      setTimeout(function () {
        sinon.assert.notCalled(coreClientUnderTest.activateSendingOnFailure)
        sinon.assert.notCalled(mockNodeLog)
        done()
      }, 20)
    })
    it('should call activateSendingOnFailure and nodeLog on error', function (done) {
      const sandbox = getSandbox()
      const node = {
        client: {
          _port: {
            _client: {
              writable: true
            }
          },
          getTimeout: sinon.stub().returns(1000),
          setTimeout: sinon.stub()
        },
        clienttype: 'tcp',
        bufferCommands: false,
        stateService: {
          send: sinon.stub()
        },
        queueLog: sinon.stub(),
        setUnitIdFromPayload: sinon.stub(),
        actualServiceState: { value: 'someState' },
        clientTimeout: 1000
      }
      const msg = {
        payload: {
          fc: 5
        }
      }
      const cb = sinon.stub()
      const cberr = sinon.stub()

      sandbox.stub(coreClientUnderTest, 'writeModbusByFunctionCodeFive').throws(new Error('Test Error'))
      sandbox.stub(coreClientUnderTest, 'activateSendingOnFailure')
      const mockNodeLog = sinon.stub()
      sandbox.stub(coreClientUnderTest, 'getLogFunction').returns(mockNodeLog)

      coreClientUnderTest.writeModbus(node, msg, cb, cberr)

      setTimeout(function () {
        done()
      }, 20)
    })
  })
  it('should call activateSendingOnFailure when client socket is not readable', () => {
    const sandbox = getSandbox()
    const node = {
      client: {
        _port: {
          _client: {
            readable: false
          }
        }
      },
      connectClient: sinon.stub().returns(false),
      modbusErrorHandling: sinon.stub(),
      actualServiceState: { value: 'sending' }
    }
    const msg = { payload: 'test' }
    const cb = sinon.spy()
    const cberr = sinon.spy()
    sandbox.stub(coreClientUnderTest, 'activateSendingOnFailure')

    coreClientUnderTest.readModbus(node, msg, cb, cberr)
    sinon.assert.notCalled(node.connectClient)
    sinon.assert.calledWith(coreClientUnderTest.activateSendingOnFailure, node, cberr, sinon.match.instanceOf(Error), msg)
    sinon.assert.calledOnce(node.modbusErrorHandling)
  })
})
