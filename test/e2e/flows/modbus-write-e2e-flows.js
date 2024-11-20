const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  testFlowWritingWithoutInject: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "ebd54ffcc8158708",
          "type": "tab",
          "label": "Modbus Write (Test Without Inject Modbus Write Flow)",
          "disabled": false,
          "info": ""
      },
      {
          "id": "faed374d8984c594",
          "type": "modbus-server",
          "z": "ebd54ffcc8158708",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10018",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": true,
          "showStatusActivities": false,
          "x": 400,
          "y": 140,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "b214ab1595472566",
          "type": "modbus-write",
          "z": "ebd54ffcc8158708",
          "name": "ModbusTestWrite",
          "showStatusActivities": false,
          "showErrors": true,
          "showWarnings": true,
          "unitid": "",
          "dataType": "Coil",
          "adr": "0",
          "quantity": "1",
          "server": "b228125342b7b822",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 410,
          "y": 260,
          "wires": [
              [
                  "2afed2c74781d86e",
                  "1f4d7bf2cb16e92d"
              ],
              [
                  "41a0666f8283e17d",
                  "cd2d51abad7ca11b"
              ]
          ]
      },
      {
          "id": "2afed2c74781d86e",
          "type": "helper",
          "z": "ebd54ffcc8158708",
          "active": true,
          "x": 650,
          "y": 220,
          "wires": []
      },
      {
          "id": "41a0666f8283e17d",
          "type": "helper",
          "z": "ebd54ffcc8158708",
          "active": true,
          "x": 650,
          "y": 380,
          "wires": []
      },
      {
          "id": "1f4d7bf2cb16e92d",
          "type": "modbus-response",
          "z": "ebd54ffcc8158708",
          "name": "",
          "registerShowMax": 20,
          "x": 670,
          "y": 140,
          "wires": []
      },
      {
          "id": "cd2d51abad7ca11b",
          "type": "modbus-response",
          "z": "ebd54ffcc8158708",
          "name": "",
          "registerShowMax": 20,
          "x": 670,
          "y": 300,
          "wires": []
      },
      {
          "id": "95b62a866dd2af4e",
          "type": "comment",
          "z": "ebd54ffcc8158708",
          "name": "Modbus Server",
          "info": "These nodes are to write to the Modbus Server.",
          "x": 400,
          "y": 60,
          "wires": []
      },
      {
          "id": "104ab07dc87edee9",
          "type": "comment",
          "z": "ebd54ffcc8158708",
          "name": "Inject from Test emit",
          "info": "",
          "x": 210,
          "y": 260,
          "wires": []
      },
      {
          "id": "b228125342b7b822",
          "type": "modbus-client",
          "name": "Modbus Read (Test Flow Writing Without Inject)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10018",
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

  testFlowWriting: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "b6f90a63cd609e9f",
          "type": "tab",
          "label": "Test Modbus (Test Flow Writing)",
          "disabled": false,
          "info": ""
      },
      {
          "id": "119026263f1f1364",
          "type": "modbus-server",
          "z": "b6f90a63cd609e9f",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10019",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": true,
          "showStatusActivities": false,
          "x": 220,
          "y": 140,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "54087b7cdf7cce0e",
          "type": "modbus-write",
          "z": "b6f90a63cd609e9f",
          "name": "ModbusTestWrite",
          "showStatusActivities": false,
          "showErrors": true,
          "showWarnings": true,
          "unitid": "",
          "dataType": "Coil",
          "adr": "0",
          "quantity": "1",
          "server": "efb9bb02dafad469",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 830,
          "y": 300,
          "wires": [
              [
                  "873675dfb0602d74",
                  "eacc24132a9aef23"
              ],
              [
                  "de429ec03c7f6740",
                  "84f9028ac5c1b2cf"
              ]
          ]
      },
      {
          "id": "873675dfb0602d74",
          "type": "helper",
          "z": "b6f90a63cd609e9f",
          "active": true,
          "x": 1070,
          "y": 260,
          "wires": []
      },
      {
          "id": "de429ec03c7f6740",
          "type": "helper",
          "z": "b6f90a63cd609e9f",
          "active": true,
          "x": 1070,
          "y": 420,
          "wires": []
      },
      {
          "id": "eacc24132a9aef23",
          "type": "modbus-response",
          "z": "b6f90a63cd609e9f",
          "name": "",
          "registerShowMax": 20,
          "x": 1090,
          "y": 180,
          "wires": []
      },
      {
          "id": "84f9028ac5c1b2cf",
          "type": "modbus-response",
          "z": "b6f90a63cd609e9f",
          "name": "",
          "registerShowMax": 20,
          "x": 1090,
          "y": 340,
          "wires": []
      },
      {
          "id": "b5f567e29baf6dd6",
          "type": "inject",
          "z": "b6f90a63cd609e9f",
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
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "0.5",
          "topic": "",
          "payload": "[1,2,3,4,5,6,7,8,9,10]",
          "payloadType": "json",
          "x": 220,
          "y": 240,
          "wires": [
              [
                  "d4c05f71664a5721"
              ]
          ]
      },
      {
          "id": "d4c05f71664a5721",
          "type": "function",
          "z": "b6f90a63cd609e9f",
          "name": "Write 0-9 on Unit 1 FC15",
          "func": "msg.payload = { value: msg.payload, 'fc': 15, 'unitid': 1, 'address': 0 , 'quantity': 10 };\nreturn msg;",
          "outputs": 1,
          "timeout": "",
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 530,
          "y": 260,
          "wires": [
              [
                  "54087b7cdf7cce0e"
              ]
          ]
      },
      {
          "id": "9832928aec90a808",
          "type": "function",
          "z": "b6f90a63cd609e9f",
          "name": "Write 10-18 on Unit 1 FC15",
          "func": "msg.payload = { value: msg.payload, 'fc': 15, 'unitid': 1, 'address': 10 , 'quantity': 9 };\nreturn msg;",
          "outputs": 1,
          "noerr": 0,
          "x": 520,
          "y": 300,
          "wires": [
              [
                  "54087b7cdf7cce0e"
              ]
          ]
      },
      {
          "id": "5c3c568caf52f73f",
          "type": "inject",
          "z": "b6f90a63cd609e9f",
          "name": "Write single!",
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
          "onceDelay": "1.5",
          "topic": "",
          "payload": "true",
          "payloadType": "bool",
          "x": 230,
          "y": 360,
          "wires": [
              [
                  "b17463d4dc73544b"
              ]
          ]
      },
      {
          "id": "b17463d4dc73544b",
          "type": "function",
          "z": "b6f90a63cd609e9f",
          "name": "Write 10 on Unit 1 FC5",
          "func": "msg.payload = { value: msg.payload, 'fc': 5, 'unitid': 1, 'address': 10 , 'quantity': 1 };\nreturn msg;",
          "outputs": 1,
          "noerr": 0,
          "x": 540,
          "y": 340,
          "wires": [
              [
                  "54087b7cdf7cce0e"
              ]
          ]
      },
      {
          "id": "7d4525972dfb990c",
          "type": "inject",
          "z": "b6f90a63cd609e9f",
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
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": "1",
          "topic": "",
          "payload": "[1,2,3,4,5,6,7,8,9]",
          "payloadType": "json",
          "x": 220,
          "y": 300,
          "wires": [
              [
                  "9832928aec90a808"
              ]
          ]
      },
      {
          "id": "a7a26c4539877121",
          "type": "comment",
          "z": "b6f90a63cd609e9f",
          "name": "Modbus Server",
          "info": "These nodes are to write to the Modbus Server.",
          "x": 220,
          "y": 60,
          "wires": []
      },
      {
          "id": "efb9bb02dafad469",
          "type": "modbus-client",
          "name": "Modbus Write (Test Flow Writing)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10019",
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
