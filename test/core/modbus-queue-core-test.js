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
const coreQueueUnderTest = require('../../src/core/modbus-queue-core')
const sinon = require('sinon')
const expect = require('chai').expect
describe('Core IO Testing', function () {
  const sinon = require('sinon');
  const { expect } = require('chai');

  describe('Modbus Queue Core', function () {
    it('should reject with an error for invalid unitId', function (done) {
      const node = {
        bufferCommandList: new Map(),
        unitSendingAllowed: [],
        queueLog: sinon.spy(),
        name: 'testNode',
        parallelUnitIdsAllowed: true,
        clienttype: 'tcp'
      };

      const msg = {};
      const callModbus = sinon.spy();
      const cb = sinon.spy();
      const cberr = sinon.spy();

      sinon.stub(coreQueueUnderTest, 'getUnitIdToQueue').returns(null);
      sinon.stub(coreQueueUnderTest, 'isValidUnitId').returns(false);

      coreQueueUnderTest.pushToQueueByUnitId(node, callModbus, msg, cb, cberr)
        .catch(error => {
          try {
            expect(error).to.be.an('error');
            expect(error.message).to.equal('UnitId null is not valid from msg or node');
            done();
          } catch (err) {
            done(err);
          }
        });
    });
  });

  it('should log a warning when sequential dequeue command is not possible for a unit', function () {
    const node = {
      bufferCommandList: new Map(),
      unitSendingAllowed: [1],
      sendingAllowed: new Map([[1, false]]),
      serialSendingAllowed: false,
      warn: sinon.spy(),
      queueLog: sinon.spy(),
      name: 'testNode'
    };

    coreQueueUnderTest.sequentialDequeueCommand(node);

    sinon.assert.calledWith(node.warn, 'testNode no serial sending allowed for Unit 1');
  });

  it('should reject with an error for invalid unitId', function () {
    const node = {
      bufferCommandList: new Map(),
      unitSendingAllowed: [],
      queueLog: sinon.spy(),
    };

    coreQueueUnderTest.sequentialDequeueCommand(node)
      .catch(error => {
        expect(error.message).to.equal('UnitId null is not valid from dequeue of sending list');
        done();
      });
  });

})
