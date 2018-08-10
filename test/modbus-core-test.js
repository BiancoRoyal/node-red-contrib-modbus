/**
 Copyright (c) 2017,2018 Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

'use strict'

var assert = require('chai').assert

describe('Modbus Core Suite', function () {
  var core = require('../src/core/modbus-core')

  describe('when using core', function () {
    it('should get BSON Object Id', function () {
      assert.notEqual(null, core.getObjectId())
    })

    it('should remove givin msg from message list', function () {
      let list = new Map()
      let msg = { messageId: 1, payload: { messageId: 1 } }
      let otherMsg = { messageId: 1, payload: { messageId: 1 } }
      list.set(1, msg)
      assert.equal(msg, core.getOriginalMessage(list, otherMsg))
      assert.equal(0, list.size)
    })

    it('should return givin otherMsg if not in message list', function () {
      let list = new Map()
      let msg = { messageId: 1, payload: { messageId: 1 } }
      let otherMsg = { messageId: 2, payload: { messageId: 2 } }
      list.set(1, msg)
      assert.equal(otherMsg, core.getOriginalMessage(list, otherMsg))
    })

    it('should get function code read Coil from Modbus name', function () {
      assert.equal(1, core.functionCodeModbusRead('Coil'))
    })

    it('should get function code read Input from Modbus name', function () {
      assert.equal(2, core.functionCodeModbusRead('Input'))
    })

    it('should get function code read HoldingRegister from Modbus name', function () {
      assert.equal(3, core.functionCodeModbusRead('HoldingRegister'))
    })

    it('should get function code read InputRegister from Modbus name', function () {
      assert.equal(4, core.functionCodeModbusRead('InputRegister'))
    })

    it('should get no function code from wrong read Modbus name', function () {
      assert.equal(-1, core.functionCodeModbusRead('None'))
    })

    it('should get function code write Coil from Modbus name', function () {
      assert.equal(5, core.functionCodeModbusWrite('Coil'))
    })

    it('should get function code write Input from Modbus name', function () {
      assert.equal(6, core.functionCodeModbusWrite('HoldingRegister'))
    })

    it('should get function code write HoldingRegister from Modbus name', function () {
      assert.equal(15, core.functionCodeModbusWrite('MCoils'))
    })

    it('should get function code write InputRegister from Modbus name', function () {
      assert.equal(16, core.functionCodeModbusWrite('MHoldingRegisters'))
    })

    it('should get no function code from wrong Modbus write name', function () {
      assert.equal(-1, core.functionCodeModbusWrite('None'))
    })

    it('should remove givin origin msg from message list on building response message', function () {
      let list = new Map()
      let msg = { messageId: 1, payload: { messageId: 1 } }
      let otherMsg = { messageId: 1, payload: { messageId: 1 } }
      list.set(1, msg)
      assert.equal(2, core.buildMessage(list, {}, {}, otherMsg).length)
      assert.equal(0, list.size)
    })

    it('should build response message if origin not found', function () {
      let list = new Map()
      let msg = { messageId: 1, payload: { messageId: 1 } }
      let otherMsg = { messageId: 2, payload: { messageId: 2 } }
      list.set(1, msg)
      assert.equal(2, core.buildMessage(list, {}, {}, otherMsg).length)
      assert.equal(1, list.size)
    })
  })
})
