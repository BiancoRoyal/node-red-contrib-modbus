const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testFlexGetterRequest: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "4772c9238445e0ba",
          "type": "tab",
          "label": "Modbus Flex Getter (Test Flex Getter Request)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "65c0cd33bcaee245",
          "type": "modbus-flex-getter",
          "z": "4772c9238445e0ba",
          "name": "",
          "showStatusActivities": true,
          "showErrors": true,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "59473c7f6f077cd6",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 620,
          "y": 340,
          "wires": [
              [
                  "32dfbf1b1fce7099"
              ],
              []
          ]
      },
      {
          "id": "0a4643fdd725c3bc",
          "type": "inject",
          "z": "4772c9238445e0ba",
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
          "x": 200,
          "y": 340,
          "wires": [
              [
                  "beee2070f939138a"
              ]
          ]
      },
      {
          "id": "beee2070f939138a",
          "type": "function",
          "z": "4772c9238445e0ba",
          "name": "function 81",
          "func": "\nnode.send({payload: { fc: 4, unitid: 14, address: 0, quantity: 1 }})\nnode.send({payload: { fc: 3, unitid: 137, address: 20498, quantity: 2 }})\n//node.send({payload: { fc: 3, unitid: 1, address: 20498, quantity: 2 }})\n node.send({payload: { fc: 3, unitid: 137, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n// node.send({payload: { fc: 3, unitid: 1, address: 24576, quantity: 2 }})\n",
          "outputs": 1,
          "timeout": 0,
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 410,
          "y": 340,
          "wires": [
              [
                  "65c0cd33bcaee245"
              ]
          ]
      },
      {
          "id": "32dfbf1b1fce7099",
          "type": "helper",
          "z": "4772c9238445e0ba",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 860,
          "y": 340,
          "wires": []
      },
      {
          "id": "b21359244d2cb53a",
          "type": "modbus-server",
          "z": "4772c9238445e0ba",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10085",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 480,
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
          "id": "59473c7f6f077cd6",
          "type": "modbus-client",
          "name": "Modbus Flex Getter (Test Flex Getter Request)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10085",
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
          "parallelUnitIdsAllowed": false,
          "showErrors": false,
          "showWarnings": true,
          "showLogs": true
      }
  ]
  ),
  testFlexGetterWithInjectFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "432b16ddb6906289",
          "type": "tab",
          "label": "Modbus Flex Getter (Test Flex Getter With Inject Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "4b0ab91771491acd",
          "type": "modbus-server",
          "z": "432b16ddb6906289",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10086",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 400,
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
          "id": "7721d4de5a8e5ed7",
          "type": "modbus-flex-getter",
          "z": "432b16ddb6906289",
          "name": "",
          "showStatusActivities": true,
          "showErrors": true,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "18c3dcebf65d5847",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": true,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 420,
          "y": 160,
          "wires": [
              [
                  "b6a73262a7d79446"
              ],
              [
                  "2649b58b9a343729"
              ]
          ]
      },
      {
          "id": "ead99ee8a9993d51",
          "type": "inject",
          "z": "432b16ddb6906289",
          "name": "Flex Inject",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "vt": "str"
              }
          ],
          "repeat": "0.1",
          "crontab": "",
          "once": true,
          "onceDelay": "1",
          "topic": "",
          "payload": "{\"value\":0,\"fc\":1,\"unitid\":1,\"address\":0,\"quantity\":1}",
          "payloadType": "json",
          "x": 190,
          "y": 160,
          "wires": [
              [
                  "7721d4de5a8e5ed7"
              ]
          ]
      },
      {
          "id": "b6a73262a7d79446",
          "type": "helper",
          "z": "432b16ddb6906289",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 670,
          "y": 120,
          "wires": []
      },
      {
          "id": "2649b58b9a343729",
          "type": "helper",
          "z": "432b16ddb6906289",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 670,
          "y": 200,
          "wires": []
      },
      {
          "id": "18c3dcebf65d5847",
          "type": "modbus-client",
          "name": "Modbus Flex Getter (Test Flex Getter With Inject Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10086",
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

  testFlexGetterWithInjectAndDelayFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "5b26a23d.a8a06c",
          "type": "tab",
          "label": "Modbus Flex Getter (Test Flex Getter With Inject And Delay Flow)",
          "disabled": false,
          "info": ""
      },
      {
          "id": "6293ed5b.e22d6c",
          "type": "inject",
          "z": "5b26a23d.a8a06c",
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
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "0",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 149,
          "y": 204,
          "wires": [
              [
                  "391d65b9.85b07a",
                  "bf1f319d3fcfb696"
              ]
          ]
      },
      {
          "id": "391d65b9.85b07a",
          "type": "function",
          "z": "5b26a23d.a8a06c",
          "name": "Read 0-9 on Unit 1 FC3",
          "func": "msg.payload = { \n    input: msg.payload, \n    'fc': 3, \n    'unitid': 1, \n    'address': 0 , \n    'quantity': 10 \n}\nreturn msg;",
          "outputs": 1,
          "timeout": "",
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 449,
          "y": 281,
          "wires": [
              [
                  "823b8c53.ee14b8",
                  "abedbb9eb9f5abc3"
              ]
          ]
      },
      {
          "id": "823b8c53.ee14b8",
          "type": "modbus-flex-getter",
          "z": "5b26a23d.a8a06c",
          "name": "",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "64fdd9d22211e89f",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": true,
          "keepMsgProperties": false,
          "delayOnStart": true,
          "startDelayTime": "3",
          "x": 695,
          "y": 281,
          "wires": [
              [
                  "23156c303a59c400"
              ],
              []
          ]
      },
      {
          "id": "10467337b76b6677",
          "type": "inject",
          "z": "5b26a23d.a8a06c",
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
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "1",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 148,
          "y": 241,
          "wires": [
              [
                  "391d65b9.85b07a",
                  "bf1f319d3fcfb696"
              ]
          ]
      },
      {
          "id": "5fb123c57a372cc8",
          "type": "inject",
          "z": "5b26a23d.a8a06c",
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
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "2",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 148,
          "y": 278,
          "wires": [
              [
                  "391d65b9.85b07a",
                  "bf1f319d3fcfb696"
              ]
          ]
      },
      {
          "id": "167addbdbeac2992",
          "type": "inject",
          "z": "5b26a23d.a8a06c",
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
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "3",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 147,
          "y": 315,
          "wires": [
              [
                  "391d65b9.85b07a",
                  "bf1f319d3fcfb696"
              ]
          ]
      },
      {
          "id": "31eac50edf56c56f",
          "type": "inject",
          "z": "5b26a23d.a8a06c",
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
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "4",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 145,
          "y": 349,
          "wires": [
              [
                  "391d65b9.85b07a",
                  "bf1f319d3fcfb696"
              ]
          ]
      },
      {
          "id": "7e8ddc253adc0bd6",
          "type": "modbus-server",
          "z": "5b26a23d.a8a06c",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10087",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 520,
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
          "id": "23156c303a59c400",
          "type": "helper",
          "z": "5b26a23d.a8a06c",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 930,
          "y": 280,
          "wires": []
      },
      {
          "id": "bf1f319d3fcfb696",
          "type": "helper",
          "z": "5b26a23d.a8a06c",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 410,
          "y": 220,
          "wires": []
      },
      {
          "id": "abedbb9eb9f5abc3",
          "type": "helper",
          "z": "5b26a23d.a8a06c",
          "name": "helper 3",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 660,
          "y": 220,
          "wires": []
      },
      {
          "id": "64fdd9d22211e89f",
          "type": "modbus-client",
          "name": "Modbus Flex Getter (Test Flex Getter With Inject And Delay Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10087",
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

  testFlexGetterFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "5331b9eaf021e23f",
          "type": "tab",
          "label": "Modbus Flex Getter (Test Flex Getter Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "7227dcf416f37bf1",
          "type": "modbus-server",
          "z": "5331b9eaf021e23f",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10088",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 620,
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
          "id": "55643421b04bf5cd",
          "type": "modbus-flex-getter",
          "z": "5331b9eaf021e23f",
          "name": "",
          "showStatusActivities": true,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "c9807a27e446d1f7",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": true,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 620,
          "y": 280,
          "wires": [
              [
                  "e12f1b14f44b8ef5"
              ],
              [
                  "0b1a9d6f959ea3c4"
              ]
          ]
      },
      {
          "id": "0be176a2624da49f",
          "type": "inject",
          "z": "5331b9eaf021e23f",
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
          "once": true,
          "onceDelay": "1",
          "topic": "",
          "payload": "{\"fc\":1,\"address\":10,\"quantity\":5}",
          "payloadType": "json",
          "x": 310,
          "y": 280,
          "wires": [
              [
                  "55643421b04bf5cd"
              ]
          ]
      },
      {
          "id": "e12f1b14f44b8ef5",
          "type": "helper",
          "z": "5331b9eaf021e23f",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 880,
          "y": 240,
          "wires": []
      },
      {
          "id": "0b1a9d6f959ea3c4",
          "type": "helper",
          "z": "5331b9eaf021e23f",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 890,
          "y": 320,
          "wires": []
      },
      {
          "id": "c9807a27e446d1f7",
          "type": "modbus-client",
          "name": "Modbus Flex Getter (Test Flex Getter Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10088",
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

  testNodeWithoutClientFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "badc495f84ef07c6",
          "type": "tab",
          "label": "Modbus Flex Getter (Test Node Without Client Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "1e4b83c082ea9def",
          "type": "modbus-flex-getter",
          "z": "badc495f84ef07c6",
          "name": "modbusFlexGetter",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 430,
          "y": 300,
          "wires": [
              [],
              []
          ]
      }
  ]
  ),

  testNodeShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "6037d158de9247af",
          "type": "tab",
          "label": "Modbus Flex Getter (Test Node Should Be Loaded Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "bcad840f60f257d8",
          "type": "modbus-flex-getter",
          "z": "6037d158de9247af",
          "name": "modbusFlexGetter",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "ebd7d66f548957d9",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 510,
          "y": 260,
          "wires": [
              [],
              []
          ]
      },
      {
          "id": "66a6914335a510a4",
          "type": "modbus-server",
          "z": "6037d158de9247af",
          "name": "modbusServer",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10089",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 520,
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
          "id": "ebd7d66f548957d9",
          "type": "modbus-client",
          "name": "Modbus Flex Getter (Test Node Should Be Loaded Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": true,
          "queueLogEnabled": true,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10089",
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
          "showErrors": true,
          "showWarnings": true,
          "showLogs": true
      }
  ]
  ),

  testFlexGetterShowWarningsWithoutClientFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "3ebd46137c178277",
          "type": "tab",
          "label": "Modbus Flex Getter (Test Flex Getter Show Warnings Without Client Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "e56376262a7fcc26",
          "type": "modbus-flex-getter",
          "z": "3ebd46137c178277",
          "name": "",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 490,
          "y": 160,
          "wires": [
              [
                  "91a5d0f0b1f3644a"
              ],
              []
          ]
      },
      {
          "id": "91a5d0f0b1f3644a",
          "type": "helper",
          "z": "3ebd46137c178277",
          "name": "",
          "active": true,
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
          "id": "a311ce9373c7f21f",
          "type": "inject",
          "z": "3ebd46137c178277",
          "name": "Flex Inject",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "vt": "str"
              }
          ],
          "repeat": "5",
          "crontab": "",
          "once": true,
          "onceDelay": 0.1,
          "topic": "",
          "payload": "{\"value\":0,\"fc\":1,\"unitid\":1,\"address\":0,\"quantity\":1}",
          "payloadType": "json",
          "x": 250,
          "y": 160,
          "wires": [
              [
                  "e56376262a7fcc26"
              ]
          ]
      }
  ]
  ),

  testFlexGetterDelayFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "270ceffbd00beb7e",
          "type": "tab",
          "label": "Modbus Flex Getter (Test Flex Getter Delay Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "9946d9160e6fef79",
          "type": "modbus-flex-getter",
          "z": "270ceffbd00beb7e",
          "name": "Default Delay",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "abb5bc611cc9756a",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": true,
          "startDelayTime": "50",
          "x": 500,
          "y": 100,
          "wires": [
              [
                  "4ef99284b7f557bd"
              ],
              []
          ]
      },
      {
          "id": "4ef99284b7f557bd",
          "type": "helper",
          "z": "270ceffbd00beb7e",
          "name": "helper Delay",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 750,
          "y": 100,
          "wires": []
      },
      {
          "id": "350fcb7c4139d28e",
          "type": "inject",
          "z": "270ceffbd00beb7e",
          "name": "No Delay Inject",
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
          "once": true,
          "onceDelay": 0.1,
          "topic": "",
          "payload": "{\"value\":0,\"fc\":1,\"unitid\":1,\"address\":0,\"quantity\":1}",
          "payloadType": "json",
          "x": 260,
          "y": 160,
          "wires": [
              [
                  "74a3d41aadee3cc9",
                  "9946d9160e6fef79"
              ]
          ]
      },
      {
          "id": "bda5923a457d84ba",
          "type": "modbus-server",
          "z": "270ceffbd00beb7e",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10090",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 500,
          "y": 340,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "74a3d41aadee3cc9",
          "type": "modbus-flex-getter",
          "z": "270ceffbd00beb7e",
          "name": "No Delay",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "server": "abb5bc611cc9756a",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 480,
          "y": 200,
          "wires": [
              [
                  "c8933a7c54d36b40"
              ],
              []
          ]
      },
      {
          "id": "c8933a7c54d36b40",
          "type": "helper",
          "z": "270ceffbd00beb7e",
          "name": "helper No Delay",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 760,
          "y": 200,
          "wires": []
      },
      {
          "id": "abb5bc611cc9756a",
          "type": "modbus-client",
          "name": "Modbus Flex Getter (Test Flex Getter Delay Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10090",
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
