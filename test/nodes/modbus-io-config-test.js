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

var nodeUnderTest = require('../../src/modbus-io-config.js')
var readNode = require('../../src/modbus-read.js')
var helper = require('node-red-contrib-test-helper')

describe('IO Config node Testing', function () {
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
      helper.load([nodeUnderTest, readNode], [
        {
          "id": "b0fefd31.802188",
          "type": "modbus-read",
          "name": "",
          "topic": "",
          "showStatusActivities": false,
          "showErrors": false,
          "unitid": "",
          "dataType": "",
          "adr": "",
          "quantity": "",
          "rate": "",
          "rateUnit": "",
          "delayOnStart": false,
          "startDelayTime": "",
          "server": "",
          "useIOFile": true,
          "ioFile": "2f5a90d.bcaa1f",
          "useIOForPayload": false,
          "wires": [[], []]
        },
        {
          "id": "2f5a90d.bcaa1f",
          "type": "modbus-io-config",
          "name": "ModbusIOConfig",
          "path": "testpath",
          "format": "utf8",
          "addressOffset": ""
        }
      ], function () {
        var modbusIOConfigNode = helper.getNode('2f5a90d.bcaa1f')
        modbusIOConfigNode.should.have.property('name', 'ModbusIOConfig')
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-io-config/invalid').expect(404).end(done)
    })
  })
})
