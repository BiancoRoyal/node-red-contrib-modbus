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
var modbusReadNode = require('../../src/modbus-read.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const nodeList = [modbusServerNode, modbusClientNode, modbusReadNode]

const testFlowReading = [
  {
    id: 'e5faba87.571118',
    type: 'tab',
    label: 'Flow 1',
    disabled: false,
    info: ''
  },
  {
    id: '1f9596ed.279b89',
    type: 'modbus-read',
    z: 'e5faba87.571118',
    name: 'ModbusTestRead',
    topic: '',
    showStatusActivities: false,
    logIOActivities: false,
    showErrors: false,
    unitid: '',
    dataType: 'HoldingRegister',
    adr: '0',
    quantity: '10',
    rate: '4',
    rateUnit: 's',
    delayOnStart: false,
    startDelayTime: '',
    server: '354de6bb.6c3652',
    useIOFile: false,
    ioFile: '',
    useIOForPayload: false,
    x: 170,
    y: 160,
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
    id: '96005591.02f0d8',
    type: 'modbus-server',
    z: 'e5faba87.571118',
    name: '',
    logEnabled: false,
    hostname: '0.0.0.0',
    serverPort: '9507',
    responseDelay: 100,
    delayUnit: 'ms',
    coilsBufferSize: 10000,
    holdingBufferSize: 10000,
    inputBufferSize: 10000,
    discreteBufferSize: 10000,
    showErrors: false,
    x: 160,
    y: 80,
    wires: [
      [],
      [],
      [],
      []
    ]
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
    tcpPort: '9507',
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

  describe('Node', function () {
    it('should read Modbus via TCP', function (done) {
      helper.load(nodeList, testFlowReading, function () {
        const readNode = helper.getNode('1f9596ed.279b89')
        readNode.should.have.property('name', 'ModbusTestRead')
        setTimeout(done, 1000)
      })
    })
  })

  describe('Posts', function () {
    it('should give status 200 site for serial ports list', function (done) {
      helper.load(nodeList, testFlowReading, function () {
        setTimeout(function () {
          helper.request().get('/modbus/serial/ports').expect(200).end(done)
        }, 1000)
      })
    })
  })
})
