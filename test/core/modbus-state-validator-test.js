/**
 * Modbus State Validator tests (v6 — 12 states)
 */
'use strict'

const assert = require('assert')
const { ModbusStateValidator } = require('../../src/core/modbus-state-validator')

describe('ModbusStateValidator v6', function () {
  let validator

  beforeEach(function () {
    validator = new ModbusStateValidator()
  })

  it('should accept valid v6 transition init -> connected', function () {
    const result = validator.validateTransition('init', 'connected')
    assert.strictEqual(result.valid, true)
  })

  it('should reject removed v5 state reading', function () {
    assert.strictEqual(validator.validTransitions.reading, undefined)
  })

  it('should detect stuck queueing state', function () {
    for (let i = 0; i < 20; i++) {
      validator.recordStateChange('queueing')
    }
    const report = validator.detectDeadlock()
    assert.strictEqual(report.hasDeadlock, true)
    assert.strictEqual(report.stuckState, 'queueing')
  })
})
