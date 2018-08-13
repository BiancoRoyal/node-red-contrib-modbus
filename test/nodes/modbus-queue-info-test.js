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
var clientNode = require('../../src/modbus-client.js')
var serverNode = require('../../src/modbus-server.js')
var nodeUnderTest = require('../../src/modbus-queue-info.js')
var helper = require('node-red-contrib-test-helper')

describe('Queue Info node Testing', function () {
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
      helper.load([clientNode, serverNode, nodeUnderTest], [{
        id: 'e54529b9.952ea8',
        type: 'modbus-server',
        name: 'modbusServer',
        logEnabled: false,
        serverPort: 9502,
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        wires: []
      }, {
        id: 'b9cf4e9c.4d53a',
        type: 'modbus-queue-info',
        name: 'modbusQueueInfo',
        unitid: 1,
        server: 'dc764ad7.580238',
        wires: [[], []]
      }, {
        id: 'dc764ad7.580238',
        type: 'modbus-client',
        z: '5dcb7dec.f36a24',
        name: 'modbusClient',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 9502,
        unit_id: 1,
        clientTimeout: 1000,
        reconnectTimeout: 500
      }], function () {
        var modbusServer = helper.getNode('e54529b9.952ea8')
        modbusServer.should.have.property('name', 'modbusServer')

        var modbusClient = helper.getNode('dc764ad7.580238')
        modbusClient.should.have.property('name', 'modbusClient')

        var modbusQueueInfo = helper.getNode('b9cf4e9c.4d53a')
        modbusQueueInfo.should.have.property('name', 'modbusQueueInfo')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject should be loaded', function (done) {
      helper.load([injectNode, clientNode, serverNode, nodeUnderTest], [{
        'id': '445454e4.968564',
        'type': 'modbus-server',
        'name': '',
        'logEnabled': true,
        'hostname': '127.0.0.1',
        'serverPort': '7502',
        'responseDelay': 100,
        'delayUnit': 'ms',
        'coilsBufferSize': 10000,
        'holdingBufferSize': 10000,
        'inputBufferSize': 10000,
        'discreteBufferSize': 10000,
        'showErrors': false,
        'wires': [
          [],
          [],
          []
        ]
      },
      {
        'id': '5fffb0bc.0b8a5',
        'type': 'modbus-queue-info',
        'name': 'QueueInfo',
        'topic': '',
        'unitid': '',
        'lowLowLevel': 25,
        'lowLevel': 75,
        'highLevel': 150,
        'highHighLevel': 300,
        'server': '1e3ac4ea.86fa7b',
        'errorOnHighLevel': false,
        'wires': [
          ['h1']
        ]
      },
      {
        'id': 'ae473c43.3e7938',
        'type': 'inject',
        'name': '',
        'topic': '',
        'payload': '',
        'payloadType': 'date',
        'repeat': '1',
        'crontab': '',
        'once': true,
        'onceDelay': 0.1,
        'wires': [
          [
            '5fffb0bc.0b8a5'
          ]
        ]
      },
      {id: 'h1', type: 'helper'},
      {
        'id': '1e3ac4ea.86fa7b',
        'type': 'modbus-client',
        'z': '',
        'name': 'ModbsuFlexServer',
        'clienttype': 'tcp',
        'bufferCommands': true,
        'stateLogEnabled': true,
        'tcpHost': '192.168.1.103',
        'tcpPort': '7502',
        'tcpType': 'DEFAULT',
        'serialPort': '/dev/ttyUSB',
        'serialType': 'RTU-BUFFERD',
        'serialBaudrate': '9600',
        'serialDatabits': '8',
        'serialStopbits': '1',
        'serialParity': 'none',
        'serialConnectionDelay': '100',
        'unit_id': '1',
        'commandDelay': '1',
        'clientTimeout': '1000',
        'reconnectTimeout': '500'
      }
      ], function () {
        let h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          done()
        })
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
