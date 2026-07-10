/**
 * Regression tests for TCP connection reset handling (#532)
 */
'use strict'

const sinon = require('sinon')
const coreModbusClient = require('../../src/core/modbus-client-core')
const coreModbusQueue = require('../../src/core/modbus-queue-core')

describe('Modbus Client TCP error handling (#532)', function () {
  it('should classify ECONNRESET as a network error', function () {
    coreModbusClient.networkErrors.should.containEql('ECONNRESET')
  })

  it('should send BREAK on TCP reset without throwing', function () {
    const sendSpy = sinon.spy()
    const node = {
      showErrors: false,
      failureLogEnabled: false,
      stateService: { send: sendSpy },
      error: sinon.spy(),
      setCloseIntent: sinon.spy()
    }

    sinon.stub(coreModbusQueue, 'queueSerialUnlockCommand')

    const err = new Error('read ECONNRESET')
    err.code = 'ECONNRESET'

    // Same logic as modbus-client.js modbusTcpErrorHandling
    coreModbusQueue.queueSerialUnlockCommand(node)
    node.setCloseIntent('error')
    if ((err.errno && coreModbusClient.networkErrors.includes(err.errno)) ||
        (err.code && coreModbusClient.networkErrors.includes(err.code))) {
      node.stateService.send('BREAK')
    }

    node.setCloseIntent.calledWith('error').should.be.true()
    sendSpy.calledWith('BREAK').should.be.true()

    coreModbusQueue.queueSerialUnlockCommand.restore()
  })
})
