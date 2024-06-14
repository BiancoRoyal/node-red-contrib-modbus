const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  testServerConfig: helperExtensions.cleanFlowPositionData(
    [
      {
        "id": "249922d5ac72b8cd",
        "type": "modbus-server",
        "z": "3eb3dc87d008ec26",
        "showStatusActivities": true,
        "name": "",
        "logEnabled": true,
        "hostname": "0.0.0.0",
        "serverPort": "5509",
        "responseDelay": 100,
        "delayUnit": "ms",
        "coilsBufferSize": 10000,
        "holdingBufferSize": 10000,
        "inputBufferSize": 10000,
        "discreteBufferSize": 10000,
        "showErrors": true,
        "x": 300,
        "y": 200,
        "wires": [
          [],
          [],
          [],
          [],
          []
        ]
      }
    ]

  ),
  testSimpleNodeShouldThrowErrorFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '178284ea.5055ab',
      type: 'modbus-server',
      z: '284e074e58afd989',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '',
      showStatusActivities: true,
      serverPort: '5502',
      responseDelay: '50',
      delayUnit: 'ms',
      coilsBufferSize: 10240000000000,
      holdingBufferSize: 1024,
      inputBufferSize: 1024,
      discreteBufferSize: 1024,
      showErrors: true,
      x: 560,
      y: 300,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    }
  ]),
  testSimpleNodeShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '178284ea.5055ab',
      type: 'modbus-server',
      z: '284e074e58afd989',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '',
      serverPort: '5502',
      responseDelay: '50',
      delayUnit: 'ms',
      coilsBufferSize: 1024,
      holdingBufferSize: 1024,
      inputBufferSize: 1024,
      discreteBufferSize: 1024,
      showErrors: false,
      x: 560,
      y: 300,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    }
  ]),
  testSimpleNodeToLogError: helperExtensions.cleanFlowPositionData([
    {
      id: '178284ea.5055ab',
      type: 'modbus-server',
      z: '284e074e58afd989',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '',
      serverPort: '5502',
      responseDelay: '50',
      delayUnit: 'ms',
      coilsBufferSize: 1024,
      holdingBufferSize: 1024,
      inputBufferSize: 1024,
      discreteBufferSize: 1024,
      showErrors: true,
      x: 560,
      y: 300,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    }
  ]),
  testSimpleNodeWithWrongIPShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '844e5e46fef5b7e2',
      type: 'tab',
      label: 'Should Be Loaded Wrong IP',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '178284ea.5055ab',
      type: 'modbus-server',
      z: '844e5e46fef5b7e2',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '192.168.99.1',
      serverPort: '5503',
      responseDelay: '50',
      delayUnit: 'ms',
      coilsBufferSize: 1024,
      holdingBufferSize: 1024,
      inputBufferSize: 1024,
      discreteBufferSize: 1024,
      showErrors: false,
      x: 440,
      y: 280,
      wires: [
        [],
        [],
        [],
        [],
        []
      ]
    }
  ]),

  testShouldSendDataOnInputFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '127135e9a615df83',
      type: 'tab',
      label: 'Should Send Data On Input',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: '178284ea.5055ab',
      type: 'modbus-server',
      z: '127135e9a615df83',
      name: 'modbusServer',
      logEnabled: false,
      hostname: '',
      serverPort: '5504',
      responseDelay: '50',
      delayUnit: 'ms',
      coilsBufferSize: 1024,
      holdingBufferSize: 1024,
      inputBufferSize: 1024,
      discreteBufferSize: 1024,
      showErrors: false,
      x: 480,
      y: 260,
      wires: [
        [
          'h1'
        ],
        [],
        [],
        [],
        []
      ]
    },
    {
      id: 'h1',
      type: 'helper',
      z: '127135e9a615df83',
      x: 790,
      y: 220,
      wires: []
    },
    {
      id: 'a75e0ccf.e16628',
      type: 'inject',
      z: '127135e9a615df83',
      name: '',
      repeat: '2',
      crontab: '',
      once: true,
      onceDelay: 0.1,
      topic: '',
      payload: '',
      payloadType: 'date',
      x: 210,
      y: 260,
      wires: [
        [
          '178284ea.5055ab'
        ]
      ]
    }
  ])

}
