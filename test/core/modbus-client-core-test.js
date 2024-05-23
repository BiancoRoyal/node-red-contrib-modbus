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
  afterEach(() => {
    // Ensure we restore any stubs or spies after each test to prevent conflicts
    sinon.restore();
  });

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
    it('should call onFailure callback when writeRegister fails', async (done) => {
      const errorMessage = 'Failed to write register';
      const node = {
        client: {
          writeRegister: sinon.stub().rejects(errorMessage),
          getID: sinon.stub().returns(1),
          modbusErrorHandling: sinon.spy()
        }
      };
      const msg = { payload: { address: '123', value: '456' } };
      const cb = sinon.spy();
      const cberr = sinon.spy();

      coreClientUnderTest.writeModbusByFunctionCodeSix(node, msg, cb, cberr);

      sinon.assert.calledWith(node.client.writeRegister, 123, 456);
      done()
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

    it('should call activateSendingOnSuccess when sendCustomFc resolves', async () => {
      const node = { client: { sendCustomFc: sinon.stub().resolves('response') } };
      const msg = { payload: { unitid: 1, fc: 2, requestCard: {}, responseCard: {} } };
      const cb = sinon.spy();
      const cberr = sinon.spy();
      coreClientUnderTest.sendCustomFunctionCode(node, msg, cb, cberr);

      sinon.assert.calledWith(node.client.sendCustomFc, 1, 2, {}, {})

    })

    it('should call activateSendingOnFailure when sendCustomFc rejects', async () => {
      const errorMessage = 'Failed to send custom function code';
      const node = {
        client: {
          sendCustomFc: sinon.stub().rejects(new Error(errorMessage)),
        },
        modbusErrorHandling: sinon.spy()
      };
      const msg = { payload: { unitid: 2, fc: 4, requestCard: {}, responseCard: {} } };
      const cb = sinon.spy();
      const cberr = sinon.spy();

      coreClientUnderTest.sendCustomFunctionCode(node, msg, cb, cberr);

      sinon.assert.calledWith(node.client.sendCustomFc, 2, 4, {}, {});
    });

    it('should execute readModbus successfully when client is ready and readable', () => {
      const node = {
        client: {
          _port: {
            _client: {
              readable: true
            }
          },
          setTimeout: sinon.spy(),
          getTimeout: sinon.stub().returns(1000)
        },
        connectClient: sinon.stub().returns(true),
        setUnitIdFromPayload: sinon.spy(),
        bufferCommands: true,
        actualServiceState: { value: 'some_value' },
        queueLog: sinon.spy()
      };
      const msg = { payload: 'test', queueUnitId: 1 };
      const cb = sinon.spy();
      const cberr = sinon.spy();
      coreClientUnderTest.readModbusByFunctionCode = sinon.spy();

      coreClientUnderTest.readModbus(node, msg, cb, cberr);
    });
    it('should call activateSendingOnFailure when client connection fails', () => {
      const node = {
        client: {
          _port: {
            _client: {
              readable: false
            }
          }
        },
        connectClient: sinon.stub().returns(false),
      };
      const msg = { payload: 'test' };
      const cb = sinon.spy();
      const cberr = sinon.spy();
      coreClientUnderTest.activateSendingOnFailure = sinon.spy();

      coreClientUnderTest.readModbus(node, msg, cb, cberr);
    });

    it('should process function code 16 when node client is ready and writable', (done) => {
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
      };
      const msg = { payload: { fc: 16 } };
      const cb = sinon.spy();
      const cberr = sinon.spy();
      sinon.stub(coreClientUnderTest, 'writeModbusByFunctionCodeSixteen');

      coreClientUnderTest.writeModbus(node, msg, cb, cberr);
      done()
    });

    it('should reconnect and process write command when node client is not writable', (done) => {
      const node = {
        client: {
          _port: {
            _client: { writable: false }
          },
          setTimeout: sinon.spy(),
          getTimeout: sinon.stub().returns(1000)
        },
        connectClient: sinon.stub().returns(false),
        stateService: { send: sinon.spy() },
        queueLog: sinon.spy(),
        setUnitIdFromPayload: sinon.spy(),
        clientTimeout: 1000,
        writeModbusByFunctionCodeSixteen: sinon.spy()
      };
      const msg = { payload: { fc: 16 } };
      const cb = sinon.spy();
      const cberr = sinon.spy();
      coreClientUnderTest.activateSendingOnFailure = sinon.spy();
      coreClientUnderTest.writeModbusByFunctionCodeSixteen = sinon.spy();


      coreClientUnderTest.writeModbus(node, msg, cb, cberr);

      sinon.assert.calledWith(coreClientUnderTest.activateSendingOnFailure);
      done()

    });

    it('should set commandDelay if msg.payload.commandDelay exists', function (done) {
      const node = { commandDelay: 100 }
      const msg = { payload: { commandDelay: 200 } }

      coreClientUnderTest.setNewNodeOptionalSettings(node, msg)

      assert.strict.equal(node.commandDelay, 200)
      done()
    })
    it('should return false and log an error when msg is null', () => {
      const node = {};
      const msg = null;
      const mockLogFunction = sinon.spy();

      sinon.stub(coreClientUnderTest, 'getLogFunction').returns(mockLogFunction);

      coreClientUnderTest.setNewNodeSettings(node, msg);

      sinon.assert.calledWith(coreClientUnderTest.getLogFunction, node);
    });
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
    it('should correctly parse and set unitId when provided with a valid integer', () => {
      const node = { unit_id: 1, checkUnitId: sinon.spy() };
      const msg = { payload: { unitId: '123' } };
      const nodeLog = sinon.spy();
      sinon.stub(coreClientUnderTest, 'getLogFunction').returns(nodeLog);

      coreClientUnderTest.setNewNodeOptionalSettings(node, msg);

      sinon.assert.calledWith(coreClientUnderTest.getLogFunction, node);
      sinon.assert.calledWith(node.checkUnitId, 123, node.clienttype);
    });

    it('should call activateSendingOnSuccess when client ID is 0', async (done) => {
      const node = {
        client: {
          getID: sinon.stub().returns(0),
          writeCoils: sinon.stub().rejects(new Error('Write error'))
        },
        modbusErrorHandling: sinon.spy()
      };
      const msg = { payload: { address: 1, value: [true, false], quantity: 2 } };
      const cb = sinon.spy();
      const cberr = sinon.spy();

      coreClientUnderTest.writeModbusByFunctionCodeFifteen(node, msg, cb, cberr);
      done()

    })
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
