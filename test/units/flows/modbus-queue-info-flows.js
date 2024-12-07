const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testWithNoServer: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "bd319004992a7bc3",
          "type": "tab",
          "label": "Modbus Queue (Test With No Server)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "ef5dad20.e97af",
          "type": "modbus-queue-info",
          "z": "bd319004992a7bc3",
          "name": "modbusQueueInfo",
          "topic": "",
          "unitid": 0,
          "queueReadIntervalTime": "15000",
          "lowLowLevel": 10,
          "lowLevel": 20,
          "highLevel": 30,
          "highHighLevel": 40,
          "server": "",
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
      }
  ]
  ),
  testToGetStatusSituationFillColor: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "086804368838f12e",
          "type": "tab",
          "label": "Modbus Queue (Test To Get Status Situation Fill Color)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "bd5442c2f6dfb3ab",
          "type": "modbus-server",
          "z": "086804368838f12e",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10055",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
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
          "id": "a94928c2a04c7fe5",
          "type": "modbus-queue-info",
          "z": "086804368838f12e",
          "name": "modbusQueueInfo",
          "topic": "",
          "unitid": 0,
          "queueReadIntervalTime": "15000",
          "lowLowLevel": 10,
          "lowLevel": 20,
          "highLevel": 30,
          "highHighLevel": 40,
          "server": "c489666303f510f8",
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
          "id": "a31ae23bea2af421",
          "type": "inject",
          "z": "086804368838f12e",
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
                  "a94928c2a04c7fe5"
              ]
          ]
      },
      {
          "id": "c489666303f510f8",
          "type": "modbus-client",
          "name": "Modbus Queue (Test To Get Status Situation Fill Color)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10055",
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
  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "71c0d9c756d24c3f",
          "type": "tab",
          "label": "Modbus Queue (Test Should Be Loaded Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "e0a2d17ecd74835e",
          "type": "modbus-server",
          "z": "71c0d9c756d24c3f",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10056",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
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
          "id": "920c89aa79edcc8a",
          "type": "modbus-queue-info",
          "z": "71c0d9c756d24c3f",
          "name": "modbusQueueInfo",
          "topic": "",
          "unitid": "",
          "queueReadIntervalTime": "100",
          "lowLowLevel": 1,
          "lowLevel": 2,
          "highLevel": 3,
          "highHighLevel": 4,
          "server": "8a2841d1d7e6000b",
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
          "id": "345785dfbffb5c44",
          "type": "inject",
          "z": "71c0d9c756d24c3f",
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
                  "920c89aa79edcc8a"
              ]
          ]
      },
      {
          "id": "8a2841d1d7e6000b",
          "type": "modbus-client",
          "name": "Modbus Queue (Test Should Be Loaded Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10056",
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

  testOldResetInjectShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "de1d22eb6b67a57f",
          "type": "tab",
          "label": "Modbus Queue (Test Old Reset Inject Should Be Loaded Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "8ffa192e55ba9066",
          "type": "modbus-server",
          "z": "de1d22eb6b67a57f",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10057",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 440,
          "y": 320,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "c1a20de4ee93afc8",
          "type": "modbus-queue-info",
          "z": "de1d22eb6b67a57f",
          "name": "QueueInfo",
          "topic": "",
          "unitid": "",
          "queueReadIntervalTime": 100,
          "lowLowLevel": 1,
          "lowLevel": 2,
          "highLevel": 3,
          "highHighLevel": 4,
          "server": "9b27885dc215949f",
          "errorOnHighLevel": false,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": false,
          "updateOnAllUnitQueues": false,
          "x": 430,
          "y": 180,
          "wires": [
              [
                  "e9e283fe9f795e2b"
              ]
          ]
      },
      {
          "id": "7f473e6f1c30e8ca",
          "type": "inject",
          "z": "de1d22eb6b67a57f",
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
          "repeat": 2,
          "crontab": "",
          "once": false,
          "onceDelay": 1,
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 190,
          "y": 180,
          "wires": [
              [
                  "c1a20de4ee93afc8"
              ]
          ]
      },
      {
          "id": "e9e283fe9f795e2b",
          "type": "helper",
          "z": "de1d22eb6b67a57f",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 750,
          "y": 180,
          "wires": []
      },
      {
          "id": "9b27885dc215949f",
          "type": "modbus-client",
          "name": "Modbus Queue (Test Old Reset Inject Should Be Loaded Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10057",
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

  testNewResetInjectShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "fe54d929e634498f",
          "type": "tab",
          "label": "Modbus Queue (Test New Reset Inject Should Be Loaded Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "f6e2a98ab91e8068",
          "type": "modbus-server",
          "z": "fe54d929e634498f",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10058",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 460,
          "y": 260,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "0ede9cc7b4df1a78",
          "type": "modbus-queue-info",
          "z": "fe54d929e634498f",
          "name": "QueueInfo",
          "topic": "",
          "unitid": "",
          "queueReadIntervalTime": 100,
          "lowLowLevel": 1,
          "lowLevel": 2,
          "highLevel": 3,
          "highHighLevel": 4,
          "server": "e420da0e1ae14d35",
          "errorOnHighLevel": false,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": false,
          "updateOnAllUnitQueues": false,
          "x": 450,
          "y": 160,
          "wires": [
              [
                  "0a700de9a63c99c7"
              ]
          ]
      },
      {
          "id": "ed9c566974a79342",
          "type": "inject",
          "z": "fe54d929e634498f",
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
          "repeat": 2,
          "crontab": "",
          "once": false,
          "onceDelay": 1,
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 210,
          "y": 160,
          "wires": [
              [
                  "0ede9cc7b4df1a78"
              ]
          ]
      },
      {
          "id": "0a700de9a63c99c7",
          "type": "helper",
          "z": "fe54d929e634498f",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 750,
          "y": 160,
          "wires": []
      },
      {
          "id": "e420da0e1ae14d35",
          "type": "modbus-client",
          "name": "Modbus Queue (Test New Reset Inject Should Be Loaded Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": true,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10058",
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

  testInjectAndPollingShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "e841f965ccc3e494",
          "type": "tab",
          "label": "Modbus Queue (Test Inject And Polling Should Be Loaded Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "4dc9eeda53cf85d3",
          "type": "modbus-server",
          "z": "e841f965ccc3e494",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10059",
          "responseDelay": 10,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 320,
          "y": 280,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "9dede7b2d0dd8333",
          "type": "modbus-read",
          "z": "e841f965ccc3e494",
          "name": "Modbus Read With IO",
          "topic": "",
          "showStatusActivities": false,
          "logIOActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "",
          "dataType": "Coil",
          "adr": "0",
          "quantity": "10",
          "rate": "50",
          "rateUnit": "ms",
          "delayOnStart": false,
          "startDelayTime": "",
          "server": "d6e6e3f903e1da0a",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "x": 320,
          "y": 180,
          "wires": [
              [
                  "1962fe0588ceaf0b"
              ],
              []
          ]
      },
      {
          "id": "e18e0fe2e38450b1",
          "type": "modbus-queue-info",
          "z": "e841f965ccc3e494",
          "name": "QueueInfo",
          "topic": "",
          "unitid": "",
          "queueReadIntervalTime": 100,
          "lowLowLevel": 0,
          "lowLevel": 1,
          "highLevel": 2,
          "highHighLevel": 3,
          "server": "6caeb7770b3be619",
          "errorOnHighLevel": false,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": false,
          "updateOnAllUnitQueues": false,
          "x": 330,
          "y": 120,
          "wires": [
              [
                  "1962fe0588ceaf0b"
              ]
          ]
      },
      {
          "id": "d2d7490d1227615b",
          "type": "inject",
          "z": "e841f965ccc3e494",
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
          "repeat": 0.3,
          "crontab": "",
          "once": true,
          "onceDelay": 0.2,
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 130,
          "y": 120,
          "wires": [
              [
                  "e18e0fe2e38450b1"
              ]
          ]
      },
      {
          "id": "1962fe0588ceaf0b",
          "type": "helper",
          "z": "e841f965ccc3e494",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 730,
          "y": 160,
          "wires": []
      },
      {
          "id": "d6e6e3f903e1da0a",
          "type": "modbus-client",
          "name": "Modbus Queue (Test Inject And Polling Should Be Loaded Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10059",
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
          "id": "6caeb7770b3be619",
          "type": "modbus-client",
          "name": "ModbsuFlexServer",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "8503",
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
  ]
   ),

  testResetFunctionQueueFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "cc030f0d17477272",
          "type": "tab",
          "label": "Modbus Queue (Test Reset Function Queue Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "30c3c4aede930a8c",
          "type": "modbus-server",
          "z": "cc030f0d17477272",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10060",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 460,
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
          "id": "99277b0e6f5269cf",
          "type": "modbus-queue-info",
          "z": "cc030f0d17477272",
          "name": "QueueInfo",
          "topic": "",
          "unitid": "1",
          "queueReadIntervalTime": 100,
          "lowLowLevel": 1,
          "lowLevel": 2,
          "highLevel": 3,
          "highHighLevel": 4,
          "server": "560f96e6c2ecc393",
          "errorOnHighLevel": false,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": false,
          "updateOnAllUnitQueues": false,
          "x": 490,
          "y": 80,
          "wires": [
              [
                  "a3e04c105546f8e0"
              ]
          ]
      },
      {
          "id": "1eeaf279cd37a1b6",
          "type": "inject",
          "z": "cc030f0d17477272",
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
          "repeat": 2,
          "crontab": "",
          "once": false,
          "onceDelay": 1,
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 130,
          "y": 80,
          "wires": [
              [
                  "0d50a572e9364e0c"
              ]
          ]
      },
      {
          "id": "0d50a572e9364e0c",
          "type": "function",
          "z": "cc030f0d17477272",
          "name": "reset on High",
          "func": "if(\"high level reached\" === msg.state) {\n    msg.payload.resetQueue = true;\n    return msg;\n}\n",
          "outputs": 1,
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 330,
          "y": 80,
          "wires": [
              [
                  "99277b0e6f5269cf"
              ]
          ]
      },
      {
          "id": "a3e04c105546f8e0",
          "type": "helper",
          "z": "cc030f0d17477272",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 690,
          "y": 80,
          "wires": []
      },
      {
          "id": "560f96e6c2ecc393",
          "type": "modbus-client",
          "name": "Modbus Queue (Test Reset Function Queue Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": true,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10060",
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
  testForshowStatusActivitiesIsFalse: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "950d174d95ca15f4",
          "type": "tab",
          "label": "Modbus Queue (Test For Modbus Client Not Defined)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "87fe30df39bb7415",
          "type": "modbus-server",
          "z": "950d174d95ca15f4",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10061",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
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
          "id": "821810d65c05b4b5",
          "type": "modbus-queue-info",
          "z": "950d174d95ca15f4",
          "name": "modbusQueueInfo",
          "topic": "",
          "unitid": "",
          "queueReadIntervalTime": "100",
          "lowLowLevel": 1,
          "lowLevel": 2,
          "highLevel": 3,
          "highHighLevel": 4,
          "server": "92bce1e964c573e0",
          "errorOnHighLevel": false,
          "showStatusActivities": false,
          "updateOnAllQueueChanges": false,
          "updateOnAllUnitQueues": false,
          "x": 450,
          "y": 200,
          "wires": [
              []
          ]
      },
      {
          "id": "4c3d1a9b035a9954",
          "type": "inject",
          "z": "950d174d95ca15f4",
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
                  "821810d65c05b4b5"
              ]
          ]
      },
      {
          "id": "92bce1e964c573e0",
          "type": "modbus-client",
          "name": "Modbus Queue (Test For Show Status Activities Is False)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10061",
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

  testForModbusClientNotDefined: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "2cd2efbaaed61364",
          "type": "tab",
          "label": "Modbus Queue (Test For Modbus Client Not Defined)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "3913d9c4a6a38252",
          "type": "modbus-queue-info",
          "z": "2cd2efbaaed61364",
          "name": "modbusQueueInfo",
          "topic": "",
          "unitid": "",
          "queueReadIntervalTime": "100",
          "lowLowLevel": 1,
          "lowLevel": 2,
          "highLevel": 3,
          "highHighLevel": 4,
          "server": "89f6b4e3405503a8",
          "errorOnHighLevel": false,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": false,
          "updateOnAllUnitQueues": false,
          "x": 670,
          "y": 200,
          "wires": [
              []
          ]
      },
      {
          "id": "89f6b4e3405503a8",
          "type": "modbus-client",
          "name": "Modbus Queue (Test For Modbus Client Not Defined)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10062",
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
  testToReadFromAllUnitQueues: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "579af2b0f6dea3f6",
          "type": "tab",
          "label": "Modbus Queue (Test To Read From All Unit Queues)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "a15679786279a7b5",
          "type": "modbus-server",
          "z": "579af2b0f6dea3f6",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10063",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 595,
          "y": 220,
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
          "id": "aa2c5088a2bb8156",
          "type": "inject",
          "z": "579af2b0f6dea3f6",
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
          "payload": "{\"resetQueue\":true,\"unitId\":1}",
          "payloadType": "json",
          "x": 430,
          "y": 360,
          "wires": [
              [
                  "0ac07f90d243e6c5"
              ]
          ],
          "l": false
      },
      {
          "id": "0ac07f90d243e6c5",
          "type": "modbus-queue-info",
          "z": "579af2b0f6dea3f6",
          "name": "testNode",
          "topic": "testTopic",
          "unitid": "0",
          "queueReadIntervalTime": 1000,
          "lowLowLevel": "3",
          "lowLevel": "5",
          "highLevel": "10",
          "highHighLevel": "30",
          "server": "f6c5e1fbb4e3a0b0",
          "errorOnHighLevel": true,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": true,
          "updateOnAllUnitQueues": true,
          "x": 655,
          "y": 360,
          "wires": [
              [
                  "6aeb24e2b1e2e846"
              ]
          ]
      },
      {
          "id": "6aeb24e2b1e2e846",
          "type": "helper",
          "z": "579af2b0f6dea3f6",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 940,
          "y": 360,
          "wires": []
      },
      {
          "id": "f6c5e1fbb4e3a0b0",
          "type": "modbus-client",
          "name": "Modbus Queue (Test To Read From All Unit Queues)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10063",
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
  testToupdateOnAllUnitQueues: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "08efece200cb449d",
          "type": "tab",
          "label": "Should Be Loaded Wrong IP",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "9ec4520bbf593343",
          "type": "inject",
          "z": "08efece200cb449d",
          "name": "injectNode",
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
          "payload": "{\"resetQueue\":true,\"unitId\":1}",
          "payloadType": "json",
          "x": 480,
          "y": 560,
          "wires": [
              [
                  "08224fdbf0eda1ee"
              ]
          ]
      },
      {
          "id": "08224fdbf0eda1ee",
          "type": "modbus-queue-info",
          "z": "08efece200cb449d",
          "name": "",
          "topic": "",
          "unitid": 1,
          "queueReadIntervalTime": 1000,
          "lowLowLevel": 25,
          "lowLevel": 75,
          "highLevel": 150,
          "highHighLevel": 300,
          "server": "904a54b89308432e",
          "errorOnHighLevel": false,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": false,
          "updateOnAllUnitQueues": false,
          "x": 700,
          "y": 540,
          "wires": [
              [
                  "5cdd3731bbacfa4b"
              ]
          ]
      },
      {
          "id": "5cdd3731bbacfa4b",
          "type": "helper",
          "z": "08efece200cb449d",
          "name": "helper 17",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 960,
          "y": 540,
          "wires": []
      },
      {
          "id": "50bebc2a9e7c9bea",
          "type": "modbus-server",
          "z": "08efece200cb449d",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10064",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 700,
          "y": 440,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "904a54b89308432e",
          "type": "modbus-client",
          "name": "Modbus Queue (Test To Update On All UnitQueues)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10064",
          "tcpType": "DEFAULT",
          "serialPort": "/dev/ttyUSB",
          "serialType": "RTU-BUFFERD",
          "serialBaudrate": "9600",
          "serialDatabits": "8",
          "serialStopbits": "1",
          "serialParity": "none",
          "serialConnectionDelay": "100",
          "serialAsciiResponseStartDelimiter": "0x3A",
          "unit_id": "41",
          "commandDelay": "1",
          "clientTimeout": "1000",
          "reconnectOnTimeout": true,
          "reconnectTimeout": "2000",
          "parallelUnitIdsAllowed": false,
          "showErrors": false,
          "showWarnings": false,
          "showLogs": false
      }
  ]
  ),
  testToReadWhenHighLevelReached: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "0abbe2f94489b9c8",
          "type": "tab",
          "label": "Modbus Queue (Test To Read When High Level Reached)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "9d5d3709deba610c",
          "type": "modbus-server",
          "z": "0abbe2f94489b9c8",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10065",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 625,
          "y": 200,
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
          "id": "a19059cdaf4a77bf",
          "type": "inject",
          "z": "0abbe2f94489b9c8",
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
          "payload": "{\"resetQueue\":true,\"unitId\":1}",
          "payloadType": "json",
          "x": 460,
          "y": 340,
          "wires": [
              [
                  "79a9f144cf8cca2f"
              ]
          ],
          "l": false
      },
      {
          "id": "79a9f144cf8cca2f",
          "type": "modbus-queue-info",
          "z": "0abbe2f94489b9c8",
          "name": "testNode",
          "topic": "testTopic",
          "unitid": "0",
          "queueReadIntervalTime": 1000,
          "lowLowLevel": "3",
          "lowLevel": "5",
          "highLevel": "10",
          "highHighLevel": "30",
          "server": "c9c96ef99e516b0b",
          "errorOnHighLevel": true,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": true,
          "updateOnAllUnitQueues": true,
          "x": 685,
          "y": 340,
          "wires": [
              [
                  "e849a59b325c3c97"
              ]
          ]
      },
      {
          "id": "e849a59b325c3c97",
          "type": "helper",
          "z": "0abbe2f94489b9c8",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 970,
          "y": 340,
          "wires": []
      },
      {
          "id": "c9c96ef99e516b0b",
          "type": "modbus-client",
          "name": "Modbus Queue (Test To Read When High Level Reached)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10065",
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
  testToReadHighHighLevelReached: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "46c7d9f20a065e18",
          "type": "tab",
          "label": "Modbus Queue (Test To Read High High Level Reached)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "e98da066945cf25c",
          "type": "modbus-server",
          "z": "46c7d9f20a065e18",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10066",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 525,
          "y": 200,
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
          "id": "3f86e99b69f865f2",
          "type": "inject",
          "z": "46c7d9f20a065e18",
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
          "payload": "{\"resetQueue\":true,\"unitId\":1}",
          "payloadType": "json",
          "x": 360,
          "y": 340,
          "wires": [
              [
                  "47e42e773b996ca7"
              ]
          ],
          "l": false
      },
      {
          "id": "47e42e773b996ca7",
          "type": "modbus-queue-info",
          "z": "46c7d9f20a065e18",
          "name": "testNode",
          "topic": "testTopic",
          "unitid": "0",
          "queueReadIntervalTime": 1000,
          "lowLowLevel": "3",
          "lowLevel": "5",
          "highLevel": "10",
          "highHighLevel": "30",
          "server": "2ccfc76277e80f44",
          "errorOnHighLevel": true,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": true,
          "updateOnAllUnitQueues": true,
          "x": 585,
          "y": 340,
          "wires": [
              [
                  "6fbc2e28735c74fd"
              ]
          ]
      },
      {
          "id": "6fbc2e28735c74fd",
          "type": "helper",
          "z": "46c7d9f20a065e18",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 870,
          "y": 340,
          "wires": []
      },
      {
          "id": "2ccfc76277e80f44",
          "type": "modbus-client",
          "name": "Modbus Queue (Test To Read High High Level Reached)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10066",
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
  testToReadLowLevelReached: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "65f1ae62f41eaa4e",
          "type": "tab",
          "label": "Flow 70",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "9cba52bee956aabc",
          "type": "modbus-server",
          "z": "65f1ae62f41eaa4e",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10067",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 615,
          "y": 280,
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
          "id": "c0e9dc23c780abc4",
          "type": "inject",
          "z": "65f1ae62f41eaa4e",
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
          "payload": "{\"resetQueue\":true,\"unitId\":1}",
          "payloadType": "json",
          "x": 450,
          "y": 420,
          "wires": [
              [
                  "46bd7417ce8d55bf"
              ]
          ],
          "l": false
      },
      {
          "id": "46bd7417ce8d55bf",
          "type": "modbus-queue-info",
          "z": "65f1ae62f41eaa4e",
          "name": "testNode",
          "topic": "testTopic",
          "unitid": "0",
          "queueReadIntervalTime": 1000,
          "lowLowLevel": "3",
          "lowLevel": "5",
          "highLevel": "10",
          "highHighLevel": "30",
          "server": "29c4174b762c9428",
          "errorOnHighLevel": true,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": true,
          "updateOnAllUnitQueues": true,
          "x": 675,
          "y": 420,
          "wires": [
              [
                  "1c90b2b9c2020212"
              ]
          ]
      },
      {
          "id": "1c90b2b9c2020212",
          "type": "helper",
          "z": "65f1ae62f41eaa4e",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 960,
          "y": 420,
          "wires": []
      },
      {
          "id": "29c4174b762c9428",
          "type": "modbus-client",
          "name": "Modbus Queue (Test To Read Low Level Reached)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10067",
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
  testToThrowError: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "34c799e2c5aa0c2b",
          "type": "tab",
          "label": "Modbus Queue (Test To Throw Error)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "8bb93f944a2ceee8",
          "type": "modbus-server",
          "z": "34c799e2c5aa0c2b",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10068",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 380,
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
          "id": "2c80a34592b5aa77",
          "type": "inject",
          "z": "34c799e2c5aa0c2b",
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
          "onceDelay": "0.1",
          "topic": "",
          "payload": "{\"resetQueue\":true,\"unitId\":1}",
          "payloadType": "json",
          "x": 215,
          "y": 360,
          "wires": [
              [
                  "5102b6e1abd62184"
              ]
          ]
      },
      {
          "id": "5102b6e1abd62184",
          "type": "modbus-queue-info",
          "z": "34c799e2c5aa0c2b",
          "name": "testNode",
          "topic": "testTopic",
          "unitid": "0",
          "queueReadIntervalTime": 1000,
          "lowLowLevel": "3",
          "lowLevel": "5",
          "highLevel": "10",
          "highHighLevel": "30",
          "server": "44dd6abb4f1ca7bd",
          "errorOnHighLevel": true,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": true,
          "updateOnAllUnitQueues": true,
          "x": 440,
          "y": 360,
          "wires": [
              [
                  "542eb78df7e2cb46"
              ]
          ]
      },
      {
          "id": "542eb78df7e2cb46",
          "type": "helper",
          "z": "34c799e2c5aa0c2b",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 725,
          "y": 360,
          "wires": []
      },
      {
          "id": "44dd6abb4f1ca7bd",
          "type": "modbus-client",
          "name": "Modbus Queue (Test To Throw Error)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10068",
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
  testbufferCommandsTrue: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "cdefdca4898acd05",
          "type": "tab",
          "label": "Modbus Queue (Test Buffer Commands True)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "5a3b9f63cd1f5a2f",
          "type": "modbus-server",
          "z": "cdefdca4898acd05",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10069",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
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
          "id": "446ce885ccf4b00c",
          "type": "modbus-queue-info",
          "z": "cdefdca4898acd05",
          "name": "modbusQueueInfo",
          "topic": "",
          "unitid": "",
          "queueReadIntervalTime": "100",
          "lowLowLevel": 1,
          "lowLevel": 2,
          "highLevel": 3,
          "highHighLevel": 4,
          "server": "66d23299ed95dca3",
          "errorOnHighLevel": false,
          "showStatusActivities": false,
          "updateOnAllQueueChanges": false,
          "updateOnAllUnitQueues": false,
          "x": 450,
          "y": 200,
          "wires": [
              []
          ]
      },
      {
          "id": "67042cdefde3c5f4",
          "type": "inject",
          "z": "cdefdca4898acd05",
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
                  "446ce885ccf4b00c"
              ]
          ]
      },
      {
          "id": "66d23299ed95dca3",
          "type": "modbus-client",
          "name": "Modbus Queue (Test Buffer Commands True)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10069",
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
  testLogVerboseMessage: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "7ff7c1e485f38f16",
          "type": "tab",
          "label": "Modbus Queue (Test Log Verbose Message)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "e1cb386befdc73b5",
          "type": "modbus-server",
          "z": "7ff7c1e485f38f16",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10070",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
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
          "id": "1d70f72cfaf4cca5",
          "type": "modbus-queue-info",
          "z": "7ff7c1e485f38f16",
          "name": "modbusQueueInfo",
          "topic": "",
          "unitid": "",
          "queueReadIntervalTime": "100",
          "lowLowLevel": 1,
          "lowLevel": 2,
          "highLevel": 3,
          "highHighLevel": 4,
          "server": "97d8523578ef25dc",
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
          "id": "555eb79deb04c173",
          "type": "inject",
          "z": "7ff7c1e485f38f16",
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
                  "1d70f72cfaf4cca5"
              ]
          ]
      },
      {
          "id": "97d8523578ef25dc",
          "type": "modbus-client",
          "name": "Modbus Queue (Test Log Verbose Message)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10070",
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
