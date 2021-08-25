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
var nodeUnderTest = require('../../src/modbus-flex-getter.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlexGetterNodes = [injectNode, clientNode, serverNode, nodeUnderTest]

var testFlexGetterFlowWithInject = [{
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
    []
  ]
},
{
  id: 'bc5a61b6.a3972',
  type: 'modbus-flex-getter',
  name: '',
  showStatusActivities: true,
  showErrors: false,
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
  id: 'fda9ed0f.c27278',
  type: 'inject',
  name: 'Flex Inject',
  topic: '',
  payload: '{"value":0,"fc":1,"unitid":1,"address":0,"quantity":1}',
  payloadType: 'json',
  repeat: '0.1',
  crontab: '',
  once: true,
  onceDelay: 0.1,
  wires: [
    [
      'bc5a61b6.a3972'
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
}
]

var testFlexGetterFlow = [{
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
    []
  ]
},
{
  id: 'bc5a61b6.a3972',
  type: 'modbus-flex-getter',
  name: '',
  showStatusActivities: true,
  showErrors: false,
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
]

describe('Flex Getter node Testing', function () {
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
      helper.load([nodeUnderTest], [{
        id: 'bc5a61b6.a3972',
        type: 'modbus-flex-getter',
        name: 'modbusFlexGetter',
        showStatusActivities: false,
        showErrors: false,
        server: '',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        wires: [
          [],
          []
        ]
      }], function () {
        const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
        modbusFlexGetter.should.have.property('name', 'modbusFlexGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should be loaded', function (done) {
      helper.load([clientNode, serverNode, nodeUnderTest], [{
        id: 'bc5a61b6.a3972',
        type: 'modbus-flex-getter',
        name: 'modbusFlexGetter',
        showStatusActivities: false,
        showErrors: false,
        server: '92e7bf63.2efd7',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        wires: [
          [],
          []
        ]
      }, {
        id: '996023fe.ea04b',
        type: 'modbus-server',
        name: 'modbusServer',
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
          []
        ]
      }, {
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
      }], function () {
        const modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('92e7bf63.2efd7')
        modbusClient.should.have.property('name', 'ModbusServer')

        const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
        modbusFlexGetter.should.have.property('name', 'modbusFlexGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject should be loaded', function (done) {
      helper.load(testFlexGetterNodes, testFlexGetterFlowWithInject, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
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

    it('simple flow with inject should be loaded and read be done', function (done) {
      helper.load(testFlexGetterNodes, testFlexGetterFlowWithInject, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        let counter = 0
        modbusGetter.on('modbusFlexGetterNodeDone', function (msg) {
          counter++
          if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow should be loaded and with receive got input', function (done) {
      helper.load(testFlexGetterNodes, testFlexGetterFlow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
            done()
          }
        })
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 0, "quantity": 4 }' })
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong write inject should not crash', function (done) {
      helper.load(testFlexGetterNodes, testFlexGetterFlow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "value": "true", "fc": 5, "unitid": 1,"address": 0, "quantity": 1 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong address inject should not crash', function (done) {
      helper.load(testFlexGetterNodes, testFlexGetterFlow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": -1, "quantity": 1 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong quantity inject should not crash', function (done) {
      helper.load(testFlexGetterNodes, testFlexGetterFlow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 1, "quantity": -1 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-getter/invalid').expect(404).end(done)
    })
  })
})
