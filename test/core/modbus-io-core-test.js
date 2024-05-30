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
const coreIOUnderTest = require('../../src/core/modbus-io-core')
const sinon = require('sinon')
const expect = require("chai").expect;

describe('Core IO Testing', function () {
  describe('Core IO', function () {

    describe('Core IO Simple', function () {
      it('should know type from first char of Word', function (done) {
        assert.strict.equal(coreIOUnderTest.getDataTypeFromFirstCharType('w'), 'Word')
        done()
      })

      it('should know type from first char of Double', function (done) {
        assert.strict.equal(coreIOUnderTest.getDataTypeFromFirstCharType('d'), 'Double')
        done()
      })

      it('should know type from first char of Real', function (done) {
        assert.strict.equal(coreIOUnderTest.getDataTypeFromFirstCharType('r'), 'Real')
        done()
      })

      it('should know type from first char of Float', function (done) {
        assert.strict.equal(coreIOUnderTest.getDataTypeFromFirstCharType('f'), 'Float')
        done()
      })

      it('should know type from first char of Integer', function (done) {
        assert.strict.equal(coreIOUnderTest.getDataTypeFromFirstCharType('i'), 'Integer')
        done()
      })

      it('should know type from first char of Long', function (done) {
        assert.strict.equal(coreIOUnderTest.getDataTypeFromFirstCharType('l'), 'Long')
        done()
      })

      it('should know type from first char of Boolean', function (done) {
        assert.strict.equal(coreIOUnderTest.getDataTypeFromFirstCharType('b'), 'Boolean')
        done()
      })

      it('should know type from first char of Default or Unknown', function (done) {
        assert.strict.equal(coreIOUnderTest.getDataTypeFromFirstCharType('u'), 'Unsigned Integer')
        done()
      })
      it('should build message with IO when useIOFile and lastUpdatedAt are set', function (done) {
        let node = {
          bufferMessageList: [], useIOFile: true,
          ioFile: { lastUpdatedAt: Date.now() },
          useIOForPayload: true,
          logIOActivities: true
        };
        let values = [1, 2, 3];
        const response = [4, 5, 6];
        const msg = { payload: { address: 1, fc: 3, quantity: 2 }, topic: 'test' };
        const allValueNames = coreIOUnderTest.nameValuesFromIOFile(node, msg, values, response, parseInt(msg.payload.address) || 0);

        const valueNames = coreIOUnderTest.filterValueNames(node, allValueNames, parseInt(msg.payload.fc) || 3, parseInt(msg.payload.address) || 0, parseInt(msg.payload.quantity) || 1, node.logIOActivities);

        const getOriginalMessageStub = sinon.stub(coreIOUnderTest.core, 'getOriginalMessage').returns({ modbusRequest: {} });
        const [origMsg, rawMsg] = coreIOUnderTest.buildMessageWithIO(node, values, response, msg);
        sinon.assert.calledWith(getOriginalMessageStub, node.bufferMessageList, msg);
        sinon.assert.match(origMsg.payload, valueNames);
        sinon.assert.match(origMsg.values, values);
        node.useIOForPayload = false
        values = [];
        coreIOUnderTest.buildMessageWithIO(node, values, response, msg);
        sinon.assert.calledWith(getOriginalMessageStub, node.bufferMessageList, msg);
        done()
      })
      it('should handle non-Buffer responseBuffer gracefully', () => {
        const valueNames = [{ dataType: 'int16', registerAddress: 0, bits: 16 }];
        const register = [0];
        let responseBuffer = { buffer: {} };
        const logging = false;
        const internalDebugSpy = sinon.spy(coreIOUnderTest, 'internalDebug');

        coreIOUnderTest.convertValuesByType(valueNames, register, responseBuffer, logging);

        expect(internalDebugSpy.calledWith('Response Buffer Is Not A Buffer')).to.be.false;

        internalDebugSpy.restore();
        responseBuffer = {};
        expect(internalDebugSpy.calledWith('Response Buffer Is Not A Buffer')).to.be.false;
        internalDebugSpy.restore();

      });


      it('should set item.value correctly for dataType "Integer" and bits "32"', (done) => {
        const item = { dataType: 'Integer', bits: '32' };
        const bufferOffset = 0;
        const responseBuffer = Buffer.from([0x12, 0x34, 0x56, 0x78]);
        const logging = false;

        coreIOUnderTest.getValueFromBufferByDataType(item, bufferOffset, responseBuffer, logging);

        expect(item.value).to.equal(0x12345678);
        done()
      });

      //needs to be fixed
      it('should set item.value correctly for dataType "Integer" and bits "64"', (done) => {
        const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

        const item = { dataType: 'Integer', bits: '64', registerAddress: 0 };

        // const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false);

        // expect(result.value).toBe(1);
        done()

      });

    })

    describe('Core IO File', function () {
      it('should ...', function (done) {
        done()
      })
    })

    describe('Core IO Mapping', function () {
      it('should do mapping of ...', function (done) {
        done()
      })
    })
  })
})
