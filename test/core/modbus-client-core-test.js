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

const assert = require('assert')
const coreClientUnderTest = require('../../src/core/modbus-client-core')
const sinon = require('sinon')
describe('Core Client Testing', function () {
  describe('Core Client', function () {
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
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'tcp', unit_id: 0 }, { payload: { unitid: 1 } }), 1)
        done()
      })

      it('should check with success the TCP UnitId 0 from payload', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'tcp', unit_id: 1 }, { payload: { unitid: 0 } }), 0)
        done()
      })

      it('should check with success the TCP UnitId 1 from queueid', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'tcp', unit_id: 0 }, { payload: {}, queueUnitId: 1 }), 1)
        done()
      })

      it('should check with success the TCP UnitId 0 from queueid', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'tcp', unit_id: 1 }, { queueUnitId: 0 }), 0)
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
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'serial', unit_id: 0 }, { payload: { unitid: 1 } }), 1)
        done()
      })

      it('should check with success the Serial UnitId 0 from payload', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'serial', unit_id: 1 }, { payload: { unitid: 0 } }), 0)
        done()
      })

      it('should check with success the Serial UnitId 1 from queueid', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'serial', unit_id: 0 }, { payload: {}, queueUnitId: 1 }), 1)
        done()
      })

      it('should check with success the Serial UnitId 0 from queueid', function (done) {
        assert.strict.equal(coreClientUnderTest.getActualUnitId({ clienttype: 'serial', unit_id: 1 }, { queueUnitId: 0 }), 0)
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
    it('should send READ state if bufferCommands is false and clienttype is not tcp', function (done) {
      const node = {
        bufferCommands: false,
        clienttype: 'serial',
        stateService: {
          send: function (state) {
            assert.strictEqual(state, 'READ');
          }
        }
      };

      coreClientUnderTest.readModbus(node, {});
      done();

    });
    describe('setNewNodeOptionalSettings', function () {
      it('should set unit_id to msg.payload.unitId if it is a valid unitId', function () {
        const node = {
          unit_id: 1,
          clienttype: 'tcp',
          checkUnitId: sinon.stub().returns(true)
        };
        const msg = {
          payload: {
            unitId: 2
          }
        };

        coreClientUnderTest.setNewNodeOptionalSettings(node, msg);
        assert.strictEqual(node.unit_id, 2);
      });

      it('should set unit_id to node.unit_id if msg.payload.unitId is not a valid unitId', function () {
        const node = {
          unit_id: 1,
          clienttype: 'tcp',
          checkUnitId: sinon.stub().returns(false)
        };
        const msg = {
          payload: {
            unitId: 'invalid'
          }
        };
        coreClientUnderTest.setNewNodeOptionalSettings(node, msg);

        assert.strictEqual(node.unit_id, 1);
      });

      it('should set commandDelay to msg.payload.commandDelay if it is defined', function () {
        const node = {
          commandDelay: 100,
        };

        const msg = {
          payload: {
            commandDelay: 200
          }
        };

        coreClientUnderTest.setNewNodeOptionalSettings(node, msg);
        assert.strictEqual(node.commandDelay, 200);
      });

      it('should keep commandDelay unchanged if msg.payload.commandDelay is not defined', function () {
        const node = {
          commandDelay: 100,
        };
        const msg = {
          payload: {}
        };
        coreClientUnderTest.setNewNodeOptionalSettings(node, msg);
        assert.strictEqual(node.commandDelay, 100);
      });

    });

    describe('Core Client Modbus Actions', function () {
      it('should call read Modbus with empty node', function (done) {
        coreClientUnderTest.readModbus({})
        done()
      })
    })
  })
})
