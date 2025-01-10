const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testNodeWithoutClientFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "9c0e139fb2b7cf7b",
          "type": "tab",
          "label": "Modbus Write Flex (Test Node Without Client Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "bc5a61b6.a3972",
          "type": "modbus-flex-sequencer",
          "z": "9c0e139fb2b7cf7b",
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
          "server": "",
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
          "x": 430,
          "y": 240,
          "wires": [
              [],
              []
          ]
      }
    ]
  ),

  testNodeWithServerFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "d95f52b856f76853",
          "type": "tab",
          "label": "Modbus Flex Sequencer (Test Node With Server Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "3493f55536112011",
          "type": "modbus-flex-sequencer",
          "z": "d95f52b856f76853",
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
          "server": "64e3712b9bf103da",
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
          "id": "209b3e2cc3d386f8",
          "type": "modbus-server",
          "z": "d95f52b856f76853",
          "name": "modbusServer",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10083",
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
          "id": "64e3712b9bf103da",
          "type": "modbus-client",
          "name": "Modbus Flex Sequencer (Test Node With Server Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": true,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10083",
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
  testNodeWithInjectNodeFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "4fc25636e093974a",
          "type": "tab",
          "label": "Modbus Flex Sequencer (Test Node With Inject Node Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "36e50b27544ae869",
          "type": "helper",
          "z": "4fc25636e093974a",
          "name": "helper 12",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 860,
          "y": 300,
          "wires": []
      },
      {
          "id": "f103964b0b8196b9",
          "type": "modbus-flex-sequencer",
          "z": "4fc25636e093974a",
          "name": "modbusFlexSequencer",
          "sequences": [
              {
                  "name": "Foo",
                  "unitid": "2",
                  "fc": "FC1",
                  "address": "1",
                  "quantity": "6"
              }
          ],
          "server": "200271f735858039",
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
          "x": 630,
          "y": 300,
          "wires": [
              [
                  "36e50b27544ae869"
              ],
              []
          ]
      },
      {
          "id": "9e6e2f216d79dc10",
          "type": "inject",
          "z": "4fc25636e093974a",
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
          "x": 400,
          "y": 240,
          "wires": [
              [
                  "f103964b0b8196b9"
              ]
          ]
      },
      {
          "id": "69f247dcbf715643",
          "type": "modbus-server",
          "z": "4fc25636e093974a",
          "name": "modbusServer",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10084",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 628.4513549804688,
          "y": 193.44442749023438,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "200271f735858039",
          "type": "modbus-client",
          "name": "Modbus Flex Sequencer (Test Node With Inject Node Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10084",
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
