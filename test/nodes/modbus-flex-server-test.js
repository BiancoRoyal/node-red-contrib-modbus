/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018,2019,2020 Klaus Landsdorf (https://bianco-royal.com/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

var injectNode = require('@node-red/nodes/core/common/20-inject.js')
var serverNode = require('../../src/modbus-flex-server.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('Flex Server node Testing', function () {
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
      helper.load(serverNode, [
        {
          id: 'ebd4bd0a.2f4af8',
          type: 'modbus-flex-server',
          name: 'ModbusFlexServer',
          logEnabled: false,
          serverAddress: '0.0.0.0',
          serverPort: 8512,
          responseDelay: 100,
          unitId: 1,
          delayUnit: 'ms',
          coilsBufferSize: 20000,
          registersBufferSize: 20000,
          minAddress: 0,
          splitAddress: 10000,
          funcGetCoil: 'function getFlexCoil(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}',
          funcGetDiscreteInput: 'function getFlexDiscreteInput(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}',
          funcGetInputRegister: 'function getFlexInputRegister(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}',
          funcGetHoldingRegister: 'function getFlexHoldingRegsiter(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}',
          funcSetCoil: 'function setFlexCoil(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.coils.writeUInt8(value, addr * node.bufferFactor)  \n\t} \n}',
          funcSetRegister: 'function setFlexRegister(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.registers.writeUInt16BE(value, addr * node.bufferFactor)  \n\t} \n}',
          wires: [[], [], [], []]
        }
      ], function () {
        var modbusServer = helper.getNode('ebd4bd0a.2f4af8')
        modbusServer.should.have.property('name', 'ModbusFlexServer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('should send data on input', function (done) {
      helper.load([injectNode, serverNode], [
        {
          id: 'ebd4bd0a.2f4af8',
          type: 'modbus-flex-server',
          name: 'ModbusFlexServer',
          logEnabled: false,
          serverAddress: '0.0.0.0',
          serverPort: 8512,
          responseDelay: 100,
          unitId: 1,
          delayUnit: 'ms',
          coilsBufferSize: 20000,
          registersBufferSize: 20000,
          minAddress: 0,
          splitAddress: 10000,
          funcGetCoil: 'function getFlexCoil(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}',
          funcGetDiscreteInput: 'function getFlexDiscreteInput(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}',
          funcGetInputRegister: 'function getFlexInputRegister(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}',
          funcGetHoldingRegister: 'function getFlexHoldingRegsiter(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}',
          funcSetCoil: 'function setFlexCoil(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.coils.writeUInt8(value, addr * node.bufferFactor)  \n\t} \n}',
          funcSetRegister: 'function setFlexRegister(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.registers.writeUInt16BE(value, addr * node.bufferFactor)  \n\t} \n}',
          wires: [['h1'], [], [], []]
        },
        { id: 'h1', type: 'helper' },
        {
          id: 'a75e0ccf.e16628',
          type: 'inject',
          name: '',
          topic: '',
          payload: '',
          payloadType: 'date',
          repeat: '2',
          crontab: '',
          once: true,
          onceDelay: 0.1,
          wires: [
            [
              'ebd4bd0a.2f4af8'
            ]
          ]
        }
      ], function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          done()
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should send discrete data on input', function (done) {
      helper.load([injectNode, serverNode], [
        {
          id: 'ebd4bd0a.2f4af8',
          type: 'modbus-flex-server',
          name: 'ModbusFlexServer',
          logEnabled: false,
          serverAddress: '0.0.0.0',
          serverPort: 8512,
          responseDelay: 100,
          unitId: 1,
          delayUnit: 'ms',
          coilsBufferSize: 20000,
          registersBufferSize: 20000,
          minAddress: 0,
          splitAddress: 10000,
          funcGetCoil: 'function getFlexCoil(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}',
          funcGetDiscreteInput: 'function getFlexDiscreteInput(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}',
          funcGetInputRegister: 'function getFlexInputRegister(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}',
          funcGetHoldingRegister: 'function getFlexHoldingRegsiter(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}',
          funcSetCoil: 'function setFlexCoil(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.coils.writeUInt8(value, addr * node.bufferFactor)  \n\t} \n}',
          funcSetRegister: 'function setFlexRegister(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.registers.writeUInt16BE(value, addr * node.bufferFactor)  \n\t} \n}',
          wires: [[], [], [], ['h1']]
        },
        { id: 'h1', type: 'helper' },
        {
          id: 'a75e0ccf.e16628',
          type: 'inject',
          name: '',
          topic: '',
          payload: '',
          payloadType: 'date',
          repeat: '2',
          crontab: '',
          once: true,
          onceDelay: 0.1,
          wires: [
            [
              'ebd4bd0a.2f4af8'
            ]
          ]
        }
      ], function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          done()
        })
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-server/invalid').expect(404).end(done)
    })
  })
})
