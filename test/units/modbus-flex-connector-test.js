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

const nodeUnderTest = require('../../src/modbus-flex-connector.js')
const serverNode = require('../../src/modbus-server.js')
const nodeClient = require('../../src/modbus-client.js')
const injectNode = require('@node-red/nodes/core/common/20-inject.js')

const testFlexConnectorNodes = [nodeUnderTest, serverNode, nodeClient, injectNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-flex-connector-flows')
const mBasics = require('../../src/modbus-basics')
const _ = require('underscore')
const expect = require('chai').expect

describe('Flex Connector node Unit Testing', function () {
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
    it('should process messages through the flow', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testForNodeStatus, function () {
        const flexConnector = helper.getNode('759c96f52b0d1a25')
        const msg = {
          payload: {
            connectorType: 'TCP',
            tcpHost: '127.0.0.1',
            tcpPort: '10512',
            nodeStatus: {
              fill: 'green',
              shape: 'ring',
              text: 'connected'
            }
          }
        }
        let setStatus = {}

        flexConnector.status = function (status) {
          setStatus = status
        }
        setTimeout(function () {
          flexConnector.emit('input', msg)
          expect(setStatus).to.deep.equal({ fill: 'green', shape: 'ring', text: 'connected' })
          done()
        }, 1500)
      })
    })
    it('should be loaded', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusNode = helper.getNode('40ddaabb.fd44d4')
        modbusNode.should.have.property('name', 'FlexConnector')
        modbusNode.should.have.property('emptyQueue', true)
        done()
      })
    })

    // it('should change the TCP-Port of the client from 7522 to 8522', function (done) {
    //   helper.load(testFlexConnectorNodes, testFlows.testShouldChangeTcpPortFlow, function () {
    //     const modbusNode = helper.getNode('40ddaabb.fd44d4')
    //     const clientNode = helper.getNode('2a253153.fae3ce')
    //     modbusNode.should.have.property('name', 'FlexConnector')
    //     modbusNode.should.have.property('emptyQueue', true)
    //     setTimeout(function () {
    //       modbusNode.receive({ payload: { connectorType: 'TCP', tcpHost: '127.0.0.1', tcpPort: 8522 } })
    //     }, 1000)
    //     clientNode.on('mbconnected', () => {
    //       if (clientNode && clientNode.tcpPort === 8522) {
    //         done()
    //       }
    //     })
    //   })
    // })

    // it('should change the Serial-Port of the client from /dev/ttyUSB to /dev/ttyUSB0', function (done) {
    //   helper.load(testFlexConnectorNodes, testFlows.testShouldChangeSerialPortFlow, function () {
    //     const modbusNode = helper.getNode('40ddaabb.fd44d4')
    //     const clientNode = helper.getNode('2a253153.fae3ef')
    //     modbusNode.should.have.property('name', 'FlexConnector')
    //     modbusNode.should.have.property('emptyQueue', true)
    //     setTimeout(function () {
    //       modbusNode.receive({
    //         payload: {
    //           connectorType: 'SERIAL',
    //           serialPort: '/dev/ttyUSB0',
    //           serialBaudrate: '9600'
    //         }
    //       })
    //     }, 1000)
    //     clientNode.on('mbinit', () => {
    //       if (clientNode && clientNode.serialBaudrate === 9600 && clientNode.serialPort === '/dev/ttyUSB0') {
    //         done()
    //       }
    //     })
    //   })
    // })

    it('should be inactive if message not allowed', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusClientNode = helper.getNode('2a253153.fae3ce')
        _.isUndefined(modbusClientNode).should.be.false()

        modbusClientNode.receive({ payload: 'test' })
        const isInactive = modbusClientNode.isInactive()
        isInactive.should.be.true()
        done()
      })
    })

    it('should be inactive if message empty', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusClientNode = helper.getNode('2a253153.fae3ce')
        setTimeout(() => {
          modbusClientNode.messageAllowedStates = ['']
          const isInactive = modbusClientNode.isInactive()
          isInactive.should.be.true()
          done()
        }, 1500)
      })
    })

    // it('should be state queueing - ready to send', function (done) {
    //   helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
    //     const modbusClientNode = helper.getNode('2a253153.fae3ce')
    //     setTimeout(() => {
    //       mBasics.setNodeStatusTo('queueing', modbusClientNode)
    //       const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
    //       isReady.should.be.true()
    //       done()
    //     }, 1500)
    //   })
    // })

    it('should be not state queueing - not ready to send', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusClientNode = helper.getNode('2a253153.fae3ce')
        setTimeout(() => {
          mBasics.setNodeStatusTo('stopped', modbusClientNode)
          const isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false()
          done()
        }, 1500)
      })
    })

    // it('should process the flow as expected', function (done) {
    //   helper.load(testFlexConnectorNodes, testFlows.testFlowAsExpected, function () {
    //     const flexNode = helper.getNode('1b4644a214cfdec6')
    //     expect(flexNode).to.be.any()
    //     done()
    //   })
    // })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testFlexConnectorNodes, [], function () {
        helper.request().post('/modbus-flex-connector/invalid').expect(404).end(done)
      })
    })
  })
})
