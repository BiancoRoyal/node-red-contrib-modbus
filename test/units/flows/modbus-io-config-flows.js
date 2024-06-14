const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testReadWithClientIoFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "7ecaf10e98444c51",
          "type": "tab",
          "label": "Test Read with Client IO Flow",
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
          "serverPort": "5412",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
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
          "id": "8921251df5afdb7b",
          "type": "modbus-read",
          "z": "7ecaf10e98444c51",
          "name": "Modbus Read With IO",
          "topic": "",
          "showStatusActivities": false,
          "logIOActivities": true,
          "showErrors": false,
          "unitid": "",
          "dataType": "InputRegister",
          "adr": "0",
          "quantity": "20",
          "rate": "200",
          "rateUnit": "ms",
          "delayOnStart": false,
          "startDelayTime": "",
          "server": "0de7212959503d3c",
          "useIOFile": true,
          "ioFile": "6822f8ed8da9824e",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "x": 220,
          "y": 180,
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
          "x": 470,
          "y": 160,
          "wires": []
      },
      {
          "id": "0de7212959503d3c",
          "type": "modbus-client",
          "z": "7ecaf10e98444c51",
          "name": "ModbusServer",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": true,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "5412",
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
      },
      {
          "id": "6822f8ed8da9824e",
          "type": "modbus-io-config",
          "z": "7ecaf10e98444c51",
          "name": "TestIOFile",
          "path": "./test/resources/device.json",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
    
     ),
  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'ec42ecc63a604e72',
      type: 'tab',
      label: 'Should Be Loaded',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'b0fefd31.802188',
      type: 'modbus-read',
      z: 'ec42ecc63a604e72',
      name: '',
      topic: '',
      showStatusActivities: false,
      logIOActivities: false,
      showErrors: false,
      unitid: '',
      dataType: '',
      adr: '',
      quantity: '',
      rate: '',
      rateUnit: '',
      delayOnStart: false,
      startDelayTime: '',
      server: '',
      useIOFile: true,
      ioFile: '2f5a90d.bcaa1f',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      x: 350,
      y: 240,
      wires: [
        [],
        []
      ]
    },
    {
      id: '2f5a90d.bcaa1f',
      type: 'modbus-io-config',
      name: 'ModbusIOConfig',
      path: 'testpath',
      format: 'utf8',
      addressOffset: ''
    }
  ]),

  testShouldBeReadyToSendFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'ec42ecc63a604e72',
      type: 'tab',
      label: 'Ready To Send',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'b0fefd31.802188',
      type: 'modbus-read',
      z: 'ec42ecc63a604e72',
      name: '',
      topic: '',
      showStatusActivities: false,
      logIOActivities: false,
      showErrors: false,
      unitid: '',
      dataType: 'Coil',
      adr: '0',
      quantity: '1',
      rate: '10',
      rateUnit: 's',
      delayOnStart: false,
      startDelayTime: '',
      server: '1b49af22a0d089c9',
      useIOFile: true,
      ioFile: '2f5a90d.bcaa1f',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      x: 350,
      y: 240,
      wires: [
        [],
        []
      ]
    },
    {
      id: '1b49af22a0d089c9',
      type: 'modbus-client',
      name: '',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '50502',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'none',
      serialConnectionDelay: '100',
      serialAsciiResponseStartDelimiter: '0x3A',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true
    },
    {
      id: '2f5a90d.bcaa1f',
      type: 'modbus-io-config',
      name: 'ModbusIOConfig',
      path: 'testpath',
      format: 'utf8',
      addressOffset: ''
    }
  ])

}
