// /**
//  * Original Work Copyright 2014 IBM Corp.
//  * node-red
//  *
//  * Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
//  * All rights reserved.
//  * node-red-contrib-modbus - The BSD 3-Clause License
//  *
//  **/

// 'use strict'

// const nodeUnderTest = require('../../src/modbus-io-config.js')
// const readNode = require('../../src/modbus-read.js')
// const catchNode = require('@node-red/nodes/core/common/25-catch')
// const injectNode = require('@node-red/nodes/core/common/20-inject')
// const functionNode = require('@node-red/nodes/core/function/10-function')
// const clientNode = require('../../src/modbus-client')
// const serverNode = require('../../src/modbus-server')
// const coreIO = require('../../src/core/modbus-io-core.js')
// const sinon = require('sinon')
// const helper = require('node-red-node-test-helper')
// const fs = require('fs-extra')

// helper.init(require.resolve('node-red'))

// const testIoConfigNodes = [injectNode, functionNode, clientNode, serverNode, nodeUnderTest, readNode]
// //const nodeList = [injectNode, functionNode, commentNode, modbusServerNode, modbusClientNode, modbusReadNode, modbusFlexFc];


// const testFlows = require('./flows/modbus-io-config-e2e-flows.js')
// const mBasics = require('../../src/modbus-basics')


// describe('IO Config node Testing', function () {
//     before(function (done) {
//         helper.startServer(function () {
//             done()
//         })
//     })

//     afterEach(function (done) {
//         helper.unload().then(function () {
//             done()
//         }).catch(function () {
//             done()
//         })
//     })

//     after(function (done) {
//         helper.stopServer(function () {
//             done()
//         })
//     })

//     describe('Node', function () {

//         it('should add parsed JSON lines to node.configData', function () {
            
//             helper.load(testIoConfigNodes, testFlows.testShouldBeReadyToSendFlow, function () {
//                 const modbusIOConfigNode = helper.getNode('2f5a90d.bcaa1f')
//                 //console.log(modbusIOConfigNode,'hjjj')
//                 const testLine = '{"key": "value"}';
//                 fs.readFile('./test_file.txt')
//                 console.log(testLine, 'nnjn')
//                 //expect(modbusIOConfigNode.configData).to.deep.equal([{ key: 'value' }]);
//                 setTimeout(function () {
//                     let a=1
//                 // sinon.assert.calledWith(errorStub, sinon.match.instanceOf(Error), msg);
//                 // sinon.assert.calledWith(sendStub, msg);
//                 }, 0);

//             })
//         })

//     })

//     describe('post', function () {
//         it('should fail for invalid node', function (done) {
//             helper.load(testIoConfigNodes, testFlows.testShouldBeReadyToSendFlow, function () {
//                 helper.request().post('/modbus-io-config/invalid').expect(404).end(done)
//             })
//         })
//     })
// })
