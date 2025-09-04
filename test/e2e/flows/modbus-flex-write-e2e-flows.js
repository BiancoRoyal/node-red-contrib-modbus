const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
  
  flexWriteSingleCoilFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'modbus-server',
      type: 'modbus-server',
      name: 'Test Server',
      hostname: '127.0.0.1',
      serverPort: '8520',
      responseDelay: 50,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false
    },
    {
      id: 'modbus-client',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '8520',
      tcpType: 'DEFAULT',
      serialPort: '',
      serialType: 'RTU',
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
      id: 'flex-write-coil',
      type: 'modbus-flex-write',
      name: 'Flex Write Single Coil',
      showStatusActivities: false,
      showErrors: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      server: 'modbus-client',
      wires: [['helper-node'], []]
    },
    {
      id: 'helper-node',
      type: 'helper',
      name: 'Helper Node',
      wires: []
    }
  ]),

  flexWriteSingleRegisterFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'modbus-server',
      type: 'modbus-server',
      name: 'Test Server',
      hostname: '127.0.0.1',
      serverPort: '8521',
      responseDelay: 50,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false
    },
    {
      id: 'modbus-client',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '8521',
      tcpType: 'DEFAULT',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000'
    },
    {
      id: 'flex-write-register',
      type: 'modbus-flex-write',
      name: 'Flex Write Single Register',
      showStatusActivities: false,
      showErrors: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      server: 'modbus-client',
      wires: [['helper-node'], []]
    },
    {
      id: 'helper-node',
      type: 'helper',
      name: 'Helper Node',
      wires: []
    }
  ]),

  flexWriteMultipleCoilsFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'modbus-server',
      type: 'modbus-server',
      name: 'Test Server',
      hostname: '127.0.0.1',
      serverPort: '8522',
      responseDelay: 50,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false
    },
    {
      id: 'modbus-client',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '8522',
      tcpType: 'DEFAULT',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000'
    },
    {
      id: 'flex-write-multiple-coils',
      type: 'modbus-flex-write',
      name: 'Flex Write Multiple Coils',
      showStatusActivities: false,
      showErrors: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      server: 'modbus-client',
      wires: [['helper-node'], []]
    },
    {
      id: 'helper-node',
      type: 'helper',
      name: 'Helper Node',
      wires: []
    }
  ]),

  flexWriteMultipleRegistersFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'modbus-server',
      type: 'modbus-server',
      name: 'Test Server',
      hostname: '127.0.0.1',
      serverPort: '8523',
      responseDelay: 50,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false
    },
    {
      id: 'modbus-client',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '8523',
      tcpType: 'DEFAULT',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000'
    },
    {
      id: 'flex-write-multiple-registers',
      type: 'modbus-flex-write',
      name: 'Flex Write Multiple Registers',
      showStatusActivities: false,
      showErrors: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      server: 'modbus-client',
      wires: [['helper-node'], []]
    },
    {
      id: 'helper-node',
      type: 'helper',
      name: 'Helper Node',
      wires: []
    }
  ]),

  flexWriteErrorHandlingFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'modbus-server',
      type: 'modbus-server',
      name: 'Test Server',
      hostname: '127.0.0.1',
      serverPort: '8524',
      responseDelay: 50,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false
    },
    {
      id: 'modbus-client',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '8524',
      tcpType: 'DEFAULT',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000'
    },
    {
      id: 'flex-write-error',
      type: 'modbus-flex-write',
      name: 'Flex Write Error Test',
      showStatusActivities: false,
      showErrors: true,
      emptyMsgOnFail: true,
      keepMsgProperties: false,
      server: 'modbus-client',
      wires: [[], ['error-helper']]
    },
    {
      id: 'error-helper',
      type: 'helper',
      name: 'Error Helper',
      wires: []
    }
  ]),

  flexWriteDynamicConfigFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'modbus-server',
      type: 'modbus-server',
      name: 'Test Server',
      hostname: '127.0.0.1',
      serverPort: '8525',
      responseDelay: 50,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false
    },
    {
      id: 'modbus-client',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '8525',
      tcpType: 'DEFAULT',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true
    },
    {
      id: 'flex-write-dynamic',
      type: 'modbus-flex-write',
      name: 'Flex Write Dynamic Config',
      showStatusActivities: false,
      showErrors: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      server: 'modbus-client',
      wires: [['helper-node'], []]
    },
    {
      id: 'helper-node',
      type: 'helper',
      name: 'Helper Node',
      wires: []
    }
  ]),

  flexWriteKeepPropertiesFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'modbus-server',
      type: 'modbus-server',
      name: 'Test Server',
      hostname: '127.0.0.1',
      serverPort: '8526',
      responseDelay: 50,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false
    },
    {
      id: 'modbus-client',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '8526',
      tcpType: 'DEFAULT',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000'
    },
    {
      id: 'flex-write-keep-props',
      type: 'modbus-flex-write',
      name: 'Flex Write Keep Properties',
      showStatusActivities: false,
      showErrors: false,
      emptyMsgOnFail: false,
      keepMsgProperties: true,
      server: 'modbus-client',
      wires: [['helper-node'], []]
    },
    {
      id: 'helper-node',
      type: 'helper',
      name: 'Helper Node',
      wires: []
    }
  ]),

  flexWriteConnectionPoolFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'modbus-server',
      type: 'modbus-server',
      name: 'Test Server',
      hostname: '127.0.0.1',
      serverPort: '8527',
      responseDelay: 50,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false
    },
    {
      id: 'modbus-client',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '8527',
      tcpType: 'DEFAULT',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000',
      parallelUnitIdsAllowed: true
    },
    {
      id: 'flex-write-pool',
      type: 'modbus-flex-write',
      name: 'Flex Write Connection Pool',
      showStatusActivities: false,
      showErrors: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      server: 'modbus-client',
      wires: [['helper-node'], []]
    },
    {
      id: 'helper-node',
      type: 'helper',
      name: 'Helper Node',
      wires: []
    }
  ]),

  flexWriteTimeoutFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'modbus-server',
      type: 'modbus-server',
      name: 'Test Server',
      hostname: '127.0.0.1',
      serverPort: '8528',
      responseDelay: 50,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      showErrors: false
    },
    {
      id: 'modbus-client',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: '8528',
      tcpType: 'DEFAULT',
      unit_id: '1',
      commandDelay: '1',
      clientTimeout: '1000',
      reconnectOnTimeout: true,
      reconnectTimeout: '2000'
    },
    {
      id: 'flex-write-timeout',
      type: 'modbus-flex-write',
      name: 'Flex Write Timeout',
      showStatusActivities: false,
      showErrors: false,
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      server: 'modbus-client',
      wires: [['helper-node'], []]
    },
    {
      id: 'helper-node',
      type: 'helper',
      name: 'Helper Node',
      wires: []
    }
  ])
}