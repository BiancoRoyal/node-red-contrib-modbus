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
var nodeUnderTest = require('../../src/modbus-write.js')
var helper = require('node-red-contrib-test-helper')

describe('Write node Testing', function () {
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
      helper.load([injectNode, clientNode, serverNode, nodeUnderTest], [{
        id: 'e54529b9.952ea8',
        type: 'modbus-server',
        name: 'modbusServer',
        logEnabled: false,
        serverPort: 8502,
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        wires: []
      }, {
        id: '8ad2951c.2df708',
        type: 'modbus-write',
        name: 'modbusWrite',
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
        z: '5dcb7dec.f36a24',
        name: 'modbusClient',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: 8502,
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

    it('simple flow with inject and write should be loaded', function (done) {
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
        'id': '1ed908da.427ecf',
        'type': 'modbus-write',
        'name': 'Write Reset FC5',
        'showStatusActivities': false,
        'showErrors': false,
        'unitid': '',
        'dataType': 'Coil',
        'adr': '64',
        'quantity': '1',
        'server': 'aef203cf.a23dc',
        'wires': [
          [
            'h1'
          ],
          [
          ]
        ]
      },
      {id: 'h1', type: 'helper'},
      {
        'id': '16b7697e.2baa47',
        'type': 'inject',
        'name': '',
        'topic': '',
        'payload': 'true',
        'payloadType': 'bool',
        'repeat': '1',
        'crontab': '',
        'once': false,
        'wires': [
          [
            '1ed908da.427ecf'
          ]
        ]
      },
      {
        'id': '5da6464f.441aa',
        'type': 'inject',
        'name': '',
        'topic': '',
        'payload': 'false',
        'payloadType': 'bool',
        'repeat': '1',
        'crontab': '',
        'once': false,
        'wires': [
          [
            '1ed908da.427ecf'
          ]
        ]
      },
      {
        'id': 'aef203cf.a23dc',
        'type': 'modbus-client',
        'name': 'Modbus Server',
        'clienttype': 'tcp',
        'bufferCommands': true,
        'stateLogEnabled': false,
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
      helper.request().post('/modbus-write/invalid').expect(404).end(done)
    })
  })
})
