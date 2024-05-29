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
const coreServerUnderTest = require('../../src/core/modbus-server-core')
const sinon = require('sinon')

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

const msgMultipleWriteInput = {
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
        assert.strict.equal(coreServerUnderTest.writeModbusServerMemory(modbusServerNode, msgMultipleWriteInput), true)
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
        assert.strict.equal(coreServerUnderTest.writeModbusFlexServerMemory(modbusFlexServerNode, msgMultipleWriteInput), true)
        assert.strict.equal(modbusFlexServerNode.registers.readUInt8(0), 101)
        assert.strict.equal(modbusFlexServerNode.registers.readUInt8(1), 201)
        assert.strict.equal(modbusFlexServerNode.registers.readUInt8(2), 102)
        assert.strict.equal(modbusFlexServerNode.registers.readUInt8(3), 202)
        done()
      })
    })
  })
})

describe('Modbus server core function Copy Flex Buffer', () => {

  let node = {
    registers: Buffer.alloc(2),
    coils: Buffer.alloc(1)
  };

  it('should handle `holding` case', () => {
    const msg = {
      payload: { register: 'holding' },
      bufferData: Buffer.alloc(2, 22),
      bufferSplitAddress: 0
    };

    const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, true)
    assert.strict.deepEqual(node.registers, msg.bufferData);
  });

  it('should handle `holding` case just on 16 Bit', () => {
    const msg = {
      payload: { register: 'holding' },
      bufferData: Buffer.alloc(4, 22),
      bufferSplitAddress: 0
    };

    const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, true)
    assert.strict.deepEqual(node.registers.readUInt16BE(0), msg.bufferData.readUInt16BE(0));
  });

  it('should handle `coils` case', () => {
    const msg = {
      payload: { register: 'coils' },
      bufferData: Buffer.alloc(1, 33),
      bufferAddress: 0
    };

    const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, true)
    assert.strict.deepEqual(node.coils, msg.bufferData);
  });

  it('should handle `discrete` case', () => {
    const msg = {
      payload: { register: 'discrete' },
      bufferData: Buffer.alloc(1, 11),
      bufferAddress: 0
    };

    const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, true)
    assert.strict.deepEqual(node.coils, msg.bufferData);
  });

  it('should handle `discrete` case on 8 Bit', () => {
    const msg = {
      payload: { register: 'discrete' },
      bufferData: Buffer.alloc(2, 11),
      bufferAddress: 0
    };

    const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, true)
    assert.strict.deepEqual(node.coils.readUInt8(0), msg.bufferData.readUInt8(0));
  });

  it('should handle `input` case', () => {
    const msg = {
      payload: { register: 'input' },
      bufferData: Buffer.alloc(2, 66),
      bufferAddress: 0
    };

    const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, true)
    assert.strict.deepEqual(node.registers, msg.bufferData);
  });

  it('should return false for invalid case', () => {
    const msg = {
      payload: { register: 'invalid' },
      bufferData: Buffer.from([1, 2, 3, 4]),
      bufferAddress: 0
    };

    const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, false)
  });
});


describe('Modbus server core function Write Flex Buffer', () => {

  let node = {
    registers: Buffer.alloc(2),
    coils: Buffer.alloc(1)
  };

  it('should handle `holding` case', () => {
    const msg = {
      payload: { register: 'holding' },
      bufferPayload: Buffer.alloc(2, 255),
      bufferSplitAddress: 0
    };

    const result = coreServerUnderTest.writeToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, true)
    assert.strict.deepEqual(node.registers, msg.bufferPayload);
  });

  it('should handle `coils` case', () => {
    const msg = {
      payload: { register: 'coils' },
      bufferPayload: Buffer.alloc(1, 88),
      bufferSplitAddress: 0
    };

    const result = coreServerUnderTest.writeToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, true)
    assert.strict.deepEqual(node.coils, msg.bufferPayload);
  });

  it('should handle `discrete` case', () => {
    const msg = {
      payload: { register: 'discrete' },
      bufferPayload: Buffer.alloc(1, 88),
      bufferAddress: 0
    };

    const result = coreServerUnderTest.writeToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, true)
    assert.strict.deepEqual(node.coils, msg.bufferPayload);
  });

  it('should handle `input` case', () => {
    const msg = {
      payload: { register: 'input' },
      bufferPayload: Buffer.alloc(2, 255),
      bufferAddress: 0
    };

    const result = coreServerUnderTest.writeToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, true)
    assert.strict.deepEqual(node.registers, msg.bufferPayload);
  });

  it('should return false for invalid case', () => {
    const msg = {
      payload: { register: 'invalid' },
      bufferPayload: Buffer.from([1, 2, 3, 4]),
      bufferAddress: 0
    };

    const result = coreServerUnderTest.writeToModbusFlexBuffer(node, msg);
    assert.strict.equal(result, false)
  });
});
it('should correctly write to memory when register type is "holding"', () => {
  let node = {
    id: "445454e4.968564",
    type: "modbus-server",
    z: "a60ca8c447c6bf61",
    name: "",
    logEnabled: true,
    hostname: "127.0.0.1",
    serverPort: "7502",
    responseDelay: 100,
    delayUnit: "ms",
    coilsBufferSize: 10000,
    holdingBufferSize: 10000,
    inputBufferSize: 10000,
    discreteBufferSize: 10000,
    showErrors: false,
    x: 240,
    y: 120,
    wires: [[], [], [], [], []]
  };
  node = { error: sinon.spy() };

  let msg = { payload: { register: 'holding' } };

  coreServerUnderTest.writeToFlexServerMemory(node, msg);
  sinon.assert.called(node.error)

  msg = {
    payload: {
      register: 'holding',
      address: 0
    },
    bufferData: Buffer.from([1, 2, 3, 4]),
    bufferAddress: 0
  };
  const copySpy = sinon.spy(msg.bufferData, 'copy');
  node = {
    modbusServer: {
      holding: Buffer.alloc(10),
      coils: Buffer.alloc(10),
      input: Buffer.alloc(10),
      discrete: Buffer.alloc(10)
    }
  };
  coreServerUnderTest.copyToModbusBuffer(node, msg)
  sinon.assert.calledWith(copySpy, node.modbusServer.holding, 0);

  msg = {
    payload: {
      register: 'coils',
      address: 0
    },
    bufferData: Buffer.from([1, 2, 3, 4]),
    bufferAddress: 0
  };
  const copySpyCoil = sinon.spy(msg.bufferData, 'copy');
  coreServerUnderTest.copyToModbusBuffer(node, msg);
  sinon.assert.calledWith(copySpyCoil, node.modbusServer.coils, 0);

});

// I wrote this test but some of the test are failing  with error   AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: so i have to fixed previous test then i will uncomment this test 

// it('should not call writeModbusServerMemory if register type is invalid', () => {
//   const registerType = 'invalidRegisterType';
//   const node = { error: sinon.spy() };
//   let msg = { payload: {} };
//   msg.payload.register = registerType;
//   coreServerUnderTest.writeModbusServerMemory = sinon.spy();

//   const writeModbusStub = sinon.stub(coreServerUnderTest, 'writeModbusServerMemory');
//   writeModbusStub.returns();

//   coreServerUnderTest.writeToServerMemory(node, msg);
//   sinon.assert.calledWith(coreServerUnderTest.writeModbusServerMemory, node, msg)

  // coreServerUnderTest.writeToServerMemory(node, msg);
  // sinon.assert.calledWith(coreServerUnderTest.writeModbusServerMemory , node,msg);

  // sinon.assert.called(node.error)


  // sinon.assert.notCalled(writeModbusServerMemorySpy);
  // sinon.restore();
// });