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
        'type': 'modbus-server',
        'name': 'modbusServer',
        'logEnabled': true,
        'hostname': '127.0.0.1',
        'serverPort': '8502',
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
      }, {
        id: 'ce5293f4.1e1ac',
        type: 'modbus-client',
        name: 'modbusClient',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 8502,
        unit_id: 1,
        clientTimeout: 5000,
        reconnectTimeout: 5000
      }], function () {
        let modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        let modbusClient = helper.getNode('ce5293f4.1e1ac')
        modbusClient.should.have.property('name', 'modbusClient')

        let modbusGetter = helper.getNode('322daf89.be8dd')
        modbusGetter.should.have.property('name', 'modbusGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject should be loaded', function (done) {
      helper.load([injectNode, clientNode, serverNode, getterNode], [{
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
        'id': 'cea01c8.36f8f6',
        'type': 'modbus-getter',
        'name': '',
        'showStatusActivities': true,
        'showErrors': true,
        'unitid': '',
        'dataType': 'Coil',
        'adr': '0',
        'quantity': '10',
        'server': '92e7bf63.2efd7',
        'useIOFile': false,
        'ioFile': '',
        'useIOForPayload': false,
        'wires': [
          [
            'h1'
          ],
          []
        ]
      },
      {id: 'h1', type: 'helper'},
      {
        'id': 'a75e0ccf.e16628',
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
            'cea01c8.36f8f6'
          ]
        ]
      },
      {
        'id': '92e7bf63.2efd7',
        'type': 'modbus-client',
        'name': 'ModbusServer',
        'clienttype': 'tcp',
        'bufferCommands': true,
        'stateLogEnabled': true,
        'tcpHost': '127.0.0.1',
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
      helper.request().post('/modbus-getter/invalid').expect(404).end(done)
    })
  })
})
