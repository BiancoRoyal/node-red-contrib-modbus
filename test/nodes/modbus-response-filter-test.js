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

var functionNode = require('@node-red/nodes/core/function/10-function.js')
var injectNode = require('@node-red/nodes/core/common/20-inject.js')
var nodeUnderTest = require('../../src/modbus-response-filter.js')
var nodeIOConfig = require('../../src/modbus-io-config.js')
var clientNode = require('../../src/modbus-client.js')
var serverNode = require('../../src/modbus-server.js')
var flexGetterNode = require('../../src/modbus-flex-getter.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('Response Filter node Testing', function () {
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
    it('should be loaded', function (done) {
      helper.load([nodeUnderTest, nodeIOConfig], [
        {
          id: '50f41d03.d1eff4',
          type: 'modbus-response-filter',
          name: 'ModbusResponseFilter',
          filter: 'FilterTest',
          registers: 0,
          ioFile: '2f5a90d.bcaa1f',
          filterResponseBuffer: true,
          filterValues: true,
          filterInput: true,
          showStatusActivities: false,
          showErrors: false,
          wires: [[], []]
        },
        {
          id: '2f5a90d.bcaa1f',
          type: 'modbus-io-config',
          name: 'ModbusIOConfig',
          path: 'test',
          format: 'utf8',
          addressOffset: ''
        }
      ], function () {
        var modbusNode = helper.getNode('50f41d03.d1eff4')
        modbusNode.should.have.property('name', 'ModbusResponseFilter')
        modbusNode.should.have.property('filter', 'FilterTest')
        done()
      })
    })

    it('should be loaded and handle wrong input without crash', function (done) {
      helper.load([nodeUnderTest, nodeIOConfig], [
        {
          id: '50f41d03.d1eff4',
          type: 'modbus-response-filter',
          name: 'ModbusResponseFilter',
          filter: 'FilterTest',
          registers: 0,
          ioFile: '2f5a90d.bcaa1f',
          filterResponseBuffer: true,
          filterValues: true,
          filterInput: true,
          showStatusActivities: false,
          showErrors: false,
          wires: [[], []]
        },
        {
          id: '2f5a90d.bcaa1f',
          type: 'modbus-io-config',
          name: 'ModbusIOConfig',
          path: 'test',
          format: 'utf8',
          addressOffset: ''
        }
      ], function () {
        const modbusResponseFilter = helper.getNode('50f41d03.d1eff4')
        setTimeout(function () {
          modbusResponseFilter.receive({})
          done()
        }, 800)
      })
    })

    it('should stop on input with wrong count of registers', function (done) {
      helper.load([nodeUnderTest, nodeIOConfig], [
        {
          id: '50f41d03.d1eff4',
          type: 'modbus-response-filter',
          name: 'ModbusResponseFilter',
          filter: 'FilterTest',
          registers: 2,
          ioFile: '2f5a90d.bcaa1f',
          filterResponseBuffer: true,
          filterValues: true,
          filterInput: true,
          showStatusActivities: false,
          showErrors: false,
          wires: [[], []]
        },
        {
          id: '2f5a90d.bcaa1f',
          type: 'modbus-io-config',
          name: 'ModbusIOConfig',
          path: 'test',
          format: 'utf8',
          addressOffset: ''
        }
      ], function () {
        const modbusResponseFilter = helper.getNode('50f41d03.d1eff4')
        setTimeout(function () {
          modbusResponseFilter.receive({ payload: {}, registers: [0, 1, 0, 1] })
          done()
        }, 800)
      })
    })

    it('should work on input with exact count registers', function (done) {
      helper.load([nodeUnderTest, nodeIOConfig], [
        {
          id: '50f41d03.d1eff4',
          type: 'modbus-response-filter',
          name: 'ModbusResponseFilter',
          filter: 'FilterTest',
          registers: 4,
          ioFile: '2f5a90d.bcaa1f',
          filterResponseBuffer: true,
          filterValues: true,
          filterInput: true,
          showStatusActivities: false,
          showErrors: false,
          wires: [[], []]
        },
        {
          id: '2f5a90d.bcaa1f',
          type: 'modbus-io-config',
          name: 'ModbusIOConfig',
          path: 'test',
          format: 'utf8',
          addressOffset: ''
        }
      ], function () {
        const modbusResponseFilter = helper.getNode('50f41d03.d1eff4')
        setTimeout(function () {
          modbusResponseFilter.receive({ payload: {}, registers: [0, 1, 0, 1] })
          done()
        }, 800)
      })
    })

    it('should work with Flex Getter', function (done) {
      helper.load([injectNode, functionNode, clientNode, serverNode, flexGetterNode, nodeUnderTest, nodeIOConfig], [
        {
          id: '178284ea.5055ab',
          type: 'modbus-server',
          name: '',
          logEnabled: false,
          hostname: '',
          serverPort: '6502',
          responseDelay: '50',
          delayUnit: 'ms',
          coilsBufferSize: 1024,
          holdingBufferSize: 1024,
          inputBufferSize: 1024,
          discreteBufferSize: 1024,
          showErrors: false,
          wires: [
            [],
            [],
            [],
            []
          ]
        },
        {
          id: '29991a24.b64dfe',
          type: 'inject',
          name: 'Get flexible!',
          topic: '',
          payload: '',
          payloadType: 'date',
          repeat: '0.2',
          crontab: '',
          once: true,
          wires: [
            [
              '5cf6efb4.f62018'
            ]
          ]
        },
        {
          id: '5cf6efb4.f62018',
          type: 'function',
          name: '',
          func: "msg.payload = { input: msg.payload, 'fc': 4, 'unitid': 1, 'address': 0 , 'quantity': 30 }\nreturn msg;",
          outputs: 1,
          noerr: 0,
          wires: [
            [
              'c730e78b.3b8b5'
            ]
          ]
        },
        {
          id: 'c730e78b.3b8b5',
          type: 'modbus-flex-getter',
          name: '',
          showStatusActivities: false,
          showErrors: false,
          logIOActivities: false,
          server: '80aeec4c.0cb9e8',
          useIOFile: true,
          ioFile: '7417947e.da6c3c',
          useIOForPayload: true,
          wires: [
            [
              '5a7d9b84.a543a4'
            ],
            []
          ]
        },
        {
          id: '5a7d9b84.a543a4',
          type: 'modbus-response-filter',
          name: 'ModbusResponseFilter',
          filter: 'bOperationActive',
          registers: 0,
          ioFile: '7417947e.da6c3c',
          filterResponseBuffer: true,
          filterValues: true,
          filterInput: true,
          showStatusActivities: false,
          showErrors: false,
          wires: [
            [
              'h1'
            ]
          ]
        },
        { id: 'h1', type: 'helper' },
        {
          id: '80aeec4c.0cb9e8',
          type: 'modbus-client',
          name: 'Modbus Server',
          clienttype: 'tcp',
          bufferCommands: true,
          stateLogEnabled: false,
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
        },
        {
          id: '7417947e.da6c3c',
          type: 'modbus-io-config',
          name: 'C3FactorySet',
          path: './test/nodes/resources/device.json',
          format: 'utf8',
          addressOffset: ''
        }
      ], function () {
        var modbusNode = helper.getNode('5a7d9b84.a543a4')
        modbusNode.should.have.property('name', 'ModbusResponseFilter')
        modbusNode.should.have.property('filter', 'bOperationActive')

        var h1 = helper.getNode('h1')
        h1.on('input', function () {
          done()
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-reponse-filter/invalid').expect(404).end(done)
    })
  })
})
