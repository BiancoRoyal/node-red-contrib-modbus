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

const injectNode = require('@node-red/nodes/core/common/20-inject')
const functionNode = require('@node-red/nodes/core/function/10-function')
const commentNode = require('@node-red/nodes/core/common/90-comment.js')

const modbusServerNode = require('../../src/modbus-server.js')
const modbusClientNode = require('../../src/modbus-client.js')
const modbusWriteNode = require('../../src/modbus-write.js')
const modbusResponseNode = require('../../src/modbus-response.js')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const nodeList = [injectNode, functionNode, commentNode, modbusServerNode, modbusClientNode, modbusResponseNode, modbusWriteNode]

const testFlows = require('./flows/modbus-write-e2e-flows')
const receive = require('../helper/receive')

describe('Client Modbus Integration', function () {
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

  describe('Modbus Write', function () {
    it('should write Modbus via TCP', function (done) {
      helper.load(nodeList, testFlows.testFlowWritingWithoutInject, function () {
        const writeNode = helper.getNode('409b03f21dcb23ad')
        receive(writeNode, { payload: true })
        writeNode.should.have.property('name', 'ModbusTestWrite')
        receive(writeNode, { payload: false })
        setTimeout(done, 1000)
      })
    })
  })

  describe('Posts', function () {
    it('should give status 200 site for serial ports list', function (done) {
      helper.load(nodeList, testFlows.testFlowWriting, function () {
        setTimeout(function () {
          helper.request().get('/modbus/serial/ports').expect(200).end(done)
        }, 1000)
      })
    })
  })
})
