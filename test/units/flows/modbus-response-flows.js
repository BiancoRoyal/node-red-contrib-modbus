const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  testShortLengthInjectDataFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "4db54e914f1e5f90",
          "type": "tab",
          "label": "Modbus Response (Test To Filter Flow With No Warnings)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "f1ff9252.b5ce18",
          "type": "modbus-response",
          "z": "4db54e914f1e5f90",
          "name": "shortLengthInjectData",
          "registerShowMax": 20,
          "x": 420,
          "y": 200,
          "wires": []
      },
      {
          "id": "8827b34f.682e8",
          "type": "inject",
          "z": "4db54e914f1e5f90",
          "name": "ShortLengthInject",
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
          "payload": "{\"data\":{\"length\":2}}",
          "payloadType": "json",
          "x": 170,
          "y": 200,
          "wires": [
              [
                  "f1ff9252.b5ce18"
              ]
          ]
      }
  ]
  ),

  testLongLengthInjectDataFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "2743e67a33d7b67a",
          "type": "tab",
          "label": "Modbus Response (Test Long Length Inject Data Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "d2e1ea25b04bb763",
          "type": "modbus-response",
          "z": "2743e67a33d7b67a",
          "name": "longLengthInjectData",
          "registerShowMax": 20,
          "x": 480,
          "y": 200,
          "wires": []
      },
      {
          "id": "6f658b96c679e24b",
          "type": "inject",
          "z": "2743e67a33d7b67a",
          "name": "LongLengthInject",
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
          "payload": "{\"data\":{\"length\":22}}",
          "payloadType": "json",
          "x": 210,
          "y": 200,
          "wires": [
              [
                  "d2e1ea25b04bb763"
              ]
          ]
      }
  ]
  ),

  testShortLengthInjectAddressFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "29ea245f9c11947d",
          "type": "tab",
          "label": "Modbus Response (Test Short Length Inject Address Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "975548ef841a5c36",
          "type": "modbus-response",
          "z": "29ea245f9c11947d",
          "name": "shortLengthInjectAddress",
          "registerShowMax": 20,
          "x": 490,
          "y": 200,
          "wires": []
      },
      {
          "id": "ca4b13300ce76a24",
          "type": "inject",
          "z": "29ea245f9c11947d",
          "name": "ShortLengthInject",
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
          "payload": "{\"length\":2, \"address\": {}}",
          "payloadType": "json",
          "x": 210,
          "y": 200,
          "wires": [
              [
                  "975548ef841a5c36"
              ]
          ]
      }
  ]
  ),

  testLongLengthInjectAddressFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "b9857ae03aaa3932",
          "type": "tab",
          "label": "Modbus Response (Test Long Length Inject Address Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "945f19a0f84d2de2",
          "type": "modbus-response",
          "z": "b9857ae03aaa3932",
          "name": "longLengthInjectAddress",
          "registerShowMax": 20,
          "x": 530,
          "y": 200,
          "wires": []
      },
      {
          "id": "74e5fa89a94c1baf",
          "type": "inject",
          "z": "b9857ae03aaa3932",
          "name": "LongLengthInject",
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
          "payload": "{\"length\":22, \"address\": {}}",
          "payloadType": "json",
          "x": 210,
          "y": 200,
          "wires": [
              [
                  "945f19a0f84d2de2"
              ]
          ]
      }
  ]
  ),

  testInjectJustPayloadFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "87f71b93eee069cf",
          "type": "tab",
          "label": "Modbus Response (Test Inject Just Payload Flow)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "672b5322fc5e27c5",
          "type": "modbus-response",
          "z": "87f71b93eee069cf",
          "name": "injectJustPayload",
          "registerShowMax": 20,
          "x": 690,
          "y": 240,
          "wires": []
      },
      {
          "id": "0a6d1e3947f56aa8",
          "type": "inject",
          "z": "87f71b93eee069cf",
          "name": "LongLengthInject",
          "repeat": "",
          "crontab": "",
          "once": true,
          "onceDelay": 0.1,
          "topic": "",
          "payload": "{}",
          "payloadType": "json",
          "x": 470,
          "y": 240,
          "wires": [
              [
                  "672b5322fc5e27c5"
              ]
          ]
      }
  ]
  )
}
