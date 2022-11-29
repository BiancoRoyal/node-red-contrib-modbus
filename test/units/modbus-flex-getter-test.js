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

const injectNode = require('@node-red/nodes/core/common/20-inject.js')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
const nodeUnderTest = require('../../src/modbus-flex-getter.js')

const testFlexGetterNodes = [injectNode, clientNode, serverNode, nodeUnderTest]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-flex-getter-flows')
const mBasics = require('../../src/modbus-basics')
const _ = require('underscore')

describe('Flex Getter node Testing', function () {
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
      const flow = Array.from(testFlows.testNodeWithoutClientFlow)
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
        modbusFlexGetter.should.have.property('name', 'modbusFlexGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should be loaded', function (done) {
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)
      flow[2].serverPort = "50100"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('92e7bf63.2efd7')
        modbusClient.should.have.property('name', 'ModbusServer')

        const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
        modbusFlexGetter.should.have.property('name', 'modbusFlexGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject should be loaded', function (done) {
      const flow = Array.from(testFlows.testFlexGetterWithInjectFlow)
      flow[1].serverPort = "50101"
      flow[5].tcpPort = "50101"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject should be loaded and read be done', function (done) {
      const flow = Array.from(testFlows.testFlexGetterWithInjectFlow)
      flow[1].serverPort = "50102"
      flow[5].tcpPort = "50102"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        let counter = 0
        modbusGetter.on('modbusFlexGetterNodeDone', function (msg) {
          counter++
          if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow should be loaded and with receive got input', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)
      flow[1].serverPort = "50103"
      flow[4].tcpPort = "50103"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
            done()
          }
        })
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 0, "quantity": 4 }' })
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong write inject should not crash', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)
      flow[1].serverPort = "50104"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "value": "true", "fc": 5, "unitid": 1,"address": 0, "quantity": 1 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong address inject should not crash', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)
      flow[1].serverPort = "50105"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": -1, "quantity": 1 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong quantity inject should not crash', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)
      flow[1].serverPort = "50106"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 1, "quantity": -1 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('should be inactive if message not allowed', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)
      flow[1].serverPort = "50107"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        _.isUndefined(modbusClientNode).should.be.false

        setTimeout(() => {
          modbusClientNode.receive({payload: "test"})
          let isInactive = modbusClientNode.isInactive()
          isInactive.should.be.true
          done()
        } , 1500)
      })
    })

    it('should be inactive if message empty', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)
      flow[1].serverPort = "50108"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        setTimeout(() => {
          modbusClientNode.messageAllowedStates = ['']
          let isInactive = modbusClientNode.isInactive()
          isInactive.should.be.true
          done()
        } , 1500)
      })
    })

    it('should be state queueing - ready to send', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)
      flow[1].serverPort = "50109"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        setTimeout(() => {
          mBasics.setNodeStatusTo('queueing', modbusClientNode)
          let isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.true
          done()
        } , 1500)
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)
      flow[1].serverPort = "50110"
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        setTimeout(() => {
          mBasics.setNodeStatusTo('stopped', modbusClientNode)
          let isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false
          done()
        } , 1500)
      })
    })

    it('should not be ready for input - no client', function (done) {
      const flow = Array.from(testFlows.testFlexGetterShowWarningsWithoutClientFlow)
      helper.load(testFlexGetterNodes, flow, function () {
        const modbusGetterNode = helper.getNode('bc5a61b6.a3972')
        setTimeout(() => {
          let isReady = modbusGetterNode.isReadyForInput({ payload: '{"value": 0, "fc": 1, "unitid": 1, "address": 0, "quantity": 1}' })  //TODO: modbusGetterNode.isReadyForInput is not a function
          isReady.should.be.false
          done()
        } , 1500)
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)
      flow[1].serverPort = "50112"
      helper.load(testFlexGetterNodes, flow, function () {
        helper.request().post('/modbus-flex-getter/invalid').expect(404).end(done)
      })
    })
  })
})
