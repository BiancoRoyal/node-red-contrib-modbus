const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testWithNoServer: helperExtensions.cleanFlowPositionData([
    {
      id: 'bd319004992a7bc3',
      type: 'tab',
      label: 'Should Be Loaded',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'ef5dad20.e97af',
      type: 'modbus-queue-info',
      z: 'bd319004992a7bc3',
      name: 'modbusQueueInfo',
      topic: '',
      unitid: 0,
      queueReadIntervalTime: '15000',
      lowLowLevel: 10,
      lowLevel: 20,
      highLevel: 30,
      highHighLevel: 40,
      server: '',
      errorOnHighLevel: false,
      showStatusActivities: true,
      updateOnAllQueueChanges: false,
      updateOnAllUnitQueues: false,
      x: 450,
      y: 200,
      wires: [
        []
      ]
    },
    {
      id: 'd322d62a.bd875',
      type: 'inject',
      z: 'bd319004992a7bc3',
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
      repeat: 1,
      crontab: '',
      once: true,
      onceDelay: 1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 210,
      y: 200,
      wires: [
        [
          'ef5dad20.e97af'
        ]
      ]
    },
    {
      id: 'd4c76ff5.c424b8',
      type: 'modbus-client',
      name: 'modbusClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '6503',
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
  testToGetStatusSituationFillColor: helperExtensions.cleanFlowPositionData([
    {
      id: 'bd319004992a7bc3',
      type: 'tab',
      label: 'Should Be Loaded',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '389153e.cb648ac',
      type: 'modbus-server',
      z: 'bd319004992a7bc3',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '127.0.0.1',
      serverPort: '6503',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 300,
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
      id: 'ef5dad20.e97af',
      type: 'modbus-queue-info',
      z: 'bd319004992a7bc3',
      name: 'modbusQueueInfo',
      topic: '',
      unitid: 0,
      queueReadIntervalTime: '15000',
      lowLowLevel: 10,
      lowLevel: 20,
      highLevel: 30,
      highHighLevel: 40,
      server: 'd4c76ff5.c424b8',
      errorOnHighLevel: false,
      showStatusActivities: true,
      updateOnAllQueueChanges: false,
      updateOnAllUnitQueues: false,
      x: 450,
      y: 200,
      wires: [
        []
      ]
    },
    {
      id: 'd322d62a.bd875',
      type: 'inject',
      z: 'bd319004992a7bc3',
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
      repeat: 1,
      crontab: '',
      once: true,
      onceDelay: 1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 210,
      y: 200,
      wires: [
        [
          'ef5dad20.e97af'
        ]
      ]
    },
    {
      id: 'd4c76ff5.c424b8',
      type: 'modbus-client',
      name: 'modbusClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '6503',
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
  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'bd319004992a7bc3',
      type: 'tab',
      label: 'Should Be Loaded',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '389153e.cb648ac',
      type: 'modbus-server',
      z: 'bd319004992a7bc3',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '127.0.0.1',
      serverPort: '6503',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 300,
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
      id: 'ef5dad20.e97af',
      type: 'modbus-queue-info',
      z: 'bd319004992a7bc3',
      name: 'modbusQueueInfo',
      topic: '',
      unitid: '',
      queueReadIntervalTime: '100',
      lowLowLevel: 1,
      lowLevel: 2,
      highLevel: 3,
      highHighLevel: 4,
      server: 'd4c76ff5.c424b8',
      errorOnHighLevel: false,
      showStatusActivities: true,
      updateOnAllQueueChanges: false,
      updateOnAllUnitQueues: false,
      x: 450,
      y: 200,
      wires: [
        []
      ]
    },
    {
      id: 'd322d62a.bd875',
      type: 'inject',
      z: 'bd319004992a7bc3',
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
      repeat: 1,
      crontab: '',
      once: true,
      onceDelay: 1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 210,
      y: 200,
      wires: [
        [
          'ef5dad20.e97af'
        ]
      ]
    },
    {
      id: 'd4c76ff5.c424b8',
      type: 'modbus-client',
      name: 'modbusClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '6503',
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

  testOldResetInjectShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'aa626b536111a991',
      type: 'tab',
      label: 'Old Reset Inject',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '445454e4.968564',
      type: 'modbus-server',
      z: 'aa626b536111a991',
      name: '',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '7503',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 440,
      y: 320,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: '5fffb0bc.0b8a5',
      type: 'modbus-queue-info',
      z: 'aa626b536111a991',
      name: 'QueueInfo',
      topic: '',
      unitid: '',
      queueReadIntervalTime: 100,
      lowLowLevel: 1,
      lowLevel: 2,
      highLevel: 3,
      highHighLevel: 4,
      server: '1e3ac4ea.86fa7b',
      errorOnHighLevel: false,
      showStatusActivities: true,
      updateOnAllQueueChanges: false,
      updateOnAllUnitQueues: false,
      x: 430,
      y: 180,
      wires: [
        [
          'h1'
        ]
      ]
    },
    {
      id: 'ae473c43.3e7938',
      type: 'inject',
      z: 'aa626b536111a991',
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
      repeat: 2,
      crontab: '',
      once: false,
      onceDelay: 1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 190,
      y: 180,
      wires: [
        [
          '5fffb0bc.0b8a5'
        ]
      ]
    },
    {
      id: 'h1',
      type: 'helper',
      z: 'aa626b536111a991',
      name: '',
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 750,
      y: 180,
      wires: []
    },
    {
      id: '1e3ac4ea.86fa7b',
      type: 'modbus-client',
      name: 'ModbsuFlexServer',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: true,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '7503',
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

  testNewResetInjectShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '171902b23fcc8045',
      type: 'tab',
      label: 'New Reset Inject',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '445454e4.968564',
      type: 'modbus-server',
      z: '171902b23fcc8045',
      name: '',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '7503',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 460,
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
      id: '5fffb0bc.0b8a5',
      type: 'modbus-queue-info',
      z: '171902b23fcc8045',
      name: 'QueueInfo',
      topic: '',
      unitid: '',
      queueReadIntervalTime: 100,
      lowLowLevel: 1,
      lowLevel: 2,
      highLevel: 3,
      highHighLevel: 4,
      server: '1e3ac4ea.86fa7b',
      errorOnHighLevel: false,
      showStatusActivities: true,
      updateOnAllQueueChanges: false,
      updateOnAllUnitQueues: false,
      x: 450,
      y: 160,
      wires: [
        [
          'h1'
        ]
      ]
    },
    {
      id: 'ae473c43.3e7938',
      type: 'inject',
      z: '171902b23fcc8045',
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
      repeat: 2,
      crontab: '',
      once: false,
      onceDelay: 1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 210,
      y: 160,
      wires: [
        [
          '5fffb0bc.0b8a5'
        ]
      ]
    },
    {
      id: 'h1',
      type: 'helper',
      z: '171902b23fcc8045',
      name: '',
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 750,
      y: 160,
      wires: []
    },
    {
      id: '1e3ac4ea.86fa7b',
      type: 'modbus-client',
      name: 'ModbsuFlexServer',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: true,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '7503',
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

  testInjectAndPollingShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "e841f965ccc3e494",
          "type": "tab",
          "label": "Inject And Polling",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "4dc9eeda53cf85d3",
          "type": "modbus-server",
          "z": "e841f965ccc3e494",
          "name": "",
          "logEnabled": true,
          "hostname": "127.0.0.1",
          "serverPort": "8503",
          "responseDelay": 10,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "x": 320,
          "y": 280,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "9dede7b2d0dd8333",
          "type": "modbus-read",
          "z": "e841f965ccc3e494",
          "name": "Modbus Read With IO",
          "topic": "",
          "showStatusActivities": false,
          "logIOActivities": false,
          "showErrors": false,
          "unitid": "",
          "dataType": "Coil",
          "adr": "0",
          "quantity": "10",
          "rate": "50",
          "rateUnit": "ms",
          "delayOnStart": false,
          "startDelayTime": "",
          "server": "6caeb7770b3be619",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "x": 320,
          "y": 180,
          "wires": [
              [
                  "1962fe0588ceaf0b"
              ],
              []
          ]
      },
      {
          "id": "e18e0fe2e38450b1",
          "type": "modbus-queue-info",
          "z": "e841f965ccc3e494",
          "name": "QueueInfo",
          "topic": "",
          "unitid": "",
          "queueReadIntervalTime": 100,
          "lowLowLevel": 0,
          "lowLevel": 1,
          "highLevel": 2,
          "highHighLevel": 3,
          "server": "6caeb7770b3be619",
          "errorOnHighLevel": false,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": false,
          "updateOnAllUnitQueues": false,
          "x": 330,
          "y": 120,
          "wires": [
              [
                  "1962fe0588ceaf0b"
              ]
          ]
      },
      {
          "id": "d2d7490d1227615b",
          "type": "inject",
          "z": "e841f965ccc3e494",
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
          "repeat": 0.3,
          "crontab": "",
          "once": true,
          "onceDelay": 0.2,
          "topic": "",
          "payload": "",
          "payloadType": "date",
          "x": 130,
          "y": 120,
          "wires": [
              [
                  "e18e0fe2e38450b1"
              ]
          ]
      },
      {
          "id": "1962fe0588ceaf0b",
          "type": "helper",
          "z": "e841f965ccc3e494",
          "name": "",
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "payload",
          "targetType": "msg",
          "statusVal": "",
          "statusType": "auto",
          "x": 730,
          "y": 160,
          "wires": []
      },
      {
          "id": "6caeb7770b3be619",
          "type": "modbus-client",
          "name": "ModbsuFlexServer",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "8503",
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
  ]),

  testResetFunctionQueueFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'e5301d52bc50140e',
      type: 'tab',
      label: 'Reset Function For Queue',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '445454e4.968564',
      type: 'modbus-server',
      z: 'e5301d52bc50140e',
      name: '',
      logEnabled: true,
      hostname: '127.0.0.1',
      serverPort: '9503',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 460,
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
      id: '5fffb0bc.0b8a5',
      type: 'modbus-queue-info',
      z: 'e5301d52bc50140e',
      name: 'QueueInfo',
      topic: '',
      unitid: '1',
      queueReadIntervalTime: 100,
      lowLowLevel: 1,
      lowLevel: 2,
      highLevel: 3,
      highHighLevel: 4,
      server: '1e3ac4ea.86fa7b',
      errorOnHighLevel: false,
      showStatusActivities: true,
      updateOnAllQueueChanges: false,
      updateOnAllUnitQueues: false,
      x: 490,
      y: 80,
      wires: [
        [
          'h1'
        ]
      ]
    },
    {
      id: 'ae473c43.3e7938',
      type: 'inject',
      z: 'e5301d52bc50140e',
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
      repeat: 2,
      crontab: '',
      once: false,
      onceDelay: 1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 130,
      y: 80,
      wires: [
        [
          '430f76bf.9de2d8'
        ]
      ]
    },
    {
      id: '430f76bf.9de2d8',
      type: 'function',
      z: 'e5301d52bc50140e',
      name: 'reset on High',
      func: 'if("high level reached" === msg.state) {\n    msg.payload.resetQueue = true;\n    return msg;\n}\n',
      outputs: 1,
      noerr: 0,
      initialize: '',
      finalize: '',
      libs: [],
      x: 330,
      y: 80,
      wires: [
        [
          '5fffb0bc.0b8a5'
        ]
      ]
    },
    {
      id: 'h1',
      type: 'helper',
      z: 'e5301d52bc50140e',
      name: '',
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 690,
      y: 80,
      wires: []
    },
    {
      id: '1e3ac4ea.86fa7b',
      type: 'modbus-client',
      name: 'ModbsuFlexServer',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: true,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '9503',
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
  testForshowStatusActivitiesIsFalse: helperExtensions.cleanFlowPositionData([
    {
      id: 'bd319004992a7bc3',
      type: 'tab',
      label: 'Should Be Loaded',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '389153e.cb648ac',
      type: 'modbus-server',
      z: 'bd319004992a7bc3',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '127.0.0.1',
      serverPort: '6503',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 300,
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
      id: 'ef5dad20.e97af',
      type: 'modbus-queue-info',
      z: 'bd319004992a7bc3',
      name: 'modbusQueueInfo',
      topic: '',
      unitid: '',
      queueReadIntervalTime: '100',
      lowLowLevel: 1,
      lowLevel: 2,
      highLevel: 3,
      highHighLevel: 4,
      server: 'd4c76ff5.c424b8',
      errorOnHighLevel: false,
      showStatusActivities: false,
      updateOnAllQueueChanges: false,
      updateOnAllUnitQueues: false,
      x: 450,
      y: 200,
      wires: [
        []
      ]
    },
    {
      id: 'd322d62a.bd875',
      type: 'inject',
      z: 'bd319004992a7bc3',
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
      repeat: 1,
      crontab: '',
      once: true,
      onceDelay: 1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 210,
      y: 200,
      wires: [
        [
          'ef5dad20.e97af'
        ]
      ]
    },
    {
      id: 'd4c76ff5.c424b8',
      type: 'modbus-client',
      name: 'modbusClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '6503',
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

  testForModbusClientNotDefined: helperExtensions.cleanFlowPositionData(
    [
      {
        id: 'ef5dad20.e97af',
        type: 'modbus-queue-info',
        z: 'bd319004992a7bc3',
        name: 'modbusQueueInfo',
        topic: '',
        unitid: '',
        queueReadIntervalTime: '100',
        lowLowLevel: 1,
        lowLevel: 2,
        highLevel: 3,
        highHighLevel: 4,
        server: 'd4c76ff5.c424b8',
        errorOnHighLevel: false,
        showStatusActivities: true,
        updateOnAllQueueChanges: false,
        updateOnAllUnitQueues: false,
        x: 450,
        y: 200,
        wires: [
          []
        ]
      }

    ]),
  testToReadFromAllUnitQueues: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '7382325b77497659',
        type: 'modbus-server',
        z: '85f5930d81f18785',
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
        x: 575,
        y: 140,
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
        id: '0b455a89d132407e',
        type: 'inject',
        z: '85f5930d81f18785',
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
        payload: '{"resetQueue":true,"unitId":1}',
        payloadType: 'json',
        x: 410,
        y: 280,
        wires: [
          [
            '1b72b5d207427b00'
          ]
        ],
        l: false
      },
      {
        id: '1b72b5d207427b00',
        type: 'modbus-queue-info',
        z: '85f5930d81f18785',
        name: 'testNode',
        topic: 'testTopic',
        unitid: '0',
        queueReadIntervalTime: 1000,
        lowLowLevel: '3',
        lowLevel: '5',
        highLevel: '10',
        highHighLevel: '30',
        server: 'a477577e.9e0bc',
        errorOnHighLevel: true,
        showStatusActivities: true,
        updateOnAllQueueChanges: true,
        updateOnAllUnitQueues: true,
        x: 635,
        y: 280,
        wires: [
          [
            '1aac12eebc4bd7cb'
          ]
        ]
      },
      {
        id: '1aac12eebc4bd7cb',
        type: 'helper',
        z: '85f5930d81f18785',
        name: 'helper 2',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 920,
        y: 280,
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
  testToupdateOnAllUnitQueues: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "844e5e46fef5b7e2",
          "type": "tab",
          "label": "Should Be Loaded Wrong IP",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "583f973601239168",
          "type": "inject",
          "z": "844e5e46fef5b7e2",
          "name": "injectNode",
          "props": [
              {
                  "p": "payload"
              },
              {
                  "p": "topic",
                  "vt": "str"
              }
          ],
          "repeat": "",
          "crontab": "",
          "once": false,
          "onceDelay": 0.1,
          "topic": "",
          "payload": "{\"resetQueue\":true,\"unitId\":1}",
          "payloadType": "json",
          "x": 100,
          "y": 580,
          "wires": [
              [
                  "07a7c865d5cb3125"
              ]
          ]
      },
      {
          "id": "07a7c865d5cb3125",
          "type": "modbus-queue-info",
          "z": "844e5e46fef5b7e2",
          "name": "",
          "topic": "",
          "unitid": 1,
          "queueReadIntervalTime": 1000,
          "lowLowLevel": 25,
          "lowLevel": 75,
          "highLevel": 150,
          "highHighLevel": 300,
          "server": "115bd58ae573c942",
          "errorOnHighLevel": false,
          "showStatusActivities": true,
          "updateOnAllQueueChanges": false,
          "updateOnAllUnitQueues": false,
          "x": 320,
          "y": 560,
          "wires": [
              [
                  "aff130d1e57795b4"
              ]
          ]
      },
      {
          "id": "aff130d1e57795b4",
          "type": "helper",
          "z": "844e5e46fef5b7e2",
          "name": "helper 17",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 580,
          "y": 560,
          "wires": []
      },
      {
          "id": "ad20e2342ee3d48c",
          "type": "modbus-server",
          "z": "844e5e46fef5b7e2",
          "name": "",
          "logEnabled": false,
          "hostname": "127.0.0.1",
          "serverPort": "10519",
          "responseDelay": 100,
          "delayUnit": "ms",
          "coilsBufferSize": 10000,
          "holdingBufferSize": 10000,
          "inputBufferSize": 10000,
          "discreteBufferSize": 10000,
          "showErrors": false,
          "x": 380,
          "y": 480,
          "wires": [
              [],
              [],
              [],
              [],
              []
          ]
      },
      {
          "id": "115bd58ae573c942",
          "type": "modbus-client",
          "name": "12 Channel 192.168.0.41",
          "clienttype": "tcp",
          "bufferCommands": true,
          "stateLogEnabled": false,
          "queueLogEnabled": false,
          "failureLogEnabled": false,
          "tcpHost": "127.0.0.1",
          "tcpPort": "10519",
          "tcpType": "DEFAULT",
          "serialPort": "/dev/ttyUSB",
          "serialType": "RTU-BUFFERD",
          "serialBaudrate": "9600",
          "serialDatabits": "8",
          "serialStopbits": "1",
          "serialParity": "none",
          "serialConnectionDelay": "100",
          "serialAsciiResponseStartDelimiter": "0x3A",
          "unit_id": "41",
          "commandDelay": "100",
          "clientTimeout": "1000",
          "reconnectOnTimeout": true,
          "reconnectTimeout": "2000",
          "parallelUnitIdsAllowed": false,
          "showErrors": false,
          "showWarnings": false,
          "showLogs": false
      }
  ]
  ),
  testToReadWhenHighLevelReached: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '7382325b77497659',
        type: 'modbus-server',
        z: '85f5930d81f18785',
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
        x: 575,
        y: 140,
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
        id: '0b455a89d132407e',
        type: 'inject',
        z: '85f5930d81f18785',
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
        payload: '{"resetQueue":true,"unitId":1}',
        payloadType: 'json',
        x: 410,
        y: 280,
        wires: [
          [
            '1b72b5d207427b00'
          ]
        ],
        l: false
      },
      {
        id: '1b72b5d207427b00',
        type: 'modbus-queue-info',
        z: '85f5930d81f18785',
        name: 'testNode',
        topic: 'testTopic',
        unitid: '0',
        queueReadIntervalTime: 1000,
        lowLowLevel: '3',
        lowLevel: '5',
        highLevel: '10',
        highHighLevel: '30',
        server: 'a477577e.9e0bc',
        errorOnHighLevel: true,
        showStatusActivities: true,
        updateOnAllQueueChanges: true,
        updateOnAllUnitQueues: true,
        x: 635,
        y: 280,
        wires: [
          [
            '1aac12eebc4bd7cb'
          ]
        ]
      },
      {
        id: '1aac12eebc4bd7cb',
        type: 'helper',
        z: '85f5930d81f18785',
        name: 'helper 2',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 920,
        y: 280,
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
  testToReadHighHighLevelReached: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '7382325b77497659',
        type: 'modbus-server',
        z: '85f5930d81f18785',
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
        x: 575,
        y: 140,
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
        id: '0b455a89d132407e',
        type: 'inject',
        z: '85f5930d81f18785',
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
        payload: '{"resetQueue":true,"unitId":1}',
        payloadType: 'json',
        x: 410,
        y: 280,
        wires: [
          [
            '1b72b5d207427b00'
          ]
        ],
        l: false
      },
      {
        id: '1b72b5d207427b00',
        type: 'modbus-queue-info',
        z: '85f5930d81f18785',
        name: 'testNode',
        topic: 'testTopic',
        unitid: '0',
        queueReadIntervalTime: 1000,
        lowLowLevel: '3',
        lowLevel: '5',
        highLevel: '10',
        highHighLevel: '30',
        server: 'a477577e.9e0bc',
        errorOnHighLevel: true,
        showStatusActivities: true,
        updateOnAllQueueChanges: true,
        updateOnAllUnitQueues: true,
        x: 635,
        y: 280,
        wires: [
          [
            '1aac12eebc4bd7cb'
          ]
        ]
      },
      {
        id: '1aac12eebc4bd7cb',
        type: 'helper',
        z: '85f5930d81f18785',
        name: 'helper 2',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 920,
        y: 280,
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
  testToReadLowLevelReached: helperExtensions.cleanFlowPositionData(
    [
      {
        id: '7382325b77497659',
        type: 'modbus-server',
        z: '85f5930d81f18785',
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
        x: 575,
        y: 140,
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
        id: '0b455a89d132407e',
        type: 'inject',
        z: '85f5930d81f18785',
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
        payload: '{"resetQueue":true,"unitId":1}',
        payloadType: 'json',
        x: 410,
        y: 280,
        wires: [
          [
            '1b72b5d207427b00'
          ]
        ],
        l: false
      },
      {
        id: '1b72b5d207427b00',
        type: 'modbus-queue-info',
        z: '85f5930d81f18785',
        name: 'testNode',
        topic: 'testTopic',
        unitid: '0',
        queueReadIntervalTime: 1000,
        lowLowLevel: '3',
        lowLevel: '5',
        highLevel: '10',
        highHighLevel: '30',
        server: 'a477577e.9e0bc',
        errorOnHighLevel: true,
        showStatusActivities: true,
        updateOnAllQueueChanges: true,
        updateOnAllUnitQueues: true,
        x: 635,
        y: 280,
        wires: [
          [
            '1aac12eebc4bd7cb'
          ]
        ]
      },
      {
        id: '1aac12eebc4bd7cb',
        type: 'helper',
        z: '85f5930d81f18785',
        name: 'helper 2',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 920,
        y: 280,
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
  testToThrowError: helperExtensions.cleanFlowPositionData(
    [
      {
        "id": "7382325b77497659",
        "type": "modbus-server",
        "z": "85f5930d81f18785",
        "name": "",
        "logEnabled": false,
        "hostname": "127.0.0.1",
        "serverPort": "10512",
        "responseDelay": 100,
        "delayUnit": "ms",
        "coilsBufferSize": 10000,
        "holdingBufferSize": 10000,
        "inputBufferSize": 10000,
        "discreteBufferSize": 10000,
        "showErrors": false,
        "x": 575,
        "y": 140,
        "wires": [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        "id": "0b455a89d132407e",
        "type": "inject",
        "z": "85f5930d81f18785",
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
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": "0.1",
        "topic": "",
        "payload": "{\"resetQueue\":true,\"unitId\":1}",
        "payloadType": "json",
        "x": 410,
        "y": 280,
        "wires": [
          [
            "1b72b5d207427b00"
          ]
        ]
      },
      {
        "id": "1b72b5d207427b00",
        "type": "modbus-queue-info",
        "z": "85f5930d81f18785",
        "name": "testNode",
        "topic": "testTopic",
        "unitid": "0",
        "queueReadIntervalTime": 1000,
        "lowLowLevel": "3",
        "lowLevel": "5",
        "highLevel": "10",
        "highHighLevel": "30",
        "server": "a477577e.9e0bc",
        "errorOnHighLevel": true,
        "showStatusActivities": true,
        "updateOnAllQueueChanges": true,
        "updateOnAllUnitQueues": true,
        "x": 635,
        "y": 280,
        "wires": [
          [
            "1aac12eebc4bd7cb"
          ]
        ]
      },
      {
        "id": "1aac12eebc4bd7cb",
        "type": "helper",
        "z": "85f5930d81f18785",
        "name": "helper 2",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 920,
        "y": 280,
        "wires": []
      },
      {
        "id": "a477577e.9e0bc",
        "type": "modbus-client",
        "z": "85f5930d81f18785",
        "name": "Modbus Switch TCP",
        "clienttype": "tcp",
        "bufferCommands": false,
        "stateLogEnabled": false,
        "queueLogEnabled": false,
        "failureLogEnabled": false,
        "tcpHost": "127.0.0.1",
        "tcpPort": "10512",
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
        "clientTimeout": "1000",
        "reconnectOnTimeout": true,
        "reconnectTimeout": "2000",
        "parallelUnitIdsAllowed": true,
        "showErrors": false,
        "showWarnings": true,
        "showLogs": true
      }
    ]
    
  ),
  testbufferCommandsTrue: helperExtensions.cleanFlowPositionData([
    {
      id: 'bd319004992a7bc3',
      type: 'tab',
      label: 'Should Be Loaded',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '389153e.cb648ac',
      type: 'modbus-server',
      z: 'bd319004992a7bc3',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '127.0.0.1',
      serverPort: '6503',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 300,
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
      id: 'ef5dad20.e97af',
      type: 'modbus-queue-info',
      z: 'bd319004992a7bc3',
      name: 'modbusQueueInfo',
      topic: '',
      unitid: '',
      queueReadIntervalTime: '100',
      lowLowLevel: 1,
      lowLevel: 2,
      highLevel: 3,
      highHighLevel: 4,
      server: 'd4c76ff5.c424b8',
      errorOnHighLevel: false,
      showStatusActivities: false,
      updateOnAllQueueChanges: false,
      updateOnAllUnitQueues: false,
      x: 450,
      y: 200,
      wires: [
        []
      ]
    },
    {
      id: 'd322d62a.bd875',
      type: 'inject',
      z: 'bd319004992a7bc3',
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
      repeat: 1,
      crontab: '',
      once: true,
      onceDelay: 1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 210,
      y: 200,
      wires: [
        [
          'ef5dad20.e97af'
        ]
      ]
    },
    {
      id: 'd4c76ff5.c424b8',
      type: 'modbus-client',
      name: 'modbusClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '6503',
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
  testLogVerboseMessage: helperExtensions.cleanFlowPositionData([
    {
      id: 'bd319004992a7bc3',
      type: 'tab',
      label: 'Should Be Loaded',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '389153e.cb648ac',
      type: 'modbus-server',
      z: 'bd319004992a7bc3',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '127.0.0.1',
      serverPort: '6503',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false,
      x: 300,
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
      id: 'ef5dad20.e97af',
      type: 'modbus-queue-info',
      z: 'bd319004992a7bc3',
      name: 'modbusQueueInfo',
      topic: '',
      unitid: '',
      queueReadIntervalTime: '100',
      lowLowLevel: 1,
      lowLevel: 2,
      highLevel: 3,
      highHighLevel: 4,
      server: 'd4c76ff5.c424b8',
      errorOnHighLevel: false,
      showStatusActivities: true,
      updateOnAllQueueChanges: false,
      updateOnAllUnitQueues: false,
      x: 450,
      y: 200,
      wires: [
        []
      ]
    },
    {
      id: 'd322d62a.bd875',
      type: 'inject',
      z: 'bd319004992a7bc3',
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
      repeat: 1,
      crontab: '',
      once: true,
      onceDelay: 1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 210,
      y: 200,
      wires: [
        [
          'ef5dad20.e97af'
        ]
      ]
    },
    {
      id: 'd4c76ff5.c424b8',
      type: 'modbus-client',
      name: 'modbusClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '6503',
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
  ])
}
