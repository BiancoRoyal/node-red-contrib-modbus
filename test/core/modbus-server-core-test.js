/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

const assert = require('assert')
const coreServerUnderTest = require('../../src/core/modbus-server-core')

const defaultBufferSize = 1024

const modbusFlexServerNode = {
  coils: Buffer.alloc(defaultBufferSize, 0),
  registers: Buffer.alloc(defaultBufferSize, 0)
}

const modbusServerNode = {
  modbusServer: {
    coils: Buffer.alloc(defaultBufferSize, 0),
    holding: Buffer.alloc(defaultBufferSize, 0),
    input: Buffer.alloc(defaultBufferSize, 0),
    discrete: Buffer.alloc(defaultBufferSize, 0)
  }
}

const msgWriteInput = {
  payload: {
    value: 255,
    register: 'input',
    address: 0,
    disableMsgOutput: 0
  }
}

const msgMulipleWriteInput = {
  payload: {
    value: [101, 201, 102, 202, 103, 203, 104, 204, 105, 205, 106, 206],
    register: 'input',
    address: 0,
    disableMsgOutput: 0
  }
}

const msgWriteCoils = {
  payload: {
    value: true,
    register: 'coils',
    address: 0,
    disableMsgOutput: 0
  }
}

const msgWriteHolding = {
  payload: {
    value: 234,
    register: 'holding',
    address: 0,
    disableMsgOutput: 0
  }
}

const msgWriteDiscrete = {
  payload: {
    value: true,
    register: 'discrete',
    address: 0,
    disableMsgOutput: 0
  }
}

const serverJsModbusFlow = [
  {
    id: 'd411a49f.e9ffd8',
    type: 'modbus-server',
    z: '42ed18ca.652838',
    name: '',
    logEnabled: false,
    hostname: '0.0.0.0',
    serverPort: 10502,
    responseDelay: 100,
    delayUnit: 'ms',
    coilsBufferSize: '1024',
    holdingBufferSize: '1024',
    inputBufferSize: '1024',
    discreteBufferSize: '1024',
    showErrors: true,
    x: 435,
    y: 160,
    wires: [
      [
        '36782533.082afa'
      ],
      [
        'fa7b2d15.15806'
      ],
      [
        '6ec442b7.58008c'
      ],
      [
        '1fab23a0.563b14'
      ],
      [
        'afaf95b3.c7345'
      ]
    ],
    l: false
  },
  {
    id: '98d7383d.aa12a',
    type: 'function',
    z: '42ed18ca.652838',
    name: '',
    func: "msg.payload = {\n    'value': [1,1,1], \n    'register': 'input', \n    'address': 0 , \n    'disableMsgOutput' : 0 \n}; \nreturn msg;\n\n",
    outputs: 1,
    noerr: 0,
    x: 355,
    y: 100,
    wires: [
      [
        'd411a49f.e9ffd8'
      ]
    ],
    l: false
  },
  {
    id: '5fc93873.d0eb58',
    type: 'function',
    z: '42ed18ca.652838',
    name: '',
    func: "msg.payload = {\n    'value': [233,234,235], \n    'register': 'holding', \n    'address': 0 , \n    'disableMsgOutput' : 0 \n}; \nreturn msg;\n\n",
    outputs: 1,
    noerr: 0,
    x: 355,
    y: 140,
    wires: [
      [
        'd411a49f.e9ffd8'
      ]
    ],
    l: false
  },
  {
    id: '550f6965.7b646',
    type: 'function',
    z: '42ed18ca.652838',
    name: '',
    func: "msg.payload = {\n    'value': [true,true,true], \n    'register': 'coils', \n    'address': 0 , \n    'disableMsgOutput' : 0 \n}; \nreturn msg;\n\n",
    outputs: 1,
    noerr: 0,
    x: 355,
    y: 180,
    wires: [
      [
        'd411a49f.e9ffd8'
      ]
    ],
    l: false
  },
  {
    id: '81bc1a3a.a886c',
    type: 'function',
    z: '42ed18ca.652838',
    name: '',
    func: "msg.payload = {\n    'value': [true,true,true], \n    'register': 'discrete', \n    'address': 0 , \n    'disableMsgOutput' : 0 \n}; \nreturn msg;\n\n",
    outputs: 1,
    noerr: 0,
    x: 355,
    y: 220,
    wires: [
      [
        'd411a49f.e9ffd8'
      ]
    ],
    l: false
  }
]

describe('Core Server Testing', function () {
  describe('Core Server', function () {
    it('should give the units internalDebugLog', function (done) {
      const node = { internalDebugLog: true }
      assert.strict.equal(coreServerUnderTest.getLogFunction(node), node.internalDebugLog)
      done()
    })
    describe('Core Server Validates', function () {
      it('should validate an input memory msg', function (done) {
        const msg = {
          payload: {
            value: [1, 1, 1],
            register: 'input',
            address: 0,
            disableMsgOutput: 0
          }
        }
        assert.strict.equal(coreServerUnderTest.isValidMemoryMessage(msg), true)
        done()
      })
      it('should validate an coils memory msg', function (done) {
        const msg = {
          payload: {
            value: [1, 1, 1],
            register: 'coils',
            address: 0,
            disableMsgOutput: 0
          }
        }
        assert.strict.equal(coreServerUnderTest.isValidMemoryMessage(msg), true)
        done()
      })
      it('should validate an holding memory msg', function (done) {
        const msg = {
          payload: {
            value: [1, 1, 1],
            register: 'holding',
            address: 0,
            disableMsgOutput: 0
          }
        }
        assert.strict.equal(coreServerUnderTest.isValidMemoryMessage(msg), true)
        done()
      })
      it('should validate an discrete memory msg', function (done) {
        const msg = {
          payload: {
            value: [1, 1, 1],
            register: 'discrete',
            address: 0,
            disableMsgOutput: 0
          }
        }
        assert.strict.equal(coreServerUnderTest.isValidMemoryMessage(msg), true)
        done()
      })
      it('should validate an memory msg with wrong register text', function (done) {
        const msg = {
          payload: {
            value: [1, 1, 1],
            register: 'discerete',
            address: 0,
            disableMsgOutput: 0
          }
        }
        assert.strict.equal(coreServerUnderTest.isValidMemoryMessage(msg), true)
        done()
      })
      it('should validate an memory msg as wrong missing register', function (done) {
        const msg = {
          payload: {
            value: [1, 1, 1],
            address: 0,
            disableMsgOutput: 0
          }
        }
        assert.strict.equal(coreServerUnderTest.isValidMemoryMessage(msg), undefined)
        done()
      })
      it('should validate an discrete memory msg with wrong address', function (done) {
        const msg = {
          payload: {
            value: [1, 1, 1],
            register: 'discrete',
            address: -1,
            disableMsgOutput: 0
          }
        }
        assert.strict.equal(coreServerUnderTest.isValidMemoryMessage(msg), false)
        done()
      })
    })

    describe('Core Modbus Server', function () {
      it('should write buffer to input', function (done) {
        assert.strict.equal(coreServerUnderTest.writeModbusServerMemory(modbusServerNode, msgWriteInput), true)
        assert.strict.equal(modbusServerNode.modbusServer.input.readUInt16BE(0), 255)
        done()
      })

      it('should write multiple buffers to input', function (done) {
        assert.strict.equal(coreServerUnderTest.writeModbusServerMemory(modbusServerNode, msgMulipleWriteInput), true)
        assert.strict.equal(modbusServerNode.modbusServer.input.readUInt8(0), 101)
        assert.strict.equal(modbusServerNode.modbusServer.input.readUInt8(1), 201)
        assert.strict.equal(modbusServerNode.modbusServer.input.readUInt8(2), 102)
        assert.strict.equal(modbusServerNode.modbusServer.input.readUInt8(3), 202)
        done()
      })
    })

    describe('Core Modbus Flex Server', function () {
      it('should write buffer to input', function (done) {
        assert.strict.equal(coreServerUnderTest.writeModbusFlexServerMemory(modbusFlexServerNode, msgWriteInput), true)
        assert.strict.equal(modbusFlexServerNode.registers.readUInt16BE(0), 255)
        done()
      })

      it('should write multiple buffer to input', function (done) {
        assert.strict.equal(coreServerUnderTest.writeModbusFlexServerMemory(modbusFlexServerNode, msgMulipleWriteInput), true)
        assert.strict.equal(modbusFlexServerNode.registers.readUInt8(0), 101)
        assert.strict.equal(modbusFlexServerNode.registers.readUInt8(1), 201)
        assert.strict.equal(modbusFlexServerNode.registers.readUInt8(2), 102)
        assert.strict.equal(modbusFlexServerNode.registers.readUInt8(3), 202)
        done()
      })
    })
  })
})
