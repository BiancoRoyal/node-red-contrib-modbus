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
var nodeUnderTest = require('../../src/modbus-write.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testSimpleWriteParametersNodes = [injectNode, clientNode, serverNode, nodeUnderTest]

var testSimpleWriteParametersFlow = [{
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
  id: '1ed908da.427ecf',
  type: 'modbus-write',
  name: 'Write Reset FC5',
  showStatusActivities: true,
  showErrors: false,
  unitid: '',
  dataType: 'Coil',
  adr: '64',
  quantity: '1',
  server: 'aef203cf.a23dc',
  emptyMsgOnFail: false,
  keepMsgProperties: false,
  wires: [
    [
      'h1'
    ],
    [
    ]
  ]
},
{ id: 'h1', type: 'helper' },
{
  id: 'aef203cf.a23dc',
  type: 'modbus-client',
  name: 'Modbus Server',
  clienttype: 'tcp',
  bufferCommands: true,
  stateLogEnabled: false,
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
    it('simple Node should be loaded without client config', function (done) {
      helper.load([nodeUnderTest], [{
        id: '8ad2951c.2df708',
        type: 'modbus-write',
        name: 'modbusWrite',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '1',
        server: '',
        wires: [[], []]
      }], function () {
        var modbusWrite = helper.getNode('8ad2951c.2df708')
        modbusWrite.should.have.property('name', 'modbusWrite')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

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
        emptyMsgOnFail: false,
        keepMsgProperties: false,
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
        clientTimeout: 100,
        reconnectDelay: 200,
        bufferCommands: true,
        stateLogEnabled: false,
        parallelUnitIdsAllowed: true,
        connectionTimeout: 10000
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

    it('simple flow with boolean injects and write should be loaded', function (done) {
      this.timeout(3000)
      helper.load([injectNode, clientNode, serverNode, nodeUnderTest], [{
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
        id: '1ed908da.427ecf',
        type: 'modbus-write',
        name: 'Write Reset FC5',
        showStatusActivities: true,
        showErrors: false,
        unitid: '',
        dataType: 'Coil',
        adr: '64',
        quantity: '1',
        server: 'aef203cf.a23dc',
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        wires: [
          [
            'h1'
          ],
          [
          ]
        ]
      },
      { id: 'h1', type: 'helper' },
      {
        id: '16b7697e.2baa47',
        type: 'inject',
        name: '',
        topic: '',
        payload: 'true',
        payloadType: 'bool',
        repeat: '2',
        crontab: '',
        once: false,
        wires: [
          [
            '1ed908da.427ecf'
          ]
        ]
      },
      {
        id: '5da6464f.441aa',
        type: 'inject',
        name: '',
        topic: '',
        payload: 'false',
        payloadType: 'bool',
        repeat: '2',
        crontab: '',
        once: true,
        onceDelay: 0.1,
        wires: [
          [
            '1ed908da.427ecf'
          ]
        ]
      },
      {
        id: 'aef203cf.a23dc',
        type: 'modbus-client',
        name: 'Modbus Server',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
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
        const modbusWrite = helper.getNode('1ed908da.427ecf')
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (modbusWrite.bufferMessageList.size === 0) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string false http inject and write should be loaded', function (done) {
      helper.load(testSimpleWriteParametersNodes, testSimpleWriteParametersFlow, function () {
        const modbusWrite = helper.getNode('1ed908da.427ecf')
        setTimeout(function () {
          modbusWrite.receive({ payload: { value: 'false', fc: 5, unitid: 1, address: 0, quantity: 1 } })
        }, 800)
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (modbusWrite.bufferMessageList.size === 0) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string true http inject and write should be loaded', function (done) {
      helper.load(testSimpleWriteParametersNodes, testSimpleWriteParametersFlow, function () {
        const modbusWrite = helper.getNode('1ed908da.427ecf')
        setTimeout(function () {
          modbusWrite.receive({ payload: { value: 'true', fc: 5, unitid: 1, address: 0, quantity: 1 } })
        }, 800)
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (modbusWrite.bufferMessageList.size === 0) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string true http inject and write should be loaded and write done', function (done) {
      helper.load(testSimpleWriteParametersNodes, testSimpleWriteParametersFlow, function () {
        const modbusWrite = helper.getNode('1ed908da.427ecf')
        setTimeout(function () {
          modbusWrite.receive({ payload: { value: 'true', fc: 5, unitid: 1, address: 0, quantity: 1 } })
        }, 800)
        const h1 = helper.getNode('h1')
        modbusWrite.on('modbusWriteNodeDone', function (msg) {
          if (modbusWrite.bufferMessageList.size === 0) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string with array of values input from http should be parsed and written', function (done) {
      helper.load(testSimpleWriteParametersNodes, testSimpleWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (modbusWrite.bufferMessageList.size === 0) {
            done()
          }
        })
        const modbusWrite = helper.getNode('1ed908da.427ecf')
        setTimeout(function () {
          modbusWrite.receive({ payload: '{ "value": [0,1,0,1], "fc": 5, "unitid": 1,"address": 0, "quantity": 4 }' })
        }, 800)
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
