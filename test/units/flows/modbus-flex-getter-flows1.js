module.exports = [
  {
    id: '10c6a88f38bf7814',
    type: 'inject',
    z: 'e34532bd92699b4a',
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
    repeat: '1',
    crontab: '',
    once: true,
    onceDelay: '1',
    topic: '',
    payload: '{"fc":4,"unitid":1,"address":0,"quantity":30}',
    payloadType: 'json',
    x: 310,
    y: 280,
    wires: [
      [
        '30ffa43841c64a8e'
      ]
    ]
  },
  {
    id: '30ffa43841c64a8e',
    type: 'modbus-flex-getter',
    z: 'e34532bd92699b4a',
    name: '',
    showStatusActivities: false,
    showErrors: false,
    showWarnings: true,
    logIOActivities: false,
    server: 'd4da02ed.6574d8',
    useIOFile: true,
    ioFile: 'ec18ac32.a8ef5',
    useIOForPayload: true,
    emptyMsgOnFail: false,
    keepMsgProperties: true,
    delayOnStart: false,
    startDelayTime: '',
    x: 518.4513854980469,
    y: 230.6666259765625,
    wires: [
      [],
      [
        '0aabed7144a168b9'
      ]
    ]
  },
  {
    id: '0aabed7144a168b9',
    type: 'helper',
    z: 'e34532bd92699b4a',
    name: 'helper 1',
    active: true,
    tosidebar: true,
    console: false,
    tostatus: false,
    complete: 'payload',
    targetType: 'msg',
    statusVal: '',
    statusType: 'auto',
    x: 740,
    y: 280,
    wires: []
  },
  {
    id: 'd4da02ed.6574d8',
    type: 'modbus-client',
    name: '',
    clienttype: 'tcp',
    bufferCommands: true,
    stateLogEnabled: false,
    queueLogEnabled: false,
    failureLogEnabled: false,
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
    clientTimeout: '500',
    reconnectOnTimeout: true,
    reconnectTimeout: '',
    parallelUnitIdsAllowed: true,
    showErrors: false,
    showWarnings: true,
    showLogs: true
  },
  {
    id: 'ec18ac32.a8ef5',
    type: 'modbus-io-config',
    name: 'Device',
    path: '/Users/Shared/modbus/device.json',
    format: 'utf8',
    addressOffset: ''
  }
]
