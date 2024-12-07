const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testNodeResponseFromServer: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "259559482d297082",
          "type": "tab",
          "label": "Flex Sequencer Test Node Response From Server",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "bae63bd33cee1ff2",
          "type": "modbus-flex-sequencer",
          "z": "259559482d297082",
          "name": "modbusFlexSequencer",
          "sequences": [
              {
                  "name": "",
                  "unitid": "1",
                  "fc": "FC3",
                  "address": "0",
                  "quantity": "10"
              }
          ],
          "server": "92e7bf63.2efd7",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 510,
          "y": 320,
          "wires": [
              [],
              [
                  "a230939cd73e24ba"
              ]
          ]
      },
      {
          "id": "c89201cccb2cf616",
          "type": "modbus-server",
          "z": "259559482d297082",
          "name": "modbusServer",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10008",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 500,
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
          "id": "8875d54182bcd7b1",
          "type": "inject",
          "z": "259559482d297082",
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
          "payload": "{}",
          "payloadType": "json",
          "x": 190,
          "y": 400,
          "wires": [
              [
                  "bae63bd33cee1ff2"
              ]
          ]
      },
      {
          "id": "a230939cd73e24ba",
          "type": "helper",
          "z": "259559482d297082",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 760,
          "y": 340,
          "wires": []
      },
      {
          "id": "92e7bf63.2efd7",
          "type": "modbus-client",
          "name": "Flex Sequencer (Test Node Response From Server)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": true,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10008",
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
          "parallelUnitIdsAllowed": true,
          "showErrors": false,
          "showWarnings": true,
          "showLogs": true
      }
    ]
  ),
  testNodeWithModbusReadError: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "099a749e98995ce3",
          "type": "tab",
          "label": "Flex Sequencer (Test Node With Modbus Read Error)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "a60a969b9c758802",
          "type": "modbus-flex-sequencer",
          "z": "099a749e98995ce3",
          "name": "modbusFlexSequencer",
          "sequences": [
              {
                  "name": "",
                  "unitid": "",
                  "fc": "FC1",
                  "address": "",
                  "quantity": ""
              }
          ],
          "server": "6edab9a68e941df6",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 390,
          "y": 300,
          "wires": [
              [],
              []
          ]
      },
      {
          "id": "deba6c8feae54cda",
          "type": "modbus-server",
          "z": "099a749e98995ce3",
          "name": "modbusServer",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10009",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 380,
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
          "id": "6edab9a68e941df6",
          "type": "modbus-client",
          "name": "Flex Sequence (Test Node With Modbus Read Error)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10009",
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
  testNodeWithInvalidMessage: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "42f6b815d08405c0",
          "type": "tab",
          "label": "Flex Sequencer (Test Node With Invalid Message)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "85034f5f75d66435",
          "type": "helper",
          "z": "42f6b815d08405c0",
          "name": "helper 12",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 820,
          "y": 400,
          "wires": []
      },
      {
          "id": "227c0ce1950c49dd",
          "type": "modbus-flex-sequencer",
          "z": "42f6b815d08405c0",
          "name": "modbusFlexSequencer",
          "sequences": [],
          "server": "2a5ef5fd62f7a4a0",
          "showStatusActivities": true,
          "showErrors": false,
          "showWarnings": true,
          "logIOActivities": false,
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 495,
          "y": 400,
          "wires": [
              [
                  "85034f5f75d66435"
              ],
              []
          ],
          "l": false
      },
      {
          "id": "9ae42c7b81faeecd",
          "type": "inject",
          "z": "42f6b815d08405c0",
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
          "x": 360,
          "y": 340,
          "wires": [
              [
                  "227c0ce1950c49dd"
              ]
          ]
      },
      {
          "id": "c82c7b4ad8dd965e",
          "type": "modbus-server",
          "z": "42f6b815d08405c0",
          "name": "Flex Sequencer (Test Node With Invalid Message)",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10010",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 698.4513549804688,
          "y": 293.4444274902344,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "2a5ef5fd62f7a4a0",
          "type": "modbus-client",
          "name": "Flex Sequencer (Test Node With Invalid Message)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10010",
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
  testNodeWithValidSequence: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "2fa65bfc72379f44",
          "type": "tab",
          "label": "Flex Sequencer (Test Node With Valid Sequence)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "2b7063dbd84388c7",
          "type": "modbus-flex-sequencer",
          "z": "2fa65bfc72379f44",
          "name": "modbusFlexSequencer",
          "sequences": [
              {
                  "name": "",
                  "unitid": "1",
                  "fc": "FC3",
                  "address": "0",
                  "quantity": "10"
              }
          ],
          "server": "d069c273a3b5b2d0",
          "showStatusActivities": true,
          "showErrors": false,
          "showWarnings": false,
          "logIOActivities": false,
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "delayOnStart": false,
          "startDelayTime": "",
          "x": 730,
          "y": 400,
          "wires": [
              [],
              [
                  "f3e2ec971593fc15"
              ]
          ]
      },
      {
          "id": "256b6d9d868f4b73",
          "type": "modbus-server",
          "z": "2fa65bfc72379f44",
          "name": "modbusServer",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10011",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 720,
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
          "id": "d1aa271468720fce",
          "type": "inject",
          "z": "2fa65bfc72379f44",
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
          "payload": "{\"payload\":\"test payload\",\"sequences\":[{\"unitid\":1,\"fc\":\"FC3\",\"address\":0,\"quantity\":10}]}",
          "payloadType": "json",
          "x": 490,
          "y": 420,
          "wires": [
              [
                  "2b7063dbd84388c7"
              ]
          ]
      },
      {
          "id": "f3e2ec971593fc15",
          "type": "helper",
          "z": "2fa65bfc72379f44",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 1000,
          "y": 360,
          "wires": []
      },
      {
          "id": "d069c273a3b5b2d0",
          "type": "modbus-client",
          "name": "Flex Sequencer (Test Node With Valid Sequence)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10011",
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
