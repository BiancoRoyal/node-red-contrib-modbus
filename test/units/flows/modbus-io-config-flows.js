
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testShouldBeLoadedFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "ec42ecc63a604e72",
      "type": "tab",
      "label": "Should Be Loaded",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "b0fefd31.802188",
      "type": "modbus-read",
      "z": "ec42ecc63a604e72",
      "name": "",
      "topic": "",
      "showStatusActivities": false,
      "logIOActivities": false,
      "showErrors": false,
      "unitid": "",
      "dataType": "",
      "adr": "",
      "quantity": "",
      "rate": "",
      "rateUnit": "",
      "delayOnStart": false,
      "startDelayTime": "",
      "server": "",
      "useIOFile": true,
      "ioFile": "2f5a90d.bcaa1f",
      "useIOForPayload": false,
      "emptyMsgOnFail": false,
      "x": 350,
      "y": 240,
      "wires": [
        [],
        []
      ]
    },
    {
      "id": "2f5a90d.bcaa1f",
      "type": "modbus-io-config",
      "name": "ModbusIOConfig",
      "path": "testpath",
      "format": "utf8",
      "addressOffset": ""
    }
  ])

}