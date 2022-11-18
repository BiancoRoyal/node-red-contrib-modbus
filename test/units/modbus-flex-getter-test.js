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
      helper.load(testFlexGetterNodes,testFlows.testNodeWithoutClientFlow , function () {
        const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
        modbusFlexGetter.should.have.property('name', 'modbusFlexGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should be loaded', function (done) {
      helper.load(testFlexGetterNodes,testFlows.testNodeShouldBeLoadedFlow , function () {
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
      helper.load(testFlexGetterNodes, testFlows.testFlexGetterWithInjectFlow, function () {
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
      helper.load(testFlexGetterNodes, testFlows.testFlexGetterWithInjectFlow, function () {
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
      helper.load(testFlexGetterNodes, testFlows.testFlexGetterFlow, function () {
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
      helper.load(testFlexGetterNodes, testFlows.testFlexGetterFlow, function () {
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
      helper.load(testFlexGetterNodes, testFlows.testFlexGetterFlow, function () {
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
      helper.load(testFlexGetterNodes, testFlows.testFlexGetterFlow, function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 1, "quantity": -1 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    /**
     * "Client not ready to read at state init"
     *
     * possible issue with access permissions
     * - "simple Node should recognize missing access permission"
     *    - how to simulate missing access permission in flow?
     *    - way to ask for access permission status?
     * - "simple Node should recognize existing access permission"
     *    - same questions
     *
     * possible issue with delay/inject before read/write
     *  - "simple Node should have not enough delay"
     *  - "simple Node should have enough delay"
     *
     */

    it('should be inactive if message not allowed', function (done) {
      helper.load(testFlexGetterNodes, testFlows.testFlexGetterFlow,function () {
        const modbusGetter = helper.getNode('bc5a61b6.a3972')

      } )
    })
  })

  //TODO: Check why this test fails when running alone - helper.request empty?
  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-getter/invalid').expect(404).end(done)
    })
  })
})
