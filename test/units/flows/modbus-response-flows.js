const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  testShortLengthInjectDataFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '4db54e914f1e5f90',
      type: 'tab',
      label: 'Short Length Inject',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'f1ff9252.b5ce18',
      type: 'modbus-response',
      z: '4db54e914f1e5f90',
      name: 'shortLengthInjectData',
      registerShowMax: 20,
      x: 420,
      y: 200,
      wires: []
    },
    {
      id: '8827b34f.682e8',
      type: 'inject',
      z: '4db54e914f1e5f90',
      name: 'ShortLengthInject',
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
      once: true,
      onceDelay: 0.1,
      topic: '',
      payload: '{"data":{"length":2}}',
      payloadType: 'json',
      x: 170,
      y: 200,
      wires: [
        [
          'f1ff9252.b5ce18'
        ]
      ]
    }
  ]),

  testLongLengthInjectDataFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'ad825378b22382ce',
      type: 'tab',
      label: 'Long Length Inject Data',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'f1ff9252.b5ce18',
      type: 'modbus-response',
      z: 'ad825378b22382ce',
      name: 'longLengthInjectData',
      registerShowMax: 20,
      x: 480,
      y: 200,
      wires: []
    },
    {
      id: '8827b34f.682e8',
      type: 'inject',
      z: 'ad825378b22382ce',
      name: 'LongLengthInject',
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
      once: true,
      onceDelay: 0.1,
      topic: '',
      payload: '{"data":{"length":22}}',
      payloadType: 'json',
      x: 210,
      y: 200,
      wires: [
        [
          'f1ff9252.b5ce18'
        ]
      ]
    }
  ]),

  testShortLengthInjectAddressFlow: helperExtensions.cleanFlowPositionData([
    {
      id: '4ff89535b1037c3c',
      type: 'tab',
      label: 'Short Length Inject Address',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'f1ff9252.b5ce18',
      type: 'modbus-response',
      z: '4ff89535b1037c3c',
      name: 'shortLengthInjectAddress',
      registerShowMax: 20,
      x: 490,
      y: 200,
      wires: []
    },
    {
      id: '8827b34f.682e8',
      type: 'inject',
      z: '4ff89535b1037c3c',
      name: 'ShortLengthInject',
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
      once: true,
      onceDelay: 0.1,
      topic: '',
      payload: '{"length":2, "address": {}}',
      payloadType: 'json',
      x: 210,
      y: 200,
      wires: [
        [
          'f1ff9252.b5ce18'
        ]
      ]
    }
  ]),

  testLongLengthInjectAddressFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'ac86ff136ee272c7',
      type: 'tab',
      label: 'Long Length Inject Address',
      disabled: false,
      info: '',
      env: []
    },
    {
      id: 'f1ff9252.b5ce18',
      type: 'modbus-response',
      z: 'ac86ff136ee272c7',
      name: 'longLengthInjectAddress',
      registerShowMax: 20,
      x: 530,
      y: 200,
      wires: []
    },
    {
      id: '8827b34f.682e8',
      type: 'inject',
      z: 'ac86ff136ee272c7',
      name: 'LongLengthInject',
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
      once: true,
      onceDelay: 0.1,
      topic: '',
      payload: '{"length":22, "address": {}}',
      payloadType: 'json',
      x: 210,
      y: 200,
      wires: [
        [
          'f1ff9252.b5ce18'
        ]
      ]
    }
  ]),

  testInjectJustPayloadFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'f1ff9252.b5ce18',
      type: 'modbus-response',
      name: 'injectJustPayload',
      registerShowMax: 20,
      wires: []
    },
    {
      id: '8827b34f.682e8',
      type: 'inject',
      name: 'LongLengthInject',
      topic: '',
      payload: '{}',
      payloadType: 'json',
      repeat: '',
      crontab: '',
      once: true,
      onceDelay: 0.1,
      wires: [
        [
          'f1ff9252.b5ce18'
        ]
      ]
    }
  ])
}
