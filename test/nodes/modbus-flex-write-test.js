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

var injectNode = require('node-red/nodes/core/core/20-inject.js')
var clientNode = require('../../src//modbus-client.js')
var serverNode = require('../../src/modbus-server.js')
var writeNode  = require('../../src/modbus-flex-write.js')

var helper = require('node-red-contrib-test-helper')

describe('Flex Write node Testing', function () {
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
      helper.load([injectNode, clientNode, serverNode, writeNode], [{
        id: 'e54529b9.952ea8',
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
        id: '8ad2951c.2df708',
        type: 'modbus-flex-write',
        name: 'modbusFlexWrite',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '1',
        server: 'dc764ad7.580238',
        wires: [[], []]
      }, {
        id: '67dded7e.025904',
        type: 'inject',
        name: 'injectTrue',
        topic: '',
        payload: true,
        payloadType: 'bool',
        repeat: '',
        crontab: '',
        once: false,
        wires: [['8ad2951c.2df708']]
      }, {
        id: 'dc764ad7.580238',
        type: 'modbus-client',
        name: 'modbusClient',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 7502,
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

        var modbusFlexWrite = helper.getNode('8ad2951c.2df708')
        modbusFlexWrite.should.have.property('name', 'modbusFlexWrite')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-write/invalid').expect(404).end(done)
    })
  })
})
