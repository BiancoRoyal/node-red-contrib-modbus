/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018,2019,2020,2021 Klaus Landsdorf (https://bianco-royal.space/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

var serverNode = require('../../src/modbus-server.js')
var nodeUnderTest = require('../../src/modbus-client.js')
var readNode = require('../../src/modbus-read.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const simpleReadWithClient = [
  {
    id: '445454e4.968564',
    type: 'modbus-server',
    name: '',
    logEnabled: true,
    hostname: '0.0.0.0',
    serverPort: '9503',
    responseDelay: 100,
    delayUnit: 'ms',
    coilsBufferSize: 10000,
    holdingBufferSize: 10000,
    inputBufferSize: 10000,
    discreteBufferSize: 10000,
    showErrors: false,
    wires: [
      [],
      [],
      []
    ]
  },
  {
    id: '384fb9f1.e96296',
    type: 'modbus-read',
    name: '',
    topic: '',
    showStatusActivities: false,
    showErrors: false,
    unitid: '',
    dataType: 'Coil',
    adr: '0',
    quantity: '10',
    rate: '1',
    rateUnit: 's',
    delayOnStart: false,
    startDelayTime: '',
    server: '466860d5.3f6358',
    useIOFile: false,
    ioFile: '',
    useIOForPayload: false,
    wires: [
      [
        'h1'
      ],
      [
        'h2'
      ]
    ]
  },
  { id: 'h1', type: 'helper' },
  { id: 'h2', type: 'helper' },
  {
    id: '466860d5.3f6358',
    type: 'modbus-client',
    name: 'ModbusClientRead',
    clienttype: 'tcp',
    bufferCommands: true,
    stateLogEnabled: false,
    tcpHost: '127.0.0.1',
    tcpPort: '9503',
    tcpType: 'DEFAULT',
    serialPort: '/dev/ttyUSB',
    serialType: 'RTU-BUFFERD',
    serialBaudrate: '9600',
    serialDatabits: '8',
    serialStopbits: '1',
    serialParity: 'none',
    serialConnectionDelay: '100',
    unit_id: '1',
    commandDelay: '1',
    clientTimeout: '100',
    reconnectDelay: 200,
    reconnectOnTimeout: true,
    connectionTimeout: 10000
  }
]

describe('Client node Testing', function () {
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
    it('should be loaded with TCP DEFAULT', function (done) {
      helper.load([readNode, nodeUnderTest], [{
        id: '466860d5.3f6358',
        type: 'modbus-client',
        name: 'ModbusClientTCPDefault',
        clienttype: 'tcp',
        bufferCommands: true,
        queueLogEnabled: true,
        stateLogEnabled: true,
        tcpHost: '127.0.0.1',
        tcpPort: '502',
        tcpType: 'DEFAULT',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU-BUFFERD',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '50',
        unit_id: '1',
        commandDelay: '1',
        clientTimeout: '100',
        reconnectDelay: 200,
        reconnectOnTimeout: true,
        connectionTimeout: 10000
      },
      {
        id: '384fb9f1.e96296',
        type: 'modbus-read',
        name: '',
        topic: '',
        showStatusActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        rate: '4',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: '466860d5.3f6358',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        wires: [[], []]
      }], function () {
        var modbusReadNode = helper.getNode('466860d5.3f6358')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPDefault')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP TELNET', function (done) {
      helper.load([readNode, nodeUnderTest], [{
        id: '466860d5.3f6359',
        type: 'modbus-client',
        name: 'ModbusClientTCPTelnet',
        clienttype: 'tcp',
        bufferCommands: true,
        queueLogEnabled: true,
        stateLogEnabled: true,
        tcpHost: '127.0.0.1',
        tcpPort: '502',
        tcpType: 'TELNET',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU-BUFFERD',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        unit_id: '1',
        commandDelay: '1',
        clientTimeout: '100',
        reconnectDelay: 200,
        reconnectOnTimeout: true,
        connectionTimeout: 10000
      },
      {
        id: '384fb9f1.e96296',
        type: 'modbus-read',
        name: '',
        topic: '',
        showStatusActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        rate: '4',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: '466860d5.3f6359',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        wires: [[], []]
      }], function () {
        var modbusReadNode = helper.getNode('466860d5.3f6359')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPTelnet')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP RTU-BUFFERED', function (done) {
      helper.load([readNode, nodeUnderTest], [{
        id: '466860d5.3f6360',
        type: 'modbus-client',
        name: 'ModbusClientTCPRTUB',
        clienttype: 'tcp',
        bufferCommands: true,
        queueLogEnabled: true,
        stateLogEnabled: true,
        tcpHost: '127.0.0.1',
        tcpPort: '502',
        tcpType: 'RTU-BUFFERED',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU-BUFFERD',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        unit_id: '1',
        commandDelay: '1',
        clientTimeout: '100',
        reconnectDelay: 200,
        reconnectOnTimeout: true,
        connectionTimeout: 10000
      },
      {
        id: '384fb9f1.e96296',
        type: 'modbus-read',
        name: '',
        topic: '',
        showStatusActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        rate: '4',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: '466860d5.3f6360',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        wires: [[], []]
      }], function () {
        var modbusReadNode = helper.getNode('466860d5.3f6360')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPRTUB')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP C701', function (done) {
      helper.load([readNode, nodeUnderTest], [{
        id: '466860d5.3f6361',
        type: 'modbus-client',
        name: 'ModbusClientTCPC701',
        clienttype: 'tcp',
        bufferCommands: true,
        queueLogEnabled: true,
        stateLogEnabled: true,
        tcpHost: '127.0.0.1',
        tcpPort: '502',
        tcpType: 'C701',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU-BUFFERD',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        unit_id: '1',
        commandDelay: '1',
        clientTimeout: '100',
        reconnectDelay: 200,
        reconnectOnTimeout: true,
        connectionTimeout: 10000
      },
      {
        id: '384fb9f1.e96296',
        type: 'modbus-read',
        name: '',
        topic: '',
        showStatusActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        rate: '4',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: '466860d5.3f6361',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        wires: [[], []]
      }], function () {
        var modbusReadNode = helper.getNode('466860d5.3f6361')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPC701')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial RTU-BUFFERED', function (done) {
      helper.load([readNode, nodeUnderTest], [{
        id: '466860d5.3f6362',
        type: 'modbus-client',
        name: 'ModbusClientSerialRTUB',
        clienttype: 'simpleser',
        bufferCommands: true,
        queueLogEnabled: true,
        stateLogEnabled: true,
        tcpHost: '127.0.0.1',
        tcpPort: '502',
        tcpType: 'C701',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU-BUFFERD',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        unit_id: '1',
        commandDelay: '1',
        clientTimeout: '100',
        reconnectDelay: 200,
        reconnectOnTimeout: true,
        connectionTimeout: 10000
      },
      {
        id: '384fb9f1.e96296',
        type: 'modbus-read',
        name: '',
        topic: '',
        showStatusActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        rate: '4',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: '466860d5.3f6362',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        wires: [[], []]
      }], function () {
        var modbusReadNode = helper.getNode('466860d5.3f6362')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTUB')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial RTU', function (done) {
      helper.load([readNode, nodeUnderTest], [{
        id: '466860d5.3f6363',
        type: 'modbus-client',
        name: 'ModbusClientSerialRTU',
        clienttype: 'simpleser',
        bufferCommands: true,
        queueLogEnabled: true,
        stateLogEnabled: true,
        tcpHost: '127.0.0.1',
        tcpPort: '502',
        tcpType: 'C701',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        unit_id: '1',
        commandDelay: '1',
        clientTimeout: '100',
        reconnectDelay: 200,
        reconnectOnTimeout: true,
        connectionTimeout: 10000
      },
      {
        id: '384fb9f1.e96296',
        type: 'modbus-read',
        name: '',
        topic: '',
        showStatusActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        rate: '4',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: '466860d5.3f6363',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        wires: [[], []]
      }], function () {
        var modbusReadNode = helper.getNode('466860d5.3f6363')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTU')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial ASCII', function (done) {
      helper.load([readNode, nodeUnderTest], [{
        id: '466860d5.3f6364',
        type: 'modbus-client',
        name: 'ModbusClientSerialASCII',
        clienttype: 'simpleser',
        bufferCommands: true,
        queueLogEnabled: true,
        stateLogEnabled: true,
        tcpHost: '127.0.0.1',
        tcpPort: '502',
        tcpType: 'C701',
        serialPort: '/dev/ttyUSB',
        serialType: 'ASCII',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        unit_id: '1',
        commandDelay: '1',
        clientTimeout: '100',
        reconnectDelay: 200,
        reconnectOnTimeout: true,
        connectionTimeout: 10000
      },
      {
        id: '384fb9f1.e96296',
        type: 'modbus-read',
        name: '',
        topic: '',
        showStatusActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        rate: '4',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: '466860d5.3f6364',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        wires: [[], []]
      }], function () {
        var modbusReadNode = helper.getNode('466860d5.3f6364')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialASCII')
        setTimeout(done, 1000)
      })
    })

    it('should work with simple read on local server', function (done) {
      helper.load([serverNode, readNode, nodeUnderTest], simpleReadWithClient, function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (counter === 1) {
            done()
          }
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-cient/invalid').expect(404).end(done)
    })
  })
})
