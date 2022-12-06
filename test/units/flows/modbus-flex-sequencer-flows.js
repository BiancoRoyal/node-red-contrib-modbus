
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testNodeWithoutClientFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "9c0e139fb2b7cf7b",
      "type": "tab",
      "label": "Node Without Client",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "bc5a61b6.a3972",
      "type": "modbus-flex-sequencer",
      "z": "9c0e139fb2b7cf7b",
      "name": "modbusFlexSequencer",
      "server": "",
      "showStatusActivities": false,
      "showErrors": false,
      "useIOFile": false,
      "ioFile": "",
      "useIOForPayload": false,
      "emptyMsgOnFail": false,
      "keepMsgProperties": false,
      "x": 430,
      "y": 240,
      "wires": [
        [],
        []
      ]
    }
  ]),

  "testNodeWithServerFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "c4711c82ba22fa66",
      "type": "tab",
      "label": "Node With Server",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "bc5a61b6.a3972",
      "type": "modbus-flex-sequencer",
      "z": "c4711c82ba22fa66",
      "name": "modbusFlexSequencer",
      "sequences": [
        {
          "name": "",
          "unitid": "",
          "fc": "FC1",
          "address": "",
          "quantity": ""
        }
      ],
      "server": "92e7bf63.2efd7",
      "showStatusActivities": false,
      "showErrors": false,
      "logIOActivities": false,
      "useIOFile": false,
      "ioFile": "",
      "useIOForPayload": false,
      "emptyMsgOnFail": false,
      "keepMsgProperties": false,
      "x": 390,
      "y": 300,
      "wires": [
        [],
        []
      ]
    },
    {
      "id": "996023fe.ea04b",
      "type": "modbus-server",
      "z": "c4711c82ba22fa66",
      "name": "modbusServer",
      "logEnabled": true,
      "hostname": "127.0.0.1",
      "serverPort": "7506",
      "responseDelay": 100,
      "delayUnit": "ms",
      "coilsBufferSize": 10000,
      "holdingBufferSize": 10000,
      "inputBufferSize": 10000,
      "discreteBufferSize": 10000,
      "showErrors": false,
      "x": 380,
      "y": 180,
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
      "tcpPort": "7506",
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

}