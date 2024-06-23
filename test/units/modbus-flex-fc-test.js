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

const nodeUnderTest = require('../../src/modbus-flex-fc.js')
const clientNode = require('../../src/modbus-client.js')
const readNode = require('../../src/modbus-read.js')
const serverNode = require('../../src/modbus-server.js')
const functionNode = require('@node-red/nodes/core/function/10-function')

const testFlexFcNodes = [nodeUnderTest, clientNode, readNode, serverNode, functionNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'), {
  RED: { settings: { verbose: true } }
})

const testFlows = require('./flows/modbus-flex-fc-flows')

describe('modbus flex fc unit test', function () {
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

  it('should load read_discrete_inputs', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadDiscreteInputs, function () {
      const modbusFlexFc = helper.getNode('91a3b0e2bf45f30f')
      modbusFlexFc.should.have.property('name', 'read_discrete_inputs')
      modbusFlexFc.should.have.property('type', 'modbus-flex-fc')
      done()
    }, function () {
      helper.log('function callback')
    })
  })

  it('should be in waiting state if it cannot connect', function (done) {
    helper.load(testFlexFcNodes, testFlows.testFlexClientWithoutConnection, function () {
      const modbusClientNode = helper.getNode('87bd51afcaba0962')
      const isReady = modbusClientNode.statusText
      isReady.should.be.equal('waiting ...')
      done()
    }, function () {
      helper.log('function callback')
    })
  })

  it('a node should be able to figure out its state!', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')
      node.isNotReadyForInput().should.be.equal(true)
      done()
    }, function () {
      helper.log('function callback')
    })
  })

  it('a flex-fc-node should be able to send a message to the next node in the chain', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('29dc12925bb8e2d4')
      node.on('input', function (msg) {
        msg.should.have.property('topic', 'customFc')
      })

      done()
    }, function () {
      helper.log('function callback')
    })
  })

  it('a flex-fc-node should be able to receive a invalid payload', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')

      // Catch the message that was put out by stubbing the node.warn method...
      node.environmentVerbosity = true
      let mockVerboseWarnMessage = ''
      node.warn = function (message) { mockVerboseWarnMessage = message }

      node.isReadyForInput = function readForInputMock () { return true }
      node.receive({})
      mockVerboseWarnMessage.should.equal('Read -> Invalid message on input. address: undefined')
      done()
    })
  })

  it('a flex-fc-node that receives a valid message, should reject the input as it is not ready for input yet', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')
      node.environmentVerbosity = true
      // Catch the message that was put out by stubbing the node.warn method...
      let mockVerboseWarnMessage = ''
      node.warn = function (message) { mockVerboseWarnMessage = message }
      node.receive({
        topic: 'customFc',
        payload: { unitid: 0x01, fc: 0x01, requestCard: [0x00], responseCard: [0x00] }
      })

      mockVerboseWarnMessage.should.equal('Read -> Inject while node is not ready for input. address: undefined')
      done()
    })
  })

  it('a flex-fc-node that receives a valid message and is ready for input, will still reject the input when its inactive!', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')
      node.environmentVerbosity = true
      let mockVerboseWarnMessage = ''
      node.warn = function (message) { mockVerboseWarnMessage = message }
      node.isNotReadyForInput = function () { return false }
      node.receive({
        topic: 'customFc',
        payload: { unitid: 0x01, fc: 0x01, requestCard: [0x00], responseCard: [0x00] }
      })

      mockVerboseWarnMessage.should.equal('Read -> You sent an input to inactive client. Please use initial delay on start or send data more slowly. address: undefined')
      done()
    })
  })

  it('a flex-fc-node which is ready and active whom received a well formed message will try to communicate with the server', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')
      const client = helper.getNode('5c2b693859e05456')

      node.environmentVerbosity = true
      // let mockVerboseWarnMessage = ''
      // node.warn = function (message) { mockVerboseWarnMessage = message }

      node.isNotReadyForInput = function () { return false }
      node.isInactive = function () { return false }

      node.onModbusReadDone = function () { } // TODO: Stub this out!
      node.onModbusReadError = function () { } // TODO: Stub this one as well!

      client.isInactive = function () { return false }

      node.receive({
        topic: 'customFc',
        payload: { unitid: 0x01, fc: 0x01, requestCard: [0x00], responseCard: [0x00] }
      })
      done()
    })
  })

  it('a flex-fc-node which calls onModbusRegistered should set the state of the node to Registered', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')

      node.showStatusActivities = true
      node.onModbusRegister()
      const newStatus = node.statusText

      newStatus.should.be.equal('registered')
      done()
    })
  })

  it('a flex-fc-node which calls onModbusInit should set the state of the node to initialized', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')

      node.showStatusActivities = true
      node.onModbusInit()
      const newStatus = node.statusText

      newStatus.should.be.equal('initialized')
      done()
    })
  })

  it('a flex-fc-node which calls onModbusActive should set the state of the node to active', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')

      node.showStatusActivities = true
      node.onModbusActive()
      const newStatus = node.statusText

      newStatus.should.be.equal('active')
      done()
    })
  })

  it('a flex-fc-node which calls onModbusQueue should set the state of the node to queue', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')

      node.showStatusActivities = true
      node.onModbusQueue()
      const newStatus = node.statusText

      newStatus.should.be.equal('queue')
      done()
    })
  })

  it('a flex-fc-node which calls onModbusError should set the state of the node to failure', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')

      node.showStatusActivities = true
      node.onModbusError()
      const newStatus = node.statusText

      newStatus.should.be.equal('failure')
      done()
    })
  })

  it('a flex-fc-node with the showErrors property set to true, which calls onModbusError should set the state of the node to failure and log the given failure message with warn', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')

      node.showStatusActivities = false
      node.showErrors = true
      let mockMessage = ''
      node.warn = function (message) { mockMessage = message }
      node.onModbusError('Test Error Message')
      const newStatus = node.statusText

      newStatus.should.be.equal('failure')
      mockMessage.should.be.equal('Test Error Message')
      done()
    })
  })

  it('a flex-fc-node with the showErrors property set to false, which calls onModbusError should set the state of the node to failure and not log the given error message', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')

      node.showErrors = false
      let mockMessage = ''
      node.warn = function (message) { mockMessage = message }
      node.onModbusError('Test Error Message')
      const newStatus = node.statusText

      newStatus.should.be.equal('failure')
      mockMessage.should.be.equal('')
      done()
    })
  })

  it('a flex-fc-node which calls onModbusBroken should set the state of the node to broken', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')

      node.showStatusActivities = true
      node.onModbusBroken()
      const newStatus = node.statusText

      newStatus.should.be.equal('broken')
      done()
    })
  })

  it('a flex-fc-node should if the showStatusActivities property is set and onModbusReadDone is called set the statusText to "reading done"', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')

      node.showStatusActivities = true
      node.onModbusReadDone({}, {
        payload: {
          unitid: 0x01,
          fc: 0x01,
          requestCard: [],
          responseCard: [0x00]
        }
      })
      const newStatus = node.statusText

      newStatus.should.be.equal('reading done')

      node.showStatusActivities = false
      node.onModbusReadDone({}, {
        payload: {
          unitid: 0x01,
          fc: 0x01,
          requestCard: [],
          responseCard: [0x00]
        }
      })

      newStatus.should.be.equal('reading done')

      done()
    })
  })

  it('should remove all listeners from the node on removeNodeListenerFromModbusClient', function (done) {
    helper.load(testFlexFcNodes, testFlows.testReadCoilMode, function () {
      const node = helper.getNode('d975b1203f71a3b5')
      // We cannot test this! only see if it runs without throwing any error!
      node.removeNodeListenerFromModbusClient()
      done()
    })
  })

  // Still needs testing:
  //  - builNewMessageObject()
  //  - isValidCustomFC()
  //  - modbusRead()
})
