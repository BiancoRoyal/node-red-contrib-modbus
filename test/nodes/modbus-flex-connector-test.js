/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018 Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

var nodeUnderTest = require('../../src/modbus-flex-connector.js')
var nodeClient = require('../../src/modbus-client.js')
var helper = require('node-red-contrib-test-helper')

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
      helper.load([nodeUnderTest, nodeClient], [
        {
          "id": "40ddaabb.fd44d4",
          "type": "modbus-flex-connector",
          "name": "FlexConnector",
          "maxReconnectsPerMinute": 4,
          "emptyQueue": true,
          "showStatusActivities": false,
          "showErrors": false,
          "server": "2a253153.fae3ce",
          "wires": []
        },
        {
          "id": "2a253153.fae3ce",
          "type": "modbus-client",
          "name": "",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "11522",
          "tcpType": "DEFAULT",
          "serialPort": "/dev/ttyUSB",
          "serialType": "RTU-BUFFERD",
          "serialBaudrate": "9600",
          "serialDatabits": "8",
          "serialStopbits": "1",
          "serialParity": "none",
          "serialConnectionDelay": "100",
          "unit_id": "1",
          "commandDelay": "100",
          "clientTimeout": "1000",
          "reconnectTimeout": "5000"
        }
      ], function () {
        var modbusNode = helper.getNode('40ddaabb.fd44d4')
        modbusNode.should.have.property('name', 'FlexConnector')
        modbusNode.should.have.property('emptyQueue', true)
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-connector/invalid').expect(404).end(done)
    })
  })
})
