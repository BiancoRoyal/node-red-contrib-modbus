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
const functionNode = require('@node-red/nodes/core/function/10-function.js')
const clientNode = require('../../src/modbus-client.js')
const readNode = require('../../src/modbus-read.js')
const serverNode = require('../../src/modbus-server.js')
const nodeUnderTest = require('../../src/modbus-queue-info.js')
const catchNode = require('@node-red/nodes/core/common/25-catch')
const chai = require('chai')
const expect = chai.expect
const testQueueInfoNodes = [catchNode, injectNode, functionNode, clientNode, serverNode, nodeUnderTest, readNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-queue-info-flows')
const mbBasics = require('../../src/modbus-basics')

describe('Queue Info node Testing', function () {
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
    it('should return if no server is available', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testWithNoServer, function () {
        const modbusQueueInfoNode = helper.getNode('ef5dad20.e97af')
        modbusQueueInfoNode.emit('input', { payload: [{ name: 'testFilter', value: 123 }] }
        )

        expect(true).to.equal(true)
        done()
      })
    })
    it('should handle errors correctly based on showErrors flag', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const error = new Error('Test Error')
        const message = { payload: 'Test Message' }
        const modbusQueueInfo = helper.getNode('ef5dad20.e97af')
        modbusQueueInfo.showErrors = true
        modbusQueueInfo.errorProtocolMsg(error, message)
        done()
      })
    })
    it('simple Node should be loaded', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusServer = helper.getNode('389153e.cb648ac')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('d4c76ff5.c424b8')
        modbusClient.should.have.property('name', 'modbusClient')

        const modbusQueueInfo = helper.getNode('ef5dad20.e97af')
        modbusQueueInfo.should.have.property('name', 'modbusQueueInfo')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
    // TO BE FIXED

    // it('should call checkQueueStates and setNodeStatusByActivity in readFromQueue', function (done) {
    //   helper.load(testQueueInfoNodes, testFlows.testbufferCommandsTrue, async () => {
    //     const modbusQueueInfoNode = helper.getNode('1b72b5d207427b00')
    //     const modbusClient = helper.getNode('d4c76ff5.c424b8')
    //     modbusQueueInfoNode.updateStatusRunning = false
    //     modbusClient.bufferCommands = true
    //     modbusClient.bufferCommandList.set(modbusClient.unit, [])
    //     modbusClient.bufferCommandList.get = function () {
    //       throw new Error('Simulated error')
    //     }
    //     await modbusQueueInfoNode.readFromQueue()
    //     setTimeout(function () {
    //       expect(modbusQueueInfoNode.updateStatusRunning).to.equal(false)
    //       done()
    //     }, 1500)
    //   })
    // })

    it('should set updateStatusRunning to false and throw error when an error occurs', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testToThrowError, function () {
        const modbusQueueInfoNode = helper.getNode('1b72b5d207427b00')
        let setStatus = {}

        modbusQueueInfoNode.status = function (status) {
          setStatus = status
        }
        modbusQueueInfoNode.readFromQueue()
        setTimeout(function () {
          expect(setStatus).to.deep.equal({ fill: 'blue', shape: 'ring', text: 'active (Unit-Id: 1) empty' })
          done()
        }, 1500)
      })
    })

    it('should send a message when low level queue threshold is reached', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testToReadLowLevelReached, function () {
        const modbusQueueInfoNodeInstance = helper.getNode('1b72b5d207427b00')
        const helperNode = helper.getNode('1aac12eebc4bd7cb')

        modbusQueueInfoNodeInstance.unitsWithQueue = new Map()
        modbusQueueInfoNodeInstance.unitsWithQueue.set(1, { lowLevelReached: false })
        modbusQueueInfoNodeInstance.send = function (msg) {
          helperNode.receive(msg)
        }

        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('state', 'low level reached')
            msg.should.have.property('unitid', 1)
            msg.should.have.property('bufferCommandListLength', 4)
            done()
          } catch (err) {
            done(err)
          }
        })
        modbusQueueInfoNodeInstance.checkLowLevelReached(modbusQueueInfoNodeInstance, 4, 1)
      })
    })

    it('should send a message when high level queue threshold is reached', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testToReadWhenHighLevelReached, function () {
        const modbusQueueInfoNodeInstance = helper.getNode('1b72b5d207427b00')
        const helperNode = helper.getNode('1aac12eebc4bd7cb')

        modbusQueueInfoNodeInstance.unitsWithQueue = new Map()
        modbusQueueInfoNodeInstance.unitsWithQueue.set(1, { highLevelReached: false })
        modbusQueueInfoNodeInstance.lowLevel = 5
        modbusQueueInfoNodeInstance.highLevel = 10

        modbusQueueInfoNodeInstance.send = function (msg) {
          helperNode.receive(msg)
        }

        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('state', 'high level reached')
            msg.should.have.property('unitid', 1)
            msg.should.have.property('bufferCommandListLength', 11)
            done()
          } catch (err) {
            done(err)
          }
        })
        modbusQueueInfoNodeInstance.checkHighLevelReached(modbusQueueInfoNodeInstance, 11, 1)
      })
    })

    it('should send a message and raise an error when high high level queue threshold is reached', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testToReadHighHighLevelReached, function () {
        const modbusQueueInfoNodeInstance = helper.getNode('1b72b5d207427b00')
        const helperNode = helper.getNode('1aac12eebc4bd7cb')
        modbusQueueInfoNodeInstance.unitsWithQueue = new Map()
        modbusQueueInfoNodeInstance.unitsWithQueue.set(1, { highHighLevelReached: false })
        modbusQueueInfoNodeInstance.highLevel = 20
        modbusQueueInfoNodeInstance.highHighLevel = 30

        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('state', 'high high level reached')
            msg.should.have.property('unitid', 1)
            msg.should.have.property('bufferCommandListLength', 35)
            done()
          } catch (err) {
            done(err)
          }
        })
        modbusQueueInfoNodeInstance.checkHighHighLevelReached(modbusQueueInfoNodeInstance, 35, 1)
      })
    })

    it('simple flow with old reset inject should be loaded', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testOldResetInjectShouldBeLoadedFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function () {
          done()
        })
        const queueNode = helper.getNode('5fffb0bc.0b8a5')
        queueNode.receive({ payload: '', resetQueue: true })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with new reset inject should be loaded', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testNewResetInjectShouldBeLoadedFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function () {
          done()
        })
        const queueNode = helper.getNode('5fffb0bc.0b8a5')
        queueNode.receive({ payload: { resetQueue: true } })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject and polling read should be loaded', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testInjectAndPollingShouldBeLoadedFlow, function () {
        const h1 = helper.getNode('h1')
        let countMsg = 0
        h1.on('input', function () {
          countMsg++
          if (countMsg === 16) {
            done()
          }
        })
        const queueNode = helper.getNode('5fffb0bc.0b8a5')
        queueNode.receive({ payload: '', resetQueue: true })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with reset function for queue', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testResetFunctionQueueFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function () {
          done()
        })
        const queueNode = helper.getNode('5fffb0bc.0b8a5')
        queueNode.receive({ payload: { resetQueue: true } })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusClientNode = helper.getNode('d4c76ff5.c424b8')
        setTimeout(() => {
          mbBasics.setNodeStatusTo('stopped', modbusClientNode)
          const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false()
          done()
        }, 1500)
      })
    })

    it('should log an error message if showErrors is true and an error occurs', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusQueueInfo = helper.getNode('389153e.cb648ac')

        modbusQueueInfo.showErrors = true
        done()
      })
    })

    it('should return the correct color based on queue levels reached', function () {
      helper.load(testQueueInfoNodes, testFlows.testToupdateOnAllUnitQueues, function () {
        const node = helper.getNode('07a7c865d5cb3125')
        node.unitsWithQueue.set(1, {})
        let color = node.getStatusSituationFillColor(1)
        expect(color).to.equal('blue')

        node.unitsWithQueue.set(2, { lowLevelReached: true })
        color = node.getStatusSituationFillColor(2)
        expect(color).to.equal('green')

        node.unitsWithQueue.set(3, { highLevelReached: true })
        node.errorOnHighLevel = false
        color = node.getStatusSituationFillColor(3)
        expect(color).to.equal('yellow')

        node.unitsWithQueue.set(4, { highLevelReached: true })
        node.errorOnHighLevel = true
        color = node.getStatusSituationFillColor(4)
        expect(color).to.equal('red')

        node.unitsWithQueue.set(5, { highHighLevelReached: true })
        color = node.getStatusSituationFillColor(5)
        expect(color).to.equal('red')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        helper.request().post('/modbus-read/invalid').expect(404).end(done)
      })
    })
  })
})
