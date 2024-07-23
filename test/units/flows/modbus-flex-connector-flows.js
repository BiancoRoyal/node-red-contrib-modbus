const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      "id": "cb3ef46652ca069f",
      "type": "tab",
      "label": "Flex-Connector No Server",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "40ddaabb.fd44d4",
      "type": "modbus-flex-connector",
      "z": "cb3ef46652ca069f",
      "name": "FlexConnector",
      "maxReconnectsPerMinute": 4,
      "emptyQueue": true,
      "showStatusActivities": true,
      "showErrors": false,
      "server": "2a253153.fae3ce",
      "emptyMsgOnFail": false,
      "configMsgOnChange": false,
      "x": 520,
      "y": 120,
      "wires": [
        []
      ]
    },
    {
      "id": "2a253153.fae3ce",
      "type": "modbus-client",
      "name": "",
      "clienttype": "tcp",
      "bufferCommands": true,
      "stateLogEnabled": false,
      "queueLogEnabled": false,
      "failureLogEnabled": false,
      "tcpHost": "127.0.0.1",
      "tcpPort": "11522",
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
      "commandDelay": "100",
      "clientTimeout": "100",
      "reconnectOnTimeout": true,
      "reconnectTimeout": "2000",
      "parallelUnitIdsAllowed": true,
      "showErrors": false,
      "showWarnings": false,
      "showLogs": false
    }
  ]),

  testShouldChangeTcpPortFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '6526da2265adb5f1',
      type: 'tab',
      label: 'Should Change TCP Port',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '445454e4.968564',
      type: 'modbus-server',
      z: '6526da2265adb5f1',
      name: '',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '8522',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 400,
      y: 240,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '40ddaabb.fd44d4',
      type: 'modbus-flex-connector',
      z: '6526da2265adb5f1',
      name: 'FlexConnector',
      maxReconnectsPerMinute: 4,
      emptyQueue: true,
      showStatusActivities: false,
      showErrors: false,
      server: '2a253153.fae3ce',
      x: 480,
      y: 400,
      wires: [
        []
      ]
    },
    {
      id: '2a253153.fae3ce',
      type: 'modbus-client',
      name: '',
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
      commandDelay: '100',
      clientTimeout: '100',
      reconnectOnTimeout: true,
      reconnectTimeout: '200',
      parallelUnitIdsAllowed: true
    }
  ]),

  testShouldChangeSerialPortFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '316b8516b884d511',
      type: 'tab',
      label: 'Should Change Serial Port',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '40ddaabb.fd44d4',
      type: 'modbus-flex-connector',
      z: '316b8516b884d511',
      name: 'FlexConnector',
      maxReconnectsPerMinute: 4,
      emptyQueue: true,
      showStatusActivities: false,
      showErrors: false,
      server: '2a253153.fae3ef',
      x: 380,
      y: 240,
      wires: [
        []
      ]
    },
    {
      id: '2a253153.fae3ef',
      type: 'modbus-client',
      name: '',
      clienttype: 'serial',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '7522',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '0',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'none',
      serialConnectionDelay: '100',
      serialAsciiResponseStartDelimiter: '',
      unit_id: '1',
      commandDelay: '100',
      clientTimeout: '100',
      reconnectOnTimeout: true,
      reconnectTimeout: '200',
      parallelUnitIdsAllowed: true
    }
  ]),
  testFlowAsExpected: helperExtensions.cleanFlowPositionData(
    [
      {
        "id": "f24eb98786e83747",
        "type": "tab",
        "label": "Test Felx-Connector UnitId",
        "disabled": false,
        "info": "",
        "env": []
      },
      {
        "id": "ea7e082eac96bb8f",
        "type": "modbus-server",
        "z": "f24eb98786e83747",
        "name": "",
        "logEnabled": false,
        "hostname": "127.0.0.1",
        "serverPort": "10512",
        "responseDelay": 100,
        "delayUnit": "ms",
        "coilsBufferSize": 10000,
        "holdingBufferSize": 10000,
        "inputBufferSize": 10000,
        "discreteBufferSize": 10000,
        "showErrors": false,
        "showStatusActivities": false,
        "x": 345,
        "y": 80,
        "wires": [
          [],
          [],
          [],
          [],
          [
            "b04c7187f283f1a6"
          ]
        ],
        "l": false
      },
      {
        "id": "1b4644a214cfdec6",
        "type": "modbus-flex-connector",
        "z": "f24eb98786e83747",
        "name": "",
        "maxReconnectsPerMinute": 4,
        "emptyQueue": false,
        "showStatusActivities": true,
        "showErrors": true,
        "server": "115bd58ae573c942",
        "emptyMsgOnFail": true,
        "configMsgOnChange": false,
        "x": 610,
        "y": 220,
        "wires": [
          [
            "0b116c8f15c103bc"
          ]
        ]
      },
      {
        "id": "88ef999a1a2c4c5d",
        "type": "inject",
        "z": "f24eb98786e83747",
        "name": "Change for Unit-ID",
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
        "onceDelay": "0.5",
        "topic": "",
        "payload": "{\"connectorType\":\"TCP\",\"tcpHost\":\"127.0.0.1\",\"tcpPort\":\"10512\",\"unitId\":1}",
        "payloadType": "json",
        "x": 190,
        "y": 200,
        "wires": [
          [
            "1b4644a214cfdec6"
          ]
        ]
      },
      {
        "id": "0b116c8f15c103bc",
        "type": "helper",
        "z": "f24eb98786e83747",
        "name": "helper 1",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 860,
        "y": 220,
        "wires": []
      },
      {
        "id": "c7eb8fe4f9b1904a",
        "type": "inject",
        "z": "f24eb98786e83747",
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
        "payload": "1",
        "payloadType": "num",
        "x": 180,
        "y": 80,
        "wires": [
          [
            "ea7e082eac96bb8f"
          ]
        ]
      },
      {
        "id": "b04c7187f283f1a6",
        "type": "helper",
        "z": "f24eb98786e83747",
        "name": "helper 2",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 490,
        "y": 100,
        "wires": []
      },
      {
        "id": "42075d85efccbcad",
        "type": "inject",
        "z": "f24eb98786e83747",
        "name": "Change for Unit-ID with Error",
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
        "payload": "{\"connectorType\":\"TCP\",\"tcpHost\":\"0.0.0.0\",\"tcpPort\":\"10513\",\"unitId\":300}",
        "payloadType": "json",
        "x": 220,
        "y": 240,
        "wires": [
          [
            "1b4644a214cfdec6"
          ]
        ]
      },
      {
        "id": "115bd58ae573c942",
        "type": "modbus-client",
        "name": "12 Channel 192.168.0.41",
        "clienttype": "tcp",
        "bufferCommands": true,
        "stateLogEnabled": false,
        "queueLogEnabled": false,
        "failureLogEnabled": false,
        "tcpHost": "127.0.0.1",
        "tcpPort": "10512",
        "tcpType": "DEFAULT",
        "serialPort": "/dev/ttyUSB",
        "serialType": "RTU-BUFFERD",
        "serialBaudrate": "9600",
        "serialDatabits": "8",
        "serialStopbits": "1",
        "serialParity": "none",
        "serialConnectionDelay": "100",
        "serialAsciiResponseStartDelimiter": "0x3A",
        "unit_id": 41,
        "commandDelay": 100,
        "clientTimeout": 1000,
        "reconnectOnTimeout": true,
        "reconnectTimeout": 2000,
        "parallelUnitIdsAllowed": false,
        "showErrors": false,
        "showWarnings": false,
        "showLogs": false
      }
    ]
  ),
  testFlowAsExpectedWithConfigMessage: helperExtensions.cleanFlowPositionData(
    [
      {
        "id": "a7aa10e1f0e1cdc6",
        "type": "tab",
        "label": "Test Felx-Connector With Config Msg",
        "disabled": false,
        "info": "",
        "env": []
      },
      {
        "id": "046bd4d2ce7ca5a2",
        "type": "modbus-server",
        "z": "a7aa10e1f0e1cdc6",
        "name": "",
        "logEnabled": false,
        "hostname": "127.0.0.1",
        "serverPort": "10512",
        "responseDelay": 100,
        "delayUnit": "ms",
        "coilsBufferSize": 10000,
        "holdingBufferSize": 10000,
        "inputBufferSize": 10000,
        "discreteBufferSize": 10000,
        "showErrors": false,
        "showStatusActivities": false,
        "x": 345,
        "y": 80,
        "wires": [
          [],
          [],
          [],
          [],
          [
            "82f1e05498822790"
          ]
        ],
        "l": false
      },
      {
        "id": "bf2ba5ae45aefab1",
        "type": "modbus-flex-connector",
        "z": "a7aa10e1f0e1cdc6",
        "name": "",
        "maxReconnectsPerMinute": 4,
        "emptyQueue": false,
        "showStatusActivities": true,
        "showErrors": true,
        "server": "115bd58ae573c942",
        "emptyMsgOnFail": true,
        "configMsgOnChange": true,
        "x": 610,
        "y": 220,
        "wires": [
          [
            "a3769d4f97d705c0"
          ]
        ]
      },
      {
        "id": "88cbf42790afe657",
        "type": "inject",
        "z": "a7aa10e1f0e1cdc6",
        "name": "Change for Unit-ID",
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
        "onceDelay": "0.5",
        "topic": "",
        "payload": "{\"connectorType\":\"TCP\",\"tcpHost\":\"127.0.0.1\",\"tcpPort\":\"10512\",\"unitId\":1}",
        "payloadType": "json",
        "x": 190,
        "y": 200,
        "wires": [
          [
            "bf2ba5ae45aefab1"
          ]
        ]
      },
      {
        "id": "a3769d4f97d705c0",
        "type": "helper",
        "z": "a7aa10e1f0e1cdc6",
        "name": "helper 1",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 860,
        "y": 220,
        "wires": []
      },
      {
        "id": "bb16ef64ed8e8e26",
        "type": "inject",
        "z": "a7aa10e1f0e1cdc6",
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
        "payload": "1",
        "payloadType": "num",
        "x": 180,
        "y": 80,
        "wires": [
          [
            "046bd4d2ce7ca5a2"
          ]
        ]
      },
      {
        "id": "82f1e05498822790",
        "type": "helper",
        "z": "a7aa10e1f0e1cdc6",
        "name": "helper 2",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 490,
        "y": 100,
        "wires": []
      },
      {
        "id": "0725eaebc8c950d0",
        "type": "inject",
        "z": "a7aa10e1f0e1cdc6",
        "name": "Change for Unit-ID with Error",
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
        "payload": "{\"connectorType\":\"TCP\",\"tcpHost\":\"0.0.0.0\",\"tcpPort\":\"10513\",\"unitId\":300}",
        "payloadType": "json",
        "x": 220,
        "y": 240,
        "wires": [
          [
            "bf2ba5ae45aefab1"
          ]
        ]
      },
      {
        "id": "115bd58ae573c942",
        "type": "modbus-client",
        "name": "12 Channel 192.168.0.41",
        "clienttype": "tcp",
        "bufferCommands": true,
        "stateLogEnabled": false,
        "queueLogEnabled": false,
        "failureLogEnabled": false,
        "tcpHost": "127.0.0.1",
        "tcpPort": "10512",
        "tcpType": "DEFAULT",
        "serialPort": "/dev/ttyUSB",
        "serialType": "RTU-BUFFERD",
        "serialBaudrate": "9600",
        "serialDatabits": "8",
        "serialStopbits": "1",
        "serialParity": "none",
        "serialConnectionDelay": "100",
        "serialAsciiResponseStartDelimiter": "0x3A",
        "unit_id": 41,
        "commandDelay": 100,
        "clientTimeout": 1000,
        "reconnectOnTimeout": true,
        "reconnectTimeout": 2000,
        "parallelUnitIdsAllowed": false,
        "showErrors": false,
        "showWarnings": false,
        "showLogs": false
      }
    ]
  ),
  testonConfigDone: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '88170d215343af66',
        type: 'modbus-flex-connector',
        z: 'b9132d8cd4b074f4',
        name: '',
        maxReconnectsPerMinute: 4,
        emptyQueue: false,
        showStatusActivities: false,
        showErrors: false,
        x: 530,
        y: 220,
        wires: [
          []
        ]
      }
    ]
  )
}
