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

const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
const readNode = require('../../src/modbus-read.js')
const ioConfigNode = require('../../src/modbus-io-config')

const testReadNodes = [clientNode, serverNode, readNode, ioConfigNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-read-flows')
const mBasics = require('../../src/modbus-basics')
const chai = require('chai');
const expect = chai.expect;

describe('Read node Testing', function () {
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
      helper.load(testReadNodes, testFlows.testReadWithoutClientFlow, function () {
        const modbusRead = helper.getNode('8ecaae3e.4b8928')
        modbusRead.should.have.property('name', 'modbusRead')
        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should be loaded', function (done) {
      helper.load(testReadNodes, testFlows.testReadWithClientFlow, function () {
        const modbusServer = helper.getNode('b071294594e37a6c')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('9018f377f076609d')
        modbusClient.should.have.property('name', 'modbusClient')

        const modbusRead = helper.getNode('09846c74de630616')
        modbusRead.should.have.property('name', 'modbusRead')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with empty topic', function (done) {
      helper.load(testReadNodes, testFlows.testReadMsgFlow, function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (counter === 1 && msg.topic === 'polling') {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with own topic', function (done) {
      helper.load(testReadNodes, testFlows.testReadMsgMyTopicFlow, function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (counter === 1 && msg.topic === 'myTopic') {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with IO', function (done) {
      helper.load(testReadNodes, testFlows.testReadWithClientIoFlow, function () {
        const h1 = helper.getNode('h1')
        let countMsg = 0
        h1.on('input', function (msg) {
          countMsg++
          if (countMsg === 4) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should send message with IO and sending IO-objects as payload', function (done) {
      helper.load(testReadNodes, testFlows.testReadWithClientIoPayloadFlow, function () {
        const h1 = helper.getNode('h1')
        let countMsg = 0
        h1.on('input', function (msg) {
          countMsg++
          if (countMsg === 4) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should be state queueing - ready to send', function (done) {
      helper.load(testReadNodes, testFlows.testReadMsgFlow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        setTimeout(() => {
          mBasics.setNodeStatusTo('queueing', modbusClientNode)
          let isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.true
          done()
        }, 1500)
      })
    })

    it('should be not state queueing - not ready to send', function (done) {
      helper.load(testReadNodes, testFlows.testReadMsgFlow, function () {
        const modbusClientNode = helper.getNode('92e7bf63.2efd7')
        setTimeout(() => {
          mBasics.setNodeStatusTo('stopped', modbusClientNode)
          let isReady = modbusClientNode.isReadyToSend(modbusClientNode)
          isReady.should.be.false
          done()
        }, 1500)
      })
    })
  })
  expect(msg.payload).to.have.property('opcuaItems').that.deep.equal(expectedOutput.opcuaItems);

  it('should send message with correct payload when reading', function (done) {
    helper.load(testReadNodes, testFlows.testReadMsgFlow, function () {
      const h1 = helper.getNode('90922127.397cb8')
      let counter = 0
      h1.on('input', function (msg) {
        counter++
        if (counter === 1) {
          expect(msg.payload).to.deep.equal([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);
          done()
        }
      })
    })
  })
  it("should handle empty input payload gracefully", function (done) {
    helper.load(testFlow, function () {
      const h1 = helper.getNode('90922127.397cb8')

      h1.on("input", function (msg) {
        try {
          expect(msg.payload).to.be.undefined;
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
  it("should handle invalid input gracefully", function(done) {
    helper.load(testFlow, function() {
      const h1 = helper.getNode('90922127.397cb8')
      h1.on("input", function(msg) {
        try {
          expect(msg.payload).to.not.be.undefined;
          expect(msg.payload).to.not.be.null;
            expect(msg.payload.error).to.exist;
          done();
        } catch (error) {
          done(error);
        }
      });
  

      h1.receive({});
    });
  });
  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-read/invalid').expect(404).end(done)
    })

    it('should fail for unloaded node', function (done) {
      helper.request().post('/modbus/read/inject/8ecaae3e.4b8928').expect(404).end(done)
    })

    it('should inject on valid node', function (done) {
      helper.load([clientNode, serverNode, readNode], testFlows.testReadWithClientFlow, function () {
        helper.request().post('/modbus/read/inject/09846c74de630616').expect(200).end(done)
      }, function () {
        helper.log('function callback')
      })
    })
  })
})
