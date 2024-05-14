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

// var injectNode = require('@node-red/nodes/core/common/20-inject')
// var functionNode = require('@node-red/nodes/core/function/10-function')
// var commentNode = require('@node-red/nodes/core/common/90-comment.js')

// var modbusServerNode = require('../../src/modbus-server.js')
// var modbusClientNode = require('../../src/modbus-client.js')
// var modbusReadNode = require('../../src/modbus-read.js')

// var helper = require('node-red-node-test-helper')
// helper.init(require.resolve('node-red'))

// const nodeList = [injectNode, functionNode, commentNode, modbusServerNode, modbusClientNode, modbusReadNode]

// var testFlows = require('./flows/modbus-read-e2e-flows')

// describe('Client Modbus Integration', function () {
//   before(function (done) {
//     helper.startServer(function () {
//       done()
//     })
//   })

//   afterEach(function (done) {
//     helper.unload().then(function () {
//       done()
//     }).catch(function () {
//       done()
//     })
//   })

//   after(function (done) {
//     helper.stopServer(function () {
//       done()
//     })
//   })

//   // describe('Node', function () {
//   //   it('should read Modbus via TCP', function (done) {
//   //     helper.load(nodeList, testFlows.testFlowReading, function () {
//   //       const readNode = helper.getNode('1f9596ed.279b89')
//   //       readNode.should.have.property('name', 'ModbusTestRead')
//   //       setTimeout(done, 1000)
//   //     })
//   //   })
//   // })

//   // describe('Posts', function () {
//   //   it('should give status 200 site for serial ports list', function (done) {
//   //     helper.load(nodeList, testFlows.testFlowReading, function () {
//   //       setTimeout(function () {
//   //         helper.request().get('/modbus/serial/ports').expect(200).end(done)
//   //       }, 1000)
//   //     })
//   //   })
//   // })

//   it('should send message with correct payload when reading coils', function (done) {
//     helper.load(nodeList, testFlows.testFlowReading, function () {
//       const h1 = helper.getNode('h1')
//       console.log(h1)
//       let counter = 0
//       h1.on('input', function (msg) {
//         counter++
//         if (counter === 1) {
//           msg.payload.should.eql([true, true, true, true, true, true, true, true, true, true])
//           done()
//         }
//       })
//     }, function () {
//       helper.log('function callback')
//     })
//   })

// })
