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

const injectNode = require('@node-red/nodes/core/common/20-inject.js')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
const nodeUnderTest = require('../../src/modbus-flex-getter.js')
const functionNode = require('@node-red/nodes/core/function/10-function')

const testFlexGetterNodes = [injectNode, clientNode, serverNode, nodeUnderTest, functionNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-flex-getter-flows')
const mBasics = require('../../src/modbus-basics')
const _ = require('underscore')

const { getPort } = require('../helper/test-helper-extensions')

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

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

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
    })

    it('simple flow with inject should be loaded', function (done) {
      const flow = Array.from(testFlows.testFlexGetterWithInjectFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('bc5a61b6.a3972')
          const h1 = helper.getNode('h1')
          let counter = 0
          h1.on('input', function () {
            counter++
            if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
              done()
            }
          })
        }, function () {
          helper.log('function callback')
        })
      })
    })

    it('simple flow with inject should be loaded and read be done', function (done) {
      const flow = Array.from(testFlows.testFlexGetterWithInjectFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[5].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('bc5a61b6.a3972')
          let counter = 0
          modbusGetter.on('modbusFlexGetterNodeDone', function () {
            counter++
            if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
              done()
            }
          })
        }, function () {
          helper.log('function callback')
        })
      })
    })

    it('simple flow should be loaded and with receive got input', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('bc5a61b6.a3972')
          const h1 = helper.getNode('h1')
          let counter = 0
          h1.on('input', function () {
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
    })

    it('simple flow with wrong write inject should not crash', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

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
    })

    it('simple flow with wrong address inject should not crash', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

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
    })

    it('simple flow with wrong quantity inject should not crash', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

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
    })

    it('should be inactive if message not allowed', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusClientNode = helper.getNode('92e7bf63.2efd7')
          _.isUndefined(modbusClientNode).should.be.false()

          setTimeout(() => {
            modbusClientNode.receive({ payload: 'test' })
            const isInactive = modbusClientNode.isInactive()
            isInactive.should.be.false()
            done()
          }, 1500)
        })
      })
    })

    it('should be inactive if message empty', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusClientNode = helper.getNode('92e7bf63.2efd7')
          setTimeout(() => {
            modbusClientNode.messageAllowedStates = ['']
            const isInactive = modbusClientNode.isInactive()
            isInactive.should.be.true()
            done()
          }, 1500)
        })
      })
    })

    it('should be state queueing - ready to send', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusClientNode = helper.getNode('92e7bf63.2efd7')
          setTimeout(() => {
            mBasics.setNodeStatusTo('queueing', modbusClientNode)
            const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
            isReady.should.be.true()
            done()
          }, 1500)
        })
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusClientNode = helper.getNode('92e7bf63.2efd7')
          setTimeout(() => {
            mBasics.setNodeStatusTo('stopped', modbusClientNode)
            const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
            isReady.should.be.true()
            done()
          }, 1500)
        })
      })
    })

    it('should inject 5 messages but only use one to test initial delay', function (done) {
      const flow = Array.from(testFlows.testFlexGetterWithInjectAndDelayFlow)

      getPort().then((port) => {
        flow[9].serverPort = port
        flow[10].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const getterNode = helper.getNode('823b8c53.ee14b8')
          const helperNode = helper.getNode('23156c303a59c400')
          let getterCounter = 0
          let helperCounter = 0
          let startingTimestamp = null
          let endTimestamp = null

          getterNode.on('input', () => {
            getterCounter++

            if (getterCounter === 1) {
              startingTimestamp = Date.now()
            } else if (getterCounter === 5) {
              endTimestamp = Date.now()
            }
          })

          helperNode.on('input', () => {
            helperCounter++

            const difBetweenTimestamps = endTimestamp - startingTimestamp
            getterCounter.should.be.eql(5) // we want to see 5 msgs on the getter before
            helperCounter.should.be.greaterThanOrEqual(1)
            difBetweenTimestamps.should.be.greaterThanOrEqual(3000)

            done()
          })
        })
      })
    })

    it('should handle null or undefined input message', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetterNode = helper.getNode('bc5a61b6.a3972')
          setTimeout(() => {
            let isReady = modbusGetterNode.isReadyForInput(null)
            isReady.should.be.true()
            isReady = modbusGetterNode.isReadyForInput(undefined)
            isReady.should.be.true()
            done()
          }, 1500)
        })
      })
    })

    // it('should return true for valid Modbus message', function (done) {
    //   const modbusMsg = {
    //     payload: {
    //       fc: 1,
    //       address: 10,
    //       quantity: 5
    //     }
    //   }
    //   const flow = Array.from(testFlows.testFlexGetterFlow)
    //   flow[1].serverPort = "50114"
    //   helper.load(testFlexGetterNodes, flow, function () {
    //     const n1 = helper.getNode('bc5a61b6.a3972');
    //     setTimeout(() => {
    //     n1.on('input', function (msg) {
    //
    //     const isValid = n1.isValidModbusMsg(msg)
    //     isValid.should.be.true
    //     done() } , 1500)
    //   })

    // })
    // })

    /**
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
     */
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          helper.request().post('/modbus-flex-getter/invalid').expect(404).end(done)
        })
      })
    })
  })
})
