const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testToFilterFlowWithNoWarnings: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "e8fe3d94b494c92e",
          "type": "tab",
          "label": "Modbus Response Filter (Test To Filter Flow With No Warnings)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "83c942a0a199a4d1",
          "type": "inject",
          "z": "e8fe3d94b494c92e",
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
          "payload": "[{\"name\":\"name1\",\"value\":123},{\"name\":\"name2\",\"value\":456}]",
          "payloadType": "json",
          "x": 370,
          "y": 300,
          "wires": [
              [
                  "8b8a4538d916fd59"
              ]
          ]
      },
      {
          "id": "8b8a4538d916fd59",
          "type": "modbus-response-filter",
          "z": "e8fe3d94b494c92e",
          "name": "",
          "filter": "name1",
          "registers": "2",
          "ioFile": "5050ada748392afc",
          "filterResponseBuffer": true,
          "filterValues": true,
          "filterInput": true,
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": false,
          "x": 550,
          "y": 300,
          "wires": [
              [
                  "cf18edddbac1f902"
              ]
          ]
      },
      {
          "id": "cf18edddbac1f902",
          "type": "helper",
          "z": "e8fe3d94b494c92e",
          "name": "helper 6",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 840,
          "y": 280,
          "wires": []
      },
      {
          "id": "5050ada748392afc",
          "type": "modbus-io-config",
          "name": "",
          "path": "",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),
  testToFilterFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "7abb88e2da4e409c",
          "type": "tab",
          "label": "Modbus Response Filter (Test To Filter Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "d693a937e7721a4f",
          "type": "inject",
          "z": "7abb88e2da4e409c",
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
          "payload": "[{\"name\":\"name1\",\"value\":123},{\"name\":\"name2\",\"value\":456}]",
          "payloadType": "json",
          "x": 330,
          "y": 160,
          "wires": [
              [
                  "e8041f6236cbaee4"
              ]
          ]
      },
      {
          "id": "e8041f6236cbaee4",
          "type": "modbus-response-filter",
          "z": "7abb88e2da4e409c",
          "name": "",
          "filter": "name1",
          "registers": "2",
          "ioFile": "d7a5a199e761a48f",
          "filterResponseBuffer": true,
          "filterValues": true,
          "filterInput": true,
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "x": 550,
          "y": 160,
          "wires": [
              [
                  "654c2d296a60f529"
              ]
          ]
      },
      {
          "id": "654c2d296a60f529",
          "type": "helper",
          "z": "7abb88e2da4e409c",
          "name": "helper 5",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 880,
          "y": 140,
          "wires": []
      },
      {
          "id": "d7a5a199e761a48f",
          "type": "modbus-io-config",
          "name": "",
          "path": "",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),
  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "c09ac89be87c55c1",
          "type": "tab",
          "label": "Modbus Response Filter (Test Should Be Loaded)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "50f41d03.d1eff4",
          "type": "modbus-response-filter",
          "z": "c09ac89be87c55c1",
          "name": "ModbusResponseFilter",
          "filter": "FilterTest",
          "registers": 0,
          "ioFile": "2f5a90d.bcaa1f",
          "filterResponseBuffer": true,
          "filterValues": true,
          "filterInput": true,
          "showStatusActivities": false,
          "showErrors": false,
          "x": 370,
          "y": 180,
          "wires": [
              []
          ]
      },
      {
          "id": "2f5a90d.bcaa1f",
          "type": "modbus-io-config",
          "name": "ModbusIOConfig",
          "path": "",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),

  testHandleWrongInputWithoutCrashFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "9e6ef46620de88cc",
          "type": "tab",
          "label": "Modbus Response Filter (Handle Wrong Input Without Crash)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "e8c34b35e0017e7c",
          "type": "modbus-response-filter",
          "z": "9e6ef46620de88cc",
          "name": "ModbusResponseFilter",
          "filter": "FilterTest",
          "registers": 0,
          "ioFile": "2f5a90d.bcaa1f",
          "filterResponseBuffer": true,
          "filterValues": true,
          "filterInput": true,
          "showStatusActivities": false,
          "showErrors": false,
          "x": 390,
          "y": 260,
          "wires": [
              []
          ]
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

  testStopOnInputWrongCountFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "c9025719882f1cb8",
          "type": "tab",
          "label": "Modbus Response (Test Stop On Input Wrong Count Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "52db22141d61edb2",
          "type": "modbus-response-filter",
          "z": "c9025719882f1cb8",
          "name": "ModbusResponseFilter",
          "filter": "FilterTest",
          "registers": 2,
          "ioFile": "2f5a90d.bcaa1f",
          "filterResponseBuffer": true,
          "filterValues": true,
          "filterInput": true,
          "showStatusActivities": false,
          "showErrors": false,
          "x": 370,
          "y": 160,
          "wires": [
              []
          ]
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

  testWorkOnInputExactCountFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "327b21840af728df",
          "type": "tab",
          "label": "Modbus Response Filter (Test Work On Input Exact Count Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "6f35b527e1a998ad",
          "type": "modbus-response-filter",
          "z": "327b21840af728df",
          "name": "ModbusResponseFilter",
          "filter": "FilterTest",
          "registers": 4,
          "ioFile": "2f5a90d.bcaa1f",
          "filterResponseBuffer": true,
          "filterValues": true,
          "filterInput": true,
          "showStatusActivities": false,
          "showErrors": false,
          "x": 410,
          "y": 240,
          "wires": [
              []
          ]
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

  testWorkWithFlexGetterFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "5d8b8b2d5ce61cd2",
          "type": "tab",
          "label": "Modbus Response Filter (Test Work With Flex Getter Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "8ea5ca6ec614808d",
          "type": "modbus-server",
          "z": "5d8b8b2d5ce61cd2",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10041",
          "responseDelay": "50",
          "delayUnit": "ms",
          "coilsBufferSize": 1024,
          "holdingBufferSize": 1024,
          "inputBufferSize": 1024,
          "discreteBufferSize": 1024,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 660,
          "y": 380,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "e1bcbb0ddc153e81",
          "type": "inject",
          "z": "5d8b8b2d5ce61cd2",
          "name": "Get flexible!",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "vt": "str"
              }
          ],
          "repeat": "0.2",
          "crontab": "",
          "once": true,
          "onceDelay": "",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 250,
          "y": 260,
          "wires": [
              [
                  "2fe5441b4b6880cb"
              ]
          ]
      },
      {
          "id": "2fe5441b4b6880cb",
          "type": "function",
          "z": "5d8b8b2d5ce61cd2",
          "name": "",
          "func": "msg.payload = { input: msg.payload, 'fc': 4, 'unitid': 1, 'address': 0 , 'quantity': 30 }\nreturn msg;",
          "outputs": 1,
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 400,
          "y": 260,
          "wires": [
              [
                  "d14f52fabc5cf3f7"
              ]
          ]
      },
      {
          "id": "d14f52fabc5cf3f7",
          "type": "modbus-flex-getter",
          "z": "5d8b8b2d5ce61cd2",
          "name": "",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "067ec68e6e75037e",
          "useIOFile": true,
          "ioFile": "8104872e8f597063",
          "useIOForPayload": true,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 590,
          "y": 260,
          "wires": [
              [
                  "5a15aacbe116ca6f"
              ],
              []
          ]
      },
      {
          "id": "5a15aacbe116ca6f",
          "type": "modbus-response-filter",
          "z": "5d8b8b2d5ce61cd2",
          "name": "ModbusResponseFilter",
          "filter": "bOperationActive",
          "registers": 0,
          "ioFile": "8104872e8f597063",
          "filterResponseBuffer": true,
          "filterValues": true,
          "filterInput": true,
          "showStatusActivities": false,
          "showErrors": false,
          "x": 830,
          "y": 260,
          "wires": [
              [
                  "0ccfc85011dac0aa"
              ]
          ]
      },
      {
          "id": "0ccfc85011dac0aa",
          "type": "helper",
          "z": "5d8b8b2d5ce61cd2",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 1050,
          "y": 260,
          "wires": []
      },
      {
          "id": "067ec68e6e75037e",
          "type": "modbus-client",
          "name": "Modbus Response Filter ( Test Work With Flex Getter Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10041",
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
          "id": "8104872e8f597063",
          "type": "modbus-io-config",
          "name": "C3FactorySet",
          "path": "./test/resources/device.json",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),
  testFlowResponse: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "b71cb9d164111d95",
          "type": "tab",
          "label": "Modbus Response Filter (Test Flow Response)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "4f8c0e22.48b8b4",
          "type": "modbus-response-filter",
          "z": "b71cb9d164111d95",
          "name": "Filter",
          "filter": "Test Filter",
          "registers": "5",
          "ioFile": "",
          "filterResponseBuffer": false,
          "filterValues": false,
          "filterInput": false,
          "showStatusActivities": true,
          "showErrors": true,
          "showWarnings": true,
          "x": 650,
          "y": 340,
          "wires": [
              [
                  "119f217c24184589"
              ]
          ]
      },
      {
          "id": "f11d36da.0e3af8",
          "type": "inject",
          "z": "b71cb9d164111d95",
          "name": "",
          "props": [
              {
                  "p": "payload",
                  "v": "[1,2,3]",
                  "vt": "json"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": false,
          "onceDelay": 0.1,
          "topic": "",
          "x": 460,
          "y": 340,
          "wires": [
              [
                  "4f8c0e22.48b8b4"
              ]
          ]
      },
      {
          "id": "119f217c24184589",
          "type": "helper",
          "z": "b71cb9d164111d95",
          "name": "helper 18",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 920,
          "y": 340,
          "wires": []
      }
  ]
  ),
  testFlowForE2E: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "de709d6f7838999b",
          "type": "tab",
          "label": "Modbus Filter Response (Test Flow For E2E)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "88c95ea2e2f8f892",
          "type": "inject",
          "z": "de709d6f7838999b",
          "name": "Inject Payload",
          "props": [
              {
                  "p": "payload"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": 0.1,
          "topic": "",
          "payload": "[{\"name\": \"filter1\", \"value\": 123}, {\"name\": \"filter2\", \"value\": 456}]",
          "payloadType": "json",
          "x": 480,
          "y": 340,
          "wires": [
              [
                  "542529cd4e4e8a14"
              ]
          ]
      },
      {
          "id": "542529cd4e4e8a14",
          "type": "modbus-response-filter",
          "z": "de709d6f7838999b",
          "name": "Filter Response",
          "filter": "filter1",
          "registers": 2,
          "ioFile": "31912071bc331d18",
          "filterResponseBuffer": false,
          "filterValues": false,
          "filterInput": false,
          "showStatusActivities": false,
          "showErrors": true,
          "showWarnings": true,
          "x": 660,
          "y": 340,
          "wires": [
              [
                  "408bd14812e503de"
              ]
          ]
      },
      {
          "id": "408bd14812e503de",
          "type": "helper",
          "z": "de709d6f7838999b",
          "name": "helper 17",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 840,
          "y": 340,
          "wires": []
      },
      {
          "id": "31912071bc331d18",
          "type": "modbus-io-config",
          "name": "IO File Node",
          "path": "testPath",
          "format": "json",
          "addressOffset": 0
      }
  ]
  )

}
