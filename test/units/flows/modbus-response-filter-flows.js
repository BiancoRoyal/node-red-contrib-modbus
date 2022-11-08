
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testShouldBeLoadedFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "bd319004992a7bc3",
      "type": "tab",
      "label": "Should Be Loaded",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "389153e.cb648ac",
      "type": "modbus-server",
      "z": "bd319004992a7bc3",
      "name": "modbusServer",
      "logEnabled": false,
      "hostname": "0.0.0.0",
      "serverPort": "6503",
      "responseDelay": 100,
      "delayUnit": "ms",
      "coilsBufferSize": 10000,
      "holdingBufferSize": 10000,
      "inputBufferSize": 10000,
      "discreteBufferSize": 10000,
      "showErrors": false,
      "x": 300,
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
      "id": "ef5dad20.e97af",
      "type": "modbus-queue-info",
      "z": "bd319004992a7bc3",
      "name": "modbusQueueInfo",
      "topic": "",
      "unitid": "",
      "queueReadIntervalTime": "100",
      "lowLowLevel": 1,
      "lowLevel": 2,
      "highLevel": 3,
      "highHighLevel": 4,
      "server": "d4c76ff5.c424b8",
      "errorOnHighLevel": false,
      "showStatusActivities": true,
      "updateOnAllQueueChanges": false,
      "updateOnAllUnitQueues": false,
      "x": 450,
      "y": 200,
      "wires": [
        []
      ]
    },
    {
      "id": "d322d62a.bd875",
      "type": "inject",
      "z": "bd319004992a7bc3",
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
      "repeat": 1,
      "crontab": "",
      "once": true,
      "onceDelay": 1,
      "topic": "",
      "payload": "",
      "payloadType": "date",
      "x": 210,
      "y": 200,
      "wires": [
        [
          "ef5dad20.e97af"
        ]
      ]
    },
    {
      "id": "d4c76ff5.c424b8",
      "type": "modbus-client",
      "name": "modbusClient",
      "clienttype": "tcp",
      "bufferCommands": true,
      "stateLogEnabled": false,
      "queueLogEnabled": false,
      "failureLogEnabled": false,
      "tcpHost": "127.0.0.1",
      "tcpPort": "6503",
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