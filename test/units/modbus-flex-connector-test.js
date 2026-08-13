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
const {
  getPort,
  releasePort,
  waitForModbusServerListening,
  waitForModbusClientActive,
  onceDone
} = require('../helper/test-helper-extensions')

const CI_TEST_TIMEOUT_MS = process.env.CI ? 30000 : 15000
const CLIENT_ACTIVE_WAIT_MS = process.env.CI ? 20000 : 8000
const SERVER_LISTEN_WAIT_MS = process.env.CI ? 10000 : 5000
const SETTINGS_WAIT_MS = process.env.CI ? 5000 : 2000

let flowSeq = 0

/** Deep-clone flow and uniquify ids (avoids collisions under full-suite / nyc coverage). */
function prepareFlow (flowTemplate) {
  const flow = JSON.parse(JSON.stringify(flowTemplate))
  const suffix = '-' + Date.now().toString(36) + '-' + (++flowSeq)
  const idMap = {}

  for (const node of flow) {
    if (!node || !node.id) continue
    idMap[node.id] = node.id + suffix
  }
  for (const node of flow) {
    if (!node) continue
    if (node.id && idMap[node.id]) node.id = idMap[node.id]
    if (node.z && idMap[node.z]) node.z = idMap[node.z]
    if (node.server && idMap[node.server]) node.server = idMap[node.server]
    if (Array.isArray(node.wires)) {
      node.wires = node.wires.map(function (wires) {
        return (wires || []).map(function (id) { return idMap[id] || id })
      })
    }
  }
  return { flow, idMap }
}

function mappedId (idMap, originalId) {
  return idMap[originalId] || originalId
}

function waitUntil (predicate, maxWaitMs, callback) {
  const deadline = Date.now() + maxWaitMs
  const poll = function () {
    let ok = false
    try { ok = !!predicate() } catch (e) { ok = false }
    if (ok) return callback()
    if (Date.now() >= deadline) {
      return callback(new Error('condition not met within ' + maxWaitMs + 'ms'))
    }
    setTimeout(poll, 25)
  }
  poll()
}

function kickClientReconnectIfStuck (clientNode) {
  const st = clientNode && clientNode.actualServiceState && clientNode.actualServiceState.value
  // SWITCH is ignored in reconnecting/broken — kick INIT so new settings are used
  if (st === 'reconnecting' || st === 'broken' || st === 'failed') {
    clientNode.stateService.send('INIT')
  }
}

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
      this.timeout(CI_TEST_TIMEOUT_MS)
      const finish = onceDone(done)
      const prepared = prepareFlow(testFlows.testShouldChangeTcpPortFlow)
      const flow = prepared.flow
      const idMap = prepared.idMap
      let allocatedPort

      getPort().then((port) => {
        allocatedPort = port
        const serverCfg = flow.find(function (n) { return n.type === 'modbus-server' })
        const clientCfg = flow.find(function (n) { return n.type === 'modbus-client' })
        serverCfg.serverPort = port
        // Client starts on a wrong port until Flex-Connector switches it.
        clientCfg.tcpPort = 7522

        helper.load(testFlexConnectorNodes, flow, function () {
          const modbusNode = helper.getNode(mappedId(idMap, '40ddaabb.fd44d4'))
          const clientNode = helper.getNode(mappedId(idMap, '2a253153.fae3ce'))
          const serverNode = helper.getNode(mappedId(idMap, '445454e4.968564'))
          modbusNode.should.have.property('name', 'FlexConnector')
          modbusNode.should.have.property('emptyQueue', true)
          modbusNode.server.should.equal(clientNode)

          waitForModbusServerListening(serverNode, function (listenErr) {
            if (listenErr) {
              if (allocatedPort) releasePort(allocatedPort)
              return finish(listenErr)
            }

            modbusNode.receive({
              payload: {
                connectorType: 'TCP',
                tcpHost: '127.0.0.1',
                tcpPort: port
              }
            })

            waitUntil(function () {
              return Number(clientNode.tcpPort) === Number(port)
            }, SETTINGS_WAIT_MS, function (settingsErr) {
              if (settingsErr) {
                if (allocatedPort) releasePort(allocatedPort)
                return finish(new Error(
                  'Flex-Connector did not apply tcpPort via dynamicReconnect: ' + settingsErr.message +
                  ' (tcpPort=' + clientNode.tcpPort + ', expected=' + port + ')'
                ))
              }

              kickClientReconnectIfStuck(clientNode)

              waitForModbusClientActive(clientNode, function (activeErr) {
                if (allocatedPort) releasePort(allocatedPort)
                if (activeErr) return finish(activeErr)
                Number(clientNode.tcpPort).should.equal(Number(port))
                finish()
              }, CLIENT_ACTIVE_WAIT_MS)
            })
          }, SERVER_LISTEN_WAIT_MS)
        })
      }).catch(finish)
    })

    it('should change the Serial-Port of the client from /dev/ttyUSB to /dev/ttyUSB0', function (done) {
      this.timeout(CI_TEST_TIMEOUT_MS)
      const finish = onceDone(done)
      const prepared = prepareFlow(testFlows.testShouldChangeSerialPortFlow)
      const flow = prepared.flow
      const idMap = prepared.idMap

      helper.load(testFlexConnectorNodes, flow, function () {
        const modbusNode = helper.getNode(mappedId(idMap, '40ddaabb.fd44d4'))
        const clientNode = helper.getNode(mappedId(idMap, '2a253153.fae3ef'))
        modbusNode.should.have.property('name', 'FlexConnector')
        modbusNode.should.have.property('emptyQueue', true)
        modbusNode.server.should.equal(clientNode)

        // No real serial device in CI — assert connector applies settings.
        modbusNode.receive({
          payload: {
            connectorType: 'SERIAL',
            serialPort: '/dev/ttyUSB0',
            serialBaudrate: '9600'
          }
        })

        waitUntil(function () {
          return clientNode.serialPort === '/dev/ttyUSB0' && Number(clientNode.serialBaudrate) === 9600
        }, SETTINGS_WAIT_MS, function (err) {
          if (err) {
            return finish(new Error(
              'Flex-Connector did not apply serial settings: ' + err.message +
              ' (serialPort=' + clientNode.serialPort + ', baud=' + clientNode.serialBaudrate + ')'
            ))
          }
          finish()
        })
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
          // 5.60.2 status UX: "retrying after N msec. (attempt k)"
          modbusNode.statusText.should.containEql('retrying')
          done()
        }, 800)
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusClientNode = helper.getNode('2a253153.fae3ce')
        setTimeout(() => {
          modbusClientNode.stateService.send('STOP')
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
