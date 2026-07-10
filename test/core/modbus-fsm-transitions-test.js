/**
 * v6 FSM transition tests — 12-state graph
 */
'use strict'

const assert = require('assert')
const {
  V6_FSM_STATES,
  createModbusFsm,
  startFsmService
} = require('../../src/core/client/modbus-fsm')

describe('Modbus FSM v6 Transitions', function () {
  let service

  function state () {
    return service.state.value
  }

  function send (event) {
    service.send(event)
  }

  beforeEach(function () {
    service = startFsmService(createModbusFsm())
  })

  describe('configuration', function () {
    it('should define exactly 12 states', function () {
      assert.strictEqual(V6_FSM_STATES.length, 12)
    })

    it('should start in init (not legacy new)', function () {
      assert.strictEqual(state(), 'init')
    })

    it('should not include removed v5 states', function () {
      const removed = ['new', 'reading', 'writing', 'empty']
      removed.forEach(function (name) {
        assert.strictEqual(V6_FSM_STATES.includes(name), false)
      })
    })
  })

  describe('connection lifecycle', function () {
    it('init + CONNECT → connected', function () {
      send('CONNECT')
      assert.strictEqual(state(), 'connected')
    })

    it('init + OPENSERIAL → opened + CONNECT → connected', function () {
      send('OPENSERIAL')
      assert.strictEqual(state(), 'opened')
      send('CONNECT')
      assert.strictEqual(state(), 'connected')
    })

    it('connected + ACTIVATE → activated', function () {
      send('CONNECT')
      send('ACTIVATE')
      assert.strictEqual(state(), 'activated')
    })

    it('activated + QUEUE → queueing + SEND → sending + ACTIVATE → activated', function () {
      send('CONNECT')
      send('ACTIVATE')
      send('QUEUE')
      assert.strictEqual(state(), 'queueing')
      send('SEND')
      assert.strictEqual(state(), 'sending')
      send('ACTIVATE')
      assert.strictEqual(state(), 'activated')
    })
  })

  describe('reconnect lifecycle', function () {
    it('connected + CLOSE → closed + RECONNECT → reconnecting + INIT → init', function () {
      send('CONNECT')
      send('CLOSE')
      assert.strictEqual(state(), 'closed')
      send('RECONNECT')
      assert.strictEqual(state(), 'reconnecting')
      send('INIT')
      assert.strictEqual(state(), 'init')
    })

    it('failed + CLOSE → closed', function () {
      send('FAILURE')
      assert.strictEqual(state(), 'failed')
      send('CLOSE')
      assert.strictEqual(state(), 'closed')
    })
  })

  describe('error paths', function () {
    it('init + BREAK → broken + RECONNECT → reconnecting', function () {
      send('BREAK')
      assert.strictEqual(state(), 'broken')
      send('RECONNECT')
      assert.strictEqual(state(), 'reconnecting')
    })

    it('init + FAILURE → failed', function () {
      send('FAILURE')
      assert.strictEqual(state(), 'failed')
    })

    it('sending + BREAK → broken', function () {
      send('CONNECT')
      send('ACTIVATE')
      send('QUEUE')
      send('SEND')
      send('BREAK')
      assert.strictEqual(state(), 'broken')
    })
  })

  describe('dynamic switch', function () {
    it('init + SWITCH → switch + CLOSE → closed', function () {
      send('SWITCH')
      assert.strictEqual(state(), 'switch')
      send('CLOSE')
      assert.strictEqual(state(), 'closed')
    })
  })

  describe('stop', function () {
    it('any state + STOP → stopped', function () {
      send('CONNECT')
      send('STOP')
      assert.strictEqual(state(), 'stopped')
    })

    it('stopped + INIT → init (replaces legacy NEW → new)', function () {
      send('STOP')
      send('INIT')
      assert.strictEqual(state(), 'init')
    })
  })
})
