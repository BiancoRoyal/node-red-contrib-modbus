
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testFlexGetterWithInjectFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "de0ae33276a95fc3",
      "type": "tab",
      "label": "Flex Getter With Inject Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "445454e4.968564",
      "type": "modbus-server",
      "z": "de0ae33276a95fc3",
      "name": "",
      "logEnabled": true,
      "hostname": "127.0.0.1",
      "serverPort": "8505",
      "responseDelay": 100,
      "delayUnit": "ms",
      "coilsBufferSize": 10000,
      "holdingBufferSize": 10000,
      "inputBufferSize": 10000,
      "discreteBufferSize": 10000,
      "showErrors": false,
      "x": 340,
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
      "id": "bc5a61b6.a3972",
      "type": "modbus-flex-getter",
      "z": "de0ae33276a95fc3",
      "name": "",
      "showStatusActivities": true,
      "showErrors": false,
      "logIOActivities": false,
      "server": "92e7bf63.2efd7",
      "useIOFile": false,
      "ioFile": "",
      "useIOForPayload": false,
      "emptyMsgOnFail": false,
      "keepMsgProperties": false,
      "x": 350,
      "y": 160,
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
      "z": "de0ae33276a95fc3",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 810,
      "y": 160,
      "wires": []
    },
    {
      "id": "fda9ed0f.c27278",
      "type": "inject",
      "z": "de0ae33276a95fc3",
      "name": "Flex Inject",
      "props": [
        {
          "p": "payload"
        },
        {
          "p": "topic",
          "vt": "str"
        }
      ],
      "repeat": "0.1",
      "crontab": "",
      "once": true,
      "onceDelay": 0.1,
      "topic": "",
      "payload": "{\"value\":0,\"fc\":1,\"unitid\":1,\"address\":0,\"quantity\":1}",
      "payloadType": "json",
      "x": 130,
      "y": 160,
      "wires": [
        [
          "bc5a61b6.a3972"
        ]
      ]
    },
    {
      "id": "92e7bf63.2efd7",
      "type": "modbus-client",
      "name": "ModbusServer",
      "clienttype": "tcp",
      "bufferCommands": true,
      "stateLogEnabled": true,
      "queueLogEnabled": false,
      "failureLogEnabled": false,
      "tcpHost": "127.0.0.1",
      "tcpPort": "8505",
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

  "testFlexGetterFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "8c99fb2559058c40",
      "type": "tab",
      "label": "Flex Getter Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "445454e4.968564",
      "type": "modbus-server",
      "z": "8c99fb2559058c40",
      "name": "",
      "logEnabled": true,
      "hostname": "127.0.0.1",
      "serverPort": "7505",
      "responseDelay": 100,
      "delayUnit": "ms",
      "coilsBufferSize": 10000,
      "holdingBufferSize": 10000,
      "inputBufferSize": 10000,
      "discreteBufferSize": 10000,
      "showErrors": false,
      "x": 620,
      "y": 380,
      "wires": [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      "id": "bc5a61b6.a3972",
      "type": "modbus-flex-getter",
      "z": "8c99fb2559058c40",
      "name": "",
      "showStatusActivities": true,
      "showErrors": false,
      "logIOActivities": false,
      "server": "92e7bf63.2efd7",
      "useIOFile": false,
      "ioFile": "",
      "useIOForPayload": false,
      "emptyMsgOnFail": false,
      "keepMsgProperties": false,
      "x": 550,
      "y": 280,
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
      "z": "8c99fb2559058c40",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 870,
      "y": 280,
      "wires": []
    },
    {
      "id": "92e7bf63.2efd7",
      "type": "modbus-client",
      "name": "ModbusServer",
      "clienttype": "tcp",
      "bufferCommands": true,
      "stateLogEnabled": true,
      "queueLogEnabled": false,
      "failureLogEnabled": false,
      "tcpHost": "127.0.0.1",
      "tcpPort": "7505",
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

  "testNodeWithoutClientFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "eaaccec04c6e2e09",
      "type": "tab",
      "label": "Simple Node Without Client",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "bc5a61b6.a3972",
      "type": "modbus-flex-getter",
      "z": "eaaccec04c6e2e09",
      "name": "modbusFlexGetter",
      "showStatusActivities": false,
      "showErrors": false,
      "logIOActivities": false,
      "server": "",
      "useIOFile": false,
      "ioFile": "",
      "useIOForPayload": false,
      "emptyMsgOnFail": false,
      "keepMsgProperties": false,
      "x": 430,
      "y": 300,
      "wires": [
        [],
        []
      ]
    }
  ]),

  "testNodeShouldBeLoadedFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "9104d7db3af9d632",
      "type": "tab",
      "label": "Node Should Be Loaded",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "bc5a61b6.a3972",
      "type": "modbus-flex-getter",
      "z": "9104d7db3af9d632",
      "name": "modbusFlexGetter",
      "showStatusActivities": false,
      "showErrors": false,
      "logIOActivities": false,
      "server": "92e7bf63.2efd7",
      "useIOFile": false,
      "ioFile": "",
      "useIOForPayload": false,
      "emptyMsgOnFail": false,
      "keepMsgProperties": false,
      "x": 510,
      "y": 260,
      "wires": [
        [],
        []
      ]
    },
    {
      "id": "996023fe.ea04b",
      "type": "modbus-server",
      "z": "9104d7db3af9d632",
      "name": "modbusServer",
      "logEnabled": true,
      "hostname": "127.0.0.1",
      "serverPort": "7505",
      "responseDelay": 100,
      "delayUnit": "ms",
      "coilsBufferSize": 10000,
      "holdingBufferSize": 10000,
      "inputBufferSize": 10000,
      "discreteBufferSize": 10000,
      "showErrors": false,
      "x": 520,
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
      "id": "92e7bf63.2efd7",
      "type": "modbus-client",
      "name": "ModbusServer",
      "clienttype": "tcp",
      "bufferCommands": true,
      "stateLogEnabled": true,
      "queueLogEnabled": false,
      "failureLogEnabled": false,
      "tcpHost": "127.0.0.1",
      "tcpPort": "7505",
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
  ])

}