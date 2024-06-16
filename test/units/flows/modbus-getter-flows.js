const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  testGetterWithoutClientConfigFlow: helperExtensions.cleanFlowPositionData(
    [
    {
      id: '1243c51545a330d6',
      type: 'tab',
      label: 'Node without Client Config',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '3ffe153acc21d72b',
      type: 'modbus-getter',
      z: '1243c51545a330d6',
      name: 'modbusGetter',
      showStatusActivities: false,
      showErrors: false,
      logIOActivities: false,
      unitid: '',
      dataType: '',
      adr: '',
      quantity: '',
      server: '',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 340,
      y: 240,
      wires: [
        [],
        []
      ]
    }
  ]
  ),

  testGetterFlowWithInjectIo: helperExtensions.cleanFlowPositionData(
    [
    {
      id: 'd6e437043c8cf4a4',
      type: 'tab',
      label: 'Test Getter With Inject With IO Flow',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '7b684ae2799fca51',
      type: 'modbus-server',
      z: 'd6e437043c8cf4a4',
      name: '',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '7572',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 180,
      y: 80,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: 'a9b0b8a7cec1de86',
      type: 'modbus-getter',
      z: 'd6e437043c8cf4a4',
      name: '',
      showStatusActivities: true,
      showErrors: true,
      logIOActivities: true,
      unitid: '',
      dataType: 'Coil',
      adr: '0',
      quantity: '10',
      server: '92e7bf63.2efe9',
      useIOFile: true,
      ioFile: 'd43501866bf390b6',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 400,
      y: 180,
      wires: [
        [
          'dee228d8d9eaea8a'
        ],
        []
      ]
    },
    {
      id: 'dee228d8d9eaea8a',
      type: 'helper',
      z: 'd6e437043c8cf4a4',
      active: true,
      x: 650,
      y: 180,
      wires: []
    },
    {
      id: 'f3496cd2957c4e25',
      type: 'inject',
      z: 'd6e437043c8cf4a4',
      name: '',
      repeat: '1.2',
      crontab: '',
      once: true,
      onceDelay: 0.1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 170,
      y: 180,
      wires: [
        [
          'a9b0b8a7cec1de86'
        ]
      ]
    },
    {
      id: '92e7bf63.2efe9',
      type: 'modbus-client',
      z: 'd6e437043c8cf4a4',
      name: 'ModbusServer',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: true,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '7572',
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
    },
    {
      id: 'd43501866bf390b6',
      type: 'modbus-io-config',
      z: 'd6e437043c8cf4a4',
      name: 'TestIOFile',
      path: './test/resources/device.json',
      format: 'utf8',
      addressOffset: ''
    }
  ]
  ),

  testGetterFlow: helperExtensions.cleanFlowPositionData(
    [
    {
      id: '9e0ce71e20ca8f6d',
      type: 'tab',
      label: 'GetterFlow',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '445454e4.968564',
      type: 'modbus-server',
      z: '9e0ce71e20ca8f6d',
      name: '',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '8502',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 640,
      y: 80,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: 'cea01c8.36f8f6',
      type: 'modbus-getter',
      z: '9e0ce71e20ca8f6d',
      name: '',
      showStatusActivities: true,
      showErrors: true,
      logIOActivities: true,
      unitid: '',
      dataType: 'Coil',
      adr: '0',
      quantity: '10',
      server: '92e7bf63.2efd7',
      useIOFile: true,
      ioFile: 'e0519b16.5fcdd',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 540,
      y: 200,
      wires: [
        [
          'h1'
        ],
        []
      ]
    },
    {
      id: 'h1',
      type: 'helper',
      z: '9e0ce71e20ca8f6d',
      name: '',
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 750,
      y: 200,
      wires: []
    },
    {
      id: '92e7bf63.2efd7',
      type: 'modbus-client',
      name: 'ModbusServer',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '8502',
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB',
      serialType: 'RTU-BUFFERD',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'none',
      serialConnectionDelay: '100',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '100',
      reconnectTimeout: 200,
      parallelUnitIdsAllowed: true
    },
    {
      id: 'e0519b16.5fcdd',
      type: 'modbus-io-config',
      name: 'TestIOFile',
      path: './test/resources/device.json',
      format: 'utf8',
      addressOffset: ''
    }
  ]
  ),

  testGetterWithClientFlow: helperExtensions.cleanFlowPositionData(
    [
    {
      id: '0dfcc7e634544d53',
      type: 'tab',
      label: 'Test Getter With Client Flow',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '322daf89.be8dd',
      type: 'modbus-getter',
      z: '0dfcc7e634544d53',
      name: 'modbusGetter',
      showStatusActivities: false,
      showErrors: false,
      logIOActivities: false,
      unitid: '',
      dataType: 'Coil',
      adr: 0,
      quantity: 1,
      server: '9660d4a8f8cc2b44',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 180,
      y: 180,
      wires: [
        [],
        []
      ]
    },
    {
      id: '996023fe.ea04b',
      type: 'modbus-server',
      z: '0dfcc7e634544d53',
      name: 'modbusServer',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '5562',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 180,
      y: 80,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '9660d4a8f8cc2b44',
      type: 'modbus-client',
      name: 'modbusClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: true,
      tcpHost: '127.0.0.1',
      tcpPort: '5562',
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
    }
  ]
  ),

  testInjectGetterWithClientFlow: helperExtensions.cleanFlowPositionData(
    [
      {
        "id": "ae4a7c8ae3cc71e0",
        "type": "tab",
        "label": "Test Inject Getter With Client Flow",
        "disabled": false,
        "info": "",
        "env": []
      },
      {
        "id": "445454e4.968564",
        "type": "modbus-server",
        "z": "ae4a7c8ae3cc71e0",
        "name": "",
        "logEnabled": true,
        "hostname": "127.0.0.1",
        "serverPort": "7272",
        "responseDelay": 100,
        "delayUnit": "ms",
        "coilsBufferSize": 10000,
        "holdingBufferSize": 10000,
        "inputBufferSize": 10000,
        "discreteBufferSize": 10000,
        "showErrors": false,
        "x": 220,
        "y": 80,
        "wires": [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        "id": "cea01c8.36f8f6",
        "type": "modbus-getter",
        "z": "ae4a7c8ae3cc71e0",
        "name": "",
        "showStatusActivities": true,
        "showErrors": true,
        "showWarnings": true,
        "logIOActivities": false,
        "unitid": "",
        "dataType": "Coil",
        "adr": "0",
        "quantity": "10",
        "server": "92e7bf63.2efc8",
        "useIOFile": false,
        "ioFile": "",
        "useIOForPayload": false,
        "emptyMsgOnFail": false,
        "keepMsgProperties": false,
        "delayOnStart": false,
        "startDelayTime": "",
        "x": 400,
        "y": 180,
        "wires": [
          [
            "h1"
          ],
          []
        ]
      },
      {
        "id": "h1",
        "type": "helper",
        "z": "ae4a7c8ae3cc71e0",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 610,
        "y": 180,
        "wires": []
      },
      {
        "id": "a75e0ccf.e16628",
        "type": "inject",
        "z": "ae4a7c8ae3cc71e0",
        "name": "",
        "props": [
          {
            "p": "payload"
          },
          {
            "p": "topic",
            "vt": "str"
          }
        ],
        "repeat": "1",
        "crontab": "",
        "once": true,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 210,
        "y": 180,
        "wires": [
          [
            "cea01c8.36f8f6"
          ]
        ]
      },
      {
        "id": "92e7bf63.2efc8",
        "type": "modbus-client",
        "name": "ModbusServer",
        "clienttype": "tcp",
        "bufferCommands": true,
        "stateLogEnabled": true,
        "queueLogEnabled": false,
        "failureLogEnabled": false,
        "tcpHost": "127.0.0.1",
        "tcpPort": "7272",
        "tcpType": "DEFAULT",
        "serialPort": "/dev/ttyUSB",
        "serialType": "RTU-BUFFERD",
        "serialBaudrate": "9600",
        "serialDatabits": "8",
        "serialStopbits": "1",
        "serialParity": "none",
        "serialConnectionDelay": "100",
        "serialAsciiResponseStartDelimiter": "",
        "unit_id": "1",
        "commandDelay": "1",
        "clientTimeout": "100",
        "reconnectOnTimeout": false,
        "reconnectTimeout": "200",
        "parallelUnitIdsAllowed": true
      }
    ]
  )

}
