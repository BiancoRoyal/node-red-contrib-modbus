const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testWriteExampleFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "9d9d7eae20f571d4",
          "type": "tab",
          "label": "Modbus Write (Test Write Example Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "6a1e92672f0ab56b",
          "type": "modbus-write",
          "z": "9d9d7eae20f571d4",
          "name": "modbus write",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "1",
          "dataType": "HoldingRegister",
          "adr": "1",
          "quantity": "1",
          "server": "09e8480ac894a981",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 300,
          "y": 400,
          "wires": [
              [],
              [
                  "deaa7134fc0cd318"
              ]
          ]
      },
      {
          "id": "deaa7134fc0cd318",
          "type": "helper",
          "z": "9d9d7eae20f571d4",
          "name": "helper 3",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 640,
          "y": 460,
          "wires": []
      },
      {
          "id": "b21429e73969616f",
          "type": "modbus-server",
          "z": "9d9d7eae20f571d4",
          "name": "modbus server",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "7580",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "x": 280,
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
          "id": "09e8480ac894a981",
          "type": "modbus-client",
          "name": "Modbus Write (Test Write Example Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10036",
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
  testSimpleWriteFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "224695ac11e7a7e5",
          "type": "tab",
          "label": "Modbus Write (Test Simple Write Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "63079ebef45733e6",
          "type": "modbus-server",
          "z": "224695ac11e7a7e5",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10037",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 220,
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
          "id": "1b9906a27c6a5ef5",
          "type": "modbus-write",
          "z": "224695ac11e7a7e5",
          "name": "",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "1",
          "dataType": "Coil",
          "adr": "10",
          "quantity": "1",
          "server": "2cb9c2465491495f",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 540,
          "y": 220,
          "wires": [
              [
                  "0d111c32d9c8f5cb"
              ],
              [
                  "b55d0a446df6931e"
              ]
          ]
      },
      {
          "id": "0d111c32d9c8f5cb",
          "type": "helper",
          "z": "224695ac11e7a7e5",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 740,
          "y": 200,
          "wires": []
      },
      {
          "id": "b55d0a446df6931e",
          "type": "helper",
          "z": "224695ac11e7a7e5",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 750,
          "y": 240,
          "wires": []
      },
      {
          "id": "2e965be74644ddbb",
          "type": "inject",
          "z": "224695ac11e7a7e5",
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
          "repeat": "0.2",
          "crontab": "",
          "once": true,
          "onceDelay": "1",
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 170,
          "y": 220,
          "wires": [
              [
                  "4eb741586e3f8227"
              ]
          ]
      },
      {
          "id": "4eb741586e3f8227",
          "type": "function",
          "z": "224695ac11e7a7e5",
          "name": "function 1",
          "func": "msg.payload = [1,0,1,0,1,0,1,0,1,0]\nreturn msg;",
          "outputs": 1,
          "timeout": 0,
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 340,
          "y": 220,
          "wires": [
              [
                  "1b9906a27c6a5ef5"
              ]
          ]
      },
      {
          "id": "2cb9c2465491495f",
          "type": "modbus-client",
          "name": "Modbus Write (Test Simple Write Flow)",
          "clienttype": "tcp",
          "bufferCommands": false,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10037",
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

  testWriteFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "6fc7552dec67377b",
          "type": "tab",
          "label": "Modbus Write (Test Write Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "e54529b9.952ea8",
          "type": "modbus-server",
          "z": "6fc7552dec67377b",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "",
          "serverPort": "10038",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 1024,
          "holdingBufferSize": 1024,
          "inputBufferSize": 1024,
          "discreteBufferSize": "1024",
          "showErrors": false,
          "showStatusActivities": false,
          "x": 200,
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
          "id": "8ad2951c.2df708",
          "type": "modbus-write",
          "z": "6fc7552dec67377b",
          "name": "modbusWrite",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "",
          "dataType": "HoldingRegister",
          "adr": "0",
          "quantity": "1",
          "server": "1f258d73662d6493",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 410,
          "y": 220,
          "wires": [
              [
                  "f75a87de7256906f"
              ],
              [
                  "0fd19d9e756cbf0a"
              ]
          ]
      },
      {
          "id": "67dded7e.025904",
          "type": "inject",
          "z": "6fc7552dec67377b",
          "name": "injectTrue",
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
          "onceDelay": "",
          "topic": "",
          "payload": "true",
          "payloadType": "bool",
          "x": 200,
          "y": 220,
          "wires": [
              [
                  "8ad2951c.2df708"
              ]
          ]
      },
      {
          "id": "f75a87de7256906f",
          "type": "helper",
          "z": "6fc7552dec67377b",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 620,
          "y": 200,
          "wires": []
      },
      {
          "id": "0fd19d9e756cbf0a",
          "type": "helper",
          "z": "6fc7552dec67377b",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 620,
          "y": 260,
          "wires": []
      },
      {
          "id": "1f258d73662d6493",
          "type": "modbus-client",
          "z": "6fc7552dec67377b",
          "name": "Modbus Write (Test Write Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10038",
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

  testWriteCycleFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "0eb89de01afbe5db",
          "type": "tab",
          "label": "Modbus Write (Test Write Cycle Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "db2e06f25d3d117c",
          "type": "modbus-server",
          "z": "0eb89de01afbe5db",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10039",
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
          "id": "d8c3087e82ef22da",
          "type": "modbus-write",
          "z": "0eb89de01afbe5db",
          "name": "Write Reset FC5",
          "showStatusActivities": true,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "",
          "dataType": "Coil",
          "adr": "64",
          "quantity": "1",
          "server": "bca4a0c8b2e31807",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 380,
          "y": 220,
          "wires": [
              [
                  "20e73514f881d26f"
              ],
              []
          ]
      },
      {
          "id": "20e73514f881d26f",
          "type": "helper",
          "z": "0eb89de01afbe5db",
          "name": "",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 590,
          "y": 220,
          "wires": []
      },
      {
          "id": "52f99f0d2bf93989",
          "type": "inject",
          "z": "0eb89de01afbe5db",
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
          "repeat": "2",
          "crontab": "",
          "once": false,
          "onceDelay": "",
          "topic": "",
          "payload": "true",
          "payloadType": "bool",
          "x": 190,
          "y": 260,
          "wires": [
              [
                  "d8c3087e82ef22da"
              ]
          ]
      },
      {
          "id": "bda01b1feec64021",
          "type": "inject",
          "z": "0eb89de01afbe5db",
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
          "repeat": "2",
          "crontab": "",
          "once": true,
          "onceDelay": 0.1,
          "topic": "",
          "payload": "false",
          "payloadType": "bool",
          "x": 190,
          "y": 180,
          "wires": [
              [
                  "d8c3087e82ef22da"
              ]
          ]
      },
      {
          "id": "bca4a0c8b2e31807",
          "type": "modbus-client",
          "name": "Modbus Write (Test Write Cycle Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10039",
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

  testWriteDelayFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "3dfe0f59cc9613bc",
          "type": "tab",
          "label": "Modbus Write (Test Write Delay Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "72ce4683636d0c0a",
          "type": "modbus-server",
          "z": "3dfe0f59cc9613bc",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10040",
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
          "id": "ae2e82a19e54f282",
          "type": "modbus-write",
          "z": "3dfe0f59cc9613bc",
          "name": "Write Reset FC5",
          "showStatusActivities": true,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "",
          "dataType": "Coil",
          "adr": "64",
          "quantity": "1",
          "server": "d15494e1b41860aa",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": true,
          "startDelayTime": "1.5",
          "x": 525,
          "y": 247,
          "wires": [
              [
                  "35051034f7d60808"
              ],
              []
          ]
      },
      {
          "id": "35051034f7d60808",
          "type": "helper",
          "z": "3dfe0f59cc9613bc",
          "name": "",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "topic",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 708,
          "y": 241,
          "wires": []
      },
      {
          "id": "289832034034fb8d",
          "type": "inject",
          "z": "3dfe0f59cc9613bc",
          "name": "",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "v": "",
                  "vt": "date"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "0",
          "topic": "",
          "payload": "true",
          "payloadType": "bool",
          "x": 191,
          "y": 152,
          "wires": [
              [
                  "ae2e82a19e54f282"
              ]
          ]
      },
      {
          "id": "f2961c6692bcc3f3",
          "type": "inject",
          "z": "3dfe0f59cc9613bc",
          "name": "",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "v": "",
                  "vt": "date"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "0.5",
          "topic": "",
          "payload": "false",
          "payloadType": "bool",
          "x": 190,
          "y": 192,
          "wires": [
              [
                  "ae2e82a19e54f282"
              ]
          ]
      },
      {
          "id": "d43fd14a7dc74ea5",
          "type": "inject",
          "z": "3dfe0f59cc9613bc",
          "name": "",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "v": "",
                  "vt": "date"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "1",
          "topic": "",
          "payload": "true",
          "payloadType": "bool",
          "x": 189,
          "y": 228,
          "wires": [
              [
                  "ae2e82a19e54f282"
              ]
          ]
      },
      {
          "id": "a56a26c30062c36a",
          "type": "inject",
          "z": "3dfe0f59cc9613bc",
          "name": "",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "v": "",
                  "vt": "date"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "1.5",
          "topic": "",
          "payload": "false",
          "payloadType": "bool",
          "x": 188,
          "y": 268,
          "wires": [
              [
                  "ae2e82a19e54f282"
              ]
          ]
      },
      {
          "id": "8b6c60963caeaa4a",
          "type": "inject",
          "z": "3dfe0f59cc9613bc",
          "name": "",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "v": "",
                  "vt": "date"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "2",
          "topic": "",
          "payload": "true",
          "payloadType": "bool",
          "x": 189,
          "y": 306,
          "wires": [
              [
                  "ae2e82a19e54f282"
              ]
          ]
      },
      {
          "id": "561b38172fb36919",
          "type": "inject",
          "z": "3dfe0f59cc9613bc",
          "name": "",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "v": "",
                  "vt": "date"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "2.5",
          "topic": "",
          "payload": "false",
          "payloadType": "bool",
          "x": 188,
          "y": 346,
          "wires": [
              [
                  "ae2e82a19e54f282"
              ]
          ]
      },
      {
          "id": "d15494e1b41860aa",
          "type": "modbus-client",
          "name": "Modbus Write (Test Write Delay Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10040",
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
  )
}
