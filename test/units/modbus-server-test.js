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
const serverNode = require('../../src/modbus-server.js')
const testServerNodes = [injectNode, serverNode]
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-server-flows.js')

describe('Server node Testing', function () {
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
    it('should send message when valid message and output not disabled', function (done) {
      helper.load(testServerNodes, testFlows.testServerConfig, function () {
        const modbusServer = helper.getNode('249922d5ac72b8cd')
        const sendMessageSpy = sinon.spy(modbusServer, 'send')

        const msg = {
          payload: {}
        }

        modbusServer.emit('input', msg)

        sinon.assert.calledOnce(sendMessageSpy)
        done()
      })
    })

    it('should initialize node with correct configurations', function (done) {
      helper.load(testServerNodes, testFlows.testServerConfig, function () {
        const modbusServer = helper.getNode('249922d5ac72b8cd')
        expect(modbusServer.name).to.equal('Test Modbus Server')
        expect(modbusServer.logEnabled).to.equal(true)
        expect(modbusServer.hostname).to.equal('127.0.0.1')
        expect(modbusServer.serverPort).to.equal(5509)
        expect(modbusServer.responseDelay).to.equal(100)
        expect(modbusServer.delayUnit).to.equal('ms')
        expect(modbusServer.showStatusActivities).to.equal(true)
        expect(modbusServer.coilsBufferSize).to.equal(80000)
        expect(modbusServer.holdingBufferSize).to.equal(80000)
        expect(modbusServer.inputBufferSize).to.equal(80000)
        expect(modbusServer.discreteBufferSize).to.equal(80000)
        expect(modbusServer.showErrors).to.equal(true)
        expect(modbusServer.internalDebugLog).to.be.a('function')
        expect(modbusServer.netServer).to.be.an('object')
        expect(modbusServer.modbusServer).to.be.an('object')

        done()
      })
    })
    it('should set node status to active on client connection', function () {
      helper.load(testServerNodes, testFlows.testServerConfig, function () {
        const modbusServer = helper.getNode('249922d5ac72b8cd')
        modbusServer.modbusServer.emit('connection', { socket: { address: () => '127.0.0.1', remoteAddress: '192.168.1.100', remotePort: 1234 } })

        sinon.assert.calledWith(modbusServer.status, { fill: 'yellow', shape: 'dot', text: 'initialized' })
      })
    })
    it('should set responseDelay, delayUnit, showStatusActivities, and coilsBufferSize correctly', function (done) {
      helper.load(testServerNodes, testFlows.testServerConfig, function () {
        const modbusServer = helper.getNode('249922d5ac72b8cd')
        expect(modbusServer.responseDelay).to.equal(100)
        expect(modbusServer.delayUnit).to.equal('ms')
        modbusServer.showStatusActivities.should.be.true()
        modbusServer.showErrors.should.be.true()
        expect(modbusServer.coilsBufferSize).to.equal(80000)
        expect(modbusServer.holdingBufferSize).to.equal(80000)
        expect(modbusServer.discreteBufferSize).to.equal(80000)
        done()
      })
    })

    it('should handle errors during server initialization', function (done) {
      helper.load(testServerNodes, testFlows.testSimpleNodeToLogError, function () {
        const modbusServer = helper.getNode('178284ea.5055ab')
        let errorMessage = ''
        modbusServer.error = function (msg) {
          errorMessage = msg
        }
        modbusServer.netServer.emit('error', (err) => {
          console.error(`Server error: ${err.message}`, errorMessage)
        })
        done()
      })
    })

    it('should log an error message when showErrors is true and the message is invalid', function (done) {
      helper.load(testServerNodes, testFlows.testSimpleNodeToLogError, function () {
        const modbusServer = helper.getNode('178284ea.5055ab')
        const msg = {
          payload: 'invalid message'
        }
        modbusServer.showErrors = true

        let errorMessage = ''
        modbusServer.error = function (msg) {
          errorMessage = msg
        }

        modbusServer.emit('input', msg)
        expect(errorMessage).to.equal('Is Not A Valid Memory Write Message To Server')
        done()
      })
    })

    it('should handle errors during server initialization', function (done) {
      helper.load(testServerNodes, testFlows.testSimpleNodeShouldBeLoadedFlow, function () {
        const modbusServer = helper.getNode('178284ea.5055ab')
        const msg = {
          payload: {
            register: 'coils',
            address: 0
          },
          bufferData: Buffer.from([1, 2]),
          bufferAddress: 0
        }

        let msgOutput = ''
        modbusServer.send = function (msg) {
          msgOutput = msg
        }

        modbusServer.emit('input', msg)

        expect(msgOutput).to.deep.equal([
          { type: 'holding', message: msg, payload: modbusServer.modbusServer.holding },
          { type: 'coils', message: msg, payload: modbusServer.modbusServer.coils },
          { type: 'input', message: msg, payload: modbusServer.modbusServer.input },
          { type: 'discrete', message: msg, payload: modbusServer.modbusServer.discrete },
          { payload: 'request', type: 'message', message: msg }
        ])
        done()
      })
    })
    it('simple Node should be loaded', function (done) {
      helper.load(testServerNodes, testFlows.testSimpleNodeShouldBeLoadedFlow, function () {
        const modbusServer = helper.getNode('178284ea.5055ab')
        modbusServer.should.have.property('name', 'modbusServer')

        done()
      })
    })

    it('simple Node with wrong IP should be loaded', function (done) {
      helper.load(testServerNodes, testFlows.testSimpleNodeWithWrongIPShouldBeLoadedFlow, function () {
        const modbusServer = helper.getNode('178284ea.5055ab')
        modbusServer.should.have.property('name', 'modbusServer')

        done()
      })
    })

    it('should send data on input', function (done) {
      helper.load(testServerNodes, testFlows.testShouldSendDataOnInputFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function () {
          done()
        })
      })
    })

    it('should handle errors during server initialization', function (done) {
      helper.load(testServerNodes, testFlows.testSimpleNodeShouldThrowErrorFlow, function () {
        const modbusServer = helper.getNode('178284ea.5055ab')
        expect(modbusServer.statusText).to.equal('error')
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testServerNodes, testFlows.testShouldSendDataOnInputFlow, function () {
        helper.request().post('/modbus-server/invalid').expect(404).end(done)
      })
    })
  })
})
