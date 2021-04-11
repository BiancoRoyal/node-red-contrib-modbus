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
var nodeUnderTest = require('../../src/modbus-response.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const shortLengthInjectData = [
  {
    id: 'f1ff9252.b5ce18',
    type: 'modbus-response',
    name: 'shortLengthInjectData',
    registerShowMax: 20,
    wires: []
  },
  {
    id: '8827b34f.682e8',
    type: 'inject',
    name: 'ShortLengthInject',
    topic: '',
    payload: '{"data":{"length":2}}',
    payloadType: 'json',
    repeat: '',
    crontab: '',
    once: true,
    onceDelay: 0.1,
    wires: [
      [
        'f1ff9252.b5ce18'
      ]
    ]
  }
]

const longLengthInjectData = [
  {
    id: 'f1ff9252.b5ce18',
    type: 'modbus-response',
    name: 'longLengthInjectData',
    registerShowMax: 20,
    wires: []
  },
  {
    id: '8827b34f.682e8',
    type: 'inject',
    name: 'LongLengthInject',
    topic: '',
    payload: '{"data":{"length":22}}',
    payloadType: 'json',
    repeat: '',
    crontab: '',
    once: true,
    onceDelay: 0.1,
    wires: [
      [
        'f1ff9252.b5ce18'
      ]
    ]
  }
]

const shortLengthInjectAddress = [
  {
    id: 'f1ff9252.b5ce18',
    type: 'modbus-response',
    name: 'shortLengthInjectAddress',
    registerShowMax: 20,
    wires: []
  },
  {
    id: '8827b34f.682e8',
    type: 'inject',
    name: 'ShortLengthInject',
    topic: '',
    payload: '{"length":2, "address": {}}',
    payloadType: 'json',
    repeat: '',
    crontab: '',
    once: true,
    onceDelay: 0.1,
    wires: [
      [
        'f1ff9252.b5ce18'
      ]
    ]
  }
]

const longLengthInjectAddress = [
  {
    id: 'f1ff9252.b5ce18',
    type: 'modbus-response',
    name: 'longLengthInjectAddress',
    registerShowMax: 20,
    wires: []
  },
  {
    id: '8827b34f.682e8',
    type: 'inject',
    name: 'LongLengthInject',
    topic: '',
    payload: '{"length":22, "address": {}}',
    payloadType: 'json',
    repeat: '',
    crontab: '',
    once: true,
    onceDelay: 0.1,
    wires: [
      [
        'f1ff9252.b5ce18'
      ]
    ]
  }
]

const injectJustPayload = [
  {
    id: 'f1ff9252.b5ce18',
    type: 'modbus-response',
    name: 'injectJustPayload',
    registerShowMax: 20,
    wires: []
  },
  {
    id: '8827b34f.682e8',
    type: 'inject',
    name: 'LongLengthInject',
    topic: '',
    payload: '{}',
    payloadType: 'json',
    repeat: '',
    crontab: '',
    once: true,
    onceDelay: 0.1,
    wires: [
      [
        'f1ff9252.b5ce18'
      ]
    ]
  }
]

describe('Response node Testing', function () {
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
    it('should be loaded', function (done) {
      var flow = [
        {
          id: 'f1ff9252.b5ce18',
          type: 'modbus-response',
          name: 'modbusNode',
          registerShowMax: 20,
          wires: []
        }
      ]

      helper.load(nodeUnderTest, flow, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.should.have.property('name', 'modbusNode')
        done()
      })
    })

    it('should work with short data', function (done) {
      helper.load([injectNode, nodeUnderTest], shortLengthInjectData, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.on('input', function (msg) {
          modbusResponseNode.should.have.property('name', 'shortLengthInjectData')
          done()
        })
      })
    })

    it('should work with long data', function (done) {
      helper.load([injectNode, nodeUnderTest], longLengthInjectData, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.on('input', function (msg) {
          modbusResponseNode.should.have.property('name', 'longLengthInjectData')
          done()
        })
      })
    })

    it('should work with short address', function (done) {
      helper.load([injectNode, nodeUnderTest], shortLengthInjectAddress, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.on('input', function (msg) {
          modbusResponseNode.should.have.property('name', 'shortLengthInjectAddress')
          done()
        })
      })
    })

    it('should work with long address', function (done) {
      helper.load([injectNode, nodeUnderTest], longLengthInjectAddress, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.on('input', function (msg) {
          modbusResponseNode.should.have.property('name', 'longLengthInjectAddress')
          done()
        })
      })
    })

    it('should work with just payload', function (done) {
      helper.load([injectNode, nodeUnderTest], injectJustPayload, function () {
        const modbusResponseNode = helper.getNode('f1ff9252.b5ce18')
        modbusResponseNode.on('input', function (msg) {
          modbusResponseNode.should.have.property('name', 'injectJustPayload')
          done()
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-response/invalid').expect(404).end(done)
    })
  })
})
