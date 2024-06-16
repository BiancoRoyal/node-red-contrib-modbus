const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testToFilterFlowWithNoWarnings: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "e8fe3d94b494c92e",
          "type": "tab",
          "label": "Handle Wrong Input Without Crash",
          "disabled": false,
          "info": "",
          "env": []
      },
      {
          "id": "83c942a0a199a4d1",
          "type": "inject",
          "z": "e8fe3d94b494c92e",
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
          "onceDelay": 0.1,
          "topic": "",
          "payload": "[{\"name\":\"name1\",\"value\":123},{\"name\":\"name2\",\"value\":456}]",
          "payloadType": "json",
          "x": 370,
          "y": 300,
          "wires": [
              [
                  "8b8a4538d916fd59"
              ]
          ]
      },
      {
          "id": "8b8a4538d916fd59",
          "type": "modbus-response-filter",
          "z": "e8fe3d94b494c92e",
          "name": "",
          "filter": "name1",
          "registers": "2",
          "ioFile": "5050ada748392afc",
          "filterResponseBuffer": true,
          "filterValues": true,
          "filterInput": true,
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": false,
          "x": 550,
          "y": 300,
          "wires": [
              [
                  "cf18edddbac1f902"
              ]
          ]
      },
      {
          "id": "cf18edddbac1f902",
          "type": "helper",
          "z": "e8fe3d94b494c92e",
          "name": "helper 6",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 840,
          "y": 280,
          "wires": []
      },
      {
          "id": "5050ada748392afc",
          "type": "modbus-io-config",
          "name": "",
          "path": "",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),
  testToFilterFlow: helperExtensions.cleanFlowPositionData(
    [
      {
          "id": "d693a937e7721a4f",
          "type": "inject",
          "z": "de709d6f7838999b",
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
          "onceDelay": 0.1,
          "topic": "",
          "payload": "[{\"name\":\"name1\",\"value\":123},{\"name\":\"name2\",\"value\":456}]",
          "payloadType": "json",
          "x": 270,
          "y": 520,
          "wires": [
              [
                  "e8041f6236cbaee4"
              ]
          ]
      },
      {
          "id": "e8041f6236cbaee4",
          "type": "modbus-response-filter",
          "z": "de709d6f7838999b",
          "name": "",
          "filter": "name1",
          "registers": "2",
          "ioFile": "d7a5a199e761a48f",
          "filterResponseBuffer": true,
          "filterValues": true,
          "filterInput": true,
          "showStatusActivities": false,
          "showErrors": false,
          "showWarnings": true,
          "x": 490,
          "y": 520,
          "wires": [
              [
                  "654c2d296a60f529"
              ]
          ]
      },
      {
          "id": "654c2d296a60f529",
          "type": "helper",
          "z": "de709d6f7838999b",
          "name": "helper 5",
          "active": true,
          "tosidebar": true,
          "console": false,
          "tostatus": false,
          "complete": "false",
          "statusVal": "",
          "statusType": "auto",
          "x": 820,
          "y": 500,
          "wires": []
      },
      {
          "id": "d7a5a199e761a48f",
          "type": "modbus-io-config",
          "name": "",
          "path": "",
          "format": "utf8",
          "addressOffset": ""
      }
  ]
  ),
  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'c09ac89be87c55c1',
      type: 'tab',
      label: 'Should Be Loaded',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '50f41d03.d1eff4',
      type: 'modbus-response-filter',
      z: 'c09ac89be87c55c1',
      name: 'ModbusResponseFilter',
      filter: 'FilterTest',
      registers: 0,
      ioFile: '2f5a90d.bcaa1f',
      filterResponseBuffer: true,
      filterValues: true,
      filterInput: true,
      showStatusActivities: false,
      showErrors: false,
      x: 370,
      y: 180,
      wires: [
        []
      ]
    },
    {
      id: '2f5a90d.bcaa1f',
      type: 'modbus-io-config',
      name: 'ModbusIOConfig',
      path: 'test',
      format: 'utf8',
      addressOffset: ''
    }
  ]),

  testHandleWrongInputWithoutCrashFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'e8fe3d94b494c92e',
      type: 'tab',
      label: 'Handle Wrong Input Without Crash',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '50f41d03.d1eff4',
      type: 'modbus-response-filter',
      z: 'e8fe3d94b494c92e',
      name: 'ModbusResponseFilter',
      filter: 'FilterTest',
      registers: 0,
      ioFile: '2f5a90d.bcaa1f',
      filterResponseBuffer: true,
      filterValues: true,
      filterInput: true,
      showStatusActivities: false,
      showErrors: false,
      x: 390,
      y: 260,
      wires: [
        []
      ]
    },
    {
      id: '2f5a90d.bcaa1f',
      type: 'modbus-io-config',
      name: 'ModbusIOConfig',
      path: 'test',
      format: 'utf8',
      addressOffset: ''
    }
  ]),

  testStopOnInputWrongCountFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'df822999b25c5fc1',
      type: 'tab',
      label: 'Wrong Count Of Registers',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '50f41d03.d1eff4',
      type: 'modbus-response-filter',
      z: 'df822999b25c5fc1',
      name: 'ModbusResponseFilter',
      filter: 'FilterTest',
      registers: 2,
      ioFile: '2f5a90d.bcaa1f',
      filterResponseBuffer: true,
      filterValues: true,
      filterInput: true,
      showStatusActivities: false,
      showErrors: false,
      x: 370,
      y: 160,
      wires: [
        []
      ]
    },
    {
      id: '2f5a90d.bcaa1f',
      type: 'modbus-io-config',
      name: 'ModbusIOConfig',
      path: 'test',
      format: 'utf8',
      addressOffset: ''
    }
  ]),

  testWorkOnInputExactCountFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '8f3f9f5246cdfa30',
      type: 'tab',
      label: 'Exact Count Registers',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '50f41d03.d1eff4',
      type: 'modbus-response-filter',
      z: '8f3f9f5246cdfa30',
      name: 'ModbusResponseFilter',
      filter: 'FilterTest',
      registers: 4,
      ioFile: '2f5a90d.bcaa1f',
      filterResponseBuffer: true,
      filterValues: true,
      filterInput: true,
      showStatusActivities: false,
      showErrors: false,
      x: 410,
      y: 240,
      wires: [
        []
      ]
    },
    {
      id: '2f5a90d.bcaa1f',
      type: 'modbus-io-config',
      name: 'ModbusIOConfig',
      path: 'test',
      format: 'utf8',
      addressOffset: ''
    }
  ]),

  testWorkWithFlexGetterFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'c3e92954b274704f',
      type: 'tab',
      label: 'Work With Flex Getter',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '178284ea.5055ab',
      type: 'modbus-server',
      z: 'c3e92954b274704f',
      name: '',
      logEnabled: false,
      hostname: '',
      serverPort: '6502',
      responseDelay: '50',
      delayUnit: 'ms',
      coilsBufferSize: 1024,
      holdingBufferSize: 1024,
      inputBufferSize: 1024,
      discreteBufferSize: 1024,
      showErrors: false,
      x: 480,
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
      id: '29991a24.b64dfe',
      type: 'inject',
      z: 'c3e92954b274704f',
      name: 'Get flexible!',
      props: [
        {
          p: 'payload'
        },
        {
          p: 'topic',
          vt: 'str'
        }
      ],
      repeat: '0.2',
      crontab: '',
      once: true,
      onceDelay: '',
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 70,
      y: 120,
      wires: [
        [
          '5cf6efb4.f62018'
        ]
      ]
    },
    {
      id: '5cf6efb4.f62018',
      type: 'function',
      z: 'c3e92954b274704f',
      name: '',
      func: 'msg.payload = { input: msg.payload, \'fc\': 4, \'unitid\': 1, \'address\': 0 , \'quantity\': 30 }\nreturn msg;',
      outputs: 1,
      noerr: 0,
      initialize: '',
      finalize: '',
      libs: [],
      x: 220,
      y: 120,
      wires: [
        [
          'c730e78b.3b8b5'
        ]
      ]
    },
    {
      id: 'c730e78b.3b8b5',
      type: 'modbus-flex-getter',
      z: 'c3e92954b274704f',
      name: '',
      showStatusActivities: false,
      showErrors: false,
      logIOActivities: false,
      server: '80aeec4c.0cb9e8',
      useIOFile: true,
      ioFile: '7417947e.da6c3c',
      useIOForPayload: true,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      x: 410,
      y: 120,
      wires: [
        [
          '5a7d9b84.a543a4'
        ],
        []
      ]
    },
    {
      id: '5a7d9b84.a543a4',
      type: 'modbus-response-filter',
      z: 'c3e92954b274704f',
      name: 'ModbusResponseFilter',
      filter: 'bOperationActive',
      registers: 0,
      ioFile: '7417947e.da6c3c',
      filterResponseBuffer: true,
      filterValues: true,
      filterInput: true,
      showStatusActivities: false,
      showErrors: false,
      x: 650,
      y: 120,
      wires: [
        [
          'h1'
        ]
      ]
    },
    {
      id: 'h1',
      type: 'helper',
      z: 'c3e92954b274704f',
      name: '',
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'payload',
      targetType: 'msg',
      statusVal: '',
      statusType: 'auto',
      x: 870,
      y: 120,
      wires: []
    },
    {
      id: '80aeec4c.0cb9e8',
      type: 'modbus-client',
      name: 'Modbus Server',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '6502',
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
      parallelUnitIdsAllowed: false
    },
    {
      id: '7417947e.da6c3c',
      type: 'modbus-io-config',
      name: 'C3FactorySet',
      path: './test/resources/device.json',
      format: 'utf8',
      addressOffset: ''
    }
  ]),
  testFlowResponse: helperExtensions.cleanFlowPositionData([
    {
      id: '4f8c0e22.48b8b4',
      type: 'modbus-response-filter',
      z: 'c16c7ae547655379',
      name: 'Filter',
      filter: 'Test Filter',
      registers: '5',
      filterResponseBuffer: false,
      filterValues: false,
      filterInput: false,
      showStatusActivities: true,
      showErrors: true,
      showWarnings: true,
      x: 550,
      y: 540,
      wires: [
        [
          '119f217c24184589'
        ]
      ]
    },
    {
      id: 'f11d36da.0e3af8',
      type: 'inject',
      z: 'c16c7ae547655379',
      name: '',
      props: [
        {
          p: 'payload',
          v: '[1,2,3]',
          vt: 'json'
        }
      ],
      repeat: '',
      crontab: '',
      once: false,
      onceDelay: 0.1,
      topic: '',
      x: 360,
      y: 540,
      wires: [
        [
          '4f8c0e22.48b8b4'
        ]
      ]
    },
    {
      id: '119f217c24184589',
      type: 'helper',
      z: 'c16c7ae547655379',
      name: 'helper 18',
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: 'false',
      statusVal: '',
      statusType: 'auto',
      x: 820,
      y: 540,
      wires: []
    }
  ]),
  testFlowForE2E: helperExtensions.cleanFlowPositionData(
    [
      {
        id: 'de709d6f7838999b',
        type: 'tab',
        label: 'Flow 15',
        disabled: false,
        info: '',
        env: []
      },
      {
        id: '88c95ea2e2f8f892',
        type: 'inject',
        z: 'de709d6f7838999b',
        name: 'Inject Payload',
        props: [
          {
            p: 'payload'
          }
        ],
        repeat: '',
        crontab: '',
        once: true,
        onceDelay: 0.1,
        topic: '',
        payload: '[{"name": "filter1", "value": 123}, {"name": "filter2", "value": 456}]',
        payloadType: 'json',
        x: 480,
        y: 340,
        wires: [
          [
            '542529cd4e4e8a14'
          ]
        ]
      },
      {
        id: '542529cd4e4e8a14',
        type: 'modbus-response-filter',
        z: 'de709d6f7838999b',
        name: 'Filter Response',
        filter: 'filter1',
        registers: 2,
        ioFile: '31912071bc331d18',
        filterResponseBuffer: false,
        filterValues: false,
        filterInput: false,
        showStatusActivities: false,
        showErrors: true,
        showWarnings: true,
        x: 660,
        y: 340,
        wires: [
          [
            '408bd14812e503de'
          ]
        ]
      },
      {
        id: '408bd14812e503de',
        type: 'helper',
        z: 'de709d6f7838999b',
        name: 'helper 17',
        active: true,
        tosidebar: true,
        console: false,
        tostatus: false,
        complete: 'false',
        statusVal: '',
        statusType: 'auto',
        x: 840,
        y: 340,
        wires: []
      },
      {
        id: '31912071bc331d18',
        type: 'modbus-io-config',
        name: 'IO File Node',
        path: 'testPath',
        format: 'json',
        addressOffset: 0
      }
    ]
  )

}
