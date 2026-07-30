'use strict'

const coreClient = require('../../src/core/modbus-client-core')
const sinon = require('sinon')
const { useFakeTimers } = require('../helper/test-helper-extensions')

async function flushPromises () {
  await new Promise(resolve => setImmediate(resolve))
}

describe('Core Client Coverage Uplift', function () {
  let sandbox
  const writeFiveImpl = coreClient.writeModbusByFunctionCodeFive
  const writeFifteenImpl = coreClient.writeModbusByFunctionCodeFifteen
  const writeSixteenImpl = coreClient.writeModbusByFunctionCodeSixteen

  beforeEach(function () {
    sandbox = sinon.createSandbox()
  })

  afterEach(function () {
    sandbox.restore()
  })

  function nodeWithReject (method) {
    return {
      client: {
        [method]: sandbox.stub().rejects(new Error('modbus reject')),
        getID: sandbox.stub().returns(0)
      },
      activateSending: sandbox.stub().resolves(),
      modbusErrorHandling: sandbox.stub(),
      stateService: { send: sandbox.stub() }
    }
  }

  it('should cb on synthetic FC5 response when writeCoil rejects and getID is 0', async function () {
    const node = nodeWithReject('writeCoil')
    const msg = { payload: { fc: 5, address: 10, value: true } }
    const cb = sandbox.spy()
    writeFiveImpl(node, msg, cb, sandbox.spy())
    await flushPromises()
    sandbox.assert.calledOnce(cb)
  })

  it('should cb on synthetic FC15 response when writeCoils rejects and getID is 0', async function () {
    const node = nodeWithReject('writeCoils')
    const msg = { payload: { fc: 15, address: 0, quantity: 1, value: [true] } }
    const cb = sandbox.spy()
    writeFifteenImpl(node, msg, cb, sandbox.spy())
    await flushPromises()
    sandbox.assert.calledOnce(cb)
  })

  it('should cb on synthetic FC16 response when writeRegisters rejects and getID is 0', async function () {
    const node = nodeWithReject('writeRegisters')
    const msg = { payload: { fc: 16, address: 0, quantity: 1, value: [42] } }
    const cb = sandbox.spy()
    writeSixteenImpl(node, msg, cb, sandbox.spy())
    await flushPromises()
    sandbox.assert.calledOnce(cb)
  })

  it('should cberr on FC5 when writeCoil rejects and getID is not 0', async function () {
    const node = {
      client: {
        writeCoil: sandbox.stub().rejects(new Error('modbus reject')),
        getID: sandbox.stub().returns(1)
      },
      activateSending: sandbox.stub().resolves(),
      modbusErrorHandling: sandbox.stub(),
      stateService: { send: sandbox.stub() }
    }
    const msg = { payload: { fc: 5, address: 10, value: true } }
    const cberr = sandbox.spy()
    writeFiveImpl(node, msg, sandbox.spy(), cberr)
    await flushPromises()
    sandbox.assert.calledOnce(cberr)
  })

  it('should fail readModbus via FSM recovery when port is not readable (no in-band connect)', function (done) {
    const readStub = sandbox.stub(coreClient, 'readModbusByFunctionCode')
    const node = {
      client: {
        _port: { _client: { readable: false } },
        setTimeout: sandbox.stub(),
        getTimeout: sandbox.stub().returns(1000)
      },
      connectClient: sandbox.stub().returns(true),
      activateSending: sandbox.stub().resolves(),
      modbusErrorHandling: sandbox.stub(),
      setUnitIdFromPayload: sandbox.stub(),
      bufferCommands: true,
      actualServiceState: { value: 'sending' },
      queueLog: sandbox.stub(),
      stateService: { send: sandbox.stub() }
    }
    const cberr = sandbox.spy()
    coreClient.readModbus(node, { payload: { fc: 3, address: 0, quantity: 1 }, queueUnitId: 1 }, sandbox.spy(), cberr)
    setTimeout(function () {
      sandbox.assert.notCalled(node.connectClient)
      sandbox.assert.notCalled(readStub)
      sandbox.assert.calledOnce(node.modbusErrorHandling)
      done()
    }, 20)
  })

  it('should fail writeModbus via FSM recovery when port is not writable (no in-band connect)', function (done) {
    const writeStub = sandbox.stub(coreClient, 'writeModbusByFunctionCodeSix')
    const node = {
      client: {
        _port: { _client: { writable: false } },
        setTimeout: sandbox.stub(),
        getTimeout: sandbox.stub().returns(1000)
      },
      connectClient: sandbox.stub().returns(true),
      activateSending: sandbox.stub().resolves(),
      modbusErrorHandling: sandbox.stub(),
      setUnitIdFromPayload: sandbox.stub(),
      bufferCommands: true,
      clienttype: 'tcp',
      actualServiceState: { value: 'sending' },
      queueLog: sandbox.stub(),
      stateService: { send: sandbox.stub() }
    }
    const cberr = sandbox.spy()
    coreClient.writeModbus(node, { payload: { fc: 6, address: 0, value: 1 }, queueUnitId: 1 }, sandbox.spy(), cberr)
    setTimeout(function () {
      sandbox.assert.notCalled(node.connectClient)
      sandbox.assert.notCalled(writeStub)
      sandbox.assert.calledOnce(node.modbusErrorHandling)
      done()
    }, 20)
  })

  it('should reject FC15 when value length does not match quantity', async function () {
    const node = {
      client: { writeCoils: sandbox.stub().resolves({}) },
      activateSending: sandbox.stub().resolves(),
      modbusErrorHandling: sandbox.stub(),
      stateService: { send: sandbox.stub() }
    }
    const msg = { payload: { fc: 15, address: 0, quantity: 2, value: [true] } }
    const cberr = sandbox.spy()
    writeFifteenImpl(node, msg, sandbox.spy(), cberr)
    await flushPromises()
    sandbox.assert.calledOnce(cberr)
  })

  it('should cb on synthetic FC6 response when writeRegister rejects and getID is 0', async function () {
    const writeSixImpl = coreClient.writeModbusByFunctionCodeSix
    const node = nodeWithReject('writeRegister')
    const msg = { payload: { fc: 6, address: 0, value: 42 } }
    const cb = sandbox.spy()
    writeSixImpl(node, msg, cb, sandbox.spy())
    await flushPromises()
    sandbox.assert.calledOnce(cb)
  })

  it('should cberr on FC6 when writeRegister rejects and getID is not 0', async function () {
    const writeSixImpl = coreClient.writeModbusByFunctionCodeSix
    const node = {
      client: {
        writeRegister: sandbox.stub().rejects(new Error('modbus reject')),
        getID: sandbox.stub().returns(1)
      },
      activateSending: sandbox.stub().resolves(),
      modbusErrorHandling: sandbox.stub(),
      stateService: { send: sandbox.stub() }
    }
    const msg = { payload: { fc: 6, address: 0, value: 42 } }
    const cberr = sandbox.spy()
    writeSixImpl(node, msg, sandbox.spy(), cberr)
    await flushPromises()
    sandbox.assert.calledOnce(cberr)
  })

  it('should reject FC16 when value length does not match quantity', async function () {
    const node = {
      client: { writeRegisters: sandbox.stub().resolves({}) },
      activateSending: sandbox.stub().resolves(),
      modbusErrorHandling: sandbox.stub(),
      stateService: { send: sandbox.stub() }
    }
    const msg = { payload: { fc: 16, address: 0, quantity: 2, value: [1] } }
    const cberr = sandbox.spy()
    writeSixteenImpl(node, msg, sandbox.spy(), cberr)
    await flushPromises()
    sandbox.assert.calledOnce(cberr)
  })

  it('should call readModbusByFunctionCode for FC3 when port is readable', function () {
    const clock = useFakeTimers(sandbox)
    const readStub = sandbox.stub(coreClient, 'readModbusByFunctionCode')
    const node = {
      client: {
        _port: { _client: { readable: true } },
        setTimeout: sandbox.stub(),
        getTimeout: sandbox.stub().returns(1000)
      },
      connectClient: sandbox.stub().returns(true),
      setUnitIdFromPayload: sandbox.stub(),
      bufferCommands: false,
      clienttype: 'serial',
      stateService: { send: sandbox.stub() },
      actualServiceState: { value: 'connected' },
      queueLog: sandbox.stub()
    }
    coreClient.readModbus(node, { payload: { fc: 3, address: 0, quantity: 1 } }, sandbox.spy(), sandbox.spy())
    clock.tick(1)
    sandbox.assert.calledOnce(readStub)
    sandbox.assert.calledWith(node.stateService.send, 'READ')
    clock.restore()
  })
})
