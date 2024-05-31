const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testReadCoilMode: helperExtensions.cleanFlowPositionData([
    {
      id: 'd975b1203f71a3b5',
      type: 'modbus-flex-fc',
      z: 'f97dec5ce5d2a799',
      name: 'read_coils',
      showStatusActivities: false,
      showErrors: false,
      showWarnings: true,
      unitid: '1',
      server: '5c2b693859e05456',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      mapPath: '',
      selectedFc: '656f1f56-4193-11ee-8eb6-07ee4f160ac8',
      fc: '0x04',
      requestCard: [
        {
          name: 'startingAddress',
          data: 0,
          offset: 0,
          type: 'uint16be'
        },
        {
          name: 'quantityInputRegisters',
          data: 1,
          offset: 2,
          type: 'uint16be'
        }
      ],
      responseCard: [
        {
          name: 'byteCount',
          data: 0,
          offset: 0,
          type: 'uint8be'
        },
        {
          name: 'inputRegisterValue',
          data: 0,
          offset: 1,
          type: 'uint16be'
        }
      ],
      lastSelectedFc: '656f1f56-4193-11ee-8eb6-07ee4f160ac8',
      x: 450,
      y: 400,
      wires: [
        [
          '29dc12925bb8e2d4'
        ]
      ]
    },
    {
      id: 'c77fdcf307244a2f',
      type: 'modbus-server',
      z: 'f97dec5ce5d2a799',
      name: 'test_server',
      logEnabled: false,
      hostname: '127.0.0.1',
      serverPort: 10502,
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 450,
      y: 300,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '29dc12925bb8e2d4',
      type: 'helper',
      z: 'f97dec5ce5d2a799',
      name: 'msg.coil',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 880,
      y: 400,
      wires: []
    },
    {
      id: '5c2b693859e05456',
      type: 'modbus-client',
      name: 'test_server',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '10502',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'none',
      serialConnectionDelay: '100',
      serialAsciiResponseStartDelimiter: '0x3A',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true,
      showWarnings: true,
      showLogs: true
    }
  ]),
  testReadDiscreteInputs: helperExtensions.cleanFlowPositionData([
    {
      id: '91a3b0e2bf45f30f',
      type: 'modbus-flex-fc',
      z: 'a4817461065aa28e',
      name: 'read_discrete_inputs',
      showStatusActivities: false,
      showErrors: true,
      showWarnings: true,
      unitid: '1',
      server: '82f3cd97a8d8cb41',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      mapPath: '',
      selectedFc: '4716b4b8-4190-11ee-87bb-878fc006dbef',
      fc: '0x02',
      requestCard: [
        {
          name: 'startingAddress',
          data: 0,
          offset: 0,
          type: 'uint16be'
        },
        {
          name: 'quantityDiscreteInputs',
          data: 2,
          offset: 2,
          type: 'uint16be'
        }
      ],
      responseCard: [
        {
          name: 'byteCount',
          data: 0,
          offset: 0,
          type: 'uint8be'
        },
        {
          name: 'inputStatus',
          data: 0,
          offset: 1,
          type: 'uint8be'
        }
      ],
      lastSelectedFc: '4716b4b8-4190-11ee-87bb-878fc006dbef',
      x: 560,
      y: 400,
      wires: [
        [
          'fb40ba802db95cd4'
        ]
      ]
    },
    {
      id: 'fb40ba802db95cd4',
      type: 'helper',
      z: 'a4817461065aa28e',
      name: 'msg.discrete',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 970,
      y: 400,
      wires: []
    },
    {
      id: '82f3cd97a8d8cb41',
      type: 'modbus-client',
      name: '',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: true,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '10505',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB0',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'even',
      serialConnectionDelay: '10',
      serialAsciiResponseStartDelimiter: '0x3A',
      unit_id: '0',
      commandDelay: '100',
      clientTimeout: '2000',
      reconnectOnTimeout: false,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true,
      showErrors: false,
      showWarnings: true,
      showLogs: true
    }
  ]),
  testReadHoldingRegisters: helperExtensions.cleanFlowPositionData([
    {
      id: '6221205716f79514',
      type: 'modbus-flex-fc',
      z: '8eabc925a5de4ae2',
      name: 'read_holding_registers',
      showStatusActivities: false,
      showErrors: true,
      showWarnings: true,
      unitid: '1',
      server: '82f3cd97a8d8cb41',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      mapPath: '',
      selectedFc: 'bdd84caa-4191-11ee-989f-4384dc45e6c3',
      fc: '0x03',
      requestCard: [
        {
          name: 'startingAddress',
          data: 0,
          offset: 0,
          type: 'uint16be'
        },
        {
          name: 'quantityRegisters',
          data: 1,
          offset: 2,
          type: 'uint16be'
        }
      ],
      responseCard: [
        {
          name: 'byteCount',
          data: 0,
          offset: 0,
          type: 'uint8be'
        },
        {
          name: 'HoldingRegisterValue',
          data: 0,
          offset: 1,
          type: 'uint16be'
        }
      ],
      lastSelectedFc: 'bdd84caa-4191-11ee-989f-4384dc45e6c3',
      x: 340,
      y: 300,
      wires: [
        [
          '49ba2d35390e9674'
        ]
      ]
    },
    {
      id: '49ba2d35390e9674',
      type: 'helper',
      z: '8eabc925a5de4ae2',
      name: 'msg.holding',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 750,
      y: 300,
      wires: []
    },
    {
      id: '82f3cd97a8d8cb41',
      type: 'modbus-client',
      name: '',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: true,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '10505',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB0',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'even',
      serialConnectionDelay: '10',
      serialAsciiResponseStartDelimiter: '0x3A',
      unit_id: '0',
      commandDelay: '100',
      clientTimeout: '2000',
      reconnectOnTimeout: false,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true,
      showErrors: false,
      showWarnings: true,
      showLogs: true
    }
  ]),
  testReadInputRegisters: helperExtensions.cleanFlowPositionData([
    {
      id: '64ae1784a06caa13',
      type: 'modbus-flex-fc',
      z: 'b7fd05864bab9faf',
      name: 'read_input_registers',
      showStatusActivities: false,
      showErrors: true,
      showWarnings: true,
      unitid: '1',
      server: '82f3cd97a8d8cb41',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      mapPath: '',
      selectedFc: '656f1f56-4193-11ee-8eb6-07ee4f160ac8',
      fc: '0x04',
      requestCard: [
        {
          name: 'startingAddress',
          data: 0,
          offset: 0,
          type: 'uint16be'
        },
        {
          name: 'quantityInputRegisters',
          data: 1,
          offset: 2,
          type: 'uint16be'
        }
      ],
      responseCard: [
        {
          name: 'byteCount',
          data: 0,
          offset: 0,
          type: 'uint8be'
        },
        {
          name: 'inputRegisterValue',
          data: 0,
          offset: 1,
          type: 'uint16be'
        }
      ],
      lastSelectedFc: '656f1f56-4193-11ee-8eb6-07ee4f160ac8',
      x: 720,
      y: 300,
      wires: [
        [
          'adf0520f41e2ee87'
        ]
      ]
    },
    {
      id: 'adf0520f41e2ee87',
      type: 'helper',
      z: 'b7fd05864bab9faf',
      name: 'msg.input',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 1120,
      y: 300,
      wires: []
    },
    {
      id: '82f3cd97a8d8cb41',
      type: 'modbus-client',
      name: '',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: true,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '10505',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB0',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'even',
      serialConnectionDelay: '10',
      serialAsciiResponseStartDelimiter: '0x3A',
      unit_id: '0',
      commandDelay: '100',
      clientTimeout: '2000',
      reconnectOnTimeout: false,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true,
      showErrors: false,
      showWarnings: true,
      showLogs: true
    }
  ]),
  testWriteCoils: helperExtensions.cleanFlowPositionData([
    {
      id: '561e7b6cc3309d91',
      type: 'modbus-flex-fc',
      z: '704de12dfe34f46a',
      name: 'write_coil',
      showStatusActivities: false,
      showErrors: true,
      showWarnings: true,
      unitid: '1',
      server: '82f3cd97a8d8cb41',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      mapPath: '',
      selectedFc: '41846e1e-4195-11ee-be5c-6377293e4ebe',
      fc: '0x05',
      requestCard: [
        {
          name: 'outputAddress',
          data: 0,
          offset: 0,
          type: 'uint16be'
        },
        {
          name: 'outputValue',
          data: 0,
          offset: 2,
          type: 'uint16be'
        }
      ],
      responseCard: [
        {
          name: 'outputAddress',
          data: 0,
          offset: 0,
          type: 'uint16be'
        },
        {
          name: 'outputValue',
          data: 0,
          offset: 2,
          type: 'uint16be'
        }
      ],
      lastSelectedFc: '41846e1e-4195-11ee-be5c-6377293e4ebe',
      x: 300,
      y: 320,
      wires: [
        [
          'b92113324d7d7305'
        ]
      ]
    },
    {
      id: 'b92113324d7d7305',
      type: 'helper',
      z: '704de12dfe34f46a',
      name: 'msg.cw',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 740,
      y: 320,
      wires: []
    },
    {
      id: '82f3cd97a8d8cb41',
      type: 'modbus-client',
      name: '',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: true,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '10505',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB0',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'even',
      serialConnectionDelay: '10',
      serialAsciiResponseStartDelimiter: '0x3A',
      unit_id: '0',
      commandDelay: '100',
      clientTimeout: '2000',
      reconnectOnTimeout: false,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true,
      showErrors: false,
      showWarnings: true,
      showLogs: true
    }
  ]),
  testWriteRegisters: helperExtensions.cleanFlowPositionData([
    {
      id: 'd123ea6a1564abfb',
      type: 'modbus-flex-fc',
      z: '39ec919e9ef37851',
      name: 'write_register',
      showStatusActivities: false,
      showErrors: true,
      showWarnings: true,
      unitid: '1',
      server: '82f3cd97a8d8cb41',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      mapPath: '',
      selectedFc: 'fcdf0de4-4196-11ee-9c64-773f826599e6',
      fc: '0x06',
      requestCard: [
        {
          name: 'registerAddress',
          data: 0,
          offset: 0,
          type: 'uint16be'
        },
        {
          name: 'registerValue',
          data: 0,
          offset: 2,
          type: 'uint16be'
        }
      ],
      responseCard: [
        {
          name: 'registerAddress',
          data: 0,
          offset: 0,
          type: 'uint16be'
        },
        {
          name: 'registerValue',
          data: 0,
          offset: 2,
          type: 'uint16be'
        }
      ],
      lastSelectedFc: 'fcdf0de4-4196-11ee-9c64-773f826599e6',
      x: 580,
      y: 420,
      wires: [
        [
          '26dd0674b3533a79'
        ]
      ]
    },
    {
      id: '26dd0674b3533a79',
      type: 'helper',
      z: '39ec919e9ef37851',
      name: 'msg.wr',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 1000,
      y: 420,
      wires: []
    },
    {
      id: '82f3cd97a8d8cb41',
      type: 'modbus-client',
      name: '',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: true,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '10505',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB0',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'even',
      serialConnectionDelay: '10',
      serialAsciiResponseStartDelimiter: '0x3A',
      unit_id: '0',
      commandDelay: '100',
      clientTimeout: '2000',
      reconnectOnTimeout: false,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true,
      showErrors: false,
      showWarnings: true,
      showLogs: true
    }
  ]),
  testFlexClientWithoutConnection: helperExtensions.cleanFlowPositionData([
    {
      id: '87bd51afcaba0962',
      type: 'modbus-flex-fc',
      z: 'd5de586235c37384',
      name: 'flex-fc-error',
      showStatusActivities: false,
      showErrors: true,
      showWarnings: true,
      unitid: '1',
      server: '',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      mapPath: '',
      selectedFc: '2813f7a2-40f4-11ee-a078-f7298669a6cf',
      fc: '0x01',
      requestCard: [
        {
          name: 'startingAddress',
          data: 0,
          offset: 0,
          type: 'uint16be'
        },
        {
          name: 'quantityCoils',
          data: 8,
          offset: 2,
          type: 'uint16be'
        }
      ],
      responseCard: [
        {
          name: 'byteCount',
          data: 0,
          offset: 0,
          type: 'uint8be'
        },
        {
          name: 'coilStatus',
          data: 0,
          offset: 1,
          type: 'uint8be'
        }
      ],
      lastSelectedFc: '2813f7a2-40f4-11ee-a078-f7298669a6cf',
      x: 570,
      y: 380,
      wires: [
        [
          '49f172669d7a6970'
        ]
      ]
    },
    {
      id: '49f172669d7a6970',
      type: 'helper',
      z: 'd5de586235c37384',
      name: 'msg.func',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 860,
      y: 380,
      wires: []
    }
  ]),
  testFlexFcDataInput: helperExtensions.cleanFlowPositionData([
    {
      id: 'e46d65450573abf8',
      type: 'function',
      z: '78a38be34de5b042',
      name: 'function 1',
      func: 'msg = {\n    payload: {\n        unitId: 0x01,\n        response: [],\n        request: [],\n    }\n};\n\nreturn msg;',
      outputs: 1,
      timeout: 0,
      noerr: 0,
      initialize: '',
      finalize: '',
      libs: [],
      x: 520,
      y: 300,
      wires: [
        [
          '912e8ddbda77ee3c'
        ]
      ]
    },
    {
      id: 'f46976f3bfe57934',
      type: 'helper',
      z: '78a38be34de5b042',
      name: 'helper 1',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'false',
      statusVal: '',
      statusType: 'auto',
      x: 980,
      y: 300,
      wires: []
    },
    {
      id: '912e8ddbda77ee3c',
      type: 'modbus-flex-fc',
      z: '78a38be34de5b042',
      name: 'read_coils',
      showStatusActivities: false,
      showErrors: false,
      showWarnings: true,
      unitid: '1',
      server: '5c2b693859e05456',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      mapPath: '',
      selectedFc: '656f1f56-4193-11ee-8eb6-07ee4f160ac8',
      fc: '0x04',
      requestCard: [
        {
          name: 'startingAddress',
          data: 0,
          offset: 0,
          type: 'uint16be'
        },
        {
          name: 'quantityInputRegisters',
          data: 1,
          offset: 2,
          type: 'uint16be'
        }
      ],
      responseCard: [
        {
          name: 'byteCount',
          data: 0,
          offset: 0,
          type: 'uint8be'
        },
        {
          name: 'inputRegisterValue',
          data: 0,
          offset: 1,
          type: 'uint16be'
        }
      ],
      lastSelectedFc: '656f1f56-4193-11ee-8eb6-07ee4f160ac8',
      x: 750,
      y: 300,
      wires: [
        [
          'f46976f3bfe57934'
        ]
      ]
    },
    {
      id: '5c2b693859e05456',
      type: 'modbus-client',
      name: 'test_server',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '10502',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'none',
      serialConnectionDelay: '100',
      serialAsciiResponseStartDelimiter: '0x3A',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true,
      showWarnings: true,
      showLogs: true
    }
  ])
}
