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
const catchNode = require('@node-red/nodes/core/common/25-catch.js')
const functionNode = require('@node-red/nodes/core/function/10-function.js')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
const nodeUnderTest = require('../../src/modbus-flex-write.js')
const sinon = require('sinon')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const expect = require('chai').expect
const testFlows = require('./flows/modbus-flex-write-flows')
const mBasics = require('../../src/modbus-basics')
const _ = require('underscore')
const { getPort } = require('../helper/test-helper-extensions')

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
    it('should initialize input delay timer when delayOnStart is true', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testModbusFlexWriteFlow, function () {
        const modbusFlexWrite = helper.getNode('dcb6fa4b3549ae4f')
        modbusFlexWrite.delayOnStart = true
        const setTimeoutStub = sinon.stub(global, 'setTimeout')

        modbusFlexWrite.initializeInputDelayTimer()

        sinon.assert.calledOnce(setTimeoutStub)
        setTimeoutStub.restore()
        done()
      })
    })

    it('should parse comma-separated string into array', function (done) {
      const msg = {
        payload: {
          value: '{ "name": "John", "age": 30, "city": "New York" }'
        }
      }

      helper.load(testWriteParametersNodes, testFlows.testModbusFlexWriteFlow, function () {
        const modbusFlexWrite = helper.getNode('dcb6fa4b3549ae4f')

        const processedMsg = modbusFlexWrite.setMsgPayloadFromHTTPRequests(msg)
        setTimeout(function () {
          expect(processedMsg).to.equal(msg)
          done()
        }, 0)
      })
    })

    it('should log error message when showErrors is true', function (done) {
      const msg = {
        payload: 'test payload'
      }

      const err = new Error('Test error')

      const logMsgErrorSpy = sinon.spy(mBasics, 'logMsgError')

      helper.load(testWriteParametersNodes, testFlows.testModbusFlexWriteFlow, function () {
        const modbusFlexWrite = helper.getNode('dcb6fa4b3549ae4f')

        modbusFlexWrite.showErrors = true

        modbusFlexWrite.errorProtocolMsg(err, msg)
        sinon.assert.calledOnce(logMsgErrorSpy)

        sinon.assert.calledWith(logMsgErrorSpy, modbusFlexWrite, err, msg)

        logMsgErrorSpy.restore()
        done()
      })
    })

    it('should handle Modbus write error', function (done) {
      const err = new Error('Test Modbus write error')
      const msg = {
        payload: 'test payload'
      }

      helper.load(testWriteParametersNodes, testFlows.testModbusFlexWriteFlow, function () {
        const modbusFlexWrite = helper.getNode('dcb6fa4b3549ae4f')
        const emitSpy = sinon.spy(modbusFlexWrite, 'emit')

        modbusFlexWrite.onModbusWriteError(err, msg)
        sinon.assert.calledOnce(emitSpy)
        sinon.assert.calledWith(emitSpy, 'modbusFlexWriteNodeError')

        emitSpy.restore()
        done()
      })
    })

    it('should update status, send message, and emit event', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testModbusFlexWriteFlow, function () {
        const modbusFlexWrite = helper.getNode('dcb6fa4b3549ae4f')
        const resp = { value: 'response' }
        const msg = { payload: 'request' }
        const emitSpy = sinon.spy(modbusFlexWrite, 'emit')

        modbusFlexWrite.onModbusWriteDone(resp, msg)
        sinon.assert.calledOnce(emitSpy)
        emitSpy.restore()

        done()
      })
    })

    it('simple Node should be loaded without client config', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testShouldBeLoadedWithoutClientFlow, function () {
        const modbusFlexWrite = helper.getNode('c02b6d1.d419c1')
        modbusFlexWrite.should.have.property('name', 'modbusFlexWrite')
        done()
      })
    })

    it('simple Node should be loaded', function (done) {
      helper.load(testWriteParametersNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusFlexWrite = helper.getNode('c02b6d1.d419c1')
        modbusFlexWrite.should.have.property('name', 'modbusFlexWrite')
        done()
      })
    })

    // it('simple flow with inject and write should be loaded', function (done) {
    //   helper.load(testWriteParametersNodes, testFlows.testInjectAndWriteShouldBeLoadedFlow, function () {
    //     const h1 = helper.getNode('h1')
    //     h1.on('input', function () {
    //       done()
    //     })
    //   })
    // })

    it('simple flow with wrong inject should not crash', function (done) {
      const flow = Array.from(testFlows.testWriteParametersFlow)

      getPort().then((port) => {
        flow[3].serverPort = port
        flow[7].tcpPort = port

        helper.load(testWriteParametersNodes, flow, function () {
          const h1 = helper.getNode('h1')
          h1.on('input', function () {
            throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
          })
          const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
          setTimeout(function () {
            flexWriter.receive({})
          }, 800)
          setTimeout(done, 1200)
        })
      })
    })

    it('simple flow with wrong FC inject should not crash', function (done) {
      const flow = Array.from(testFlows.testWriteParametersFlow)

      getPort().then((port) => {
        flow[3].serverPort = port
        flow[7].tcpPort = port

        helper.load(testWriteParametersNodes, flow, function () {
          const h1 = helper.getNode('h1')
          h1.on('input', function () {
            throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
          })
          const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
          setTimeout(function () {
            flexWriter.receive({ payload: '{ "value": true, "fc": 1, "unitid": 1,"address": 0, "quantity": 1 }' })
          }, 800)
          setTimeout(done, 1200)
        })
      })
    })

    it('simple flow with wrong address inject should not crash', function (done) {
      const flow = Array.from(testFlows.testWriteParametersFlow)

      getPort().then((port) => {
        flow[3].serverPort = port
        flow[7].tcpPort = port

        helper.load(testWriteParametersNodes, flow, function () {
          const h1 = helper.getNode('h1')
          h1.on('input', function () {
            throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
          })
          const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
          setTimeout(function () {
            flexWriter.receive({ payload: '{ "value": true, "fc": 5, "unitid": 1,"address": -1, "quantity": 1 }' })
          }, 800)
          setTimeout(done, 1200)
        })
      })
    })

    it('simple flow with wrong quantity inject should not crash', function (done) {
      const flow = Array.from(testFlows.testWriteParametersFlow)

      getPort().then((port) => {
        flow[3].serverPort = port
        flow[7].tcpPort = port

        helper.load(testWriteParametersNodes, flow, function () {
          const h1 = helper.getNode('h1')
          h1.on('input', function () {
            throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
          })
          const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
          setTimeout(function () {
            flexWriter.receive({ payload: '{ "value": true, "fc": 5, "unitid": 1,"address": 1, "quantity": -1 }' })
          }, 800)
          setTimeout(done, 1200)
        })
      })
    })

    // it('simple flow with string input from http should be parsed and written', function (done) {
    //   const flow = Array.from(testFlows.testWriteParametersFlow)

    //   getPort().then((port) => {
    //     flow[3].serverPort = port
    //     flow[7].tcpPort = port

    //     helper.load(testWriteParametersNodes, flow, function () {
    //       const h1 = helper.getNode('h1')
    //       h1.on('input', function () {
    //         if (flexWriter.bufferMessageList.size === 0) {
    //           done()
    //         }
    //       })
    //       const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
    //       setTimeout(function () {
    //         flexWriter.receive({ payload: '{ "value": true, "fc": 5, "unitid": 1,"address": 0, "quantity": 1 }' })
    //       }, 800)
    //     })
    //   })
    // })

    // it('simple flow with string with array of values input from http should be parsed and written', function (done) {
    //   const flow = Array.from(testFlows.testWriteParametersFlow)

    //   getPort().then((port) => {
    //     flow[3].serverPort = port
    //     flow[7].tcpPort = port

    //     helper.load(testWriteParametersNodes, flow, function () {
    //       const h1 = helper.getNode('h1')
    //       h1.on('input', function () {
    //         if (flexWriter.bufferMessageList.size === 0) {
    //           done()
    //         }
    //       })
    //       const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
    //       setTimeout(function () {
    //         flexWriter.receive({ payload: '{ "value": [0,1,0,1], "fc": 5, "unitid": 1,"address": 0, "quantity": 4 }' })
    //       }, 800)
    //     })
    //   })
    // })

    // it('simple flow with string value true input from http should be parsed and written', function (done) {
    //   const flow = Array.from(testFlows.testWriteParametersFlow)

    //   getPort().then((port) => {
    //     flow[3].serverPort = port
    //     flow[7].tcpPort = port

    //     helper.load(testWriteParametersNodes, flow, function () {
    //       const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
    //       const h1 = helper.getNode('h1')
    //       h1.on('input', function () {
    //         if (flexWriter.bufferMessageList.size === 0) {
    //           done()
    //         }
    //       })
    //       setTimeout(function () {
    //         flexWriter.receive({ payload: { value: 'true', fc: 5, unitid: 1, address: 0, quantity: 1 } })
    //       }, 800)
    //     })
    //   })
    // })

    // it('simple flow with string value false input from http should be parsed and written', function (done) {
    //   const flow = Array.from(testFlows.testWriteParametersFlow)

    //   getPort().then((port) => {
    //     flow[3].serverPort = port
    //     flow[7].tcpPort = port

    //     helper.load(testWriteParametersNodes, flow, function () {
    //       const h1 = helper.getNode('h1')
    //       h1.on('input', function () {
    //         if (flexWriter.bufferMessageList.size === 0) {
    //           done()
    //         }
    //       })
    //       const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
    //       setTimeout(function () {
    //         flexWriter.receive({ payload: { value: 'false', fc: 5, unitid: 1, address: 0, quantity: 1 } })
    //       }, 800)
    //     })
    //   })
    // })

    it('should be inactive if message not allowed', function (done) {
      const flow = Array.from(testFlows.testWriteParametersFlow)

      getPort().then((port) => {
        flow[3].serverPort = port
        flow[7].tcpPort = port

        helper.load(testWriteParametersNodes, flow, function () {
          const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
          _.isUndefined(modbusClientNode).should.be.false()

          modbusClientNode.receive({ payload: 'test' })
          const isInactive = modbusClientNode.isInactive()
          isInactive.should.be.true()
          done()
        })
      })

      it('should be inactive if message empty', function (done) {
        const flow = Array.from(testFlows.testWriteParametersFlow)
        flow[3].serverPort = '50201'
        helper.load(testWriteParametersNodes, flow, function () {
          const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
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
      const flow = Array.from(testFlows.testWriteParametersFlow)

      getPort().then((port) => {
        flow[3].serverPort = port
        flow[7].tcpPort = port

        helper.load(testWriteParametersNodes, flow, function () {
          const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
          setTimeout(() => {
            mBasics.setNodeStatusTo('queueing', modbusClientNode)
            const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
            isReady.should.be.false()
            done()
          }, 1500)
        })
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      const flow = Array.from(testFlows.testWriteParametersFlow)

      getPort().then((port) => {
        flow[3].serverPort = port
        flow[7].tcpPort = port

        helper.load(testWriteParametersNodes, flow, function () {
          const modbusClientNode = helper.getNode('80aeec4c.0cb9e8')
          setTimeout(() => {
            mBasics.setNodeStatusTo('stopped', modbusClientNode)
            const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
            isReady.should.be.false()
            done()
          }, 1500)
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testWriteParametersNodes, [], function () {
        helper.request().post('/modbus-flex-write/invalid').expect(404).end(done)
      })
    })
  })
})
