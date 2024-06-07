const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testNodeResponseFromServer: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '259559482d297082',
        type: 'tab',
        label: 'Flow 2',
        disabled: false,
        info: '',
        env: []
      },
      {
        id: 'bae63bd33cee1ff2',
        type: 'modbus-flex-sequencer',
        z: '259559482d297082',
        name: 'modbusFlexSequencer',
        sequences: [
          {
            name: '',
            unitid: '1',
            fc: 'FC3',
            address: '0',
            quantity: '10'
          }
        ],
        server: '92e7bf63.2efd7',
        showStatusActivities: false,
        showErrors: false,
        showWarnings: true,
        logIOActivities: false,
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        delayOnStart: false,
        startDelayTime: '',
        x: 510,
        y: 320,
        wires: [
          [],
          [
            'a230939cd73e24ba'
          ]
        ]
      },
      {
        id: 'c89201cccb2cf616',
        type: 'modbus-server',
        z: '259559482d297082',
        name: 'modbusServer',
        logEnabled: true,
        hostname: '127.0.0.1',
        serverPort: '7509',
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 10000,
        holdingBufferSize: 10000,
        inputBufferSize: 10000,
        discreteBufferSize: 10000,
        showErrors: false,
        x: 500,
        y: 200,
        wires: [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        id: '8875d54182bcd7b1',
        type: 'inject',
        z: '259559482d297082',
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
        payload: '{}',
        payloadType: 'json',
        x: 190,
        y: 400,
        wires: [
          [
            'bae63bd33cee1ff2'
          ]
        ]
      },
      {
        id: 'a230939cd73e24ba',
        type: 'helper',
        z: '259559482d297082',
        name: 'helper 1',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 760,
        y: 340,
        wires: []
      },
      {
        id: '92e7bf63.2efd7',
        type: 'modbus-client',
        name: 'ModbusServer',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: true,
        queueLogEnabled: false,
        failureLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: '7508',
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
        clientTimeout: '100',
        reconnectOnTimeout: false,
        reconnectTimeout: '200',
        parallelUnitIdsAllowed: true,
        showErrors: false,
        showWarnings: true,
        showLogs: true
      }
    ]
  ),
  testNodeWithModbusReadError: helperExtensions.cleanFlowPositionData([
    {
      id: 'c4711c82ba22fa66',
      type: 'tab',
      label: 'Node With Server',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'bc5a61b6.a3972',
      type: 'modbus-flex-sequencer',
      z: 'c4711c82ba22fa66',
      name: 'modbusFlexSequencer',
      sequences: [
        {
          name: '',
          unitid: '',
          fc: 'FC1',
          address: '',
          quantity: ''
        }
      ],
      server: '92e7bf63.2efd7',
      showStatusActivities: false,
      showErrors: false,
      logIOActivities: false,
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 390,
      y: 300,
      wires: [
        [],
        []
      ]
    },
    {
      id: '996023fe.ea04b',
      type: 'modbus-server',
      z: 'c4711c82ba22fa66',
      name: 'modbusServer',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '7506',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 380,
      y: 180,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '92e7bf63.2efd7',
      type: 'modbus-client',
      name: 'ModbusServer',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: true,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '7506',
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
      clientTimeout: '100',
      reconnectOnTimeout: false,
      reconnectTimeout: '200',
      parallelUnitIdsAllowed: true
    }
  ]),
  testNodeWithInvalidMessage: helperExtensions.cleanFlowPositionData(
    [
      {
        id: 'd505fb13ba3733eb',
        type: 'helper',
        z: 'c4711c82ba22fa66',
        name: 'helper 12',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 820,
        y: 600,
        wires: []
      },
      {
        id: '42c7ed2cf52e284e',
        type: 'modbus-flex-sequencer',
        z: 'c4711c82ba22fa66',
        name: 'modbusFlexSequencer',
        sequences: [
          {
            name: 'Foo',
            unitid: '2',
            fc: 'FC1',
            address: '1',
            quantity: '6'
          }
        ],
        server: '92e7bf63.2efd7',
        showStatusActivities: true,
        showErrors: false,
        showWarnings: true,
        logIOActivities: false,
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        delayOnStart: false,
        startDelayTime: '',
        x: 590,
        y: 600,
        wires: [
          [
            'd505fb13ba3733eb'
          ],
          []
        ]
      },
      {
        id: 'ea4503571c58673d',
        type: 'inject',
        z: 'c4711c82ba22fa66',
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
        x: 360,
        y: 540,
        wires: [
          [
            '42c7ed2cf52e284e'
          ]
        ]
      },
      {
        id: '6069eae44a9b0335',
        type: 'modbus-server',
        z: 'c4711c82ba22fa66',
        name: 'modbusServer',
        logEnabled: true,
        hostname: '127.0.0.1',
        serverPort: '7506',
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 10000,
        holdingBufferSize: 10000,
        inputBufferSize: 10000,
        discreteBufferSize: 10000,
        showErrors: false,
        x: 588.4513549804688,
        y: 493.4444274902344,
        wires: [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        id: '92e7bf63.2efd7',
        type: 'modbus-client',
        name: 'ModbusServer',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: true,
        queueLogEnabled: false,
        failureLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: '7506',
        tcpType: 'DEFAULT',
        serialPort: '/dev/ttyUSB',
        serialType: 'RTU-BUFFERD',
        serialBaudrate: '9600',
        serialDatabits: '8',
        serialStopbits: '1',
        serialParity: 'none',
        serialConnectionDelay: '100',
        serialAsciiResponseStartDelimiter: '',
        unit_id: 1,
        commandDelay: 1,
        clientTimeout: 100,
        reconnectOnTimeout: false,
        reconnectTimeout: 200,
        parallelUnitIdsAllowed: true
      }
    ]
  ),
  testNodeWithValidSequence: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '607b91b18be2a9ee',
        type: 'modbus-flex-sequencer',
        z: 'c4711c82ba22fa66',
        name: 'modbusFlexSequencer',
        sequences: [
          {
            name: '',
            unitid: '1',
            fc: 'FC3',
            address: '0',
            quantity: '10'
          }
        ],
        server: '92e7bf63.2efd7',
        showStatusActivities: true,
        showErrors: false,
        showWarnings: false,
        logIOActivities: false,
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        keepMsgProperties: false,
        delayOnStart: false,
        startDelayTime: '',
        x: 390,
        y: 580,
        wires: [
          [],
          [
            '068602756d13ebd3'
          ]
        ]
      },
      {
        id: 'b27f9584bc744754',
        type: 'modbus-server',
        z: 'c4711c82ba22fa66',
        name: 'modbusServer',
        logEnabled: true,
        hostname: '127.0.0.1',
        serverPort: '7509',
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 10000,
        holdingBufferSize: 10000,
        inputBufferSize: 10000,
        discreteBufferSize: 10000,
        showErrors: false,
        x: 380,
        y: 460,
        wires: [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        id: 'c338399f8bc2abcf',
        type: 'inject',
        z: 'c4711c82ba22fa66',
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
        payload: '{"payload":"test payload","sequences":[{"unitid":1,"fc":"FC3","address":0,"quantity":10}]}',
        payloadType: 'json',
        x: 150,
        y: 600,
        wires: [
          [
            '607b91b18be2a9ee'
          ]
        ]
      },
      {
        id: '068602756d13ebd3',
        type: 'helper',
        z: 'c4711c82ba22fa66',
        name: 'helper 1',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 660,
        y: 540,
        wires: []
      },
      {
        id: '92e7bf63.2efd7',
        type: 'modbus-client',
        name: 'ModbusServer',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: true,
        queueLogEnabled: false,
        failureLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: '7509',
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
        clientTimeout: '100',
        reconnectOnTimeout: false,
        reconnectTimeout: '200',
        parallelUnitIdsAllowed: true,
        showErrors: false,
        showWarnings: true,
        showLogs: true
      }
    ]
  )

}
