const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testReadCoilMode: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "3842dacdf19f068e",
          "type": "tab",
          "label": "Modbus Flex FC (Test Read Coil Mode)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "d975b1203f71a3b5",
          "type": "modbus-flex-fc",
          "z": "3842dacdf19f068e",
          "name": "read_coils",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "1",
          "server": "6420373db0f46845",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "mapPath": "",
          "selectedFc": "656f1f56-4193-11ee-8eb6-07ee4f160ac8",
          "fc": "0x04",
          "requestCard": [
              {
                  "name": "startingAddress",
                  "data": 0,
                  "offset": 0,
                  "type": "uint16be"
              },
              {
                  "name": "quantityInputRegisters",
                  "data": 1,
                  "offset": 2,
                  "type": "uint16be"
              }
          ],
          "responseCard": [
              {
                  "name": "byteCount",
                  "data": 0,
                  "offset": 0,
                  "type": "uint8be"
              },
              {
                  "name": "inputRegisterValue",
                  "data": 0,
                  "offset": 1,
                  "type": "uint16be"
              }
          ],
          "lastSelectedFc": "656f1f56-4193-11ee-8eb6-07ee4f160ac8",
          "x": 490,
          "y": 400,
          "wires": [
              [
                  "29dc12925bb8e2d4"
              ]
          ]
      },
      {
          "id": "c77fdcf307244a2f",
          "type": "modbus-server",
          "z": "3842dacdf19f068e",
          "name": "test_server",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10091",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 490,
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
          "id": "29dc12925bb8e2d4",
          "type": "helper",
          "z": "3842dacdf19f068e",
          "name": "msg.coil",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 920,
          "y": 400,
          "wires": []
      },
      {
          "id": "6420373db0f46845",
          "type": "modbus-client",
          "name": "Modbus Flex FC (Test Read Coil Mode)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10091",
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
  testReadDiscreteInputs: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "d4e1b08f9dd9adb7",
          "type": "tab",
          "label": "Modbus Flex FC (Test Read Discrete Inputs)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "91a3b0e2bf45f30f",
          "type": "modbus-flex-fc",
          "z": "d4e1b08f9dd9adb7",
          "name": "read_discrete_inputs",
          "showStatusActivities": false,
          "showErrors": true,
          "showWarnings": true,
          "unitid": "1",
          "server": "1d0725da5de5fda5",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "mapPath": "",
          "selectedFc": "4716b4b8-4190-11ee-87bb-878fc006dbef",
          "fc": "0x02",
          "requestCard": [
              {
                  "name": "startingAddress",
                  "data": 0,
                  "offset": 0,
                  "type": "uint16be"
              },
              {
                  "name": "quantityDiscreteInputs",
                  "data": 2,
                  "offset": 2,
                  "type": "uint16be"
              }
          ],
          "responseCard": [
              {
                  "name": "byteCount",
                  "data": 0,
                  "offset": 0,
                  "type": "uint8be"
              },
              {
                  "name": "inputStatus",
                  "data": 0,
                  "offset": 1,
                  "type": "uint8be"
              }
          ],
          "lastSelectedFc": "4716b4b8-4190-11ee-87bb-878fc006dbef",
          "x": 580,
          "y": 280,
          "wires": [
              [
                  "fb40ba802db95cd4"
              ]
          ]
      },
      {
          "id": "fb40ba802db95cd4",
          "type": "helper",
          "z": "d4e1b08f9dd9adb7",
          "name": "msg.discrete",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 990,
          "y": 280,
          "wires": []
      },
      {
          "id": "e751be1eddbfd50b",
          "type": "modbus-server",
          "z": "d4e1b08f9dd9adb7",
          "name": "",
          "logEnabled": false,
          "hostname": "0.0.0.0",
          "serverPort": "10092",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 580,
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
          "id": "1d0725da5de5fda5",
          "type": "modbus-client",
          "name": "Modbus Flex FC (Test Read Discrete Inputs)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10092",
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
  testReadHoldingRegisters: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "286e7237948530b6",
          "type": "tab",
          "label": "Modbus Flex FC (Test Read Holding Registers)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "b1b445005948d853",
          "type": "modbus-flex-fc",
          "z": "286e7237948530b6",
          "name": "read_holding_registers",
          "showStatusActivities": false,
          "showErrors": true,
          "showWarnings": true,
          "unitid": "1",
          "server": "4285ce3d9df9c562",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "mapPath": "",
          "selectedFc": "bdd84caa-4191-11ee-989f-4384dc45e6c3",
          "fc": "0x03",
          "requestCard": [
              {
                  "name": "startingAddress",
                  "data": 0,
                  "offset": 0,
                  "type": "uint16be"
              },
              {
                  "name": "quantityRegisters",
                  "data": 1,
                  "offset": 2,
                  "type": "uint16be"
              }
          ],
          "responseCard": [
              {
                  "name": "byteCount",
                  "data": 0,
                  "offset": 0,
                  "type": "uint8be"
              },
              {
                  "name": "HoldingRegisterValue",
                  "data": 0,
                  "offset": 1,
                  "type": "uint16be"
              }
          ],
          "lastSelectedFc": "bdd84caa-4191-11ee-989f-4384dc45e6c3",
          "x": 400,
          "y": 280,
          "wires": [
              [
                  "31b13c01979de6ee"
              ]
          ]
      },
      {
          "id": "31b13c01979de6ee",
          "type": "helper",
          "z": "286e7237948530b6",
          "name": "msg.holding",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 790,
          "y": 280,
          "wires": []
      },
      {
          "id": "6184c1150516d257",
          "type": "modbus-server",
          "z": "286e7237948530b6",
          "name": "",
          "logEnabled": false,
          "hostname": "0.0.0.0",
          "serverPort": "10093",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 400,
          "y": 160,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "4285ce3d9df9c562",
          "type": "modbus-client",
          "name": "Mdobus Flex FC (Test Read Holding Registers)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10093",
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
  testReadInputRegisters: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "1d42adf78b533e2b",
          "type": "tab",
          "label": "Modbus Flex FC (Test Read Input Registers)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "b05b6bcab3966b4f",
          "type": "modbus-flex-fc",
          "z": "1d42adf78b533e2b",
          "name": "read_input_registers",
          "showStatusActivities": false,
          "showErrors": true,
          "showWarnings": true,
          "unitid": "1",
          "server": "dc9a91bda95433b3",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "mapPath": "",
          "selectedFc": "656f1f56-4193-11ee-8eb6-07ee4f160ac8",
          "fc": "0x04",
          "requestCard": [
              {
                  "name": "startingAddress",
                  "data": 0,
                  "offset": 0,
                  "type": "uint16be"
              },
              {
                  "name": "quantityInputRegisters",
                  "data": 1,
                  "offset": 2,
                  "type": "uint16be"
              }
          ],
          "responseCard": [
              {
                  "name": "byteCount",
                  "data": 0,
                  "offset": 0,
                  "type": "uint8be"
              },
              {
                  "name": "inputRegisterValue",
                  "data": 0,
                  "offset": 1,
                  "type": "uint16be"
              }
          ],
          "lastSelectedFc": "656f1f56-4193-11ee-8eb6-07ee4f160ac8",
          "x": 460,
          "y": 240,
          "wires": [
              [
                  "a5d9e4bcc7a369d2"
              ]
          ]
      },
      {
          "id": "a5d9e4bcc7a369d2",
          "type": "helper",
          "z": "1d42adf78b533e2b",
          "name": "msg.input",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 860,
          "y": 240,
          "wires": []
      },
      {
          "id": "bbf1248bcb665b4c",
          "type": "modbus-server",
          "z": "1d42adf78b533e2b",
          "name": "",
          "logEnabled": false,
          "hostname": "0.0.0.0",
          "serverPort": "10094",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 440,
          "y": 160,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "dc9a91bda95433b3",
          "type": "modbus-client",
          "name": "Modbus Flex FC (Test Read Input Registers)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10094",
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
  testWriteCoils: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "b3adad790ac7539c",
          "type": "tab",
          "label": "Modbus Flex FC (Test Write Coils)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "31f97c342804156a",
          "type": "modbus-flex-fc",
          "z": "b3adad790ac7539c",
          "name": "write_coil",
          "showStatusActivities": false,
          "showErrors": true,
          "showWarnings": true,
          "unitid": "1",
          "server": "2ea2c0a53bd39934",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "mapPath": "",
          "selectedFc": "41846e1e-4195-11ee-be5c-6377293e4ebe",
          "fc": "0x05",
          "requestCard": [
              {
                  "name": "outputAddress",
                  "data": 0,
                  "offset": 0,
                  "type": "uint16be"
              },
              {
                  "name": "outputValue",
                  "data": 0,
                  "offset": 2,
                  "type": "uint16be"
              }
          ],
          "responseCard": [
              {
                  "name": "outputAddress",
                  "data": 0,
                  "offset": 0,
                  "type": "uint16be"
              },
              {
                  "name": "outputValue",
                  "data": 0,
                  "offset": 2,
                  "type": "uint16be"
              }
          ],
          "lastSelectedFc": "41846e1e-4195-11ee-be5c-6377293e4ebe",
          "x": 300,
          "y": 300,
          "wires": [
              [
                  "c2572538e80dec1e"
              ]
          ]
      },
      {
          "id": "c2572538e80dec1e",
          "type": "helper",
          "z": "b3adad790ac7539c",
          "name": "msg.cw",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 740,
          "y": 300,
          "wires": []
      },
      {
          "id": "7754e65bf9c3d125",
          "type": "modbus-server",
          "z": "b3adad790ac7539c",
          "name": "",
          "logEnabled": false,
          "hostname": "0.0.0.0",
          "serverPort": "10095",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 320,
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
          "id": "2ea2c0a53bd39934",
          "type": "modbus-client",
          "name": "",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10095",
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
  testWriteRegisters: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "cfd6c3341dc40451",
          "type": "tab",
          "label": "Modbus Flex FC (Test Write Registers)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "368cdbd585220d54",
          "type": "modbus-flex-fc",
          "z": "cfd6c3341dc40451",
          "name": "write_register",
          "showStatusActivities": false,
          "showErrors": true,
          "showWarnings": true,
          "unitid": "1",
          "server": "e1e443b76a432322",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "mapPath": "",
          "selectedFc": "fcdf0de4-4196-11ee-9c64-773f826599e6",
          "fc": "0x06",
          "requestCard": [
              {
                  "name": "registerAddress",
                  "data": 0,
                  "offset": 0,
                  "type": "uint16be"
              },
              {
                  "name": "registerValue",
                  "data": 0,
                  "offset": 2,
                  "type": "uint16be"
              }
          ],
          "responseCard": [
              {
                  "name": "registerAddress",
                  "data": 0,
                  "offset": 0,
                  "type": "uint16be"
              },
              {
                  "name": "registerValue",
                  "data": 0,
                  "offset": 2,
                  "type": "uint16be"
              }
          ],
          "lastSelectedFc": "fcdf0de4-4196-11ee-9c64-773f826599e6",
          "x": 460,
          "y": 220,
          "wires": [
              [
                  "e25af7dc8db505e0"
              ]
          ]
      },
      {
          "id": "e25af7dc8db505e0",
          "type": "helper",
          "z": "cfd6c3341dc40451",
          "name": "msg.wr",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 880,
          "y": 220,
          "wires": []
      },
      {
          "id": "8f480ba56420f317",
          "type": "modbus-server",
          "z": "cfd6c3341dc40451",
          "name": "",
          "logEnabled": false,
          "hostname": "0.0.0.0",
          "serverPort": "10096",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 460,
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
          "id": "e1e443b76a432322",
          "type": "modbus-client",
          "name": "Modbus Flex FC (Test Write Registers)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10096",
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
  testFlexClientWithoutConnection: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "8940c7a2e310d24f",
          "type": "tab",
          "label": "Modbus Flex FC (Test Flex Client Without Connection)",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "87bd51afcaba0962",
          "type": "modbus-flex-fc",
          "z": "8940c7a2e310d24f",
          "name": "flex-fc-error",
          "showStatusActivities": false,
          "showErrors": true,
          "showWarnings": true,
          "unitid": "1",
          "server": "",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "mapPath": "",
          "selectedFc": "2813f7a2-40f4-11ee-a078-f7298669a6cf",
          "fc": "0x01",
          "requestCard": [
              {
                  "name": "startingAddress",
                  "data": 0,
                  "offset": 0,
                  "type": "uint16be"
              },
              {
                  "name": "quantityCoils",
                  "data": 8,
                  "offset": 2,
                  "type": "uint16be"
              }
          ],
          "responseCard": [
              {
                  "name": "byteCount",
                  "data": 0,
                  "offset": 0,
                  "type": "uint8be"
              },
              {
                  "name": "coilStatus",
                  "data": 0,
                  "offset": 1,
                  "type": "uint8be"
              }
          ],
          "lastSelectedFc": "2813f7a2-40f4-11ee-a078-f7298669a6cf",
          "x": 510,
          "y": 280,
          "wires": [
              [
                  "49f172669d7a6970"
              ]
          ]
      },
      {
          "id": "49f172669d7a6970",
          "type": "helper",
          "z": "8940c7a2e310d24f",
          "name": "msg.func",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 800,
          "y": 280,
          "wires": []
      }
  ]
  ),
  testFlexFcDataInput: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "07e932ba7808f36f",
          "type": "tab",
          "label": "Flow 102",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "dd652878f946d331",
          "type": "function",
          "z": "07e932ba7808f36f",
          "name": "function 1",
          "func": "msg = {\n    payload: {\n        unitId: 0x01,\n        response: [],\n        request: [],\n    }\n};\n\nreturn msg;",
          "outputs": 1,
          "timeout": 0,
          "noerr": 0,
          "initialize": "",
          "finalize": "",
          "libs": [],
          "x": 360,
          "y": 220,
          "wires": [
              [
                  "9bfa725d81755cfc"
              ]
          ]
      },
      {
          "id": "24af59ba679fb0ef",
          "type": "helper",
          "z": "07e932ba7808f36f",
          "name": "helper 1",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 820,
          "y": 220,
          "wires": []
      },
      {
          "id": "9bfa725d81755cfc",
          "type": "modbus-flex-fc",
          "z": "07e932ba7808f36f",
          "name": "read_coils",
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "unitid": "1",
          "server": "93e48bf1f13924dc",
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "mapPath": "",
          "selectedFc": "656f1f56-4193-11ee-8eb6-07ee4f160ac8",
          "fc": "0x04",
          "requestCard": [
              {
                  "name": "startingAddress",
                  "data": 0,
                  "offset": 0,
                  "type": "uint16be"
              },
              {
                  "name": "quantityInputRegisters",
                  "data": 1,
                  "offset": 2,
                  "type": "uint16be"
              }
          ],
          "responseCard": [
              {
                  "name": "byteCount",
                  "data": 0,
                  "offset": 0,
                  "type": "uint8be"
              },
              {
                  "name": "inputRegisterValue",
                  "data": 0,
                  "offset": 1,
                  "type": "uint16be"
              }
          ],
          "lastSelectedFc": "656f1f56-4193-11ee-8eb6-07ee4f160ac8",
          "x": 590,
          "y": 220,
          "wires": [
              [
                  "24af59ba679fb0ef"
              ]
          ]
      },
      {
          "id": "d0045b5f9a58f220",
          "type": "modbus-server",
          "z": "07e932ba7808f36f",
          "name": "",
          "logEnabled": false,
          "hostname": "0.0.0.0",
          "serverPort": "10097",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "showStatusActivities": false,
          "x": 600,
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
          "id": "93e48bf1f13924dc",
          "type": "modbus-client",
          "name": "Modbus Flex FC (Test Flex Fc Data Input)",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": true,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10097",
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
