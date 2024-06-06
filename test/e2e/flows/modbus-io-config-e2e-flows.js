const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testShouldBeReadyToSendFlow: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '14c812a571dff93e',
        type: 'modbus-read',
        z: '09dc2c4ec477bba9',
        name: 'Read Coil',
        topic: '',
        showStatusActivities: false,
        logIOActivities: false,
        showErrors: false,
        showWarnings: true,
        unitid: '1',
        dataType: 'Coil',
        adr: '0',
        quantity: '1',
        rate: '10',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: 'a477577e.9e0bc',
        useIOFile: true,
        ioFile: 'c1d2e3f4g5h6i7',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        x: 350,
        y: 240,
        wires: [
          [],
          [
            'c306b395174319da'
          ]
        ]
      },
      {
        id: 'b3f5ec7ac79c0dc6',
        type: 'modbus-server',
        z: '09dc2c4ec477bba9',
        name: '',
        logEnabled: false,
        hostname: '0.0.0.0',
        serverPort: '10512',
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 10000,
        holdingBufferSize: 10000,
        inputBufferSize: 10000,
        discreteBufferSize: 10000,
        showErrors: false,
        x: 485,
        y: 160,
        wires: [
          [],
          [],
          [],
          [],
          []
        ],
        l: false
      },
      {
        id: 'c306b395174319da',
        type: 'debug',
        z: '09dc2c4ec477bba9',
        name: 'debug 23',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 720,
        y: 300,
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
      },
      {
        id: 'c1d2e3f4g5h6i7',
        type: 'modbus-io-config',
        name: 'ModbusIOConfig',
        path: 'testpath',
        format: 'utf8',
        addressOffset: ''
      }
    ]
  )

  // testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
  //   {
  //     id: 'ec42ecc63a604e72',
  //     type: 'tab',
  //     label: 'Should Be Loaded',
  //     disabled: false,
  //     info: '',
  //     env: []
  //   },
  //   {
  //     id: 'b0fefd31.802189',
  //     type: 'modbus-read',
  //     z: 'ec42ecc63a604e72',
  //     name: '',
  //     topic: '',
  //     showStatusActivities: false,
  //     logIOActivities: false,
  //     showErrors: false,
  //     unitid: '',
  //     dataType: '',
  //     adr: '',
  //     quantity: '',
  //     rate: '',
  //     rateUnit: '',
  //     delayOnStart: false,
  //     startDelayTime: '',
  //     server: '',
  //     useIOFile: true,
  //     ioFile: '2f5a90d.bcaa1f',
  //     useIOForPayload: false,
  //     emptyMsgOnFail: false,
  //     x: 350,
  //     y: 240,
  //     wires: [
  //       [],
  //       []
  //     ]
  //   },
  //   {
  //     id: '2f5a90d.bcaa1f',
  //     type: 'modbus-io-config',
  //     name: 'ModbusIOConfig',
  //     path: 'testpath',
  //     format: 'utf8',
  //     addressOffset: ''
  //   }
  // ])
}
