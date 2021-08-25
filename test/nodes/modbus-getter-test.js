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

var injectNode = require('@node-red/nodes/core/common/20-inject.js')
var clientNode = require('../../src/modbus-client.js')
var serverNode = require('../../src/modbus-server.js')
var getterNode = require('../../src/modbus-getter.js')
var ioConfigNode = require('../../src/modbus-io-config')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testGetterNodes = [injectNode, ioConfigNode, clientNode, serverNode, getterNode]

var testGetterFlowWithInject = [{
  id: '445454e4.968564',
  type: 'modbus-server',
  name: '',
  logEnabled: true,
  hostname: '127.0.0.1',
  serverPort: '8502',
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
    [],
    []
  ]
},
{
  id: 'cea01c8.36f8f6',
  type: 'modbus-getter',
  name: '',
  showStatusActivities: true,
  showErrors: true,
  unitid: '',
  dataType: 'Coil',
  adr: '0',
  quantity: '10',
  server: '92e7bf63.2efd7',
  useIOFile: true,
  ioFile: 'e0519b16.5fcdd',
  useIOForPayload: false,
  logIOActivities: true,
  emptyMsgOnFail: false,
  keepMsgProperties: false,
  wires: [
    [
      'h1'
    ],
    []
  ]
},
{ id: 'h1', type: 'helper' },
{
  id: 'a75e0ccf.e16628',
  type: 'inject',
  name: '',
  topic: '',
  payload: '',
  payloadType: 'date',
  repeat: '1.2',
  crontab: '',
  once: true,
  onceDelay: 0.1,
  wires: [
    [
      'cea01c8.36f8f6'
    ]
  ]
},
{
  id: '92e7bf63.2efd7',
  type: 'modbus-client',
  name: 'ModbusServer',
  clienttype: 'tcp',
  bufferCommands: true,
  stateLogEnabled: true,
  parallelUnitIdsAllowed: true,
  tcpHost: '127.0.0.1',
  tcpPort: '8502',
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
  connectionTimeout: 10000
},
{
  id: 'e0519b16.5fcdd',
  type: 'modbus-io-config',
  name: 'TestIOFile',
  path: './test/nodes/resources/device.json',
  format: 'utf8',
  addressOffset: ''
}
]

var testGetterFlow = [{
  id: '445454e4.968564',
  type: 'modbus-server',
  name: '',
  logEnabled: true,
  hostname: '127.0.0.1',
  serverPort: '8502',
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
    [],
    []
  ]
},
{
  id: 'cea01c8.36f8f6',
  type: 'modbus-getter',
  name: '',
  showStatusActivities: true,
  showErrors: true,
  unitid: '',
  dataType: 'Coil',
  adr: '0',
  quantity: '10',
  server: '92e7bf63.2efd7',
  useIOFile: true,
  ioFile: 'e0519b16.5fcdd',
  useIOForPayload: false,
  logIOActivities: true,
  emptyMsgOnFail: false,
  keepMsgProperties: false,
  wires: [
    [
      'h1'
    ],
    []
  ]
},
{ id: 'h1', type: 'helper' },
{
  id: '92e7bf63.2efd7',
  type: 'modbus-client',
  name: 'ModbusServer',
  clienttype: 'tcp',
  bufferCommands: true,
  stateLogEnabled: true,
  parallelUnitIdsAllowed: true,
  tcpHost: '127.0.0.1',
  tcpPort: '8502',
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
  connectionTimeout: 10000
},
{
  id: 'e0519b16.5fcdd',
  type: 'modbus-io-config',
  name: 'TestIOFile',
  path: './test/nodes/resources/device.json',
  format: 'utf8',
  addressOffset: ''
}
]

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
    it('simple Node should be loaded without client config', function (done) {
      helper.load([clientNode, serverNode, getterNode], [{
        id: '322daf89.be8dd',
        type: 'modbus-getter',
        name: 'modbusGetter',
        dataType: 'Coil',
        adr: 0,
        quantity: 1,
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        server: '',
        wires: [[], [], []]
      }], function () {
        const modbusGetter = helper.getNode('322daf89.be8dd')
        modbusGetter.should.have.property('name', 'modbusGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should be loaded', function (done) {
      helper.load([clientNode, serverNode, getterNode], [{
        id: '322daf89.be8dd',
        type: 'modbus-getter',
        name: 'modbusGetter',
        dataType: 'Coil',
        adr: 0,
        quantity: 1,
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        server: 'ce5293f4.1e1ac',
        wires: [[], [], []]
      }, {
        id: '996023fe.ea04b',
        type: 'modbus-server',
        name: 'modbusServer',
        logEnabled: true,
        hostname: '127.0.0.1',
        serverPort: '8502',
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
        clientTimeout: 100,
        reconnectDelay: 200,
        parallelUnitIdsAllowed: true,
        connectionTimeout: 10000
      }], function () {
        const modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('ce5293f4.1e1ac')
        modbusClient.should.have.property('name', 'modbusClient')

        const modbusGetter = helper.getNode('322daf89.be8dd')
        modbusGetter.should.have.property('name', 'modbusGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject should be loaded', function (done) {
      helper.load([injectNode, clientNode, serverNode, getterNode], [{
        id: '445454e4.968564',
        type: 'modbus-server',
        name: '',
        logEnabled: true,
        hostname: '127.0.0.1',
        serverPort: '7502',
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
          [],
          []
        ]
      },
      {
        id: 'cea01c8.36f8f6',
        type: 'modbus-getter',
        name: '',
        showStatusActivities: true,
        showErrors: true,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        server: '92e7bf63.2efd7',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        wires: [
          [
            'h1'
          ],
          []
        ]
      },
      { id: 'h1', type: 'helper' },
      {
        id: 'a75e0ccf.e16628',
        type: 'inject',
        name: '',
        topic: '',
        payload: '',
        payloadType: 'date',
        repeat: '1',
        crontab: '',
        once: true,
        onceDelay: 0.1,
        wires: [
          [
            'cea01c8.36f8f6'
          ]
        ]
      },
      {
        id: '92e7bf63.2efd7',
        type: 'modbus-client',
        name: 'ModbusServer',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: true,
        parallelUnitIdsAllowed: true,
        tcpHost: '127.0.0.1',
        tcpPort: '7502',
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
        connectionTimeout: 10000
      }
      ], function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (counter === 1) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should work as simple flow with inject and IO', function (done) {
      this.timeout(3000)
      helper.load(testGetterNodes, testGetterFlowWithInject, function () {
        const modbusGetter = helper.getNode('cea01c8.36f8f6')
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should work as simple flow with inject and IO with read done', function (done) {
      this.timeout(3000)
      helper.load(testGetterNodes, testGetterFlowWithInject, function () {
        const modbusGetter = helper.getNode('cea01c8.36f8f6')
        let counter = 0
        modbusGetter.on('modbusGetterNodeDone', function (msg) {
          counter++
          if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should work as simple flow with wrong write inject and IO', function (done) {
      helper.load(testGetterNodes, testGetterFlow, function () {
        const modbusGetter = helper.getNode('cea01c8.36f8f6')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "value": "true", "fc": 5, "unitid": 1,"address": 0, "quantity": 4 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('should work as simple flow with wrong address inject and IO', function (done) {
      helper.load(testGetterNodes, testGetterFlow, function () {
        const modbusGetter = helper.getNode('cea01c8.36f8f6')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": -1, "quantity": 4 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('should work as simple flow with wrong quantity inject and IO', function (done) {
      helper.load(testGetterNodes, testGetterFlow, function () {
        const modbusGetter = helper.getNode('cea01c8.36f8f6')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 0, "quantity": -1 }' })
          done()
        }, 800)
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
