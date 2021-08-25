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
var readNode = require('../../src/modbus-read.js')
var serverNode = require('../../src/modbus-server.js')
var nodeUnderTest = require('../../src/modbus-queue-info.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('Queue Info node Testing', function () {
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
      helper.load([injectNode, clientNode, serverNode, nodeUnderTest], [
        {
          id: '389153e.cb648ac',
          type: 'modbus-server',
          name: 'modbusServer',
          logEnabled: false,
          hostname: '0.0.0.0',
          serverPort: '6502',
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
          id: 'ef5dad20.e97af',
          type: 'modbus-queue-info',
          name: 'modbusQueueInfo',
          topic: '',
          unitid: '',
          queueReadIntervalTime: '100',
          lowLowLevel: 1,
          lowLevel: 2,
          highLevel: 3,
          highHighLevel: 4,
          server: 'd4c76ff5.c424b8',
          errorOnHighLevel: false,
          showStatusActivities: true,
          wires: [
            []
          ]
        },
        {
          id: 'd322d62a.bd875',
          type: 'inject',
          name: '',
          topic: '',
          payload: '',
          payloadType: 'date',
          repeat: 1,
          crontab: '',
          once: true,
          onceDelay: 1,
          wires: [
            [
              'ef5dad20.e97af'
            ]
          ]
        },
        {
          id: 'd4c76ff5.c424b8',
          type: 'modbus-client',
          name: 'modbusClient',
          clienttype: 'tcp',
          bufferCommands: true,
          stateLogEnabled: false,
          parallelUnitIdsAllowed: true,
          tcpHost: '127.0.0.1',
          tcpPort: '6502',
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
        const modbusServer = helper.getNode('389153e.cb648ac')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('d4c76ff5.c424b8')
        modbusClient.should.have.property('name', 'modbusClient')

        const modbusQueueInfo = helper.getNode('ef5dad20.e97af')
        modbusQueueInfo.should.have.property('name', 'modbusQueueInfo')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with old reset inject should be loaded', function (done) {
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
        id: '5fffb0bc.0b8a5',
        type: 'modbus-queue-info',
        name: 'QueueInfo',
        topic: '',
        unitid: '',
        queueReadIntervalTime: 100,
        lowLowLevel: 1,
        lowLevel: 2,
        highLevel: 3,
        highHighLevel: 4,
        server: '1e3ac4ea.86fa7b',
        errorOnHighLevel: false,
        showStatusActivities: true,
        wires: [
          ['h1']
        ]
      },
      {
        id: 'ae473c43.3e7938',
        type: 'inject',
        name: '',
        topic: '',
        payload: '',
        payloadType: 'date',
        repeat: 2,
        crontab: '',
        once: false,
        onceDelay: 1,
        wires: [
          [
            '5fffb0bc.0b8a5'
          ]
        ]
      },
      { id: 'h1', type: 'helper' },
      {
        id: '1e3ac4ea.86fa7b',
        type: 'modbus-client',
        z: '',
        name: 'ModbsuFlexServer',
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
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          done()
        })
        const queueNode = helper.getNode('5fffb0bc.0b8a5')
        queueNode.receive({ payload: '', resetQueue: true })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with new reset inject should be loaded', function (done) {
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
        id: '5fffb0bc.0b8a5',
        type: 'modbus-queue-info',
        name: 'QueueInfo',
        topic: '',
        unitid: '',
        queueReadIntervalTime: 100,
        lowLowLevel: 1,
        lowLevel: 2,
        highLevel: 3,
        highHighLevel: 4,
        server: '1e3ac4ea.86fa7b',
        errorOnHighLevel: false,
        showStatusActivities: true,
        wires: [
          ['h1']
        ]
      },
      {
        id: 'ae473c43.3e7938',
        type: 'inject',
        name: '',
        topic: '',
        payload: '',
        payloadType: 'date',
        repeat: 2,
        crontab: '',
        once: false,
        onceDelay: 1,
        wires: [
          [
            '5fffb0bc.0b8a5'
          ]
        ]
      },
      { id: 'h1', type: 'helper' },
      {
        id: '1e3ac4ea.86fa7b',
        type: 'modbus-client',
        z: '',
        name: 'ModbsuFlexServer',
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
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          done()
        })
        const queueNode = helper.getNode('5fffb0bc.0b8a5')
        queueNode.receive({ payload: { resetQueue: true } })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject and polling read should be loaded', function (done) {
      helper.load([injectNode, readNode, clientNode, serverNode, nodeUnderTest], [{
        id: '445454e4.968564',
        type: 'modbus-server',
        name: '',
        logEnabled: true,
        hostname: '127.0.0.1',
        serverPort: '8502',
        responseDelay: 10,
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
        rate: '50',
        rateUnit: 'ms',
        delayOnStart: false,
        startDelayTime: '',
        server: '1e3ac4ea.86fa7b',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        wires: [
          [
            'h1'
          ],
          []
        ]
      },
      {
        id: '5fffb0bc.0b8a5',
        type: 'modbus-queue-info',
        name: 'QueueInfo',
        topic: '',
        unitid: '',
        queueReadIntervalTime: 100,
        lowLowLevel: 0,
        lowLevel: 1,
        highLevel: 2,
        highHighLevel: 3,
        server: '1e3ac4ea.86fa7b',
        errorOnHighLevel: false,
        showStatusActivities: true,
        wires: [
          ['h1']
        ]
      },
      {
        id: 'ae473c43.3e7938',
        type: 'inject',
        name: '',
        topic: '',
        payload: '',
        payloadType: 'date',
        repeat: 0.3,
        crontab: '',
        once: true,
        onceDelay: 0.2,
        wires: [
          [
            '5fffb0bc.0b8a5'
          ]
        ]
      },
      { id: 'h1', type: 'helper' },
      {
        id: '1e3ac4ea.86fa7b',
        type: 'modbus-client',
        z: '',
        name: 'ModbsuFlexServer',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
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
      }], function () {
        const h1 = helper.getNode('h1')
        let countMsg = 0
        h1.on('input', function (msg) {
          countMsg++
          if (countMsg === 16) {
            done()
          }
        })
        const queueNode = helper.getNode('5fffb0bc.0b8a5')
        queueNode.receive({ payload: '', resetQueue: true })
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
