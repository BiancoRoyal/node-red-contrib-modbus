const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testFlowWithNoServer: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "1bd63620aca5cdd8",
          "type": "tab",
          "label": "Flex Connector Test Flow No Server",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "1ec957cb17dfabcb",
          "type": "inject",
          "z": "1bd63620aca5cdd8",
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
          "payload": "{\"connectorType\":\"TCP\",\"tcpHost\":\"127.0.0.1\",\"tcpPort\":\"10502\",\"unitId\":2}",
          "payloadType": "json",
          "x": 310,
          "y": 100,
          "wires": [
              [
                  "e9315827bb3e24d4"
              ]
          ]
      },
      {
          "id": "e9315827bb3e24d4",
          "type": "modbus-flex-connector",
          "z": "1bd63620aca5cdd8",
          "name": "",
          "maxReconnectsPerMinute": 4,
          "emptyQueue": false,
          "showStatusActivities": false,
          "showErrors": false,
          "server": "a477577e.9e0bv",
          "emptyMsgOnFail": false,
          "configMsgOnChange": false,
          "x": 550,
          "y": 260,
          "wires": [
              [
                  "9fb91376fb339b1c"
              ]
          ]
      },
      {
          "id": "9fb91376fb339b1c",
          "type": "helper",
          "z": "1bd63620aca5cdd8",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 920,
          "y": 220,
          "wires": []
      }
    ]),
  testFlowWithShowActivities: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "9678762402c7e383",
          "type": "tab",
          "label": "Flex Connector Test Flow With Show Activities",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "8beab67dacf7d278",
          "type": "inject",
          "z": "9678762402c7e383",
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
          "payload": "{\"connectorType\":\"TCP\",\"tcpHost\":\"127.0.0.1\",\"tcpPort\":\"10502\",\"unitId\":2}",
          "payloadType": "json",
          "x": 270,
          "y": 240,
          "wires": [
              [
                  "09f2af6557c9740f"
              ]
          ]
      },
      {
          "id": "09f2af6557c9740f",
          "type": "modbus-flex-connector",
          "z": "9678762402c7e383",
          "name": "",
          "maxReconnectsPerMinute": 4,
          "emptyQueue": false,
          "showStatusActivities": true,
          "showErrors": false,
          "server": "a477577e.9e0bc",
          "emptyMsgOnFail": false,
          "configMsgOnChange": false,
          "x": 550,
          "y": 240,
          "wires": [
              [
                  "bb644fa2d17a4daf"
              ]
          ]
      },
      {
          "id": "68b0aa8eb3ba36dd",
          "type": "modbus-server",
          "z": "9678762402c7e383",
          "name": "Test Flow With Show Activities Server",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10005",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 750,
          "y": 120,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "bb644fa2d17a4daf",
          "type": "helper",
          "z": "9678762402c7e383",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 840,
          "y": 240,
          "wires": []
      },
      {
          "id": "a477577e.9e0bc",
          "type": "modbus-client",
          "name": "Flex Connector Modbus Switch TCP (Test Flow With Show Activities)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10005",
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
          "id": "1347abebf4a31e1d",
          "type": "tab",
          "label": "Flex Connector Test Should Be Loaded Flow",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "590974b56aaf9960",
          "type": "modbus-flex-connector",
          "z": "1347abebf4a31e1d",
          "name": "modbus flex connector",
          "maxReconnectsPerMinute": 4,
          "emptyQueue": false,
          "showStatusActivities": false,
          "showErrors": false,
          "server": "6e941a076a884151",
          "emptyMsgOnFail": false,
          "configMsgOnChange": false,
          "x": 760,
          "y": 420,
          "wires": [
              [
                  "d1081befe0143f4e"
              ]
          ]
      },
      {
          "id": "1367e1e7d04a318e",
          "type": "inject",
          "z": "1347abebf4a31e1d",
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
          "payload": "{\"connectorType\": \"TCP\", \"tcpHost\": \"127.0.0.1\", \"tcpPort\": \"12512\"}",
          "payloadType": "json",
          "x": 520,
          "y": 400,
          "wires": [
              [
                  "590974b56aaf9960"
              ]
          ]
      },
      {
          "id": "bbeab1ff6c1f8937",
          "type": "modbus-server",
          "z": "1347abebf4a31e1d",
          "name": "Flex Connector Test Should Be Loaded Flow",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10006",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 790,
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
          "id": "d1081befe0143f4e",
          "type": "helper",
          "z": "1347abebf4a31e1d",
          "name": "helper 16",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 1170,
          "y": 400,
          "wires": []
      },
      {
          "id": "6e941a076a884151",
          "type": "modbus-client",
          "name": "Flex Connector Modbus Switch TCP (Test Should Be Loaded Flow)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10006",
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
  testOnConfigDone: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "a04da2619855cb80",
          "type": "tab",
          "label": "Flex Connector Test On Config Done",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "9426e4077eec7959",
          "type": "inject",
          "z": "a04da2619855cb80",
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
          "payload": "{\"connectorType\":\"TCP\",\"tcpHost\":\"127.0.0.1\",\"tcpPort\":\"10502\",\"unitId\":2}",
          "payloadType": "json",
          "x": 510,
          "y": 260,
          "wires": [
              [
                  "bb1e7809e235149a"
              ]
          ]
      },
      {
          "id": "bb1e7809e235149a",
          "type": "modbus-flex-connector",
          "z": "a04da2619855cb80",
          "name": "",
          "maxReconnectsPerMinute": 4,
          "emptyQueue": false,
          "showStatusActivities": true,
          "showErrors": false,
          "server": "1a4b63d0e8309988",
          "emptyMsgOnFail": false,
          "configMsgOnChange": false,
          "x": 630,
          "y": 400,
          "wires": [
              [
                  "3e20a24776e85dce"
              ]
          ]
      },
      {
          "id": "d4ab02df1a59c897",
          "type": "modbus-server",
          "z": "a04da2619855cb80",
          "name": "modbus-server",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10007",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 760,
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
          "id": "3e20a24776e85dce",
          "type": "helper",
          "z": "a04da2619855cb80",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 1140,
          "y": 380,
          "wires": []
      },
      {
          "id": "1a4b63d0e8309988",
          "type": "modbus-client",
          "name": "Flex Connector Modbus Switch TCP (Test On Config Done)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10007",
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
