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
const expect = require('chai').expect

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
    describe('writeToFlexServerMemory', () => {
      const node = {
        error: sinon.spy()
      }

      it('should write to flex server memory for valid register', () => {
        const writeModbusFlexServerMemoryStub = sinon.stub(coreServerUnderTest, 'writeModbusFlexServerMemory')

        const msg = {
          payload: { register: 'HOLDING' }
        }

        coreServerUnderTest.writeToFlexServerMemory(node, msg)

        sinon.assert.calledOnce(writeModbusFlexServerMemoryStub)
        sinon.assert.calledWithExactly(writeModbusFlexServerMemoryStub, node, msg)

        writeModbusFlexServerMemoryStub.restore()
      })
    })

    it('should copy bufferData to registers for holding register', () => {
      const node = {
        registers: Buffer.alloc(10),
        coils: Buffer.alloc(10)
      }
      const msg = {
        payload: { register: 'holding' },
        bufferData: Buffer.from([1, 2, 3, 4]),
        bufferAddress: 2,
        bufferSplitAddress: 4
      }
      const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg)

      expect(result).to.equal(true)
      expect(node.registers.slice(4, 8)).to.deep.equal(msg.bufferData)
    })

    it('should copy bufferData to coils for coils register', () => {
      const node = {
        registers: Buffer.alloc(10),
        coils: Buffer.alloc(10)
      }
      const msg = {
        payload: { register: 'coils' },
        bufferData: Buffer.from([1, 2, 3, 4]),
        bufferAddress: 2,
        bufferSplitAddress: 4
      }
      const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg)

      expect(result).to.equal(true)
      expect(node.coils.slice(2, 6)).to.deep.equal(msg.bufferData)
    })

    it('should copy bufferData to registers for input register', () => {
      const node = {
        registers: Buffer.alloc(10),
        coils: Buffer.alloc(10)
      }
      const msg = {
        payload: { register: 'input' },
        bufferData: Buffer.from([1, 2, 3, 4]),
        bufferAddress: 2,
        bufferSplitAddress: 4
      }
      const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg)

      expect(result).to.equal(true)
      expect(node.registers.slice(2, 6)).to.deep.equal(msg.bufferData)
    })

    it('should copy bufferData to coils for discrete register', () => {
      const node = {
        registers: Buffer.alloc(10),
        coils: Buffer.alloc(10)
      }
      const msg = {
        payload: { register: 'discrete' },
        bufferData: Buffer.from([1, 2, 3, 4]),
        bufferAddress: 2,
        bufferSplitAddress: 4
      }
      const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg)

      expect(result).to.equal(true)
      expect(node.coils.slice(4, 8)).to.deep.equal(msg.bufferData)
    })

    it('should return false for unknown register', () => {
      const node = {
        registers: Buffer.alloc(10),
        coils: Buffer.alloc(10)
      }
      const msg = {
        payload: { register: 'unknown' },
        bufferData: Buffer.from([1, 2, 3, 4]),
        bufferAddress: 2,
        bufferSplitAddress: 4
      }
      const result = coreServerUnderTest.copyToModbusFlexBuffer(node, msg)

      expect(result).to.equal(false)
    })

    describe('Core Modbus  Server', function () {
      it('should write buffer to input', function (done) {
        assert.strict.equal(coreServerUnderTest.writeModbusServerMemory(modbusServerNode, msgWriteInput), true)
        assert.strict.equal(modbusServerNode.modbusServer.input.readUInt16BE(0), 255)
        done()
      })

      it('should write buffer to coils', function (done) {
        assert.strict.equal(coreServerUnderTest.writeModbusServerMemory(modbusServerNode, msgWriteCoils), true)
        assert.strict.equal(modbusServerNode.modbusServer.coils.readUInt8(0), 1)
        done()
      })

      it('should write buffer to discrete', function (done) {
        assert.strict.equal(coreServerUnderTest.writeModbusServerMemory(modbusServerNode, msgWriteDiscrete), true)
        assert.strict.equal(modbusServerNode.modbusServer.discrete.readUInt8(0), 1)
        done()
      })

      it('should write buffer to holding', function (done) {
        assert.strict.equal(coreServerUnderTest.writeModbusServerMemory(modbusServerNode, msgWriteHolding), true)
        assert.strict.equal(modbusServerNode.modbusServer.holding.readUInt16BE(0), 234)
        done()
      })

      it('should write multiple buffer to input', function (done) {
        assert.strict.equal(coreServerUnderTest.writeModbusServerMemory(modbusServerNode, msgMultipleWriteInput), true)
        assert.strict.equal(modbusServerNode.modbusServer.input.readUInt8(0), 101)
        assert.strict.equal(modbusServerNode.modbusServer.input.readUInt8(1), 201)
        assert.strict.equal(modbusServerNode.modbusServer.input.readUInt8(2), 102)
        assert.strict.equal(modbusServerNode.modbusServer.input.readUInt8(3), 202)
        done()
      })
    })
  })
})

describe('Modbus server core function Copy  Buffer', () => {
  const node = {
    registers: Buffer.alloc(2),
    coils: Buffer.alloc(1)
  }

  it('should return false for invalid case', () => {
    const msg = {
      payload: { register: 'invalid' },
      bufferData: Buffer.from([1, 2, 3, 4]),
      bufferAddress: 0
    }

    const result = coreServerUnderTest.copyToModbusBuffer(node, msg)
    assert.strict.equal(result, false)
  })
})

describe('Modbus server core function Write  Buffer', () => {
  const node = {
    registers: Buffer.alloc(2),
    coils: Buffer.alloc(1)
  }

  it('should return false for invalid case', () => {
    const msg = {
      payload: { register: 'invalid' },
      bufferPayload: Buffer.from([1, 2, 3, 4]),
      bufferAddress: 0
    }

    const result = coreServerUnderTest.writeToModbusBuffer(node, msg)
    assert.strict.equal(result, false)
  })

  it('should correctly write to memory when register type is "holding"', () => {
    let node = { error: sinon.spy() }
    let msg = { payload: { register: 'holding' } }

    coreServerUnderTest.writeToServerMemory(node, msg)
    sinon.assert.called(node.error)

    msg = {
      payload: {
        register: 'holding',
        address: 0
      },
      bufferData: Buffer.from([1, 2, 3, 4]),
      bufferAddress: 0
    }
    const copySpy = sinon.spy(msg.bufferData, 'copy')
    node = {
      modbusServer: {
        holding: Buffer.alloc(10),
        coils: Buffer.alloc(10),
        input: Buffer.alloc(10),
        discrete: Buffer.alloc(10)
      }
    }
    coreServerUnderTest.copyToModbusBuffer(node, msg)
    sinon.assert.calledWith(copySpy, node.modbusServer.holding, 0)

    msg = {
      payload: {
        register: 'coils',
        address: 0
      },
      bufferData: Buffer.from([1, 2, 3, 4]),
      bufferAddress: 0
    }
    const copySpyCoil = sinon.spy(msg.bufferData, 'copy')
    coreServerUnderTest.copyToModbusBuffer(node, msg)
    sinon.assert.calledWith(copySpyCoil, node.modbusServer.coils, 0)

    msg = msg = {
      payload: {
        register: 'discrete',
        address: 0
      },
      bufferData: Buffer.from([13, 14, 15, 16]),
      bufferAddress: 0
    }
    const discreteResult = coreServerUnderTest.copyToModbusBuffer(node, msg)
    assert.strictEqual(discreteResult, true)
    assert.deepStrictEqual(node.modbusServer.discrete.slice(0, 4), Buffer.from([13, 14, 15, 16]))
    node = {
      modbusServer: {}
    }
    msg = {
      payload: {
        register: 'invalid',
        address: 0
      },
      bufferData: Buffer.from([1, 2, 3, 4]),
      bufferAddress: 0
    }
    const result = coreServerUnderTest.copyToModbusBuffer(node, msg)
    assert.strictEqual(result, false)

    node = {
      modbusServer: {
        discrete: {
          writeUInt8: sinon.spy()
        },
        holding: {
          writeUInt16BE: sinon.spy()
        },
        coils: {
          writeUInt8: sinon.spy()
        }
      }
    }
    msg = {
      payload: {
        register: 'discrete',
        address: 1
      },
      bufferPayload: 255,
      bufferAddress: 2
    }
    coreServerUnderTest.writeToModbusBuffer(node, msg)
    sinon.assert.calledWith(node.modbusServer.discrete.writeUInt8, 255, 2)
    msg = {
      payload: {
        register: 'holding'
      },
      bufferPayload: 10,
      bufferAddress: 0
    }
    coreServerUnderTest.writeToModbusBuffer(node, msg)
    sinon.assert.calledWith(node.modbusServer.holding.writeUInt16BE, 10, 0)
    msg = {
      payload: {
        register: 'coils'
      },
      bufferPayload: Buffer.from([0x01]),
      bufferAddress: 0
    }
    coreServerUnderTest.writeToModbusBuffer(node, msg)

    sinon.assert.calledWith(node.modbusServer.coils.writeUInt8, 1, 0)
    msg = { payload: { register: 'discrete' } }
    node = { error: sinon.spy() }
    coreServerUnderTest.writeToServerMemory(node, msg)
    sinon.assert.called(node.error)
  })
})

describe('writeModbusFlexServerMemory', () => {
  it('should write to flex server memory when input is valid', () => {
    const node = {
      splitAddress: 10
    }
    const msg = {
      payload: {
        address: 5, value: [1, 2, 9]
      },
      bufferPayload: 255,
      bufferAddress: 2
    }
    const copyToModbusFlexBufferStub = sinon.stub(coreServerUnderTest, 'copyToModbusFlexBuffer').returns(true)
    const writeToModbusFlexBufferStub = sinon.stub(coreServerUnderTest, 'writeToModbusFlexBuffer')

    coreServerUnderTest.writeModbusFlexServerMemory(node, msg)

    sinon.assert.calledWith(copyToModbusFlexBufferStub, node, sinon.match(msg))
    sinon.assert.notCalled(writeToModbusFlexBufferStub)

    copyToModbusFlexBufferStub.restore()
    writeToModbusFlexBufferStub.restore()
  })

  it('should write to modbus flex buffer when input is not valid', () => {
    const node = {
      splitAddress: 10
    }
    const msg = {
      payload: {
        address: 5
      }
    }
    sinon.stub(coreServerUnderTest, 'copyToModbusFlexBuffer').returns(false)
    const writeToModbusFlexBufferStub = sinon.stub(coreServerUnderTest, 'writeToModbusFlexBuffer')

    coreServerUnderTest.writeModbusFlexServerMemory(node, msg)

    sinon.assert.calledWith(writeToModbusFlexBufferStub, node, sinon.match(msg))

    writeToModbusFlexBufferStub.restore()
  })
})

describe('writeToModbusFlexBuffer', () => {
  it('should write to holding register when buffer payload is a buffer', () => {
    const node = {
      registers: Buffer.alloc(10),
      coils: Buffer.alloc(10),
      splitAddress: 0
    }
    const msg = {
      payload: {
        register: 'holding',
        address: 1
      },
      bufferPayload: Buffer.from([0x00, 0x01])
    }
    msg.bufferSplitAddress = 2
    msg.bufferAddress = 2

    const result = coreServerUnderTest.writeToModbusFlexBuffer(node, msg)

    assert.strictEqual(result, true)
    assert.strictEqual(node.registers.readUInt16BE(2), 1)
  })

  it('should return false when register type is invalid', () => {
    const node = {
      registers: Buffer.alloc(10),
      coils: Buffer.alloc(10),
      splitAddress: 0
    }
    const msg = {
      payload: {
        register: 'invalid',
        address: 1
      },
      bufferPayload: Buffer.from([0x00, 0x01])
    }
    msg.bufferSplitAddress = 2
    msg.bufferAddress = 2

    const result = coreServerUnderTest.writeToModbusFlexBuffer(node, msg)

    assert.strictEqual(result, false)
  })

  it('should write to coils when buffer payload is not a buffer', () => {
    const node = {
      registers: Buffer.alloc(10),
      coils: Buffer.alloc(10),
      splitAddress: 0
    }
    const msg = {
      payload: {
        register: 'coils',
        address: 1
      },
      bufferPayload: 1
    }
    msg.bufferSplitAddress = 2
    msg.bufferAddress = 2

    const result = coreServerUnderTest.writeToModbusFlexBuffer(node, msg)

    assert.strictEqual(result, true)
    assert.strictEqual(node.coils.readUInt8(2), 1)
  })
  it('should write to input register when buffer payload is a buffer', () => {
    const node = {
      registers: Buffer.alloc(10),
      coils: Buffer.alloc(10),
      splitAddress: 0
    }
    const msg = {
      payload: {
        register: 'input',
        address: 1
      },
      bufferPayload: Buffer.from([0x00, 0x01])
    }
    msg.bufferSplitAddress = 2
    msg.bufferAddress = 2

    const result = coreServerUnderTest.writeToModbusFlexBuffer(node, msg)

    assert.strictEqual(result, true)
    assert.strictEqual(node.registers.readUInt16BE(2), 1)
  })
  it('should write to discrete register when buffer payload is a buffer', () => {
    const node = {
      registers: Buffer.alloc(10),
      coils: Buffer.alloc(10),
      splitAddress: 0
    }
    const msg = {
      payload: {
        register: 'discrete',
        address: 1
      },
      bufferPayload: Buffer.from([0x01])
    }
    msg.bufferSplitAddress = 2
    msg.bufferAddress = 2

    const result = coreServerUnderTest.writeToModbusFlexBuffer(node, msg)

    assert.strictEqual(result, true)
    assert.strictEqual(node.coils.readUInt8(2), 1)
  })
})
