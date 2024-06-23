const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testFlowWithError: helperExtensions.cleanFlowPositionData(
    [
      {
        id: 'fd671d8e8a41aa59',
        type: 'tab',
        label: 'Flow 5',
        disabled: false,
        info: '',
        env: []
      },
      {
        id: 'b8ab5d58623f7665',
        type: 'inject',
        z: 'fd671d8e8a41aa59',
        name: '',
        props: [
          {
            p: 'payload'
          },
          {
            p: 'topic',
            vt: 'str'
          }
        ],
        repeat: '',
        crontab: '',
        once: false,
        onceDelay: 0.1,
        topic: '',
        payload: '',
        payloadType: 'date',
        x: 280,
        y: 340,
        wires: [
          [
            '5bd25e14c9c67f95'
          ]
        ]
      },
      {
        id: '5bd25e14c9c67f95',
        type: 'modbus-flex-fc',
        z: 'fd671d8e8a41aa59',
        name: '',
        showStatusActivities: false,
        showErrors: true,
        showWarnings: true,
        unitid: '1',
        server: 'a24bea7c.848da',
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
        x: 630,
        y: 400,
        wires: [
          [
            '0799672c3be62e41'
          ]
        ]
      },
      {
        id: '0799672c3be62e41',
        type: 'helper',
        z: 'fd671d8e8a41aa59',
        name: 'helper 4',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 840,
        y: 380,
        wires: []
      },
      {
        id: 'a24bea7c.848da',
        type: 'modbus-client',
        name: '',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: true,
        queueLogEnabled: true,
        failureLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: '10509',
        tcpType: 'DEFAULT',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU-BUFFERD',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        serialAsciiResponseStartDelimiter: '',
        unit_id: '1',
        commandDelay: '1',
        clientTimeout: '1000',
        reconnectOnTimeout: true,
        reconnectTimeout: '2000',
        parallelUnitIdsAllowed: true,
        showErrors: false,
        showWarnings: true,
        showLogs: true
      }
    ]),
  testFlowWithMapPath: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '15532b38d5853c6c',
        type: 'tab',
        label: 'Modbus Flex FC Example Flow',
        disabled: false,
        info: ''
      },
      {
        id: 'ae7a166031f43e7c',
        type: 'modbus-server',
        z: '15532b38d5853c6c',
        name: '',
        logEnabled: false,
        hostname: '127.0.0.1',
        serverPort: '10503',
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 10000,
        holdingBufferSize: 10000,
        inputBufferSize: 10000,
        discreteBufferSize: 10000,
        showErrors: false,
        x: 680,
        y: 260,
        wires: [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        id: '50afc07bbe871f33',
        type: 'inject',
        z: '15532b38d5853c6c',
        name: '',
        props: [
          {
            p: 'payload'
          },
          {
            p: 'topic',
            vt: 'str'
          }
        ],
        repeat: '',
        crontab: '',
        once: false,
        onceDelay: 0.1,
        topic: '',
        payload: '{"unitid":1,"fc":"0x04","requestCard":[{"name":"startingAddress","data":0,"offset":0,"type":"uint16be"},{"name":"quantityInputRegisters","data":1,"offset":2,"type":"uint16be"}],"responseCard":[{"name":"byteCount","data":0,"offset":0,"type":"uint8be"},{"name":"inputRegisterValue","data":0,"offset":1,"type":"uint16be"}]}',
        payloadType: 'json',
        x: 250,
        y: 440,
        wires: [
          [
            '1ee7668019d22f8a'
          ]
        ]
      },
      {
        id: '1ee7668019d22f8a',
        type: 'modbus-flex-fc',
        z: '15532b38d5853c6c',
        name: '',
        showStatusActivities: false,
        showErrors: true,
        showWarnings: true,
        unitid: '1',
        server: '4',
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        mapPath: 'path/to/map.json',
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
        x: 490,
        y: 440,
        wires: [
          [
            'ee09c68afff4d0b8'
          ]
        ]
      },
      {
        id: 'ee09c68afff4d0b8',
        type: 'helper',
        z: '15532b38d5853c6c',
        name: 'helper 1',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 740,
        y: 440,
        wires: []
      },
      {
        id: '4',
        type: 'modbus-client',
        name: 'Modbus Server',
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
        unit_id: 1,
        commandDelay: 1,
        clientTimeout: 1000,
        reconnectOnTimeout: true,
        reconnectTimeout: 2000,
        parallelUnitIdsAllowed: true,
        showWarnings: true,
        showLogs: true
      }
    ]
  ),
  testFlowWithNoServer: helperExtensions.cleanFlowPositionData(
    [
      {
        id: 'ad804fafa49a7ed2',
        type: 'tab',
        label: 'Modbus Flex FC Example Flow',
        disabled: false,
        info: ''
      },
      {
        id: '731d4857a7f3f13c',
        type: 'inject',
        z: 'ad804fafa49a7ed2',
        name: '',
        props: [
          {
            p: 'payload'
          },
          {
            p: 'topic',
            vt: 'str'
          }
        ],
        repeat: '',
        crontab: '',
        once: false,
        onceDelay: 0.1,
        topic: '',
        payload: '{"unitid":1,"fc":"0x04","requestCard":[{"name":"startingAddress","data":0,"offset":0,"type":"uint16be"},{"name":"quantityInputRegisters","data":1,"offset":2,"type":"uint16be"}],"responseCard":[{"name":"byteCount","data":0,"offset":0,"type":"uint8be"},{"name":"inputRegisterValue","data":0,"offset":1,"type":"uint16be"}]}',
        payloadType: 'json',
        x: 230,
        y: 660,
        wires: [
          [
            'e096a175bb6a77ae'
          ]
        ]
      },
      {
        id: 'e096a175bb6a77ae',
        type: 'modbus-flex-fc',
        z: 'ad804fafa49a7ed2',
        name: '',
        showStatusActivities: false,
        showErrors: true,
        showWarnings: true,
        unitid: '1',
        server: '189f281a16297030',
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
        x: 430,
        y: 660,
        wires: [
          [
            'a937aeb9c66c2fc8'
          ]
        ]
      },
      {
        id: 'b93407f8eef80ad9',
        type: 'modbus-server',
        z: 'ad804fafa49a7ed2',
        name: '',
        logEnabled: false,
        hostname: '127.0.0.1',
        serverPort: '10504',
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 10000,
        holdingBufferSize: 10000,
        inputBufferSize: 10000,
        discreteBufferSize: 10000,
        showErrors: false,
        x: 420,
        y: 440,
        wires: [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        id: 'a937aeb9c66c2fc8',
        type: 'helper',
        z: 'ad804fafa49a7ed2',
        name: 'helper 2',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 700,
        y: 640,
        wires: []
      },
      {
        id: '189f281a16297030',
        type: 'modbus-client',
        name: '',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
        queueLogEnabled: false,
        failureLogEnabled: true,
        tcpHost: '127.0.0.1',
        tcpPort: '502',
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
        showErrors: false,
        showWarnings: true,
        showLogs: true
      }
    ]
  ),
  testFlowForReading: helperExtensions.cleanFlowPositionData(
    [
      {
        id: 'd381d4c9d4915cc1',
        type: 'tab',
        label: 'Modbus Flex FC Example Flow',
        disabled: false,
        info: ''
      },
      {
        id: '70a33634c2bb9634',
        type: 'modbus-server',
        z: 'd381d4c9d4915cc1',
        name: '',
        logEnabled: false,
        hostname: '127.0.0.1',
        serverPort: '10503',
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 10000,
        holdingBufferSize: 10000,
        inputBufferSize: 10000,
        discreteBufferSize: 10000,
        showErrors: false,
        x: 680,
        y: 260,
        wires: [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        id: 'afba120dbee04671',
        type: 'inject',
        z: 'd381d4c9d4915cc1',
        name: '',
        props: [
          {
            p: 'payload'
          },
          {
            p: 'topic',
            vt: 'str'
          }
        ],
        repeat: '',
        crontab: '',
        once: false,
        onceDelay: 0.1,
        topic: '',
        payload: '{"unitid":1,"fc":"0x04","requestCard":[{"name":"startingAddress","data":0,"offset":0,"type":"uint16be"},{"name":"quantityInputRegisters","data":1,"offset":2,"type":"uint16be"}],"responseCard":[{"name":"byteCount","data":0,"offset":0,"type":"uint8be"},{"name":"inputRegisterValue","data":0,"offset":1,"type":"uint16be"}]}',
        payloadType: 'json',
        x: 250,
        y: 440,
        wires: [
          [
            'c2727803d7b31f68'
          ]
        ]
      },
      {
        id: 'c2727803d7b31f68',
        type: 'modbus-flex-fc',
        z: 'd381d4c9d4915cc1',
        name: '',
        showStatusActivities: false,
        showErrors: true,
        showWarnings: true,
        unitid: '1',
        server: '4',
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
        x: 490,
        y: 440,
        wires: [
          [
            '1c1fa9e6641a3268'
          ]
        ]
      },
      {
        id: '1c1fa9e6641a3268',
        type: 'helper',
        z: 'd381d4c9d4915cc1',
        name: 'helper 1',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 740,
        y: 440,
        wires: []
      },
      {
        id: '4',
        type: 'modbus-client',
        name: 'Modbus Server',
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
        unit_id: 1,
        commandDelay: 1,
        clientTimeout: 1000,
        reconnectOnTimeout: true,
        reconnectTimeout: 2000,
        parallelUnitIdsAllowed: true,
        showWarnings: true,
        showLogs: true
      }
    ]
  ),
  testFlexFCFunctionality: helperExtensions.cleanFlowPositionData([
    {
      id: 'ad1dee1b0c994bea',
      type: 'tab',
      label: 'Flow 1',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '4f80ae4fa5b8af80',
      type: 'modbus-flex-fc',
      z: 'ad1dee1b0c994bea',
      name: 'Flex-FC-Read-Coil',
      showStatusActivities: false,
      showErrors: true,
      showWarnings: true,
      unitid: '1',
      server: '82f3cd97a8d8cb41',
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
      x: 490,
      y: 640,
      wires: [
        [
          'db0d38bb98c3b66d'
        ]
      ]
    },
    {
      id: 'b6f4335abc7a7234',
      type: 'modbus-flex-fc',
      z: 'ad1dee1b0c994bea',
      name: 'Flex-FC-Read-Discrete-Input',
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
      x: 520,
      y: 700,
      wires: [
        [
          '5e0b3b5564286a04'
        ]
      ]
    },
    {
      id: '4f39ce78f2d8deac',
      type: 'modbus-flex-fc',
      z: 'ad1dee1b0c994bea',
      name: 'Flex-FC-Read-Holding-Registers',
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
      x: 540,
      y: 760,
      wires: [
        [
          '47a13af990df4f5e'
        ]
      ]
    },
    {
      id: '878d5e5d85492c86',
      type: 'modbus-server',
      z: 'ad1dee1b0c994bea',
      name: '',
      logEnabled: false,
      hostname: '127.0.0.1',
      serverPort: '55400',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 700,
      y: 360,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '992516c7803e608b',
      type: 'modbus-flex-fc',
      z: 'ad1dee1b0c994bea',
      name: 'Flex-FC-Read-Input-Registers',
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
      x: 530,
      y: 820,
      wires: [
        [
          'e09cacc6c798b791'
        ]
      ]
    },
    {
      id: 'c8cf11d5b290f6e7',
      type: 'modbus-flex-fc',
      z: 'ad1dee1b0c994bea',
      name: 'Flex-FC-Write-Single-Coil',
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
      x: 510,
      y: 880,
      wires: [
        [
          '7dbfe891b79d8e50'
        ]
      ]
    },
    {
      id: '1ec036ea8f674203',
      type: 'modbus-flex-fc',
      z: 'ad1dee1b0c994bea',
      name: 'Flex-FC-Write-Single-Register',
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
      x: 530,
      y: 940,
      wires: [
        [
          '3fb53c51da728295'
        ]
      ]
    },
    {
      id: 'db0d38bb98c3b66d',
      type: 'helper',
      z: 'ad1dee1b0c994bea',
      name: 'Read-Coil-Result',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 850,
      y: 640,
      wires: []
    },
    {
      id: '5e0b3b5564286a04',
      type: 'helper',
      z: 'ad1dee1b0c994bea',
      name: 'Read-Discrete-Input-Result',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 880,
      y: 700,
      wires: []
    },
    {
      id: '47a13af990df4f5e',
      type: 'helper',
      z: 'ad1dee1b0c994bea',
      name: 'Read-Holding-Register-Result',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 890,
      y: 760,
      wires: []
    },
    {
      id: 'e09cacc6c798b791',
      type: 'helper',
      z: 'ad1dee1b0c994bea',
      name: 'Read-Input-Register-Result',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 880,
      y: 820,
      wires: []
    },
    {
      id: '7dbfe891b79d8e50',
      type: 'helper',
      z: 'ad1dee1b0c994bea',
      name: 'Write-Coil-Result',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 850,
      y: 880,
      wires: []
    },
    {
      id: '3fb53c51da728295',
      type: 'helper',
      z: 'ad1dee1b0c994bea',
      name: 'Write-Register-Result',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 860,
      y: 940,
      wires: []
    },
    {
      id: '52657b7c5a25e197',
      type: 'inject',
      z: 'ad1dee1b0c994bea',
      name: '',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          vt: 'str'
        }
      ],
      repeat: '',
      crontab: '',
      once: false,
      onceDelay: 0.1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 240,
      y: 640,
      wires: [
        [
          '4f80ae4fa5b8af80',
          'b6f4335abc7a7234',
          '4f39ce78f2d8deac',
          '992516c7803e608b',
          'c8cf11d5b290f6e7',
          '1ec036ea8f674203'
        ]
      ]
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
      tcpPort: '55400',
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
  ])
}
