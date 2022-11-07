
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testShouldBeLoadedFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "43f07d0e121df598",
      "type": "tab",
      "label": "Should Be Loaded",
      "disabled": false,
      "info": "",
      "env": []
    },
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
  ])

}