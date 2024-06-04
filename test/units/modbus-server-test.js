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
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node with wrong IP should be loaded', function (done) {
      helper.load(testServerNodes, testFlows.testSimpleNodeWithWrongIPShouldBeLoadedFlow, function () {
        const modbusServer = helper.getNode('178284ea.5055ab')
        modbusServer.should.have.property('name', 'modbusServer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('should send data on input', function (done) {
      helper.load(testServerNodes, testFlows.testShouldSendDataOnInputFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function () {
          done()
        })
      }, function () {
        helper.log('function callback')
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
