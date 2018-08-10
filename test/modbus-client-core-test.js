/**
 Copyright (c) 2017,2018 Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

'use strict'

var assert = require('chai').assert

describe('Modbus Client Core Suite', function () {
  var clientCore = require('../src/core/modbus-client-core')

  describe('Network Errors', function () {
    it('network error EHOSTUNREACH should exist', function () {
      assert.equal(true, clientCore.networkErrors.includes('EHOSTUNREACH'))
    })
  })

  describe('FSM states', function () {
    it('should have NEW state after create', function (done) {
      let fsm = clientCore.createStatelyMachine()
      assert.equal(fsm.getMachineState(), 'NEW')
      done()
    })

    it('should change to INIT state', function (done) {
      let fsm = clientCore.createStatelyMachine()
      assert.equal(fsm.init().getMachineState(), 'INIT')
      done()
    })

    it('should change to STOPED while NEW state get stop', function (done) {
      let fsm = clientCore.createStatelyMachine()
      assert.equal(fsm.stop().getMachineState(), 'STOPED')
      done()
    })

    it('should change to OPENED from INIT state', function (done) {
      let fsm = clientCore.createStatelyMachine()
      assert.equal(fsm.init().openserial().getMachineState(), 'OPENED')
      done()
    })

    it('should change to CONNECTED from INIT state', function (done) {
      let fsm = clientCore.createStatelyMachine()
      assert.equal(fsm.init().connect().getMachineState(), 'CONNECTED')
      done()
    })

    it('should change to Serial CLOSED state', function (done) {
      let fsm = clientCore.createStatelyMachine()
      assert.equal(fsm.init().openserial().connect().close().getMachineState(), 'CLOSED')
      done()
    })

    it('should change to TCP CLOSED state', function (done) {
      let fsm = clientCore.createStatelyMachine()
      assert.equal(fsm.init().connect().close().getMachineState(), 'CLOSED')
      done()
    })
  })
})
