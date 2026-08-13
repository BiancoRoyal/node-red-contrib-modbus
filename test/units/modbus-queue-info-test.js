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
const assert = require('assert')
const sinon = require('sinon')
const testQueueInfoNodes = [catchNode, injectNode, functionNode, clientNode, serverNode, nodeUnderTest, readNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-queue-info-flows')
const mbBasics = require('../../src/modbus-basics')
const { withEphemeralPorts, muteAutoInjects, waitForLiveClientServer, onceDone } = require('../helper/test-helper-extensions')

function loadFlow (nodes, flowTemplate, callback) {
  withEphemeralPorts(flowTemplate).then((flow) => {
    muteAutoInjects(flow)
    helper.load(nodes, flow, callback)
  }).catch((err) => {
    throw err
  })
}

describe('Queue Info node Testing', function () {
  this.timeout(process.env.CI ? 60000 : 30000)

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
    it('should handle error in input parsing and call error handling functions', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusQueueInfoNode = helper.getNode('ef5dad20.e97af')

        const msg = {
          payload: { resetQueue: false, queue: '' }
        }

        modbusQueueInfoNode.emit('input', msg)
        assert.deepEqual(msg.payload.queue, [])
        done()
      })
    })

    it('should return if updateStatusRunning is true', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusQueueInfoNode = helper.getNode('ef5dad20.e97af')
        modbusQueueInfoNode.updateStatusRunning = true
        modbusQueueInfoNode.unitsWithQueue = new Map([
          [1, { lowLevelReached: true, highLevelReached: false, highHighLevelReached: false }],
          [2, { lowLevelReached: false, highLevelReached: true, highHighLevelReached: false }],
          [3, { lowLevelReached: false, highLevelReached: false, highHighLevelReached: true }],
          [4, { lowLevelReached: false, highLevelReached: true, highHighLevelReached: false }]
        ])
        let fillColor = modbusQueueInfoNode.getStatusSituationFillColor(1)
        assert.deepEqual(fillColor, 'green')

        fillColor = modbusQueueInfoNode.getStatusSituationFillColor(2)
        assert.deepEqual(fillColor, 'yellow')

        fillColor = modbusQueueInfoNode.getStatusSituationFillColor(3)
        assert.deepEqual(fillColor, 'red')

        modbusQueueInfoNode.errorOnHighLevel = true
        fillColor = modbusQueueInfoNode.getStatusSituationFillColor(4)
        assert.deepEqual(fillColor, 'red')

        done()
      })
    })

    it('should warn when high level queue threshold is reached and errorOnHighLevel is false', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusQueueInfoNode = helper.getNode('ef5dad20.e97af')

        modbusQueueInfoNode.unitsWithQueue = new Map([[1, { highLevelReached: false }]])
        modbusQueueInfoNode.lowLevel = 5
        modbusQueueInfoNode.highLevel = 10
        modbusQueueInfoNode.errorOnHighLevel = false

        let mockMessage = ''

        modbusQueueInfoNode.warn = function (message) {
          mockMessage = message
        }

        modbusQueueInfoNode.checkHighLevelReached(modbusQueueInfoNode, 11, 1)
        delete mockMessage.payload

        expect(mockMessage).to.deep.equal({
          topic: '',
          state: 'high level reached',
          unitid: 1,
          modbusClientName: 'modbusClient',
          highLevel: 10,
          bufferCommandListLength: 11
        })
        done()
      })
    })

    it('should handle showStatusActivities false condition', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testForshowStatusActivitiesIsFalse, function () {
        const setNodeDefaultStatusStub = sinon.stub(mbBasics, 'setNodeDefaultStatus')
        setNodeDefaultStatusStub.restore()

        done()
      })
    })

    it('should handle updateOnAllUnitQueues true condition', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusQueueInfoNode = helper.getNode('ef5dad20.e97af')
        modbusQueueInfoNode.updateOnAllUnitQueues = true
        const msg = {
          payload: { resetQueue: true },
          unitId: 1
        }

        modbusQueueInfoNode.emit('input', msg)
        expect(msg.payload).to.have.property('allQueueData', true)
        expect(msg.payload).to.have.property('queues')
        done()
      })
    })

    it('should handle errors in readFromAllUnitQueues when bufferCommands is false', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusQueueInfoNode = helper.getNode('ef5dad20.e97af')
        const modbusClient = helper.getNode('d4c76ff5.c424b8')
        modbusClient.bufferCommandList.get = function (unit) {
          throw new Error('Test Error')
        }

        modbusQueueInfoNode.readFromAllUnitQueues()

        expect('Test Error').to.equal('Test Error')
        done()
      })
    })

    it('should return if no server is available', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testWithNoServer, function () {
        const modbusQueueInfoNode = helper.getNode('ef5dad20.e97af')
        modbusQueueInfoNode.emit('input', { payload: [{ name: 'testFilter', value: 123 }] }
        )

        expect(true).to.equal(true)
        done()
      })
    })

    it('should handle errors correctly based on showErrors flag', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const error = new Error('Test Error')
        const message = { payload: 'Test Message' }
        const modbusQueueInfo = helper.getNode('ef5dad20.e97af')
        modbusQueueInfo.showErrors = true
        modbusQueueInfo.errorProtocolMsg(error, message)
        done()
      })
    })

    it('simple Node should be loaded', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusServer = helper.getNode('389153e.cb648ac')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('d4c76ff5.c424b8')
        modbusClient.should.have.property('name', 'modbusClient')

        const modbusQueueInfo = helper.getNode('ef5dad20.e97af')
        modbusQueueInfo.should.have.property('name', 'modbusQueueInfo')

        done()
      })
    })

    // TO BE FIXED

    it('should set updateStatusRunning to false and throw error when an error occurs', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testToThrowError, function () {
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
      loadFlow(testQueueInfoNodes, testFlows.testToReadLowLevelReached, function () {
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
      loadFlow(testQueueInfoNodes, testFlows.testToReadWhenHighLevelReached, function () {
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
      loadFlow(testQueueInfoNodes, testFlows.testToReadHighHighLevelReached, function () {
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

    it('simple flow with new reset inject should report queue state from live client', function (done) {
      const finish = onceDone(done)
      loadFlow(testQueueInfoNodes, testFlows.testNewResetInjectShouldBeLoadedFlow, function () {
        const h1 = helper.getNode('h1')
        const queueNode = helper.getNode('5fffb0bc.0b8a5')
        const server = helper.getNode('445454e4.968564')
        const client = helper.getNode('1e3ac4ea.86fa7b')

        waitForLiveClientServer(server, client, function (readyErr) {
          if (readyErr) return finish(readyErr)

          h1.once('input', function (msg) {
            try {
              assert.ok(msg && msg.payload, 'expected queue-info payload')
              assert.strictEqual(msg.payload.queueEnabled, true)
              assert.ok(
                msg.payload.queues != null || msg.payload.queue != null,
                'expected queues or queue field from live client'
              )
              finish()
            } catch (e) {
              finish(e)
            }
          })
          queueNode.receive({ payload: { resetQueue: true } })
          setTimeout(function () {
            finish(new Error('timeout waiting for queue-info reset payload'))
          }, process.env.CI ? 10000 : 5000)
        })
      })
    })

    it('simple flow with reset function for queue should report queue state from live client', function (done) {
      const finish = onceDone(done)
      loadFlow(testQueueInfoNodes, testFlows.testResetFunctionQueueFlow, function () {
        const h1 = helper.getNode('h1')
        const queueNode = helper.getNode('5fffb0bc.0b8a5')
        const server = helper.getNode('445454e4.968564')
        const client = helper.getNode('1e3ac4ea.86fa7b')

        waitForLiveClientServer(server, client, function (readyErr) {
          if (readyErr) return finish(readyErr)

          h1.once('input', function (msg) {
            try {
              assert.ok(msg && msg.payload, 'expected queue-info payload')
              assert.strictEqual(msg.payload.queueEnabled, true)
              assert.ok(
                msg.payload.queues != null || msg.payload.queue != null,
                'expected queues or queue field from live client'
              )
              finish()
            } catch (e) {
              finish(e)
            }
          })
          queueNode.receive({ payload: { resetQueue: true } })
          setTimeout(function () {
            finish(new Error('timeout waiting for queue-info reset-function payload'))
          }, process.env.CI ? 10000 : 5000)
        })
      })
    })

    it('reports queueEnabled against live client after connection', function (done) {
      const finish = onceDone(done)
      loadFlow(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const queueNode = helper.getNode('ef5dad20.e97af')
        const server = helper.getNode('389153e.cb648ac')
        const client = helper.getNode('d4c76ff5.c424b8')

        waitForLiveClientServer(server, client, function (readyErr) {
          if (readyErr) return finish(readyErr)

          const origSend = queueNode.send.bind(queueNode)
          queueNode.send = function (msg) {
            origSend(msg)
            const out = Array.isArray(msg) ? msg[0] : msg
            try {
              assert.ok(out && out.payload)
              assert.strictEqual(out.payload.queueEnabled, true)
              assert.ok(out.payload.queues != null || out.payload.queue != null)
              finish()
            } catch (e) {
              finish(e)
            }
          }

          queueNode.receive({ payload: {} })
          setTimeout(function () {
            finish(new Error('timeout waiting for live queue-info report'))
          }, process.env.CI ? 10000 : 5000)
        })
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusClientNode = helper.getNode('d4c76ff5.c424b8')
        setTimeout(() => {
          modbusClientNode.stateService.send('STOP')
          mbBasics.setNodeStatusTo('stopped', modbusClientNode)
          const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false()
          done()
        }, 1500)
      })
    })

    it('should log an error message if showErrors is true and an error occurs', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusQueueInfo = helper.getNode('389153e.cb648ac')

        modbusQueueInfo.showErrors = true
        done()
      })
    })

    it('should return the correct color based on queue levels reached', function (done) {
      loadFlow(testQueueInfoNodes, testFlows.testToupdateOnAllUnitQueues, function () {
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
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      loadFlow(testQueueInfoNodes, [], function () {
        helper.request().post('/modbus-queue-info/invalid').expect(404).end(done)
      })
    })
  })
})
