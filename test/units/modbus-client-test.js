/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

var serverNode = require('../../src/modbus-server.js')
var nodeUnderTest = require('../../src/modbus-client.js')
var readNode = require('../../src/modbus-read.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/modbus-client-flows')

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
      helper.load([readNode, nodeUnderTest], testFlows.testShouldBeTcpDefaultFlow, function () {
        var modbusReadNode = helper.getNode('466860d5.3f6358')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPDefault')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with wrong TCP', function (done) {
      helper.load([readNode, nodeUnderTest], testFlows.testShouldBeWrongTcpFlow, function () {
        var modbusReadNode = helper.getNode('466860d5.3f6358')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPDefault')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP TELNET', function (done) {
      helper.load([readNode, nodeUnderTest], testFlows.testShouldBeTcpTelnetFlow, function () {
        var modbusReadNode = helper.getNode('466860d5.3f6359')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPTelnet')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP RTU-BUFFERED', function (done) {
      helper.load([readNode, nodeUnderTest], testFlows.testShouldBeTcpRtuBufferedFlow, function () {
        var modbusReadNode = helper.getNode('466860d5.3f6360')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPRTUB')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with TCP C701', function (done) {
      helper.load([readNode, nodeUnderTest], testFlows.testShouldBeTcpC701Flow, function () {
        var modbusReadNode = helper.getNode('466860d5.3f6361')
        modbusReadNode.should.have.property('name', 'ModbusClientTCPC701')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial RTU-BUFFERED', function (done) {
      helper.load([readNode, nodeUnderTest], testFlows.testShouldBeSerialRtuBufferedFlow, function () {
        var modbusReadNode = helper.getNode('466860d5.3f6362')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTUB')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial RTU', function (done) {
      helper.load([readNode, nodeUnderTest], testFlows.testShouldBeSerialRtuFlow, function () {
        var modbusReadNode = helper.getNode('466860d5.3f6363')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialRTU')
        setTimeout(done, 1000)
      })
    })

    it('should be loaded with Serial ASCII', function (done) {
      helper.load([readNode, nodeUnderTest], testFlows.testShouldBeSerialAsciiFlow, function () {
        var modbusReadNode = helper.getNode('466860d5.3f6364')
        modbusReadNode.should.have.property('name', 'ModbusClientSerialASCII')
        setTimeout(done, 1000)
      })
    })

    it('should work with simple read on local server', function (done) {
      helper.load([serverNode, readNode, nodeUnderTest], testFlows.testSimpleReadWithClientFlow, function () {
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
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-cient/invalid').expect(404).end(done)
    })
  })
})
