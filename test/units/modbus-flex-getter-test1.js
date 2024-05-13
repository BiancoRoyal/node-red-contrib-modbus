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
const nodeUnderTest = require('../../src/modbus-flex-getter.js')

var functionNode = require('@node-red/nodes/core/function/10-function')
var helper = require('node-red-node-test-helper');

const testFlexGetterNodes = [injectNode, clientNode, serverNode, nodeUnderTest, functionNode]
const testFlows1 = require('./flows/modbus-flex-getter-flows')

helper.init(require.resolve('node-red'))


const _ = require('underscore')

describe('Flex Getter node Testing', function () {
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

    const assert = require('assert');

    describe('Modbus Flex Getter node', function () {
        describe('valid input message handling', function () {
            it('should prepare the message correctly and send the Modbus request with the correct parameters', function (done) {
                const expectedOutput = {
                    address: 0,
                    fc: 1,
                    quantity: 1,
                    unitid: 1
                };

                helper.load(testFlexGetterNodes, testFlows1.testFlexGetterShowWarningsWithoutClientFlow, function () {
                    const n1 = helper.getNode('bc5a61b6.a3972');
                    n1.on('input', function (msg) {
                        try {
                            assert.deepEqual(_.omit(msg.payload, 'value'), expectedOutput);
                            done();
                        } catch (err) {
                            done(err);
                        }
                    });

                    const injectNode = helper.getNode('10c6a88f38bf7814');
                    injectNode.receive({ payload: '{"fc":1,"unitid":1,"address":0,"quantity":1}', topic: '' });
                });
            });
        });

        describe('valid Modbus function codes, addresses, and quantity values', function () {
            it('should handle valid Modbus function codes, addresses, and quantity values', function (done) {
                helper.load(testFlexGetterNodes, testFlows1.testFlexGetterShowWarningsWithoutClientFlow, function () {
                    const n1 = helper.getNode('bc5a61b6.a3972');

                    n1.on('input', function (msg) {
                        try {
                            assert.strictEqual(msg.payload.fc, 1); // Expected function code
                            assert.strictEqual(msg.payload.address, 0); // Expected starting address
                            assert.strictEqual(msg.payload.quantity, 1); // Expected quantity
                            done();
                        } catch (err) {
                            done(err);
                        }
                    });

                    const injectNode = helper.getNode('fda9ed0f.c27278'); // Adjust the ID to match your inject node ID
                    injectNode.receive({ payload: '{"fc":1,"unitid":1,"address":0,"quantity":1}', topic: '' });
                });
            });
        });
        describe('reset input delay timer', function () {
            it('should reset input delay timer', () => {
                const flow = Array.from(testFlows1.testFlexGetterShowWarningsWithoutClientFlow);
                helper.load(testFlexGetterNodes, flow, function () {
                    const n1 = helper.getNode('bc5a61b6.a3972');
                    n1.resetInputDelayTimer();
                    assert.strictEqual(n1.inputDelayTimer, null);
                });
            });
        });


        describe('isValidModbusMsg', function () {
            it('should return true for valid Modbus message', function (done) {
                helper.load(testFlexGetterNodes, testFlows1.testFlexGetterShowWarningsWithoutClientFlow, function () {
                    const n1 = helper.getNode('bc5a61b6.a3972');
                    console.log(n1, "n123")

                    const node = new ModbusFlexGetter({});
                    console.log(node, "node78")
                    n1.on('input', function (msg) {
                        console.log('Received input message:', msg);
                        try {
                          const isValid = node.isValidModbusMsg(msg);
                          console.log('isValidModbusMsg returned:', isValid);
                          assert.strictEqual(isValid, true);
                          done();
                        } catch (err) {
                          done(err);
                        }
                      });
                } );
            });

        });
    })
});
