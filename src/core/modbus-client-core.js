/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'
// SOURCE-MAP-REQUIRED

// eslint-disable-next-line no-var
var de = de || { biancoroyal: { modbus: { core: { client: {} } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.internalDebug = de.biancoroyal.modbus.core.client.internalDebug || require('debug')('contribModbus:core:client') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.internalDebugFSM = de.biancoroyal.modbus.core.client.internalDebugFSM || require('debug')('contribModbus:core:client:fsm') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.modbusSerialDebug = de.biancoroyal.modbus.core.client.modbusSerialDebug || require('debug')('modbus-serial') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.XStateFSM = de.biancoroyal.modbus.core.client.XStateFSM || require('@xstate/fsm') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.stateLogEnabled = de.biancoroyal.modbus.core.client.stateLogEnabled || false // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.ModbusCircuitBreaker = de.biancoroyal.modbus.core.client.ModbusCircuitBreaker || require('./modbus-circuit-breaker').ModbusCircuitBreaker // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.ModbusConnectionPool = de.biancoroyal.modbus.core.client.ModbusConnectionPool || require('./modbus-connection-pool').ModbusConnectionPool // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.ModbusRetryHandler = de.biancoroyal.modbus.core.client.ModbusRetryHandler || require('./modbus-retry-handler').ModbusRetryHandler // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.core.client.ModbusDiagnostics = de.biancoroyal.modbus.core.client.ModbusDiagnostics || require('./modbus-diagnostics').ModbusDiagnostics // eslint-disable-line no-use-before-define

de.biancoroyal.modbus.core.client.networkErrors = ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET', 'ENETRESET',
  'ECONNABORTED', 'ECONNREFUSED', 'ENETUNREACH', 'ENOTCONN',
  'ESHUTDOWN', 'EHOSTDOWN', 'ENETDOWN', 'EWOULDBLOCK', 'EAGAIN', 'EHOSTUNREACH',
  'EPIPE', 'ECONNRESET']

/**
 * Get connection from pool or create new one
 */
de.biancoroyal.modbus.core.client.getPooledConnection = async function (node, config) {
  if (!node.connectionPool) {
    return null
  }

  try {
    const connection = await node.connectionPool.getConnection(config, {
      priority: config.priority || 1
    })

    return connection
  } catch (error) {
    const enhancedError = {
      message: error.message || 'Failed to get pooled connection',
      code: error.code || 'POOL_CONNECTION_ERROR',
      context: {
        nodeId: node.id,
        config: {
          host: config.tcpHost,
          port: config.tcpPort,
          priority: config.priority || 1
        },
        timestamp: new Date().toISOString()
      },
      originalError: error
    }
    this.internalDebug('Failed to get pooled connection:', enhancedError)
    throw enhancedError
  }
}

/**
 * Release connection back to pool
 */
de.biancoroyal.modbus.core.client.releasePooledConnection = function (node, connection) {
  if (!node.connectionPool || !connection) {
    return
  }

  node.connectionPool.releaseConnection(connection)
}

/**
 * Get diagnostics report
 */
de.biancoroyal.modbus.core.client.getDiagnosticsReport = function (node) {
  if (!node.diagnostics) {
    return null
  }

  return node.diagnostics.getReport()
}

/**
 * Export metrics in specified format
 */
de.biancoroyal.modbus.core.client.exportMetrics = function (node, format) {
  if (!node.diagnostics) {
    return null
  }

  return node.diagnostics.exportMetrics(format)
}

/**
 * Clean up resilience modules
 */
de.biancoroyal.modbus.core.client.cleanupResilienceModules = function (node) {
  if (node.circuitBreaker) {
    node.circuitBreaker.destroy()
    node.circuitBreaker = null
  }

  if (node.connectionPool) {
    node.connectionPool.clear()
    node.connectionPool = null
  }

  if (node.retryHandler) {
    node.retryHandler.clearActiveRetries()
    node.retryHandler = null
  }

  if (node.diagnostics) {
    node.diagnostics.clear()
    node.diagnostics = null
  }
}

/**
 * Initialize all resilience modules for a client node
 */
de.biancoroyal.modbus.core.client.initializeResilienceModules = function (node, options = {}) {
  // Initialize Circuit Breaker
  if (!node.circuitBreaker && options.enableCircuitBreaker !== false) {
    const circuitBreakerOptions = {
      failureThreshold: options.failureThreshold || 5,
      successThreshold: options.successThreshold || 2,
      timeout: options.timeout || 10000,
      resetTimeout: options.resetTimeout || 30000,
      volumeThreshold: options.volumeThreshold || 10,
      rollingWindow: options.rollingWindow || 10000,
      fallbackFunction: options.fallbackFunction || null
    }

    node.circuitBreaker = new this.ModbusCircuitBreaker(circuitBreakerOptions)

    // Circuit breaker event handlers
    node.circuitBreaker.on('stateChange', (data) => {
      const msg = `Circuit breaker state changed from ${data.from} to ${data.to}`
      this.internalDebug(msg)
      if (node.showStatusActivities) {
        const statusColor = data.to === 'OPEN' ? 'red' : data.to === 'HALF_OPEN' ? 'yellow' : 'green'
        node.status({ fill: statusColor, shape: 'ring', text: `Circuit ${data.to}` })
      }
    })

    node.circuitBreaker.on('rejected', (data) => {
      this.internalDebug('Request rejected by circuit breaker', data)
    })

    node.circuitBreaker.on('fallback', (data) => {
      this.internalDebug('Circuit breaker fallback activated', data)
    })
  }

  // Initialize Connection Pool
  if (!node.connectionPool && options.enableConnectionPool) {
    const poolOptions = {
      maxConnections: options.maxConnections || 10,
      maxConnectionsPerHost: options.maxConnectionsPerHost || 3,
      connectionTimeout: options.connectionTimeout || 30000,
      idleTimeout: options.idleTimeout || 120000,
      healthCheckInterval: options.healthCheckInterval || 30000,
      connectionFactory: options.connectionFactory || null
    }

    node.connectionPool = new this.ModbusConnectionPool(poolOptions)

    node.connectionPool.on('connectionCreated', (data) => {
      this.internalDebug('Connection pool: connection created', data)
    })

    node.connectionPool.on('connectionError', (data) => {
      this.internalDebug('Connection pool: connection error', data)
    })
  }

  // Initialize Retry Handler
  if (!node.retryHandler && options.enableRetryHandler !== false) {
    const retryOptions = {
      maxRetries: options.maxRetries || 3,
      initialDelay: options.initialDelay || 1000,
      maxDelay: options.maxDelay || 30000,
      backoffMultiplier: options.backoffMultiplier || 2,
      circuitBreaker: node.circuitBreaker || null
    }

    node.retryHandler = new this.ModbusRetryHandler(retryOptions)

    node.retryHandler.on('retrying', (data) => {
      this.internalDebug('Retry handler: retrying operation', data)
    })

    node.retryHandler.on('failed', (data) => {
      this.internalDebug('Retry handler: operation failed after retries', data)
    })
  }

  // Initialize Diagnostics
  if (!node.diagnostics && options.enableDiagnostics !== false) {
    const diagnosticsOptions = {
      enableMetrics: options.enableMetrics !== false,
      enableTracing: options.enableTracing || false,
      metricsInterval: options.metricsInterval || 10000,
      alertThresholds: options.alertThresholds || {}
    }

    node.diagnostics = new this.ModbusDiagnostics(diagnosticsOptions)

    // Set integrations
    node.diagnostics.setIntegrations({
      circuitBreaker: node.circuitBreaker,
      connectionPool: node.connectionPool,
      retryHandler: node.retryHandler
    })

    node.diagnostics.on('alert', (alert) => {
      this.internalDebug('Diagnostics alert:', alert)
      if (node.showStatusActivities) {
        const color = alert.severity === 'critical' ? 'red' : alert.severity === 'warning' ? 'yellow' : 'blue'
        node.status({ fill: color, shape: 'dot', text: alert.message })
      }
    })

    node.diagnostics.on('metrics', (metrics) => {
      this.internalDebugFSM('Diagnostics metrics update', metrics)
    })
  }

  return {
    circuitBreaker: node.circuitBreaker,
    connectionPool: node.connectionPool,
    retryHandler: node.retryHandler,
    diagnostics: node.diagnostics
  }
}

/**
 * Initialize circuit breaker for a client node (legacy compatibility)
 */
de.biancoroyal.modbus.core.client.initializeCircuitBreaker = function (node, options = {}) {
  const modules = this.initializeResilienceModules(node, options)
  return modules.circuitBreaker
}

/**
 * Execute Modbus operation with full resilience stack
 */
de.biancoroyal.modbus.core.client.executeWithResilience = async function (node, operation, options = {}) {
  const startTime = Date.now()
  let traceId = null

  // Record request in diagnostics
  if (node.diagnostics) {
    traceId = node.diagnostics.recordRequest({
      device: options.device || node.name,
      functionCode: options.functionCode,
      address: options.address,
      quantity: options.quantity,
      unitId: options.unitId || node.unit_id
    })
  }

  try {
    let result

    // Execute through retry handler if available
    if (node.retryHandler && options.enableRetry !== false) {
      result = await node.retryHandler.executeWithRetry(
        async () => {
          // Execute through circuit breaker if available
          if (node.circuitBreaker && options.enableCircuitBreaker !== false) {
            return await node.circuitBreaker.execute(operation)
          } else {
            return await operation()
          }
        },
        options.context || {},
        options.retryOptions || {}
      )
    } else if (node.circuitBreaker && options.enableCircuitBreaker !== false) {
      // Execute through circuit breaker only
      result = await node.circuitBreaker.execute(operation)
    } else {
      // Execute directly
      result = await operation()
    }

    // Record successful response
    if (node.diagnostics && traceId) {
      node.diagnostics.recordResponse(traceId, {
        success: true,
        responseTime: Date.now() - startTime,
        result
      })
    }

    return result
  } catch (error) {
    // Record failed response
    if (node.diagnostics && traceId) {
      node.diagnostics.recordResponse(traceId, {
        success: false,
        responseTime: Date.now() - startTime,
        error
      })
    }

    // Log specific error types
    if (error.name === 'CircuitBreakerError') {
      this.internalDebug('Circuit breaker prevented operation:', error.message)
    } else if (error.name === 'RetryError') {
      this.internalDebug('Operation failed after retries:', error.message)
    }

    throw error
  }
}

/**
 * Execute Modbus operation through circuit breaker (legacy compatibility)
 */
de.biancoroyal.modbus.core.client.executeWithCircuitBreaker = async function (node, operation) {
  return this.executeWithResilience(node, operation, { enableRetry: false })
}

/**
 * Creates a state machine service specifically for handling Modbus states.
 *
 * This function initializes a finite state machine using the XState library,
 * defining the various states and transitions possible for a Modbus connection workflow.
 *
 * States included are:
 * - new: Starting state, can transition to 'init', 'broken', or 'stopped'.
 * - broken: Transition from 'init', 'stopped', 'failed', 'activated', 'reconnecting'.
 * - reconnecting: Transitional state to 'init', 'stopped'.
 * - init: Initialize to 'opened', 'connected', 'broken', 'failed', 'stopped', 'switch'.
 * - opened: Once open, proceed to 'connected', 'broken', 'failed', 'closed', 'stopped', 'switch'.
 * - connected: Once connected, possible to go 'closed', 'activated', 'queueing', 'broken', 'failed', 'stopped', 'switch'.
 * - activated: From here, transitions available to 'reading', 'writing', 'queueing', 'broken', 'closed', 'failed', 'stopped', 'switch'.
 * - queueing: Can activate or go 'sending', 'reading', 'writing', 'empty', 'broken', 'closed', 'failed', 'stopped', 'switch'.
 * - empty: Queueing returns to 'queueing', or transitions to 'broken', 'failed', 'closed', 'stopped', 'switch'.
 * - sending: Transitions included are 'activated', 'reading', 'writing', 'broken', 'failed', and 'stopped', 'switch'.
 * - reading: Here, transitions are to 'activated', 'broken', 'failed', 'stopped'.
 * - writing: Similar transitions to 'reading', which includes 'activated', 'broken', 'failed', 'stopped'.
 * - closed: From here, options include 'failed', 'broken', 'connected', 'reconnecting', 'init', 'stopped', 'switch'.
 * - failed: State transitions are 'closed', 'broken', 'stopped', 'switch'.
 * - switch: Simply transitions to 'closed', 'broken', 'stopped'.
 * - stopped: Terminal state with possible transition back to 'new' or staying 'stopped'.
 *
 * @return {StateMachine} Returns the created state machine instance with defined states and transitions for Modbus.
 */
de.biancoroyal.modbus.core.client.createStateMachineService = function () {
  this.stateLogEnabled = false

  return this.XStateFSM.createMachine({
    id: 'modbus',
    initial: 'new',
    states: {
      new: { on: { INIT: 'init', BREAK: 'broken', STOP: 'stopped' } },
      broken: { on: { INIT: 'init', STOP: 'stopped', FAILURE: 'failed', ACTIVATE: 'activated', RECONNECT: 'reconnecting' } },
      reconnecting: { on: { INIT: 'init', STOP: 'stopped' } },
      init: { on: { OPENSERIAL: 'opened', CONNECT: 'connected', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' } },
      opened: { on: { CONNECT: 'connected', BREAK: 'broken', FAILURE: 'failed', CLOSE: 'closed', STOP: 'stopped', SWITCH: 'switch' } },
      connected: { on: { CLOSE: 'closed', ACTIVATE: 'activated', QUEUE: 'queueing', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' } },
      activated: { on: { READ: 'reading', WRITE: 'writing', QUEUE: 'queueing', BREAK: 'broken', CLOSE: 'closed', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' } },
      queueing: { on: { ACTIVATE: 'activated', SEND: 'sending', READ: 'reading', WRITE: 'writing', EMPTY: 'empty', BREAK: 'broken', CLOSE: 'closed', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' } },
      empty: { on: { QUEUE: 'queueing', BREAK: 'broken', FAILURE: 'failed', CLOSE: 'closed', STOP: 'stopped', SWITCH: 'switch' } },
      sending: { on: { ACTIVATE: 'activated', READ: 'reading', WRITE: 'writing', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped', SWITCH: 'switch' } },
      reading: { on: { ACTIVATE: 'activated', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped' } },
      writing: { on: { ACTIVATE: 'activated', BREAK: 'broken', FAILURE: 'failed', STOP: 'stopped' } },
      closed: { on: { FAILURE: 'failed', BREAK: 'broken', CONNECT: 'connected', RECONNECT: 'reconnecting', INIT: 'init', STOP: 'stopped', SWITCH: 'switch' } },
      failed: { on: { CLOSE: 'closed', BREAK: 'broken', STOP: 'stopped', SWITCH: 'switch' } },
      switch: { on: { CLOSE: 'closed', BREAK: 'broken', STOP: 'stopped' } },
      stopped: { on: { NEW: 'new', STOP: 'stopped' } }
    }
  })
}

de.biancoroyal.modbus.core.client.getActualUnitId = function (node, msg) {
  if (msg.payload && Number.isInteger(msg.payload.unitid)) {
    return parseInt(msg.payload.unitid)
  } else if (Number.isInteger(msg.queueUnitId)) {
    return parseInt(msg.queueUnitId)
  } else {
    return parseInt(node.unit_id) || 0
  }
}

de.biancoroyal.modbus.core.client.startStateService = function (toggleMachine) {
  return this.XStateFSM.interpret(toggleMachine).start()
}

de.biancoroyal.modbus.core.client.checkUnitId = function (unitid, clientType) {
  if (clientType === 'tcp') {
    return unitid >= 0 && unitid <= 255
  } else {
    return unitid >= 0 && unitid <= 247
  }
}

de.biancoroyal.modbus.core.client.getLogFunction = function (node) {
  if (node.internalDebugLog) {
    return node.internalDebugLog
  } else {
    return de.biancoroyal.modbus.core.client.internalDebug
  }
}

de.biancoroyal.modbus.core.client.activateSendingOnSuccess = function (node, cb, cberr, resp, msg) {
  node.activateSending(msg).then(function () {
    cb(resp, msg)
  }).catch(function (err) {
    cberr(err, msg)
  }).finally(function () {
    node.stateService.send('ACTIVATE')
  })
}

de.biancoroyal.modbus.core.client.activateSendingOnFailure = function (node, cberr, err, msg) {
  // Check for Exception 11 (Gateway Target Device Failed to Respond)
  if (err && err.modbusCode === 11 && msg && msg.queueUnitId !== undefined) {
    const queueCore = require('./modbus-queue-core')
    const clearedItems = queueCore.clearUnitQueue(node, msg.queueUnitId)
    if (clearedItems > 0) {
      de.biancoroyal.modbus.core.client.internalDebug(`Exception 11 detected - cleared ${clearedItems} items from queue for unit ${msg.queueUnitId}`)
      if (node.warn) {
        node.warn(`Gateway target device failed to respond (Exception 11) - cleared queue for unit ${msg.queueUnitId}`)
      }
    }
  }

  node.activateSending(msg).then(function () {
    cberr(err, msg)
  }).catch(function (err) {
    cberr(err, msg)
  }).finally(function () {
    node.stateService.send('ACTIVATE')
  })
}

de.biancoroyal.modbus.core.client.readModbusByFunctionCodeOne = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  node.client.readCoils(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
    node.modbusErrorHandling(err)
  })
}

de.biancoroyal.modbus.core.client.readModbusByFunctionCodeTwo = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  node.client.readDiscreteInputs(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
    node.modbusErrorHandling(err)
  })
}

de.biancoroyal.modbus.core.client.readModbusByFunctionCodeThree = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  node.client.readHoldingRegisters(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
    node.modbusErrorHandling(err)
  })
}

de.biancoroyal.modbus.core.client.readModbusByFunctionCodeFour = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  node.client.readInputRegisters(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
    node.modbusErrorHandling(err)
  })
}

de.biancoroyal.modbus.core.client.sendCustomFunctionCode = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  // const nodeLog = deb.biancoroyal.modbus.core.client.getLogFunction(node)

  node.client.sendCustomFc(msg.payload.unitid, msg.payload.fc, msg.payload.requestCard, msg.payload.responseCard).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    coreClient.activateSendingOnFailure(node, cberr, new Error(err.message), msg)
    node.modbusErrorHandling(err)
  })
}

de.biancoroyal.modbus.core.client.readModbusByFunctionCode = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)

  switch (parseInt(msg.payload.fc)) {
    case 1:
      coreClient.readModbusByFunctionCodeOne(node, msg, cb, cberr)
      break
    case 2:
      coreClient.readModbusByFunctionCodeTwo(node, msg, cb, cberr)
      break
    case 3:
      coreClient.readModbusByFunctionCodeThree(node, msg, cb, cberr)
      break
    case 4:
      coreClient.readModbusByFunctionCodeFour(node, msg, cb, cberr)
      break
    default:
      coreClient.activateSendingOnFailure(node, cberr, new Error('Function Code Unknown'), msg)
      nodeLog('Function Code Unknown %s', msg.payload.fc)
      break
  }
}

de.biancoroyal.modbus.core.client.customModbusMessage = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)
  let delayTime = 1

  if (!node.client) {
    nodeLog('Client Not Ready As Object On Reading Modbus')
    return
  }

  if (node.client._port && node.client._port._client && !node.client._port._client.readable) {
    if (!node.connectClient()) {
      coreClient.activateSendingOnFailure(node, cberr, new Error('Modbus-Read Error from client connecting'), msg)
      return
    }
    delayTime = 500
  }

  setTimeout(function () {
    if (!node.bufferCommands) {
      if (node.clienttype !== 'tcp') {
        node.stateService.send('READ')
      }
    } else {
      node.queueLog(JSON.stringify({
        info: 'read msg via Modbus',
        message: msg.payload,
        queueUnitId: msg.queueUnitId,
        timeout: node.client.getTimeout(),
        state: node.actualServiceState.value
      }))
    }

    node.setUnitIdFromPayload(msg)
    node.client.setTimeout(node.clientTimeout)

    try {
      coreClient.sendCustomFunctionCode(node, msg, cb, cberr)
    } catch (err) {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
      nodeLog(err.message)
      node.modbusErrorHandling(err)
    }
  }, delayTime)
}

de.biancoroyal.modbus.core.client.readModbus = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)
  let delayTime = 1

  if (!node.client) {
    nodeLog('Client Not Ready As Object On Reading Modbus')
    return
  }

  if (node.client._port && node.client._port._client && !node.client._port._client.readable) {
    if (!node.connectClient()) {
      coreClient.activateSendingOnFailure(node, cberr, new Error('Modbus-Read Error from client connecting'), msg)
      return
    }
    delayTime = 500
  }

  setTimeout(function () {
    if (!node.bufferCommands) {
      if (node.clienttype !== 'tcp') {
        node.stateService.send('READ')
      }
    } else {
      node.queueLog(JSON.stringify({
        info: 'read msg via Modbus',
        message: msg.payload,
        queueUnitId: msg.queueUnitId,
        timeout: node.client.getTimeout(),
        state: node.actualServiceState.value
      }))
    }

    node.setUnitIdFromPayload(msg)
    node.client.setTimeout(node.clientTimeout)

    try {
      coreClient.readModbusByFunctionCode(node, msg, cb, cberr)
    } catch (err) {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
      nodeLog(err.message)
      node.modbusErrorHandling(err)
    }
  }, delayTime)
}

de.biancoroyal.modbus.core.client.writeModbusByFunctionCodeFive = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  if (msg.payload.value) {
    msg.payload.value = true
  } else {
    msg.payload.value = false
  }
  node.client.writeCoil(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    if (node.client.getID() === 0) {
      const resp = {
        address: parseInt(msg.payload.address),
        value: parseInt(msg.payload.value)
      }
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    } else {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
      node.modbusErrorHandling(err)
    }
  })
}

de.biancoroyal.modbus.core.client.writeModbusByFunctionCodeFifteen = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  if (parseInt(msg.payload.value.length) !== parseInt(msg.payload.quantity)) {
    coreClient.activateSendingOnFailure(node, cberr, new Error('Quantity should be less or equal to coil payload array length: ' +
      msg.payload.value.length + ' Addr: ' + msg.payload.address + ' Q: ' + msg.payload.quantity), msg)
  } else {
    node.client.writeCoils(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      if (node.client.getID() === 0) {
        const resp = {
          address: parseInt(msg.payload.address),
          value: parseInt(msg.payload.value)
        }
        coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
      } else {
        coreClient.activateSendingOnFailure(node, cberr, err, msg)
        node.modbusErrorHandling(err)
      }
    })
  }
}

de.biancoroyal.modbus.core.client.writeModbusByFunctionCodeSix = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  node.client.writeRegister(parseInt(msg.payload.address), parseInt(msg.payload.value)).then(function (resp) {
    coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
  }).catch(function (err) {
    if (node.client.getID() === 0) {
      const resp = {
        address: parseInt(msg.payload.address),
        value: parseInt(msg.payload.value)
      }
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    } else {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
      node.modbusErrorHandling(err)
    }
  })
}

de.biancoroyal.modbus.core.client.writeModbusByFunctionCodeSixteen = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  if (parseInt(msg.payload.value.length) !== parseInt(msg.payload.quantity)) {
    coreClient.activateSendingOnFailure(node, cberr, new Error('Quantity should be less or equal to register payload array length: ' +
      msg.payload.value.length + ' Addr: ' + msg.payload.address + ' Q: ' + msg.payload.quantity), msg)
  } else {
    node.client.writeRegisters(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
      coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
    }).catch(function (err) {
      if (node.client.getID() === 0) {
        const resp = {
          address: parseInt(msg.payload.address),
          value: parseInt(msg.payload.value)
        }
        coreClient.activateSendingOnSuccess(node, cb, cberr, resp, msg)
      } else {
        coreClient.activateSendingOnFailure(node, cberr, err, msg)
        /* istanbul ignore next */
        node.modbusErrorHandling(err)
      }
    })
  }
}

de.biancoroyal.modbus.core.client.writeModbus = function (node, msg, cb, cberr) {
  const coreClient = de.biancoroyal.modbus.core.client
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)
  let delayTime = 1
  if (!node.client) {
    nodeLog('Client Not Ready As Object On Writing Modbus')
    return
  }

  if (node.client._port && node.client._port._client && !node.client._port._client.writable) {
    if (!node.connectClient()) {
      coreClient.activateSendingOnFailure(node, cberr, new Error('Modbus-Read Error from client connecting'), msg)
      return
    }
    /* istanbul ignore next */
    delayTime = 500
  }

  setTimeout(function () {
    if (!node.bufferCommands) {
      if (node.clienttype !== 'tcp') {
        node.stateService.send('WRITE')
      }
    } else {
      node.queueLog(JSON.stringify({
        info: 'write msg',
        message: msg.payload,
        queueUnitId: msg.queueUnitId,
        timeout: node.client.getTimeout(),
        state: node.actualServiceState.value
      }))
    }

    node.setUnitIdFromPayload(msg)
    node.client.setTimeout(node.clientTimeout)

    try {
      switch (parseInt(msg.payload.fc)) {
        case 15: // FC: 15
          coreClient.writeModbusByFunctionCodeFifteen(node, msg, cb, cberr)
          break
        case 5: // FC: 5
          coreClient.writeModbusByFunctionCodeFive(node, msg, cb, cberr)
          break
        case 16: // FC: 16
          coreClient.writeModbusByFunctionCodeSixteen(node, msg, cb, cberr)
          break
        case 6: // FC: 6
          coreClient.writeModbusByFunctionCodeSix(node, msg, cb, cberr)
          break
        default:
          coreClient.activateSendingOnFailure(node, cberr, new Error('Function Code Unknown'), msg)
          nodeLog('Function Code Unknown %s', msg.payload.fc)
          break
      }
    } catch (err) {
      coreClient.activateSendingOnFailure(node, cberr, err, msg)
      nodeLog(err.message)
    }
  }, delayTime)
}

de.biancoroyal.modbus.core.client.setNewTCPNodeSettings = function (node, msg) {
  node.clienttype = 'tcp'
  node.tcpHost = msg.payload.tcpHost || node.tcpHost
  node.tcpPort = msg.payload.tcpPort || node.tcpPort
  node.tcpType = msg.payload.tcpType || node.tcpType
}

de.biancoroyal.modbus.core.client.setNewSerialNodeSettings = function (node, msg) {
  if (msg.payload.serialPort) {
    node.serialPort = msg.payload.serialPort || node.serialPort
  }

  if (msg.payload.serialBaudrate) {
    node.serialBaudrate = parseInt(msg.payload.serialBaudrate) || node.serialBaudrate
  }

  node.clienttype = 'serial'
  node.serialDatabits = msg.payload.serialDatabits || node.serialDatabits
  node.serialStopbits = msg.payload.serialStopbits || node.serialStopbits
  node.serialParity = msg.payload.serialParity || node.serialParity
  node.serialType = msg.payload.serialType || node.serialType

  // Make sure is parsed when string, otherwise just assign.
  if (msg.payload.serialAsciiResponseStartDelimiter && typeof msg.payload.serialAsciiResponseStartDelimiter === 'string') {
    node.serialAsciiResponseStartDelimiter = parseInt(msg.payload.serialAsciiResponseStartDelimiter, 16)
  } else {
    node.serialAsciiResponseStartDelimiter = msg.payload.serialAsciiResponseStartDelimiter || node.serialAsciiResponseStartDelimiter
  }

  if (msg.payload.serialConnectionDelay) {
    node.serialConnectionDelay = parseInt(msg.payload.serialConnectionDelay) || node.serialConnectionDelay
  }
}

de.biancoroyal.modbus.core.client.setNewNodeOptionalSettings = function (node, msg) {
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)

  try {
    let unitId = parseInt(msg.payload.unitId)
    if (!node.checkUnitId(unitId, node.clienttype)) {
      unitId = node.unit_id
    }
    node.unit_id = unitId
  } catch (err) {
    nodeLog(err.message)
  }

  if (msg.payload.commandDelay) {
    node.commandDelay = parseInt(msg.payload.commandDelay) || node.commandDelay
  }

  if (msg.payload.clientTimeout) {
    node.clientTimeout = parseInt(msg.payload.clientTimeout) || node.clientTimeout
  }

  if (msg.payload.reconnectTimeout) {
    node.reconnectTimeout = parseInt(msg.payload.reconnectTimeout) || node.reconnectTimeout
  }
}

de.biancoroyal.modbus.core.client.setNewNodeSettings = function (node, msg) {
  const nodeLog = de.biancoroyal.modbus.core.client.getLogFunction(node)
  const coreClient = de.biancoroyal.modbus.core.client

  if (!msg) {
    nodeLog('New Connection message invalid.')
    return false
  }

  switch (msg.payload.connectorType.toUpperCase()) {
    case 'TCP':
      coreClient.setNewTCPNodeSettings(node, msg)
      nodeLog('New Connection TCP Settings ' + node.tcpHost + ' ' + node.tcpPort + ' ' + node.tcpType)
      break

    case 'SERIAL':
      coreClient.setNewSerialNodeSettings(node, msg)
      nodeLog('New Connection Serial Settings ' + node.serialPort + ' ' + node.serialBaudrate + ' ' + node.serialType)
      break

    default:
      nodeLog('Unknown Dynamic Reconnect Type ' + msg.payload.connectorType)
  }

  coreClient.setNewNodeOptionalSettings(node, msg)

  return true
}

de.biancoroyal.modbus.core.client.messageAllowedStates = ['activated', 'queueing', 'sending', 'empty', 'connected']

module.exports = de.biancoroyal.modbus.core.client
