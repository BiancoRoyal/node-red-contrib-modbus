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

const nodeUnderTest = require('../../src/modbus-flex-fc.js')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')

const testFlexFcNodes = [nodeUnderTest, clientNode, serverNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-flex-fc-flows')

describe('modbus flex fc unit test', function() {
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

      it('should load without errors', function(done) {
        const flow = Array.from(testFlows.modbusFlexFc)
        this.timeout(40000);
        helper.load(testFlexFcNodes, flow, function () {
          const modbusFlexFc = helper.getNode('d975b1203f71a3b5')
          modbusFlexFc.should.have.property('type', 'modbus-flex-fc')
          done()
        }, function () {
          helper.log('function callback')
        })
      })
})