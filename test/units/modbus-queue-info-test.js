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
const chai = require('chai');
const expect = chai.expect;

const testQueueInfoNodes = [catchNode, injectNode, functionNode, clientNode, serverNode, nodeUnderTest, readNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-queue-info-flows')
const mBasics = require('../../src/modbus-basics')


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
    it('should initialize ModbusQueueInfo node with provided configuration', function (done) {

      const mockNode = {
        name: 'testNode',
        topic: 'testTopic',
        unitid: '0',
        lowLowLevel: '5',
        lowLevel: '10',
        highLevel: '20',
        highHighLevel: '30',
        errorOnHighLevel: true,
        queueReadIntervalTime: '1000',
        showStatusActivities: true,
        updateOnAllQueueChanges: true,
        updateOnAllUnitQueues: false,
        queueReadInterval: null,
        updateStatusRunning: false,
        unitsWithQueue: new Map(),
        checkLowLevelReached: () => { },
        initUnitQueueStates: () => { },
        resetStates: () => { },
        errorProtocolMsg: () => { },
        checkHighLevelReached: () => { },
        checkHighHighLevelReached: () => { },
        getStatusSituationFillColor: () => { },
        setNodeStatusByActivity: () => { },
        readFromQueue: () => { },
        readFromAllUnitQueues: () => { },
        checkQueueStates: () => { },
        registerModbusQueueActionsToNode: () => { },
        removeModbusQueueActionsFromNode: () => { },
      }

      helper.load(testQueueInfoNodes, testFlows.testToReadFromAllUnitQueues, function () {
        expect(mockNode.name).to.equal('testNode');
        expect(mockNode.name).to.equal('testNode');
        expect(mockNode.topic).to.equal('testTopic');
        expect(mockNode.unitid).to.equal('0');
        expect(mockNode.lowLowLevel).to.equal('5');
        expect(mockNode.lowLevel).to.equal('10');
        expect(mockNode.highLevel).to.equal('20');
        expect(mockNode.highHighLevel).to.equal('30');
        expect(mockNode.errorOnHighLevel).to.equal(true);
        expect(mockNode.queueReadIntervalTime).to.equal('1000');
        expect(mockNode.showStatusActivities).to.equal(true);
        expect(mockNode.updateOnAllQueueChanges).to.equal(true);
        expect(mockNode.updateOnAllUnitQueues).to.equal(false);
        expect(mockNode.queueReadInterval).to.be.null;
        expect(mockNode.updateStatusRunning).to.equal(false);
        expect(mockNode.unitsWithQueue).to.be.an.instanceOf(Map);
        expect(mockNode.checkLowLevelReached).to.be.a('function');
        expect(mockNode.initUnitQueueStates).to.be.a('function');
        expect(mockNode.resetStates).to.be.a('function');
        expect(mockNode.errorProtocolMsg).to.be.a('function');
        expect(mockNode.checkLowLevelReached).to.be.a('function');
        expect(mockNode.checkHighLevelReached).to.be.a('function');
        expect(mockNode.checkHighHighLevelReached).to.be.a('function');
        expect(mockNode.getStatusSituationFillColor).to.be.a('function');
        expect(mockNode.setNodeStatusByActivity).to.be.a('function');
        expect(mockNode.readFromQueue).to.be.a('function');
        expect(mockNode.readFromAllUnitQueues).to.be.a('function');
        expect(mockNode.checkQueueStates).to.be.a('function');
        expect(mockNode.registerModbusQueueActionsToNode).to.be.a('function');
        expect(mockNode.removeModbusQueueActionsFromNode).to.be.a('function');
        done();
      })
    })
    it('should send a message when low level queue threshold is reached', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testToReadFromAllUnitQueues, function () {
        const modbusQueueInfoNodeInstance = helper.getNode('1b72b5d207427b00');
        const helperNode = helper.getNode('1aac12eebc4bd7cb');

        modbusQueueInfoNodeInstance.unitsWithQueue = new Map();
        modbusQueueInfoNodeInstance.unitsWithQueue.set(1, { lowLevelReached: false });
        modbusQueueInfoNodeInstance.send = function (msg) {
          helperNode.receive(msg);
        };

        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('state', 'low level reached');
            msg.should.have.property('unitid', 1);
            msg.should.have.property('bufferCommandListLength', 4);
            done();
          } catch (err) {
            done(err);
          }
        });
        modbusQueueInfoNodeInstance.checkLowLevelReached(modbusQueueInfoNodeInstance, 4, 1);
      });
    });
    it('should send a message when high level queue threshold is reached', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testToReadFromAllUnitQueues, function () {
        const modbusQueueInfoNodeInstance = helper.getNode('1b72b5d207427b00');
        const helperNode = helper.getNode('1aac12eebc4bd7cb');

        modbusQueueInfoNodeInstance.unitsWithQueue = new Map();
        modbusQueueInfoNodeInstance.unitsWithQueue.set(1, { highLevelReached: false });
        modbusQueueInfoNodeInstance.lowLevel = 5;
        modbusQueueInfoNodeInstance.highLevel = 10;

        modbusQueueInfoNodeInstance.send = function (msg) {
          helperNode.receive(msg);
        };

        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('state', 'high level reached');
            msg.should.have.property('unitid', 1);
            msg.should.have.property('bufferCommandListLength', 11);
            done();
          } catch (err) {
            done(err);
          }
        });
        modbusQueueInfoNodeInstance.checkHighLevelReached(modbusQueueInfoNodeInstance, 11, 1);
      });
    });

    it('should send a message and raise an error when high high level queue threshold is reached', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testToReadFromAllUnitQueues, function () {
        const modbusQueueInfoNodeInstance = helper.getNode('1b72b5d207427b00');
        const helperNode = helper.getNode('1aac12eebc4bd7cb');
        modbusQueueInfoNodeInstance.unitsWithQueue = new Map();
        modbusQueueInfoNodeInstance.unitsWithQueue.set(1, { highHighLevelReached: false });
        modbusQueueInfoNodeInstance.highLevel = 20;
        modbusQueueInfoNodeInstance.highHighLevel = 30;

        helperNode.on('input', function (msg) {
          try {
            msg.should.have.property('state', 'high high level reached');
            msg.should.have.property('unitid', 1);
            msg.should.have.property('bufferCommandListLength', 35);
            done();
          } catch (err) {
            done(err);
          }
        });
        modbusQueueInfoNodeInstance.checkHighHighLevelReached(modbusQueueInfoNodeInstance, 35, 1);
      });
    });
    it('simple flow with old reset inject should be loaded', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testOldResetInjectShouldBeLoadedFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
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
        h1.on('input', function (msg) {
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
        h1.on('input', function (msg) {
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
        h1.on('input', function (msg) {
          done()
        })
        const queueNode = helper.getNode('5fffb0bc.0b8a5')
        queueNode.receive({ payload: { resetQueue: true } })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should be state queueing - ready to send', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusClientNode = helper.getNode('d4c76ff5.c424b8')
        setTimeout(() => {
          mBasics.setNodeStatusTo('queueing', modbusClientNode)
          let isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.true
          done()
        }, 1500)
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusClientNode = helper.getNode('d4c76ff5.c424b8')
        setTimeout(() => {
          mBasics.setNodeStatusTo('stopped', modbusClientNode)
          let isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false
          done()
        }, 1500)
      })
    })

    it('should log an error message if showErrors is true and an error occurs', function (done) {

      helper.load(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusQueueInfo = helper.getNode('389153e.cb648ac');

        modbusQueueInfo.showErrors = true
        done()
      });

    });
  });
  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testQueueInfoNodes, testFlows.testShouldBeLoadedFlow, function () {
        helper.request().post('/modbus-read/invalid').expect(404).end(done)
      })
    })
  })
})
