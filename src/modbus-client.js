/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 Copyright 2016 - Jason D. Harper, Argonne National Laboratory
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc.
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */

/**
 * Modbus connection node.
 * @module NodeRedModbusClient
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  if (module.exports.__modbusClientRegistered) {
    return
  }
  module.exports.__modbusClientRegistered = true
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const coreModbusClient = require('./core/modbus-client-core')
  const { createFsmHandler, runInitConnection } = require('./core/client/modbus-fsm-handler')
  const { MESSAGE_ALLOWED_STATES_V6, isClientInactive, isClientReadyToSend } = require('./core/client/modbus-client-state')
  const { buildTlsOptions, getTlsOptionsLogKeys } = require('./core/client/modbus-tls-options')
  const coreModbusQueue = require('./core/modbus-queue-core')
  const internalDebugLog = require('./core/modbus-logger').getDebugLogger('contribModbus:config:client')
  const { ModbusStateValidator } = require('./core/modbus-state-validator')
  const { ModbusTimerManager } = require('./core/modbus-timer-manager')

  function ModbusClientNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    if (node.type === 'modbus-client-tls') {
      config.tlsEnabled = true
      config.clienttype = config.clienttype || 'tcp'
      node.tlsEnabled = true
    }

    // create an empty modbus client
    const ModbusRTU = require('@openp4nr/node-modbus')

    const unlimitedListeners = 0
    const minCommandDelayMilliseconds = 1
    const defaultUnitId = 1
    const defaultTcpUnitId = 0
    const serialConnectionDelayTimeMS = 500
    const timeoutTimeMS = 1000
    const reconnectTimeMS = 2000
    const logHintText = ' Get More About It By Logging'
    const serialAsciiResponseStartDelimiter = '0x3A'

    this.clienttype = config.clienttype

    if (config.parallelUnitIdsAllowed === undefined) {
      this.bufferCommands = true
    } else {
      this.bufferCommands = config.bufferCommands
    }

    this.queueLogEnabled = config.queueLogEnabled
    this.stateLogEnabled = config.stateLogEnabled
    this.failureLogEnabled = config.failureLogEnabled

    this.tcpHost = config.tcpHost
    this.tcpPort = parseInt(config.tcpPort) || 502
    this.tcpType = config.tcpType

    // TLS Configuration with enhanced security
    this.tlsEnabled = config.tlsEnabled || false

    if (this.tlsEnabled) {
      this.tlsOptions = buildTlsOptions({
        config,
        credentials: this.credentials,
        tcpHost: this.tcpHost,
        env: process.env,
        deps: {
          onReadFileError: (filePath, err) => {
            if (node.showErrors) {
              node.error(`Failed to read TLS certificate file: ${filePath}`)
            }
          }
        }
      })
      internalDebugLog('TLS enabled with options:', getTlsOptionsLogKeys(this.tlsOptions))
    }

    this.serialPort = config.serialPort
    this.serialBaudrate = config.serialBaudrate
    this.serialDatabits = config.serialDatabits
    this.serialStopbits = config.serialStopbits
    this.serialParity = config.serialParity
    this.serialType = config.serialType
    this.serialConnectionDelay = parseInt(config.serialConnectionDelay) || serialConnectionDelayTimeMS
    this.serialAsciiResponseStartDelimiter = config.serialAsciiResponseStartDelimiter || serialAsciiResponseStartDelimiter

    this.unit_id = parseInt(config.unit_id)
    this.commandDelay = parseInt(config.commandDelay) || minCommandDelayMilliseconds
    this.clientTimeout = parseInt(config.clientTimeout) || timeoutTimeMS
    this.reconnectTimeout = parseInt(config.reconnectTimeout) || reconnectTimeMS
    this.reconnectOnTimeout = config.reconnectOnTimeout

    if (config.parallelUnitIdsAllowed === undefined) {
      this.parallelUnitIdsAllowed = true
    } else {
      this.parallelUnitIdsAllowed = config.parallelUnitIdsAllowed
    }

    this.showErrors = config.showErrors
    this.showWarnings = config.showWarnings
    this.showLogs = config.showLogs

    node.isFirstInitOfConnection = true
    node.closingModbus = false

    /** @type {ModbusRTU} */
    node.client = null

    node.bufferCommandList = new Map()
    node.sendingAllowed = new Map()
    node.unitSendingAllowed = []
    node.messageAllowedStates = MESSAGE_ALLOWED_STATES_V6
    node._closeIntent = 'error'

    node.setCloseIntent = function (intent) {
      node._closeIntent = intent
    }

    node.getCloseIntent = function () {
      return node._closeIntent || 'error'
    }

    node.resetCloseIntent = function () {
      node._closeIntent = 'error'
    }

    node.isClientReadyToSend = function () {
      return isClientReadyToSend(node)
    }
    node.serverInfo = ''

    node.stateMachine = null
    node.stateService = null
    node.stateMachine = coreModbusClient.createStateMachineService()
    node.actualServiceState = node.stateMachine.initialState
    node.actualServiceStateBefore = node.actualServiceState
    node.stateService = coreModbusClient.startStateService(node.stateMachine)
    node.actualServiceState = node.stateService.state
    node.actualServiceStateBefore = node.actualServiceState
    node.serialSendingAllowed = false
    node.internalDebugLog = internalDebugLog

    // Initialize resilience modules
    const resilienceOptions = {
      enableCircuitBreaker: config.circuitBreakerEnabled === true || config.enableCircuitBreaker === true,
      enableConnectionPool: config.connectionPoolEnabled === true || config.enableConnectionPool === true,
      enableRetryHandler: config.retryEnabled === true || config.enableRetryHandler === true,
      enableDiagnostics: config.enableDiagnostics !== false,
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 2,
      maxRetries: config.maxRetries || 3,
      initialDelay: config.initialDelay || 1000,
      alertThresholds: {
        errorRate: config.errorRateThreshold || 10,
        responseTime: config.responseTimeThreshold || 5000,
        connectionFailure: config.connectionFailureThreshold || 20
      }
    }

    coreModbusClient.initializeResilienceModules(node, resilienceOptions)

    // Initialize state validator for deadlock detection
    node.stateValidator = new ModbusStateValidator()

    // Initialize timer manager for leak prevention
    node.timerManager = new ModbusTimerManager({
      enableTracking: config.enableTimerTracking !== false,
      warningThreshold: 30,
      maxTimersPerNode: 15
    })

    coreModbusQueue.queueSerialLockCommand(node)

    node.setDefaultUnitId = function () {
      if (this.clienttype === 'tcp') {
        node.unit_id = defaultTcpUnitId
      } else {
        node.unit_id = defaultUnitId
      }
    }

    node.setUnitIdFromPayload = function (msg) {
      const unitId = coreModbusClient.getActualUnitId(node, msg)
      if (!coreModbusClient.checkUnitId(unitId, node.clienttype)) {
        node.setDefaultUnitId()
      }
      node.client.setID(unitId)
      msg.unitId = unitId
    }

    if (Number.isNaN(node.unit_id) || !coreModbusClient.checkUnitId(node.unit_id, node.clienttype)) {
      node.setDefaultUnitId()
    }

    node.updateServerinfo = function () {
      if (node.clienttype === 'tcp') {
        node.serverInfo = (node.tlsEnabled ? ' TLS@' : ' TCP@') + node.tcpHost + ':' + node.tcpPort
      } else {
        node.serverInfo = ' Serial@' + node.serialPort + ':' + node.serialBaudrate + 'bit/s'
      }
      node.serverInfo += ' default Unit-Id: ' + node.unit_id
    }

    /* istanbul ignore next */
    function verboseWarn (logMessage) {
      if (RED.settings.verbose && node.showWarnings) {
        node.updateServerinfo()
        node.warn('Client -> ' + logMessage + ' ' + node.serverInfo)
      }
    }

    node.errorProtocolMsg = function (err, msg) {
      if (node.showErrors) {
        mbBasics.logMsgError(node, err, msg)
      }
    }

    function verboseLog (logMessage) {
      if (RED.settings.verbose && node.showLogs) {
        coreModbusClient.internalDebug('Client -> ' + logMessage + ' ' + node.serverInfo)
      }
    }

    function stateLog (logMessage) {
      if (node.stateLogEnabled) {
        verboseLog(logMessage)
      }
    }

    node.queueLog = function (logMessage) {
      if (node.bufferCommands && node.queueLogEnabled) {
        verboseLog(logMessage)
      }
    }

    node.stateService.subscribe(createFsmHandler(node, {
      coreModbusQueue,
      verboseWarn,
      stateLog,
      serialConnectionDelayTimeMS,
      reconnectTimeMS,
      logHintText
    }))

    node.emitGlobalStateChange = function (state, data) {
      const registeredIds = Object.keys(node.registeredNodeList)
      for (let i = 0; i < registeredIds.length; i++) {
        node.emit(state, registeredIds[i], data)
      }
    }
    node.connectClient = function () {
      try {
        if (node.client) {
          try {
            node.client.close(function () {
              verboseLog('connection closed')
            })
            verboseLog('connection close sent')
          } catch (err) {
            verboseLog(err.message)
          }
        }
        node.client = null
        node.client = new ModbusRTU()

        node.client.on('error', (err) => {
          node.modbusErrorHandling(err)
          mbBasics.setNodeStatusTo('error', node)
        })

        if (!node.clientTimeout) {
          node.clientTimeout = timeoutTimeMS
        }

        if (!node.reconnectTimeout) {
          node.reconnectTimeout = reconnectTimeMS
        }

        if (node.clienttype === 'tcp') {
          /* istanbul ignore next */
          if (!coreModbusClient.checkUnitId(node.unit_id, node.clienttype)) {
            node.error(new Error('wrong unit-id (0..255)'), { payload: node.unit_id })
            node.stateService.send('FAILURE')
            return false
          }

          try {
            switch (node.tcpType) {
              case 'C701': {
                verboseLog('C701 port UDP bridge' + (node.tlsEnabled ? ' with TLS' : ''))
                const c701Options = {
                  port: node.tcpPort,
                  autoOpen: true
                }
                if (node.tlsEnabled && node.tlsOptions) {
                  Object.assign(c701Options, node.tlsOptions)
                }
                node.client.connectC701(node.tcpHost, c701Options).then(node.setTCPConnectionOptions)
                  .then(node.setTCPConnected)
                  .catch((err) => {
                    node.modbusTcpErrorHandling(err)
                    return false
                  })
                break
              }
              case 'TELNET': {
                verboseLog('Telnet port' + (node.tlsEnabled ? ' with TLS' : ''))
                const telnetOptions = {
                  port: node.tcpPort,
                  autoOpen: true
                }
                if (node.tlsEnabled && node.tlsOptions) {
                  Object.assign(telnetOptions, node.tlsOptions)
                }
                node.client.connectTelnet(node.tcpHost, telnetOptions).then(node.setTCPConnectionOptions)
                  .catch((err) => {
                    node.modbusTcpErrorHandling(err)
                    return false
                  })
                break
              }
              /* istanbul ignore next */
              case 'TCP-RTU-BUFFERED': {
                verboseLog('TCP RTU buffered port' + (node.tlsEnabled ? ' with TLS' : ''))
                const tcpRtuOptions = {
                  port: node.tcpPort,
                  autoOpen: true
                }
                if (node.tlsEnabled && node.tlsOptions) {
                  Object.assign(tcpRtuOptions, node.tlsOptions)
                }
                node.client.connectTcpRTUBuffered(node.tcpHost, tcpRtuOptions).then(node.setTCPConnectionOptions)
                  .catch((err) => {
                    node.modbusTcpErrorHandling(err)
                    return false
                  })
                break
              }
              case 'UDP':
                verboseLog('UDP port')
                node.client.connectUDP(node.tcpHost, {
                  port: node.tcpPort,
                  autoOpen: true
                }).then(node.setTCPConnectionOptions)
                  .catch((err) => {
                    node.modbusTcpErrorHandling(err)
                    return false
                  })
                break
              default: {
                verboseLog('TCP port' + (node.tlsEnabled ? ' with TLS' : ''))
                const tcpOptions = {
                  port: node.tcpPort,
                  autoOpen: true
                }
                if (node.tlsEnabled && node.tlsOptions) {
                  Object.assign(tcpOptions, node.tlsOptions)
                }
                node.client.connectTCP(node.tcpHost, tcpOptions).then(node.setTCPConnectionOptions)
                  .catch((err) => {
                    node.modbusTcpErrorHandling(err)
                    return false
                  })
              }
            }
          } /* istanbul ignore next */ catch (e) {
            node.modbusTcpErrorHandling(e)
            return false
          }
        } else {
          /* istanbul ignore next */
          if (!coreModbusClient.checkUnitId(node.unit_id, node.clienttype)) {
            node.error(new Error('wrong unit-id serial (0..247)'), { payload: node.unit_id })
            node.stateService.send('FAILURE')
            return false
          }

          if (!node.serialConnectionDelay) {
            node.serialConnectionDelay = serialConnectionDelayTimeMS
          }

          if (!node.serialPort) {
            node.error(new Error('wrong serial port'), { payload: node.serialPort })
            node.stateService.send('FAILURE')
            return false
          }

          const serialPortOptions = {
            baudRate: parseInt(node.serialBaudrate),
            dataBits: parseInt(node.serialDatabits),
            stopBits: parseInt(node.serialStopbits),
            parity: node.serialParity,
            autoOpen: false
          }

          try {
            switch (node.serialType) {
              case 'ASCII':
                verboseLog('ASCII port serial')
                // Make sure is parsed when string, otherwise just assign.
                if (node.serialAsciiResponseStartDelimiter && typeof node.serialAsciiResponseStartDelimiter === 'string') {
                  serialPortOptions.startOfSlaveFrameChar = parseInt(node.serialAsciiResponseStartDelimiter, 16)
                } else {
                  serialPortOptions.startOfSlaveFrameChar = node.serialAsciiResponseStartDelimiter
                }
                verboseLog('Using response delimiter: 0x' + serialPortOptions.startOfSlaveFrameChar.toString(16))

                node.client.connectAsciiSerial(node.serialPort, serialPortOptions).then(node.setSerialConnectionOptions)
                  .catch((err) => {
                    node.modbusSerialErrorHandling(err)
                    return false
                  })
                break
              case 'RTU':
                verboseLog('RTU port serial')
                node.client.connectRTU(node.serialPort, serialPortOptions).then(node.setSerialConnectionOptions)
                  .catch((err) => {
                    node.modbusSerialErrorHandling(err)
                    return false
                  })
                break
              default:
                verboseLog('RTU buffered port serial')
                node.client.connectRTUBuffered(node.serialPort, serialPortOptions).then(node.setSerialConnectionOptions)
                  .catch((err) => {
                    node.modbusSerialErrorHandling(err)
                    return false
                  })
                break
            }
          } /* istanbul ignore next */ catch (e) {
            node.modbusSerialErrorHandling(e)
            return false
          }
        }
      } /* istanbul ignore next */ catch (err) {
        node.modbusErrorHandling(err)
        return false
      }

      return true
    }

    node.setTCPConnectionOptions = function () {
      node.client.setID(node.unit_id)
      node.client.setTimeout(node.clientTimeout)
      node.stateService.send('CONNECT')
    }

    node.setTCPConnected = function () {
      coreModbusClient.modbusSerialDebug('modbus tcp connected on ' + node.tcpHost)
    }

    node.setSerialConnectionOptions = function () {
      node.stateService.send('OPENSERIAL')
      setTimeout(node.openSerialClient, parseInt(node.serialConnectionDelay))
    }

    node.modbusErrorHandling = function (err) {
      coreModbusQueue.queueSerialUnlockCommand(node)
      if (err.message) {
        coreModbusClient.modbusSerialDebug('modbusErrorHandling:' + err.message)
      } else {
        coreModbusClient.modbusSerialDebug('modbusErrorHandling:' + JSON.stringify(err))
      }
      if ((err.errno && coreModbusClient.networkErrors.includes(err.errno)) ||
        (err.code && coreModbusClient.networkErrors.includes(err.code))) {
        node.setCloseIntent('error')
        node.stateService.send('FAILURE')
      }
    }

    node.modbusTcpErrorHandling = function (err) {
      coreModbusQueue.queueSerialUnlockCommand(node)
      node.setCloseIntent('error')
      if (node.showErrors) {
        node.error(err)
      }

      if (node.failureLogEnabled) {
        if (err.message) {
          coreModbusClient.modbusSerialDebug('modbusTcpErrorHandling:' + err.message)
        } else {
          coreModbusClient.modbusSerialDebug('modbusTcpErrorHandling:' + JSON.stringify(err))
        }
      }

      if ((err.errno && coreModbusClient.networkErrors.includes(err.errno)) ||
        (err.code && coreModbusClient.networkErrors.includes(err.code))) {
        node.stateService.send('BREAK')
      }
    }

    node.modbusSerialErrorHandling = function (err) {
      coreModbusQueue.queueSerialUnlockCommand(node)
      if (node.showErrors) {
        node.error(err)
      }

      if (node.failureLogEnabled) {
        if (err.message) {
          coreModbusClient.modbusSerialDebug('modbusSerialErrorHandling:' + err.message)
        } else {
          coreModbusClient.modbusSerialDebug('modbusSerialErrorHandling:' + JSON.stringify(err))
        }
      }

      node.stateService.send('BREAK')
    }

    node.openSerialClient = function () {
      // some delay for windows
      if (node.actualServiceState.value === 'opened') {
        verboseLog('time to open Unit ' + node.unit_id)
        coreModbusClient.modbusSerialDebug('modbus connection opened')
        node.client.setID(node.unit_id)
        node.client.setTimeout(parseInt(node.clientTimeout))
        node.client._port.on('close', node.onModbusClose)
        node.stateService.send('CONNECT')
      } else {
        verboseLog('wrong state on connect serial ' + node.actualServiceState.value)
        coreModbusClient.modbusSerialDebug('modbus connection not opened state is %s', node.actualServiceState.value)
        node.stateService.send('BREAK')
      }
    }

    node.onModbusClose = function () {
      coreModbusQueue.queueSerialUnlockCommand(node)
      /* istanbul ignore next */
      verboseWarn('Modbus closed port')
      coreModbusClient.modbusSerialDebug('modbus closed port')
      node.setCloseIntent('error')
      node.stateService.send('CLOSE')
    }

    node.on('customModbusMessage', function (msg, cb, cberr) {
      // const state = node.actualServiceState
      coreModbusClient.customModbusMessage(node, msg, cb, cberr)
    })

    node.on('readModbus', function (msg, cb, cberr) {
      const state = node.actualServiceState
      if (node.isInactive()) {
        cberr(new Error('Client Not Ready To Read At State ' + state.value), msg)
      } else {
        if (node.bufferCommands) {
          coreModbusQueue.pushToQueueByUnitId(node, coreModbusClient.readModbus, msg, cb, cberr).then(function () {
            node.queueLog(JSON.stringify({
              info: 'queued read msg',
              message: msg.payload,
              state: state.value,
              queueLength: node.bufferCommandList.get(msg.queueUnitId).length
            }))
          }).catch(function (err) {
            cberr(err, msg)
          }).finally(function () {
            node.stateService.send('QUEUE')
          })
        } else {
          coreModbusClient.readModbus(node, msg, cb, cberr)
        }
      }
    })

    node.on('writeModbus', function (msg, cb, cberr) {
      const state = node.actualServiceState

      if (node.isInactive()) {
        cberr(new Error('Client Not Ready To Write At State ' + state.value), msg)
      } else {
        if (node.bufferCommands) {
          coreModbusQueue.pushToQueueByUnitId(node, coreModbusClient.writeModbus, msg, cb, cberr).then(function () {
            node.queueLog(JSON.stringify({
              info: 'queued write msg',
              message: msg.payload,
              state: state.value,
              queueLength: node.bufferCommandList.get(msg.queueUnitId).length
            }))
          }).catch(function (err) {
            cberr(err, msg)
          }).finally(function () {
            node.stateService.send('QUEUE')
          })
        } else {
          coreModbusClient.writeModbus(node, msg, cb, cberr)
        }
      }
    })

    node.activateSending = function (msg) {
      node.sendingAllowed.set(msg.queueUnitId, true)
      coreModbusQueue.queueSerialUnlockCommand(node)

      return new Promise(
        function (resolve, reject) {
          try {
            if (node.bufferCommands) {
              node.queueLog(JSON.stringify({
                info: 'queue response activate sending',
                queueLength: node.bufferCommandList.length,
                sendingAllowed: node.sendingAllowed.get(msg.queueUnitId),
                serialSendingAllowed: node.serialSendingAllowed,
                queueUnitId: msg.queueUnitId
              }))

              if (coreModbusQueue.checkQueuesAreEmpty(node)) {
                node.stateService.send('ACTIVATE')
              }
            }
            resolve()
          } catch (err) {
            reject(err)
          }
        })
    }

    verboseLog('initialized')
    node.setMaxListeners(unlimitedListeners)

    node.on('reconnect', function () {
      node.setCloseIntent('manual')
      node.stateService.send('CLOSE')
    })

    node.on('dynamicReconnect', function (msg, cb, cberr) {
      if (mbBasics.invalidPayloadIn(msg)) {
        throw new Error('Message Or Payload Not Valid')
      }

      try {
        coreModbusClient.internalDebug('Dynamic Reconnect Parameters ' + JSON.stringify(msg.payload))
        if (coreModbusClient.setNewNodeSettings(node, msg)) {
          cb(msg)
        } else {
          cberr(new Error('Message Or Payload Not Valid'), msg)
        }
        coreModbusClient.internalDebug('Dynamic Reconnect Starts on actual state ' + node.actualServiceState.value)
        node.stateService.send('SWITCH')
      } catch (err) {
        cberr(err, msg)
      }
    })

    node.on('close', function (done) {
      const nodeIdentifierName = node.name || node.id
      node.closingModbus = true
      node.setCloseIntent('stop')
      verboseLog('stop fsm on close ' + nodeIdentifierName)
      node.stateService.send('STOP')
      verboseLog('close node ' + nodeIdentifierName)
      node.internalDebugLog('close node ' + nodeIdentifierName)

      // Clean up timer manager
      if (node.timerManager) {
        node.timerManager.clearNodeTimers(node.id)
        node.timerManager.destroy()
        node.timerManager = null
      }

      // Clean up state validator
      if (node.stateValidator) {
        const healthReport = node.stateValidator.getHealthReport()
        if (healthReport.deadlockCheck.hasDeadlock) {
          verboseWarn('State machine had potential deadlock issues: ' + JSON.stringify(healthReport))
        }
        node.stateValidator.reset()
        node.stateValidator = null
      }

      if (node.client) {
        if (node.client.isOpen) {
          node.client.close(function (err) {
            if (err) {
              /* istanbul ignore next */
              verboseLog('Connection closed with error ' + nodeIdentifierName)
            } else {
              /* istanbul ignore next */
              verboseLog('Connection closed well ' + nodeIdentifierName)
            }
            done()
          })
        } else {
          /* istanbul ignore next */
          verboseLog('connection was closed ' + nodeIdentifierName)
          done()
        }

        if (node.client && typeof node.client.removeAllListeners === 'function') {
          node.client.removeAllListeners()
        }
      } else {
        /* istanbul ignore next */
        verboseLog('Connection closed simple ' + nodeIdentifierName)
        done()
      }

      if (node && typeof node.removeAllListeners === 'function') {
        node.removeAllListeners()
      }
    })

    // handle using as config node
    node.registeredNodeList = {}

    node.registerForModbus = function (clientUserNodeId) {
      node.registeredNodeList[clientUserNodeId.id] = clientUserNodeId
      if (Object.keys(node.registeredNodeList).length === 1) {
        node.closingModbus = false
        const currentState = node.actualServiceState && node.actualServiceState.value
        if (currentState === 'stopped') {
          node.stateService.send('INIT')
        } else if (currentState === 'init') {
          runInitConnection(node, {
            coreModbusQueue,
            verboseWarn,
            serialConnectionDelayTimeMS,
            reconnectTimeMS,
            logHintText
          })
        } else {
          node.stateService.send('INIT')
        }
      }
      const data = node.generateEvent('register', {})
      node.emit('mbregister', clientUserNodeId, data)

      // node.emit('mbregister', clientUserNodeId)
    }

    node.generateEvent = function (eventName, data) {
      return {
        type: eventName,
        data
      }
    }
    node.setStoppedState = function (clientUserNodeId, done) {
      const data = node.generateEvent('deregister', {})
      node.emit('mbderegister', clientUserNodeId, data)
      if (typeof done === 'function') done()
    }

    /**
     * Closes the internal connection if no modbus nodes are listening on the client.
     *
     * @param clientUserNodeId The id of the last node that still needs to be closed down
     * @param done done callback (node-red)
     */

    node.deregisterClientEventListeners = function () {
      node.removeAllListeners()
    }

    node.closeConnectionWithoutRegisteredNodes = function (clientUserNodeId, done) {
      if (Object.keys(node.registeredNodeList).length === 0) {
        node.closingModbus = true
        if (node.client && node.actualServiceState.value !== 'stopped') {
          if (node.client.isOpen) {
            node.client.close(function () {
              node.setStoppedState(clientUserNodeId, done)
            })
            node.deregisterClientEventListeners()
            return
          }
        }
      }

      node.setStoppedState(clientUserNodeId, done)
    }

    /**
     * Delete a node from the registeredNodeList the node in question will no longer receive any messages from the
     * client
     *
     * __NOTE__: If there are no more listening nodes for the current connection the client will be closed permanently
     * @param clientUserNodeId {Number} the id of the node that wants to unsubscribe.
     * @param done {function} node-red done callback
     */
    node.deregisterForModbus = function (clientUserNodeId, done) {
      let finished = false
      const finish = () => {
        if (finished) return
        finished = true
        if (typeof done === 'function') done()
      }
      try {
        delete node.registeredNodeList[clientUserNodeId]
        if (Object.keys(node.registeredNodeList).length !== 0) {
          finish()
          const data = node.generateEvent('deregister', {})
          node.emit('mbderegister', clientUserNodeId, data)
        } else {
          node.setCloseIntent('stop')
          node.closeConnectionWithoutRegisteredNodes(clientUserNodeId, finish)
          node.stateService.send('STOP')
        }
      } catch (err) {
        /* istanbul ignore next */
        verboseWarn(err.message + ' on de-register node ' + clientUserNodeId)
        node.error(err)
        finish()
      }
    }

    node.isInactive = function () {
      return isClientInactive(node)
    }

    node.isActive = function () {
      return !node.isInactive()
    }

    node.isReadyToSend = function () {
      return node.isClientReadyToSend()
    }
  }

  RED.nodes.registerType('modbus-client', ModbusClientNode, {
    credentials: {
      tlsPrivateKey: { type: 'text' },
      tlsCertificate: { type: 'text' },
      tlsCa: { type: 'text' }
    }
  })

  RED.nodes.registerType('modbus-client-tls', ModbusClientNode, {
    credentials: {
      tlsPrivateKey: { type: 'text' },
      tlsCertificate: { type: 'text' },
      tlsCa: { type: 'text' }
    }
  })

  const clientPresets = require('./core/client/config-presets')
  RED.httpAdmin.get('/modbus/client/presets', RED.auth.needsPermission('flows.read'), function (req, res) {
    res.json(clientPresets.CLIENT_PRESETS)
  })

  /* istanbul ignore next */
  RED.httpAdmin.get('/modbus/serial/ports', RED.auth.needsPermission('serial.read'), function (req, res) {
    const SerialPort = require('serialport')
    SerialPort.SerialPort.list().then(ports => {
      res.json(ports)
    }).catch(err => {
      /* istanbul ignore next */
      res.json([err.message])
      /* istanbul ignore next */
      coreModbusClient.internalDebug(err.message)
    })
  })
}
