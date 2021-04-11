/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018,2019,2020,2021 Klaus Landsdorf (https://bianco-royal.space/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

var injectNode = require('@node-red/nodes/core/common/20-inject.js')
var serverNode = require('../../src/modbus-server.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('Server node Testing', function () {
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
      helper.load(serverNode, [
        {
          id: '178284ea.5055ab',
          type: 'modbus-server',
          name: 'modbusServer',
          logEnabled: false,
          hostname: '',
          serverPort: '5502',
          responseDelay: '50',
          delayUnit: 'ms',
          coilsBufferSize: 1024,
          holdingBufferSize: 1024,
          inputBufferSize: 1024,
          discreteBufferSize: 1024,
          showErrors: false,
          wires: [
            [],
            [],
            [],
            []
          ]
        }
      ], function () {
        var modbusServer = helper.getNode('178284ea.5055ab')
        modbusServer.should.have.property('name', 'modbusServer')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('should send data on input', function (done) {
      helper.load([injectNode, serverNode], [
        {
          id: '178284ea.5055ab',
          type: 'modbus-server',
          name: 'modbusServer',
          logEnabled: false,
          hostname: '',
          serverPort: '5502',
          responseDelay: '50',
          delayUnit: 'ms',
          coilsBufferSize: 1024,
          holdingBufferSize: 1024,
          inputBufferSize: 1024,
          discreteBufferSize: 1024,
          showErrors: false,
          wires: [
            ['h1'],
            [],
            [],
            []
          ]
        },
        { id: 'h1', type: 'helper' },
        {
          id: 'a75e0ccf.e16628',
          type: 'inject',
          name: '',
          topic: '',
          payload: '',
          payloadType: 'date',
          repeat: '2',
          crontab: '',
          once: true,
          onceDelay: 0.1,
          wires: [
            [
              '178284ea.5055ab'
            ]
          ]
        }
      ], function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          done()
        })
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-server/invalid').expect(404).end(done)
    })
  })
})
