const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testWriteExampleFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "4cadf3686ac42701",
          "type": "tab",
          "label": "Test Simple Write Flow",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "e71050e54fc87ddf",
          "type": "modbus-write",
          "z": "4cadf3686ac42701",
          "name": "modbus write",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "1",
          "dataType": "HoldingRegister",
          "adr": "1",
          "quantity": "1",
          "server": "80aeec4c.0cb9e8",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 300,
          "y": 400,
          "wires": [
              [],
              [
                  "0a7f4fd9f16e6f09"
              ]
          ]
      },
      {
          "id": "0a7f4fd9f16e6f09",
          "type": "helper",
          "z": "4cadf3686ac42701",
          "name": "helper 3",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 640,
          "y": 460,
          "wires": []
      },
      {
          "id": "1f8a88af7698afee",
          "type": "modbus-server",
          "z": "4cadf3686ac42701",
          "name": "modbus server",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "7580",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "x": 280,
          "y": 300,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "80aeec4c.0cb9e8",
          "type": "modbus-client",
          "name": "Modbus Server",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "7580",
          "tcpType": "DEFAULT",
          "serialPort": "/dev/ttyUSB",
          "serialType": "RTU-BUFFERD",
          "serialBaudrate": "9600",
          "serialDatabits": "8",
          "serialStopbits": "1",
          "serialParity": "none",
          "serialConnectionDelay": "100",
          "serialAsciiResponseStartDelimiter": "",
          "unit_id": "1",
          "commandDelay": "1",
          "clientTimeout": "100",
          "reconnectOnTimeout": false,
          "reconnectTimeout": "200",
          "parallelUnitIdsAllowed": true,
          "showErrors": false,
          "showWarnings": true,
          "showLogs": true
      }
  ]
  ),
  testSimpleWriteFlow: helperExtensions.cleanFlowPositionData(
    [
      {
        "id": "56859c3a72fde2a9",
        "type": "tab",
        "label": "Test Simple Write Flow",
        "disabled": false,
        "info": "",
        "env": []
      },
      {
        "id": "49d48c465bed0677",
        "type": "modbus-server",
        "z": "56859c3a72fde2a9",
        "name": "",
        "logEnabled": false,
        "hostname": "127.0.0.1",
        "serverPort": "7512",
        "responseDelay": 100,
        "delayUnit": "ms",
        "coilsBufferSize": 10000,
        "holdingBufferSize": 10000,
        "inputBufferSize": 10000,
        "discreteBufferSize": 10000,
        "showErrors": false,
        "x": 220,
        "y": 100,
        "wires": [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        "id": "258dc103f99d2f2e",
        "type": "modbus-write",
        "z": "56859c3a72fde2a9",
        "name": "",
        "showStatusActivities": false,
        "showErrors": false,
        "showWarnings": true,
        "unitid": "1",
        "dataType": "Coil",
        "adr": "10",
        "quantity": "1",
        "server": "80aeec4c.0cb9e8",
        "emptyMsgOnFail": false,
        "keepMsgProperties": false,
        "delayOnStart": false,
        "startDelayTime": "",
        "x": 540,
        "y": 220,
        "wires": [
          [
            "f780a7d088ac2b22"
          ],
          [
            "7dc3bdb75f5a590d"
          ]
        ]
      },
      {
        "id": "f780a7d088ac2b22",
        "type": "helper",
        "z": "56859c3a72fde2a9",
        "name": "helper 1",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 740,
        "y": 200,
        "wires": []
      },
      {
        "id": "7dc3bdb75f5a590d",
        "type": "helper",
        "z": "56859c3a72fde2a9",
        "name": "helper 2",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 750,
        "y": 240,
        "wires": []
      },
      {
        "id": "395c28cb84e084a4",
        "type": "inject",
        "z": "56859c3a72fde2a9",
        "name": "",
        "props": [
          {
            "p": "payload"
          },
          {
            "p": "topic",
            "vt": "str"
          }
        ],
        "repeat": "0.2",
        "crontab": "",
        "once": true,
        "onceDelay": "1",
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 170,
        "y": 220,
        "wires": [
          [
            "8edecf59f1950e6c"
          ]
        ]
      },
      {
        "id": "8edecf59f1950e6c",
        "type": "function",
        "z": "56859c3a72fde2a9",
        "name": "function 1",
        "func": "msg.payload = [1,0,1,0,1,0,1,0,1,0]\nreturn msg;",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 340,
        "y": 220,
        "wires": [
          [
            "258dc103f99d2f2e"
          ]
        ]
      },
      {
        "id": "80aeec4c.0cb9e8",
        "type": "modbus-client",
        "name": "Modbus Server",
        "clienttype": "tcp",
        "bufferCommands": true,
        "stateLogEnabled": false,
        "queueLogEnabled": false,
        "failureLogEnabled": false,
        "tcpHost": "127.0.0.1",
        "tcpPort": "7512",
        "tcpType": "DEFAULT",
        "serialPort": "/dev/ttyUSB",
        "serialType": "RTU-BUFFERD",
        "serialBaudrate": "9600",
        "serialDatabits": "8",
        "serialStopbits": "1",
        "serialParity": "none",
        "serialConnectionDelay": "100",
        "serialAsciiResponseStartDelimiter": "",
        "unit_id": "1",
        "commandDelay": "1",
        "clientTimeout": "100",
        "reconnectOnTimeout": false,
        "reconnectTimeout": "200",
        "parallelUnitIdsAllowed": true,
        "showErrors": false,
        "showWarnings": true,
        "showLogs": true
      }
    ]
    ),

  testWriteFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '6fc7552dec67377b',
      type: 'tab',
      label: 'Test Write Flow',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'e54529b9.952ea8',
      type: 'modbus-server',
      z: '6fc7552dec67377b',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '',
      serverPort: 8502,
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 1024,
      holdingBufferSize: 1024,
      inputBufferSize: 1024,
      discreteBufferSize: '1024',
      showErrors: false,
      x: 200,
      y: 100,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '8ad2951c.2df708',
      type: 'modbus-write',
      z: '6fc7552dec67377b',
      name: 'modbusWrite',
      showStatusActivities: false,
      showErrors: false,
      showWarnings: true,
      unitid: '',
      dataType: 'HoldingRegister',
      adr: '0',
      quantity: '1',
      server: '1f258d73662d6493',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      delayOnStart: false,
      startDelayTime: '',
      x: 400,
      y: 220,
      wires: [
        [
          'f75a87de7256906f'
        ],
        [
          '0fd19d9e756cbf0a'
        ]
      ]
    },
    {
      id: '67dded7e.025904',
      type: 'inject',
      z: '6fc7552dec67377b',
      name: 'injectTrue',
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
      once: false,
      onceDelay: '',
      topic: '',
      payload: 'true',
      payloadType: 'bool',
      x: 200,
      y: 220,
      wires: [
        [
          '8ad2951c.2df708'
        ]
      ]
    },
    {
      id: 'f75a87de7256906f',
      type: 'helper',
      z: '6fc7552dec67377b',
      name: 'helper 1',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 620,
      y: 200,
      wires: []
    },
    {
      id: '0fd19d9e756cbf0a',
      type: 'helper',
      z: '6fc7552dec67377b',
      name: 'helper 2',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 620,
      y: 260,
      wires: []
    },
    {
      id: '1f258d73662d6493',
      type: 'modbus-client',
      z: '6fc7552dec67377b',
      name: 'modbusClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '8502',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'none',
      serialConnectionDelay: '100',
      serialAsciiResponseStartDelimiter: '0x3A',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true
    }
  ]),

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
