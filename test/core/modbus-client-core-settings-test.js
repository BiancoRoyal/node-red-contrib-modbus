/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red-contrib-modbus - The BSD 3-Clause License
 **/
'use strict'

const assert = require('assert')
const coreClientUnderTest = require('../../src/core/modbus-client-core')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const { installCoreClientSandboxHooks } = require('./modbus-client-core-test-helper')

describe('Core Client Settings Testing', function () {
  const getSandbox = installCoreClientSandboxHooks(this)

  describe('setNewNodeOptionalSettings', function () {
    it('should set reconnectTimeout if provided in msg.payload', function () {
      const node = {
        reconnectTimeout: 1000,
        clienttype: 'someType',
        unit_id: 1,
        checkUnitId: function (unitId, clienttype) {
          return typeof unitId === 'number'
        }
      }
      const msg = {
        payload: {
          reconnectTimeout: 2000
        }
      }
      coreClientUnderTest.setNewNodeOptionalSettings(node, msg)

      expect(node.reconnectTimeout).to.equal(2000)
    })

    it('should set clientTimeout if msg.payload.clientTimeout exists', function (done) {
      const node = { clientTimeout: 1000 }
      const msg = { payload: { clientTimeout: 2000 } }

      coreClientUnderTest.setNewNodeOptionalSettings(node, msg)

      assert.strict.equal(node.clientTimeout, 2000)
      done()
    })
    it('should set commandDelay if msg.payload.commandDelay exists', function (done) {
      const node = { commandDelay: 100 }
      const msg = { payload: { commandDelay: 200 } }

      coreClientUnderTest.setNewNodeOptionalSettings(node, msg)

      assert.strict.equal(node.commandDelay, 200)
      done()
    })
    it('should correctly parse and set unitId when provided with a valid integer', () => {
      const sandbox = getSandbox()
      const node = { unit_id: 1, checkUnitId: sinon.spy() }
      const msg = { payload: { unitId: '123' } }
      const nodeLog = sinon.spy()

      sandbox.stub(coreClientUnderTest, 'getLogFunction').returns(nodeLog)

      coreClientUnderTest.setNewNodeOptionalSettings(node, msg)

      sinon.assert.calledWith(coreClientUnderTest.getLogFunction, node)
      sinon.assert.calledWith(node.checkUnitId, 123, node.clienttype)
    })

    it('should set unit_id to msg.payload.unitId if it is a valid unitId', function () {
      const node = {
        unit_id: 1,
        clienttype: 'tcp',
        checkUnitId: sinon.stub().returns(true)
      }
      const msg = {
        payload: {
          unitId: 2
        }
      }

      coreClientUnderTest.setNewNodeOptionalSettings(node, msg)
      assert.strictEqual(node.unit_id, 2)
    })
    it('should set unit_id to node.unit_id if msg.payload.unitId is not a valid unitId', function () {
      const node = {
        unit_id: 1,
        clienttype: 'tcp',
        checkUnitId: sinon.stub().returns(false)
      }
      const msg = {
        payload: {
          unitId: 'invalid'
        }
      }
      coreClientUnderTest.setNewNodeOptionalSettings(node, msg)

      assert.strictEqual(node.unit_id, 1)
    })

    it('should set commandDelay to msg.payload.commandDelay if it is defined', function () {
      const node = {
        commandDelay: 100
      }

      const msg = {
        payload: {
          commandDelay: 200
        }
      }

      coreClientUnderTest.setNewNodeOptionalSettings(node, msg)
      assert.strictEqual(node.commandDelay, 200)
    })

    it('should keep commandDelay unchanged if msg.payload.commandDelay is not defined', function () {
      const node = {
        commandDelay: 100
      }
      const msg = {
        payload: {}
      }
      coreClientUnderTest.setNewNodeOptionalSettings(node, msg)
      assert.strictEqual(node.commandDelay, 100)
    })
  })
  describe('setNewSerialNodeSettings', function () {
    it('should parse serialAsciiResponseStartDelimiter from hex string if provided', function () {
      const node = {
        serialAsciiResponseStartDelimiter: 0x00,
        clienttype: 'someType'
      }
      const msg = {
        payload: {
          serialAsciiResponseStartDelimiter: '1A'
        }
      }
      coreClientUnderTest.setNewSerialNodeSettings(node, msg)

      expect(node.serialAsciiResponseStartDelimiter).to.equal(0x1A)
    })
    it('should set serialConnectionDelay if provided in msg.payload', function () {
      const node = {
        serialConnectionDelay: 1000,
        clienttype: 'someType'
      }
      const msg = {
        payload: {
          serialConnectionDelay: 2000
        }
      }

      coreClientUnderTest.setNewSerialNodeSettings(node, msg)
      expect(node.serialConnectionDelay).to.equal(2000)
    })
  })
  describe('Phase 3 — Spec validation and API', function () {
    let sandbox
    const writeFiveImpl = coreClientUnderTest.writeModbusByFunctionCodeFive
    const validateImpl = coreClientUnderTest.validateAddressAndQuantity

    beforeEach(function () {
      sandbox = sinon.createSandbox()
    })

    afterEach(function () {
      sandbox.restore()
    })

    it('should call cberr when address is 70000 (out of range)', function () {
      const msg = { payload: { fc: 3, address: 70000, quantity: 1 } }
      const cberr = sinon.spy()
      validateImpl(msg, 3, cberr)
      sinon.assert.calledOnce(cberr)
      sinon.assert.match(cberr.firstCall.args[0].message, /address out of range/)
    })

    it('should unlock via activateSendingOnFailure when node is passed and address is out of range', function (done) {
      const msg = { payload: { fc: 3, address: 70000, quantity: 1 }, queueUnitId: 1 }
      const cberr = sinon.spy()
      const node = {
        activateSending: sandbox.stub().resolves(),
        stateService: { send: sandbox.spy() },
        actualServiceState: { value: 'sending' }
      }
      validateImpl(msg, 3, cberr, node)
      setTimeout(function () {
        sinon.assert.calledOnce(node.activateSending)
        sinon.assert.calledOnce(cberr)
        sinon.assert.calledWith(node.stateService.send, 'ACTIVATE')
        done()
      }, 20)
    })

    it('should call cberr when address is -1', function () {
      const msg = { payload: { fc: 1, address: -1, quantity: 1 } }
      const cberr = sinon.spy()
      validateImpl(msg, 1, cberr)
      sinon.assert.calledOnce(cberr)
    })

    it('should call cberr when FC3 quantity is 200 (exceeds 125)', function () {
      const msg = { payload: { fc: 3, address: 0, quantity: 200 } }
      const cberr = sinon.spy()
      validateImpl(msg, 3, cberr)
      sinon.assert.calledOnce(cberr)
      sinon.assert.match(cberr.firstCall.args[0].message, /quantity out of range/)
    })

    it('should call cberr when FC1 quantity is 0', function () {
      const msg = { payload: { fc: 1, address: 0, quantity: 0 } }
      const cberr = sinon.spy()
      validateImpl(msg, 1, cberr)
      sinon.assert.calledOnce(cberr)
    })

    it('should call cberr when FC1 quantity is 2001', function () {
      const msg = { payload: { fc: 1, address: 0, quantity: 2001 } }
      const cberr = sinon.spy()
      validateImpl(msg, 1, cberr)
      sinon.assert.calledOnce(cberr)
    })

    it('should call cberr when FC16 quantity is 0', function () {
      const msg = { payload: { fc: 16, address: 0, quantity: 0, value: [] } }
      const cberr = sinon.spy()
      validateImpl(msg, 16, cberr)
      sinon.assert.calledOnce(cberr)
    })

    it('should coerce non-boolean truthy value to true for FC5', function (done) {
      const node = {
        client: { writeCoil: sandbox.stub().resolves({}) },
        activateSending: sandbox.stub().resolves(),
        modbusErrorHandling: sandbox.stub(),
        stateService: { send: sandbox.stub() }
      }
      const msg = { payload: { fc: 5, address: 0, value: 1 } }
      writeFiveImpl(node, msg, sinon.spy(), sinon.spy())
      sinon.assert.calledWith(node.client.writeCoil, 0, true)
      done()
    })

    it('should coerce 0 to false for FC5', function (done) {
      const node = {
        client: { writeCoil: sandbox.stub().resolves({}) },
        activateSending: sandbox.stub().resolves(),
        modbusErrorHandling: sandbox.stub(),
        stateService: { send: sandbox.stub() }
      }
      const msg = { payload: { fc: 5, address: 0, value: 0 } }
      writeFiveImpl(node, msg, sinon.spy(), sinon.spy())
      sinon.assert.calledWith(node.client.writeCoil, 0, false)
      done()
    })

    it('should coerce "0" string to false for FC5', function (done) {
      const node = {
        client: { writeCoil: sandbox.stub().resolves({}) },
        activateSending: sandbox.stub().resolves(),
        modbusErrorHandling: sandbox.stub(),
        stateService: { send: sandbox.stub() }
      }
      const msg = { payload: { fc: 5, address: 0, value: '0' } }
      writeFiveImpl(node, msg, sinon.spy(), sinon.spy())
      sinon.assert.calledWith(node.client.writeCoil, 0, false)
      done()
    })

    it('should ignore __proto__ in dynamic reconnect payload', function () {
      const node = { clienttype: 'tcp', tcpHost: '127.0.0.1', tcpPort: 502, tcpType: 'DEFAULT', unit_id: 1, checkUnitId: sinon.stub().returns(true) }
      const payload = { connectorType: 'TCP' }
      Object.defineProperty(payload, '__proto__', { value: { polluted: true }, enumerable: true })
      const msg = { payload }
      const result = coreClientUnderTest.setNewNodeSettings(node, msg)
      expect(result).to.equal(false)
    })

    it('should ignore constructor in dynamic reconnect payload', function () {
      const node = { clienttype: 'tcp', tcpHost: '127.0.0.1', tcpPort: 502, tcpType: 'DEFAULT', unit_id: 1, checkUnitId: sinon.stub().returns(true) }
      const msg = { payload: { connectorType: 'TCP', constructor: {} } }
      const result = coreClientUnderTest.setNewNodeSettings(node, msg)
      expect(result).to.equal(false)
    })

    it('should resolve unitId from msg.payload.unitId when integer', function () {
      const node = { unit_id: 5 }
      const msg = { payload: { unitId: 0 } }
      expect(coreClientUnderTest.getActualUnitId(node, msg)).to.equal(0)
    })

    it('should prefer unitId over unitid when both present', function () {
      const node = { unit_id: 5 }
      const msg = { payload: { unitId: 2, unitid: 7 } }
      expect(coreClientUnderTest.getActualUnitId(node, msg)).to.equal(2)
    })
  })
})
