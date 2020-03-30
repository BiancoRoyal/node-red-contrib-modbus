/**
 Copyright (c) 2016,2017,2018,2019 Klaus Landsdorf (https://bianco-royal.com/)
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

  function ModbusClientNode (config) {
    RED.nodes.createNode(this, config)

    // create an empty modbus client
    const ModbusRTU = require('modbus-serial')

    const unlimitedListeners = 0
    const minCommandDelayMilliseconds = 1
    const defaultUnitId = 1
    const serialConnectionDelayTimeMS = 500
    const timeoutTimeMS = 1000
    const reconnectTimeMS = 2000
    const logHintText = ' Get More About It By Logging'

    this.clienttype = config.clienttype
    this.bufferCommands = config.bufferCommands
    this.queueLogEnabled = config.queueLogEnabled
    this.stateLogEnabled = config.stateLogEnabled

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

    this.unit_id = parseInt(config.unit_id) || defaultUnitId
    this.commandDelay = parseInt(config.commandDelay) || minCommandDelayMilliseconds
    this.clientTimeout = parseInt(config.clientTimeout) || timeoutTimeMS
    this.reconnectTimeout = parseInt(config.reconnectTimeout) || reconnectTimeMS
    this.reconnectOnTimeout = config.reconnectOnTimeout
    this.parallelUnitIdsAllowed = config.parallelUnitIdsAllowed

    const node = this
    node.isFirstInitOfConnection = true
    node.closingModbus = false
    node.client = null
    node.bufferCommandList = new Map()
    node.sendAllowed = new Map()
    node.unitSendingAllowed = []
    node.sendToDeviceAllowed = []
    node.messageAllowedStates = coreModbusClient.messagesAllowedStates
    node.serverInfo = ''

    node.stateMachine = null
    node.stateService = null
    node.stateMachine = coreModbusClient.createStateMachineService()
    node.actualServiceState = node.stateMachine.initialState
    node.actualServiceStateBefore = node.actualServiceState
    node.stateService = coreModbusClient.startStateService(node.stateMachine)
    node.reconnectTimeoutId = 0

    node.setUnitIdFromPayload = function (msg) {
      const unit = parseInt(msg.payload.unitid)

      if (Number.isInteger(unit)) {
        node.client.setID(unit)
        msg.queueUnitId = unit
      } else {
        if (!coreModbusClient.checkUnitId(node.unit_id, node.clienttype)) {
          node.unit_id = defaultUnitId
        }
        node.client.setID(node.unit_id)
        msg.queueUnitId = node.unit_id
      }
    }

    if (Number.isNaN(node.unit_id) || !coreModbusClient.checkUnitId(node.unit_id, node.clienttype)) {
      node.unit_id = defaultUnitId
    }

    node.updateServerinfo = function () {
      if (node.clienttype === 'tcp') {
        node.serverInfo = ' TCP@' + node.tcpHost + ':' + node.tcpPort
      } else {
        node.serverInfo = ' Serial@' + node.serialPort + ':' + node.serialBaudrate + 'bit/s'
      }
      node.serverInfo += ' default Unit-Id: ' + node.unit_id
    }

    function verboseWarn (logMessage) {
      if (RED.settings.verbose) {
        node.warn('Client -> ' + logMessage + node.serverInfo)
      }
    }

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        coreModbusClient.internalDebug('Client -> ' + logMessage + node.serverInfo)
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

      if (state.matches('init')) {
        node.updateServerinfo()
        coreModbusQueue.initQueue(node)
        node.reconnectTimeoutId = 0

        try {
          if (node.isFirstInitOfConnection) {
            node.isFirstInitOfConnection = false
            verboseWarn('init in ' + serialConnectionDelayTimeMS + ' ms')
            setTimeout(node.connectClient, serialConnectionDelayTimeMS)
          } else {
            verboseWarn('init in ' + node.reconnectTimeout + ' ms')
            setTimeout(node.connectClient, node.reconnectTimeout)
          }
        } catch (err) {
          node.error(err, { payload: 'client connection error ' + logHintText })
        }

        node.emit('mbinit')
      }

      if (state.matches('connected')) {
        node.emit('mbconnected')
        node.stateService.send('ACTIVATE')
      }

      if (state.matches('activated')) {
        node.emit('mbactive')
        if (node.bufferCommands && !coreModbusQueue.checkQueuesAreEmpty(node)) {
          node.stateService.send('QUEUE')
        }
      }

      if (state.matches('queueing')) {
        setTimeout(() => {
          coreModbusQueue.dequeueCommand(node)
        }, node.commandDelay)
        node.emit('mbqueue')
      }

      if (state.matches('opened')) {
        node.emit('mbopen')
      }

      if (state.matches('closed')) {
        node.emit('mbclosed')
        node.stateService.send('RECONNECT')
      }

      if (state.matches('stopped')) {
        verboseWarn('stopped state without reconnecting')
        node.emit('mbclosed')
      }

      if (state.matches('failed')) {
        node.emit('mberror', 'Modbus Failure On State ' + node.actualServiceStateBefore.value + logHintText)
        node.stateService.send('BREAK')
      }

      if (state.matches('broken')) {
        node.emit('mbbroken', 'Modbus Broken On State ' + node.actualServiceStateBefore.value + logHintText)
        if (node.reconnectOnTimeout) {
          if (node.reconnectTimeout <= 0) {
            node.reconnectTimeout = reconnectTimeMS
          }
          node.stateService.send('RECONNECT')
        } else {
          verboseWarn('We stay active on broken state without reconnecting')
          node.stateService.send('ACTIVATE')
        }
      }

      if (state.matches('reconnecting')) {
        node.emit('mbreconnecting')
        if (!node.reconnectTimeoutId) {
          if (node.reconnectTimeout <= 0) {
            node.reconnectTimeout = reconnectTimeMS
          }
          verboseWarn('try to reconnect by init in ' + node.reconnectTimeout + ' ms')
          node.reconnectTimeoutId = setTimeout(() => {
            node.stateService.send('INIT')
          }, node.reconnectTimeout)
        }
      }
    })

    node.connectClient = function () {
      if (node.client) {
        try {
          node.client.close(function () {
            verboseLog('connection closed')
          })
        } catch (err) {
          verboseLog(err.message)
        }
      }
      node.client = null
      node.client = new ModbusRTU()

      if (!node.clientTimeout) {
        node.clientTimeout = timeoutTimeMS
      }

      if (!node.reconnectTimeout) {
        node.reconnectTimeout = reconnectTimeMS
      }

      if (node.clienttype === 'tcp') {
        if (!coreModbusClient.checkUnitId(node.unit_id, node.clienttype)) {
          node.error(new Error('wrong unit-id (0..255)'), { payload: node.unit_id })
          node.stateService.send('FAILURE')
          return
        }

        switch (node.tcpType) {
          case 'C701':
            verboseLog('C701 port UDP bridge')
            node.client.connectC701(node.tcpHost, {
              port: node.tcpPort,
              autoOpen: true
            }).then(node.setTCPConnectionOptions)
              .then(node.setTCPConnected)
              .catch(node.modbusTcpErrorHandling)
            break
          case 'TELNET':
            verboseLog('Telnet port')
            node.client.connectTelnet(node.tcpHost, {
              port: node.tcpPort,
              autoOpen: true
            }).then(node.setTCPConnectionOptions)
              .catch(node.modbusTcpErrorHandling)
            break
          case 'TPC-RTU-BUFFERED':
            verboseLog('TCP RTU buffered port')
            node.client.connectTcpRTUBuffered(node.tcpHost, {
              port: node.tcpPort,
              autoOpen: true
            }).then(node.setTCPConnectionOptions)
              .catch(node.modbusTcpErrorHandling)
            break
          default:
            verboseLog('TCP port')
            node.client.connectTCP(node.tcpHost, {
              port: node.tcpPort,
              autoOpen: true
            }).then(node.setTCPConnectionOptions)
              .catch(node.modbusTcpErrorHandling)
        }
      } else {
        if (!coreModbusClient.checkUnitId(node.unit_id, node.clienttype)) {
          node.error(new Error('wrong unit-id serial (1..247)'), { payload: node.unit_id })
          node.stateService.send('FAILURE')
          return
        }

        if (!node.serialConnectionDelay) {
          node.serialConnectionDelay = serialConnectionDelayTimeMS
        }

        if (!node.serialPort) {
          node.error(new Error('wrong serial port'), { payload: node.serialPort })
          node.stateService.send('FAILURE')
          return
        }

        const serialPortOptions = {
          baudRate: parseInt(node.serialBaudrate),
          dataBits: parseInt(node.serialDatabits),
          stopBits: parseInt(node.serialStopbits),
          parity: node.serialParity,
          autoOpen: false
        }

        switch (node.serialType) {
          case 'ASCII':
            verboseLog('ASCII port serial')
            node.client.connectAsciiSerial(node.serialPort, serialPortOptions).then(node.setSerialConnectionOptions)
              .catch(node.modbusSerialErrorHandling)
            break
          case 'RTU':
            verboseLog('RTU port serial')
            node.client.connectRTU(node.serialPort, serialPortOptions).then(node.setSerialConnectionOptions)
              .catch(node.modbusSerialErrorHandling)
            break
          default:
            verboseLog('RTU buffered port serial')
            node.client.connectRTUBuffered(node.serialPort, serialPortOptions).then(node.setSerialConnectionOptions)
              .catch(node.modbusSerialErrorHandling)
            break
        }
      }
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
      if (err.message) {
        coreModbusClient.modbusSerialDebug('modbusTcpErrorHandling:' + err.message)
      } else {
        coreModbusClient.modbusSerialDebug('modbusTcpErrorHandling:' + JSON.stringify(err))
      }
      if (err.errno && coreModbusClient.networkErrors.includes(err.errno)) {
        node.stateService.send('BREAK')
      }
    }

    node.modbusSerialErrorHandling = function (err) {
      if (err.message) {
        coreModbusClient.modbusSerialDebug('modbusSerialErrorHandling:' + err.message)
      } else {
        coreModbusClient.modbusSerialDebug('modbusSerialErrorHandling:' + JSON.stringify(err))
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
      verboseWarn('modbus closed port')
      coreModbusClient.modbusSerialDebug('modbus closed port')
      node.stateService.send('CLOSE')
    }

    node.on('readModbus', function (msg, cb, cberr) {
      const state = node.actualServiceState

      if (node.messageAllowedStates.indexOf(state.value) === -1) {
        cberr(new Error('FSM Not Ready To Read At State ' + state.value), msg)
        return
      }

      if (node.bufferCommands) {
        msg.queueNumber = coreModbusQueue.getQueueNumber(node, msg)
        coreModbusQueue.pushToQueueByUnitId(node, coreModbusClient.readModbus, msg, cb, cberr)
        node.stateService.send('QUEUE')

        node.queueLog(JSON.stringify({
          info: 'queue read msg',
          message: msg.payload,
          state: state.value,
          queueLength: node.bufferCommandList.get(msg.queueUnit).length
        }))
      } else {
        coreModbusClient.readModbus(node, msg, cb, cberr)
      }
    })

    node.on('writeModbus', function (msg, cb, cberr) {
      const state = node.actualServiceState

      if (node.messageAllowedStates.indexOf(state.value) === -1) {
        cberr(new Error('FSM Not Ready To Write At State ' + state.value), msg)
        return
      }

      if (node.bufferCommands) {
        msg.queueNumber = coreModbusQueue.getQueueNumber(node, msg)
        coreModbusQueue.pushToQueueByUnitId(node, coreModbusClient.writeModbus, msg, cb, cberr)
        node.stateService.send('QUEUE')

        node.queueLog(JSON.stringify({
          info: 'queue write msg',
          message: msg.payload,
          state: state.value,
          queueLength: node.bufferCommandList.get(msg.queueUnit).length
        }))
      } else {
        coreModbusClient.writeModbus(node, msg, cb, cberr)
      }
    })

    node.activateSending = function (msg) {
      const deviceId = node.sendToDeviceAllowed.shift()
      if (node.bufferCommands) {
        node.sendAllowed.set(msg.queueUnit, true)

        node.queueLog(JSON.stringify({
          info: 'queue response activate sending',
          message: msg.payload,
          queueLength: node.bufferCommandList.length,
          serialUnitId: deviceId
        }))
      }
      node.stateService.send('ACTIVATE')
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

      coreModbusClient.internalDebug('Dynamic Reconnect Parameters ' + JSON.stringify(msg.payload))
      if (coreModbusClient.setNewNodeSettings(node, msg)) {
        cb(msg)
      } else {
        cberr(new Error('Message Or Payload Not Valid'), msg)
      }
      coreModbusClient.internalDebug('Dynamic Reconnect Starts on actual state ' + node.actualServiceState.value)
      node.stateService.send('CLOSE')
    })

    node.on('close', function (done) {
      verboseLog('stop fsm on close')
      node.stateService.send('STOP')
      node.stateMachine = null
      verboseLog('close node')
      if (node.client) {
        node.client.close(function () {
          verboseLog('connection closed')
          done()
        }).catch(function (err) {
          verboseLog(err.message)
          done()
        })
      } else {
        done()
      }
    })

    // handle using as config node
    node.registeredNodeList = {}

    node.registerForModbus = function (modbusNode) {
      node.registeredNodeList[modbusNode.id] = modbusNode
      if (Object.keys(node.registeredNodeList).length === 1) {
        node.closingModbus = false
        node.stateService.send('NEW')
        node.stateService.send('INIT')
      }
    }

    node.deregisterForModbus = function (modbusNode, done) {
      delete node.registeredNodeList[modbusNode.id]

      if (node.closingModbus) {
        done()
      }
      if (Object.keys(node.registeredNodeList).length === 0) {
        node.closingModbus = true
        if (node.client) {
          node.client.close(function () {
            node.stateService.send('STOP')
            done()
          }).catch(function (err) {
            node.stateService.send('STOP')
            verboseLog(err.message)
            done()
          })
        } else {
          done()
        }
      } else {
        done()
      }
    }
  }

  RED.nodes.registerType('modbus-client', ModbusClientNode)

  RED.httpAdmin.get('/modbus/serial/ports', RED.auth.needsPermission('serial.read'), function (req, res) {
    const SerialPort = require('serialport')
    SerialPort.list().then(ports => {
      res.json(ports)
    }).catch(err => {
      coreModbusClient.internalDebug(err.message)
    })
  })
}
