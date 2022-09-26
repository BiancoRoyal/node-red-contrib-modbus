
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testSimpleWriteFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "4cadf3686ac42701",
      "type": "tab",
      "label": "Test Simple Write Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "445454e4.968564",
      "type": "modbus-server",
      "z": "4cadf3686ac42701",
      "name": "",
      "logEnabled": true,
      "hostname": "127.0.0.1",
      "serverPort": "7512",
      "responseDelay": 100,
      "delayUnit": "ms",
      "coilsBufferSize": 10000,
      "holdingBufferSize": 10000,
      "inputBufferSize": 10000,
      "discreteBufferSize": 10000,
      "showErrors": false,
      "x": 260,
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
      "id": "1ed908da.427ecf",
      "type": "modbus-write",
      "z": "4cadf3686ac42701",
      "name": "Write Reset FC5",
      "showStatusActivities": true,
      "showErrors": false,
      "unitid": "",
      "dataType": "Coil",
      "adr": "64",
      "quantity": "1",
      "server": "aef203cf.a23dc",
      "emptyMsgOnFail": false,
      "keepMsgProperties": false,
      "x": 260,
      "y": 180,
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
      "z": "4cadf3686ac42701",
      "active": true,
      "x": 470,
      "y": 180,
      "wires": []
    },
    {
      "id": "aef203cf.a23dc",
      "type": "modbus-client",
      "z": "4cadf3686ac42701",
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
      "parallelUnitIdsAllowed": true
    }
  ]),

  "testWriteFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "6fc7552dec67377b",
      "type": "tab",
      "label": "Test Write Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "e54529b9.952ea8",
      "type": "modbus-server",
      "z": "6fc7552dec67377b",
      "name": "modbusServer",
      "logEnabled": false,
      "hostname": "",
      "serverPort": 8502,
      "responseDelay": 100,
      "delayUnit": "ms",
      "coilsBufferSize": 1024,
      "holdingBufferSize": 1024,
      "inputBufferSize": 1024,
      "discreteBufferSize": "1024",
      "showErrors": false,
      "x": 200,
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
      "id": "8ad2951c.2df708",
      "type": "modbus-write",
      "z": "6fc7552dec67377b",
      "name": "modbusWrite",
      "showStatusActivities": false,
      "showErrors": false,
      "unitid": "",
      "dataType": "HoldingRegister",
      "adr": "0",
      "quantity": "1",
      "server": "1f258d73662d6493",
      "emptyMsgOnFail": false,
      "keepMsgProperties": false,
      "x": 400,
      "y": 220,
      "wires": [
        [
          "f75a87de7256906f"
        ],
        [
          "0fd19d9e756cbf0a"
        ]
      ]
    },
    {
      "id": "67dded7e.025904",
      "type": "inject",
      "z": "6fc7552dec67377b",
      "name": "injectTrue",
      "repeat": "",
      "crontab": "",
      "once": false,
      "topic": "",
      "payload": true,
      "payloadType": "bool",
      "x": 200,
      "y": 220,
      "wires": [
        [
          "8ad2951c.2df708"
        ]
      ]
    },
    {
      "id": "f75a87de7256906f",
      "type": "helper",
      "z": "6fc7552dec67377b",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 620,
      "y": 200,
      "wires": []
    },
    {
      "id": "0fd19d9e756cbf0a",
      "type": "helper",
      "z": "6fc7552dec67377b",
      "name": "helper 2",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 620,
      "y": 260,
      "wires": []
    },
    {
      "id": "1f258d73662d6493",
      "type": "modbus-client",
      "z": "6fc7552dec67377b",
      "name": "modbusClient",
      "clienttype": "tcp",
      "bufferCommands": true,
      "stateLogEnabled": false,
      "queueLogEnabled": false,
      "failureLogEnabled": true,
      "tcpHost": "127.0.0.1",
      "tcpPort": "8502",
      "tcpType": "DEFAULT",
      "serialPort": "/dev/ttyUSB",
      "serialType": "RTU-BUFFERD",
      "serialBaudrate": "9600",
      "serialDatabits": "8",
      "serialStopbits": "1",
      "serialParity": "none",
      "serialConnectionDelay": "100",
      "serialAsciiResponseStartDelimiter": "0x3A",
      "unit_id": "1",
      "commandDelay": "1",
      "clientTimeout": "1000",
      "reconnectOnTimeout": true,
      "reconnectTimeout": "2000",
      "parallelUnitIdsAllowed": true
    }
  ]),

  "testWriteCycleFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "df9950e9527cceaa",
      "type": "tab",
      "label": "Test Write Cycles Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "445454e4.968564",
      "type": "modbus-server",
      "z": "df9950e9527cceaa",
      "name": "",
      "logEnabled": true,
      "hostname": "127.0.0.1",
      "serverPort": "7522",
      "responseDelay": 100,
      "delayUnit": "ms",
      "coilsBufferSize": 10000,
      "holdingBufferSize": 10000,
      "inputBufferSize": 10000,
      "discreteBufferSize": 10000,
      "showErrors": false,
      "x": 220,
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
      "id": "1ed908da.427ecf",
      "type": "modbus-write",
      "z": "df9950e9527cceaa",
      "name": "Write Reset FC5",
      "showStatusActivities": true,
      "showErrors": false,
      "unitid": "",
      "dataType": "Coil",
      "adr": "64",
      "quantity": "1",
      "server": "aef203cf.a23dc",
      "emptyMsgOnFail": false,
      "keepMsgProperties": false,
      "x": 380,
      "y": 220,
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
      "z": "df9950e9527cceaa",
      "active": true,
      "x": 590,
      "y": 220,
      "wires": []
    },
    {
      "id": "16b7697e.2baa47",
      "type": "inject",
      "z": "df9950e9527cceaa",
      "name": "",
      "repeat": "2",
      "crontab": "",
      "once": false,
      "topic": "",
      "payload": "true",
      "payloadType": "bool",
      "x": 190,
      "y": 260,
      "wires": [
        [
          "1ed908da.427ecf"
        ]
      ]
    },
    {
      "id": "5da6464f.441aa",
      "type": "inject",
      "z": "df9950e9527cceaa",
      "name": "",
      "repeat": "2",
      "crontab": "",
      "once": true,
      "onceDelay": 0.1,
      "topic": "",
      "payload": "false",
      "payloadType": "bool",
      "x": 190,
      "y": 180,
      "wires": [
        [
          "1ed908da.427ecf"
        ]
      ]
    },
    {
      "id": "aef203cf.a23dc",
      "type": "modbus-client",
      "z": "df9950e9527cceaa",
      "name": "Modbus Server",
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
      "commandDelay": "1",
      "clientTimeout": "100",
      "reconnectOnTimeout": false,
      "reconnectTimeout": "200",
      "parallelUnitIdsAllowed": true
    }
  ])
}
