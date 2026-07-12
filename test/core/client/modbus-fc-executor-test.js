'use strict'

const assert = require('assert')
const sinon = require('sinon')
const fcExecutor = require('../../../src/core/client/modbus-fc-executor')
const legacyCore = require('../../../src/core/modbus-client-core')

describe('modbus-fc-executor', function () {
  afterEach(function () {
    sinon.restore()
  })

  describe('readModbusByFunctionCode', function () {
    it('should dispatch FC1–FC4 to legacy read handlers', function () {
      const cases = [
        [1, 'readModbusByFunctionCodeOne'],
        [2, 'readModbusByFunctionCodeTwo'],
        [3, 'readModbusByFunctionCodeThree'],
        [4, 'readModbusByFunctionCodeFour']
      ]

      cases.forEach(([fc, method]) => {
        const stub = sinon.stub(legacyCore, method)
        const node = {}
        const msg = { payload: { fc } }
        const cb = sinon.spy()
        const cberr = sinon.spy()

        fcExecutor.readModbusByFunctionCode(node, msg, cb, cberr)

        sinon.assert.calledOnce(stub)
        sinon.assert.calledWith(stub, node, msg, cb, cberr)
        stub.restore()
      })
    })

    it('should fail on unknown read FC', function () {
      sinon.stub(legacyCore, 'getLogFunction').returns(sinon.stub())
      const failure = sinon.stub(legacyCore, 'activateSendingOnFailure')
      const node = {}
      const msg = { payload: { fc: 99 } }

      fcExecutor.readModbusByFunctionCode(node, msg, sinon.spy(), sinon.spy())

      sinon.assert.calledOnce(failure)
      assert.match(failure.firstCall.args[2].message, /Function Code Unknown/)
    })
  })

  describe('writeModbusByFunctionCode', function () {
    it('should expose legacy writeModbus dispatcher', function () {
      assert.strictEqual(fcExecutor.writeModbusByFunctionCode, legacyCore.writeModbus)
    })

    it('should dispatch FC5/6/15/16 via writeModbus switch', function () {
      const clock = sinon.useFakeTimers()
      const node = {
        client: {
          isOpen: true,
          setTimeout: sinon.stub(),
          getTimeout: sinon.stub().returns(1000)
        },
        clienttype: 'tcp',
        bufferCommands: true,
        clientTimeout: 1000,
        setUnitIdFromPayload: sinon.stub(),
        queueLog: sinon.stub(),
        actualServiceState: { value: 'activated' }
      }

      const cases = [
        [5, 'writeModbusByFunctionCodeFive'],
        [6, 'writeModbusByFunctionCodeSix'],
        [15, 'writeModbusByFunctionCodeFifteen'],
        [16, 'writeModbusByFunctionCodeSixteen']
      ]

      cases.forEach(([fc, method]) => {
        const stub = sinon.stub(legacyCore, method)
        const msg = { payload: { fc, address: 0, quantity: 1, value: 1 } }

        fcExecutor.writeModbusByFunctionCode(node, msg, sinon.spy(), sinon.spy())
        clock.tick(5)

        sinon.assert.calledOnce(stub)
        stub.restore()
      })

      clock.restore()
    })
  })
})
