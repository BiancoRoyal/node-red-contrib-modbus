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

var clientNode = require('../../src/modbus-client.js')
var serverNode = require('../../src/modbus-server.js')
var readNode = require('../../src/modbus-read.js')
var ioConfigNode = require('../../src/modbus-io-config')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const readMsgFlow = [
  {
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
    id: '90922127.397cb8',
    type: 'modbus-read',
    name: 'Modbus Read With IO',
    topic: '',
    showStatusActivities: false,
    showErrors: false,
    unitid: '',
    dataType: 'Coil',
    adr: '0',
    quantity: '10',
    rate: '500',
    rateUnit: 'ms',
    delayOnStart: false,
    startDelayTime: '',
    server: '92e7bf63.2efd7',
    useIOFile: false,
    ioFile: '',
    useIOForPayload: false,
    emptyMsgOnFail: false,
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
    it('simple Node should be loaded without client config', function (done) {
      helper.load([readNode], [{
        id: '8ecaae3e.4b8928',
        type: 'modbus-read',
        name: 'modbusRead',
        topic: '',
        showStatusActivities: false,
        showErrors: true,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        rate: '2',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: '',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        wires: [[], []]
      }
      ], function () {
        var modbusRead = helper.getNode('8ecaae3e.4b8928')
        modbusRead.should.have.property('name', 'modbusRead')
        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should be loaded', function (done) {
      helper.load([clientNode, serverNode, readNode], [{
        id: 'e54529b9.952ea8',
        type: 'modbus-server',
        name: 'modbusServer',
        logEnabled: true,
        hostname: '127.0.0.1',
        serverPort: '9502',
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
        id: '8ecaae3e.4b8928',
        type: 'modbus-read',
        name: 'modbusRead',
        topic: '',
        showStatusActivities: false,
        showErrors: true,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        rate: '2',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: '92e7bf63.2efd7',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        wires: [
          [
            'd2840baa.d986b8'
          ],
          []
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
        tcpPort: '9502',
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
        var modbusServer = helper.getNode('e54529b9.952ea8')
        modbusServer.should.have.property('name', 'modbusServer')

        var modbusClient = helper.getNode('92e7bf63.2efd7')
        modbusClient.should.have.property('name', 'ModbusServer')

        var modbusRead = helper.getNode('8ecaae3e.4b8928')
        modbusRead.should.have.property('name', 'modbusRead')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with empty topic', function (done) {
      readMsgFlow[1].topic = ''
      helper.load([clientNode, serverNode, readNode], readMsgFlow, function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (counter === 1 && msg.topic === 'polling') {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with own topic', function (done) {
      readMsgFlow[1].topic = 'myTopic'
      helper.load([clientNode, serverNode, readNode], readMsgFlow, function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (counter === 1 && msg.topic === 'myTopic') {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with IO', function (done) {
      helper.load([clientNode, serverNode, ioConfigNode, readNode], [
        {
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
          id: '90922127.397cb8',
          type: 'modbus-read',
          name: 'Modbus Read With IO',
          topic: '',
          showStatusActivities: false,
          showErrors: false,
          unitid: '',
          dataType: 'InputRegister',
          adr: '0',
          quantity: '20',
          rate: '200',
          rateUnit: 'ms',
          delayOnStart: false,
          startDelayTime: '',
          server: '92e7bf63.2efd7',
          useIOFile: true,
          ioFile: 'e0519b16.5fcdd',
          useIOForPayload: false,
          logIOActivities: true,
          emptyMsgOnFail: false,
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
      ], function () {
        const h1 = helper.getNode('h1')
        let countMsg = 0
        h1.on('input', function (msg) {
          countMsg++
          if (countMsg === 4) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with IO and sending IO-objects as payload', function (done) {
      helper.load([clientNode, serverNode, ioConfigNode, readNode], [
        {
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
          id: '90922127.397cb8',
          type: 'modbus-read',
          name: 'Modbus Read With IO',
          topic: '',
          showStatusActivities: true,
          showErrors: false,
          unitid: '',
          dataType: 'InputRegister',
          adr: '0',
          quantity: '20',
          rate: '100',
          rateUnit: 'ms',
          delayOnStart: true,
          startDelayTime: '1',
          server: '92e7bf63.2efd7',
          useIOFile: true,
          ioFile: 'e0519b16.5fcdd',
          useIOForPayload: true,
          logIOActivities: true,
          emptyMsgOnFail: false,
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
      ], function () {
        const h1 = helper.getNode('h1')
        let countMsg = 0
        h1.on('input', function (msg) {
          countMsg++
          if (countMsg === 4) {
            done()
          }
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

    it('should fail for unloaded node', function (done) {
      helper.request().post('/modbus/read/inject/8ecaae3e.4b8928').expect(404).end(done)
    })

    it('should inject on valid node', function (done) {
      helper.load([clientNode, serverNode, readNode], [{
        id: 'e54529b9.952ea8',
        type: 'modbus-server',
        name: 'modbusServer',
        logEnabled: true,
        hostname: '127.0.0.1',
        serverPort: '9502',
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
        id: '8ecaae3e.4b8928',
        type: 'modbus-read',
        name: 'modbusRead',
        topic: '',
        showStatusActivities: false,
        showErrors: true,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '10',
        rate: '2',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: '92e7bf63.2efd7',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        wires: [
          [
            'd2840baa.d986b8'
          ],
          []
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
        tcpPort: '9502',
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
        helper.request().post('/modbus/read/inject/8ecaae3e.4b8928').expect(200).end(done)
      }, function () {
        helper.log('function callback')
      })
    })
  })
})
