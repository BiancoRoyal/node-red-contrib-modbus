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
const helper = require('node-red-node-test-helper')
const expect = require('chai').expect

describe('Core IO Testing', function () {
  let sinonStub, sinonDebugStub

  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      done()
    }).catch(function () {
      done()
    }).finally(function () {
      if (sinonStub) {
        sinonStub.restore()
        sinonDebugStub.restore()
      }
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('Core IO', function () {
    describe('Core IO Simple', function () {
      it('should correctly insert value for 64-bit items', () => {
        const valueNames = [
          {
            registerAddress: 0,
            bits: 64,
            value: null
          }
        ]
        const register = [1, 2, 3, 4]
        const logging = true

        const ioCoreMock = {
          internalDebug: sinon.stub()
        }

        sinonStub = sinon.stub(coreIOUnderTest, 'core').value(ioCoreMock)

        /* eslint-disable no-useless-call */
        const result = coreIOUnderTest.insertValues.call(coreIOUnderTest, valueNames, register, logging)

        const expectedValue = (register[3] << 48) | (register[2] << 32) | (register[1] << 16) | register[0]
        assert.strictEqual(result[0].value, expectedValue)
      })

      it('should correctly insert value for 32-bit items', () => {
        const valueNames = [
          {
            registerAddress: 1,
            bits: 32,
            value: null
          }
        ]
        const register = [0, 1, 2]
        const logging = true

        const ioCoreMock = {
          internalDebug: sinon.stub()
        }

        sinonStub = sinon.stub(coreIOUnderTest, 'core').value(ioCoreMock)

        /* eslint-disable no-useless-call */
        const result = coreIOUnderTest.insertValues.call(coreIOUnderTest, valueNames, register, logging)

        assert.strictEqual(result[0].value, (register[2] << 16) | register[1])

        assert.strictEqual(ioCoreMock.internalDebug.callCount, 0)
      })

      it('should handle double data type correctly', () => {
        const registerName = 'testRegister'
        const mapping = {
          name: 'dTest',
          valueAddress: '%QD100'
        }
        const offset = 0
        const readingOffset = 0
        const logging = true

        const ioCoreMock = {
          internalDebug: sinon.stub(),
          getDataTypeFromFirstCharType: sinon.stub().returns('double')
        }

        sinonStub = sinon.stub(coreIOUnderTest, 'core').value(ioCoreMock)

        /* eslint-disable no-useless-call */
        const result = coreIOUnderTest.buildOutputAddressMapping.call(coreIOUnderTest, registerName, mapping, offset, readingOffset, logging)

        assert.strictEqual(result.addressStart, 100)
        assert.strictEqual(result.addressOffset, 4)
        assert.strictEqual(result.bits, 64)
        assert.strictEqual(result.dataType, 'Double')
        assert.strictEqual(result.type, 'output')

        assert.strictEqual(ioCoreMock.internalDebug.callCount, 0)
      })

      it('should modify original and raw messages when useIOFile is true and ioFile.lastUpdatedAt is defined', () => {
        const node = {
          useIOFile: true,
          ioFile: {
            lastUpdatedAt: new Date()
          },
          useIOForPayload: false,
          logIOActivities: true
        }
        const msg = {
          payload: {
            address: '0',
            fc: '3',
            quantity: '1'
          },
          topic: 'testTopic',
          responseBuffer: Buffer.from([0x01, 0x02])
        }

        const coreMock = {
          getOriginalMessage: sinon.stub().returns({}),
          nameValuesFromIOFile: sinon.stub().returns([]),
          filterValueNames: sinon.stub().returns([])
        }

        sinonStub = sinon.stub(coreIOUnderTest, 'core').value(coreMock)

        /* eslint-disable no-useless-call */
        const result = coreIOUnderTest.buildMessageWithIO.call(coreIOUnderTest, node, [], msg.responseBuffer, msg)

        assert.strictEqual(result.length, 2)
        assert.deepStrictEqual(result[0].topic, 'testTopic')
        assert.deepStrictEqual(result[0].responseBuffer, msg.responseBuffer)
      })

      it('should correctly handle word and unsigned integer type mappings', () => {
        const registerNameWord = 'TestRegisterWord'
        const mappingWord = {
          name: 'w9876',
          valueAddress: 'W9876'
        }
        const offsetWord = 0
        const readingOffsetWord = 0
        const loggingWord = true

        const resultWord = coreIOUnderTest.buildInputAddressMapping(registerNameWord, mappingWord, offsetWord, readingOffsetWord, loggingWord)

        expect(resultWord.bits).to.equal(16)
        expect(resultWord.addressStart).to.equal(76)
        expect(resultWord.addressOffset).to.equal(1)
        expect(resultWord.dataType).to.equal('Word')
        expect(resultWord.type).to.equal('input')
        const registerNameUInt = 'TestRegisterUInt'
        const mappingUInt = {
          name: 'u54321',
          valueAddress: 'U54321'
        }
        const offsetUInt = 0
        const readingOffsetUInt = 0
        const loggingUInt = true

        const resultUInt = coreIOUnderTest.buildInputAddressMapping(registerNameUInt, mappingUInt, offsetUInt, readingOffsetUInt, loggingUInt)

        expect(resultUInt.bits).to.equal(16)
        expect(resultUInt.addressStart).to.equal(321)
        expect(resultUInt.addressOffset).to.equal(1)
        expect(resultUInt.dataType).to.equal('Unsigned Integer')
        expect(resultUInt.type).to.equal('input')
      })

      it('should correctly handle double type mapping', () => {
        const registerName = 'TestRegister'
        const mapping = {
          name: 'd54321',
          valueAddress: 'D54321'
        }
        const offset = 0
        const readingOffset = 0
        const logging = true

        const result = coreIOUnderTest.buildInputAddressMapping(registerName, mapping, offset, readingOffset, logging)

        expect(result.bits).to.equal(64)
        expect(result.addressStart).to.equal(321)
        expect(result.addressOffset).to.equal(4)
        expect(result.dataType).to.equal('Double')
        expect(result.type).to.equal('input')
      })

      it('should correctly handle float type mapping', () => {
        const registerName = 'TestRegister'
        const mapping = {
          name: 'f12345',
          valueAddress: 'F12345'
        }
        const offset = 0
        const readingOffset = 0
        const logging = true

        const result = coreIOUnderTest.buildInputAddressMapping(registerName, mapping, offset, readingOffset, logging)

        expect(result.bits).to.equal(32)
        expect(result.addressStart).to.equal(345)
        expect(result.addressOffset).to.equal(2)
        expect(result.type).to.equal('input')
      })

      it('should log unknown input type when type is not recognized', () => {
        const registerName = 'TestRegister'
        const mapping = {
          name: 'x12345', // Start with 'x', which is not recognized
          valueAddress: 'X12345'
        }
        const offset = 0
        const readingOffset = 0
        const logging = true
        const internalDebugSpy = sinon.spy(coreIOUnderTest, 'internalDebug')

        const result = coreIOUnderTest.buildInputAddressMapping(registerName, mapping, offset, readingOffset, logging)

        expect(internalDebugSpy.calledOnceWithExactly('unknown input type x')).to.equal(true)

        internalDebugSpy.restore()

        assert.strictEqual(result.error, 'variable name does not match input mapping')
      })

      it('should correctly convert values when responseBuffer is valid', () => {
        const valueNames = [
          { dataType: 'Integer', bits: '32', registerAddress: 0 },
          { dataType: 'Float', bits: '32', registerAddress: 1 }
        ]
        const register = [0x12, 0x34, 0x56, 0x78, 0x41, 0x23, 0x45, 0x67]
        const responseBuffer = { buffer: Buffer.from(register) }
        const logging = false

        const result = coreIOUnderTest.convertValuesByType(valueNames, register, responseBuffer, logging)

        expect(result[0].value).to.equal(0x12345678)
        expect(result[1].value).to.equal(68239660941312)
      })

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

      it('should handle non-Buffer responseBuffer gracefully', () => {
        const valueNames = [{ dataType: 'int16', registerAddress: 0, bits: 16 }]
        const register = [0]
        const responseBuffer = { buffer: {} }
        const logging = false
        const internalDebugSpy = sinon.spy(coreIOUnderTest, 'internalDebug')

        coreIOUnderTest.convertValuesByType(valueNames, register, responseBuffer, logging)

        expect(internalDebugSpy.calledWith('Response Buffer Is Not A Buffer')).to.equal(false)

        internalDebugSpy.restore()
        expect(internalDebugSpy.calledWith('Response Buffer Is Not A Buffer')).to.equal(false)
        internalDebugSpy.restore()
      })

      it('should set item.value correctly for dataType "Integer" and bits "32"', (done) => {
        const item = { dataType: 'Integer', bits: '32' }
        const bufferOffset = 0
        const responseBuffer = Buffer.from([0x12, 0x34, 0x56, 0x78])
        const logging = false

        coreIOUnderTest.getValueFromBufferByDataType(item, bufferOffset, responseBuffer, logging)

        expect(item.value).to.equal(0x12345678)
        done()
      })

      it('should set item.value correctly for dataType "Integer" and bits "64"', (done) => {
        const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01])
        const item = { dataType: 'Integer', bits: '64', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)
        expect(result.value).to.equal(1)
        done()
      })

      it('should set item.value correctly for dataType "Integer" and bits "64" full value', (done) => {
        const buffer = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF])
        const item = { dataType: 'Integer', bits: '64', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)
        expect(result.value).to.equal(18446744073709552000)
        done()
      })

      it('should read 80-bit long value for Long data type', () => {
        const buffer = Buffer.from([0x40, 0x59, 0x0C, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCD])
        const item = { dataType: 'Long', bits: '80', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)
        expect(result.value).to.equal(100.19999999999999)
      })

      it('should read 8-bit unsigned integer value for default data type', () => {
        const buffer = Buffer.from([0x7F])
        const item = { dataType: 'Unknown', bits: '8', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)
        expect(result.value).to.equal(127)
      })

      it('should read 32-bit unsigned integer value for default data type', () => {
        const buffer = Buffer.from([0x00, 0x00, 0x01, 0x00])
        const item = { dataType: 'Unknown', bits: '32', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)
        expect(result.value).to.equal(256)
      })

      it('should read 16-bit unsigned integer value for default data type', () => {
        const buffer = Buffer.from([0x00, 0x01])
        const item = { dataType: 'Unknown', bits: '16', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)
        expect(result.value).to.equal(1)
        expect(result.convertedValue).to.equal(false)
      })

      it('should read 16-bit unsigned integer value for default data type', () => {
        const buffer = Buffer.from([0x00, 0x01])
        const item = { dataType: 'Unknown', bits: '16', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)
        expect(result.value).to.equal(1)
        expect(result.convertedValue).to.equal(false)
      })

      it('should set item.value correctly for dataType "Word" and bits other than "8"', () => {
        const buffer = Buffer.from([0x12, 0x34])
        const item = { dataType: 'Word', bits: '16', registerAddress: 0 }

        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)

        expect(result.value).to.deep.equal(0x1234)
      })

      it('should correctly read 8-bit Word values from buffer', () => {
        const buffer = Buffer.from([0x12, 0x34])
        const item = { dataType: 'Word', bits: '8', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)
        expect(result.value).to.deep.equal(0x12)
      })

      it('should read 32-bit integer value for Integer data type', () => {
        const buffer = Buffer.from([0x00, 0x00, 0x01, 0x00])
        const item = { dataType: 'Integer', bits: '32', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)
        expect(result.value).to.equal(256)
      })

      it('should correctly set item.value for bits equal to 80', () => {
        const valueNames = [
          { registerAddress: 0, bits: 80 }
        ]
        const register = [0x12, 0x34, 0x56, 0x78, 0x9A]
        const logging = true
        const result = coreIOUnderTest.insertValues(valueNames, register, logging)
        const expectedValue = Number(result[0].value)
        assert.strictEqual(expectedValue, 8126686)
      })

      it('should set item.value to null for unknown bits size', () => {
        const valueNames = [
          { registerAddress: 0, bits: '12' },
          { registerAddress: 1, bits: '24' }
        ]
        const register = [1, 2, 3]
        const logging = false

        const result = coreIOUnderTest.insertValues(valueNames, register, logging)
        expect(result[0].value).to.deep.equal(null)
        expect(result[1].value).to.deep.equal(null)
      })

      it('should handle long type correctly', () => {
        const mapping = {
          name: 'longRegister',
          valueAddress: 'HR12345'
        }
        const offset = 0
        const readingOffset = 0
        const logging = true

        const result = coreIOUnderTest.buildOutputAddressMapping('longRegister', mapping, offset, readingOffset, logging)

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
        })
      })

      it('should handle unsigned integer type correctly', () => {
        const mapping = {
          name: 'unsignedIntRegister',
          valueAddress: 'UR123'
        }
        const offset = 0
        const readingOffset = 0
        const logging = true

        const result = coreIOUnderTest.buildOutputAddressMapping('unsignedIntRegister', mapping, offset, readingOffset, logging)

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
        })
      })

      it('should return item with wrong bufferOffset (negative)', () => {
        const buffer = Buffer.from([0x00, 0x01])
        const item = { dataType: 'Integer', bits: '16', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, -1, buffer, true)
        expect(result).to.deep.equal(item)
      })

      it('should return item with wrong bufferOffset (greater than buffer length)', () => {
        const buffer = Buffer.from([0x00, 0x01])
        const item = { dataType: 'Integer', bits: '16', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, buffer.length + 1, buffer, true)
        expect(result).to.deep.equal(item)
      })

      it('should read 8-bit negative integer value for Integer data type', () => {
        const buffer = Buffer.from([0xFF])
        const item = { dataType: 'Integer', bits: '8', registerAddress: 0 }
        const result = coreIOUnderTest.getValueFromBufferByDataType(item, 0, buffer, false)
        expect(result.value).to.equal(-1)
      })

      it('should correctly map word type input addresses', () => {
        const mapping = { name: 'wTest', valueAddress: '%IW100' }
        const offset = 10
        const readingOffset = 5
        const logging = false
        const result = coreIOUnderTest.buildInputAddressMapping('MB-INPUTS', mapping, offset, readingOffset, logging)

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
        })
      })

      it('should correctly map long data type', () => {
        const registerName = 'MB-INPUTS'
        const mapping = { name: 'longTest', valueAddress: '%QXL200' }
        const offset = 0
        const readingOffset = 0
        const logging = false

        const result = coreIOUnderTest.buildInputAddressMapping(registerName, mapping, offset, readingOffset, logging)

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
        })
      })
      it('should correctly read 64-bit unsigned integer value as BE number 1', () => {
        const buffer = Buffer.alloc(8)
        buffer.writeUInt8(0x01, 7)
        const item = { dataType: 'Integer', bits: '64', registerAddress: 0 }
        const bufferOffset = 0
        const logging = false

        const result = coreIOUnderTest.getValueFromBufferByDataType(item, bufferOffset, buffer, logging)
        expect(result.value).to.equal(1)
      })

      it('should correctly map 32-bit integer data type when not a W register type', () => {
        const registerName = 'MB-INPUTS'
        const mapping = { name: 'integerTest', valueAddress: '%IQ400' }
        const offset = 0
        const readingOffset = 0
        const logging = false

        const result = coreIOUnderTest.buildInputAddressMapping(registerName, mapping, offset, readingOffset, logging)

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
        })
      })

      it('should correctly map float data type', () => {
        const registerName = 'MB-OUTPUTS'
        const mapping = { name: 'floatTest', valueAddress: '%QRF200' }
        const offset = 0
        const readingOffset = 0
        const logging = false

        const result = coreIOUnderTest.buildOutputAddressMapping(registerName, mapping, offset, readingOffset, logging)

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
        })
      })
      it('should correctly handle bit - boolean type when registerType is X', () => {
        const mapping = { name: 'bitTest', valueAddress: '%QX400.3' }
        const offset = 0
        const readingOffset = 0
        const logging = true

        const result = coreIOUnderTest.buildOutputAddressMapping('MB-OUTPUTS', mapping, offset, readingOffset, logging)

        expect(result).to.deep.equal({
          register: 'MB-OUTPUTS',
          name: 'bitTest',
          addressStart: 200,
          addressOffset: 1,
          addressOffsetIO: 0,
          addressStartIO: 200,
          registerAddress: 200,
          coilStart: 3203,
          bitAddress: ['400', '3'],
          Bit: 3203,
          bits: 1,
          type: 'output',
          dataType: 'Boolean'
        })

        // expect(internalDebugStub.called).to.equal(false)
      })

      it('should correctly map integer type with 16 bits when registerType is W', () => {
        const mapping = { name: 'intTest', valueAddress: '%QIW ' }
        const offset = 0
        const readingOffset = 0
        const logging = false

        const result = coreIOUnderTest.buildOutputAddressMapping('MB-OUTPUTS', mapping, offset, readingOffset, logging)

        expect(result).to.deep.equal({
          register: 'MB-OUTPUTS',
          name: 'intTest',
          addressStart: NaN,
          addressOffset: 2,
          addressOffsetIO: 0,
          addressStartIO: NaN,
          registerAddress: NaN,
          coilStart: 0,
          bitAddress: null,
          Bit: 0,
          bits: 32,
          dataType: 'Integer',
          type: 'output'
        })
      })
      it('should correctly map integer type with 32 bits when registerType is not W', () => {
        const mapping = { name: 'int32Test', valueAddress: '%QID400' }
        const offset = 0
        const readingOffset = 0
        const logging = false

        const result = coreIOUnderTest.buildOutputAddressMapping('MB-OUTPUTS', mapping, offset, readingOffset, logging)

        expect(result).to.deep.equal({
          register: 'MB-OUTPUTS',
          name: 'int32Test',
          addressStart: NaN,
          addressOffset: 2,
          addressOffsetIO: 0,
          addressStartIO: NaN,
          registerAddress: NaN,
          coilStart: 0,
          bitAddress: null,
          Bit: 0,
          bits: 32,
          dataType: 'Integer',
          type: 'output'
        })
      })
    })

    it('should correctly map boolean type with 1 bit when registerType is X', () => {
      const mapping = { name: 'boolTest', valueAddress: '%IX100.3' }
      const offset = 0
      const readingOffset = 0
      const logging = false

      const result = coreIOUnderTest.buildInputAddressMapping('MB-INPUTS', mapping, offset, readingOffset, logging)

      expect(result).to.deep.equal({
        register: 'MB-INPUTS',
        name: 'boolTest',
        addressStart: 50,
        addressOffset: 1,
        addressOffsetIO: 0,
        addressStartIO: 50,
        registerAddress: 50,
        coilStart: 803,
        bitAddress: ['100', '3'],
        Bit: 803,
        bits: 1,
        dataType: 'Boolean',
        type: 'input'
      })
    })

    it('should correctly assign boolean value for 1-bit items', () => {
      const valueNames = [{ registerAddress: 0, bits: 1, bitAddress: [0, 1] }]
      const register = [2]
      const logging = false
      sinonStub = sinon.stub()

      coreIOUnderTest.insertValues(valueNames, register, logging)

      expect(sinonStub.called).to.equal(false)
    })

    it('should correctly handle 16-bit values', () => {
      const valueNames = [{ registerAddress: 0, bits: 16 }]
      const register = [255, 255]
      const logging = true

      coreIOUnderTest.insertValues(valueNames, register, logging)

      expect(valueNames[0].value).to.equal(255)
    })

    describe('filterValueNames', () => {
      it('should filter valueNames correctly based on address range and function type', () => {
        const node = { logIOActivities: false }
        const valueNames = [
          { registerAddress: 1, addressStartIO: 2, type: 'input' },
          { registerAddress: 2, addressStartIO: 3, type: 'output' },
          { registerAddress: 3, addressStartIO: 4, type: 'input' }
        ]
        const fc = 3
        const adr = 2
        const quantity = 2

        const result = coreIOUnderTest.filterValueNames(node, valueNames, fc, adr, quantity)

        assert.deepStrictEqual(result, [{ registerAddress: 1, addressStartIO: 2, type: 'input' }])
      })

      it('should handle non-numeric adr and quantity gracefully', () => {
        const node = { logIOActivities: false }
        const valueNames = [

        ]
        const fc = 3
        const adr = 'invalid'
        const quantity = 'invalid'

        const result = coreIOUnderTest.filterValueNames(node, valueNames, fc, adr, quantity)

        assert.deepStrictEqual(result, valueNames)
      })

      it('should return original valueNames when valueNames is empty', () => {
        const node = { logIOActivities: false }
        const valueNames = []
        const fc = 3
        const adr = 2
        const quantity = 2

        const result = coreIOUnderTest.filterValueNames(node, valueNames, fc, adr, quantity)

        assert.deepStrictEqual(result, [])
      })

      it('should return original valueNames when valueNames does not have filter method', () => {
        const node = { logIOActivities: false }
        const valueNames = { notFilterable: true }
        const fc = 3
        const adr = 2
        const quantity = 2

        const result = coreIOUnderTest.filterValueNames(node, valueNames, fc, adr, quantity)

        assert.deepStrictEqual(result, { notFilterable: true })
      })

      it('should log debug information when node.logIOActivities is true', () => {
        const node = { logIOActivities: true }
        const valueNames = [
          { registerAddress: 1, addressStartIO: 2, type: 'input' },
          { registerAddress: 2, addressStartIO: 3, type: 'output' },
          { registerAddress: 3, addressStartIO: 4, type: 'input' }
        ]
        const fc = 3
        const adr = 2
        const quantity = 2

        const spy = sinon.spy(coreIOUnderTest, 'internalDebug')

        coreIOUnderTest.filterValueNames(node, valueNames, fc, adr, quantity)

        sinon.assert.calledWith(spy, 'adr:' + adr + ' quantity:' + quantity + ' startRegister:' + adr + ' endRegister:' + (Number(adr) + Number(quantity) - 1) + ' functionType:input')
        spy.restore()
      })

      it('should handle function codes 2 and 4 as output types', () => {
        const node = { logIOActivities: false }
        const valueNames = [
          { registerAddress: 1, addressStartIO: 2, type: 'input' },
          { registerAddress: 2, addressStartIO: 3, type: 'output' },
          { registerAddress: 3, addressStartIO: 4, type: 'input' }
        ]
        const fc = 2
        const adr = 2
        const quantity = 2

        const result = coreIOUnderTest.filterValueNames(node, valueNames, fc, adr, quantity)

        assert.deepStrictEqual(result, [{ registerAddress: 2, addressStartIO: 3, type: 'output' }])
      })

      it('should handle valueNames with missing or undefined properties', () => {
        const node = { logIOActivities: false }
        const valueNames = [
          { registerAddress: 1, addressStartIO: 2 },
          { registerAddress: 2 },
          { addressStartIO: 4, type: 'input' }
        ]
        const fc = 3
        const adr = 2
        const quantity = 2

        const result = coreIOUnderTest.filterValueNames(node, valueNames, fc, adr, quantity)

        assert.deepStrictEqual(result, [])
      })
    })

    describe('Core IO File', function () {
      it('should ...', function (done) {
        done()
      })
    })

    describe('Core IO Mapping', function () {
      it('should handle invalid items and log debug messages', () => {
        const register = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        const logging = true
        const validItem = {
          registerAddress: 0,
          bits: 16
        }

        const invalidItem1 = {
          bits: 16
        }

        const invalidItem2 = {
          registerAddress: -1,
          bits: 16
        }

        // TODO - @MJ Fix this test to manage stub to get restored
        sinonDebugStub = sinon.stub()
        coreIOUnderTest.internalDebug = sinonDebugStub
        const ioCoreMock = {
          internalDebug: coreIOUnderTest.internalDebug,
          isRegisterSizeWrong: sinon.stub().returns(false)
        }

        const valueNames = [
          validItem,
          invalidItem1,
          invalidItem2
        ]

        coreIOUnderTest.insertValues(valueNames, register, logging, ioCoreMock)

        assert.strictEqual(valueNames.length, 3)
        sinon.assert.calledWith(coreIOUnderTest.internalDebug, 'Item Not Valid To Insert Value ' + JSON.stringify(invalidItem1))
      })

      it('should do mapping of ...', function (done) {
        done()
      })
    })
  })
})
