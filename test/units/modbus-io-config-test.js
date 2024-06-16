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

const nodeUnderTest = require('../../src/modbus-io-config.js')
const readNode = require('../../src/modbus-read.js')
const catchNode = require('@node-red/nodes/core/common/25-catch')
const injectNode = require('@node-red/nodes/core/common/20-inject')
const functionNode = require('@node-red/nodes/core/function/10-function')
const clientNode = require('../../src/modbus-client')
const serverNode = require('../../src/modbus-server')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testIoConfigNodes = [catchNode, injectNode, functionNode, clientNode, serverNode, nodeUnderTest, readNode]

const testFlows = require('./flows/modbus-io-config-flows')
const mBasics = require('../../src/modbus-basics')

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
    // it('should reload the file when it changes', () => {
    //   helper.load(testIoConfigNodes, testFlows.testReadWithClientIoFlow, function () {
    //     const modbusIOConfigNode = helper.getNode('6822f8ed8da9824e')
    //     node.watcher.emit(modbusIOConfigNode.path, { mtime: 123 }, { mtime: 456 });
    //     done()
    //   })
    // })

    it('should be loaded', function (done) {
      helper.load(testIoConfigNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusIOConfigNode = helper.getNode('2f5a90d.bcaa1f')
        modbusIOConfigNode.should.have.property('name', 'ModbusIOConfig')
        done()
      })
    })

    it('should be state queueing - ready to send', function (done) {
      helper.load(testIoConfigNodes, testFlows.testShouldBeReadyToSendFlow, function () {
        const modbusClientNode = helper.getNode('1b49af22a0d089c9')
        setTimeout(() => {
          mBasics.setNodeStatusTo('queueing', modbusClientNode)
          const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false()
          done()
        }, 1500)
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      helper.load(testIoConfigNodes, testFlows.testShouldBeReadyToSendFlow, function () {
        const modbusClientNode = helper.getNode('1b49af22a0d089c9')
        setTimeout(() => {
          mBasics.setNodeStatusTo('stopped', modbusClientNode)
          const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false()
          done()
        }, 1500)
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testIoConfigNodes, testFlows.testShouldBeReadyToSendFlow, function () {
        helper.request().post('/modbus-io-config/invalid').expect(404).end(done)
      })
    })
  })
})
