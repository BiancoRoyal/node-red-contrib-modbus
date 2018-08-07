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

var nodeIOConfig = require('../../src/modbus-io-config.js')
var nodeUnderTest = require('../../src/modbus-response-filter.js')
var helper = require('node-red-contrib-test-helper')

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
          "id": "50f41d03.d1eff4",
          "type": "modbus-response-filter",
          "name": "ModbusResponseFilter",
          "filter": "FilterTest",
          "registers": 0,
          "ioFile": "2f5a90d.bcaa1f",
          "filterResponseBuffer": true,
          "filterValues": true,
          "filterInput": true,
          "showStatusActivities": false,
          "showErrors": false,
          "wires": [[], []]
        },
        {
          "id": "2f5a90d.bcaa1f",
          "type": "modbus-io-config",
          "name": "ModbusIOConfig",
          "path": "test",
          "format": "utf8",
          "addressOffset": ""
        }
      ], function () {
        var modbusNode = helper.getNode('50f41d03.d1eff4')
        modbusNode.should.have.property('name', 'ModbusResponseFilter')
        modbusNode.should.have.property('filter', 'FilterTest')
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-reponse-filter/invalid').expect(404).end(done)
    })
  })
})
