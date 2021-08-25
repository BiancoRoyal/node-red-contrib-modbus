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

var assert = require('chai').assert

var injectNode = require('@node-red/nodes/core/common/20-inject.js')
var catchNode = require('@node-red/nodes/core/common/25-catch.js')
var functionNode = require('@node-red/nodes/core/function/10-function.js')
var clientNode = require('../../src/modbus-client.js')
var serverNode = require('../../src/modbus-server.js')
var nodeUnderTest = require('../../src/modbus-flex-write.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testWriteParametersNodes = [catchNode, injectNode, functionNode, clientNode, serverNode, nodeUnderTest]
var testWriteParametersFlow = [
  {
    id: 'c2f3c1d0.3d0b1',
    type: 'catch',
    name: '',
    scope: null,
    wires: [
      ['h2']
    ]
  },
  { id: 'h2', type: 'helper' },
  {
    id: '178284ea.5055ab',
    type: 'modbus-server',
    name: '',
    logEnabled: false,
    hostname: '',
    serverPort: '7502',
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
  },
  {
    id: '82fe7fe4.7b7bc8',
    type: 'modbus-flex-write',
    name: '',
    showStatusActivities: false,
    showErrors: true,
    server: '80aeec4c.0cb9e8',
    emptyMsgOnFail: false,
    keepMsgProperties: false,
    wires: [
      ['h1'],
      []
    ]
  },
  { id: 'h1', type: 'helper' },
  {
    id: '9d3d244.cb410d8',
    type: 'function',
    name: 'Write 0-9 on Unit 1 FC15',
    func: "msg.payload = { value: msg.payload, 'fc': 15, 'unitid': 1, 'address': 0 , 'quantity': 10 };\nreturn msg;",
    outputs: 1,
    noerr: 0,
    wires: [
      [
        '82fe7fe4.7b7bc8'
      ]
    ]
  },
  {
    id: '80aeec4c.0cb9e8',
    type: 'modbus-client',
    z: '',
    name: 'Modbus Server',
    clienttype: 'tcp',
    bufferCommands: true,
    stateLogEnabled: false,
    parallelUnitIdsAllowed: true,
    tcpHost: '127.0.0.1',
    tcpPort: '7502',
    tcpType: 'DEFAULT',
    serialPort: '/dev/ttyUSB',
    serialType: 'RTU-BUFFERD',
    serialBaudrate: '9600',
    serialDatabits: '8',
    serialStopbits: '1',
    serialParity: 'none',
    serialConnectionDelay: '100',
    unit_id: '1',
    commandDelay: '1',
    clientTimeout: '100',
    reconnectDelay: 200,
    connectionTimeout: 10000
  }
]

describe('Flex Write node Testing', function () {
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
      helper.load([clientNode, nodeUnderTest], [
        {
          id: 'c02b6d1.d419c1',
          type: 'modbus-flex-write',
          name: 'modbusFlexWrite',
          showStatusActivities: true,
          showErrors: false,
          emptyMsgOnFail: false,
          keepMsgProperties: false,
          server: '',
          wires: [
            [],
            []
          ]
        }], function () {
        const modbusFlexWrite = helper.getNode('c02b6d1.d419c1')
        modbusFlexWrite.should.have.property('name', 'modbusFlexWrite')
        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should be loaded', function (done) {
      helper.load([clientNode, nodeUnderTest], [
        {
          id: 'c02b6d1.d419c1',
          type: 'modbus-flex-write',
          name: 'modbusFlexWrite',
          showStatusActivities: true,
          showErrors: false,
          emptyMsgOnFail: false,
          keepMsgProperties: false,
          server: '80aeec4c.0cb9e8',
          wires: [
            [],
            []
          ]
        },
        {
          id: '80aeec4c.0cb9e8',
          type: 'modbus-client',
          name: 'Modbus Server',
          clienttype: 'tcp',
          bufferCommands: true,
          stateLogEnabled: false,
          parallelUnitIdsAllowed: true,
          tcpHost: '127.0.0.1',
          tcpPort: '6502',
          tcpType: 'DEFAULT',
          serialPort: '/dev/ttyUSB',
          serialType: 'RTU-BUFFERD',
          serialBaudrate: '9600',
          serialDatabits: '8',
          serialStopbits: '1',
          serialParity: 'none',
          serialConnectionDelay: '100',
          unit_id: '1',
          commandDelay: '1',
          clientTimeout: '100',
          reconnectDelay: 200,
          connectionTimeout: 10000
        }
      ], function () {
        const modbusFlexWrite = helper.getNode('c02b6d1.d419c1')
        modbusFlexWrite.should.have.property('name', 'modbusFlexWrite')
        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject and write should be loaded', function (done) {
      helper.load([injectNode, functionNode, clientNode, serverNode, nodeUnderTest], [
        {
          id: '178284ea.5055ab',
          type: 'modbus-server',
          name: '',
          logEnabled: false,
          hostname: '',
          serverPort: '7502',
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
        },
        {
          id: '82fe7fe4.7b7bc8',
          type: 'modbus-flex-write',
          name: '',
          showStatusActivities: false,
          showErrors: false,
          emptyMsgOnFail: false,
          keepMsgProperties: false,
          server: '80aeec4c.0cb9e8',
          wires: [
            ['h1'],
            []
          ]
        },
        { id: 'h1', type: 'helper' },
        {
          id: 'a7908874.150ac',
          type: 'inject',
          name: 'Write multiple!',
          topic: '',
          payload: '[1,2,3,4,5,6,7,8,9,10]',
          payloadType: 'json',
          repeat: '0.5',
          crontab: '',
          once: true,
          onceDelay: '0.1',
          wires: [
            [
              '9d3d244.cb410d8'
            ]
          ]
        },
        {
          id: '9d3d244.cb410d8',
          type: 'function',
          name: 'Write 0-9 on Unit 1 FC15',
          func: "msg.payload = { value: msg.payload, 'fc': 15, 'unitid': 1, 'address': 0 , 'quantity': 10 };\nreturn msg;",
          outputs: 1,
          noerr: 0,
          wires: [
            [
              '82fe7fe4.7b7bc8'
            ]
          ]
        },
        {
          id: '80aeec4c.0cb9e8',
          type: 'modbus-client',
          z: '',
          name: 'Modbus Server',
          clienttype: 'tcp',
          bufferCommands: true,
          stateLogEnabled: false,
          parallelUnitIdsAllowed: true,
          tcpHost: '127.0.0.1',
          tcpPort: '7502',
          tcpType: 'DEFAULT',
          serialPort: '/dev/ttyUSB',
          serialType: 'RTU-BUFFERD',
          serialBaudrate: '9600',
          serialDatabits: '8',
          serialStopbits: '1',
          serialParity: 'none',
          serialConnectionDelay: '100',
          unit_id: '1',
          commandDelay: '1',
          clientTimeout: '100',
          reconnectDelay: 200,
          connectionTimeout: 10000
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

    it('simple flow with wrong inject should not crash', function (done) {
      helper.load(testWriteParametersNodes, testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({})
        }, 800)
        setTimeout(done, 1200)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong FC inject should not crash', function (done) {
      helper.load(testWriteParametersNodes, testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: '{ "value": true, "fc": 1, "unitid": 1,"address": 0, "quantity": 1 }' })
        }, 800)
        setTimeout(done, 1200)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong address inject should not crash', function (done) {
      helper.load(testWriteParametersNodes, testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: '{ "value": true, "fc": 5, "unitid": 1,"address": -1, "quantity": 1 }' })
        }, 800)
        setTimeout(done, 1200)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with wrong quantity inject should not crash', function (done) {
      helper.load(testWriteParametersNodes, testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          throw Error('Should Not Get A Message On Wrong Input To Flex Writer')
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: '{ "value": true, "fc": 5, "unitid": 1,"address": 1, "quantity": -1 }' })
        }, 800)
        setTimeout(done, 1200)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string input from http should be parsed and written', function (done) {
      helper.load(testWriteParametersNodes, testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (flexWriter.bufferMessageList.size === 0) {
            done()
          }
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: '{ "value": true, "fc": 5, "unitid": 1,"address": 0, "quantity": 1 }' })
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string with array of values input from http should be parsed and written', function (done) {
      helper.load(testWriteParametersNodes, testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (flexWriter.bufferMessageList.size === 0) {
            done()
          }
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: '{ "value": [0,1,0,1], "fc": 5, "unitid": 1,"address": 0, "quantity": 4 }' })
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string value true input from http should be parsed and written', function (done) {
      helper.load(testWriteParametersNodes, testWriteParametersFlow, function () {
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (flexWriter.bufferMessageList.size === 0) {
            done()
          }
        })
        setTimeout(function () {
          flexWriter.receive({ payload: { value: 'true', fc: 5, unitid: 1, address: 0, quantity: 1 } })
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with string value false input from http should be parsed and written', function (done) {
      helper.load(testWriteParametersNodes, testWriteParametersFlow, function () {
        const h1 = helper.getNode('h1')
        h1.on('input', function (msg) {
          if (flexWriter.bufferMessageList.size === 0) {
            done()
          }
        })
        const flexWriter = helper.getNode('82fe7fe4.7b7bc8')
        setTimeout(function () {
          flexWriter.receive({ payload: { value: 'false', fc: 5, unitid: 1, address: 0, quantity: 1 } })
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-flex-write/invalid').expect(404).end(done)
    })
  })
})
