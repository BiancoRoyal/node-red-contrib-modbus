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

var clientNode = require('../../src/modbus-client.js')
var serverNode = require('../../src/modbus-server.js')
var readNode = require('../../src/modbus-read.js')
var ioConfigNode = require('../../src/modbus-io-config')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/modbus-read-flows')

describe('Read node Testing', function () {
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
    it('simple Node should be loaded without client config', function (done) {
      helper.load([readNode], testFlows.testReadWithoutClientFlow, function () {
        var modbusRead = helper.getNode('8ecaae3e.4b8928')
        modbusRead.should.have.property('name', 'modbusRead')
        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should be loaded', function (done) {
      helper.load([clientNode, serverNode, readNode], testFlows.testReadWithClientFlow, function () {
        var modbusServer = helper.getNode('b071294594e37a6c')
        modbusServer.should.have.property('name', 'modbusServer')

        var modbusClient = helper.getNode('9018f377f076609d')
        modbusClient.should.have.property('name', 'modbusClient')

        var modbusRead = helper.getNode('09846c74de630616')
        modbusRead.should.have.property('name', 'modbusRead')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with empty topic', function (done) {
      helper.load([clientNode, serverNode, readNode], testFlows.testReadMsgFlow, function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (counter === 1 && msg.topic === 'polling') {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with own topic', function (done) {
      helper.load([clientNode, serverNode, readNode], testFlows.testReadMsgMyTopicFlow, function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (counter === 1 && msg.topic === 'myTopic') {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with IO', function (done) {
      helper.load([clientNode, serverNode, ioConfigNode, readNode], testFlows.testReadWithClientIoFlow, function () {
        const h1 = helper.getNode('h1')
        let countMsg = 0
        h1.on('input', function (msg) {
          countMsg++
          if (countMsg === 4) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with IO and sending IO-objects as payload', function (done) {
      helper.load([clientNode, serverNode, ioConfigNode, readNode], testFlows.testReadWithClientIoPayloadFlow, function () {
        const h1 = helper.getNode('h1')
        let countMsg = 0
        h1.on('input', function (msg) {
          countMsg++
          if (countMsg === 4) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-read/invalid').expect(404).end(done)
    })

    it('should fail for unloaded node', function (done) {
      helper.request().post('/modbus/read/inject/8ecaae3e.4b8928').expect(404).end(done)
    })

    it('should inject on valid node', function (done) {
      helper.load([clientNode, serverNode, readNode], testFlows.testReadWithClientFlow, function () {
        helper.request().post('/modbus/read/inject/09846c74de630616').expect(200).end(done)
      }, function () {
        helper.log('function callback')
      })
    })
  })
})
