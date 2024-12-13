const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testReadWithClientIoFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "7ecaf10e98444c51",
          "type": "tab",
          "label": "Modbus IO Config (Test Read With Client Io Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "94d59eaf66811f1d",
          "type": "modbus-server",
          "z": "7ecaf10e98444c51",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10071",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 240,
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
          "id": "8921251df5afdb8b",
          "type": "modbus-read",
          "z": "7ecaf10e98444c51",
          "name": "Modbus Read With IO",
          "topic": "",
          "showStatusActivities": false,
          "logIOActivities": true,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "",
          "dataType": "InputRegister",
          "adr": "0",
          "quantity": "20",
          "rate": "200",
          "rateUnit": "ms",
          "delayOnStart": false,
          "startDelayTime": "",
          "server": "d790a85ad207c25f",
          "useIOFile": true,
          "ioFile": "b0d101525a3ab7f5",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "x": 280,
          "y": 220,
          "wires": [
              [
                  "bd82f396e8cde449"
              ],
              []
          ]
      },
      {
          "id": "bd82f396e8cde449",
          "type": "helper",
          "z": "7ecaf10e98444c51",
          "name": "",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 510,
          "y": 220,
          "wires": []
      },
      {
          "id": "d790a85ad207c25f",
          "type": "modbus-client",
          "name": "Modbus IO Config (Test Read With Client Io Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": true,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10071",
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
          "parallelUnitIdsAllowed": true,
          "showErrors": false,
          "showWarnings": true,
          "showLogs": true
      },
      {
          "id": "b0d101525a3ab7f5",
          "type": "modbus-io-config",
          "name": "TestIOFile",
          "path": "./test/resources/device.json",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),
  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "ec42ecc63a604e72",
          "type": "tab",
          "label": "Modbus IO Config (Test Should Be Loaded Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "9c36e42ffe84d0ef",
          "type": "modbus-read",
          "z": "ec42ecc63a604e72",
          "name": "",
          "topic": "",
          "showStatusActivities": false,
          "logIOActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "",
          "dataType": "",
          "adr": "",
          "quantity": "",
          "rate": "",
          "rateUnit": "",
          "delayOnStart": false,
          "startDelayTime": "",
          "server": "",
          "useIOFile": true,
          "ioFile": "181cab926ad54b55",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "x": 450,
          "y": 160,
          "wires": [
              [],
              []
          ]
      },
      {
          "id": "181cab926ad54b55",
          "type": "modbus-io-config",
          "name": "ModbusIOTest",
          "path": "./test/resources/device.json",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),

  testShouldBeReadyToSendFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "cc696dfdaa77d309",
          "type": "tab",
          "label": "Modbus IO Config (Test Should Be Ready To Send Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "9fea7d58b0a0ae73",
          "type": "modbus-read",
          "z": "cc696dfdaa77d309",
          "name": "",
          "topic": "",
          "showStatusActivities": false,
          "logIOActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "",
          "dataType": "Coil",
          "adr": "0",
          "quantity": "1",
          "rate": "10",
          "rateUnit": "s",
          "delayOnStart": false,
          "startDelayTime": "",
          "server": "98980dfb935dd457",
          "useIOFile": true,
          "ioFile": "2f5a90d.bcaa1f",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "x": 350,
          "y": 240,
          "wires": [
              [],
              []
          ]
      },
      {
          "id": "98980dfb935dd457",
          "type": "modbus-client",
          "name": "Modbus IO Config (Test Should Be Ready To Send Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "502",
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
          "parallelUnitIdsAllowed": true,
          "showErrors": false,
          "showWarnings": true,
          "showLogs": true
      },
      {
          "id": "2f5a90d.bcaa1f",
          "type": "modbus-io-config",
          "name": "ModbusIOConfig",
          "path": "test",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),

  testShouldBeLoadedWithoutFileExistsFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "ec42ecc63a604e82",
          "type": "tab",
          "label": "Modbus IO Config (Test Should Be Loaded Without File Exists Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "9c36e42ffe84d1ef",
          "type": "modbus-read",
          "z": "ec42ecc63a604e82",
          "name": "",
          "topic": "",
          "showStatusActivities": false,
          "logIOActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "",
          "dataType": "",
          "adr": "",
          "quantity": "",
          "rate": "",
          "rateUnit": "",
          "delayOnStart": false,
          "startDelayTime": "",
          "server": "",
          "useIOFile": true,
          "ioFile": "181cab926ad54b56",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "x": 450,
          "y": 160,
          "wires": [
              [],
              []
          ]
      },
      {
          "id": "181cab926ad54b56",
          "type": "modbus-io-config",
          "name": "ModbusIOTest",
          "path": "./test/resources/devices_not_existing.json",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),

}
