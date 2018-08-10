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
var ioConfigNode = require('../../src/modbus-io-config')
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
        name: 'modbusServer',
        logEnabled: false,
        serverPort: 8502,
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        discreteBufferSize: 1024,
        wires: []
      }, {
        id: 'b9cf4e9c.4d53a',
        type: 'modbus-read',
        name: 'modbusRead',
        dataType: 'HoldingRegister',
        adr: 0,
        quantity: 10,
        rate: 1,
        rateUnit: 's',
        server: 'dc764ad7.580238',
        wires: [[], []]
      }, {
        id: 'dc764ad7.580238',
        type: 'modbus-client',
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

    it('simple Node should send message', function (done) {
      helper.load([clientNode, serverNode, readNode], [
        {
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
          'id': '90922127.397cb8',
          'type': 'modbus-read',
          'name': 'Modbus Read With IO',
          'topic': '',
          'showStatusActivities': false,
          'showErrors': false,
          'unitid': '',
          'dataType': 'Coil',
          'adr': '0',
          'quantity': '10',
          'rate': '200',
          'rateUnit': 'ms',
          'delayOnStart': false,
          'startDelayTime': '',
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

    it('simple Node should send message with IO', function (done) {
      helper.load([clientNode, serverNode, ioConfigNode, readNode], [
        {
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
          'id': '90922127.397cb8',
          'type': 'modbus-read',
          'name': 'Modbus Read With IO',
          'topic': '',
          'showStatusActivities': false,
          'showErrors': false,
          'unitid': '',
          'dataType': 'Coil',
          'adr': '0',
          'quantity': '10',
          'rate': '200',
          'rateUnit': 'ms',
          'delayOnStart': false,
          'startDelayTime': '',
          'server': '92e7bf63.2efd7',
          'useIOFile': true,
          'ioFile': 'e0519b16.5fcdd',
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
        },
        {
          'id': 'e0519b16.5fcdd',
          'type': 'modbus-io-config',
          'name': 'TestIOFile',
          'path': './resources/device.json',
          'format': 'utf8',
          'addressOffset': ''
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
