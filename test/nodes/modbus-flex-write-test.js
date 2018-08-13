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
var functionNode = require('node-red/nodes/core/core/80-function.js')
var clientNode = require('../../src/modbus-client.js')
var serverNode = require('../../src/modbus-server.js')
var nodeUnderTest = require('../../src/modbus-flex-write.js')

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
      helper.load([injectNode, clientNode, serverNode, nodeUnderTest], [{
        id: 'e54529b9.952ea8',
        'type': 'modbus-server',
        'name': 'modbusServer',
        'logEnabled': true,
        'hostname': '127.0.0.1',
        'serverPort': '9502',
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
        clientTimeout: 1000,
        reconnectTimeout: 500
      }], function () {
        let inject = helper.getNode('67dded7e.025904')
        inject.should.have.property('name', 'injectTrue')

        let modbusServer = helper.getNode('e54529b9.952ea8')
        modbusServer.should.have.property('name', 'modbusServer')

        let modbusClient = helper.getNode('dc764ad7.580238')
        modbusClient.should.have.property('name', 'modbusClient')

        let modbusFlexWrite = helper.getNode('8ad2951c.2df708')
        modbusFlexWrite.should.have.property('name', 'modbusFlexWrite')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject and write should be loaded', function (done) {
      helper.load([injectNode, functionNode, clientNode, serverNode, nodeUnderTest], [
        {
          id: 'e54529b9.952ea8',
          'type': 'modbus-server',
          'name': '',
          'logEnabled': true,
          'hostname': '127.0.0.1',
          'serverPort': '9502',
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
          'id': '6b6ba9f3.be6d08',
          'type': 'inject',
          'name': 'Write multiple!',
          'topic': '',
          'payload': '[1,2,3,4,5,6,7,8,9,10]',
          'payloadType': 'json',
          'repeat': '1',
          'crontab': '',
          'once': true,
          'onceDelay': '',
          'wires': [
            [
              'a6198baa.640d28'
            ]
          ]
        },
        {
          'id': 'a6198baa.640d28',
          'type': 'function',
          'name': 'Write 0-9 on Unit 1 FC15',
          'func': "msg.payload = { value: msg.payload, 'fc': 15, 'unitid': 1, 'address': 0 , 'quantity': 10 };\nreturn msg;",
          'outputs': 1,
          'noerr': 0,
          'wires': [
            [
              'b487e6c7.60263'
            ]
          ]
        },
        {
          'id': 'b487e6c7.60263',
          'type': 'modbus-flex-write',
          'name': '',
          'showStatusActivities': false,
          'showErrors': false,
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
          'id': 'aef203cf.a23dc',
          'type': 'modbus-client',
          'z': '',
          'name': 'Modbus Server',
          'clienttype': 'tcp',
          'bufferCommands': true,
          'stateLogEnabled': false,
          'tcpHost': '127.0.0.1',
          'tcpPort': '9502',
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
      helper.request().post('/modbus-flex-write/invalid').expect(404).end(done)
    })
  })
})
