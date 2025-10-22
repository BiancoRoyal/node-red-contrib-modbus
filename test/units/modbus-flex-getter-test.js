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
const mbIOCore = require('../../src/core/modbus-io-core.js')
const testFlexGetterNodes = [injectNode, clientNode, serverNode, nodeUnderTest, functionNode]
const sinon = require('sinon')
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
    sinon.restore()
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
        })
      })
    })

    it('simple flow with inject should be loaded', function (done) {
      const flow = Array.from(testFlows.testFlexGetterWithInjectFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[6].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('6d373a8628c3fc70')
          const h1 = helper.getNode('ba2b29b9cb35764c')
          let counter = 0
          h1.on('input', function () {
            counter++
            if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
              done()
            }
          })
        })
      })
    })

    it('simple flow with inject should be loaded and read be done and some msgs are queued', function (done) {
      const flow = Array.from(testFlows.testFlexGetterWithInjectFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[6].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusGetter = helper.getNode('6d373a8628c3fc70')
          let counter = 0
          const handler = function () {
            counter++
            if (modbusGetter.bufferMessageList.size >= 0 && counter === 1) {
              done()
            }
          }
          modbusGetter.on('modbusFlexGetterNodeDone', handler)
          modbusGetter.on('modbusFlexGetterNodeError', handler)
          setTimeout(function () {
            modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 0, "quantity": 1 }' })
          }, 1200)
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
          const h1 = helper.getNode('d7d5a41f495c591e')
          let counter = 0
          h1.on('input', function () {
            counter++
            if (modbusGetter.bufferMessageList.size >= 0 && counter === 1) {
              done()
            }
          })
          setTimeout(function () {
            modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 0, "quantity": 4 }' })
          }, 1200)
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
          }, 1200)
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
          }, 1200)
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
          }, 1200)
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
          const modbusFlexGetterNode = helper.getNode('bc5a61b6.a3972')
          setTimeout(() => {
            mBasics.setNodeStatusTo('queueing', modbusFlexGetterNode)
            modbusFlexGetterNode.statusText.should.be.equal('queueing')
            done()
          }, 1500)
        })
      })
    })

    it('should be not state stopped - not ready to send', function (done) {
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetterNode = helper.getNode('bc5a61b6.a3972')
          setTimeout(() => {
            mBasics.setNodeStatusTo('stopped', modbusFlexGetterNode)
            modbusFlexGetterNode.statusText.should.be.equal('stopped')
            done()
          }, 1500)
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

    it('should return true for valid Modbus message', function (done) {
      const modbusMsg = {
        payload: {
          fc: 1,
          address: 10,
          quantity: 5,
          unitId: NaN
        }
      }
      const flow = Array.from(testFlows.testFlexGetterFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const n1 = helper.getNode('bc5a61b6.a3972')
          setTimeout(() => {
            n1.on('input', function (msg) {
              const isValid = msg.payload.fc.should.equal(modbusMsg.payload.fc)
              if (isValid) {
                done()
              }
            }, 1500)
          })
        })
      })
    })

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

  describe('Modbus Node Test Cases', function () {
    it('should process a valid Modbus message', function (done) {
      const msg = { payload: 'valid' }
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
          const modbusClient = helper.getNode('92e7bf63.2efd7')
          modbusFlexGetter.showStatusActivities = true
          const isNotReadyForInputStub = sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          const isInactiveStub = sinon.stub(modbusClient, 'isInactive').returns(false)
          const invalidPayloadInStub = sinon.stub(mBasics, 'invalidPayloadIn').returns(false)
          const buildNewMessageObjectStub = sinon.stub(modbusFlexGetter, 'buildNewMessageObject')
          buildNewMessageObjectStub.throws(new Error('Error in buildNewMessageObject'))

          const errorProtocolMsgStub = sinon.stub(modbusFlexGetter, 'errorProtocolMsg')
          const sendEmptyMsgOnFailStub = sinon.stub(mBasics, 'sendEmptyMsgOnFail')

          modbusFlexGetter.emit('input', msg)
          sinon.assert.calledOnce(errorProtocolMsgStub)
          sinon.assert.calledOnce(sendEmptyMsgOnFailStub)

          isNotReadyForInputStub.restore()
          isInactiveStub.restore()
          invalidPayloadInStub.restore()
          buildNewMessageObjectStub.restore()
          errorProtocolMsgStub.restore()
          sendEmptyMsgOnFailStub.restore()
          done()
        })
      })
    })

    it('modbus messages that are timed-out or had an error should be cleared from the queue and internal bufferMessageList', function (done) {
      this.timeout(20000)
      const flow = Array.from(testFlows.testFlexGetterMemoryBehaviour)
      getPort().then((port) => {
        flow[0].serverPort = port
        flow[4].tcpPort = port
        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('6180c16bb1b47591')
          const modbusClient = helper.getNode('0e5e4c39a93a27cb')

          // Ensure the flex-getter will accept input and bypass client readiness checks
          sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          sinon.stub(modbusClient, 'isInactive').returns(false)
          sinon.stub(mBasics, 'invalidPayloadIn').returns(false)

          // Alternate Timeout/OK/Timeout/OK by intercepting the client's emit for readModbus
          const pattern = ['timeout', 'ok', 'timeout', 'ok']
          let step = 0
          const originalEmit = modbusClient.emit
          sinon.stub(modbusClient, 'emit').callsFake(function (event, newMsg, doneCb, errCb) {
            if (event === 'readModbus') {
              const mode = pattern[step++] || 'ok'
              if (mode === 'timeout') {
                const err = new Error('Test timeout')
                err.code = 'ETIMEDOUT'
                errCb(err, newMsg)
              } else {
                const resp = { data: [11], buffer: Buffer.alloc(2) }
                doneCb(resp, newMsg)
              }
              return true
            }
            return originalEmit.apply(this, arguments)
          })

          let dones = 0
          let errors = 0

          const timeout = setTimeout(() => done(new Error('Test timeout waiting for completions')), 18000)

          function assertQueuesEmpty () {
            // bufferMessageList must be empty
            modbusFlexGetter.bufferMessageList.size.should.be.equal(0)

            // Client inflight must be empty (if present)
            if (modbusClient.inflightByUnitId) {
              modbusClient.inflightByUnitId.size.should.be.equal(0)
            }

            // All per-unit queues must be empty
            if (modbusClient.bufferCommandList && typeof modbusClient.bufferCommandList.forEach === 'function') {
              let leftover = 0
              modbusClient.bufferCommandList.forEach(arr => { leftover += arr.length })
              leftover.should.be.equal(0)
            }
          }

          function maybeFinish () {
            if (dones + errors === pattern.length) {
              try {
                assertQueuesEmpty()
                clearTimeout(timeout)
                done()
              } catch (e) {
                clearTimeout(timeout)
                done(e)
              }
            }
          }

          modbusFlexGetter.on('modbusFlexGetterNodeDone', function () {
            dones++
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeError', function () {
            errors++
            maybeFinish()
          })

          // Send 4 messages directly following the configured pattern
          for (let i = 0; i < pattern.length; i++) {
            modbusFlexGetter.receive({ payload: { fc: 3, unitid: 1, address: 0, quantity: 1 } })
          }
        })
      })
    })

    it('Parallel unit-ids should arrive without deadlocks', function (done) {
      const flow = Array.from(testFlows.testFlexGetterMemoryBehaviour)
      getPort().then((port) => {
        flow[0].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('6180c16bb1b47591')
          const modbusClient = helper.getNode('0e5e4c39a93a27cb')
          const helperOut = helper.getNode('557a9898b1d265a1')

          // allow parallel by unit ids on the client
          modbusClient.parallelUnitIdsAllowed = true

          // Ensure readiness and valid payload acceptance
          sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          sinon.stub(modbusClient, 'isInactive').returns(false)
          sinon.stub(mBasics, 'invalidPayloadIn').returns(false)

          // Stub client read path to complete with small, unit-dependent delays to create interleaving
          const expectedUnitsByCall = [1, 2, 1, 2]
          const perUnitSeq = { 1: 0, 2: 0 }
          let callCount = 0
          sinon.stub(modbusClient, 'emit').callsFake((event, newMsg, doneCb, errCb) => {
            if (event === 'readModbus') {
              const idx = callCount++
              const unit = expectedUnitsByCall[idx]
              const seq = perUnitSeq[unit]++
              // annotate msg so we can assert ordering on helper output
              newMsg._unit = unit
              newMsg._seq = seq

              const delay = unit === 1 ? 30 : 5
              setTimeout(() => {
                const resp = { data: [idx + 1], buffer: Buffer.alloc(2) }
                doneCb(resp, newMsg)
              }, delay)
              return true
            }
            return false
          })

          const received = []
          let doneEvents = 0
          let errorEvents = 0

          const safety = setTimeout(() => done(new Error('Timeout waiting for parallel unit-ids completions')), 12000)

          function assertQueuesEmpty () {
            // flex-getter internal buffer must be empty
            modbusFlexGetter.bufferMessageList.size.should.be.equal(0)
            // client inflight (if used) must be empty
            if (modbusClient.inflightByUnitId) {
              modbusClient.inflightByUnitId.size.should.be.equal(0)
            }
            // client per-unit queues must be empty
            if (modbusClient.bufferCommandList && typeof modbusClient.bufferCommandList.forEach === 'function') {
              let leftover = 0
              modbusClient.bufferCommandList.forEach(arr => { leftover += arr.length })
              leftover.should.be.equal(0)
            }
          }

          function maybeFinish () {
            if (doneEvents === 4 && received.length === 4) {
              try {
                // both units should have preserved FIFO order individually
                const unit1Seqs = received.filter(r => r.unit === 1).map(r => r.seq)
                const unit2Seqs = received.filter(r => r.unit === 2).map(r => r.seq)
                unit1Seqs.should.eql([0, 1])
                unit2Seqs.should.eql([0, 1])
                // and there should be no errors
                errorEvents.should.be.equal(0)
                assertQueuesEmpty()
                clearTimeout(safety)
                done()
              } catch (e) {
                clearTimeout(safety)
                done(e)
              }
            }
          }

          helperOut.on('input', (msg) => {
            // capture annotated info
            received.push({ unit: msg._unit, seq: msg._seq })
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeDone', function () {
            doneEvents++
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeError', function () {
            errorEvents++
          })

          // Enqueue four reads: two for unit 1 and two for unit 2, interleaved
          const inputs = [
            { fc: 3, unitid: 1, address: 0, quantity: 1 },
            { fc: 3, unitid: 2, address: 0, quantity: 1 },
            { fc: 3, unitid: 1, address: 1, quantity: 1 },
            { fc: 3, unitid: 2, address: 1, quantity: 1 }
          ]
          inputs.forEach(p => modbusFlexGetter.receive({ payload: p }))
        })
      })
    })

    it('should continue normally after receiving a time-out', function (done) {
      const flow = Array.from(testFlows.testFlexGetterMemoryBehaviour)
      getPort().then((port) => {
        flow[0].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('6180c16bb1b47591')
          const modbusClient = helper.getNode('0e5e4c39a93a27cb')
          const helperOut = helper.getNode('557a9898b1d265a1')

          // Ensure readiness and valid payload acceptance
          sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          sinon.stub(modbusClient, 'isInactive').returns(false)
          sinon.stub(mBasics, 'invalidPayloadIn').returns(false)

          // First call: timeout via error callback; Second call: success via done callback
          let call = 0
          const originalEmit = modbusClient.emit
          sinon.stub(modbusClient, 'emit').callsFake(function (event, newMsg, doneCb, errCb) {
            if (event === 'readModbus') {
              call++
              if (call === 1) {
                const err = new Error('Simulated timeout')
                err.code = 'ETIMEDOUT'
                // call error callback, simulating a timeout
                errCb(err, newMsg)
              } else {
                const resp = { data: [42], buffer: Buffer.alloc(2) }
                doneCb(resp, newMsg)
              }
              return true
            }
            return originalEmit.apply(this, arguments)
          })

          let doneEvents = 0
          let errorEvents = 0
          const received = []

          const safety = setTimeout(() => done(new Error('Timeout waiting for timeout-then-continue sequence')), 18000)

          function assertQueuesEmpty () {
            // flex-getter internal buffer must be empty
            modbusFlexGetter.bufferMessageList.size.should.be.equal(0)
            // client inflight (if used) must be empty
            if (modbusClient.inflightByUnitId) {
              modbusClient.inflightByUnitId.size.should.be.equal(0)
            }
            // client per-unit queues must be empty
            if (modbusClient.bufferCommandList && typeof modbusClient.bufferCommandList.forEach === 'function') {
              let leftover = 0
              modbusClient.bufferCommandList.forEach(arr => { leftover += arr.length })
              leftover.should.be.equal(0)
            }
          }

          function maybeFinish () {
            // Expect exactly one error and one success
            if (errorEvents === 1 && doneEvents === 1 && received.length === 1) {
              try {
                Array.isArray(received[0]).should.be.true()
                received[0].length.should.be.equal(1)
                // ensure no additional unexpected events
                assertQueuesEmpty()
                clearTimeout(safety)
                done()
              } catch (e) {
                clearTimeout(safety)
                done(e)
              }
            }
          }

          helperOut.on('input', (msg) => {
            received.push(msg.payload)
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeDone', function () {
            doneEvents++
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeError', function () {
            errorEvents++
            maybeFinish()
          })

          // Enqueue two reads for the same unit id. First will time out, second should succeed automatically
          const inputs = [
            { fc: 3, unitid: 1, address: 0, quantity: 1 },
            { fc: 3, unitid: 1, address: 1, quantity: 1 }
          ]
          inputs.forEach(p => modbusFlexGetter.receive({ payload: p }))
        })
      })
    })

    it('should never leave traces of messages that were canceled mid-flight', function (done) {
      this.timeout(20000)
      const flow = Array.from(testFlows.testFlexGetterMemoryBehaviour)
      getPort().then((port) => {
        flow[0].serverPort = port
        flow[4].tcpPort = port
        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('6180c16bb1b47591')
          const modbusClient = helper.getNode('0e5e4c39a93a27cb')
          const helperOut = helper.getNode('557a9898b1d265a1')
          const modbusServer = helper.getNode('40a766446d840ea5')

          // Ensure readiness and valid payload acceptance
          sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          sinon.stub(modbusClient, 'isInactive').returns(false)
          sinon.stub(mBasics, 'invalidPayloadIn').returns(false)

          // Simulate server-closed mid-flight by causing the first read to error like a socket reset,
          // then the second read to succeed after a short delay. This verifies: no leaks + queue advances.
          let call = 0
          const originalEmit = modbusClient.emit
          sinon.stub(modbusClient, 'emit').callsFake(function (event, newMsg, doneCb, errCb) {
            if (event === 'readModbus') {
              call++
              if (call === 1) {
                // Close server socket in the background to better mirror CLOSED path (best-effort)
                try {
                  if (modbusServer && modbusServer.netServer && typeof modbusServer.netServer.close === 'function') {
                    // closing shortly after scheduling the error helps simulate mid-flight cancel
                    setTimeout(() => modbusServer.netServer.close(() => {}), 0)
                  }
                } catch (e) { /* ignore in tests */ }
                // Emit a connection-closed style error
                setImmediate(() => {
                  const err = new Error('Connection closed mid-flight')
                  err.code = 'ECONNRESET'
                  errCb(err, newMsg)
                })
              } else {
                setImmediate(() => {
                  const resp = { data: [7], buffer: Buffer.alloc(2) }
                  doneCb(resp, newMsg)
                })
              }
              return true
            }
            return originalEmit.apply(this, arguments)
          })

          let doneEvents = 0
          let errorEvents = 0
          const received = []

          const safety = setTimeout(() => done(new Error('Timeout waiting for mid-flight cancel handling')), 18000)

          function assertQueuesEmpty () {
            // flex-getter internal buffer must be empty
            modbusFlexGetter.bufferMessageList.size.should.be.equal(0)
            // client inflight (if used) must be empty
            if (modbusClient.inflightByUnitId) {
              modbusClient.inflightByUnitId.size.should.be.equal(0)
            }
            // client per-unit queues must be empty
            if (modbusClient.bufferCommandList && typeof modbusClient.bufferCommandList.forEach === 'function') {
              let leftover = 0
              modbusClient.bufferCommandList.forEach(arr => { leftover += arr.length })
              leftover.should.be.equal(0)
            }
          }

          function maybeFinish () {
            if (errorEvents === 1 && doneEvents === 1 && received.length === 1) {
              try {
                Array.isArray(received[0]).should.be.true()
                received[0].length.should.be.equal(1)
                assertQueuesEmpty()
                clearTimeout(safety)
                done()
              } catch (e) {
                clearTimeout(safety)
                done(e)
              }
            }
          }

          helperOut.on('input', (msg) => {
            received.push(msg.payload)
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeDone', function () {
            doneEvents++
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeError', function () {
            errorEvents++
            maybeFinish()
          })

          // Enqueue two reads for the same unit id. First will be canceled mid-flight (simulated), second should complete.
          const inputs = [
            { fc: 3, unitid: 1, address: 0, quantity: 1 },
            { fc: 3, unitid: 1, address: 1, quantity: 1 }
          ]
          inputs.forEach(p => modbusFlexGetter.receive({ payload: p }))
        })
      })
    })

    it('should continue with normal operation when serial connection timed-out', function (done) {
      this.timeout(20000)
      const flow = Array.from(testFlows.testFlexGetterMemoryBehaviour)
      getPort().then((port) => {
        flow[0].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('6180c16bb1b47591')
          const modbusClient = helper.getNode('0e5e4c39a93a27cb')
          const helperOut = helper.getNode('557a9898b1d265a1')

          // Configure client for serial mode and ensure no reconnect on timeout
          modbusClient.clienttype = 'serial'
          modbusClient.reconnectOnTimeout = false
          modbusClient.parallelUnitIdsAllowed = false

          // Ensure readiness and valid payload acceptance
          sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          sinon.stub(modbusClient, 'isInactive').returns(false)
          sinon.stub(mBasics, 'invalidPayloadIn').returns(false)

          // First call: timeout via error callback; Second call: success via done callback
          let call = 0
          const originalEmit = modbusClient.emit
          sinon.stub(modbusClient, 'emit').callsFake(function (event, newMsg, doneCb, errCb) {
            if (event === 'readModbus') {
              call++
              if (call === 1) {
                const err = new Error('Serial timeout')
                err.code = 'ETIMEDOUT'
                errCb(err, newMsg)
              } else {
                const resp = { data: [55], buffer: Buffer.alloc(2) }
                doneCb(resp, newMsg)
              }
              return true
            }
            return originalEmit.apply(this, arguments)
          })

          let doneEvents = 0
          let errorEvents = 0
          const received = []

          const safety = setTimeout(() => done(new Error('Timeout waiting for serial timeout then continue')), 18000)

          function assertQueuesEmpty () {
            // flex-getter internal buffer must be empty
            modbusFlexGetter.bufferMessageList.size.should.be.equal(0)
            // client inflight (if used) must be empty
            if (modbusClient.inflightByUnitId) {
              modbusClient.inflightByUnitId.size.should.be.equal(0)
            }
            // client per-unit queues must be empty
            if (modbusClient.bufferCommandList && typeof modbusClient.bufferCommandList.forEach === 'function') {
              let leftover = 0
              modbusClient.bufferCommandList.forEach(arr => { leftover += arr.length })
              leftover.should.be.equal(0)
            }
          }

          function maybeFinish () {
            if (errorEvents === 1 && doneEvents === 1 && received.length === 1) {
              try {
                Array.isArray(received[0]).should.be.true()
                received[0].length.should.be.equal(1)
                assertQueuesEmpty()
                clearTimeout(safety)
                done()
              } catch (e) {
                clearTimeout(safety)
                done(e)
              }
            }
          }

          helperOut.on('input', (msg) => {
            received.push(msg.payload)
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeDone', function () {
            doneEvents++
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeError', function () {
            errorEvents++
            maybeFinish()
          })

          // Enqueue two reads for the same unit id. First will time out, second should succeed
          const inputs = [
            { fc: 3, unitid: 1, address: 0, quantity: 1 },
            { fc: 3, unitid: 1, address: 1, quantity: 1 }
          ]
          inputs.forEach(p => {
            modbusFlexGetter.receive({ payload: p })
          })
        })
      })
    })

    it('should not stall on invalid payloads', function (done) {
      const flow = Array.from(testFlows.testFlexGetterMemoryBehaviour)
      getPort().then((port) => {
        flow[0].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('6180c16bb1b47591')
          const modbusClient = helper.getNode('0e5e4c39a93a27cb')
          const helperOut = helper.getNode('557a9898b1d265a1')

          // Ensure readiness and valid payload acceptance (payload exists but may be invalid semantically)
          sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          sinon.stub(modbusClient, 'isInactive').returns(false)

          // Count invalid handling invocations
          const errorProtocolSpy = sinon.spy(modbusFlexGetter, 'errorProtocolMsg')
          const sendEmptyOnFailSpy = sinon.spy(mBasics, 'sendEmptyMsgOnFail')

          // Stub client read path to immediately succeed for valid requests
          sinon.stub(modbusClient, 'emit').callsFake((event, newMsg, doneCb, errCb) => {
            if (event === 'readModbus') {
              const resp = { data: [123], buffer: Buffer.alloc(2) }
              doneCb(resp, newMsg)
              return true
            }
            return false
          })

          let outputs = 0
          const safety = setTimeout(() => done(new Error('Timeout waiting for invalid payload handling and subsequent success')), 15000)

          function assertQueuesEmpty () {
            // flex-getter internal buffer must be empty
            modbusFlexGetter.bufferMessageList.size.should.be.equal(0)
            // client inflight (if used) must be empty
            if (modbusClient.inflightByUnitId) {
              modbusClient.inflightByUnitId.size.should.be.equal(0)
            }
            // client per-unit queues must be empty
            if (modbusClient.bufferCommandList && typeof modbusClient.bufferCommandList.forEach === 'function') {
              let leftover = 0
              modbusClient.bufferCommandList.forEach(arr => { leftover += arr.length })
              leftover.should.be.equal(0)
            }
          }

          function finishIfDone (expectedInvalids) {
            if (outputs === 1) {
              try {
                // We expect errorProtocolMsg and sendEmptyMsgOnFail to be called once per invalid message
                errorProtocolSpy.callCount.should.be.equal(expectedInvalids)
                sendEmptyOnFailSpy.callCount.should.be.equal(expectedInvalids)
                assertQueuesEmpty()
                clearTimeout(safety)
                done()
              } catch (e) {
                clearTimeout(safety)
                done(e)
              }
            }
          }

          helperOut.on('input', (msg) => {
            try {
              Array.isArray(msg.payload).should.be.true()
              msg.payload.length.should.be.equal(1)
              outputs++
              finishIfDone(invalids.length)
            } catch (e) {
              clearTimeout(safety)
              done(e)
            }
          })

          // Enqueue invalid payloads that should trigger validation errors, then a valid one
          const invalids = [
            { payload: { fc: 6, unitid: 1, address: 0, quantity: 1 } }, // invalid (write) fc for getter
            { payload: { fc: '5', unitid: 1, address: 0, quantity: 1 } }, // string parse -> 5, still invalid for getter
            { payload: { fc: 3, unitid: 1, address: -1, quantity: 1 } }, // invalid address
            { payload: { fc: 3, unitid: 1, address: 0, quantity: 70000 } } // invalid quantity (too large)
          ]

          const valid = { payload: { fc: 3, unitid: 1, address: 0, quantity: 1 } }

          // Send all messages synchronously; the getter should not stall on invalid ones
          invalids.forEach(m => modbusFlexGetter.receive(m))
          modbusFlexGetter.receive(valid)
        })
      })
    })

    it('FIFO ordering with multiple reads is kept', function (done) {
      const flow = Array.from(testFlows.testFlexGetterMemoryBehaviour)
      getPort().then((port) => {
        flow[0].serverPort = port
        flow[4].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('6180c16bb1b47591')
          const modbusClient = helper.getNode('0e5e4c39a93a27cb')
          const helperOut = helper.getNode('557a9898b1d265a1')

          // Ensure readiness and valid payload acceptance
          sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          sinon.stub(modbusClient, 'isInactive').returns(false)
          sinon.stub(mBasics, 'invalidPayloadIn').returns(false)

          // Stub client read to immediately succeed and echo an increment so we can assert order
          let callCount = 0
          sinon.stub(modbusClient, 'emit').callsFake((event, newMsg, doneCb, errCb) => {
            if (event === 'readModbus') {
              const idx = ++callCount
              const resp = { data: [idx], buffer: Buffer.alloc(2) }
              doneCb(resp, newMsg)
              return true
            }
            return false
          })

          const expectedOrder = [1, 2, 3]
          const received = []
          let doneEvents = 0
          let errorEvents = 0

          const safety = setTimeout(() => done(new Error('Timeout waiting for FIFO sequence')), 12000)

          function assertQueuesEmpty () {
            // flex-getter internal buffer must be empty
            modbusFlexGetter.bufferMessageList.size.should.be.equal(0)
            // client inflight (if used) must be empty
            if (modbusClient.inflightByUnitId) {
              modbusClient.inflightByUnitId.size.should.be.equal(0)
            }
            // client per-unit queues must be empty
            if (modbusClient.bufferCommandList && typeof modbusClient.bufferCommandList.forEach === 'function') {
              let leftover = 0
              modbusClient.bufferCommandList.forEach(arr => { leftover += arr.length })
              leftover.should.be.equal(0)
            }
          }

          function maybeFinish () {
            if (doneEvents === expectedOrder.length && received.length === expectedOrder.length) {
              try {
                // We expect exactly 3 messages on the first output in the same order
                received.length.should.be.equal(expectedOrder.length)
                for (let i = 0; i < expectedOrder.length; i++) {
                  Array.isArray(received[i]).should.be.true()
                  received[i][0].should.be.equal(expectedOrder[i])
                }
                errorEvents.should.be.equal(0)
                assertQueuesEmpty()
                clearTimeout(safety)
                done()
              } catch (e) {
                clearTimeout(safety)
                done(e)
              }
            }
          }

          helperOut.on('input', (msg) => {
            received.push(msg.payload)
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeDone', function () {
            doneEvents++
            maybeFinish()
          })

          modbusFlexGetter.on('modbusFlexGetterNodeError', function () {
            errorEvents++
          })

          // Enqueue three reads with different addresses (order must be preserved for same unitid)
          const addresses = [0, 1, 2]
          addresses.forEach(addr => {
            modbusFlexGetter.receive({ payload: { fc: 3, unitid: 1, address: addr, quantity: 1 } })
          })
        })
      })
    })
    it('should process modbus messages that are received from an input node and clear them from bufferMessageList when processed', function (done) {
      const flow = Array.from(testFlows.testFlexGetterMemoryBehaviour)
      getPort().then((port) => {
        flow[0].serverPort = port
        flow[4].tcpPort = port
        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('6180c16bb1b47591')
          const fn = helper.getNode('f5716808cb5500b3')
          const h1 = helper.getNode('557a9898b1d265a1')

          h1.on('input', function (msg) {
            try {
              Array.isArray(msg.payload).should.be.true()
              msg.payload.length.should.be.equal(1)
            } catch (e) {
              done(e)
            }
          })

          modbusFlexGetter.on('modbusFlexGetterNodeDone', function () {
            modbusFlexGetter.bufferMessageList.size.should.be.equal(0)
            done()
          })

          const modbusClient = helper.getNode('0e5e4c39a93a27cb')

          // Stub client I/O to avoid network dependency and ensure readiness
          sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          sinon.stub(modbusClient, 'isInactive').returns(false)
          sinon.stub(mBasics, 'invalidPayloadIn').returns(false)

          sinon.stub(modbusClient, 'emit').callsFake((event, newMsg, doneCb, errCb) => {
            if (event === 'readModbus') {
              const resp = { data: [11], buffer: Buffer.alloc(2) }
              doneCb(resp, newMsg)
            }
          })

          // Trigger once through the function node (builds the valid flex-getter payload)
          fn.receive({ payload: { trigger: true } })
        })
      })
    })

    it('should process a valid Modbus message and call the required methods', function (done) {
      const msg = { payload: 'valid' }
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
          const modbusClient = helper.getNode('92e7bf63.2efd7')

          const isNotReadyForInputStub = sinon.stub(modbusFlexGetter, 'isNotReadyForInput').returns(false)
          const isInactiveStub = sinon.stub(modbusClient, 'isInactive').returns(false)
          const invalidPayloadInStub = sinon.stub(mBasics, 'invalidPayloadIn').returns(false)

          const prepareMsgStub = sinon.stub(modbusFlexGetter, 'prepareMsg').returns({ baz: 'qux' })
          const isValidModbusMsgStub = sinon.stub(modbusFlexGetter, 'isValidModbusMsg').returns(true)
          const buildNewMessageObjectStub = sinon.stub(modbusFlexGetter, 'buildNewMessageObject').returns({ messageId: '12345' })
          const buildNewMessageStub = sinon.stub(mBasics, 'buildNewMessage').returns({ builtMessage: true })
          const emitStub = sinon.stub(modbusClient, 'emit')

          modbusFlexGetter.emit('input', msg)

          sinon.assert.calledOnce(prepareMsgStub)
          sinon.assert.calledOnce(isValidModbusMsgStub)
          sinon.assert.calledOnce(buildNewMessageObjectStub)
          sinon.assert.calledOnce(buildNewMessageStub)
          sinon.assert.calledOnce(emitStub)

          isNotReadyForInputStub.restore()
          isInactiveStub.restore()
          invalidPayloadInStub.restore()
          prepareMsgStub.restore()
          isValidModbusMsgStub.restore()
          buildNewMessageObjectStub.restore()
          buildNewMessageStub.restore()
          emitStub.restore()
          done()
        })
      })
    })
  })

  describe('Modbus Node Input Handler', function () {
    it('should handle onModbusReadDone correctly', function (done) {
      const msg = { payload: 'valid' }
      const resp = { data: 'response data' }
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')

          const setNodeStatusToStub = sinon.stub(mBasics, 'setNodeStatusTo')
          const buildMessageWithIOStub = sinon.stub(mbIOCore, 'buildMessageWithIO').returns({ payload: 'built message' })
          const sendStub = sinon.stub(modbusFlexGetter, 'send')
          const emitStub = sinon.stub(modbusFlexGetter, 'emit')

          modbusFlexGetter.showStatusActivities = true

          modbusFlexGetter.onModbusReadDone(resp, msg)

          sinon.assert.calledOnce(setNodeStatusToStub)
          sinon.assert.calledWith(setNodeStatusToStub, 'reading done', modbusFlexGetter)

          sinon.assert.calledOnce(buildMessageWithIOStub)
          sinon.assert.calledWith(buildMessageWithIOStub, modbusFlexGetter, resp.data, resp, msg)

          sinon.assert.calledOnce(sendStub)
          sinon.assert.calledWith(sendStub, { payload: 'built message' })

          sinon.assert.calledOnce(emitStub)
          sinon.assert.calledWith(emitStub, 'modbusFlexGetterNodeDone')

          setNodeStatusToStub.restore()
          buildMessageWithIOStub.restore()
          sendStub.restore()
          emitStub.restore()
          done()
        })
      })
    })
  })
  describe('Modbus Node Error Handling', function () {
    it('should handle onModbusReadError correctly', function (done) {
      const msg = { payload: 'valid' }
      const err = new Error('Test error')
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
          const modbusClient = helper.getNode('92e7bf63.2efd7')

          const internalDebugLogStub = sinon.stub(modbusFlexGetter, 'internalDebugLog')
          const errorProtocolMsgStub = sinon.stub(modbusFlexGetter, 'errorProtocolMsg')
          const sendEmptyMsgOnFailStub = sinon.stub(mBasics, 'sendEmptyMsgOnFail')
          const setModbusErrorStub = sinon.stub(mBasics, 'setModbusError')
          const emitStub = sinon.stub(modbusFlexGetter, 'emit')

          modbusFlexGetter.onModbusReadError(err, msg)

          sinon.assert.calledOnce(internalDebugLogStub)
          sinon.assert.calledWith(internalDebugLogStub, err.message)

          sinon.assert.calledOnce(errorProtocolMsgStub)
          sinon.assert.calledWith(errorProtocolMsgStub, err, sinon.match(msg))

          sinon.assert.calledOnce(sendEmptyMsgOnFailStub)
          sinon.assert.calledWith(sendEmptyMsgOnFailStub, modbusFlexGetter, err, sinon.match(msg))

          sinon.assert.calledOnce(setModbusErrorStub)
          sinon.assert.calledWith(setModbusErrorStub, modbusFlexGetter, modbusClient, err, sinon.match(msg))

          sinon.assert.calledOnce(emitStub)
          sinon.assert.calledWith(emitStub, 'modbusFlexGetterNodeError')

          internalDebugLogStub.restore()
          errorProtocolMsgStub.restore()
          sendEmptyMsgOnFailStub.restore()
          setModbusErrorStub.restore()
          emitStub.restore()
          done()
        })
      })
    })
  })
  describe('Modbus Node Input Delay Timer', function () {
    it('should initialize and trigger input delay timer', function (done) {
      const flow = Array.from(testFlows.testNodeShouldBeLoadedFlow)

      getPort().then((port) => {
        flow[2].serverPort = port
        flow[3].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          const modbusFlexGetter = helper.getNode('bc5a61b6.a3972')
          const verboseWarnStub = sinon.stub()
          modbusFlexGetter.verboseWarn = verboseWarnStub

          modbusFlexGetter.delayOnStart = true
          modbusFlexGetter.INPUT_TIMEOUT_MILLISECONDS = 1000
          modbusFlexGetter.startDelayTime = 1

          const resetInputDelayTimerSpy = sinon.spy(modbusFlexGetter, 'resetInputDelayTimer')

          const setTimeoutStub = sinon.stub(global, 'setTimeout').callsFake((callback, delay) => {
            callback()
          })

          modbusFlexGetter.initializeInputDelayTimer()
          sinon.assert.calledOnce(resetInputDelayTimerSpy)
          sinon.assert.calledOnce(setTimeoutStub)
          sinon.assert.calledWith(setTimeoutStub, sinon.match.func, modbusFlexGetter.INPUT_TIMEOUT_MILLISECONDS * modbusFlexGetter.startDelayTime)

          setTimeoutStub.restore()
          resetInputDelayTimerSpy.restore()
          done()
        })
      })
    })
  })

  describe('ModbusFlexGetter', () => {
    it('should send requests sequentially and not get stuck in a queueing state', (done) => {
      const flow = Array.from(testFlows.testFlexGetterRequest)

      getPort().then((port) => {
        flow[5].serverPort = port
        flow[6].tcpPort = port

        helper.load(testFlexGetterNodes, flow, function () {
          let count = 0
          const modbusFlexGetter = helper.getNode('22809a5a7e0bac07')

          const msg = [
            { payload: { fc: 4, unitid: 1, address: 0, quantity: 1 } }, // timeout
            { payload: { fc: 3, unitid: 1, address: 20, quantity: 2 } },
            { payload: { fc: 3, unitid: 1, address: 10, quantity: 2 } }
          ]

          setTimeout(() => {
            const onComplete = () => {
              count++
              if (count === msg.length) {
                done()
              }
            }
            modbusFlexGetter.on('modbusFlexGetterNodeDone', onComplete)
            modbusFlexGetter.on('modbusFlexGetterNodeError', onComplete)

            msg.forEach((m) => {
              modbusFlexGetter.receive(m)
            })
          }, 1200)
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testFlexGetterNodes, [], function () {
        helper.request().post('/modbus-flex-getter/invalid').expect(404).end(done)
      })
    })
  })
})
