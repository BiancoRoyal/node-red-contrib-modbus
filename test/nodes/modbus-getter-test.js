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
var getterNode = require('../../src/modbus-getter.js')
var helper = require('node-red-contrib-test-helper')

describe('Getter node Testing', function () {
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
      helper.load([clientNode, serverNode, getterNode], [{
        id: '322daf89.be8dd',
        type: 'modbus-getter',
        name: 'modbusGetter',
        dataType: 'Coil',
        adr: 0,
        quantity: 1,
        server: 'ce5293f4.1e1ac',
        wires: [[], [], []]
      }, {
        id: '996023fe.ea04b',
        type: 'modbus-server',
        name: 'modbusServer',
        logEnabled: false,
        serverPort: 7502,
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        wires: []
      }, {
        id: 'ce5293f4.1e1ac',
        type: 'modbus-client',
        name: 'modbusClient',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 7502,
        unit_id: 1,
        clientTimeout: 5000,
        reconnectTimeout: 5000
      }], function () {
        var modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        var modbusClient = helper.getNode('ce5293f4.1e1ac')
        modbusClient.should.have.property('name', 'modbusClient')

        var modbusGetter = helper.getNode('322daf89.be8dd')
        modbusGetter.should.have.property('name', 'modbusGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-getter/invalid').expect(404).end(done)
    })
  })
})
