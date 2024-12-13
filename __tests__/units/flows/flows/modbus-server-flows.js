const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testServerConfig: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "93a134ab3b3f0450",
          "type": "tab",
          "label": "Modbus Server (Test Server Config)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "249922d5ac72b8cd",
          "type": "modbus-server",
          "z": "93a134ab3b3f0450",
          "name": "Test Modbus Server",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "10044",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": true,
          "showStatusActivities": true,
          "x": 680,
          "y": 200,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      }
  ]
  ),
  testSimpleNodeShouldThrowErrorFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "43415a6c2029e253",
          "type": "tab",
          "label": "Modbus Server (Test Simple Node Should Throw Error Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "178284ea.5055ab",
          "type": "modbus-server",
          "z": "43415a6c2029e253",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "127.0.0.2",
          "serverPort": "10045",
          "responseDelay": "50",
          "delayUnit": "ms",
          "coilsBufferSize": "5000000",
          "holdingBufferSize": 1024,
          "inputBufferSize": 1024,
          "discreteBufferSize": 1024,
          "showErrors": true,
          "showStatusActivities": true,
          "x": 540,
          "y": 200,
          "wires": [
              [
                  "728ea3d5ca53d17c"
              ],
              [
                  "29e05f37de6bcf8d"
              ],
              [
                  "07143f94d2019398"
              ],
              [
                  "95db2a6c5f3817f2"
              ],
              [
                  "4e627b8c2afdead6"
              ]
          ]
      },
      {
          "id": "e44027c30abae8c3",
          "type": "inject",
          "z": "43415a6c2029e253",
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
          "payload": "{\"value\":12,\"register\":\"holding\",\"address\":1,\"disableMsgOutput\":0}",
          "payloadType": "json",
          "x": 330,
          "y": 200,
          "wires": [
              [
                  "178284ea.5055ab"
              ]
          ]
      },
      {
          "id": "4e627b8c2afdead6",
          "type": "helper",
          "z": "43415a6c2029e253",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 800,
          "y": 280,
          "wires": []
      },
      {
          "id": "728ea3d5ca53d17c",
          "type": "helper",
          "z": "43415a6c2029e253",
          "name": "helper 2",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 800,
          "y": 120,
          "wires": []
      },
      {
          "id": "29e05f37de6bcf8d",
          "type": "helper",
          "z": "43415a6c2029e253",
          "name": "helper 3",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 800,
          "y": 160,
          "wires": []
      },
      {
          "id": "07143f94d2019398",
          "type": "helper",
          "z": "43415a6c2029e253",
          "name": "helper 4",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 800,
          "y": 200,
          "wires": []
      },
      {
          "id": "95db2a6c5f3817f2",
          "type": "helper",
          "z": "43415a6c2029e253",
          "name": "helper 5",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 800,
          "y": 240,
          "wires": []
      }
  ]
  ),
  testSimpleNodeShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "f8574d46d0a26734",
          "type": "tab",
          "label": "Modbus Server (Test Simple Node Should Be Loaded Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "46daaa5c3a54773d",
          "type": "modbus-server",
          "z": "f8574d46d0a26734",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "",
          "serverPort": "10046",
          "responseDelay": "50",
          "delayUnit": "ms",
          "coilsBufferSize": 1024,
          "holdingBufferSize": 1024,
          "inputBufferSize": 1024,
          "discreteBufferSize": 1024,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 540,
          "y": 180,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      }
  ]
  ),
  testSimpleNodeToLogError: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "ed9c138b1659604a",
          "type": "tab",
          "label": "Modbus Server (Test Simple Node To Log Error)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "374a21ec15deaee9",
          "type": "modbus-server",
          "z": "ed9c138b1659604a",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "",
          "serverPort": "10047",
          "responseDelay": "50",
          "delayUnit": "ms",
          "coilsBufferSize": 1024,
          "holdingBufferSize": 1024,
          "inputBufferSize": 1024,
          "discreteBufferSize": 1024,
          "showErrors": true,
          "showStatusActivities": false,
          "x": 620,
          "y": 180,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      }
  ]
  ),
  testSimpleNodeWithWrongIPShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "ad3bc8403dd0490d",
          "type": "tab",
          "label": "Modbus Server (Test Simple Node With Wrong IP Should Be Loaded Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "e81530bc1ed9fcfb",
          "type": "modbus-server",
          "z": "ad3bc8403dd0490d",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10048",
          "responseDelay": "50",
          "delayUnit": "ms",
          "coilsBufferSize": 1024,
          "holdingBufferSize": 1024,
          "inputBufferSize": 1024,
          "discreteBufferSize": 1024,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 260,
          "y": 100,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      }
  ]
  ),
  testShouldSendDataOnInputFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "fa6fd94fa586be98",
          "type": "tab",
          "label": "Modbus Server (Test Should Send Data On Input Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "b3b74f084c5a4f5c",
          "type": "modbus-server",
          "z": "fa6fd94fa586be98",
          "name": "modbusServer",
          "logEnabled": false,
          "hostname": "",
          "serverPort": "5504",
          "responseDelay": "50",
          "delayUnit": "ms",
          "coilsBufferSize": 1024,
          "holdingBufferSize": 1024,
          "inputBufferSize": 1024,
          "discreteBufferSize": 1024,
          "showErrors": false,
          "x": 480,
          "y": 260,
          "wires": [
              [
                  "0939f7adc67c2fca"
              ],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "0939f7adc67c2fca",
          "type": "helper",
          "z": "fa6fd94fa586be98",
          "active": true,
          "x": 790,
          "y": 220,
          "wires": []
      },
      {
          "id": "5f4ebf94f9e52291",
          "type": "inject",
          "z": "fa6fd94fa586be98",
          "name": "",
          "repeat": "2",
          "crontab": "",
          "once": true,
          "onceDelay": 0.1,
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 210,
          "y": 260,
          "wires": [
              [
                  "b3b74f084c5a4f5c"
              ]
          ]
      }
  ]
  )
}
