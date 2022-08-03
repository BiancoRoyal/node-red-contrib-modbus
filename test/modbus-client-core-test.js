/**
 Copyright (c) 2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
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
    it('should have new state after create', function (done) {
      const fsm = clientCore.createStateMachineService()
      assert.equal(fsm.initialState.value, 'new')
      done()
    })

    it('should change to INIT state', function (done) {
      const fsm = clientCore.createStateMachineService()
      const state = fsm.transition(fsm.initialState, 'INIT')
      assert.equal(state.value, 'init')
      done()
    })

    it('should change via service to INIT state', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.subscribe(state => {
        assert.equal(state.value, 'init')
        done()
      })
    })

    it('should change to STOPED while NEW state get stop', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('STOP')
      service.subscribe(state => {
        assert.equal(state.value, 'stopped')
        done()
      })
    })

    it('should change to OPENED from INIT state', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.send('OPENSERIAL')
      service.subscribe(state => {
        if (state.matches('opened')) {
          done()
        }
      })
    })

    it('should change to CONNECTED from INIT state', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.send('CONNECT')
      service.subscribe(state => {
        if (state.matches('connected')) {
          done()
        }
      })
    })

    it('should change to Serial CLOSED state', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.send('OPENSERIAL')
      service.send('CONNECT')
      service.send('CLOSE')
      service.subscribe(state => {
        if (state.matches('closed')) {
          done()
        }
      })
    })

    it('should change to TCP CLOSED state', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.send('CONNECT')
      service.send('CLOSE')
      service.subscribe(state => {
        if (state.matches('closed')) {
          done()
        }
      })
    })

    it('should change to TCP CLOSED state by list of transitions', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.send('CONNECT')
      service.send('CLOSE')
      service.subscribe(state => {
        if (state.matches('closed')) {
          done()
        }
      })
    })

    it('should change to Stopped state by list of transitions', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.send('CONNECT')
      service.send('FAILURE')
      service.send('STOP')
      service.subscribe(state => {
        if (state.matches('stopped')) {
          done()
        }
      })
    })

    it('should change to Stopped state on close', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.send('CONNECT')
      service.send('CLOSE')
      service.send('FAILURE')
      service.send('STOP')
      service.subscribe(state => {
        if (state.matches('stopped')) {
          done()
        }
      })
    })

    it('should change to Stopped state on close and try to queue', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.send('CONNECT')
      service.send('CLOSE')
      service.send('FAILURE')
      service.send('STOP')
      service.send('QUEUE')
      service.subscribe(state => {
        if (state.matches('stopped')) {
          done()
        }
      })
    })

    it('should change to Stopped state on close and try to activate', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.send('CONNECT')
      service.send('CLOSE')
      service.send('FAILURE')
      service.send('STOP')
      service.send('ACTIVATE')
      service.subscribe(state => {
        if (state.matches('stopped')) {
          done()
        }
      })
    })

    it('should change to Stopped state on close and try to renew', function (done) {
      const fsm = clientCore.createStateMachineService()
      const service = clientCore.startStateService(fsm)
      service.send('INIT')
      service.send('CONNECT')
      service.send('CLOSE')
      service.send('FAILURE')
      service.send('STOP')
      service.send('NEW')
      service.subscribe(state => {
        if (state.matches('new')) {
          done()
        }
      })
    })
  })
})
