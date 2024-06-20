const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  testFlexGetterWithInjectFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'de0ae33276a95fc3',
      type: 'tab',
      label: 'Flex Getter With Inject Flow',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '445454e4.968564',
      type: 'modbus-server',
      z: 'de0ae33276a95fc3',
      name: '',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '8505',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 340,
      y: 260,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: 'bc5a61b6.a3972',
      type: 'modbus-flex-getter',
      z: 'de0ae33276a95fc3',
      name: '',
      showStatusActivities: true,
      showErrors: false,
      logIOActivities: false,
      server: '92e7bf63.2efd7',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 350,
      y: 160,
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
      z: 'de0ae33276a95fc3',
      name: '',
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 810,
      y: 160,
      wires: []
    },
    {
      id: 'fda9ed0f.c27278',
      type: 'inject',
      z: 'de0ae33276a95fc3',
      name: 'Flex Inject',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          vt: 'str'
        }
      ],
      repeat: '0.1',
      crontab: '',
      once: true,
      onceDelay: 0.1,
      topic: '',
      payload: '{"value":0,"fc":1,"unitid":1,"address":0,"quantity":1}',
      payloadType: 'json',
      x: 130,
      y: 160,
      wires: [
        [
          'bc5a61b6.a3972'
        ]
      ]
    },
    {
      id: '92e7bf63.2efd7',
      type: 'modbus-client',
      name: 'ModbusServer',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: true,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '8505',
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

  testFlexGetterWithInjectAndDelayFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "5b26a23d.a8a06c",
          "type": "tab",
          "label": "Test FlexGetter Delay",
          "disabled": false,
          "info": ""
      },
      {
          "id": "6293ed5b.e22d6c",
          "type": "inject",
          "z": "5b26a23d.a8a06c",
          "name": "Get flexible!",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "vt": "str"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "0",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 149,
          "y": 204,
          "wires": [
              [
                  "391d65b9.85b07a",
                  "bf1f319d3fcfb696"
              ]
          ]
      },
      {
          "id": "391d65b9.85b07a",
          "type": "function",
          "z": "5b26a23d.a8a06c",
          "name": "Read 0-9 on Unit 1 FC3",
          "func": "msg.payload = { \n    input: msg.payload, \n    'fc': 3, \n    'unitid': 1, \n    'address': 0 , \n    'quantity': 10 \n}\nreturn msg;",
          "outputs": 1,
          "timeout": "",
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 449,
          "y": 281,
          "wires": [
              [
                  "823b8c53.ee14b8",
                  "abedbb9eb9f5abc3"
              ]
          ]
      },
      {
          "id": "823b8c53.ee14b8",
          "type": "modbus-flex-getter",
          "z": "5b26a23d.a8a06c",
          "name": "",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "352955bb.be6e6a",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": true,
          "keepMsgProperties": false,
          "delayOnStart": true,
          "startDelayTime": "3",
          "x": 695,
          "y": 281,
          "wires": [
              [
                  "23156c303a59c400"
              ],
              []
          ]
      },
      {
          "id": "10467337b76b6677",
          "type": "inject",
          "z": "5b26a23d.a8a06c",
          "name": "Get flexible!",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "vt": "str"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "1",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 148,
          "y": 241,
          "wires": [
              [
                  "391d65b9.85b07a",
                  "bf1f319d3fcfb696"
              ]
          ]
      },
      {
          "id": "5fb123c57a372cc8",
          "type": "inject",
          "z": "5b26a23d.a8a06c",
          "name": "Get flexible!",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "vt": "str"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "2",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 148,
          "y": 278,
          "wires": [
              [
                  "391d65b9.85b07a",
                  "bf1f319d3fcfb696"
              ]
          ]
      },
      {
          "id": "167addbdbeac2992",
          "type": "inject",
          "z": "5b26a23d.a8a06c",
          "name": "Get flexible!",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "vt": "str"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "3",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 147,
          "y": 315,
          "wires": [
              [
                  "391d65b9.85b07a",
                  "bf1f319d3fcfb696"
              ]
          ]
      },
      {
          "id": "31eac50edf56c56f",
          "type": "inject",
          "z": "5b26a23d.a8a06c",
          "name": "Get flexible!",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "vt": "str"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "4",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 145,
          "y": 349,
          "wires": [
              [
                  "391d65b9.85b07a",
                  "bf1f319d3fcfb696"
              ]
          ]
      },
      {
          "id": "7e8ddc253adc0bd6",
          "type": "modbus-server",
          "z": "5b26a23d.a8a06c",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "14502",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "x": 520,
          "y": 80,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "23156c303a59c400",
          "type": "helper",
          "z": "5b26a23d.a8a06c",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 930,
          "y": 280,
          "wires": []
      },
      {
          "id": "bf1f319d3fcfb696",
          "type": "helper",
          "z": "5b26a23d.a8a06c",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 410,
          "y": 220,
          "wires": []
      },
      {
          "id": "abedbb9eb9f5abc3",
          "type": "helper",
          "z": "5b26a23d.a8a06c",
          "name": "helper 3",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 660,
          "y": 220,
          "wires": []
      },
      {
          "id": "352955bb.be6e6a",
          "type": "modbus-client",
          "z": "5b26a23d.a8a06c",
          "name": "Modbus Server",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "14502",
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
          "clientTimeout": "1000",
          "reconnectOnTimeout": true,
          "reconnectTimeout": "2000",
          "parallelUnitIdsAllowed": true
      }
  ]),

  testFlexGetterFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '8c99fb2559058c40',
      type: 'tab',
      label: 'Flex Getter Flow',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '445454e4.968564',
      type: 'modbus-server',
      z: '8c99fb2559058c40',
      name: '',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '7605',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 620,
      y: 380,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: 'bc5a61b6.a3972',
      type: 'modbus-flex-getter',
      z: '8c99fb2559058c40',
      name: '',
      showStatusActivities: true,
      showErrors: false,
      logIOActivities: false,
      server: '92e7bf63.2efd7',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 550,
      y: 280,
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
      z: '8c99fb2559058c40',
      name: '',
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 870,
      y: 280,
      wires: []
    },
    {
      id: '92e7bf63.2efd7',
      type: 'modbus-client',
      name: 'ModbusServer',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: true,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '7605',
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

  testNodeWithoutClientFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'eaaccec04c6e2e09',
      type: 'tab',
      label: 'Simple Node Without Client',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'bc5a61b6.a3972',
      type: 'modbus-flex-getter',
      z: 'eaaccec04c6e2e09',
      name: 'modbusFlexGetter',
      showStatusActivities: false,
      showErrors: false,
      logIOActivities: false,
      server: '',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 430,
      y: 300,
      wires: [
        [],
        []
      ]
    }
  ]),

  testNodeShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '9104d7db3af9d632',
      type: 'tab',
      label: 'Node Should Be Loaded',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'bc5a61b6.a3972',
      type: 'modbus-flex-getter',
      z: '9104d7db3af9d632',
      name: 'modbusFlexGetter',
      showStatusActivities: false,
      showErrors: false,
      logIOActivities: false,
      server: '92e7bf63.2efd7',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 510,
      y: 260,
      wires: [
        [],
        []
      ]
    },
    {
      id: '996023fe.ea04b',
      type: 'modbus-server',
      z: '9104d7db3af9d632',
      name: 'modbusServer',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '7505',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 520,
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
      id: '92e7bf63.2efd7',
      type: 'modbus-client',
      name: 'ModbusServer',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: true,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '7505',
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

  testFlexGetterShowWarningsWithoutClientFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'de0ae33276a95fc3',
      type: 'tab',
      label: 'Flex Getter Show Warnings Without Client Flow',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'bc5a61b6.a3972',
      type: 'modbus-flex-getter',
      z: 'de0ae33276a95fc3',
      name: '',
      showStatusActivities: false,
      showErrors: false,
      showWarnings: true,
      showNotReadyForInput: true,
      logIOActivities: false,
      server: '',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      delayOnStart: false,
      startDelayTime: '',
      x: 490,
      y: 160,
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
      z: 'de0ae33276a95fc3',
      name: '',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 810,
      y: 160,
      wires: []
    },
    {
      id: 'fda9ed0f.c27278',
      type: 'inject',
      z: 'de0ae33276a95fc3',
      name: 'Flex Inject',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          vt: 'str'
        }
      ],
      repeat: '5',
      crontab: '',
      once: true,
      onceDelay: 0.1,
      topic: '',
      payload: '{"value":0,"fc":1,"unitid":1,"address":0,"quantity":1}',
      payloadType: 'json',
      x: 250,
      y: 160,
      wires: [
        [
          'bc5a61b6.a3972'
        ]
      ]
    }
  ]),

  testFlexGetterDelayFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'de0ae33276a95fc3',
      type: 'tab',
      label: 'Flex Getter Delay Flow',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'bc5a61b6.a3972',
      type: 'modbus-flex-getter',
      z: 'de0ae33276a95fc3',
      name: 'Default Delay',
      showStatusActivities: false,
      showErrors: false,
      showWarnings: true,
      showNotReadyForInput: true,
      logIOActivities: false,
      server: '0ef5416d359bb2c0',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      delayOnStart: true,
      startDelayTime: '50',
      x: 500,
      y: 100,
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
      z: 'de0ae33276a95fc3',
      name: 'helper Delay',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 750,
      y: 100,
      wires: []
    },
    {
      id: 'fda9ed0f.c27278',
      type: 'inject',
      z: 'de0ae33276a95fc3',
      name: 'No Delay Inject',
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
      onceDelay: 0.1,
      topic: '',
      payload: '{"value":0,"fc":1,"unitid":1,"address":0,"quantity":1}',
      payloadType: 'json',
      x: 260,
      y: 160,
      wires: [
        [
          '9c23c2ed4bcdb172',
          'bc5a61b6.a3972'
        ]
      ]
    },
    {
      id: '8799401a51902bf0',
      type: 'modbus-server',
      z: 'de0ae33276a95fc3',
      name: '',
      logEnabled: false,
      hostname: '127.0.0.1',
      serverPort: '50502',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 500,
      y: 340,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '9c23c2ed4bcdb172',
      type: 'modbus-flex-getter',
      z: 'de0ae33276a95fc3',
      name: 'No Delay',
      showStatusActivities: false,
      showErrors: false,
      showWarnings: true,
      showNotReadyForInput: true,
      logIOActivities: false,
      server: '0ef5416d359bb2c0',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      delayOnStart: false,
      startDelayTime: '',
      x: 480,
      y: 200,
      wires: [
        [
          '2212d9d5b627792a'
        ],
        []
      ]
    },
    {
      id: '2212d9d5b627792a',
      type: 'helper',
      z: 'de0ae33276a95fc3',
      name: 'helper No Delay',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 760,
      y: 200,
      wires: []
    },
    {
      id: '0ef5416d359bb2c0',
      type: 'modbus-client',
      name: '',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '50502',
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
  ])
}
