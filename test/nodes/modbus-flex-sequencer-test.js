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
var nodeUnderTest = require('../../src/modbus-flex-sequencer.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlexSequencerNodes = [injectNode, clientNode, serverNode, nodeUnderTest]

describe('Flex Sequencer node Testing', function () {
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
        type: 'modbus-flex-sequencer',
        name: 'modbusFlexSequencer',
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
        const modbusFlexSequencer = helper.getNode('bc5a61b6.a3972')
        modbusFlexSequencer.should.have.property('name', 'modbusFlexSequencer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node with server should be loaded', function (done) {
      helper.load([clientNode, serverNode, nodeUnderTest], [{
        id: 'bc5a61b6.a3972',
        type: 'modbus-flex-sequencer',
        name: 'modbusFlexSequencer',
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
        reconnectTimeout: 200
      }], function () {
        const modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('92e7bf63.2efd7')
        modbusClient.should.have.property('name', 'ModbusServer')

        const modbusFlexSequencer = helper.getNode('bc5a61b6.a3972')
        modbusFlexSequencer.should.have.property('name', 'modbusFlexSequencer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-sequencer/invalid').expect(404).end(done)
    })
  })
})
