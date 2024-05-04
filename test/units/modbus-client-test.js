/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'
const coreModbusClient = require('../../src/core/modbus-client-core')

const serverNode = require('../../src/modbus-server.js')
const nodeUnderTest = require('../../src/modbus-client.js')
const readNode = require('../../src/modbus-read.js')
const flexGetterNode = require('../../src/modbus-flex-getter.js')
const mBasics = require('../../src/modbus-basics.js')

const testModbusClientNodes = [serverNode, nodeUnderTest, readNode, flexGetterNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-client-flows')

describe('Client node Testing', function () {
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
    it('should be loaded with TCP DEFAULT', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpDefaultFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6358')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPDefault')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with wrong TCP', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeWrongTcpFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6358')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPDefault')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP TELNET', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpTelnetFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6359')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPTelnet')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP RTU-BUFFERED', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpRtuBufferedFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6360')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPRTUB')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP C701', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeTcpC701Flow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6361')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPC701')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial RTU-BUFFERED', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialRtuBufferedFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6362')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTUB')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial RTU', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialRtuFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6363')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTU')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial ASCII', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialAsciiFlow, function () {
        const modbusReadNode = helper.getNode('466860d5.3f6364')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialASCII')
        setTimeout(done, 1000)
      })
    })

    it('should work with simple read on local server', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (counter === 1) {
            done()
          }
        })
      })
    })

    it('should have messageAllowed defaults', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeSerialAsciiFlow, function () {
        const modbusClientNode = helper.getNode('466860d5.3f6364')
        modbusClientNode.should.have.property('messageAllowedStates', coreModbusClient.messageAllowedStates)
        setTimeout(done, 1000)
      })
    })

    it('should be inactive if message not allowed', function (done) {
      helper.load(testModbusClientNodes, testFlows.testShouldBeInactiveFlow, function () {
        const modbusClientNode = helper.getNode('53f6fb33a3f90ead')
        setTimeout(() => {
          modbusClientNode.messageAllowedStates = ['']
          let isInactive = modbusClientNode.isInactive()
          isInactive.should.be.true
          done()
        } , 1500)
      })
    })

    it('should be state queueing - ready to send', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
        const modbusClientNode = helper.getNode('466860d5.3f6358')
        setTimeout(() => {
          mBasics.setNodeStatusTo('queueing', modbusClientNode)
          let isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.true
          done()
        } , 1500)
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      helper.load(testModbusClientNodes, testFlows.testSimpleReadWithClientFlow, function () {
        const modbusClientNode = helper.getNode('466860d5.3f6358')
        setTimeout(() => {
          mBasics.setNodeStatusTo('stopped', modbusClientNode)
          let isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false
          done()
        } , 1500)
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-client/invalid').expect(404).end(done)
    })
  })
})