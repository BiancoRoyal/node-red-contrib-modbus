const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  testFlowWritingWithoutInject: helperExtensions.cleanFlowPositionData([
    {
      id: 'e5faba87.571118',
      type: 'tab',
      label: 'Test Without Inject Modbus Write Flow',
      disabled: false,
      info: ''
    },
    {
      id: '1c02e4fb3dfc38ca',
      type: 'modbus-server',
      z: 'e5faba87.571118',
      name: '',
      logEnabled: false,
      hostname: '127.0.0.1',
      serverPort: '9509',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: true,
      x: 400,
      y: 140,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '409b03f21dcb23ad',
      type: 'modbus-write',
      z: 'e5faba87.571118',
      name: 'ModbusTestWrite',
      showStatusActivities: false,
      showErrors: true,
      unitid: '',
      dataType: 'Coil',
      adr: '0',
      quantity: '1',
      server: '354de6bb.6c3652',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 410,
      y: 260,
      wires: [
        [
          'fb82d89fd8474fcb',
          'efbeb2d3e0a2c2e5'
        ],
        [
          '773676ccc8e8a7b6',
          '60c9c06b341296ee'
        ]
      ]
    },
    {
      id: 'fb82d89fd8474fcb',
      type: 'helper',
      z: 'e5faba87.571118',
      active: true,
      x: 650,
      y: 220,
      wires: []
    },
    {
      id: '773676ccc8e8a7b6',
      type: 'helper',
      z: 'e5faba87.571118',
      active: true,
      x: 650,
      y: 380,
      wires: []
    },
    {
      id: 'efbeb2d3e0a2c2e5',
      type: 'modbus-response',
      z: 'e5faba87.571118',
      name: '',
      registerShowMax: 20,
      x: 670,
      y: 140,
      wires: []
    },
    {
      id: '60c9c06b341296ee',
      type: 'modbus-response',
      z: 'e5faba87.571118',
      name: '',
      registerShowMax: 20,
      x: 670,
      y: 300,
      wires: []
    },
    {
      id: '568deb7302488457',
      type: 'comment',
      z: 'e5faba87.571118',
      name: 'Modbus Server',
      info: 'These nodes are to write to the Modbus Server.',
      x: 400,
      y: 60,
      wires: []
    },
    {
      id: 'd35e7d42741869b7',
      type: 'comment',
      z: 'e5faba87.571118',
      name: 'Inject from Test emit',
      info: '',
      x: 210,
      y: 260,
      wires: []
    },
    {
      id: '354de6bb.6c3652',
      type: 'modbus-client',
      z: 'e5faba87.571118',
      name: 'ModbusTestTCPClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '9509',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'none',
      serialConnectionDelay: '100',
      serialAsciiResponseStartDelimiter: '',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '200',
      parallelUnitIdsAllowed: true
    }
  ]),

  testFlowWriting: helperExtensions.cleanFlowPositionData([
    {
      id: 'e5faba87.571118',
      type: 'tab',
      label: 'Test Modbus Write Flow',
      disabled: false,
      info: ''
    },
    {
      id: '1c02e4fb3dfc38ca',
      type: 'modbus-server',
      z: 'e5faba87.571118',
      name: '',
      logEnabled: false,
      hostname: '127.0.0.1',
      serverPort: '9508',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: true,
      x: 220,
      y: 140,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '409b03f21dcb23ad',
      type: 'modbus-write',
      z: 'e5faba87.571118',
      name: 'ModbusTestWrite',
      showStatusActivities: false,
      showErrors: true,
      unitid: '',
      dataType: 'Coil',
      adr: '0',
      quantity: '1',
      server: '354de6bb.6c3652',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 830,
      y: 300,
      wires: [
        [
          'fb82d89fd8474fcb',
          'efbeb2d3e0a2c2e5'
        ],
        [
          '773676ccc8e8a7b6',
          '60c9c06b341296ee'
        ]
      ]
    },
    {
      id: 'fb82d89fd8474fcb',
      type: 'helper',
      z: 'e5faba87.571118',
      active: true,
      x: 1070,
      y: 260,
      wires: []
    },
    {
      id: '773676ccc8e8a7b6',
      type: 'helper',
      z: 'e5faba87.571118',
      active: true,
      x: 1070,
      y: 420,
      wires: []
    },
    {
      id: 'efbeb2d3e0a2c2e5',
      type: 'modbus-response',
      z: 'e5faba87.571118',
      name: '',
      registerShowMax: 20,
      x: 1090,
      y: 180,
      wires: []
    },
    {
      id: '60c9c06b341296ee',
      type: 'modbus-response',
      z: 'e5faba87.571118',
      name: '',
      registerShowMax: 20,
      x: 1090,
      y: 340,
      wires: []
    },
    {
      id: '73e260bbf353c53a',
      type: 'inject',
      z: 'e5faba87.571118',
      name: 'Write multiple!',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          vt: 'str'
        }
      ],
      repeat: '',
      crontab: '',
      once: true,
      onceDelay: '0.5',
      topic: '',
      payload: '[1,2,3,4,5,6,7,8,9,10]',
      payloadType: 'json',
      x: 220,
      y: 240,
      wires: [
        [
          '67da7c91eb9f8e03'
        ]
      ]
    },
    {
      id: '67da7c91eb9f8e03',
      type: 'function',
      z: 'e5faba87.571118',
      name: 'Write 0-9 on Unit 1 FC15',
      func: 'msg.payload = { value: msg.payload, \'fc\': 15, \'unitid\': 1, \'address\': 0 , \'quantity\': 10 };\nreturn msg;',
      outputs: 1,
      noerr: 0,
      x: 530,
      y: 260,
      wires: [
        [
          '409b03f21dcb23ad'
        ]
      ]
    },
    {
      id: '33e51e558a1cc048',
      type: 'function',
      z: 'e5faba87.571118',
      name: 'Write 10-18 on Unit 1 FC15',
      func: 'msg.payload = { value: msg.payload, \'fc\': 15, \'unitid\': 1, \'address\': 10 , \'quantity\': 9 };\nreturn msg;',
      outputs: 1,
      noerr: 0,
      x: 520,
      y: 300,
      wires: [
        [
          '409b03f21dcb23ad'
        ]
      ]
    },
    {
      id: '4496d03fedaff6ac',
      type: 'inject',
      z: 'e5faba87.571118',
      name: 'Write single!',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          vt: 'str'
        }
      ],
      repeat: '',
      crontab: '',
      once: true,
      onceDelay: '1.5',
      topic: '',
      payload: 'true',
      payloadType: 'bool',
      x: 230,
      y: 360,
      wires: [
        [
          'ef9c1d238f589e8a'
        ]
      ]
    },
    {
      id: 'ef9c1d238f589e8a',
      type: 'function',
      z: 'e5faba87.571118',
      name: 'Write 10 on Unit 1 FC5',
      func: 'msg.payload = { value: msg.payload, \'fc\': 5, \'unitid\': 1, \'address\': 10 , \'quantity\': 1 };\nreturn msg;',
      outputs: 1,
      noerr: 0,
      x: 540,
      y: 340,
      wires: [
        [
          '409b03f21dcb23ad'
        ]
      ]
    },
    {
      id: '1363b715d3b11d7e',
      type: 'inject',
      z: 'e5faba87.571118',
      name: 'Write multiple!',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          vt: 'str'
        }
      ],
      repeat: '',
      crontab: '',
      once: true,
      onceDelay: '1',
      topic: '',
      payload: '[1,2,3,4,5,6,7,8,9]',
      payloadType: 'json',
      x: 220,
      y: 300,
      wires: [
        [
          '33e51e558a1cc048'
        ]
      ]
    },
    {
      id: '568deb7302488457',
      type: 'comment',
      z: 'e5faba87.571118',
      name: 'Modbus Server',
      info: 'These nodes are to write to the Modbus Server.',
      x: 220,
      y: 60,
      wires: []
    },
    {
      id: '354de6bb.6c3652',
      type: 'modbus-client',
      z: 'e5faba87.571118',
      name: 'ModbusTestTCPClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '9508',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'none',
      serialConnectionDelay: '100',
      serialAsciiResponseStartDelimiter: '',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '200',
      parallelUnitIdsAllowed: true
    }
  ])

}
