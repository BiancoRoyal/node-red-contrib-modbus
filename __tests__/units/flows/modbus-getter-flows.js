const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testGetterNodeFlowExample: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "38b971200742d6e4",
          "type": "tab",
          "label": "Modbus Getter (Test Getter Node Flow Example)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "413a26302c33659c",
          "type": "modbus-server",
          "z": "38b971200742d6e4",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10073",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 400,
          "y": 200,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "6dc15488adfc4fa2",
          "type": "inject",
          "z": "38b971200742d6e4",
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
          "payload": "",
          "payloadType": "date",
          "x": 300,
          "y": 340,
          "wires": [
              [
                  "375b0a4560f95296"
              ]
          ]
      },
      {
          "id": "375b0a4560f95296",
          "type": "modbus-getter",
          "z": "38b971200742d6e4",
          "name": "modbus getter node",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "unitid": "",
          "dataType": "HoldingRegister",
          "adr": "1",
          "quantity": "10",
          "server": "4477f0c627dcb4ee",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 540,
          "y": 340,
          "wires": [
              [
                  "ce8aae2238947fc5"
              ],
              []
          ]
      },
      {
          "id": "ce8aae2238947fc5",
          "type": "helper",
          "z": "38b971200742d6e4",
          "name": "helper 3",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 700,
          "y": 380,
          "wires": []
      },
      {
          "id": "4477f0c627dcb4ee",
          "type": "modbus-client",
          "name": "Modbus Getter (Test Getter Node Flow Example)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10073",
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
      }
  ]
  ),
  testGetterWithoutClientConfigFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "1243c51545a330d6",
          "type": "tab",
          "label": "Modbus Getter (Test Getter Without Client Config Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "3ffe153acc21d72b",
          "type": "modbus-getter",
          "z": "1243c51545a330d6",
          "name": "modbusGetter",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "unitid": "",
          "dataType": "",
          "adr": "",
          "quantity": "",
          "server": "",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 340,
          "y": 240,
          "wires": [
              [],
              []
          ]
      }
  ]
  ),

  testGetterFlowWithInjectIo: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "0f3e39d8b0bb626b",
          "type": "tab",
          "label": "Modbus Getter (Test Getter Flow With Inject Io)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "2d3ac1479ddff428",
          "type": "modbus-server",
          "z": "0f3e39d8b0bb626b",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10074",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 300,
          "y": 200,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "0fae2924e7db2caa",
          "type": "inject",
          "z": "0f3e39d8b0bb626b",
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
          "payload": "",
          "payloadType": "date",
          "x": 220,
          "y": 340,
          "wires": [
              [
                  "f4a0e18fe716917b"
              ]
          ]
      },
      {
          "id": "f4a0e18fe716917b",
          "type": "modbus-getter",
          "z": "0f3e39d8b0bb626b",
          "name": "modbus getter node ",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "unitid": "",
          "dataType": "Input",
          "adr": "0",
          "quantity": "10",
          "server": "acf0145ba2f051ee",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 480,
          "y": 340,
          "wires": [
              [],
              [
                  "42bd0d85cb06ce66"
              ]
          ]
      },
      {
          "id": "42bd0d85cb06ce66",
          "type": "helper",
          "z": "0f3e39d8b0bb626b",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 720,
          "y": 340,
          "wires": []
      },
      {
          "id": "acf0145ba2f051ee",
          "type": "modbus-client",
          "name": "Modbus Getter (Test Getter Flow With Inject Io)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10074",
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
      }
  ]
  ),

  testGetterFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "cbf3baa2a648adae",
          "type": "tab",
          "label": "Modbus Getter (Test Getter Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "2df6f429d69a8059",
          "type": "modbus-server",
          "z": "cbf3baa2a648adae",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10075",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 640,
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
          "id": "54c3ff16ec3181e2",
          "type": "modbus-getter",
          "z": "cbf3baa2a648adae",
          "name": "",
          "showStatusActivities": true,
          "showErrors": true,
          "showWarnings": true,
          "logIOActivities": true,
          "unitid": "",
          "dataType": "Coil",
          "adr": "0",
          "quantity": "10",
          "server": "d3170b813bcec05d",
          "useIOFile": true,
          "ioFile": "e809d272d56db1d2",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 540,
          "y": 200,
          "wires": [
              [
                  "ae335ca8bff26e9c"
              ],
              []
          ]
      },
      {
          "id": "ae335ca8bff26e9c",
          "type": "helper",
          "z": "cbf3baa2a648adae",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 750,
          "y": 200,
          "wires": []
      },
      {
          "id": "d3170b813bcec05d",
          "type": "modbus-client",
          "name": "Modbus Getter (Test Getter Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": true,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10075",
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
          "id": "e809d272d56db1d2",
          "type": "modbus-io-config",
          "name": "TestIOFile",
          "path": "./test/resources/device.json",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),

  testGetterWithClientFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "0dfcc7e634544d53",
          "type": "tab",
          "label": "Modbus Getter (Test Getter With Client Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "322daf89.be8dd",
          "type": "modbus-getter",
          "z": "0dfcc7e634544d53",
          "name": "modbusGetter",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "unitid": "",
          "dataType": "Coil",
          "adr": 0,
          "quantity": 1,
          "server": "191ab2c8e10971f3",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 180,
          "y": 180,
          "wires": [
              [],
              []
          ]
      },
      {
          "id": "996023fe.ea04b",
          "type": "modbus-server",
          "z": "0dfcc7e634544d53",
          "name": "modbusServer",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10076",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 180,
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
          "id": "191ab2c8e10971f3",
          "type": "modbus-client",
          "name": "Modbus Getter (Test Getter With Client Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10076",
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
      }
  ]
  ),

  testInjectGetterWithClientFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "70b59b4a597db0a0",
          "type": "tab",
          "label": "Modbus Getter (Test Inject Getter With Client Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "0e02d508f35d68e5",
          "type": "modbus-server",
          "z": "70b59b4a597db0a0",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10078",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
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
          "id": "61be47b99f8a6f7d",
          "type": "modbus-getter",
          "z": "70b59b4a597db0a0",
          "name": "",
          "showStatusActivities": true,
          "showErrors": true,
          "showWarnings": true,
          "logIOActivities": false,
          "unitid": "",
          "dataType": "Coil",
          "adr": "0",
          "quantity": "10",
          "server": "f16b3d3a0fce6f40",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 400,
          "y": 180,
          "wires": [
              [
                  "748086bd928e696c"
              ],
              []
          ]
      },
      {
          "id": "748086bd928e696c",
          "type": "helper",
          "z": "70b59b4a597db0a0",
          "name": "",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 610,
          "y": 180,
          "wires": []
      },
      {
          "id": "d51ebfc6077363d5",
          "type": "inject",
          "z": "70b59b4a597db0a0",
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
          "repeat": "1",
          "crontab": "",
          "once": true,
          "onceDelay": 0.1,
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 210,
          "y": 180,
          "wires": [
              [
                  "61be47b99f8a6f7d"
              ]
          ]
      },
      {
          "id": "f16b3d3a0fce6f40",
          "type": "modbus-client",
          "name": "Modbus Getter (Test Inject Getter With Client Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10078",
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
      }
  ]
  )

}
