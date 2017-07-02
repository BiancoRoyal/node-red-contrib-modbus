/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017, Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

var nodeUnderTest = require('../../src/modbus-response.js')
var helper = require('../helper.js')

describe('Response node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node', function () {
    it('should be loaded', function (done) {
      var flow = [{id: 'n1', type: 'modbus-response', name: 'modbusNode'}]

      helper.load(nodeUnderTest, flow, function () {
        var modbusReadNode = helper.getNode('n1')
        modbusReadNode.should.have.property('name', 'modbusNode')
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-read/invalid').expect(404).end(done)
    })
  })
})
