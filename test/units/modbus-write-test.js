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
const nodeUnderTest = require('../../src/modbus-write.js')
const functionNode = require('@node-red/nodes/core/function/10-function')

const sinon = require('sinon')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const expect = require('chai').expect

const testSimpleWriteParametersNodes = [injectNode, clientNode, serverNode, nodeUnderTest, functionNode]

const testFlows = require('./flows/modbus-write-flows')
const { getPort } = require('../helper/test-helper-extensions')

describe('Write node Testing', function () {
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
  describe('Unique Port', function () {

    // it('simple flow with string true http inject and write should be loaded and write done', function (done) {
    //   const flow = Array.from(testFlows.testSimpleWriteFlow)
    //   getPort().then((port) => {
    //     flow[1].serverPort = port
    //     flow[4].tcpPort = port
    //     helper.load(testSimpleWriteParametersNodes, testFlows.testSimpleWriteFlow, function () {
    //       const modbusWrite = helper.getNode('258dc103f99d2f2e')
    //       setTimeout(function () {
    //         modbusWrite.receive({ payload: { value: 'true', fc: 5, unitid: 1, address: 0, quantity: 1 } })
    //       }, 800)

    //       modbusWrite.on('modbusWriteNodeDone', () => {
    //         if (modbusWrite.bufferMessageList.size === 0) {
    //           done()
    //         }
    //       })
    //     })
    //   })
    // })
  })

  describe('Node', function () {
    it('should update status, send message, and emit event on successful write', function (done) {
      helper.load(testSimpleWriteParametersNodes, testFlows.testWriteExampleFlow, function () {
        const modbusWriteNode = helper.getNode('e71050e54fc87ddf')
        const emitSpy = sinon.spy(modbusWriteNode, 'emit')

        const resp = { value: 'response' }
        const msg = { payload: 'request' }

        modbusWriteNode.onModbusWriteDone(resp, msg)

        sinon.assert.calledOnce(emitSpy)
        sinon.assert.calledWithExactly(emitSpy, 'modbusWriteNodeDone')

        done()
      })
    })

    it('should handle comma-separated string values correctly', function (done) {
      helper.load(testSimpleWriteParametersNodes, testFlows.testWriteExampleFlow, function () {
        const modbusWriteNode = helper.getNode('e71050e54fc87ddf')

        const msg = {
          payload: {
            value: '{ "name": "John", "age": 30, "city": "New York" }'
          }
        }
        const processedMsg = modbusWriteNode.setMsgPayloadFromHTTPRequests(msg)
        setTimeout(function () {
          expect(processedMsg).to.equal(msg)
          done()
        }, 0)
      })
    })

    it('should handle boolean string values correctly', function (done) {
      helper.load(testSimpleWriteParametersNodes, testFlows.testWriteExampleFlow, function () {
        const modbusWriteNode = helper.getNode('e71050e54fc87ddf')

        const msg = { payload: { value: 'false' } }
        const processedMsg = modbusWriteNode.setMsgPayloadFromHTTPRequests(msg)
        setTimeout(function () {
          expect(processedMsg.payload.value).to.equal(false)
          done()
        }, 0)
      })
    })

    it('simple Node should be loaded without client config', function (done) {
      helper.load(testSimpleWriteParametersNodes, testFlows.testWriteFlow, function () {
        const inject = helper.getNode('67dded7e.025904')
        inject.should.have.property('name', 'injectTrue')

        const modbusServer = helper.getNode('e54529b9.952ea8')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('1f258d73662d6493')
        modbusClient.should.have.property('name', 'modbusClient')

        const modbusWrite = helper.getNode('8ad2951c.2df708')
        modbusWrite.should.have.property('name', 'modbusWrite')

        done()
      })
    })

    it('simple flow with boolean injects and write should be loaded', function (done) {
      helper.load(testSimpleWriteParametersNodes, testFlows.testWriteCycleFlow, function () {
        const modbusWrite = helper.getNode('1ed908da.427ecf')
        const h1 = helper.getNode('h1')
        h1.on('input', function () {
          if (modbusWrite.bufferMessageList.size === 0) {
            done()
          }
        })
      })
    })

    it('simple flow with string false http inject and write should be loaded', function (done) {
      const flow = Array.from(testFlows.testSimpleWriteFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[7].tcpPort = port

        helper.load(testSimpleWriteParametersNodes, flow, function () {
          const modbusWrite = helper.getNode('258dc103f99d2f2e')
          setTimeout(function () {
            modbusWrite.receive({ payload: { value: 'false', fc: 5, unitid: 1, address: 0, quantity: 1 } })
          }, 800)
          const h1 = helper.getNode('f780a7d088ac2b22')
          h1.on('input', function () {
            if (modbusWrite.bufferMessageList.size === 0) {
              done()
            }
          })
        })
      })
    })

    it('simple flow with string with array of values input from http should be parsed and written', function (done) {
      const flow = Array.from(testFlows.testSimpleWriteFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[7].tcpPort = port

        helper.load(testSimpleWriteParametersNodes, flow, function () {
          const h1 = helper.getNode('f780a7d088ac2b22')
          h1.on('input', function () {
            if (modbusWrite.bufferMessageList.size === 0) {
              done()
            }
          })
          const modbusWrite = helper.getNode('258dc103f99d2f2e')
          setTimeout(function () {
            modbusWrite.receive({ payload: '{ "value": [0,1,0,1], "fc": 5, "unitid": 1,"address": 0, "quantity": 4 }' })
          }, 800)
        })
      })
    })

    it('should inject at least 4 messages but only use one to test initial delay', function (done) {
      const flow = Array.from(testFlows.testSimpleWriteFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[7].tcpPort = port

        helper.load(testSimpleWriteParametersNodes, flow, function () {
          const writeNode = helper.getNode('258dc103f99d2f2e')
          const helperNode = helper.getNode('f780a7d088ac2b22')
          let getterCounter = 0
          let helperCounter = 0
          let startingTimestamp = null
          let endTimestamp = null

          writeNode.on('input', () => {
            getterCounter++

            if (getterCounter === 1) {
              startingTimestamp = Date.now()
            }
            endTimestamp = Date.now()
          })

          helperNode.on('input', () => {
            helperCounter++

            if (helperCounter > 3) {
              const difBetweenTimestamps = endTimestamp - startingTimestamp
              getterCounter.should.be.greaterThanOrEqual(6)
              helperCounter.should.be.greaterThanOrEqual(1)
              helperCounter.should.be.greaterThanOrEqual(3)
              difBetweenTimestamps.should.be.greaterThanOrEqual(1500)

              done()
            }
          })
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testSimpleWriteParametersNodes, testFlows.testSimpleWriteFlow, function () {
        helper.request().post('/modbus-write/invalid').expect(404).end(done)
      })
    })
  })
})
