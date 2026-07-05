/**
 * Real Flow Smoke Tests for Modbus using node-red-node-test-helper
 * Verifies that all node types load correctly in a combined flow.
 * Full read/write integration is covered by test/e2e/modbus-complete-e2e.test.js.
 */

'use strict'

const helper = require('node-red-node-test-helper')
const { getPort } = require('../helper/test-helper-extensions')

// Load all required nodes
const clientNode = require('../../src/modbus-client')
const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')
const readNode = require('../../src/modbus-read')
const writeNode = require('../../src/modbus-write')
const getterNode = require('../../src/modbus-getter')
const flexWriteNode = require('../../src/modbus-flex-write')

const testNodes = [clientNode, serverNode, readNode, writeNode, getterNode, flexWriteNode]

helper.init(require.resolve('node-red'))

describe('Modbus Real Flow Tests', function () {
  this.timeout(5000)

  beforeEach(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    helper.unload()
      .then(() => helper.stopServer(done))
      .catch(() => helper.stopServer(done))
  })

  it('should load read-coils flow without crash', async function () {
    const port = await getPort()

    const flow = [
      {
        id: 'srv-read-coils',
        type: 'modbus-server',
        name: 'Test Server',
        serverPort: port,
        serverAddress: '127.0.0.1',
        responseDelay: 10,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        discreteBufferSize: 1024,
        showErrors: false,
        wires: []
      },
      {
        id: 'cli-read-coils',
        type: 'modbus-client',
        name: 'Test Client',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
        queueLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: port,
        tcpType: 'DEFAULT',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        unit_id: '1',
        commandDelay: '10',
        clientTimeout: '1000',
        reconnectOnTimeout: false,
        reconnectTimeout: '200',
        wires: []
      },
      {
        id: 'rd-read-coils',
        type: 'modbus-read',
        name: 'Read Coils',
        topic: '',
        showStatusActivities: false,
        logIOActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '8',
        rate: '10',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: 'cli-read-coils',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        wires: [['hlp-read-coils'], []]
      },
      {
        id: 'hlp-read-coils',
        type: 'helper',
        wires: []
      }
    ]

    await helper.load(testNodes, flow)

    const serverN = helper.getNode('srv-read-coils')
    const clientN = helper.getNode('cli-read-coils')
    const readN = helper.getNode('rd-read-coils')
    const helperN = helper.getNode('hlp-read-coils')

    serverN.should.have.property('type', 'modbus-server')
    clientN.should.have.property('type', 'modbus-client')
    readN.should.have.property('type', 'modbus-read')
    helperN.should.not.be.null()
  })

  it('should load write-and-read-registers flow without crash', async function () {
    const port = await getPort()

    const flow = [
      {
        id: 'server2',
        type: 'modbus-server',
        name: 'Server',
        serverPort: port,
        serverAddress: '127.0.0.1',
        responseDelay: 10,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        discreteBufferSize: 1024,
        showErrors: false,
        wires: []
      },
      {
        id: 'client2',
        type: 'modbus-client',
        name: 'Client',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
        queueLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: port,
        tcpType: 'DEFAULT',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        unit_id: '1',
        commandDelay: '10',
        clientTimeout: '1000',
        reconnectOnTimeout: false,
        reconnectTimeout: '200',
        wires: []
      },
      {
        id: 'write1',
        type: 'modbus-write',
        name: 'Write Registers',
        showStatusActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'MHoldingRegisters',
        adr: '0',
        quantity: '4',
        server: 'client2',
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        wires: [['read1'], []]
      },
      {
        id: 'read1',
        type: 'modbus-read',
        name: 'Read Registers',
        topic: '',
        showStatusActivities: false,
        logIOActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '4',
        rate: '10',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: 'client2',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        wires: [['helper1'], []]
      },
      {
        id: 'helper1',
        type: 'helper',
        wires: []
      }
    ]

    await helper.load(testNodes, flow)

    const serverN = helper.getNode('server2')
    const clientN = helper.getNode('client2')
    const writeN = helper.getNode('write1')
    const readN = helper.getNode('read1')

    serverN.should.have.property('type', 'modbus-server')
    clientN.should.have.property('type', 'modbus-client')
    writeN.should.have.property('type', 'modbus-write')
    readN.should.have.property('type', 'modbus-read')
  })

  it('should load flex-write flow without crash', async function () {
    const port = await getPort()

    const flow = [
      {
        id: 'server3',
        type: 'modbus-server',
        name: 'Server',
        serverPort: port,
        serverAddress: '127.0.0.1',
        responseDelay: 10,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        discreteBufferSize: 1024,
        showErrors: false,
        wires: []
      },
      {
        id: 'client3',
        type: 'modbus-client',
        name: 'Client',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
        queueLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: port,
        tcpType: 'DEFAULT',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        unit_id: '1',
        commandDelay: '10',
        clientTimeout: '1000',
        reconnectOnTimeout: false,
        reconnectTimeout: '200',
        wires: []
      },
      {
        id: 'flexwrite1',
        type: 'modbus-flex-write',
        name: 'Flex Write',
        showStatusActivities: false,
        showErrors: false,
        server: 'client3',
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        wires: [['helper2'], []]
      },
      {
        id: 'helper2',
        type: 'helper',
        wires: []
      }
    ]

    await helper.load(testNodes, flow)

    const serverN = helper.getNode('server3')
    const clientN = helper.getNode('client3')
    const flexWriteN = helper.getNode('flexwrite1')

    serverN.should.have.property('type', 'modbus-server')
    clientN.should.have.property('type', 'modbus-client')
    flexWriteN.should.have.property('type', 'modbus-flex-write')
  })

  it('should load getter flow without crash', async function () {
    const port = await getPort()

    const flow = [
      {
        id: 'server4',
        type: 'modbus-server',
        name: 'Server',
        serverPort: port,
        serverAddress: '127.0.0.1',
        responseDelay: 10,
        delayUnit: 'ms',
        coilsBufferSize: 1024,
        holdingBufferSize: 1024,
        inputBufferSize: 1024,
        discreteBufferSize: 1024,
        showErrors: false,
        wires: []
      },
      {
        id: 'client4',
        type: 'modbus-client',
        name: 'Client',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
        queueLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: port,
        tcpType: 'DEFAULT',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        unit_id: '1',
        commandDelay: '10',
        clientTimeout: '1000',
        reconnectOnTimeout: false,
        reconnectTimeout: '200',
        wires: []
      },
      {
        id: 'getter1',
        type: 'modbus-getter',
        name: 'Getter',
        showStatusActivities: false,
        showErrors: false,
        logIOActivities: false,
        unitid: '',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '10',
        server: 'client4',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        wires: [['helper3'], []]
      },
      {
        id: 'helper3',
        type: 'helper',
        wires: []
      }
    ]

    await helper.load(testNodes, flow)

    const serverN = helper.getNode('server4')
    const clientN = helper.getNode('client4')
    const getterN = helper.getNode('getter1')

    serverN.should.have.property('type', 'modbus-server')
    clientN.should.have.property('type', 'modbus-client')
    getterN.should.have.property('type', 'modbus-getter')
  })
})
