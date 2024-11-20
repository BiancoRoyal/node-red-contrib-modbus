const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testShouldBeReadyToSendFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "b4ef96753e3b3c26",
          "type": "tab",
          "label": "Modbus IO Config (Test Should Be Ready To Send Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "ed04978b6aa94b49",
          "type": "modbus-read",
          "z": "b4ef96753e3b3c26",
          "name": "Read Coil",
          "topic": "",
          "showStatusActivities": false,
          "logIOActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "1",
          "dataType": "Coil",
          "adr": "0",
          "quantity": "1",
          "rate": "10",
          "rateUnit": "s",
          "delayOnStart": false,
          "startDelayTime": "",
          "server": "b8d5759e650cbe4f",
          "useIOFile": true,
          "ioFile": "d969f07e38cdcdac",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "x": 280,
          "y": 520,
          "wires": [
              [],
              [
                  "cbbbc3caed762ce4"
              ]
          ]
      },
      {
          "id": "28f4d663d85e016a",
          "type": "modbus-server",
          "z": "b4ef96753e3b3c26",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10012",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 415,
          "y": 440,
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
          "id": "cbbbc3caed762ce4",
          "type": "helper",
          "z": "b4ef96753e3b3c26",
          "name": "helper 5",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 620,
          "y": 580,
          "wires": []
      },
      {
          "id": "b8d5759e650cbe4f",
          "type": "modbus-client",
          "name": "Modbus IO Config (Test Should Be Ready To Send Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10012",
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
          "id": "d969f07e38cdcdac",
          "type": "modbus-io-config",
          "name": "ModbusIOConfig",
          "path": "./device.json",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  )

  // testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
  //   {
  //     id: 'ec42ecc63a604e72',
  //     type: 'tab',
  //     label: 'Should Be Loaded',
  //     disabled: false,
  //     info: '',
  //     env: []
  //   },
  //   {
  //     id: 'b0fefd31.802189',
  //     type: 'modbus-read',
  //     z: 'ec42ecc63a604e72',
  //     name: '',
  //     topic: '',
  //     showStatusActivities: false,
  //     logIOActivities: false,io
  //     unitid: '',
  //     dataType: '',
  //     adr: '',
  //     quantity: '',
  //     rate: '',
  //     rateUnit: '',
  //     delayOnStart: false,
  //     startDelayTime: '',
  //     server: '',
  //     useIOFile: true,
  //     ioFile: '2f5a90d.bcaa1f',
  //     useIOForPayload: false,
  //     emptyMsgOnFail: false,
  //     x: 350,
  //     y: 240,
  //     wires: [
  //       [],
  //       []
  //     ]
  //   },
  //   {
  //     id: '2f5a90d.bcaa1f',
  //     type: 'modbus-io-config',
  //     name: 'ModbusIOConfig',
  //     path: 'testpath',
  //     format: 'utf8',
  //     addressOffset: ''
  //   }
  // ])
}
