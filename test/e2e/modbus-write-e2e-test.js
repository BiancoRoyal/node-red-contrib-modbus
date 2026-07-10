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

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const allModbusTestNodes = require('../helper/all-modbus-test-nodes')
const { getPort, getTestNode, deployModbusFlow } = require('../helper/test-helper-extensions')

helper.init(require.resolve('node-red'))

describe('Client Modbus Integration', function () {
  this.timeout(15000)

  before(function (done) {
    helper.startServer(done)
  })

  describe('Modbus Write', function () {
    it('should write Modbus via TCP', async function () {
      const port = await getPort()

      const flow = [
        {
          id: 'tab1',
          type: 'tab',
          label: 'Modbus Write Test',
          disabled: false
        },
        {
          id: 'server1',
          type: 'modbus-server',
          z: 'tab1',
          hostname: '127.0.0.1',
          serverPort: String(port),
          responseDelay: 100,
          delayUnit: 'ms',
          coilsBufferSize: 10000,
          holdingBufferSize: 10000,
          inputBufferSize: 10000,
          discreteBufferSize: 10000,
          showErrors: false
        },
        {
          id: 'client1',
          type: 'modbus-client',
          name: 'Modbus Write Client',
          clienttype: 'tcp',
          tcpHost: '127.0.0.1',
          tcpPort: String(port),
          unit_id: '1',
          commandDelay: '1',
          clientTimeout: '1000',
          reconnectOnTimeout: false
        },
        {
          id: 'write1',
          type: 'modbus-write',
          z: 'tab1',
          name: 'ModbusTestWrite',
          showStatusActivities: false,
          showErrors: true,
          unitid: '',
          dataType: 'Coil',
          adr: '0',
          quantity: '1',
          server: 'client1',
          emptyMsgOnFail: false,
          wires: [['helper1'], ['helper2']]
        },
        {
          id: 'helper1',
          type: 'helper',
          z: 'tab1',
          wires: []
        },
        {
          id: 'helper2',
          type: 'helper',
          z: 'tab1',
          wires: []
        }
      ]

      await deployModbusFlow(helper, allModbusTestNodes, flow)

      const writeNode = getTestNode(helper, 'write1')
      assert(writeNode !== null, 'write node should be deployed')
      assert.strictEqual(writeNode.name, 'ModbusTestWrite')

      writeNode.receive({ payload: true })
      writeNode.receive({ payload: false })
      await new Promise((resolve) => setTimeout(resolve, 500))
    })
  })

  describe('Posts', function () {
    it('should give status 200 site for serial ports list', function (done) {
      helper.load(allModbusTestNodes, [{ id: 'bootstrap-only', type: 'helper', wires: [] }], function () {
        setTimeout(function () {
          helper.request().get('/modbus/serial/ports').expect(200).end(done)
        }, 500)
      })
    })
  })
})
