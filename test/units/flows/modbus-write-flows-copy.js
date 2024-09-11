const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testWriteCycleFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'df9950e9527cceaa',
      type: 'tab',
      label: 'Test Write Cycles Flow',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '445454e4.968564',
      type: 'modbus-server',
      z: 'df9950e9527cceaa',
      name: '',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '7522',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 220,
      y: 80,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '1ed908da.427ecf',
      type: 'modbus-write',
      z: 'df9950e9527cceaa',
      name: 'Write Reset FC5',
      showStatusActivities: true,
      showErrors: false,
      unitid: '',
      dataType: 'Coil',
      adr: '64',
      quantity: '1',
      server: 'aef203cf.a23dc',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 380,
      y: 220,
      wires: [
        [
          'h1'
        ],
        []
      ]
    },
    {
      id: 'h1',
      type: 'helper',
      z: 'df9950e9527cceaa',
      name: '',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 590,
      y: 220,
      wires: []
    },
    {
      id: '16b7697e.2baa47',
      type: 'inject',
      z: 'df9950e9527cceaa',
      name: '',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          vt: 'str'
        }
      ],
      repeat: '2',
      crontab: '',
      once: false,
      onceDelay: '',
      topic: '',
      payload: 'true',
      payloadType: 'bool',
      x: 190,
      y: 260,
      wires: [
        [
          '1ed908da.427ecf'
        ]
      ]
    },
    {
      id: '5da6464f.441aa',
      type: 'inject',
      z: 'df9950e9527cceaa',
      name: '',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          vt: 'str'
        }
      ],
      repeat: '2',
      crontab: '',
      once: true,
      onceDelay: 0.1,
      topic: '',
      payload: 'false',
      payloadType: 'bool',
      x: 190,
      y: 180,
      wires: [
        [
          '1ed908da.427ecf'
        ]
      ]
    },
    {
      id: 'aef203cf.a23dc',
      type: 'modbus-client',
      z: 'df9950e9527cceaa',
      name: 'Modbus Server',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '7522',
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
      clientTimeout: '100',
      reconnectOnTimeout: false,
      reconnectTimeout: '200',
      parallelUnitIdsAllowed: true
    }
  ]),

  testWriteDelayFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'df9950e9527cceaa',
      type: 'tab',
      label: 'Test Write Delay Flow',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '445454e4.968564',
      type: 'modbus-server',
      z: 'df9950e9527cceaa',
      name: '',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '7522',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 220,
      y: 80,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '1ed908da.427ecf',
      type: 'modbus-write',
      z: 'df9950e9527cceaa',
      name: 'Write Reset FC5',
      showStatusActivities: true,
      showErrors: false,
      showWarnings: true,
      unitid: '',
      dataType: 'Coil',
      adr: '64',
      quantity: '1',
      server: 'aef203cf.a23dc',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      delayOnStart: true,
      startDelayTime: '1.5',
      x: 525,
      y: 247,
      wires: [
        [
          'h1'
        ],
        []
      ]
    },
    {
      id: 'h1',
      type: 'helper',
      z: 'df9950e9527cceaa',
      name: '',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'topic',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 708,
      y: 241,
      wires: []
    },
    {
      id: '16b7697e.2baa47',
      type: 'inject',
      z: 'df9950e9527cceaa',
      name: '',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          v: '',
          vt: 'date'
        }
      ],
      repeat: '',
      crontab: '',
      once: true,
      onceDelay: '0',
      topic: '',
      payload: 'true',
      payloadType: 'bool',
      x: 191,
      y: 152,
      wires: [
        [
          '1ed908da.427ecf'
        ]
      ]
    },
    {
      id: '5da6464f.441aa',
      type: 'inject',
      z: 'df9950e9527cceaa',
      name: '',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          v: '',
          vt: 'date'
        }
      ],
      repeat: '',
      crontab: '',
      once: true,
      onceDelay: '0.5',
      topic: '',
      payload: 'false',
      payloadType: 'bool',
      x: 190,
      y: 192,
      wires: [
        [
          '1ed908da.427ecf'
        ]
      ]
    },
    {
      id: 'a28094c461622420',
      type: 'inject',
      z: 'df9950e9527cceaa',
      name: '',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          v: '',
          vt: 'date'
        }
      ],
      repeat: '',
      crontab: '',
      once: true,
      onceDelay: '1',
      topic: '',
      payload: 'true',
      payloadType: 'bool',
      x: 189,
      y: 228,
      wires: [
        [
          '1ed908da.427ecf'
        ]
      ]
    },
    {
      id: 'd2f76deaa30e88d7',
      type: 'inject',
      z: 'df9950e9527cceaa',
      name: '',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          v: '',
          vt: 'date'
        }
      ],
      repeat: '',
      crontab: '',
      once: true,
      onceDelay: '1.5',
      topic: '',
      payload: 'false',
      payloadType: 'bool',
      x: 188,
      y: 268,
      wires: [
        [
          '1ed908da.427ecf'
        ]
      ]
    },
    {
      id: '2e25e1463f4b776a',
      type: 'inject',
      z: 'df9950e9527cceaa',
      name: '',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          v: '',
          vt: 'date'
        }
      ],
      repeat: '',
      crontab: '',
      once: true,
      onceDelay: '2',
      topic: '',
      payload: 'true',
      payloadType: 'bool',
      x: 189,
      y: 306,
      wires: [
        [
          '1ed908da.427ecf'
        ]
      ]
    },
    {
      id: 'bc7653c399bf0ae6',
      type: 'inject',
      z: 'df9950e9527cceaa',
      name: '',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          v: '',
          vt: 'date'
        }
      ],
      repeat: '',
      crontab: '',
      once: true,
      onceDelay: '2.5',
      topic: '',
      payload: 'false',
      payloadType: 'bool',
      x: 188,
      y: 346,
      wires: [
        [
          '1ed908da.427ecf'
        ]
      ]
    },
    {
      id: 'aef203cf.a23dc',
      type: 'modbus-client',
      z: 'df9950e9527cceaa',
      name: 'Modbus Server',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '7522',
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
      clientTimeout: '100',
      reconnectOnTimeout: false,
      reconnectTimeout: '200',
      parallelUnitIdsAllowed: true
    }
  ])
}
