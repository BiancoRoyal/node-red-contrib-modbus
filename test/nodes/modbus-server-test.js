/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018 Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

var serverNode = require('../../src/modbus-server.js')
var helper = require('node-red-contrib-test-helper')

describe('Server node Testing', function () {
  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      done()
    }).catch(function () {
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('Node', function () {
    it('simple Node should be loaded', function (done) {
      helper.load(serverNode, [{
        id: '8cd6ca70.0dd188',
        type: 'modbus-server',
        name: 'modbusServer',
        logEnabled: false,
        serverPort: 6502,
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        discreteBufferSize: 1024,
        wires: []
      }], function () {
        var modbusServer = helper.getNode('8cd6ca70.0dd188')
        modbusServer.should.have.property('name', 'modbusServer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-server/invalid').expect(404).end(done)
    })
  })
})
