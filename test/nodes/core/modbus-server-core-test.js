/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018,2019,2020 Klaus Landsdorf (https://bianco-royal.com/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

const assert = require('assert')
const coreServerUnderTest = require('../../../src/core/modbus-server-core')

const serverJsModbusFlow = [
  {
    id: 'd411a49f.e9ffd8',
    type: 'modbus-server',
    z: '42ed18ca.652838',
    name: '',
    logEnabled: false,
    hostname: '0.0.0.0',
    serverPort: 10502,
    responseDelay: 100,
    delayUnit: 'ms',
    coilsBufferSize: '1024',
    holdingBufferSize: '1024',
    inputBufferSize: '1024',
    discreteBufferSize: '1024',
    showErrors: true,
    x: 435,
    y: 160,
    wires: [
      [
        '36782533.082afa'
      ],
      [
        'fa7b2d15.15806'
      ],
      [
        '6ec442b7.58008c'
      ],
      [
        '1fab23a0.563b14'
      ],
      [
        'afaf95b3.c7345'
      ]
    ],
    l: false
  },
  {
    id: '98d7383d.aa12a',
    type: 'function',
    z: '42ed18ca.652838',
    name: '',
    func: "msg.payload = {\n    'value': [1,1,1], \n    'register': 'input', \n    'address': 0 , \n    'disableMsgOutput' : 0 \n}; \nreturn msg;\n\n",
    outputs: 1,
    noerr: 0,
    x: 355,
    y: 100,
    wires: [
      [
        'd411a49f.e9ffd8'
      ]
    ],
    l: false
  },
  {
    id: '5fc93873.d0eb58',
    type: 'function',
    z: '42ed18ca.652838',
    name: '',
    func: "msg.payload = {\n    'value': [233,234,235], \n    'register': 'holding', \n    'address': 0 , \n    'disableMsgOutput' : 0 \n}; \nreturn msg;\n\n",
    outputs: 1,
    noerr: 0,
    x: 355,
    y: 140,
    wires: [
      [
        'd411a49f.e9ffd8'
      ]
    ],
    l: false
  },
  {
    id: '550f6965.7b646',
    type: 'function',
    z: '42ed18ca.652838',
    name: '',
    func: "msg.payload = {\n    'value': [true,true,true], \n    'register': 'coils', \n    'address': 0 , \n    'disableMsgOutput' : 0 \n}; \nreturn msg;\n\n",
    outputs: 1,
    noerr: 0,
    x: 355,
    y: 180,
    wires: [
      [
        'd411a49f.e9ffd8'
      ]
    ],
    l: false
  },
  {
    id: '81bc1a3a.a886c',
    type: 'function',
    z: '42ed18ca.652838',
    name: '',
    func: "msg.payload = {\n    'value': [true,true,true], \n    'register': 'discrete', \n    'address': 0 , \n    'disableMsgOutput' : 0 \n}; \nreturn msg;\n\n",
    outputs: 1,
    noerr: 0,
    x: 355,
    y: 220,
    wires: [
      [
        'd411a49f.e9ffd8'
      ]
    ],
    l: false
  }
]

describe('Core Server Testing', function () {
  describe('Core Server', function () {
    it('should give the nodes internalDebugLog', function (done) {
      const node = { internalDebugLog: true }
      assert.strict.equal(coreServerUnderTest.getLogFunction(node), node.internalDebugLog)
      done()
    })
  })
})
