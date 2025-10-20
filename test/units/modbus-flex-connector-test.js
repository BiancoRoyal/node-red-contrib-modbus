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
const { getPort } = require('../helper/test-helper-extensions')

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
    it('should be loaded', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusNode = helper.getNode('40ddaabb.fd44d4')
        modbusNode.should.have.property('name', 'FlexConnector')
        modbusNode.should.have.property('emptyQueue', true)
        done()
      })
    })

    it('should change the TCP-Port of the client from 7522 to 8522', function (done) {
      this.timeout(10000)
      const flow = Array.from(testFlows.testShouldChangeTcpPortFlow)

      getPort().then((port) => {
        flow[0].serverPort = port

        helper.load(testFlexConnectorNodes, flow, function () {
          const modbusNode = helper.getNode('e247cb84c00c63e7')
          // const clientNode = helper.getNode('dee7f1dcdf42f390')
          modbusNode.should.have.property('name', 'FlexConnector')
          modbusNode.should.have.property('emptyQueue', true)

          let doneOnce = false

          const originalOnConfigDone = modbusNode.onConfigDone
          const originalOnConfigError = modbusNode.onConfigError

          modbusNode.onConfigDone = function (msg) {
            try {
              if (originalOnConfigDone) originalOnConfigDone.call(modbusNode, msg)
              if (!doneOnce) {
                // Prove config was accepted without relying on internal timing
                if (modbusNode.configMsgOnChange) {
                  msg.should.have.property('payload')
                  msg.payload.should.have.property('status', 'changed')
                } else {
                  msg.should.have.property('config_change', 'emitted')
                }
                doneOnce = true
                done()
              }
            } catch (e) {
              done(e)
            }
          }

          modbusNode.onConfigError = function (err, msg) {
            done(err || new Error('onConfigError called'))
            if (originalOnConfigError) originalOnConfigError.call(modbusNode, err, msg)
          }

          setTimeout(function () {
            modbusNode.receive({ payload: { connectorType: 'TCP', tcpHost: '127.0.0.1', tcpPort: port } })
          }, 100)
        })
      })
    })

    it('should change the Serial-Port of the client from /dev/ttyUSB to /dev/ttyUSB0', function (done) {
      this.timeout(10000)
      helper.load(testFlexConnectorNodes, testFlows.testShouldChangeSerialPortFlow, function () {
        const modbusNode = helper.getNode('40ddaabb.fd44d4')
        // const clientNode = helper.getNode('2a253153.fae3ef')
        modbusNode.should.have.property('name', 'FlexConnector')
        modbusNode.should.have.property('emptyQueue', true)

        let doneOnce = false
        const originalOnConfigDone = modbusNode.onConfigDone
        const originalOnConfigError = modbusNode.onConfigError

        modbusNode.onConfigDone = function (msg) {
          try {
            if (originalOnConfigDone) originalOnConfigDone.call(modbusNode, msg)
            if (!doneOnce) {
              // Prove config was accepted without relying on internal timing
              if (modbusNode.configMsgOnChange) {
                msg.should.have.property('payload')
                msg.payload.should.have.property('status', 'changed')
              } else {
                msg.should.have.property('config_change', 'emitted')
              }
              doneOnce = true
              done()
            }
          } catch (e) {
            done(e)
          }
        }

        modbusNode.onConfigError = function (err, msg) {
          done(err || new Error('onConfigError called'))
          if (originalOnConfigError) originalOnConfigError.call(modbusNode, err, msg)
        }

        setTimeout(function () {
          modbusNode.receive({
            payload: {
              connectorType: 'SERIAL',
              serialPort: '/dev/ttyUSB0',
              serialBaudrate: '9600'
            }
          })
        }, 50)
      })
    })

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

    it('should be state reconnecting - not ready to send', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusNode = helper.getNode('40ddaabb.fd44d4')
        setTimeout(() => {
          modbusNode.statusText.should.containEql('reconnecting')
          done()
        }, 800)
      })
    })

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

    it('should process the flow as expected', function (done) {
      const flow = Array.from(testFlows.testFlowAsExpected)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[8].tcpPort = port

        helper.load(testFlexConnectorNodes, flow, function () {
          const flexNode = helper.getNode('1b4644a214cfdec6')
          if (flexNode) {
            flexNode.onConfigError(new Error('Test Error'), { payload: {} })
            done()
          }
        })
      })
    })

    it('should process the flow as expected with config msg', function (done) {
      const flow = Array.from(testFlows.testFlowAsExpectedWithConfigMessage)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[8].tcpPort = port

        helper.load(testFlexConnectorNodes, testFlows.testFlowAsExpectedWithConfigMessage, function () {
          const flexNode = helper.getNode('bf2ba5ae45aefab1')
          if (flexNode) {
            flexNode.onConfigError(new Error('Test Error'), { payload: {} })
            done()
          }
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testFlexConnectorNodes, [], function () {
        helper.request().post('/modbus-flex-connector/invalid').expect(404).end(done)
      })
    })
  })
})
