const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testModbusFlexWriteFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "660075fdfa781815",
          "type": "tab",
          "label": "Modbus Write Flex (Test Modbus Flex Write Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "7a026aceb41f8142",
          "type": "modbus-server",
          "z": "660075fdfa781815",
          "name": "modbus-server",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10079",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 560,
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
          "id": "c2e00ee82192faab",
          "type": "inject",
          "z": "660075fdfa781815",
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
          "payload": "{\"value\":\"msg.payload\",\"fc\":15,\"unitid\":1,\"address\":0,\"quantity\":10}",
          "payloadType": "json",
          "x": 250,
          "y": 300,
          "wires": [
              [
                  "8ded745fb67db73c"
              ]
          ]
      },
      {
          "id": "8ded745fb67db73c",
          "type": "modbus-flex-write",
          "z": "660075fdfa781815",
          "name": "flex write",
          "showStatusActivities": true,
          "showErrors": false,
          "showWarnings": true,
          "server": "3b3d5e2a0b2f73ea",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 400,
          "y": 400,
          "wires": [
              [
                  "88528fbb6da3ed9d"
              ],
              []
          ]
      },
      {
          "id": "88528fbb6da3ed9d",
          "type": "helper",
          "z": "660075fdfa781815",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 640,
          "y": 400,
          "wires": []
      },
      {
          "id": "3b3d5e2a0b2f73ea",
          "type": "modbus-client",
          "name": "Modbus Flex Write (Test Modbus Flex Write Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10079",
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
  testWriteParametersFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "a454454561e1974f",
          "type": "tab",
          "label": "Modbus Write Flex (Test Write Parameters Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "e20f92e030bfa4b6",
          "type": "catch",
          "z": "a454454561e1974f",
          "name": "",
          "scope": null,
          "uncaught": false,
          "x": 240,
          "y": 220,
          "wires": [
              [
                  "4c3ab10efa3abb4b"
              ]
          ]
      },
      {
          "id": "4c3ab10efa3abb4b",
          "type": "helper",
          "z": "a454454561e1974f",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 450,
          "y": 220,
          "wires": []
      },
      {
          "id": "1ae3e727bbf74ce9",
          "type": "modbus-server",
          "z": "a454454561e1974f",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10080",
          "responseDelay": "50",
          "delayUnit": "ms",
          "coilsBufferSize": 1024,
          "holdingBufferSize": 1024,
          "inputBufferSize": 1024,
          "discreteBufferSize": 1024,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 440,
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
          "id": "8fb79d1884c099c2",
          "type": "modbus-flex-write",
          "z": "a454454561e1974f",
          "name": "",
          "showStatusActivities": false,
          "showErrors": true,
          "showWarnings": true,
          "server": "3a08b5d428fa343b",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 430,
          "y": 400,
          "wires": [
              [
                  "65f4da8c3bf698b5"
              ],
              []
          ]
      },
      {
          "id": "65f4da8c3bf698b5",
          "type": "helper",
          "z": "a454454561e1974f",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 710,
          "y": 380,
          "wires": []
      },
      {
          "id": "4a841026e5648e7d",
          "type": "function",
          "z": "a454454561e1974f",
          "name": "Write 0-9 on Unit 1 FC15",
          "func": "msg.payload = { value: msg.payload, 'fc': 15, 'unitid': 1, 'address': 0, 'quantity': 10 };\nreturn msg;",
          "outputs": 1,
          "timeout": "",
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 150,
          "y": 400,
          "wires": [
              [
                  "8fb79d1884c099c2"
              ]
          ]
      },
      {
          "id": "3a08b5d428fa343b",
          "type": "modbus-client",
          "name": "Modbus Flex Write (Test Write Parameters Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10080",
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

  testShouldBeLoadedWithoutClientFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "bcc1d949ece5bafb",
          "type": "tab",
          "label": "Modbus Write Flex (Test Should Be Loaded Without Client Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "c02b6d1.d419c1",
          "type": "modbus-flex-write",
          "z": "bcc1d949ece5bafb",
          "name": "modbusFlexWrite",
          "showStatusActivities": true,
          "showErrors": false,
          "showWarnings": true,
          "server": "",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 330,
          "y": 220,
          "wires": [
              [],
              []
          ]
      }
  ]
  ),

  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "4877dfb7f8e3a101",
          "type": "tab",
          "label": "Modbus Write Flex (Test Should Be Loaded Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "7ba88d8637607edd",
          "type": "modbus-flex-write",
          "z": "4877dfb7f8e3a101",
          "name": "modbusFlexWrite",
          "showStatusActivities": true,
          "showErrors": false,
          "showWarnings": true,
          "server": "26c69172ef2c7a41",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 190,
          "y": 160,
          "wires": [
              [],
              []
          ]
      },
      {
          "id": "26c69172ef2c7a41",
          "type": "modbus-client",
          "name": "Modbus Write Flex (Test Should Be Loaded Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10081",
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

  testInjectAndWriteShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "53b36342117bc3cb",
          "type": "tab",
          "label": "Modbus Write Flex (Test Inject And Write Should Be Loaded Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "d474946fc4295e2e",
          "type": "modbus-server",
          "z": "53b36342117bc3cb",
          "name": "",
          "logEnabled": false,
          "hostname": "",
          "serverPort": "10082",
          "responseDelay": "50",
          "delayUnit": "ms",
          "coilsBufferSize": 1024,
          "holdingBufferSize": 1024,
          "inputBufferSize": 1024,
          "discreteBufferSize": 1024,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 400,
          "y": 220,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "701492d614996d3d",
          "type": "modbus-flex-write",
          "z": "53b36342117bc3cb",
          "name": "",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "server": "1019ff7b2be3e412",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 630,
          "y": 100,
          "wires": [
              [
                  "8e0fbe77f936d5eb"
              ],
              []
          ]
      },
      {
          "id": "8e0fbe77f936d5eb",
          "type": "helper",
          "z": "53b36342117bc3cb",
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
          "id": "df5ba806fd39be11",
          "type": "inject",
          "z": "53b36342117bc3cb",
          "name": "Write multiple!",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "vt": "str"
              }
          ],
          "repeat": "0.5",
          "crontab": "",
          "once": true,
          "onceDelay": "0.1",
          "topic": "",
          "payload": "[1,2,3,4,5,6,7,8,9,10]",
          "payloadType": "json",
          "x": 120,
          "y": 100,
          "wires": [
              [
                  "afdcc2baaddda89c"
              ]
          ]
      },
      {
          "id": "afdcc2baaddda89c",
          "type": "function",
          "z": "53b36342117bc3cb",
          "name": "Write 0-9 on Unit 1 FC15",
          "func": "msg.payload = { value: msg.payload, 'fc': 15, 'unitid': 1, 'address': 0 , 'quantity': 10 };\nreturn msg;",
          "outputs": 1,
          "timeout": "",
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 390,
          "y": 100,
          "wires": [
              [
                  "701492d614996d3d"
              ]
          ]
      },
      {
          "id": "1019ff7b2be3e412",
          "type": "modbus-client",
          "name": "Modbus Write Flex (Test Inject And Write Should Be Loaded Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10082",
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
