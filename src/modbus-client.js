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
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const coreModbusClient = require('./core/modbus-client-core')
  const coreModbusQueue = require('./core/modbus-queue-core')
  const internalDebugLog = require('debug')('contribModbus:config:client')
  const _ = require('underscore')

  function ModbusClientNode (config) {
    RED.nodes.createNode(this, config)

    // create an empty modbus client
    const ModbusRTU = require('@openp4nr/modbus-serial')

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
    this.maxQueueDepth = parseInt(config.maxQueueDepth) || 100

    if (config.parallelUnitIdsAllowed === undefined) {
      this.parallelUnitIdsAllowed = true
    } else {
      this.parallelUnitIdsAllowed = config.parallelUnitIdsAllowed
    }

    this.showErrors = config.showErrors
    this.showWarnings = config.showWarnings
    this.showLogs = config.showLogs

    const node = this
    node.isFirstInitOfConnection = true
    node.closingModbus = false
    node.client = null
    node.bufferCommandList = new Map()
    node.sendingAllowed = new Map()
    node.unitSendingAllowed = []
    node.messageAllowedStates = coreModbusClient.messageAllowedStates
    node.serverInfo = ''
    node.reconnectAttempt = 0

    node.stateMachine = null
    node.stateService = null
    node.stateMachine = coreModbusClient.createStateMachineService()
    node.actualServiceState = node.stateMachine.initialState
    node.actualServiceStateBefore = node.actualServiceState
    node.stateService = coreModbusClient.startStateService(node.stateMachine)
    node.reconnectTimeoutId = 0
    node.serialSendingAllowed = false
    node.internalDebugLog = internalDebugLog

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
        node.serverInfo = ' TCP@' + node.tcpHost + ':' + node.tcpPort
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

    node.stateService.subscribe(state => {
      node.actualServiceStateBefore = node.actualServiceState
      node.actualServiceState = state
      stateLog(state.value)

      if (!state.value || node.actualServiceState.value === undefined) {
        // verboseWarn('fsm ignore invalid state')
        /* istanbul ignore next */
        return
      }

      if (node.actualServiceStateBefore.value === node.actualServiceState.value) {
        // verboseWarn('fsm ignore equal state ' + node.actualServiceState.value + ' after ' + node.actualServiceStateBefore.value)
        return
      }

      if (state.matches('init')) {
        verboseWarn('fsm init state after ' + node.actualServiceStateBefore.value)
        node.updateServerinfo()
        // FR-TMR: clear before nulling; also cancel orphan command/serial timers
        clearTimeout(node.reconnectTimeoutId)
        clearTimeout(node.commandDelayTimeoutId)
        clearTimeout(node.serialOpenTimeoutId)
        node.reconnectTimeoutId = 0
        node.commandDelayTimeoutId = 0
        node.serialOpenTimeoutId = 0
        coreModbusQueue.initQueue(node)

        try {
          if (node.isFirstInitOfConnection) {
            node.isFirstInitOfConnection = false
            verboseWarn('first fsm init in ' + serialConnectionDelayTimeMS + ' ms')
            if (!node.closingModbus) {
              node.reconnectTimeoutId = setTimeout(node.connectClient, serialConnectionDelayTimeMS)
            }
          } else if (node.actualServiceStateBefore.value === 'reconnecting') {
            // FR-TMR-SINGLE: reconnecting already waited reconnectTimeout — connect now
            verboseWarn('fsm init after reconnect — connect now')
            if (!node.closingModbus) {
              node.connectClient()
            }
          } else {
            verboseWarn('fsm init in ' + node.reconnectTimeout + ' ms')
            if (!node.closingModbus) {
              node.reconnectTimeoutId = setTimeout(node.connectClient, node.reconnectTimeout)
            }
          }
        } catch (err) {
          /* istanbul ignore next */
          node.error(err, { payload: 'client connection error ' + logHintText })
        }

        node.emit('mbinit')
      }

      if (state.matches('connected')) {
        /* istanbul ignore next */
        verboseWarn('fsm connected after state ' + node.actualServiceStateBefore.value + logHintText)
        node.reconnectAttempt = 0
        coreModbusQueue.queueSerialUnlockCommand(node)
        node.emit('mbconnected')
        // FR-CONN-READY: reach activated without waiting for a command completion
        coreModbusClient.sendActivateIfAllowed(node)
      }

      if (state.matches('activated')) {
        node.emit('mbactive')
        if (node.bufferCommands && !coreModbusQueue.checkQueuesAreEmpty(node)) {
          node.stateService.send('QUEUE')
        }
      }

      if (state.matches('queueing')) {
        if (node.clienttype === 'tcp') {
          if (!node.parallelUnitIdsAllowed) {
            if (node.serialSendingAllowed) {
              coreModbusQueue.queueSerialLockCommand(node)
              node.stateService.send('SEND')
            }
          } else {
            node.stateService.send('SEND')
          }
        } else {
          if (node.serialSendingAllowed) {
            coreModbusQueue.queueSerialLockCommand(node)
            node.stateService.send('SEND')
          }
        }
      }

      if (state.matches('sending')) {
        clearTimeout(node.commandDelayTimeoutId)
        node.commandDelayTimeoutId = setTimeout(() => {
          node.commandDelayTimeoutId = 0
          coreModbusQueue.dequeueCommand(node)
        }, node.commandDelay)
        node.emit('mbqueue')
      }

      if (state.matches('opened')) {
        coreModbusQueue.queueSerialUnlockCommand(node)
        node.emit('mbopen')
      }

      if (state.matches('switch')) {
        node.emit('mbswitch')
        node.stateService.send('CLOSE')
      }

      if (state.matches('closed')) {
        node.emit('mbclosed')
        if (!node.closingModbus) {
          node.stateService.send('RECONNECT')
        }
      }

      if (state.matches('stopped')) {
        verboseWarn('stopped state without reconnecting')
        node.emit('mbclosed')
      }

      if (state.matches('failed')) {
        /* istanbul ignore next */
        verboseWarn('fsm failed state after ' + node.actualServiceStateBefore.value + logHintText)
        node.emit('mberror', 'Modbus Failure On State ' + node.actualServiceStateBefore.value + logHintText)
        node.stateService.send('BREAK')
      }

      if (state.matches('broken')) {
        verboseWarn('fsm broken state after ' + node.actualServiceStateBefore.value + logHintText)
        node.emit('mbbroken', 'Modbus Broken On State ' + node.actualServiceStateBefore.value + logHintText)
        clearTimeout(node.commandDelayTimeoutId)
        clearTimeout(node.serialOpenTimeoutId)
        node.commandDelayTimeoutId = 0
        node.serialOpenTimeoutId = 0
        if (node.reconnectOnTimeout) {
          node.stateService.send('RECONNECT')
        } else {
          node.stateService.send('INIT')
        }
      }

      if (state.matches('reconnecting')) {
        verboseWarn('fsm reconnect state after ' + node.actualServiceStateBefore.value + logHintText)
        node.reconnectAttempt = (node.reconnectAttempt || 0) + 1
        coreModbusQueue.queueSerialLockCommand(node)
        node.emit('mbreconnecting', node.reconnectAttempt)
        if (node.reconnectTimeout <= 0) {
          node.reconnectTimeout = reconnectTimeMS
        }
        clearTimeout(node.reconnectTimeoutId)
        node.reconnectTimeoutId = setTimeout(() => {
          node.reconnectTimeoutId = 0
          if (!node.closingModbus) {
            node.stateService.send('INIT')
          }
        }, node.reconnectTimeout)
      }
    })

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
              case 'C701':
                verboseLog('C701 port UDP bridge')
                node.client.connectC701(node.tcpHost, {
                  port: node.tcpPort,
                  autoOpen: true
                }).then(node.setTCPConnectionOptions)
                  .then(node.setTCPConnected)
                  .catch((err) => {
                    node.modbusTcpErrorHandling(err)
                    return false
                  })
                break
              case 'TELNET':
                verboseLog('Telnet port')
                node.client.connectTelnet(node.tcpHost, {
                  port: node.tcpPort,
                  autoOpen: true
                }).then(node.setTCPConnectionOptions)
                  .catch((err) => {
                    node.modbusTcpErrorHandling(err)
                    return false
                  })
                break
              /* istanbul ignore next */
              case 'TCP-RTU-BUFFERED':
                verboseLog('TCP RTU buffered port')
                node.client.connectTcpRTUBuffered(node.tcpHost, {
                  port: node.tcpPort,
                  autoOpen: true
                }).then(node.setTCPConnectionOptions)
                  .catch((err) => {
                    node.modbusTcpErrorHandling(err)
                    return false
                  })
                break
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
              default:
                verboseLog('TCP port')
                node.client.connectTCP(node.tcpHost, {
                  port: node.tcpPort,
                  autoOpen: true
                }).then(node.setTCPConnectionOptions)
                  .catch((err) => {
                    node.modbusTcpErrorHandling(err)
                    return false
                  })
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
      clearTimeout(node.serialOpenTimeoutId)
      node.serialOpenTimeoutId = setTimeout(function () {
        node.serialOpenTimeoutId = 0
        node.openSerialClient()
      }, parseInt(node.serialConnectionDelay))
    }

    node.modbusErrorHandling = function (err) {
      coreModbusQueue.queueSerialUnlockCommand(node)
      if (err.message) {
        coreModbusClient.modbusSerialDebug('modbusErrorHandling:' + err.message)
      } else {
        coreModbusClient.modbusSerialDebug('modbusErrorHandling:' + JSON.stringify(err))
      }
      // FR-TO-01 / FR-TO-02: Timed out, DNS (EAI_AGAIN), and network errno → FAILURE
      if (coreModbusClient.isRecoverableModbusError(err)) {
        node.stateService.send('FAILURE')
      }
    }

    node.modbusTcpErrorHandling = function (err) {
      coreModbusQueue.queueSerialUnlockCommand(node)
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

      if (coreModbusClient.isRecoverableModbusError(err)) {
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
      const unitId = msg.queueUnitId
      node.sendingAllowed.set(unitId, true)
      coreModbusQueue.queueSerialUnlockCommand(node)

      return new Promise(
        function (resolve, reject) {
          try {
            if (node.bufferCommands) {
              // Re-arm sequential drain when more work remains for this UnitId (#574).
              // Push-time dedupe (FR-QUEUE-02) only keeps one pending slot; after
              // shift()+send the UnitId must be scheduled again or the queue stalls.
              const sequentialDrain = !node.parallelUnitIdsAllowed || node.clienttype === 'serial'
              const remaining = node.bufferCommandList.get(unitId)
              if (sequentialDrain &&
                  coreModbusQueue.isValidUnitId(unitId) &&
                  remaining && remaining.length > 0 &&
                  !node.unitSendingAllowed.includes(unitId)) {
                node.unitSendingAllowed.push(unitId)
              }

              node.queueLog(JSON.stringify({
                info: 'queue response activate sending',
                queueLength: node.bufferCommandList.length,
                sendingAllowed: node.sendingAllowed.get(unitId),
                serialSendingAllowed: node.serialSendingAllowed,
                queueUnitId: unitId
              }))

              if (coreModbusQueue.checkQueuesAreEmpty(node)) {
                node.stateService.send('EMPTY')
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
      clearTimeout(node.reconnectTimeoutId)
      node.reconnectTimeoutId = 0
      verboseLog('stop fsm on close ' + nodeIdentifierName)
      node.stateService.send('STOP')
      verboseLog('close node ' + nodeIdentifierName)
      node.internalDebugLog('close node ' + nodeIdentifierName)

      // Never block Node-RED deploy on a hung socket close (default timeout ~15s)
      node.safeCloseModbusClient(function () {
        try {
          if (node.client) {
            node.client.removeAllListeners()
          }
        } catch (err) {
          verboseWarn(err.message + ' while removing client listeners')
        }
        try {
          node.removeAllListeners()
        } catch (err) {
          verboseWarn(err.message + ' while removing node listeners')
        }
        done()
      })
    })

    // handle using as config node
    node.registeredNodeList = {}

    node.normalizeClientUserId = function (clientUserNodeId) {
      if (clientUserNodeId && typeof clientUserNodeId === 'object' && clientUserNodeId.id) {
        return clientUserNodeId.id
      }
      return clientUserNodeId
    }

    /**
     * Close the underlying modbus-serial client without risking a deploy hang.
     * Some transports never invoke the close callback → Node-RED's ~15s guard.
     */
    node.safeCloseModbusClient = function (callback) {
      let finished = false
      const finish = function () {
        if (finished) {
          return
        }
        finished = true
        clearTimeout(timeoutId)
        if (typeof callback === 'function') {
          callback()
        }
      }
      const timeoutId = setTimeout(function () {
        verboseWarn('client.close timed out — continuing deploy')
        finish()
      }, 1500)

      try {
        if (!node.client) {
          finish()
          return
        }
        if (!node.client.isOpen) {
          finish()
          return
        }
        node.client.close(function (err) {
          if (err) {
            verboseLog('Connection closed with error')
          } else {
            verboseLog('Connection closed well')
          }
          finish()
        })
      } catch (err) {
        verboseWarn(err.message + ' on safeCloseModbusClient')
        finish()
      }
    }

    node.registerForModbus = function (clientUserNodeId) {
      const id = node.normalizeClientUserId(clientUserNodeId)
      if (!id) {
        return
      }
      const previousCount = Object.keys(node.registeredNodeList).length
      node.registeredNodeList[id] = id
      if (previousCount === 0) {
        node.closingModbus = false
        node.stateService.send('NEW')
        node.stateService.send('INIT')
      }
      node.emit('mbregister', id)
    }

    node.setStoppedState = function (clientUserNodeId, done) {
      node.stateService.send('STOP')
      node.emit('mbderegister', clientUserNodeId)
      done()
    }

    node.closeConnectionWithoutRegisteredNodes = function (clientUserNodeId, done) {
      if (Object.keys(node.registeredNodeList).length === 0) {
        node.closingModbus = true
        // Stop FSM / finish deregister immediately — do not wait for socket close (#423 deploy hang)
        node.setStoppedState(clientUserNodeId, done)
        if (node.client && node.actualServiceState && node.actualServiceState.value !== 'stopped') {
          node.safeCloseModbusClient(function () {})
        }
      } else {
        // Other consumers still use this client — do not STOP (#423 / #487)
        done()
      }
    }

    node.deregisterForModbus = function (clientUserNodeId, done) {
      const id = node.normalizeClientUserId(clientUserNodeId)
      try {
        if (id) {
          delete node.registeredNodeList[id]
        }
        // Clean legacy key from pre-fix registers (object coerced to "[object Object]")
        if (Object.prototype.hasOwnProperty.call(node.registeredNodeList, '[object Object]')) {
          delete node.registeredNodeList['[object Object]']
        }
        if (node.closingModbus) {
          done()
          return
        }
        if (Object.keys(node.registeredNodeList).length === 0) {
          node.closeConnectionWithoutRegisteredNodes(id, done)
        } else {
          // Siblings remain — keep FSM/connection (#423)
          done()
        }
      } catch (err) {
        verboseWarn(err.message + ' on de-register node ' + id)
        node.error(err)
        done()
      }
    }

    node.isInactive = function () {
      return _.isUndefined(node.actualServiceState) || node.messageAllowedStates.indexOf(node.actualServiceState.value) === -1
    }

    node.isActive = function () {
      return !node.isInactive()
    }

    node.isReadyToSend = function (node) {
      if (node.actualServiceState.matches('queueing') || node.actualServiceState.matches('activated')) {
        return true
      }

      verboseWarn('Client not ready to send')
      return false
    }
  }

  RED.nodes.registerType('modbus-client', ModbusClientNode)

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
