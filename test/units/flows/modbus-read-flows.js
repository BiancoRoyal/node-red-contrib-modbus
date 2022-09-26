
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testReadMsgFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "a60ca8c447c6bf61",
      "type": "tab",
      "label": "Test Modbus Read Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "445454e4.968564",
      "type": "modbus-server",
      "z": "a60ca8c447c6bf61",
      "name": "",
      "logEnabled": true,
      "hostname": "127.0.0.1",
      "serverPort": "7502",
      "responseDelay": 100,
      "delayUnit": "ms",
      "coilsBufferSize": 10000,
      "holdingBufferSize": 10000,
      "inputBufferSize": 10000,
      "discreteBufferSize": 10000,
      "showErrors": false,
      "x": 240,
      "y": 120,
      "wires": [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      "id": "90922127.397cb8",
      "type": "modbus-read",
      "z": "a60ca8c447c6bf61",
      "name": "Modbus Read With IO",
      "topic": "",
      "showStatusActivities": false,
      "logIOActivities": false,
      "showErrors": false,
      "unitid": "",
      "dataType": "Coil",
      "adr": "0",
      "quantity": "10",
      "rate": "500",
      "rateUnit": "ms",
      "delayOnStart": false,
      "startDelayTime": "",
      "server": "92e7bf63.2efd7",
      "useIOFile": false,
      "ioFile": "",
      "useIOForPayload": false,
      "emptyMsgOnFail": false,
      "x": 260,
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
      "z": "a60ca8c447c6bf61",
      "active": true,
      "x": 530,
      "y": 220,
      "wires": []
    },
    {
      "id": "92e7bf63.2efd7",
      "type": "modbus-client",
      "z": "a60ca8c447c6bf61",
      "name": "ModbusServer",
      "clienttype": "tcp",
      "bufferCommands": true,
      "stateLogEnabled": true,
      "queueLogEnabled": false,
      "failureLogEnabled": false,
      "tcpHost": "127.0.0.1",
      "tcpPort": "7502",
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