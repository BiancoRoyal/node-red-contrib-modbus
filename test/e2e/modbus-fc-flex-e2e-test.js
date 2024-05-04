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

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var commentNode = require('@node-red/nodes/core/common/90-comment.js')

var modbusServerNode = require('../../src/modbus-server.js')
var modbusClientNode = require('../../src/modbus-client.js')
var modbusReadNode = require('../../src/modbus-read.js')
var modbusFlexFc = require('../../src/modbus-flex-fc.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const nodeList = [injectNode, functionNode, commentNode, modbusServerNode, modbusClientNode, modbusReadNode, modbusFlexFc];

var testFcFlexFlows = require('./flows/modbus-fc-flex-e2e-flows')
const testFlows = require('../units/flows/modbus-getter-flows')
const mBasics = require('../../src/modbus-basics')

describe('Modbus Flex FC-Functionality tests', function () {
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

  describe('Flex-FC-Read-Coil', function () {
    it('the request-map-editor should contain the correct map', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlexFCFunctionality, function () {
        const flexNode = helper.getNode('4f80ae4fa5b8af80')
        flexNode.should.have.property('name', 'Flex-FC-Read-Coil')
        flexNode.should.have.property('fc', "0x01");
        flexNode.should.have.property('requestCard', JSON.parse('[\n' +
          '          {\n' +
          '            "name": "startingAddress",\n' +
          '            "data": 0,\n' +
          '            "offset": 0,\n' +
          '            "type": "uint16be"\n' +
          '          },\n' +
          '          {\n' +
          '            "name": "quantityCoils",\n' +
          '            "data": 8,\n' +
          '            "offset": 2,\n' +
          '            "type": "uint16be"\n' +
          '          }\n' +
          '        ]')
        )
        done()
      })
    })

    it('the request-map-editor should contain the correct map', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlexFCFunctionality, function () {
        const flexNode = helper.getNode('4f80ae4fa5b8af80')
        flexNode.should.have.property('requestCard', JSON.parse('[\n' +
          '          {\n' +
          '            "name": "startingAddress",\n' +
          '            "data": 0,\n' +
          '            "offset": 0,\n' +
          '            "type": "uint16be"\n' +
          '          },\n' +
          '          {\n' +
          '            "name": "quantityCoils",\n' +
          '            "data": 8,\n' +
          '            "offset": 2,\n' +
          '            "type": "uint16be"\n' +
          '          }\n' +
          '        ]')
        )
        done()
      })
    })

    it('the node can successfully receive data from the outside world', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlexFCFunctionality, function () {
        const flexNode = helper.getNode('4f80ae4fa5b8af80');
        let counter = 0;
        flexNode.on('input', function (msg) {
          if (counter === 1 && msg.topic === 'polling') {
            done();
          }
        });
        done()
      })
    })

    it('the node can load the default files from the drive via a POST Request', function (done) {
      helper.load(nodeList, testFcFlexFlows.testFlexFCFunctionality, function () {
        const flexNode = helper.getNode('4f80ae4fa5b8af80');
        helper.request().post("/modbus/fc/4f80ae4fa5b8af80").expect(200).end(done)
      })
    })
  })
})
