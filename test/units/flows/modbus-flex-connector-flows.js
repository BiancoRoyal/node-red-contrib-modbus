
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testShouldBeLoadedFlow": helperExtensions.cleanFlowPositionData([

    {
      "id": "40ddaabb.fd44d4",
      "type": "modbus-flex-connector",
      "z": "43f07d0e121df598",
      "name": "FlexConnector",
      "maxReconnectsPerMinute": 4,
      "emptyQueue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "server": "2a253153.fae3ce",
      "x": 460,
      "y": 200,
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
      "reconnectTimeout": "200",
      "parallelUnitIdsAllowed": true
    }
  ]),

  "testShouldChangeTcpPortFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "6526da2265adb5f1",
      "type": "tab",
      "label": "Should Change TCP Port",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "445454e4.968564",
      "type": "modbus-server",
      "z": "6526da2265adb5f1",
      "name": "",
      "logEnabled": true,
      "hostname": "127.0.0.1",
      "serverPort": "8522",
      "responseDelay": 100,
      "delayUnit": "ms",
      "coilsBufferSize": 10000,
      "holdingBufferSize": 10000,
      "inputBufferSize": 10000,
      "discreteBufferSize": 10000,
      "showErrors": false,
      "x": 400,
      "y": 240,
      "wires": [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      "id": "40ddaabb.fd44d4",
      "type": "modbus-flex-connector",
      "z": "6526da2265adb5f1",
      "name": "FlexConnector",
      "maxReconnectsPerMinute": 4,
      "emptyQueue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "server": "2a253153.fae3ce",
      "x": 480,
      "y": 400,
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
      "tcpPort": "7522",
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
      "reconnectTimeout": "200",
      "parallelUnitIdsAllowed": true
    }
  ]),

  "testShouldChangeSerialPortFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "316b8516b884d511",
      "type": "tab",
      "label": "Should Change Serial Port",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "40ddaabb.fd44d4",
      "type": "modbus-flex-connector",
      "z": "316b8516b884d511",
      "name": "FlexConnector",
      "maxReconnectsPerMinute": 4,
      "emptyQueue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "server": "2a253153.fae3ef",
      "x": 380,
      "y": 240,
      "wires": [
        []
      ]
    },
    {
      "id": "2a253153.fae3ef",
      "type": "modbus-client",
      "name": "",
      "clienttype": "serial",
      "bufferCommands": true,
      "stateLogEnabled": false,
      "queueLogEnabled": false,
      "failureLogEnabled": false,
      "tcpHost": "127.0.0.1",
      "tcpPort": "7522",
      "tcpType": "DEFAULT",
      "serialPort": "/dev/ttyUSB",
      "serialType": "RTU-BUFFERD",
      "serialBaudrate": "0",
      "serialDatabits": "8",
      "serialStopbits": "1",
      "serialParity": "none",
      "serialConnectionDelay": "100",
      "serialAsciiResponseStartDelimiter": "",
      "unit_id": "1",
      "commandDelay": "100",
      "clientTimeout": "100",
      "reconnectOnTimeout": true,
      "reconnectTimeout": "200",
      "parallelUnitIdsAllowed": true
    }
  ]),
  "testFlowAsExpected": helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "ea7e082eac96bb8f",
          "type": "modbus-server",
          "z": "3b249606fb2722a7",
          "name": "",
          "logEnabled": false,
          "hostname": "0.0.0.0",
          "serverPort": "10512",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "x": 445,
          "y": 460,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ],
          "l": false
      },
      {
          "id": "1b4644a214cfdec6",
          "type": "modbus-flex-connector",
          "z": "3b249606fb2722a7",
          "name": "",
          "maxReconnectsPerMinute": 4,
          "emptyQueue": false,
          "showStatusActivities": false,
          "showErrors": false,
          "server": "115bd58ae573c942",
          "x": 530,
          "y": 600,
          "wires": [
              [
                  "221de567904726a1"
              ]
          ]
      },
      {
          "id": "88ef999a1a2c4c5d",
          "type": "inject",
          "z": "3b249606fb2722a7",
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
          "payload": "{\"connectorType\":\"TCP\",\"tcpHost\":\"127.0.0.1\",\"tcpPort\":\"10512\"}",
          "payloadType": "json",
          "x": 270,
          "y": 560,
          "wires": [
              [
                  "1b4644a214cfdec6"
              ]
          ]
      },
      {
          "id": "221de567904726a1",
          "type": "helper",
          "z": "3b249606fb2722a7",
          "name": "helper 14",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 780,
          "y": 520,
          "wires": []
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
  "testonConfigDone": helperExtensions.cleanFlowPositionData(
  [
    {
        "id": "88170d215343af66",
        "type": "modbus-flex-connector",
        "z": "b9132d8cd4b074f4",
        "name": "",
        "maxReconnectsPerMinute": 4,
        "emptyQueue": false,
        "showStatusActivities": false,
        "showErrors": false,
        "x": 530,
        "y": 220,
        "wires": [
            []
        ]
    }
]
  )
}