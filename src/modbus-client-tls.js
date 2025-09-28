/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */

/**
 * Modbus TLS Client connection node.
 * @module NodeRedModbusTLSClient
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const coreModbusClient = require('./core/modbus-client-core')
  const coreModbusQueue = require('./core/modbus-queue-core')
  const internalDebugLog = require('./core/modbus-logger').getDebugLogger('contribModbus:config:tls:client')
  // const _ = require('underscore')
  const fs = require('fs')

  function ModbusTLSClientNode (config) {
    RED.nodes.createNode(this, config)

    // create an empty modbus client
    const ModbusRTU = require('@openp4nr/node-modbus')

    const unlimitedListeners = 0
    const minCommandDelayMilliseconds = 1
    const defaultTcpUnitId = 0
    const timeoutTimeMS = 1000
    const reconnectTimeMS = 2000

    this.clienttype = 'tls'
    this.bufferCommands = config.bufferCommands !== false

    this.queueLogEnabled = config.queueLogEnabled
    this.stateLogEnabled = config.stateLogEnabled
    this.failureLogEnabled = config.failureLogEnabled

    this.tcpHost = config.tcpHost || 'localhost'
    this.tcpPort = parseInt(config.tcpPort) || 8502
    this.tcpType = 'TLS'

    // TLS Configuration
    this.tlsOptions = {
      key: config.privateKey || '',
      cert: config.certificate || '',
      ca: config.ca || '',
      rejectUnauthorized: config.rejectUnauthorized !== false,
      servername: config.servername || this.tcpHost,
      secureProtocol: config.secureProtocol || 'TLSv1_2_method',
      checkServerIdentity: config.checkServerIdentity !== false ? undefined : () => undefined
    }

    this.unit_id = parseInt(config.unit_id) || defaultTcpUnitId
    this.commandDelay = parseInt(config.commandDelay) || minCommandDelayMilliseconds
    this.clientTimeout = parseInt(config.clientTimeout) || timeoutTimeMS
    this.reconnectTimeout = parseInt(config.reconnectTimeout) || reconnectTimeMS
    this.reconnectOnTimeout = config.reconnectOnTimeout !== false
    this.parallelUnitIdsAllowed = config.parallelUnitIdsAllowed !== false

    this.showErrors = config.showErrors
    this.showWarnings = config.showWarnings
    this.showLogs = config.showLogs

    const node = this
    node.client = null
    node.isFirstInit = true
    node.connectInitialized = false
    node.connectInitializing = false

    mbBasics.setNodeStatusTo('initialized', node)

    // Circuit breaker integration
    if (coreModbusClient.initializeCircuitBreaker) {
      coreModbusClient.initializeCircuitBreaker(node, {
        enabled: config.circuitBreakerEnabled !== false,
        failureThreshold: parseInt(config.circuitBreakerFailureThreshold) || 5,
        successThreshold: parseInt(config.circuitBreakerSuccessThreshold) || 2,
        timeout: parseInt(config.circuitBreakerTimeout) || 60000,
        resetTimeout: parseInt(config.circuitBreakerResetTimeout) || 30000
      })
    }

    // Connection pool integration
    if (coreModbusClient.initializeConnectionPool) {
      coreModbusClient.initializeConnectionPool(node, {
        enabled: config.connectionPoolEnabled === true,
        maxConnections: parseInt(config.connectionPoolMaxConnections) || 10,
        maxConnectionsPerHost: parseInt(config.connectionPoolMaxPerHost) || 3
      })
    }

    // Diagnostics integration
    if (coreModbusClient.initializeDiagnostics) {
      coreModbusClient.initializeDiagnostics(node, {
        enabled: config.diagnosticsEnabled === true,
        metricsInterval: parseInt(config.diagnosticsMetricsInterval) || 60000,
        alerting: config.diagnosticsAlerting === true
      })
    }

    // Retry handler integration
    if (coreModbusClient.initializeRetryHandler) {
      coreModbusClient.initializeRetryHandler(node, {
        enabled: config.retryHandlerEnabled !== false,
        maxRetries: parseInt(config.retryHandlerMaxRetries) || 3,
        initialDelay: parseInt(config.retryHandlerInitialDelay) || 1000,
        maxDelay: parseInt(config.retryHandlerMaxDelay) || 30000,
        backoffMultiplier: parseFloat(config.retryHandlerBackoffMultiplier) || 2
      })
    }

    function loadTLSOptions () {
      const options = {}

      // Load private key if provided (for client certificate authentication)
      if (node.tlsOptions.key) {
        try {
          if (node.tlsOptions.key.startsWith('-----BEGIN')) {
            options.key = node.tlsOptions.key
          } else if (fs.existsSync(node.tlsOptions.key)) {
            options.key = fs.readFileSync(node.tlsOptions.key)
          }
        } catch (err) {
          node.error('Failed to load TLS private key: ' + err.message)
        }
      }

      // Load client certificate if provided
      if (node.tlsOptions.cert) {
        try {
          if (node.tlsOptions.cert.startsWith('-----BEGIN')) {
            options.cert = node.tlsOptions.cert
          } else if (fs.existsSync(node.tlsOptions.cert)) {
            options.cert = fs.readFileSync(node.tlsOptions.cert)
          }
        } catch (err) {
          node.error('Failed to load TLS certificate: ' + err.message)
        }
      }

      // Load CA certificate for server verification
      if (node.tlsOptions.ca) {
        try {
          if (node.tlsOptions.ca.startsWith('-----BEGIN')) {
            options.ca = node.tlsOptions.ca
          } else if (fs.existsSync(node.tlsOptions.ca)) {
            options.ca = fs.readFileSync(node.tlsOptions.ca)
          }
        } catch (err) {
          node.error('Failed to load CA certificate: ' + err.message)
        }
      }

      options.rejectUnauthorized = node.tlsOptions.rejectUnauthorized
      options.servername = node.tlsOptions.servername
      options.secureProtocol = node.tlsOptions.secureProtocol

      if (node.tlsOptions.checkServerIdentity === false) {
        options.checkServerIdentity = () => undefined
      }

      return options
    }

    function setNewTLSNodeClient () {
      if (!node.client) {
        node.client = new ModbusRTU()

        if (node.bufferCommands) {
          node.client.setMaxListeners(unlimitedListeners)
        }

        node.client.on('error', function (err) {
          if (node.showErrors) {
            node.error(err, { payload: 'client error' })
          }
          mbBasics.setNodeStatusTo('error', node)

          // Trigger circuit breaker if enabled
          if (node.circuitBreaker) {
            node.circuitBreaker.recordFailure()
          }
        })

        node.client.on('close', function () {
          internalDebugLog('TLS connection closed')
          mbBasics.setNodeStatusTo('disconnected', node)
        })

        node.client.on('connect', function () {
          internalDebugLog('TLS connection established')
          mbBasics.setNodeStatusTo('connected', node)

          // Record success for circuit breaker
          if (node.circuitBreaker) {
            node.circuitBreaker.recordSuccess()
          }
        })
      }
    }

    function connectTLSClient () {
      if (node.connectInitializing) {
        internalDebugLog('Already connecting')
        return
      }

      node.connectInitializing = true

      // Check circuit breaker state
      if (node.circuitBreaker && !node.circuitBreaker.canExecute()) {
        node.warn('Circuit breaker is open, skipping connection attempt')
        mbBasics.setNodeStatusTo('circuit-open', node)
        node.connectInitializing = false
        return
      }

      setNewTLSNodeClient()

      if (!node.client) {
        node.error('Client not initialized')
        node.connectInitializing = false
        return
      }

      const tlsOptions = loadTLSOptions()

      // Extend options with connection parameters
      tlsOptions.host = node.tcpHost
      tlsOptions.port = node.tcpPort

      internalDebugLog('Connecting to TLS Modbus server at ' + node.tcpHost + ':' + node.tcpPort)

      // Use connectTCP with TLS options (the modbus library should support this)
      // If not, we might need to establish TLS connection first and then wrap it
      node.client.connectTelnet(node.tcpHost, {
        port: node.tcpPort,
        ...tlsOptions
      }, function (err) {
        node.connectInitializing = false

        if (err) {
          node.error('TLS connection failed: ' + err.message)
          mbBasics.setNodeStatusTo('error', node)

          // Record failure for circuit breaker
          if (node.circuitBreaker) {
            node.circuitBreaker.recordFailure()
          }

          // Retry if enabled
          if (node.reconnectOnTimeout && node.retryHandler) {
            node.retryHandler.executeWithRetry(async () => {
              connectTLSClient()
            }).catch(retryErr => {
              node.error('Failed to reconnect after retries: ' + retryErr.message)
            })
          }
        } else {
          node.connectInitialized = true
          mbBasics.setNodeStatusTo('connected', node)

          // Set timeout
          if (node.clientTimeout) {
            node.client.setTimeout(node.clientTimeout)
          }

          // Set unit ID
          if (node.unit_id) {
            node.client.setID(node.unit_id)
          }

          // Record connection in diagnostics
          if (node.diagnostics) {
            node.diagnostics.recordConnectionStatus('connected', {
              host: node.tcpHost,
              port: node.tcpPort,
              protocol: 'TLS'
            })
          }
        }
      })
    }

    node.on('input', function (msg) {
      if (msg.payload === 'connect') {
        connectTLSClient()
      } else if (msg.payload === 'disconnect') {
        if (node.client) {
          node.client.close(function () {
            mbBasics.setNodeStatusTo('disconnected', node)
          })
        }
      } else if (msg.payload === 'reconnect') {
        if (node.client) {
          node.client.close(function () {
            connectTLSClient()
          })
        } else {
          connectTLSClient()
        }
      }
    })

    node.on('close', function (done) {
      mbBasics.setNodeStatusTo('closed', node)

      if (node.client) {
        node.client.close(function () {
          node.client = null
          done()
        })
      } else {
        done()
      }
    })

    // Queue management
    node.messageAllowedStates = coreModbusClient.messageAllowedStates
    node.serverInfo = { host: node.tcpHost, port: node.tcpPort, protocol: 'TLS' }
    node.bufferCommandList = new Map()
    node.sendToDeviceAllowed = coreModbusClient.sendToDeviceAllowed

    // Initialize connection queue
    coreModbusQueue.initQueueByUnitId(node)

    // Auto-connect on deployment
    if (config.autoConnect !== false) {
      setTimeout(function () {
        connectTLSClient()
      }, 500)
    }
  }

  RED.nodes.registerType('modbus-client-tls', ModbusTLSClientNode)
}
