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

var nodeUnderTest = require('../../src/modbus-flex-connector.js')
var serverNode = require('../../src/modbus-server.js')
var nodeClient = require('../../src/modbus-client.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/modbus-flex-connector-flows')

describe('Flex Connector node Testing', function () {
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
      helper.load([nodeUnderTest, nodeClient], testFlows.testShouldBeLoadedFlow, function () {
        var modbusNode = helper.getNode('40ddaabb.fd44d4')
        modbusNode.should.have.property('name', 'FlexConnector')
        modbusNode.should.have.property('emptyQueue', true)
        done()
      })
    })

    it('should change the TCP-Port of the client from 7522 to 8522', function (done) {
      this.timeout(5000)
      helper.load([serverNode, nodeUnderTest, nodeClient], testFlows.testShouldChangeTcpPortFlow, function () {
        var modbusNode = helper.getNode('40ddaabb.fd44d4')
        var clientNode = helper.getNode('2a253153.fae3ce')
        modbusNode.should.have.property('name', 'FlexConnector')
        modbusNode.should.have.property('emptyQueue', true)
        setTimeout(function () {
          modbusNode.receive({ payload: { connectorType: 'TCP', tcpHost: '127.0.0.1', tcpPort: 8522 } })
        }, 1000)
        clientNode.on('mbconnected', () => {
          if (clientNode && clientNode.tcpPort === 8522) {
            done()
          }
        })
      })
    })

    it('should change the Serial-Port of the client from /dev/ttyUSB to /dev/ttyUSB0', function (done) {
      this.timeout(3000)
      helper.load([nodeUnderTest, nodeClient], testFlows.testShouldChangeSerialPortFlow, function () {
        var modbusNode = helper.getNode('40ddaabb.fd44d4')
        var clientNode = helper.getNode('2a253153.fae3ef')
        modbusNode.should.have.property('name', 'FlexConnector')
        modbusNode.should.have.property('emptyQueue', true)
        setTimeout(function () {
          modbusNode.receive({ payload: { connectorType: 'SERIAL', serialPort: '/dev/ttyUSB0', serialBaudrate: '9600' } })
        }, 1000)
        clientNode.on('mbinit', () => {
          if (clientNode && clientNode.serialBaudrate === 9600 && clientNode.serialPort === '/dev/ttyUSB0') {
            done()
          }
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-connector/invalid').expect(404).end(done)
    })
  })
})
