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

const coreQueueUnderTest = require('../../src/core/modbus-queue-core')

describe('Core IO Testing', function () {
  const sinon = require('sinon')
  const { expect } = require('chai')

  describe('Modbus Queue Core', function () {
    it('should throw an error when command on send is not valid', function () {
      const node = {
        bufferCommandList: new Map(),
        sendingAllowed: new Map(),
        serialSendingAllowed: true,
        queueLog: sinon.stub()
      }

      const unitId = 1
      node.bufferCommandList.set(unitId, [null])
      node.sendingAllowed.set(unitId, true)

      expect(() => coreQueueUnderTest.sendQueueDataToModbus(node, unitId)).to.throw('Command On Send Not Valid')
    })

    it('should log an error when sequential dequeue command fails', function (done) {
      const node = {
        actualServiceState: {
          value: 1
        },
        messageAllowedStates: [1]
      }

      const dequeueLogEntrySpy = sinon.spy(coreQueueUnderTest, 'dequeueLogEntry')

      coreQueueUnderTest.dequeueCommand(node)

      setTimeout(function () {
        expect(dequeueLogEntrySpy.calledWith(node, node.actualServiceState, 'dequeue command error Sequential dequeue command failed'))
        done()
      }, 0)
    })

    it('should throw an error for an invalid unitId', function (done) {
      const node = {
        bufferCommandList: new Map()
      }
      const invalidUnitId = 256

      try {
        coreQueueUnderTest.getQueueLengthByUnitId(node, invalidUnitId)
        done(new Error('Expected an error to be thrown'))
      } catch (err) {
        expect(err.message).to.deep.equal('(0-255) Got A Wrong Unit-Id: 256')
        done()
      }
    })

    it('should reject with an error for invalid unitId', function (done) {
      const node = {
        bufferCommandList: new Map(),
        unitSendingAllowed: [],
        queueLog: sinon.spy(),
        name: 'testNode',
        parallelUnitIdsAllowed: true,
        clienttype: 'tcp'
      }

      const msg = {}
      const callModbus = sinon.spy()
      const cb = sinon.spy()
      const cberr = sinon.spy()

      sinon.stub(coreQueueUnderTest, 'getUnitIdToQueue').returns(null)
      sinon.stub(coreQueueUnderTest, 'isValidUnitId').returns(false)

      coreQueueUnderTest.pushToQueueByUnitId(node, callModbus, msg, cb, cberr)
        .catch(error => {
          try {
            expect(error).to.be.an('error')
            expect(error.message).to.equal('UnitId null is not valid from msg or node')
            done()
          } catch (err) {
            done(err)
          }
        })
    })
  })

  it('should log a warning when sequential dequeue command is not possible for a unit', function () {
    const node = {
      bufferCommandList: new Map(),
      unitSendingAllowed: [1],
      sendingAllowed: new Map([[1, false]]),
      serialSendingAllowed: false,
      warn: sinon.spy(),
      queueLog: sinon.spy(),
      name: 'testNode'
    }

    coreQueueUnderTest.sequentialDequeueCommand(node)

    sinon.assert.calledWith(node.warn, 'testNode no serial sending allowed for Unit 1')
  })

  it('should reject with an error for undefined unitId', function (done) {
    const node = {
      bufferCommandList: new Map(),
      unitSendingAllowed: [],
      queueLog: sinon.spy()
    }

    coreQueueUnderTest.sequentialDequeueCommand(node)
      .catch(error => {
        expect(error.message).to.equal('UnitId undefined is not valid from dequeue of sending list')
        done()
      })
  })

  it('should reject with an error for null unitId', function (done) {
    const node = {
      bufferCommandList: new Map(),
      unitSendingAllowed: [],
      queueLog: sinon.spy(),
      UnitId: null
    }

    coreQueueUnderTest.sequentialDequeueCommand(node)
      .catch(error => {
        expect(error.message).to.equal('UnitId undefined is not valid from dequeue of sending list')
        done()
      })
  })

  describe('Task 4.7 — Istanbul marker reduction (catch/reject in pushToQueueByUnitId)', function () {
    before(function () {
      if (coreQueueUnderTest.getUnitIdToQueue && coreQueueUnderTest.getUnitIdToQueue.restore) {
        coreQueueUnderTest.getUnitIdToQueue.restore()
      }
      if (coreQueueUnderTest.isValidUnitId && coreQueueUnderTest.isValidUnitId.restore) {
        coreQueueUnderTest.isValidUnitId.restore()
      }
    })

    it('should reject with the thrown error when queueLog throws inside pushToQueueByUnitId', function (done) {
      const unitId = 1
      const node = {
        bufferCommandList: new Map([[unitId, []]]),
        sendingAllowed: new Map([[unitId, true]]),
        unitSendingAllowed: [],
        name: 'testNode',
        parallelUnitIdsAllowed: true,
        clienttype: 'tcp',
        maxQueueDepth: 100,
        queueLog: sinon.stub().throws(new Error('queueLog failure'))
      }
      const msg = { payload: { unitid: unitId } }

      coreQueueUnderTest.pushToQueueByUnitId(node, sinon.spy(), msg, sinon.spy(), sinon.spy())
        .catch(function (err) {
          expect(err.message).to.equal('queueLog failure')
          done()
        })
    })
  })

  describe('Phase 3 — Queue depth cap', function () {
    it('should reject message via cberr when queue depth exceeds maxQueueDepth', function (done) {
      const unitId = 1
      const node = {
        bufferCommandList: new Map([[unitId, [{}, {}]]]),
        sendingAllowed: new Map([[unitId, true]]),
        unitSendingAllowed: [],
        name: 'testNode',
        parallelUnitIdsAllowed: false,
        clienttype: 'tcp',
        maxQueueDepth: 2,
        queueLog: sinon.stub()
      }
      const msg = { payload: { unitid: unitId } }
      const cberr = sinon.spy()

      coreQueueUnderTest.pushToQueueByUnitId(node, sinon.spy(), msg, sinon.spy(), cberr)
        .then(function () { done(new Error('expected reject')) })
        .catch(function (err) {
          expect(err.message).to.match(/Queue full/)
          done()
        })
    })

    // Push-time dedupe: while a UnitId already has a pending drain slot, do not
    // append again. Re-arm after shift()+send is covered in modbus-client-test (#574).
    it('should not duplicate unitId entries in unitSendingAllowed', function (done) {
      const unitId = 3
      const node = {
        bufferCommandList: new Map([[unitId, []]]),
        sendingAllowed: new Map([[unitId, true]]),
        unitSendingAllowed: [unitId],
        name: 'testNode',
        parallelUnitIdsAllowed: false,
        clienttype: 'tcp',
        maxQueueDepth: 100,
        queueLog: sinon.stub()
      }
      const msg = { payload: { unitid: unitId } }

      coreQueueUnderTest.pushToQueueByUnitId(node, sinon.spy(), msg, sinon.spy(), sinon.spy())
        .then(function () {
          expect(node.unitSendingAllowed.filter(function (id) { return id === unitId }).length).to.equal(1)
          done()
        })
        .catch(done)
    })
  })

  describe('FR-Q-WIPE — fail pending on initQueue', function () {
    it('should call cberr for buffered commands before wipe', function () {
      const node = {
        bufferCommandList: new Map(),
        sendingAllowed: new Map(),
        unitSendingAllowed: [1],
        queueLog: sinon.stub()
      }
      for (let i = 0; i <= 255; i++) {
        node.bufferCommandList.set(i, [])
        node.sendingAllowed.set(i, true)
      }
      const cberr = sinon.spy()
      node.bufferCommandList.get(1).push({
        callModbus: sinon.spy(),
        msg: { payload: { unitid: 1 } },
        cb: sinon.spy(),
        cberr
      })
      coreQueueUnderTest.initQueue(node)
      expect(cberr.calledOnce).to.equal(true)
      expect(cberr.firstCall.args[0].message).to.equal(coreQueueUnderTest.QUEUE_CLEARED_ON_RECONNECT)
      expect(node.bufferCommandList.get(1).length).to.equal(0)
    })
  })
})
