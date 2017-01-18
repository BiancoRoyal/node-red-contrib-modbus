/**

 The BSD 3-Clause License

 Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation and/or
 other materials provided with the distribution.

 3. Neither the name of the copyright holder nor the names of its contributors may be
 used to endorse or promote products derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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
      var status = basic.set_node_status_properties('connecting')
      checkStatus(status, 'yellow', 'ring', 'connecting')
    })

    it('Node status properties for connected status', function () {
      var status = basic.set_node_status_properties('connected')
      checkStatus(status, 'green', 'ring', 'connected')
    })

    it('Node status properties for initialized status', function () {
      var status = basic.set_node_status_properties('initialized')
      checkStatus(status, 'yellow', 'dot', 'initialized')
    })

    it('Node status properties for active status', function () {
      var status = basic.set_node_status_properties('active')
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for active reading status', function () {
      var status = basic.set_node_status_properties('active reading', true)
      checkStatus(status, 'green', 'dot', 'active reading')
    })

    it('Node status properties for active writing status', function () {
      var status = basic.set_node_status_properties('active writing', true)
      checkStatus(status, 'green', 'dot', 'active writing')
    })

    it('Node status properties for active reading status not active', function () {
      var status = basic.set_node_status_properties('active reading', false)
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for active writing status not active', function () {
      var status = basic.set_node_status_properties('active writing', false)
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for test staus', function () {
      var status = basic.set_node_status_properties('test')
      checkStatus(status, 'yellow', 'ring', 'test')
    })

    it('Node status properties for disconnected staus', function () {
      var status = basic.set_node_status_properties('disconnected')
      checkStatus(status, 'red', 'ring', 'disconnected')
    })

    it('Node status properties for terminated staus', function () {
      var status = basic.set_node_status_properties('terminated')
      checkStatus(status, 'red', 'ring', 'terminated')
    })

    it('Node status properties for polling staus', function () {
      var status = basic.set_node_status_properties('polling', true)
      checkStatus(status, 'green', 'ring', 'polling')
    })

    it('Node status properties for polling staus', function () {
      var status = basic.set_node_status_properties('polling', false)
      checkStatus(status, 'green', 'dot', 'active')
    })

    it('Node status properties for polling staus', function () {
      var status = basic.set_node_status_properties()
      checkStatus(status, 'blue', 'ring', 'waiting ...')
    })

    it('Node status properties for polling staus', function () {
      var status = basic.set_node_status_properties('waiting')
      checkStatus(status, 'blue', 'ring', 'waiting ...')
    })
  })
})
