const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testShouldBeReadyToSendFlow: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '53ddcf553d9c6c83',
        type: 'tab',
        label: 'Flow 6',
        disabled: false,
        info: '',
        env: []
      },
      {
        id: 'c57c16d40bc75b21',
        type: 'modbus-read',
        z: '53ddcf553d9c6c83',
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
        ioFile: '4512ae8d341e011f',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        x: 280,
        y: 520,
        wires: [
          [],
          [
            'eee45d7498646e96'
          ]
        ]
      },
      {
        id: 'aead958f40171c84',
        type: 'modbus-server',
        z: '53ddcf553d9c6c83',
        name: '',
        logEnabled: false,
        hostname: '127.0.0.1',
        serverPort: '10512',
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 10000,
        holdingBufferSize: 10000,
        inputBufferSize: 10000,
        discreteBufferSize: 10000,
        showErrors: false,
        x: 415,
        y: 440,
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
        id: 'eee45d7498646e96',
        type: 'helper',
        z: '53ddcf553d9c6c83',
        name: 'helper 5',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 620,
        y: 580,
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
      },
      {
        id: '4512ae8d341e011f',
        type: 'modbus-io-config',
        name: 'ModbusIOConfig',
        path: './device.json',
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
  //     logIOActivities: false,io
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
