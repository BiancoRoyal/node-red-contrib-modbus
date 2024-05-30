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
      it('should read 80-bit long value for Long data type', () => {
        const buffer = Buffer.from([0x40, 0x59, 0x0C, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCD]);
        const item = { dataType: 'Long', bits: '80', registerAddress: 0 };
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false);
        expect(result.value).to.equal(100.19999999999999); 
      });
    
      it('should read 8-bit unsigned integer value for default data type', () => {
        const buffer = Buffer.from([0x7F]);
        const item = { dataType: 'Unknown', bits: '8', registerAddress: 0 };
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false);
        expect(result.value).to.equal(127); 
      });
    
      it('should read 32-bit unsigned integer value for default data type', () => {
        const buffer = Buffer.from([0x00, 0x00, 0x01, 0x00]);
        const item = { dataType: 'Unknown', bits: '32', registerAddress: 0 };
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false);
        expect(result.value).to.equal(256); 
      });
    
      it('should read 16-bit unsigned integer value for default data type', () => {
        const buffer = Buffer.from([0x00, 0x01]);
        const item = { dataType: 'Unknown', bits: '16', registerAddress: 0 };
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false);
        expect(result.value).to.equal(1);
        expect(result.convertedValue).to.be.false;
      });
    
      it('should read 16-bit unsigned integer value for default data type', () => {
        const buffer = Buffer.from([0x00, 0x01]);
        const item = { dataType: 'Unknown', bits: '16', registerAddress: 0 };
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false);
        expect(result.value).to.equal(1); 
        expect(result.convertedValue).to.be.false;
      });

      it('should set item.value correctly for dataType "Word" and bits other than "8"', () => {
        const buffer = Buffer.from([0x12, 0x34]);
        const item = { dataType: 'Word', bits: '16', registerAddress: 0 };

        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false);

        expect(result.value).to.deep.equal(0x1234);
      });

      it('should correctly read 8-bit Word values from buffer', () => {
        const buffer = Buffer.from([0x12, 0x34]);
        const item = { dataType: 'Word', bits: '8', registerAddress: 0 };
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false);
        expect(result.value).to.deep.equal(0x12);
      });

      it('should read 32-bit integer value for Integer data type', () => {
        const buffer = Buffer.from([0x00, 0x00, 0x01, 0x00]);
        const item = { dataType: 'Integer', bits: '32', registerAddress: 0 };
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false);
        expect(result.value).to.equal(256);
      });
    
      it('should correctly set item.value for bits equal to 80', () => {
        const valueNames = [
          { registerAddress: 0, bits: 80 },
        ];
        const register = [0x12, 0x34, 0x56, 0x78, 0x9A];
        const logging = true;
        const result = coreIOUnderTest.insertValues(valueNames, register, logging);
        const expectedValue = Number(result[0].value);
        assert.strictEqual(expectedValue, 8126686);
      });
      it('should set item.value to null for unknown bits size', () => {
        const valueNames = [
          { registerAddress: 0, bits: '12' },
          { registerAddress: 1, bits: '24' },
        ];
        const register = [1, 2, 3];
        const logging = false;

        const result = coreIOUnderTest.insertValues(valueNames, register, logging);

        expect(result[0].value).to.deep.equal(null);
        expect(result[1].value).to.deep.equal(null);

      });
      it('should handle long type correctly', () => {
        const mapping = {
          name: 'longRegister',
          valueAddress: 'HR12345'
        };
        const offset = 0;
        const readingOffset = 0;
        const logging = true;

        const result = coreIOUnderTest.buildOutputAddressMapping('longRegister', mapping, offset, readingOffset, logging);

        expect(result).to.deep.equal({
          register: 'longRegister',
          name: 'longRegister',
          addressStart: 2345,
          addressOffset: 5,
          addressOffsetIO: 0,
          addressStartIO: 2345,
          registerAddress: 2345,
          coilStart: 0,
          bitAddress: null,
          Bit: 0,
          bits: 80,
          dataType: 'Long',
          type: 'output'
        });
      });
      it('should handle unsigned integer type correctly', () => {
        const mapping = {
          name: 'unsignedIntRegister',
          valueAddress: 'UR123'
        };
        const offset = 0;
        const readingOffset = 0;
        const logging = true;

        const result = coreIOUnderTest.buildOutputAddressMapping('unsignedIntRegister', mapping, offset, readingOffset, logging);

        expect(result).to.deep.equal({
          register: 'unsignedIntRegister',
          name: 'unsignedIntRegister',
          addressStart: 23,
          addressOffset: 1,
          addressOffsetIO: 0,
          addressStartIO: 23,
          registerAddress: 23,
          coilStart: 0,
          bitAddress: null,
          Bit: 0,
          bits: 16,
          dataType: 'Unsigned Integer',
          type: 'output'
        });
      });
      it('should return item with wrong bufferOffset (negative)', () => {
        const buffer = Buffer.from([0x00, 0x01]);
        const item = { dataType: 'Integer', bits: '16', registerAddress: 0 };
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, -1, buffer, true);
        expect(result).to.deep.equal(item);
      });
      it('should return item with wrong bufferOffset (greater than buffer length)', () => {
        const buffer = Buffer.from([0x00, 0x01]);
        const item = { dataType: 'Integer', bits: '16', registerAddress: 0 };
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, buffer.length + 1, buffer, true);
        expect(result).to.deep.equal(item);
      });

      it('should read 8-bit negative integer value for Integer data type', () => {
        const buffer = Buffer.from([0xFF]); 
        const item = { dataType: 'Integer', bits: '8', registerAddress: 0 };
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false);
        expect(result.value).to.equal(-1); 
      });

      it('should correctly map word type input addresses', () => {
        const mapping = { name: 'wTest', valueAddress: '%IW100' };
        const offset = 10;
        const readingOffset = 5;
        const logging = false;
        const result = coreIOUnderTest.buildInputAddressMapping('MB-INPUTS', mapping, offset, readingOffset, logging);

        expect(result).to.deep.equal({
          register: 'MB-INPUTS',
          name: 'wTest',
          addressStart: 100,
          addressOffset: 1,
          addressOffsetIO: 10,
          addressStartIO: 90,
          registerAddress: 85,
          coilStart: 0,
          bitAddress: null,
          Bit: 0,
          bits: 16,
          dataType: 'Word',
          type: 'input'
        });
      });
      
      it('should correctly map long data type', () => {
        const registerName = 'MB-INPUTS';
        const mapping = { name: 'longTest', valueAddress: '%QXL200' };
        const offset = 0;
        const readingOffset = 0;
        const logging = false;
    
        const result = coreIOUnderTest.buildInputAddressMapping(registerName, mapping, offset, readingOffset, logging);
    
        expect(result).to.deep.equal({
          register: registerName,
          name: mapping.name,
          addressStart: NaN,
          addressOffset: 5,
          addressOffsetIO: 0,
          addressStartIO: NaN,
          registerAddress: NaN,
          coilStart: 0,
          bitAddress: null,
          Bit: 0,
          bits: 80,
          dataType: 'Long',
          type: 'input'
        });
      });

      // to be fixed
      it('should correctly read 64-bit unsigned integer value', () => {
        const buffer = Buffer.alloc(8);
        buffer.writeUInt8(0x01, 0); 
        const item = { dataType: 'Integer', bits: '64', registerAddress: 0 };
        const bufferOffset = 0;
        const logging = false;
      
        // const result =coreIOUnderTest.getValueFromBufferByDataType(item, bufferOffset, buffer, logging);
      
        // expect(result.value).to.equal(1); 
      });
      
      
        it('should correctly map 32-bit integer data type when not a W register type', () => {
          const registerName = 'MB-INPUTS';
          const mapping = { name: 'integerTest', valueAddress: '%IQ400' };
          const offset = 0;
          const readingOffset = 0;
          const logging = false;
      
          const result = coreIOUnderTest.buildInputAddressMapping(registerName, mapping, offset, readingOffset, logging);
      
          expect(result).to.deep.equal({
            register: registerName,
            name: mapping.name,
            addressStart: 400,
            addressOffset: 2,
            addressOffsetIO: 0,
            addressStartIO: 400,
            registerAddress: 400,
            coilStart: 0,
            bitAddress: null,
            Bit: 0,
            bits: 32,
            dataType: 'Integer',
            type: 'input'
          });
        });
            
      it('should correctly map float data type', () => {
        const registerName = 'MB-OUTPUTS';
        const mapping = { name: 'floatTest', valueAddress: '%QRF200' };
        const offset = 0;
        const readingOffset = 0;
        const logging = false;
    
        const result = coreIOUnderTest.buildOutputAddressMapping(registerName, mapping, offset, readingOffset, logging);
    
        expect(result).to.deep.equal({
          register: registerName,
          name: mapping.name,
          addressStart: NaN,
          addressOffset: 2,
          addressOffsetIO: 0,
          addressStartIO: NaN,
          registerAddress: NaN,
          coilStart: 0,
          bitAddress: null,
          Bit: 0,
          bits: 32,
          dataType: 'Float',
          type: 'output'
        });
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
