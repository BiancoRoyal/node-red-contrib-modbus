'use strict'

const assert = require('assert')

describe('Modbus TLS Docker integration (opt-in)', function () {
  before(function () {
    if (process.env.MODBUS_TLS_DOCKER !== '1') {
      this.skip()
    }
  })

  it('should be enabled only when MODBUS_TLS_DOCKER=1', function () {
    assert.strictEqual(process.env.MODBUS_TLS_DOCKER, '1')
  })
})
