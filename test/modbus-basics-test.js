/**
 Copyright (c) 2016,2017,2018,2019 Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

'use strict'

var assert = require('chai').assert

describe('Modbus Node basics Suite', function () {
  var basic = require('../src/modbus-basics')

  function checkStatus (statusProperty, fill, shape, text) {
    assert.equal(statusProperty.fill, fill)
    assert.equal(statusProperty.shape, shape)
    assert.equal(statusProperty.status, text)
  }

  describe('when using basics', function () {
    it('statusLog can become true', function () {
      assert.equal(false, basic.statusLog)
      basic.statusLog = true
      assert.equal(true, basic.statusLog)
    })

    it('gives time-unit name by string', function () {
      assert.equal(basic.get_timeUnit_name('ms'), 'msec.')
      assert.equal(basic.get_timeUnit_name('s'), 'sec.')
      assert.equal(basic.get_timeUnit_name('m'), 'min.')
      assert.equal(basic.get_timeUnit_name('h'), 'h.')
      assert.equal(basic.get_timeUnit_name(''), '')
    })

    it('calculating right rate by Unit', function () {
      assert.equal(basic.calc_rateByUnit(1, 'ms'), 1)
      assert.equal(basic.calc_rateByUnit(1, 's'), 1000)
      assert.equal(basic.calc_rateByUnit(1, 'm'), 60000)
      assert.equal(basic.calc_rateByUnit(1, 'h'), 3600000)
      assert.equal(basic.calc_rateByUnit(1, ''), 10000) // default is 10 sec.
    })

    it('Node status properties for connecting status', function () {
      var status = basic.setNodeStatusProperties('connecting')
      checkStatus(status, 'yellow', 'ring', 'connecting')
    })

    it('Node status properties for connected status', function () {
      var status = basic.setNodeStatusProperties('connected')
      checkStatus(status, 'green', 'ring', 'connected')
    })

    it('Node status properties for initialized status', function () {
      var status = basic.setNodeStatusProperties('initialized')
      checkStatus(status, 'yellow', 'dot', 'initialized')
    })

    it('Node status properties for active status', function () {
      var status = basic.setNodeStatusProperties('active')
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for active reading status', function () {
      var status = basic.setNodeStatusProperties('active reading', true)
      checkStatus(status, 'green', 'dot', 'active reading')
    })

    it('Node status properties for active writing status', function () {
      var status = basic.setNodeStatusProperties('active writing', true)
      checkStatus(status, 'green', 'dot', 'active writing')
    })

    it('Node status properties for active reading status not active', function () {
      var status = basic.setNodeStatusProperties('active reading', false)
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for active writing status not active', function () {
      var status = basic.setNodeStatusProperties('active writing', false)
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for test staus', function () {
      var status = basic.setNodeStatusProperties('test')
      checkStatus(status, 'yellow', 'ring', 'test')
    })

    it('Node status properties for disconnected staus', function () {
      var status = basic.setNodeStatusProperties('disconnected')
      checkStatus(status, 'red', 'ring', 'disconnected')
    })

    it('Node status properties for terminated staus', function () {
      var status = basic.setNodeStatusProperties('terminated')
      checkStatus(status, 'red', 'ring', 'terminated')
    })

    it('Node status properties for polling staus', function () {
      var status = basic.setNodeStatusProperties('polling', true)
      checkStatus(status, 'green', 'ring', 'polling')
    })

    it('Node status properties for polling staus', function () {
      var status = basic.setNodeStatusProperties('polling', false)
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for polling staus', function () {
      var status = basic.setNodeStatusProperties()
      checkStatus(status, 'blue', 'ring', 'waiting ...')
    })

    it('Node status properties for polling staus', function () {
      var status = basic.setNodeStatusProperties('waiting')
      checkStatus(status, 'blue', 'ring', 'waiting ...')
    })
  })
})
