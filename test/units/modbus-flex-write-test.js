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

const assert = require('chai').assert

const injectNode = require('@node-red/nodes/core/common/20-inject.js')
const catchNode = require('@node-red/nodes/core/common/25-catch.js')
const functionNode = require('@node-red/nodes/core/function/10-function.js')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
const nodeUnderTest = require('../../src/modbus-flex-write.js')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-flex-write-flows')

const testWriteParametersNodes = [catchNode, injectNode, functionNode, clientNode, serverNode, nodeUnderTest]

describe('Flex Write node Testing', function () {
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
      helper.load(testWriteParametersNodes,testFlows.testShouldBeLoadedWithoutClientFlow , function () {
        const modbusFlexWrite = helper.getNode('c02b6d1.d419c1')
        modbusFlexWrite.should.have.property('name', 'modbusFlexWrite')
        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should be loaded', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusFlexWrite = helper.getNode('c02b6d1.d419c1')
        modbusFlexWrite.should.have.property('name', 'modbusFlexWrite')
        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject and write should be loaded', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testInjectAndWriteShouldBeLoadedFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          done()
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong inject should not crash', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({})
        }, 800)
        setTimeout(done, 1200)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong FC inject should not crash', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: '{ "value": true, "fc": 1, "unitid": 1,"address": 0, "quantity": 1 }' })
        }, 800)
        setTimeout(done, 1200)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong address inject should not crash', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: '{ "value": true, "fc": 5, "unitid": 1,"address": -1, "quantity": 1 }' })
        }, 800)
        setTimeout(done, 1200)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong quantity inject should not crash', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: '{ "value": true, "fc": 5, "unitid": 1,"address": 1, "quantity": -1 }' })
        }, 800)
        setTimeout(done, 1200)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string input from http should be parsed and written', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (flexWriter.bufferMessageList.size === 0) {
            done()
          }
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: '{ "value": true, "fc": 5, "unitid": 1,"address": 0, "quantity": 1 }' })
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string with array of values input from http should be parsed and written', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (flexWriter.bufferMessageList.size === 0) {
            done()
          }
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: '{ "value": [0,1,0,1], "fc": 5, "unitid": 1,"address": 0, "quantity": 4 }' })
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string value true input from http should be parsed and written', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testWriteParametersFlow, function () {
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (flexWriter.bufferMessageList.size === 0) {
            done()
          }
        })
        setTimeout(function () {
          flexWriter.receive({ payload: { value: 'true', fc: 5, unitid: 1, address: 0, quantity: 1 } })
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string value false input from http should be parsed and written', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (flexWriter.bufferMessageList.size === 0) {
            done()
          }
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: { value: 'false', fc: 5, unitid: 1, address: 0, quantity: 1 } })
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-write/invalid').expect(404).end(done)
    })
  })
})
