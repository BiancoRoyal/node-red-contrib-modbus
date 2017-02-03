/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 * Copyright 2016-2017 Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

var injectNode = require('node-red/nodes/core/core/20-inject.js')
var clientNode = require('../src/modbus-client.js')
var serverNode = require('../src/modbus-server.js')
var writeNode = require('../src/modbus-write.js')
var helper = require('../src/testing/nodered-helper.js')

describe('Getter node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node', function () {
    it('simple Node should be loaded', function (done) {
      helper.load([injectNode, clientNode, serverNode, writeNode], [{
        id: 'e54529b9.952ea8',
        type: 'modbus-server',
        z: '5dcb7dec.f36a24',
        name: 'modbusServer',
        logEnabled: false,
        serverPort: 11502,
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        x: 260,
        y: 200,
        wires: []
      }, {
        id: '8ad2951c.2df708',
        type: 'modbus-write',
        z: '5dcb7dec.f36a24',
        name: 'modbusWrite',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '1',
        server: 'dc764ad7.580238',
        x: 400,
        y: 260,
        wires: [[], []]
      }, {
        id: '67dded7e.025904',
        type: 'inject',
        z: '5dcb7dec.f36a24',
        name: 'injectTrue',
        topic: '',
        payload: true,
        payloadType: 'bool',
        repeat: '',
        crontab: '',
        once: false,
        x: 250,
        y: 260,
        wires: [['8ad2951c.2df708']]
      }, {
        id: 'dc764ad7.580238',
        type: 'modbus-client',
        z: '5dcb7dec.f36a24',
        name: 'modbusClient',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 11502,
        unit_id: 1,
        clientTimeout: 5000,
        reconnectTimeout: 5000
      }], function () {
        var inject = helper.getNode('67dded7e.025904')
        inject.should.have.property('name', 'injectTrue')

        var modbusServer = helper.getNode('e54529b9.952ea8')
        modbusServer.should.have.property('name', 'modbusServer')

        var modbusClient = helper.getNode('dc764ad7.580238')
        modbusClient.should.have.property('name', 'modbusClient')

        var modbusWrite = helper.getNode('8ad2951c.2df708')
        modbusWrite.should.have.property('name', 'modbusWrite')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-write/invalid').expect(404).end(done)
    })
  })
})
