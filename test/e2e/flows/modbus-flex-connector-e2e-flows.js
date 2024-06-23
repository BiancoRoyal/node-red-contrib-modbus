const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testFlowWithNoServer: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '1bd63620aca5cdd8',
        type: 'tab',
        label: 'Flow 3',
        disabled: false,
        info: '',
        env: []
      },
      {
        id: '1ec957cb17dfabcb',
        type: 'inject',
        z: '1bd63620aca5cdd8',
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
        payload: '{"connectorType":"TCP","tcpHost":"127.0.0.1","tcpPort":"10502","unitId":2}',
        payloadType: 'json',
        x: 430,
        y: 120,
        wires: [
          [
            'e9315827bb3e24d4'
          ]
        ]
      },
      {
        id: 'e9315827bb3e24d4',
        type: 'modbus-flex-connector',
        z: '1bd63620aca5cdd8',
        name: '',
        maxReconnectsPerMinute: 4,
        emptyQueue: false,
        showStatusActivities: false,
        showErrors: false,
        server: 'a477577e.9e0bv',
        x: 550,
        y: 260,
        wires: [
          [
            '9fb91376fb339b1c'
          ]
        ]
      },
      {
        id: '9fb91376fb339b1c',
        type: 'helper',
        z: '1bd63620aca5cdd8',
        name: 'helper 1',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 920,
        y: 220,
        wires: []
      },
      {
        id: 'a477577e.9e0bc',
        type: 'modbus-client',
        name: 'Modbus Switch TCP',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
        queueLogEnabled: false,
        failureLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: '7890',
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
  testFlowWithShowActivities: helperExtensions.cleanFlowPositionData(
    [
      {
        id: 'c3f489c73b6812ab',
        type: 'tab',
        label: 'Flow 3',
        disabled: false,
        info: '',
        env: []
      },
      {
        id: '55aa820123356bbd',
        type: 'inject',
        z: 'c3f489c73b6812ab',
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
        payload: '{"connectorType":"TCP","tcpHost":"127.0.0.1","tcpPort":"10502","unitId":2}',
        payloadType: 'json',
        x: 430,
        y: 120,
        wires: [
          [
            'e2fd753c95dec330'
          ]
        ]
      },
      {
        id: 'e2fd753c95dec330',
        type: 'modbus-flex-connector',
        z: 'c3f489c73b6812ab',
        name: '',
        maxReconnectsPerMinute: 4,
        emptyQueue: false,
        showStatusActivities: true,
        showErrors: false,
        server: 'a477577e.9e0bc',
        x: 550,
        y: 240,
        wires: [
          [
            '9b63453c38c54d00'
          ]
        ]
      },
      {
        id: '3a19a62f1ea3d5d2',
        type: 'modbus-server',
        z: 'c3f489c73b6812ab',
        name: 'modbus-server',
        logEnabled: false,
        hostname: '127.0.0.1',
        serverPort: '7890',
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 10000,
        holdingBufferSize: 10000,
        inputBufferSize: 10000,
        discreteBufferSize: 10000,
        showErrors: false,
        x: 680,
        y: 120,
        wires: [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        id: '9b63453c38c54d00',
        type: 'helper',
        z: 'c3f489c73b6812ab',
        name: 'helper 1',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 840,
        y: 240,
        wires: []
      },
      {
        id: 'a477577e.9e0bc',
        type: 'modbus-client',
        name: 'Modbus Switch TCP',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
        queueLogEnabled: false,
        failureLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: '7890',
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
    ]
  ),
  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
        id: 'a39e174edce1a54b',
        type: 'modbus-flex-connector',
        z: '94b3ae6e28cbb7e3',
        name: 'modbus flex connector',
        maxReconnectsPerMinute: 4,
        emptyQueue: false,
        showStatusActivities: false,
        showErrors: false,
        server: 'a477577e.9e0bc',
        x: 650,
        y: 420,
        wires: [
          [
            'ac5a2e2afa548a79'
          ]
        ]
      },
      {
        id: '96ba2fdb64280034',
        type: 'inject',
        z: '94b3ae6e28cbb7e3',
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
        payload: '{"connectorType": "TCP", "tcpHost": "127.0.0.1", "tcpPort": "12512"}',
        payloadType: 'json',
        x: 410,
        y: 400,
        wires: [
          [
            'a39e174edce1a54b'
          ]
        ]
      },
      {
        id: '34eef8f58d93edd4',
        type: 'modbus-server',
        z: '94b3ae6e28cbb7e3',
        name: 'modbus server node',
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
        x: 700,
        y: 240,
        wires: [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        id: 'ac5a2e2afa548a79',
        type: 'helper',
        z: '94b3ae6e28cbb7e3',
        name: 'helper 16',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 1060,
        y: 400,
        wires: []
      },
      {
        id: 'a477577e.9e0bc',
        type: 'modbus-client',
        name: 'Modbus Switch TCP',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
        queueLogEnabled: false,
        failureLogEnabled: false,
        tcpHost: '127.0.0.1',
        tcpPort: '10512',
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
    ]
  ),
  testOnConfigDone: helperExtensions.cleanFlowPositionData(
    [
      {
        id: 'aaab399df3f7302a',
        type: 'inject',
        z: '1d4109aad9bc0b49',
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
        payload: '{"connectorType":"TCP","tcpHost":"127.0.0.1","tcpPort":"10502","unitId":2}',
        payloadType: 'json',
        x: 430,
        y: 120,
        wires: [
          [
            '0dfcf9fabf5f0bd7'
          ]
        ]
      },
      {
        id: '0dfcf9fabf5f0bd7',
        type: 'modbus-flex-connector',
        z: '1d4109aad9bc0b49',
        name: '',
        maxReconnectsPerMinute: 4,
        emptyQueue: false,
        showStatusActivities: true,
        showErrors: false,
        server: 'a477577e.9e0bc',
        x: 550,
        y: 240,
        wires: [
          [
            'f10a4765a508584c'
          ]
        ]
      },
      {
        id: 'decca5cc3642ec04',
        type: 'modbus-server',
        z: '1d4109aad9bc0b49',
        name: 'modbus-server',
        logEnabled: false,
        hostname: '127.0.0.1',
        serverPort: '7509',
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 10000,
        holdingBufferSize: 10000,
        inputBufferSize: 10000,
        discreteBufferSize: 10000,
        showErrors: false,
        x: 680,
        y: 120,
        wires: [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        id: 'f10a4765a508584c',
        type: 'helper',
        z: '1d4109aad9bc0b49',
        name: 'helper 1',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 1060,
        y: 220,
        wires: []
      },
      {
        id: 'a477577e.9e0bc',
        type: 'modbus-client',
        name: 'Modbus Switch TCP',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
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
        unit_id: 1,
        commandDelay: 1,
        clientTimeout: 1000,
        reconnectOnTimeout: true,
        reconnectTimeout: 2000,
        parallelUnitIdsAllowed: true,
        showErrors: false,
        showWarnings: true,
        showLogs: true
      }
    ]

  )
}
