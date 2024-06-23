const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  testNodeWithoutClientFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '9c0e139fb2b7cf7b',
      type: 'tab',
      label: 'Node Without Client',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'bc5a61b6.a3972',
      type: 'modbus-flex-sequencer',
      z: '9c0e139fb2b7cf7b',
      name: 'modbusFlexSequencer',
      server: '',
      showStatusActivities: false,
      showErrors: false,
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 430,
      y: 240,
      wires: [
        [],
        []
      ]
    }
  ]),

  testNodeWithServerFlow: helperExtensions.cleanFlowPositionData([
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
  testNodeWithInjectNodeFlow: helperExtensions.cleanFlowPositionData(
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
  )

}
