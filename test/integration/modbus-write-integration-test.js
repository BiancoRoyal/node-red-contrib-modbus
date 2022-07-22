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

var modbusServerNode = require('../../src/modbus-server.js')
var modbusClientNode = require('../../src/modbus-client.js')
var modbusWriteNode = require('../../src/modbus-write.js')
var modbusResponseNode = require('../../src/modbus-response.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const nodeList = [modbusServerNode, modbusClientNode, modbusResponseNode, modbusWriteNode]

const testFlowWriting = [
  {
    id: '96005591.02f0d8',
    type: 'modbus-server',
    z: 'e5faba87.571118',
    name: '',
    logEnabled: false,
    hostname: '0.0.0.0',
    serverPort: '9508',
    responseDelay: 100,
    delayUnit: 'ms',
    coilsBufferSize: 10000,
    holdingBufferSize: 10000,
    inputBufferSize: 10000,
    discreteBufferSize: 10000,
    showErrors: false,
    x: 240,
    y: 100,
    wires: [
      [],
      [],
      [],
      []
    ]
  },
  {
    id: 'ba951605.dba07',
    type: 'modbus-write',
    z: 'e5faba87.571118',
    name: 'ModbusTestWrite',
    showStatusActivities: false,
    showErrors: false,
    unitid: '',
    dataType: 'Coil',
    adr: '0',
    quantity: '1',
    server: '354de6bb.6c3652',
    x: 250,
    y: 180,
    wires: [
      [
        'h1', 'da9b1881.0be0a'
      ],
      [
        'h2', 'b9cde023.b39e08'
      ]
    ]
  },
  { id: 'h1', type: 'helper' },
  { id: 'h2', type: 'helper' },
  {
    id: 'da9b1881.0be0a',
    type: 'modbus-response',
    z: 'e5faba87.571118',
    name: '',
    registerShowMax: 20,
    x: 490,
    y: 140,
    wires: []
  },
  {
    id: 'b9cde023.b39e08',
    type: 'modbus-response',
    z: 'e5faba87.571118',
    name: '',
    registerShowMax: 20,
    x: 490,
    y: 200,
    wires: []
  },
  {
    id: '354de6bb.6c3652',
    type: 'modbus-client',
    z: '',
    name: 'ModbusTestTCPClient',
    clienttype: 'tcp',
    bufferCommands: true,
    stateLogEnabled: false,
    queueLogEnabled: false,
    tcpHost: '127.0.0.1',
    tcpPort: '9508',
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
    clientTimeout: '1000',
    reconnectOnTimeout: true,
    reconnectDelay: 200,
    parallelUnitIdsAllowed: true,
    connectionTimeout: 10000
  }
]

describe('Client Modbus Integration', function () {
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

  describe('Modbus Write', function () {
    it('should write Modbus via TCP', function (done) {
      helper.load(nodeList, testFlowWriting, function () {
        const writeNode = helper.getNode('ba951605.dba07')
        writeNode.emit('input', { payload: true })
        writeNode.should.have.property('name', 'ModbusTestWrite')
        writeNode.emit('input', { payload: false })
        setTimeout(done, 1000)
      })
    })
  })

  describe('Posts', function () {
    it('should give status 200 site for serial ports list', function (done) {
      helper.load(nodeList, testFlowWriting, function () {
        setTimeout(function () {
          helper.request().get('/modbus/serial/ports').expect(200).end(done)
        }, 1000)
      })
    })
  })
})
