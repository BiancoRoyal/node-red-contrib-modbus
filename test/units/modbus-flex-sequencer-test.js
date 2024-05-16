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
const nodeUnderTest = require('../../src/modbus-flex-sequencer.js')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlexSequencerNodes = [injectNode, clientNode, serverNode, nodeUnderTest]

const testFlows = require('./flows/modbus-flex-sequencer-flows')
const mBasics = require('../../src/modbus-basics')
const _ = require('underscore')

describe('Flex Sequencer node Testing', function () {
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
    it('simple Node should be loaded without client config', function (done) {
      helper.load(testFlexSequencerNodes,testFlows.testNodeWithoutClientFlow , function () {
        const modbusFlexSequencer = helper.getNode('bc5a61b6.a3972')
        modbusFlexSequencer.should.have.property('name', 'modbusFlexSequencer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node with server should be loaded', function (done) {
      helper.load(testFlexSequencerNodes,testFlows.testNodeWithServerFlow , function () {
        const modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('92e7bf63.2efd7')
        modbusClient.should.have.property('name', 'ModbusServer')

        const modbusFlexSequencer = helper.getNode('bc5a61b6.a3972')
        modbusFlexSequencer.should.have.property('name', 'modbusFlexSequencer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('should be inactive if message not allowed', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        _.isUndefined(modbusClientNode).should.be.false

        modbusClientNode.receive({payload: "test"})
        let isInactive = modbusClientNode.isInactive()
        isInactive.should.be.true
        done()
      })
    })

    it('should be inactive if message empty', function (done) {
      const flow = Array.from(testFlows.testNodeWithServerFlow)
      flow[2].serverPort = "50201"
      helper.load(testFlexSequencerNodes, flow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        setTimeout(() => {
          modbusClientNode.messageAllowedStates = ['']
          let isInactive = modbusClientNode.isInactive()
          isInactive.should.be.true
          done()
        } , 1500)
      })
    })

    it('should be state queueing - ready to send', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        setTimeout(() => {
          mBasics.setNodeStatusTo('queueing', modbusClientNode)
          let isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.true
          done()
        } , 1500)
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        setTimeout(() => {
          mBasics.setNodeStatusTo('stopped', modbusClientNode)
          let isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false
          done()
        } , 1500)
      })
    })

    it('prepareMessage will convert a message in string format into a unified format', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        setTimeout(() => {
          const flexSequencer = helper.getNode('bc5a61b6.a3972')
          const result = flexSequencer.prepareMsg("{ \"fc\": 1, \"unitid\": 1, \"address\": 0, \"quantity\": 1 }")

          result.fc.should.equal(1)
          result.unitid.should.equal(1)
          result.address.should.equal(0)
          result.quantity.should.equal(1)
          done()
        } , 1500)
      })
    })

    it('prepareMessage will convert a message in json format into a unified format', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        setTimeout(() => {
          const flexSequencer = helper.getNode('bc5a61b6.a3972')

          let message = { fc: 1, unitid: 1, address: 0, quantity: 1 }
          const result = flexSequencer.prepareMsg(message)

          result.fc.should.equal(1)
          result.unitid.should.equal(1)
          result.address.should.equal(0)
          result.quantity.should.equal(1)
          done()
        } , 1500)
      })
    })

    it('the user can supply function code strings "FC1,FC2..." these will internally converted into the right values', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        setTimeout(() => {
          const flexSequencer = helper.getNode('bc5a61b6.a3972')
          let message = { fc: 1, unitid: 1, address: 0, quantity: 1 }


          for(let currentFc = 1; currentFc < 5; currentFc++) {
            const fc_identifier = "FC" + currentFc;
            message.fc = fc_identifier
            const result = flexSequencer.prepareMsg(message)

            result.fc.should.equal(currentFc)
            result.unitid.should.equal(1)
            result.address.should.equal(0)
            result.quantity.should.equal(1)
          }
          done()
        } , 1500)
      })
    })

    it('isValidModbusMessage checks if the passed message is actually valid', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        setTimeout(() => {
          const flexSequencer = helper.getNode('bc5a61b6.a3972')
          let validModbusMessage = { fc: 1, unitid: 1, address: 0, quantity: 1 }
          const validMessage = flexSequencer.isValidModbusMsg(validModbusMessage)
          validMessage.should.equal(true)

          let invalidUnitIdModbusMessage = { fc: 1, unitid: -10, address: 0, quantity: 1 }
          const invalidUnitId = flexSequencer.isValidModbusMsg(invalidUnitIdModbusMessage)
          invalidUnitId.should.equal(false)

          let invalidAddressModbusMessage = { fc: 1, unitid: 1, address: 65537, quantity: 10 }
          const invalidAddress = flexSequencer.isValidModbusMsg(invalidAddressModbusMessage)
          invalidAddress.should.equal(false)

          let invalidQuantityModbusMessage = { fc: 1, unitid: 1, address: 10, quantity: 65537}
          const invalidQuantity = flexSequencer.isValidModbusMsg(invalidQuantityModbusMessage)
          invalidQuantity.should.equal(false)

          done()
        } , 1500)
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testFlexSequencerNodes, testFlows.testNodeWithServerFlow, function () {
        helper.request().post('/modbus-flex-sequencer/invalid').expect(404).end(done)
      })
    })
  })
})
