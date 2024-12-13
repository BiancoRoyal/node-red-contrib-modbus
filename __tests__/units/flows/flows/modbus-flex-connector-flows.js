const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  testShouldBeLoadedFlow: helperExtensions.cleanFlowPositionData(
    [
      {
        'id': 'dee6791347fc9889',
        'type': 'tab',
        'label': 'Modbus Flex Connector (Test Should Be Loaded Flow)',
        'disabled': false,
        'info': '',
        'env': []
      },
      {
        'id': '8dcf1f9c356d074b',
        'type': 'modbus-flex-connector',
        'z': 'dee6791347fc9889',
        'name': 'FlexConnector',
        'maxReconnectsPerMinute': 4,
        'emptyQueue': true,
        'showStatusActivities': true,
        'showErrors': false,
        'server': '1252ede3d9d9937e',
        'emptyMsgOnFail': false,
        'configMsgOnChange': false,
        'x': 430,
        'y': 280,
        'wires': [
          []
        ]
      },
      {
        'id': '1252ede3d9d9937e',
        'type': 'modbus-client',
        'name': 'Modbus Flex Connector (Test Should Be Loaded Flow)',
        'clienttype': 'tcp',
        'bufferCommands': true,
        'stateLogEnabled': false,
        'queueLogEnabled': false,
        'failureLogEnabled': true,
        'tcpHost': '127.0.0.1',
        'tcpPort': '10032',
        'tcpType': 'DEFAULT',
        'serialPort': '/dev/ttyUSB',
        'serialType': 'RTU-BUFFERD',
        'serialBaudrate': '9600',
        'serialDatabits': '8',
        'serialStopbits': '1',
        'serialParity': 'none',
        'serialConnectionDelay': '100',
        'serialAsciiResponseStartDelimiter': '0x3A',
        'unit_id': '1',
        'commandDelay': '1',
        'clientTimeout': '1000',
        'reconnectOnTimeout': true,
        'reconnectTimeout': '1',
        'parallelUnitIdsAllowed': true,
        'showErrors': false,
        'showWarnings': true,
        'showLogs': true
      }
    ]
  ),

  testShouldChangeTcpPortFlow: helperExtensions.cleanFlowPositionData(
    [
      {
        'id': 'dbb457ce606a979c',
        'type': 'tab',
        'label': 'Modbus Flex Connector (Test Should Change Tcp Port Flow)',
        'disabled': false,
        'info': '',
        'env': []
      },
      {
        'id': 'fc6ca1939ab63a34',
        'type': 'modbus-server',
        'z': 'dbb457ce606a979c',
        'name': '',
        'logEnabled': true,
        'hostname': '127.0.0.1',
        'serverPort': '10033',
        'responseDelay': 100,
        'delayUnit': 'ms',
        'coilsBufferSize': 10000,
        'holdingBufferSize': 10000,
        'inputBufferSize': 10000,
        'discreteBufferSize': 10000,
        'showErrors': false,
        'showStatusActivities': false,
        'x': 400,
        'y': 240,
        'wires': [
          [],
          [],
          [],
          [],
          []
        ]
      },
      {
        'id': '4bebe20d77ae781d',
        'type': 'modbus-flex-connector',
        'z': 'dbb457ce606a979c',
        'name': 'FlexConnector',
        'maxReconnectsPerMinute': 4,
        'emptyQueue': true,
        'showStatusActivities': false,
        'showErrors': false,
        'server': '2a253153.fae3ce',
        'emptyMsgOnFail': false,
        'configMsgOnChange': false,
        'x': 480,
        'y': 400,
        'wires': [
          []
        ]
      },
      {
        'id': '2a253153.fae3ce',
        'type': 'modbus-client',
        'name': 'Modbus Flex Connector (Test Should Change Tcp Port Flow)',
        'clienttype': 'tcp',
        'bufferCommands': true,
        'stateLogEnabled': false,
        'queueLogEnabled': false,
        'failureLogEnabled': false,
        'tcpHost': '127.0.0.1',
        'tcpPort': '10033',
        'tcpType': 'DEFAULT',
        'serialPort': '/dev/ttyUSB',
        'serialType': 'RTU-BUFFERD',
        'serialBaudrate': '9600',
        'serialDatabits': '8',
        'serialStopbits': '1',
        'serialParity': 'none',
        'serialConnectionDelay': '100',
        'serialAsciiResponseStartDelimiter': '',
        'unit_id': '1',
        'commandDelay': '100',
        'clientTimeout': '100',
        'reconnectOnTimeout': true,
        'reconnectTimeout': '2000',
        'parallelUnitIdsAllowed': true,
        'showErrors': false,
        'showWarnings': false,
        'showLogs': false
      }
    ]
  ),

  testShouldChangeSerialPortFlow: helperExtensions.cleanFlowPositionData(
    [
      {
        'id': '075216db9c7f9b03',
        'type': 'tab',
        'label': 'Modbus Flex Connector (Test Should Change Serial Port Flow)',
        'disabled': false,
        'info': '',
        'env': []
      },
      {
        'id': '506ff2af84012599',
        'type': 'modbus-flex-connector',
        'z': '075216db9c7f9b03',
        'name': 'FlexConnector',
        'maxReconnectsPerMinute': 4,
        'emptyQueue': true,
        'showStatusActivities': false,
        'showErrors': false,
        'server': 'cfdf32d7009eedcc',
        'emptyMsgOnFail': false,
        'configMsgOnChange': false,
        'x': 380,
        'y': 240,
        'wires': [
          []
        ]
      },
      {
        'id': 'cfdf32d7009eedcc',
        'type': 'modbus-client',
        'name': 'Modbus Flex Connector (Test Should Change Serial Port Flow)',
        'clienttype': 'serial',
        'bufferCommands': true,
        'stateLogEnabled': false,
        'queueLogEnabled': false,
        'failureLogEnabled': false,
        'tcpHost': '127.0.0.1',
        'tcpPort': '7522',
        'tcpType': 'DEFAULT',
        'serialPort': '/dev/ttyUSB',
        'serialType': 'RTU-BUFFERD',
        'serialBaudrate': '0',
        'serialDatabits': '8',
        'serialStopbits': '1',
        'serialParity': 'none',
        'serialConnectionDelay': '100',
        'serialAsciiResponseStartDelimiter': '',
        'unit_id': '1',
        'commandDelay': '100',
        'clientTimeout': '100',
        'reconnectOnTimeout': true,
        'reconnectTimeout': '200',
        'parallelUnitIdsAllowed': true,
        'showErrors': false,
        'showWarnings': true,
        'showLogs': true
      }
    ]
  ),
  testFlowAsExpected: helperExtensions.cleanFlowPositionData(
    [
      {
        'id': '4b20ca5bb2263be0',
        'type': 'tab',
        'label': 'Modbus Flex Connector (Test Flow As Expected)',
        'disabled': false,
        'info': '',
        'env': []
      },
      {
        'id': 'f9f48195b450081d',
        'type': 'modbus-server',
        'z': '4b20ca5bb2263be0',
        'name': '',
        'logEnabled': false,
        'hostname': '127.0.0.1',
        'serverPort': '10034',
        'responseDelay': 100,
        'delayUnit': 'ms',
        'coilsBufferSize': 10000,
        'holdingBufferSize': 10000,
        'inputBufferSize': 10000,
        'discreteBufferSize': 10000,
        'showErrors': false,
        'showStatusActivities': false,
        'x': 685,
        'y': 260,
        'wires': [
          [],
          [],
          [],
          [],
          [
            '1a982501c28fd875'
          ]
        ],
        'l': false
      },
      {
        'id': '7fad66c312d28d1b',
        'type': 'modbus-flex-connector',
        'z': '4b20ca5bb2263be0',
        'name': '',
        'maxReconnectsPerMinute': 4,
        'emptyQueue': false,
        'showStatusActivities': true,
        'showErrors': true,
        'server': 'c96bdff8122a029e',
        'emptyMsgOnFail': true,
        'configMsgOnChange': false,
        'x': 950,
        'y': 400,
        'wires': [
          [
            'c4603e531e165478'
          ]
        ]
      },
      {
        'id': '733ae94ab35e5337',
        'type': 'inject',
        'z': '4b20ca5bb2263be0',
        'name': 'Change for Unit-ID',
        'props': [
          {
            'p': 'payload'
          },
          {
            'p': 'topic',
            'vt': 'str'
          }
        ],
        'repeat': '',
        'crontab': '',
        'once': true,
        'onceDelay': '0.5',
        'topic': '',
        'payload': '{"connectorType":"TCP","tcpHost":"127.0.0.1","tcpPort":"10034","unitId":1}',
        'payloadType': 'json',
        'x': 530,
        'y': 380,
        'wires': [
          [
            '7fad66c312d28d1b'
          ]
        ]
      },
      {
        'id': 'c4603e531e165478',
        'type': 'helper',
        'z': '4b20ca5bb2263be0',
        'name': 'helper 1',
        'active': true,
        'tosidebar': true,
        'console': false,
        'tostatus': false,
        'complete': 'false',
        'statusVal': '',
        'statusType': 'auto',
        'x': 1200,
        'y': 400,
        'wires': []
      },
      {
        'id': 'bb9aafd866db4378',
        'type': 'inject',
        'z': '4b20ca5bb2263be0',
        'name': '',
        'props': [
          {
            'p': 'payload'
          },
          {
            'p': 'topic',
            'vt': 'str'
          }
        ],
        'repeat': '',
        'crontab': '',
        'once': false,
        'onceDelay': 0.1,
        'topic': '',
        'payload': '1',
        'payloadType': 'num',
        'x': 520,
        'y': 260,
        'wires': [
          [
            'f9f48195b450081d'
          ]
        ]
      },
      {
        'id': '1a982501c28fd875',
        'type': 'helper',
        'z': '4b20ca5bb2263be0',
        'name': 'helper 2',
        'active': true,
        'tosidebar': true,
        'console': false,
        'tostatus': false,
        'complete': 'true',
        'targetType': 'full',
        'statusVal': '',
        'statusType': 'auto',
        'x': 830,
        'y': 280,
        'wires': []
      },
      {
        'id': 'd2af532041d97a73',
        'type': 'inject',
        'z': '4b20ca5bb2263be0',
        'name': 'Change for Unit-ID with Error',
        'props': [
          {
            'p': 'payload'
          },
          {
            'p': 'topic',
            'vt': 'str'
          }
        ],
        'repeat': '',
        'crontab': '',
        'once': false,
        'onceDelay': 0.1,
        'topic': '',
        'payload': '{"connectorType":"TCP","tcpHost":"0.0.0.0","tcpPort":"10034 ","unitId":300}',
        'payloadType': 'json',
        'x': 560,
        'y': 420,
        'wires': [
          [
            '7fad66c312d28d1b'
          ]
        ]
      },
      {
        'id': 'c96bdff8122a029e',
        'type': 'modbus-client',
        'name': 'Modbus Flex Connector (Test Flow As Expected)',
        'clienttype': 'tcp',
        'bufferCommands': true,
        'stateLogEnabled': false,
        'queueLogEnabled': false,
        'failureLogEnabled': true,
        'tcpHost': '127.0.0.1',
        'tcpPort': '10034',
        'tcpType': 'DEFAULT',
        'serialPort': '/dev/ttyUSB',
        'serialType': 'RTU-BUFFERD',
        'serialBaudrate': '9600',
        'serialDatabits': '8',
        'serialStopbits': '1',
        'serialParity': 'none',
        'serialConnectionDelay': '100',
        'serialAsciiResponseStartDelimiter': '0x3A',
        'unit_id': '1',
        'commandDelay': '1',
        'clientTimeout': '1000',
        'reconnectOnTimeout': true,
        'reconnectTimeout': '2000',
        'parallelUnitIdsAllowed': true,
        'showErrors': false,
        'showWarnings': true,
        'showLogs': true
      }
    ]
  ),
  testFlowAsExpectedWithConfigMessage: helperExtensions.cleanFlowPositionData(
    [
      {
        'id': '9b74dc2f25ab7091',
        'type': 'tab',
        'label': 'Modbus Flex Connector (Test Flow As Expected With Config Message)',
        'disabled': false,
        'info': '',
        'env': []
      },
      {
        'id': '2c2d414ba5f9fb4c',
        'type': 'modbus-server',
        'z': '9b74dc2f25ab7091',
        'name': '',
        'logEnabled': false,
        'hostname': '127.0.0.1',
        'serverPort': '10035',
        'responseDelay': 100,
        'delayUnit': 'ms',
        'coilsBufferSize': 10000,
        'holdingBufferSize': 10000,
        'inputBufferSize': 10000,
        'discreteBufferSize': 10000,
        'showErrors': false,
        'showStatusActivities': false,
        'x': 345,
        'y': 80,
        'wires': [
          [],
          [],
          [],
          [],
          [
            '9c2769f07d883058'
          ]
        ],
        'l': false
      },
      {
        'id': '474fb3622491d7cb',
        'type': 'modbus-flex-connector',
        'z': '9b74dc2f25ab7091',
        'name': '',
        'maxReconnectsPerMinute': 4,
        'emptyQueue': false,
        'showStatusActivities': true,
        'showErrors': true,
        'server': 'ba25dc3f23303624',
        'emptyMsgOnFail': true,
        'configMsgOnChange': true,
        'x': 610,
        'y': 220,
        'wires': [
          [
            '420f3fb44ecdcbbf'
          ]
        ]
      },
      {
        'id': 'ea81d9f9d2eea3d8',
        'type': 'inject',
        'z': '9b74dc2f25ab7091',
        'name': 'Change for Unit-ID',
        'props': [
          {
            'p': 'payload'
          },
          {
            'p': 'topic',
            'vt': 'str'
          }
        ],
        'repeat': '',
        'crontab': '',
        'once': true,
        'onceDelay': '0.5',
        'topic': '',
        'payload': '{"connectorType":"TCP","tcpHost":"127.0.0.1","tcpPort":"10513","unitId":1}',
        'payloadType': 'json',
        'x': 190,
        'y': 200,
        'wires': [
          [
            '474fb3622491d7cb'
          ]
        ]
      },
      {
        'id': '420f3fb44ecdcbbf',
        'type': 'helper',
        'z': '9b74dc2f25ab7091',
        'name': 'helper 1',
        'active': true,
        'tosidebar': true,
        'console': false,
        'tostatus': false,
        'complete': 'false',
        'statusVal': '',
        'statusType': 'auto',
        'x': 860,
        'y': 220,
        'wires': []
      },
      {
        'id': 'ffa3e8f4b3270384',
        'type': 'inject',
        'z': '9b74dc2f25ab7091',
        'name': '',
        'props': [
          {
            'p': 'payload'
          },
          {
            'p': 'topic',
            'vt': 'str'
          }
        ],
        'repeat': '',
        'crontab': '',
        'once': false,
        'onceDelay': 0.1,
        'topic': '',
        'payload': '1',
        'payloadType': 'num',
        'x': 180,
        'y': 80,
        'wires': [
          [
            '2c2d414ba5f9fb4c'
          ]
        ]
      },
      {
        'id': '9c2769f07d883058',
        'type': 'helper',
        'z': '9b74dc2f25ab7091',
        'name': 'helper 2',
        'active': true,
        'tosidebar': true,
        'console': false,
        'tostatus': false,
        'complete': 'true',
        'targetType': 'full',
        'statusVal': '',
        'statusType': 'auto',
        'x': 490,
        'y': 100,
        'wires': []
      },
      {
        'id': '2a793271df72b547',
        'type': 'inject',
        'z': '9b74dc2f25ab7091',
        'name': 'Change for Unit-ID with Error',
        'props': [
          {
            'p': 'payload'
          },
          {
            'p': 'topic',
            'vt': 'str'
          }
        ],
        'repeat': '',
        'crontab': '',
        'once': false,
        'onceDelay': 0.1,
        'topic': '',
        'payload': '{"connectorType":"TCP","tcpHost":"0.0.0.0","tcpPort":"10513","unitId":300}',
        'payloadType': 'json',
        'x': 220,
        'y': 240,
        'wires': [
          [
            '474fb3622491d7cb'
          ]
        ]
      },
      {
        'id': 'ba25dc3f23303624',
        'type': 'modbus-client',
        'name': 'Modbus Flex Connector (Test Flow As Expected With Config Message)',
        'clienttype': 'tcp',
        'bufferCommands': true,
        'stateLogEnabled': false,
        'queueLogEnabled': false,
        'failureLogEnabled': false,
        'tcpHost': '127.0.0.1',
        'tcpPort': '10035',
        'tcpType': 'DEFAULT',
        'serialPort': '/dev/ttyUSB',
        'serialType': 'RTU-BUFFERD',
        'serialBaudrate': '9600',
        'serialDatabits': '8',
        'serialStopbits': '1',
        'serialParity': 'none',
        'serialConnectionDelay': '100',
        'serialAsciiResponseStartDelimiter': '0x3A',
        'unit_id': '41',
        'commandDelay': '1',
        'clientTimeout': '1000',
        'reconnectOnTimeout': true,
        'reconnectTimeout': '2000',
        'parallelUnitIdsAllowed': false,
        'showErrors': false,
        'showWarnings': false,
        'showLogs': false
      }
    ]
  ),
  testOnConfigDone: helperExtensions.cleanFlowPositionData(
    [
      {
        'id': '16edcfbcc1637eec',
        'type': 'tab',
        'label': 'Modbus Flex Connector (Test On Config Done)',
        'disabled': false,
        'info': '',
        'env': []
      },
      {
        'id': '88170d215343af66',
        'type': 'modbus-flex-connector',
        'z': '16edcfbcc1637eec',
        'name': '',
        'maxReconnectsPerMinute': 4,
        'emptyQueue': false,
        'showStatusActivities': false,
        'showErrors': false,
        'server': '',
        'emptyMsgOnFail': false,
        'configMsgOnChange': false,
        'x': 310,
        'y': 280,
        'wires': [
          []
        ]
      }
    ]
  )
}
