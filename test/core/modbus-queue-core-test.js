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
