const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testModbusFlexWriteFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "19c155142e97db4c",
          "type": "tab",
          "label": "Flow 1",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "62f832b5f8ad8fbd",
          "type": "modbus-server",
          "z": "19c155142e97db4c",
          "name": "modbus-server",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "7579",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "x": 560,
          "y": 260,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "197f2c45eda0f469",
          "type": "inject",
          "z": "19c155142e97db4c",
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
          "repeat": "",
          "crontab": "",
          "once": false,
          "onceDelay": 0.1,
          "topic": "",
          "payload": "{\"value\":\"msg.payload\",\"fc\":15,\"unitid\":1,\"address\":0,\"quantity\":10}",
          "payloadType": "json",
          "x": 250,
          "y": 300,
          "wires": [
              [
                  "dcb6fa4b3549ae4f"
              ]
          ]
      },
      {
          "id": "dcb6fa4b3549ae4f",
          "type": "modbus-flex-write",
          "z": "19c155142e97db4c",
          "name": "flex write",
          "showStatusActivities": true,
          "showErrors": false,
          "showWarnings": true,
          "server": "80aeec4c.0cb9e8",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 400,
          "y": 400,
          "wires": [
              [
                  "acf8a55cbf80be59"
              ],
              []
          ]
      },
      {
          "id": "acf8a55cbf80be59",
          "type": "helper",
          "z": "19c155142e97db4c",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 640,
          "y": 400,
          "wires": []
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
          "tcpPort": "7579",
          "tcpType": "DEFAULT",
          "serialPort": "/dev/ttyUSB",
          "serialType": "RTU-BUFFERD",
          "serialBaudrate": "9600",
          "serialDatabits": "8",
          "serialStopbits": "1",
          "serialParity": "none",
          "serialConnectionDelay": "100",
          "serialAsciiResponseStartDelimiter": "",
          "unit_id": 1,
          "commandDelay": 1,
          "clientTimeout": 100,
          "reconnectOnTimeout": false,
          "reconnectTimeout": 200,
          "parallelUnitIdsAllowed": true,
          "showErrors": false,
          "showWarnings": true,
          "showLogs": true
      }
  ]
  ),
  testWriteParametersFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "109c8cab3679c714",
          "type": "tab",
          "label": "Write Parameters",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "c2f3c1d0.3d0b1",
          "type": "catch",
          "z": "109c8cab3679c714",
          "name": "",
          "scope": null,
          "uncaught": false,
          "x": 240,
          "y": 220,
          "wires": [
              [
                  "h2"
              ]
          ]
      },
      {
          "id": "h2",
          "type": "helper",
          "z": "109c8cab3679c714",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 450,
          "y": 220,
          "wires": []
      },
      {
          "id": "178284ea.5055ab",
          "type": "modbus-server",
          "z": "109c8cab3679c714",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "7504",
          "responseDelay": "50",
          "delayUnit": "ms",
          "coilsBufferSize": 1024,
          "holdingBufferSize": 1024,
          "inputBufferSize": 1024,
          "discreteBufferSize": 1024,
          "showErrors": false,
          "x": 440,
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
          "id": "82fe7fe4.7b7bc8",
          "type": "modbus-flex-write",
          "z": "109c8cab3679c714",
          "name": "",
          "showStatusActivities": false,
          "showErrors": true,
          "server": "80aeec4c.0cb9e8",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "x": 430,
          "y": 400,
          "wires": [
              [
                  "h1"
              ],
              []
          ]
      },
      {
          "id": "h1",
          "type": "helper",
          "z": "109c8cab3679c714",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 710,
          "y": 380,
          "wires": []
      },
      {
          "id": "9d3d244.cb410d8",
          "type": "function",
          "z": "109c8cab3679c714",
          "name": "Write 0-9 on Unit 1 FC15",
          "func": "msg.payload = { value: msg.payload, 'fc': 15, 'unitid': 1, 'address': 0, 'quantity': 10 };\nreturn msg;",
          "outputs": 1,
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 150,
          "y": 400,
          "wires": [
              [
                  "82fe7fe4.7b7bc8"
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
          "tcpPort": "7504",
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
          "parallelUnitIdsAllowed": true
      }
  ]),

  testShouldBeLoadedWithoutClientFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'bcc1d949ece5bafb',
      type: 'tab',
      label: 'Should Be Loaded Without Client',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'c02b6d1.d419c1',
      type: 'modbus-flex-write',
      z: 'bcc1d949ece5bafb',
      name: 'modbusFlexWrite',
      showStatusActivities: true,
      showErrors: false,
      server: '',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 330,
      y: 220,
      wires: [
        [],
        []
      ]
    }
  ]),

  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '6bf0bacefe22d706',
      type: 'tab',
      label: 'Should Be Loaded',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'c02b6d1.d419c1',
      type: 'modbus-flex-write',
      z: '6bf0bacefe22d706',
      name: 'modbusFlexWrite',
      showStatusActivities: true,
      showErrors: false,
      server: '80aeec4c.0cb9e8',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 190,
      y: 160,
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
      tcpHost: '127.0.0.1',
      tcpPort: '6504',
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
      reconnectTimeout: 200,
      parallelUnitIdsAllowed: true
    }
  ]),

  testInjectAndWriteShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '61d6e75ed696aa97',
      type: 'tab',
      label: 'Inject And Write',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '178284ea.5055ab',
      type: 'modbus-server',
      z: '61d6e75ed696aa97',
      name: '',
      logEnabled: false,
      hostname: '',
      serverPort: '7504',
      responseDelay: '50',
      delayUnit: 'ms',
      coilsBufferSize: 1024,
      holdingBufferSize: 1024,
      inputBufferSize: 1024,
      discreteBufferSize: 1024,
      showErrors: false,
      x: 400,
      y: 220,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '82fe7fe4.7b7bc8',
      type: 'modbus-flex-write',
      z: '61d6e75ed696aa97',
      name: '',
      showStatusActivities: false,
      showErrors: false,
      server: '80aeec4c.0cb9e8',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 630,
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
      z: '61d6e75ed696aa97',
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
      id: 'a7908874.150ac',
      type: 'inject',
      z: '61d6e75ed696aa97',
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
      repeat: '0.5',
      crontab: '',
      once: true,
      onceDelay: '0.1',
      topic: '',
      payload: '[1,2,3,4,5,6,7,8,9,10]',
      payloadType: 'json',
      x: 120,
      y: 100,
      wires: [
        [
          '9d3d244.cb410d8'
        ]
      ]
    },
    {
      id: '9d3d244.cb410d8',
      type: 'function',
      z: '61d6e75ed696aa97',
      name: 'Write 0-9 on Unit 1 FC15',
      func: 'msg.payload = { value: msg.payload, \'fc\': 15, \'unitid\': 1, \'address\': 0 , \'quantity\': 10 };\nreturn msg;',
      outputs: 1,
      noerr: 0,
      initialize: '',
      finalize: '',
      libs: [],
      x: 390,
      y: 100,
      wires: [
        [
          '82fe7fe4.7b7bc8'
        ]
      ]
    },
    {
      id: '80aeec4c.0cb9e8',
      type: 'modbus-client',
      name: 'Modbus Server',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '7504',
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
