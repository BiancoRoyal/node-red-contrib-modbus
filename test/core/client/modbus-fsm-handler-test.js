/**
 * FSM handler unit tests
 */
'use strict'

const assert = require('assert')
const sinon = require('sinon')
const { createFsmHandler, runInitConnection } = require('../../../src/core/client/modbus-fsm-handler')
const { createModbusFsm, startFsmService } = require('../../../src/core/client/modbus-fsm')

describe('Modbus FSM Handler v6', function () {
  it('createFsmHandler should transition connected to activated', function () {
    const machine = createModbusFsm()
    const service = startFsmService(machine)
    const sendSpy = sinon.spy(service, 'send')

    const node = {
      actualServiceState: service.state,
      actualServiceStateBefore: service.state,
      bufferCommands: false,
      stateService: service,
      stateValidator: null,
      updateServerinfo: sinon.spy(),
      generateEvent: (type, data) => ({ type, data }),
      emitGlobalStateChange: sinon.spy()
    }

    const handler = createFsmHandler(node, {
      coreModbusQueue: {
        queueSerialUnlockCommand: sinon.spy(),
        checkQueuesAreEmpty: () => true
      },
      verboseWarn: () => {},
      stateLog: () => {},
      reconnectTimeMS: 2000,
      logHintText: ''
    })

    service.subscribe(handler)
    service.send('CONNECT')

    assert.strictEqual(node.actualServiceState.value, 'activated')
    sinon.assert.calledWith(sendSpy, 'ACTIVATE')
  })

  it('runInitConnection should schedule connectClient', function () {
    const connectClient = sinon.spy()
    const node = {
      isFirstInitOfConnection: true,
      connectClient,
      updateServerinfo: sinon.spy(),
      generateEvent: () => ({}),
      emitGlobalStateChange: sinon.spy(),
      timerManager: {
        setTimeout: (fn, delay) => fn()
      },
      actualServiceStateBefore: { value: 'init' }
    }

    runInitConnection(node, {
      coreModbusQueue: { initQueue: sinon.spy() },
      verboseWarn: () => {},
      serialConnectionDelayTimeMS: 1,
      reconnectTimeMS: 2000,
      logHintText: ''
    })

    sinon.assert.calledOnce(connectClient)
  })

  it('closed state should not reconnect when closeIntent is stop', function () {
    const machine = createModbusFsm()
    const service = startFsmService(machine)
    const sendSpy = sinon.spy(service, 'send')

    const node = {
      actualServiceState: service.state,
      actualServiceStateBefore: service.state,
      bufferCommands: false,
      stateService: service,
      stateValidator: null,
      reconnectOnTimeout: true,
      getCloseIntent: () => 'stop',
      resetCloseIntent: sinon.spy(),
      setCloseIntent: sinon.spy(),
      updateServerinfo: sinon.spy(),
      generateEvent: (type, data) => ({ type, data }),
      emitGlobalStateChange: sinon.spy()
    }

    const handler = createFsmHandler(node, {
      coreModbusQueue: {
        queueSerialUnlockCommand: sinon.spy(),
        checkQueuesAreEmpty: () => true,
        dequeueCommand: sinon.spy()
      },
      verboseWarn: () => {},
      stateLog: () => {},
      reconnectTimeMS: 2000,
      logHintText: ''
    })

    service.subscribe(handler)
    service.send('CONNECT')
    service.send('CLOSE')

    sinon.assert.neverCalledWith(sendSpy, 'RECONNECT')
    sinon.assert.called(node.resetCloseIntent)
  })
})
