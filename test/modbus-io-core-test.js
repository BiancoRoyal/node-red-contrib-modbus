/**
 Copyright (c) 2017, Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

'use strict'

var assert = require('chai').assert
var should = require('chai').should
var expect = require('chai').expect

describe('Modbus IO Suite', function () {
  var ioCore = require('../src/core/modbus-io-core')

  describe('when using core io', function () {
    it('register size check false', function () {
      assert.equal(true, ioCore.isRegisterSizeWrong([],10,16))
    })

    it('register size check 1Bit', function () {
      assert.equal(false, ioCore.isRegisterSizeWrong([1,2,3,4],2,1))
    })

    it('register size check 8Bit', function () {
      assert.equal(false, ioCore.isRegisterSizeWrong([1,2,3,4],2,8))
    })

    it('register size check 16Bit', function () {
      assert.equal(false, ioCore.isRegisterSizeWrong([1,2,3,4],2,16))
    })

    it('register size check 16Bit', function () {
      assert.equal(false, ioCore.isRegisterSizeWrong([1,2,3,4],3,16))
    })

    it('register size check 32Bit', function () {
      assert.equal(false, ioCore.isRegisterSizeWrong([1,2,3,4],2,32))
    })

    it('register size check 32Bit', function () {
      assert.equal(false, ioCore.isRegisterSizeWrong([1,2,3,4],0,32))
    })

    it('register size check 64Bit', function () {
      assert.equal(true, ioCore.isRegisterSizeWrong([1,2,3,4],2,64))
    })

    it('register size check 64Bit', function () {
      assert.equal(false, ioCore.isRegisterSizeWrong([1,2,3,4,5,6,7,8],0,64))
    })

    it('register size check 64Bit with wrong offset', function () {
      assert.equal(true, ioCore.isRegisterSizeWrong([1,2,3,4,5,6,7,8],6,64))
    })

    it('register size check 80Bit', function () {
      assert.equal(false, ioCore.isRegisterSizeWrong([1,2,3,4,5,6,7,8,9,10],0,80))
    })

    it('filter named value Output FC2 with offset', function () {
      let value = {"register":"MB-OUTPUTS","name":"iTraceDummy","addressStart":30101,"addressOffset":2, "addressOffsetIO":30001,
        "addressStartIO":100, "registerAddress": 0, "coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1010}
      let names = [
        {"register":"MB-OUTPUTS","name":"iCountDummy","addressStart":2,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":2, "coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":0},
        {"register":"MB-OUTPUTS","name":"iAddDummy","addressStart":6,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":4,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1000},
        {"register":"MB-OUTPUTS","name":"iTraceDummy2","addressStart":8,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":6,"coilStart":0, "bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1000}
      ]
      names.push(value)

      let filterdNames = ioCore.filterValueNames(names, 2, 100, 2)

      assert.equal(true, filterdNames.includes(value) && filterdNames.length === 1)
    })

    it('filter named value Output FC2 with to big offset', function () {
      let value = {"register":"MB-OUTPUTS","name":"iTraceDummy","addressStart":30201,"addressOffset":2, "addressOffsetIO":30001,
        "addressStartIO":200, "registerAddress": 0, "coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1010}
      let names = [
        {"register":"MB-OUTPUTS","name":"iCountDummy","addressStart":2,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":2, "coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":0},
        {"register":"MB-OUTPUTS","name":"iAddDummy","addressStart":6,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":4,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1000},
        {"register":"MB-OUTPUTS","name":"iTraceDummy2","addressStart":8,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":6,"coilStart":0, "bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1000}
      ]
      names.push(value)

      let filterdNames = ioCore.filterValueNames(names, 2, 100, 2)

      assert.equal(false, filterdNames.includes(value) && filterdNames.length === 1)
    })

    it('filter named value Output FC2', function () {
      let value = {"register":"MB-OUTPUTS","name":"iTraceDummy","addressStart":0,"addressOffset":2, "addressOffsetIO":0,
        "addressStartIO":0,"registerAddress": 0,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1010}
      let names = [
        {"register":"MB-OUTPUTS","name":"iCountDummy","addressStart":2,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":2, "coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":0},
        {"register":"MB-OUTPUTS","name":"iAddDummy","addressStart":6,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":4,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1000},
        {"register":"MB-OUTPUTS","name":"iTraceDummy2","addressStart":8,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":6,"coilStart":0, "bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1000}
        ]
      names.push(value)

      let filterdNames = ioCore.filterValueNames(names, 2, 0, 2)

      assert.equal(true, filterdNames.includes(value) && filterdNames.length === 1)
    })

    it('filter named value Output FC4', function () {
      let value = {"register":"MB-OUTPUTS","name":"iTraceDummy","addressStart":0,"addressOffset":2, "addressOffsetIO":0,
        "addressStartIO":0,"registerAddress": 0,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1010}
      let names = [
        {"register":"MB-OUTPUTS","name":"iCountDummy","addressStart":2,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":2, "coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":0},
        {"register":"MB-OUTPUTS","name":"iAddDummy","addressStart":6,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":4,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1000},
        {"register":"MB-OUTPUTS","name":"iTraceDummy2","addressStart":8,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":6,"coilStart":0, "bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1000}
      ]
      names.push(value)

      let filterdNames = ioCore.filterValueNames(names, 4, 0, 2)

      assert.equal(true, filterdNames.includes(value) && filterdNames.length === 1)
    })

    it('filter named value Output FC4 in wrong scope of register address', function () {
      let value = {"register":"MB-OUTPUTS","name":"iTraceDummy","addressStart":0,"addressOffset":2, "addressOffsetIO":0,
        "addressStartIO":0,"registerAddress": -100,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1010}
      let names = [
        {"register":"MB-OUTPUTS","name":"iCountDummy","addressStart":2,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":2, "coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":0},
        {"register":"MB-OUTPUTS","name":"iAddDummy","addressStart":6,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":4,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1000},
        {"register":"MB-OUTPUTS","name":"iTraceDummy2","addressStart":8,"addressOffset":2,"addressOffsetIO":0,
          "addressStartIO":6,"coilStart":0, "bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1000}
      ]
      names.push(value)

      let filterdNames = ioCore.filterValueNames(names, 4, 0, 2)

      assert.equal(false, filterdNames.includes(value) && filterdNames.length === 1)
    })

    it('get value from Buffer by data type Double', function () {
      let item = {"register":"MB-OUTPUTS","name":"iTraceDummy","addressStart":0,"addressOffset":0, "addressOffsetIO":0,
        "addressStartIO":0,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Double","type":"output","value":1010}
      let responseBufferDummy = Buffer.alloc(10)
      responseBufferDummy.writeDoubleBE(100000.22, 0)
      item = ioCore.getValueFromBufferByDataType(item, 0, responseBufferDummy)
      assert.equal(100000.22, item.value)
    })

    it('get value from Buffer by data type Float', function () {
      let item = {"register":"MB-OUTPUTS","name":"iTraceDummy","addressStart":0,"addressOffset":0, "addressOffsetIO":0,
        "addressStartIO":0,"coilStart":0,"bitAddress":"none","bits":16,"dataType":"Float","type":"output","value":1010}
      let responseBufferDummy = Buffer.alloc(10)
      responseBufferDummy.writeFloatBE(1000.22, 0)
      item = ioCore.getValueFromBufferByDataType(item, 0, responseBufferDummy)
      assert.equal(1000.219970703125, item.value)
    })

    it('get value from Buffer by data type Unsigned Integer 16Bit', function () {
      let item = {"register":"MB-OUTPUTS","name":"iTraceDummy","addressStart":0,"addressOffset":0, "addressOffsetIO":0,
        "addressStartIO":0,"coilStart":0,"bitAddress":"none","bits":16,"dataType":"Unsigned Integer","type":"output","value":1010}
      let responseBufferDummy = Buffer.alloc(10)
      responseBufferDummy.writeUInt16BE(1000, 0)
      item = ioCore.getValueFromBufferByDataType(item, 0, responseBufferDummy)
      assert.equal(1000, item.value)
    })

    it('get value from Buffer by data type Unsigned Integer 32Bit', function () {
      let item = {"register":"MB-OUTPUTS","name":"iTraceDummy","addressStart":0,"addressOffset":0, "addressOffsetIO":0,
        "addressStartIO":0,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Unsigned Integer","type":"output","value":1010}
      let responseBufferDummy = Buffer.alloc(20)
      responseBufferDummy.writeUInt32BE(0xffffffff, 0)
      item = ioCore.getValueFromBufferByDataType(item, 0, responseBufferDummy)
      assert.equal(65535, item.value)
    })

    it('get value from Buffer by data type negative Integer 32Bit', function () {
      let item = {"register":"MB-OUTPUTS","name":"iTraceDummy","addressStart":0,"addressOffset":0, "addressOffsetIO":0,
        "addressStartIO":0,"coilStart":0,"bitAddress":"none","bits":32,"dataType":"Integer","type":"output","value":1010}
      let responseBufferDummy = Buffer.alloc(20)
      responseBufferDummy.writeUInt32BE(0xfefefefe, 0)
      item = ioCore.getValueFromBufferByDataType(item, 0, responseBufferDummy)
      assert.equal(-258, item.value)
    })
  })
})
