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

var clientNode = require('../../src/modbus-client.js')
var serverNode = require('../../src/modbus-server.js')
var readNode = require('../../src/modbus-read.js')
var helper = require('node-red-contrib-test-helper')

describe('Read node Testing', function () {
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
      helper.load([clientNode, serverNode, readNode], [{
        id: 'e54529b9.952ea8',
        type: 'modbus-server',
        z: '5dcb7dec.f36a24',
        name: 'modbusServer',
        logEnabled: false,
        serverPort: 8502,
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        x: 260,
        y: 200,
        wires: []
      }, {
        id: 'b9cf4e9c.4d53a',
        type: 'modbus-read',
        z: '5dcb7dec.f36a24',
        name: 'modbusRead',
        dataType: 'HoldingRegister',
        adr: 0,
        quantity: 10,
        rate: 1,
        rateUnit: 's',
        server: 'dc764ad7.580238',
        x: 340,
        y: 260,
        wires: [[], []]
      }, {
        id: 'dc764ad7.580238',
        type: 'modbus-client',
        z: '5dcb7dec.f36a24',
        name: 'modbusClient',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 8502,
        unit_id: '1',
        clientTimeout: 5000,
        reconnectTimeout: 5000
      }], function () {
        var modbusServer = helper.getNode('e54529b9.952ea8')
        modbusServer.should.have.property('name', 'modbusServer')

        var modbusClient = helper.getNode('dc764ad7.580238')
        modbusClient.should.have.property('name', 'modbusClient')

        var modbusRead = helper.getNode('b9cf4e9c.4d53a')
        modbusRead.should.have.property('name', 'modbusRead')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-read/invalid').expect(404).end(done)
    })
  })
})
