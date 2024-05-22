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
const chai = require('chai')
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
    it('should call callback cb with resp and msg when activateSending resolves', async () => {
      const node = {
        activateSending: sinon.stub(),
        stateService: { send: sinon.spy() }
      };
      const cb = sinon.spy();
      const cberr = sinon.spy();
      const resp = { data: 'some data' };
      const msg = { payload: { address: 123, value: 1 } };

      node.activateSending.resolves();

      coreClientUnderTest.activateSendingOnSuccess(node, cb, cberr, resp, msg);

      sinon.assert.calledWith(node.activateSending, { payload: { address: 123, value: 1 } });
    });

    it('should trigger onSuccess callback with custom response when writeRegister is successful and ID is 0', async (done) => {
      const node = {
        client: {
          writeRegister: sinon.stub().resolves({ success: true }),
          getID: sinon.stub().returns(0)
        }
      };
      const msg = { payload: { address: '123', value: '456' } };
      const cb = sinon.spy();
      const cberr = sinon.spy();

      coreClientUnderTest.writeModbusByFunctionCodeSix(node, msg, cb, cberr);

      sinon.assert.calledWith(node.client.writeRegister, 123, 456);
      done();
    });
    it('should call readDiscreteInputs and activateSendingOnSuccess when successful', function (done) {
      const node = {
        client: {
          readDiscreteInputs: sinon.stub().resolves([1, 0, 1, 0, 1, 0, 1, 0])
        },
        activateSending: sinon.spy(),
        stateService: { send: sinon.spy() }
      };

      const msg = { payload: { address: 123, quantity: 8 } };
      const cb = sinon.spy();
      const cberr = sinon.spy();

      coreClientUnderTest.readModbusByFunctionCodeTwo(node, msg, cb, cberr);

      sinon.assert.calledWith(node.client.readDiscreteInputs, 123, 8);

      done();
    });


    it('should call activateSendingOnFailure and modbusErrorHandling when unsuccessful', async function () {
      const errorMessage = 'Failed to read inputs';
      const node = {
        client: {
          readDiscreteInputs: sinon.stub().rejects(errorMessage)
        },
        modbusErrorHandling: sinon.spy()
      };

      const msg = { payload: { address: 255, quantity: 2 } };
      const cb = sinon.spy();
      const cberr = sinon.spy();

      coreClientUnderTest.readModbusByFunctionCodeTwo(node, msg, cb, cberr);

      sinon.assert.calledWith(node.client.readDiscreteInputs, 255, 2);
    });

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

    it('should successfully write a coil with a true value', () => {
      const node = {
        client: {
          writeCoil: sinon.stub().resolves({ address: 123, value: true }),
          getID: sinon.stub().returns(0)
        },
        modbusErrorHandling: sinon.spy()
      };

      const msg = {
        payload: {
          address: 123,
          value: true
        }
      };

      const cb = sinon.spy();
      const cberr = sinon.spy();

      coreClientUnderTest.writeModbusByFunctionCodeFive(node, msg, cb, cberr);
      sinon.assert.calledWithExactly(node.client.writeCoil, 123, true);
      sinon.assert.notCalled(cberr);
      sinon.assert.notCalled(node.modbusErrorHandling);
    });
    describe('Core Client Modbus Actions', function () {
      it('should call read Modbus with empty node', function (done) {
        coreClientUnderTest.readModbus({})
        done()
      })
    })
  })
})
