const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testShouldBeReadyToSendFlow: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '1a2b3c4d5e6f7g8h',
        type: 'tab',
        label: 'My Modbus Flow',
        disabled: false,
        info: '',
        env: []
      },
      {
        id: 'a1b2c3d4e5f6g7h8',
        type: 'modbus-read',
        z: '1a2b3c4d5e6f7g8h',
        name: '',
        topic: '',
        showStatusActivities: false,
        logIOActivities: false,
        showErrors: false,
        unitid: '',
        dataType: 'Coil',
        adr: '0',
        quantity: '1',
        rate: '10',
        rateUnit: 's',
        delayOnStart: false,
        startDelayTime: '',
        server: 'b1c2d3e4f5g6h7i8',
        useIOFile: true,
        ioFile: 'c1d2e3f4g5h6i7',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        x: 350,
        y: 240,
        wires: [
          [],
          []
        ]
      },
      {
        id: 'b1c2d3e4f5g6h7i8',
        type: 'modbus-client',
        name: '',
        clienttype: 'tcp',
        bufferCommands: true,
        stateLogEnabled: false,
        queueLogEnabled: false,
        failureLogEnabled: true,
        tcpHost: '127.0.0.1',
        tcpPort: '50502',
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
        parallelUnitIdsAllowed: true
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
}
