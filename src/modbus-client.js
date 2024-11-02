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
        /* istanbul ignore next */
        verboseWarn('fsm init state after ' + node.actualServiceStateBefore.value)
        node.updateServerinfo()
        coreModbusQueue.initQueue(node)
        node.reconnectTimeoutId = 0

        try {
          if (node.isFirstInitOfConnection) {
            node.isFirstInitOfConnection = false
            /* istanbul ignore next */
            verboseWarn('first fsm init in ' + serialConnectionDelayTimeMS + ' ms')
            setTimeout(node.connectClient, serialConnectionDelayTimeMS)
          } else {
            /* istanbul ignore next */
            verboseWarn('fsm init in ' + node.reconnectTimeout + ' ms')
            setTimeout(node.connectClient, node.reconnectTimeout)
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
        coreModbusQueue.queueSerialUnlockCommand(node)
        node.emit('mbconnected')
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
        setTimeout(() => {
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

      /* istanbul ignore next */
      if (state.matches('closed')) {
        node.emit('mbclosed')
        node.stateService.send('RECONNECT')
      }

      if (state.matches('stopped')) {
        /* istanbul ignore next */
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
        /* istanbul ignore next */
        verboseWarn('fsm broken state after ' + node.actualServiceStateBefore.value + logHintText)
        node.emit('mbbroken', 'Modbus Broken On State ' + node.actualServiceStateBefore.value + logHintText)
        if (node.reconnectOnTimeout) {
          node.stateService.send('RECONNECT')
        } else {
          node.stateService.send('ACTIVATE')
        }
      }

      if (state.matches('reconnecting')) {
        /* istanbul ignore next */
        verboseWarn('fsm reconnect state after ' + node.actualServiceStateBefore.value + logHintText)
        coreModbusQueue.queueSerialLockCommand(node)
        node.emit('mbreconnecting')
        if (node.reconnectTimeout <= 0) {
          node.reconnectTimeout = reconnectTimeMS
        }
        setTimeout(() => {
          node.reconnectTimeoutId = 0
          node.stateService.send('INIT')
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
      setTimeout(node.openSerialClient, parseInt(node.serialConnectionDelay))
    }

    node.modbusErrorHandling = function (err) {
      coreModbusQueue.queueSerialUnlockCommand(node)
      if (err.message) {
        coreModbusClient.modbusSerialDebug('modbusErrorHandling:' + err.message)
      } else {
        coreModbusClient.modbusSerialDebug('modbusErrorHandling:' + JSON.stringify(err))
      }
      if (err.errno && coreModbusClient.networkErrors.includes(err.errno)) {
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
      verboseLog('stop fsm on close ' + nodeIdentifierName)
      node.stateService.send('STOP')
      verboseLog('close node ' + nodeIdentifierName)
      node.internalDebugLog('close node ' + nodeIdentifierName)

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

        node.client.removeAllListeners()
      } else {
        /* istanbul ignore next */
        verboseLog('Connection closed simple ' + nodeIdentifierName)
        done()
      }

      node.removeAllListeners()
    })

    // handle using as config node
    node.registeredNodeList = {}

    node.registerForModbus = function (clientUserNodeId) {
      node.registeredNodeList[clientUserNodeId] = clientUserNodeId
      if (Object.keys(node.registeredNodeList).length === 1) {
        node.closingModbus = false
        node.stateService.send('NEW')
        node.stateService.send('INIT')
      }
      node.emit('mbregister', clientUserNodeId)
    }

    node.setStoppedState = function (clientUserNodeId, done) {
      node.stateService.send('STOP')
      node.emit('mbderegister', clientUserNodeId)
      done()
    }

    node.closeConnectionWithoutRegisteredNodes = function (clientUserNodeId, done) {
      if (Object.keys(node.registeredNodeList).length === 0) {
        node.closingModbus = true
        if (node.client && node.actualServiceState.value !== 'stopped') {
          if (node.client.isOpen) {
            node.client.close(function () {
              node.setStoppedState(clientUserNodeId, done)
            })
          } else {
            node.setStoppedState(clientUserNodeId, done)
          }
        } else {
          node.setStoppedState(clientUserNodeId, done)
        }
      } else {
        node.setStoppedState(clientUserNodeId, done)
      }
    }

    node.deregisterForModbus = function (clientUserNodeId, done) {
      try {
        delete node.registeredNodeList[clientUserNodeId]
        if (node.closingModbus) {
          done()
          node.emit('mbderegister', clientUserNodeId)
        } else {
          node.closeConnectionWithoutRegisteredNodes(clientUserNodeId, done)
        }
      } catch (err) {
        /* istanbul ignore next */
        verboseWarn(err.message + ' on de-register node ' + clientUserNodeId)
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
