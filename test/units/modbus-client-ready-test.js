/**
 * v6 ready-to-send gate tests (Task 4 / Task 11)
 */
'use strict'

const assert = require('assert')
const sinon = require('sinon')
const { isClientReadyToSend, isClientInactive } = require('../../src/core/client/modbus-client-state')
const mbBasics = require('../../src/modbus-basics')

describe('Modbus Client Ready-to-Send v6', function () {
  it('isClientInactive should be true when state not in messageAllowedStates', function () {
    const client = {
      actualServiceState: { value: 'connected' },
      messageAllowedStates: ['']
    }
    assert.strictEqual(isClientInactive(client), true)
  })

  it('isClientInactive should be false when state is allowed', function () {
    const client = {
      actualServiceState: { value: 'activated' },
      messageAllowedStates: ['activated', 'queueing']
    }
    assert.strictEqual(isClientInactive(client), false)
  })

  it('should be inactive when first loaded (no FSM state yet)', function () {
    const client = {
      messageAllowedStates: ['activated']
    }
    assert.strictEqual(isClientInactive(client), true)
  })

  it('isClientReadyToSend should reject connected state', function () {
    const client = {
      actualServiceState: { value: 'connected' },
      messageAllowedStates: ['activated']
    }
    assert.strictEqual(isClientReadyToSend(client), false)
  })

  it('isClientReadyToSend should accept activated state', function () {
    const client = {
      actualServiceState: { value: 'activated' },
      messageAllowedStates: ['activated']
    }
    assert.strictEqual(isClientReadyToSend(client), true)
  })

  it('guardClientReadyToSend should warn when not ready', function () {
    const warnFn = sinon.spy()
    const client = {
      isClientReadyToSend: () => false
    }
    const node = { showWarnings: true, suppressNotReadyWarnings: false }

    assert.strictEqual(mbBasics.guardClientReadyToSend(client, node, warnFn), false)
    sinon.assert.calledOnce(warnFn)
  })

  it('guardClientReadyToSend should suppress warning when configured', function () {
    const warnFn = sinon.spy()
    const client = {
      isClientReadyToSend: () => false
    }
    const node = { showWarnings: true, suppressNotReadyWarnings: true }

    assert.strictEqual(mbBasics.guardClientReadyToSend(client, node, warnFn), false)
    sinon.assert.notCalled(warnFn)
  })
})
