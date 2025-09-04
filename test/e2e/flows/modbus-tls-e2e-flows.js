const helperExtensions = require('../../helper/test-helper-extensions')
const path = require('path')
const fs = require('fs')

// Certificate paths
const certPath = path.join(__dirname, '../../certificates')
const serverKey = fs.readFileSync(path.join(certPath, 'server-key.pem'), 'utf8')
const serverCert = fs.readFileSync(path.join(certPath, 'server-cert.pem'), 'utf8')
const caCert = fs.readFileSync(path.join(certPath, 'ca-cert.pem'), 'utf8')
const clientKey = fs.readFileSync(path.join(certPath, 'client-key.pem'), 'utf8')
const clientCert = fs.readFileSync(path.join(certPath, 'client-cert.pem'), 'utf8')

module.exports = {
  
  basicTlsClientFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'tls-client',
      type: 'modbus-client-tls',
      name: 'ModbusTLSClient',
      clienttype: 'tcp',
      tcpType: 'TLS',
      tcpHost: '127.0.0.1',
      tcpPort: '8502',
      tcpAlwaysReconnect: true,
      reconnectOnTimeout: true,
      reconnectTimeout: 2000,
      unitId: 1,
      commandDelay: 100,
      clientTimeout: 1000,
      tlsOptions: {
        rejectUnauthorized: false
      }
    }
  ]),

  tlsClientServerFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'tls-server',
      type: 'modbus-server-tls',
      name: 'ModbusTLSServer',
      hostname: '127.0.0.1',
      serverPort: '8503',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      tlsOptions: {
        key: serverKey,
        cert: serverCert,
        ca: caCert,
        rejectUnauthorized: false
      },
      showErrors: false
    },
    {
      id: 'tls-client',
      type: 'modbus-client-tls',
      name: 'ModbusTLSClient',
      clienttype: 'tcp',
      tcpType: 'TLS',
      tcpHost: '127.0.0.1',
      tcpPort: '8503',
      tcpAlwaysReconnect: true,
      reconnectOnTimeout: true,
      reconnectTimeout: 2000,
      unitId: 1,
      commandDelay: 100,
      clientTimeout: 1000,
      tlsOptions: {
        rejectUnauthorized: false
      }
    }
  ]),

  tlsWithCertificatesFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'tls-client-cert',
      type: 'modbus-client-tls',
      name: 'TLSClientWithCert',
      clienttype: 'tcp',
      tcpType: 'TLS',
      tcpHost: '127.0.0.1',
      tcpPort: '8504',
      tcpAlwaysReconnect: true,
      reconnectOnTimeout: true,
      reconnectTimeout: 2000,
      unitId: 1,
      commandDelay: 100,
      clientTimeout: 1000,
      tlsOptions: {
        key: clientKey,
        cert: clientCert,
        ca: caCert,
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_2_method'
      }
    }
  ]),

  tlsReadFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'tls-server',
      type: 'modbus-server-tls',
      name: 'ModbusTLSServer',
      hostname: '127.0.0.1',
      serverPort: '8505',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      tlsOptions: {
        rejectUnauthorized: false
      },
      showErrors: false
    },
    {
      id: 'tls-client',
      type: 'modbus-client-tls',
      name: 'ModbusTLSClient',
      clienttype: 'tcp',
      tcpType: 'TLS',
      tcpHost: '127.0.0.1',
      tcpPort: '8505',
      tcpAlwaysReconnect: true,
      reconnectOnTimeout: true,
      reconnectTimeout: 2000,
      unitId: 1
    },
    {
      id: 'tls-read',
      type: 'modbus-read',
      name: 'TLS Read Test',
      topic: '',
      showStatusActivities: false,
      logIOActivities: false,
      showErrors: false,
      unitid: '1',
      dataType: 'HoldingRegister',
      adr: '0',
      quantity: '10',
      rate: '1',
      rateUnit: 's',
      server: 'tls-client',
      useIOFile: false,
      ioFile: '',
      useIOForPayload: false,
      emptyMsgOnFail: false,
      wires: [['helper-node'], []]
    },
    {
      id: 'helper-node',
      type: 'helper',
      name: 'Helper Node',
      wires: []
    }
  ]),

  tlsWriteFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'tls-server',
      type: 'modbus-server-tls',
      name: 'ModbusTLSServer',
      hostname: '127.0.0.1',
      serverPort: '8506',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      tlsOptions: {
        rejectUnauthorized: false
      },
      showErrors: false
    },
    {
      id: 'tls-client',
      type: 'modbus-client-tls',
      name: 'ModbusTLSClient',
      clienttype: 'tcp',
      tcpType: 'TLS',
      tcpHost: '127.0.0.1',
      tcpPort: '8506',
      tcpAlwaysReconnect: true,
      reconnectOnTimeout: true,
      reconnectTimeout: 2000,
      unitId: 1
    },
    {
      id: 'tls-write',
      type: 'modbus-write',
      name: 'TLS Write Test',
      showStatusActivities: false,
      showErrors: false,
      unitid: '1',
      dataType: 'HoldingRegister',
      adr: '0',
      quantity: '2',
      server: 'tls-client',
      emptyMsgOnFail: false,
      keepMsgProperties: false,
      wires: [['helper-node'], []]
    },
    {
      id: 'helper-node',
      type: 'helper',
      name: 'Helper Node',
      wires: []
    }
  ]),

  tlsErrorHandlingFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'tls-client-error',
      type: 'modbus-client-tls',
      name: 'TLSClientError',
      clienttype: 'tcp',
      tcpType: 'TLS',
      tcpHost: '127.0.0.1',
      tcpPort: '9999', // Invalid port
      tcpAlwaysReconnect: false,
      reconnectOnTimeout: false,
      reconnectTimeout: 2000,
      unitId: 1,
      commandDelay: 100,
      clientTimeout: 500,
      tlsOptions: {
        rejectUnauthorized: false
      }
    }
  ]),

  tlsReconnectFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'tls-server-reconnect',
      type: 'modbus-server-tls',
      name: 'ModbusTLSServer',
      hostname: '127.0.0.1',
      serverPort: '8507',
      responseDelay: 100,
      delayUnit: 'ms',
      coilsBufferSize: 10000,
      holdingBufferSize: 10000,
      inputBufferSize: 10000,
      discreteBufferSize: 10000,
      tlsOptions: {
        rejectUnauthorized: false
      },
      showErrors: false
    },
    {
      id: 'tls-client-reconnect',
      type: 'modbus-client-tls',
      name: 'TLSClientReconnect',
      clienttype: 'tcp',
      tcpType: 'TLS',
      tcpHost: '127.0.0.1',
      tcpPort: '8507',
      tcpAlwaysReconnect: true,
      reconnectOnTimeout: true,
      reconnectTimeout: 1000,
      unitId: 1,
      commandDelay: 100,
      clientTimeout: 1000,
      tlsOptions: {
        rejectUnauthorized: false
      }
    }
  ]),

  tlsOptionsValidationFlow: helperExtensions.cleanFlowPositionData([
    {
      id: 'tls-client-options',
      type: 'modbus-client-tls',
      name: 'TLSClientOptions',
      clienttype: 'tcp',
      tcpType: 'TLS',
      tcpHost: '127.0.0.1',
      tcpPort: '8508',
      tcpAlwaysReconnect: true,
      reconnectOnTimeout: true,
      reconnectTimeout: 2000,
      unitId: 1,
      commandDelay: 100,
      clientTimeout: 1000,
      tlsOptions: {
        rejectUnauthorized: true,
        secureProtocol: 'TLSv1_2_method',
        ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
        honorCipherOrder: true,
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3'
      }
    }
  ])
}