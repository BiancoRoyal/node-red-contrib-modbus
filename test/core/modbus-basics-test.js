/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

'use strict'

const assert = require('assert')
const sinon = require('sinon')
const helper = require('node-red-node-test-helper')

helper.init(require.resolve('node-red'))

describe('Modbus Node basics Suite', function () {
  const basic = require('../../src/modbus-basics')

  function checkStatus (statusProperty, fill, shape, text) {
    assert.strict.equal(statusProperty.fill, fill)
    assert.strict.equal(statusProperty.shape, shape)
    assert.strict.equal(statusProperty.status, text)
  }

  describe('when using basics', function () {
    it('statusLog can become true', function () {
      assert.strict.equal(false, basic.statusLog)
      basic.statusLog = true
      assert.strict.equal(true, basic.statusLog)
    })

    it('gives time-unit name by string', function () {
      assert.strict.equal(basic.get_timeUnit_name('ms'), 'msec.')
      assert.strict.equal(basic.get_timeUnit_name('s'), 'sec.')
      assert.strict.equal(basic.get_timeUnit_name('m'), 'min.')
      assert.strict.equal(basic.get_timeUnit_name('h'), 'h.')
      assert.strict.equal(basic.get_timeUnit_name(''), '')
    })

    it('calculating right rate by Unit', function () {
      assert.strict.equal(basic.calc_rateByUnit(1, 'ms'), 1)
      assert.strict.equal(basic.calc_rateByUnit(1, 's'), 1000)
      assert.strict.equal(basic.calc_rateByUnit(1, 'm'), 60000)
      assert.strict.equal(basic.calc_rateByUnit(1, 'h'), 3600000)
      assert.strict.equal(basic.calc_rateByUnit(1, ''), 10000) // default is 10 sec.
    })

    it('Node status properties for connecting status', function () {
      const status = basic.setNodeStatusProperties('connecting')
      checkStatus(status, 'yellow', 'ring', 'connecting')
    })

    it('Node status properties for connected status', function () {
      const status = basic.setNodeStatusProperties('connected')
      checkStatus(status, 'green', 'ring', 'connected')
    })

    it('Node status properties for initialized status', function () {
      const status = basic.setNodeStatusProperties('initialized')
      checkStatus(status, 'yellow', 'dot', 'initialized')
    })

    it('Node status properties for active status', function () {
      const status = basic.setNodeStatusProperties('active')
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for active reading status', function () {
      const status = basic.setNodeStatusProperties('active reading', true)
      checkStatus(status, 'green', 'dot', 'active reading')
    })

    it('Node status properties for active writing status', function () {
      const status = basic.setNodeStatusProperties('active writing', true)
      checkStatus(status, 'green', 'dot', 'active writing')
    })

    it('Node status properties for active reading status not active', function () {
      const status = basic.setNodeStatusProperties('active reading', false)
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for active writing status not active', function () {
      const status = basic.setNodeStatusProperties('active writing', false)
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for test status', function () {
      const status = basic.setNodeStatusProperties('test')
      checkStatus(status, 'yellow', 'ring', 'test')
    })

    it('Node status properties for disconnected status', function () {
      const status = basic.setNodeStatusProperties('disconnected')
      checkStatus(status, 'red', 'ring', 'disconnected')
    })

    it('Node status properties for terminated status', function () {
      const status = basic.setNodeStatusProperties('terminated')
      checkStatus(status, 'red', 'ring', 'terminated')
    })

    it('Node status properties for polling status', function () {
      const status = basic.setNodeStatusProperties('polling', true)
      checkStatus(status, 'green', 'ring', 'polling')
    })

    it('Node status properties for polling status', function () {
      const status = basic.setNodeStatusProperties('polling', false)
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for polling status', function () {
      const status = basic.setNodeStatusProperties()
      checkStatus(status, 'blue', 'ring', 'waiting ...')
    })

    it('Node status properties for polling status', function () {
      const status = basic.setNodeStatusProperties('waiting')
      checkStatus(status, 'blue', 'ring', 'waiting ...')
    })

    it('Node status properties for stopped status value', function () {
      const status = basic.setNodeStatusProperties({ value: 'stopped' })
      checkStatus(status, 'red', 'dot', 'stopped')
    })

    it('should send an empty message on failure when node.emptyMsgOnFail is true', function () {
      const node = {
        emptyMsgOnFail: true,
        send: sinon.spy(),
        statusText: 'error'
      }
      const err = new Error('Test error')
      const msg = { payload: 'initial' }

      basic.sendEmptyMsgOnFail(node, err, msg)

      assert(node.send.calledOnce)
      assert.deepStrictEqual(msg.payload, '')
      assert(err instanceof Error)
      assert.deepStrictEqual(msg.error, err)
      assert.strictEqual(msg.error.nodeStatus, 'error')
    })

    it('should set node status to \'not ready to reconnect\' when error message is \'FSM Not Ready To Reconnect\'', () => {
      const node = { showErrors: true }
      const modbusClient = {}
      const err = { message: 'FSM Not Ready To Reconnect' }
      const setNodeStatusTo = sinon.stub(basic, 'setNodeStatusTo')

      basic.setModbusError(node, modbusClient, err, null)

      assert(setNodeStatusTo.calledOnceWithExactly('not ready to reconnect', node))

      setNodeStatusTo.restore()
    })

    it('should set node status to blue and dot with text "waiting ..." when statusValue is "waiting"', () => {
      const node = { status: sinon.spy() }
      const response = 'waiting ...'
      basic.setNodeStatusByResponseTo('waiting', response, node)
      sinon.assert.calledWith(node.status, { fill: 'blue', shape: 'dot', text: '\'waiting ...\'' })
    })
    it('should return correct properties for "error" status', function () {
      const status = basic.setNodeStatusProperties({ value: 'error' })
      assert.deepStrictEqual(status, {
        fill: 'red',
        shape: 'ring',
        status: 'error'
      })
    })

    it('should return correct properties for "timeout" status', function () {
      const status = basic.setNodeStatusProperties('timeout')
      assert.deepStrictEqual(status, {
        fill: 'red',
        shape: 'ring',
        status: 'timeout'
      })
    })
  })
})
