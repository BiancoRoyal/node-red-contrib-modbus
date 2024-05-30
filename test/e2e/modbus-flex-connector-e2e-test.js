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
const clientNode = require('../../src/modbus-client.js')
const injectNode = require('@node-red/nodes/core/common/20-inject.js')
const sinon = require('sinon')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-flex-connector-e2e-flows.js')
const _ = require('underscore')


const testFlexConnectorNodes = [nodeUnderTest, serverNode, clientNode, injectNode]


describe('Flex Connector node Testing', function () {
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

        it('should trigger dynamic reconnection when valid connector type is provided', (done) => {
            helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, async () => {
                const modbusFlexNode = helper.getNode('a477577e.9e0bc');
                modbusFlexNode.onConfigDone = sinon.stub();
                modbusFlexNode.emptyMsgOnFail = true;
                const msg = { payload: {} };
                modbusFlexNode.onConfigDone(msg);

                setTimeout(() => {
                    sinon.assert.match(msg.payload, {});
                    done();
                }, 0);
            });
        })
        it('should trigger dynamic reconnection when valid connector type is provided', () => {
            helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, async () => {
                const modbusFlexNode = helper.getNode('a39e174edce1a54b');

                const msg = { payload: { connectorType: 'validType' } };
                const onInputCallback = sinon.spy();
                modbusFlexNode.on('input', onInputCallback);
                modbusFlexNode.emit = sinon.stub();
                modbusFlexNode.onConfigDone = sinon.stub();
                modbusFlexNode.onConfigError = sinon.stub();
                modbusFlexNode.showStatusActivities = true;
                modbusFlexNode.showErrors = true;
                modbusFlexNode.emptyQueue = true;
                modbusFlexNode.send = sinon.stub();

                modbusFlexNode.emit('input', msg);
                modbusFlexNode.should.have.property('name', 'FlexConnector');
                modbusFlexNode.should.have.property('emptyQueue', false);
                sinon.assert.calledWith(setNodeStatusToStub, modbusClient.actualServiceState, modbusFlexNode);
                sinon.assert.calledWithExactly(node.emit, 'dynamicReconnect', msg, modbusFlexNode.onConfigDone, modbusFlexNode.onConfigError);
                sinon.assert.calledOnce(onInputCallback);
            });
        });
        it('should set payload to empty string and send message when emptyMsgOnFail is true', function (done) {
            helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
                let modbusFlexNode = helper.getNode('a39e174edce1a54b');
                modbusFlexNode.emptyMsgOnFail = true;
                const msg = { payload: 'originalPayload' };

                modbusFlexNode.onConfigDone = sinon.stub();

                expect(msg.payload).to.equal('');
                sinon.assert.calledOnce(sendSpy);
                sinon.assert.calledWith(sendSpy, msg);
                done()
            });
        })

    })

    describe('post', function () {
        it('should fail for invalid node', function (done) {
            helper.load(testFlexConnectorNodes, testFlows.testShouldBeLoadedFlow, function () {
                helper.request().post('/modbus-flex-connector/invalid').expect(404).end(done)
            })
        })
    })
})
