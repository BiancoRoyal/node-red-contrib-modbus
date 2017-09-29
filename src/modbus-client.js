/**
 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
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
  let coreModbusClient = require('./core/modbus-client-core')

  function ModbusClientNode (config) {
    RED.nodes.createNode(this, config)

    // create an empty modbus client
    let ModbusRTU = require('modbus-serial')

    const unlimitedListeners = 0
    const minCommandDelayMilliseconds = 1
    const defaultUnitId = 1
    const serialConnectionDelayTimeMS = 500
    const timeoutTimeMS = 1000
    const reconnectTimeMS = 2000

    this.clienttype = config.clienttype
    this.bufferCommands = config.bufferCommands
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

    let node = this

    node.client = null
    node.bufferCommandList = new Map()
    node.sendAllowed = new Map()
    node.unitSendingAllowed = []
    node.messageAllowedStates = coreModbusClient.messagesAllowedStates
    node.serverInfo = ''

    node.statlyMachine = null
    node.statlyMachine = coreModbusClient.createStatelyMachine()

    node.initQueue = function () {
      node.bufferCommandList.clear()
      node.sendAllowed.clear()
      node.unitSendingAllowed = []

      for (let step = 0; step <= 255; step++) {
        node.bufferCommandList.set(step, [])
        node.sendAllowed.set(step, true)
      }
    }

    node.checkUnitId = function (unitid) {
      if (node.clienttype === 'tcp') {
        return unitid >= 0 && unitid <= 255
      } else {
        return unitid >= 1 && unitid <= 247
      }
    }

    node.setUnitIdFromPayload = function (msg) {
      let unit = parseInt(msg.payload.unitid)

      if (Number.isInteger(unit)) {
        node.client.setID(unit)
        msg.queueUnitId = unit
      } else {
        if (!node.checkUnitId(node.unit_id)) {
          node.unit_id = defaultUnitId
        }
        node.client.setID(node.unit_id)
        msg.queueUnitId = node.unit_id
      }
    }

    if (Number.isNaN(node.unit_id) || !node.checkUnitId(node.unit_id)) {
      node.unit_id = defaultUnitId
    }

    node.sequentialDequeueCommand = function () {
      let command = null
      let noneCommandSent = true
      let serialUnit = parseInt(node.unitSendingAllowed.shift())

      if (Number.isInteger(serialUnit) &&
        node.bufferCommandList.get(serialUnit).length > 0) {
        queueLog(JSON.stringify({
          type: 'queue check',
          unitid: serialUnit,
          sendAllowed: node.sendAllowed.get(serialUnit),
          queueLength: node.bufferCommandList.get(serialUnit).length
        }))

        if (node.sendAllowed.get(serialUnit)) {
          command = node.bufferCommandList.get(serialUnit).shift()
          if (command) {
            node.sendAllowed.set(serialUnit, false)
            queueLog(JSON.stringify({
              type: 'serial sending and wait',
              unitid: serialUnit,
              commandData: command,
              queueLength: node.bufferCommandList.get(serialUnit).length,
              sendAllowedForNext: node.sendAllowed.get(serialUnit),
              delay: node.commandDelay
            }))

            if (node.bufferCommandList.get(serialUnit).length > 0) {
              node.unitSendingAllowed.push(serialUnit)
            }
            noneCommandSent = false
            command.callModbus(command.msg, command.cb, command.cberr)
          }
        }
      } else {
        queueLog(JSON.stringify({
          type: 'queue check is not a unit',
          unitid: serialUnit
        }))
      }

      if (noneCommandSent) {
        node.statlyMachine.empty()
      }
    }

    node.dequeueCommand = function () {
      let state = node.statlyMachine.getMachineState()

      if (node.messageAllowedStates.indexOf(state) === -1) {
        queueLog(JSON.stringify({
          state: state,
          message: 'dequeue command disallowed state',
          delay: node.commandDelay
        }))
      } else {
        queueLog(JSON.stringify({
          state: state,
          message: 'dequeue command ' + node.clienttype,
          delay: node.commandDelay
        }))

        node.sequentialDequeueCommand()
      }

      if (node.checkQueuesAreEmpty()) {
        node.statlyMachine.empty()
      }
    }

    node.checkQueuesAreEmpty = function () {
      let queueIsEmpty = true
      for (let step = 0; step <= 255; step++) {
        queueIsEmpty &= (node.bufferCommandList.get(step).length > 0)
      }
      return queueIsEmpty
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

    function queueLog (logMessage) {
      if (node.bufferCommands) {
        verboseLog(logMessage)
      }
    }

    node.statlyMachine.onINIT = function (event, oldState, newState) {
      node.updateServerinfo()
      node.initQueue()
      setTimeout(node.connectClient, node.reconnectTimeout)
      verboseWarn('reconnect in ' + node.reconnectTimeout + ' ms')
      verboseLog('event: ' + event + ' old: ' + oldState + ' new: ' + newState)
      node.emit('mbinit')
    }

    node.statlyMachine.onCONNECTED = function (event, oldState, newState) {
      stateLog('event: ' + event + ' old: ' + oldState + ' new: ' + newState)
      node.emit('mbconnected')
      node.statlyMachine.activate()
    }

    node.statlyMachine.onACTIVATED = function (event, oldState, newState) {
      stateLog('event: ' + event + ' old: ' + oldState + ' new: ' + newState)
      node.emit('mbactive')
      if (node.bufferCommands) {
        node.statlyMachine.queue()
      }
    }

    node.statlyMachine.onQUEUEING = function (event, oldState, newState) {
      stateLog('event: ' + event + ' old: ' + oldState + ' new: ' + newState)
      setTimeout(node.dequeueCommand, node.commandDelay)
      node.emit('mbqueue')
    }

    node.statlyMachine.onOPENED = function (event, oldState, newState) {
      verboseLog('event: ' + event + ' old: ' + oldState + ' new: ' + newState)
      node.emit('mbopen')
    }

    node.statlyMachine.onCLOSED = function (event, oldState, newState) {
      stateLog('event: ' + event + ' old: ' + oldState + ' new: ' + newState)
      node.emit('mbclosed')
      node.statlyMachine.break()
    }

    node.statlyMachine.onFAILED = function (event, oldState, newState) {
      stateLog('event: ' + event + ' old: ' + oldState + ' new: ' + newState)
      node.emit('mberror', 'FSM Reset On State ' + oldState)
      node.statlyMachine.break()
    }

    node.statlyMachine.onBROKEN = function (event, oldState, newState) {
      stateLog('event: ' + event + ' old: ' + oldState + ' new: ' + newState)
      node.emit('mbbroken')
      if (node.reconnectTimeout <= 0) {
        node.reconnectTimeout = reconnectTimeMS
      }
      verboseWarn('try to reconnect by init in ' + node.reconnectTimeout + ' ms')
      setTimeout(node.statlyMachine.init, node.reconnectTimeout)
    }

    node.connectClient = function () {
      if (node.client) {
        try {
          node.client.close(function () {
            verboseLog('connection closed')
          })
        } catch (err) {
          verboseLog(err)
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
        if (!node.checkUnitId(node.unit_id)) {
          node.error('wrong unit-id (0..255)', {payload: node.unit_id})
          node.statlyMachine.failure()
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
              .catch(node.modbusErrorHandling)
            break
          case 'TELNET':
            verboseLog('Telnet port')
            node.client.connectTelnet(node.tcpHost, {
              port: node.tcpPort,
              autoOpen: true
            }).then(node.setTCPConnectionOptions)
              .catch(node.modbusErrorHandling)
            break
          case 'TPC-RTU-BUFFERED':
            verboseLog('TCP RTU buffered port')
            node.client.connectTcpRTUBuffered(node.tcpHost, {
              port: node.tcpPort,
              autoOpen: true
            }).then(node.setTCPConnectionOptions)
              .catch(node.modbusErrorHandling)
            break
          default:
            verboseLog('TCP port')
            node.client.connectTCP(node.tcpHost, {
              port: node.tcpPort,
              autoOpen: true
            }).then(node.setTCPConnectionOptions)
              .catch(node.modbusErrorHandling)
        }
      } else {
        if (!node.checkUnitId(node.unit_id)) {
          node.error('wrong unit-id serial (1..247)', {payload: node.unit_id})
          node.statlyMachine.failure()
          return
        }

        if (!node.serialConnectionDelay) {
          node.serialConnectionDelay = serialConnectionDelayTimeMS
        }

        switch (node.serialType) {
          case 'ASCII':
            verboseLog('ASCII port serial')
            node.client.connectAsciiSerial(node.serialPort, {
              baudRate: parseInt(node.serialBaudrate),
              dataBits: parseInt(node.serialDatabits),
              stopBits: parseInt(node.serialStopbits),
              parity: node.serialParity,
              autoOpen: false
            }).then(node.setSerialConnectionOptions)
              .catch(node.modbusErrorHandling)
            break
          case 'RTU':
            verboseLog('RTU port serial')
            node.client.connectRTU(node.serialPort, {
              baudRate: parseInt(node.serialBaudrate),
              dataBits: parseInt(node.serialDatabits),
              stopBits: parseInt(node.serialStopbits),
              parity: node.serialParity,
              autoOpen: false
            }).then(node.setSerialConnectionOptions)
              .catch(node.modbusErrorHandling)
            break
          default:
            verboseLog('RTU buffered port serial')
            node.client.connectRTUBuffered(node.serialPort, {
              baudRate: parseInt(node.serialBaudrate),
              dataBits: parseInt(node.serialDatabits),
              stopBits: parseInt(node.serialStopbits),
              parity: node.serialParity,
              autoOpen: false
            }).then(node.setSerialConnectionOptions)
              .catch(node.modbusErrorHandling)
            break
        }
      }
    }

    node.setTCPConnectionOptions = function () {
      node.client.setID(node.unit_id)
      node.client.setTimeout(node.clientTimeout)
      node.statlyMachine.connect()
    }

    node.setTCPConnected = function () {
      coreModbusClient.modbusSerialDebug('modbus tcp connected on ' + node.tcpHost)
    }

    node.setSerialConnectionOptions = function () {
      node.statlyMachine.openserial()
      setTimeout(node.openSerialClient, parseInt(node.serialConnectionDelay))
    }

    node.modbusErrorHandling = function (err) {
      coreModbusClient.modbusSerialDebug(JSON.stringify(err))
      coreModbusClient.modbusSerialDebug(err.message)
      if (coreModbusClient.networkErrors.includes(err.errno)) {
        node.statlyMachine.failure()
      }
    }

    node.openSerialClient = function () {
      // some delay for windows
      if (node.statlyMachine.getMachineState() === 'OPENED') {
        verboseLog('time to open Unit ' + node.unit_id)
        coreModbusClient.modbusSerialDebug('modbus connection opened')
        node.client.setID(node.unit_id)
        node.client.setTimeout(parseInt(node.clientTimeout))
        node.client._port.on('close', node.onModbusClose)
        node.statlyMachine.connect()
      } else {
        verboseLog('wrong state on connect serial ' + node.statlyMachine.getMachineState())
        coreModbusClient.modbusSerialDebug('modbus connection not opened state is %s', node.statlyMachine.getMachineState())
        node.statlyMachine.failure()
      }
    }

    node.onModbusClose = function () {
      verboseWarn('modbus closed port')
      coreModbusClient.modbusSerialDebug('modbus closed port')
      node.statlyMachine.close()
    }

    node.getQueueNumber = function (msg) {
      let unit = parseInt(msg.payload.unitid)

      if (Number.isInteger(unit)) {
        return node.bufferCommandList.get(unit).length
      } else {
        return node.bufferCommandList.get(node.unit_id).length
      }
    }

    node.pushToQueueByUnitId = function (callModbus, msg, cb, cberr) {
      let unit = parseInt(msg.payload.unitid)

      if (Number.isInteger(unit)) {
        msg.queueUnit = unit
        queueLog(JSON.stringify({
          info: 'push to Queue by Unit-Id',
          msg: msg,
          unit: unit
        }))

        if (node.unitSendingAllowed.indexOf(unit) === -1) {
          node.unitSendingAllowed.push(unit)
        }

        node.bufferCommandList.get(unit).push({callModbus: callModbus, msg: msg, cb: cb, cberr: cberr})
      } else {
        msg.queueUnit = node.unit_id
        queueLog(JSON.stringify({
          info: 'push to Queue by default Unit-Id',
          msg: msg,
          unit: node.unit_id
        }))

        if (node.unitSendingAllowed.indexOf(node.unit_id) === -1) {
          node.unitSendingAllowed.push(node.unit_id)
        }

        node.bufferCommandList.get(node.unit_id).push({callModbus: callModbus, msg: msg, cb: cb, cberr: cberr})
      }
    }

    node.on('readModbus', function (msg, cb, cberr) {
      let state = node.statlyMachine.getMachineState()

      if (node.messageAllowedStates.indexOf(state) === -1) {
        cberr(new Error('FSM Not Ready To Read'), msg)
        return
      }

      if (node.bufferCommands) {
        msg.queueNumber = node.getQueueNumber(msg)
        node.pushToQueueByUnitId(node.readModbus, msg, cb, cberr)
        node.statlyMachine.queue()

        queueLog(JSON.stringify({
          info: 'queue read msg',
          msg: msg,
          state: state,
          queueLength: node.bufferCommandList.get(msg.queueUnit).length
        }))
      } else {
        node.readModbus(msg, cb, cberr)
      }
    })

    node.readModbus = function (msg, cb, cberr) {
      if (!node.client) {
        return
      }

      if (!node.bufferCommands) {
        node.statlyMachine.read()
      }

      node.setUnitIdFromPayload(msg)
      node.client.setTimeout(node.clientTimeout)

      queueLog(JSON.stringify({
        info: 'read msg',
        msg: msg,
        unitid: msg.queueUnitId,
        timeout: node.client.getTimeout(),
        state: node.statlyMachine.getMachineState()
      }))

      switch (parseInt(msg.payload.fc)) {
        case 1: // FC: 1
          node.client.readCoils(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
            node.activateSending(msg)
            cb(resp, msg)
          }).catch(function (err) {
            node.activateSending(msg)
            cberr(err, msg)
            node.modbusErrorHandling(err)
          })
          break
        case 2: // FC: 2
          node.client.readDiscreteInputs(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
            node.activateSending(msg)
            cb(resp, msg)
          }).catch(function (err) {
            node.activateSending(msg)
            cberr(err, msg)
            node.modbusErrorHandling(err)
          })
          break
        case 3: // FC: 3
          node.client.readHoldingRegisters(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
            node.activateSending(msg)
            cb(resp, msg)
          }).catch(function (err) {
            node.activateSending(msg)
            cberr(err, msg)
            node.modbusErrorHandling(err)
          })
          break
        case 4: // FC: 4
          node.client.readInputRegisters(parseInt(msg.payload.address), parseInt(msg.payload.quantity)).then(function (resp) {
            node.activateSending(msg)
            cb(resp, msg)
          }).catch(function (err) {
            node.activateSending(msg)
            cberr(err, msg)
            node.modbusErrorHandling(err)
          })
          break
        default:
          node.activateSending(msg)
          cberr('Function Code Unknown', msg)
          coreModbusClient.modbusSerialDebug('Function Code Unknown %s', JSON.stringify(msg))
          break
      }
    }

    node.on('writeModbus', function (msg, cb, cberr) {
      let state = node.statlyMachine.getMachineState()

      if (node.messageAllowedStates.indexOf(state) === -1) {
        cberr(new Error('FSM Not Ready To Write'), msg)
        return
      }

      if (node.bufferCommands) {
        msg.queueNumber = node.getQueueNumber(msg)
        node.pushToQueueByUnitId(node.writeModbus, msg, cb, cberr)
        node.statlyMachine.queue()

        queueLog(JSON.stringify({
          info: 'queue write msg',
          msg: msg,
          state: state,
          queueLength: node.bufferCommandList.get(msg.queueUnit).length
        }))
      } else {
        node.writeModbus(msg, cb, cberr)
      }
    })

    node.writeModbus = function (msg, cb, cberr) {
      if (!node.client) {
        return
      }

      if (!node.bufferCommands) {
        node.statlyMachine.write()
      }

      node.setUnitIdFromPayload(msg)
      node.client.setTimeout(node.clientTimeout)

      queueLog(JSON.stringify({
        info: 'write msg',
        msg: msg,
        unitid: msg.queueUnitId,
        timeout: node.client.getTimeout(),
        state: node.statlyMachine.getMachineState()
      }))

      switch (parseInt(msg.payload.fc)) {
        case 15: // FC: 15
          if (parseInt(msg.payload.value.length) !== parseInt(msg.payload.quantity)) {
            node.activateSending(msg)
            cberr('Quantity should be less or equal to coil payload array length: ' +
              msg.payload.value.length + ' Addr: ' + msg.payload.address + ' Q: ' + msg.payload.quantity, msg)
          } else {
            node.client.writeCoils(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
              node.activateSending(msg)
              cb(resp, msg)
            }).catch(function (err) {
              node.activateSending(msg)
              cberr(err, msg)
              node.modbusErrorHandling(err)
            })
          }
          break
        case 5: // FC: 5
          node.client.writeCoil(parseInt(msg.payload.address), (msg.payload.value === true)).then(function (resp) {
            node.activateSending(msg)
            cb(resp, msg)
          }).catch(function (err) {
            node.activateSending(msg)
            cberr(err, msg)
            node.modbusErrorHandling(err)
          })
          break
        case 16: // FC: 16
          if (parseInt(msg.payload.value.length) !== parseInt(msg.payload.quantity)) {
            node.activateSending(msg)
            cberr('Quantity should be less or equal to register payload array length: ' +
              msg.payload.value.length + ' Addr: ' + msg.payload.address + ' Q: ' + msg.payload.quantity, msg)
          } else {
            node.client.writeRegisters(parseInt(msg.payload.address), msg.payload.value).then(function (resp) {
              node.activateSending(msg)
              cb(resp, msg)
            }).catch(function (err) {
              node.activateSending(msg)
              cberr(err, msg)
              node.modbusErrorHandling(err)
            })
          }
          break
        case 6: // FC: 6
          node.client.writeRegister(parseInt(msg.payload.address), parseInt(msg.payload.value)).then(function (resp) {
            node.activateSending(msg)
            cb(resp, msg)
          }).catch(function (err) {
            node.activateSending(msg)
            cberr(err, msg)
            node.modbusErrorHandling(err)
          })
          break
        default:
          node.activateSending(msg)
          cberr('Function Code Unknown', msg)
          coreModbusClient.modbusSerialDebug('Function Code Unknown %s', JSON.stringify(msg))
          break
      }
    }

    node.activateSending = function (msg) {
      if (node.bufferCommands) {
        node.sendAllowed.set(msg.queueUnit, true)

        queueLog(JSON.stringify({
          info: 'queue response activate sending',
          msg: msg,
          queueLength: node.bufferCommandList.length
        }))
      }
      node.statlyMachine.activate()
    }

    verboseLog('initialized')
    node.setMaxListeners(unlimitedListeners)
    node.statlyMachine.init()

    node.on('reconnect', function () {
      node.statlyMachine.failure().close()
    })

    node.on('dynamicReconnect', function (msg) {
      if (!msg || !msg.payload) {
        throw new Error('Message Payload not Valid')
      }

      coreModbusClient.internalDebug('Dynamic Reconnect Parameters ' + JSON.stringify(msg.payload))

      switch (msg.payload.connectorType) {
        case 'TCP':
          node.tcpHost = msg.payload.tcpHost || node.tcpHost
          node.tcpPort = msg.payload.tcpPort || node.tcpPort
          node.tcpType = msg.payload.tcpType || node.tcpType

          coreModbusClient.internalDebug('New Connection Data ' + node.tcpHost + ' ' + node.tcpPort + ' ' + node.tcpType)
          break
        case 'SERIAL':
          if (msg.payload.serialPort) {
            node.serialPort = parseInt(msg.payload.serialPort) || node.serialPort
          }

          if (msg.payload.serialBaudrate) {
            node.serialBaudrate = parseInt(msg.payload.serialBaudrate) || node.serialBaudrate
          }

          node.serialDatabits = msg.payload.serialDatabits || node.serialDatabits
          node.serialStopbits = msg.payload.serialStopbits || node.serialStopbits
          node.serialParity = msg.payload.serialParity || node.serialParity
          node.serialType = msg.payload.serialType || node.serialType

          if (msg.payload.serialConnectionDelay) {
            node.serialConnectionDelay = parseInt(msg.payload.serialConnectionDelay) || node.serialConnectionDelay
          }
          coreModbusClient.internalDebug('New Connection Data ' + node.serialPort + ' ' + node.serialBaudrate + ' ' + node.serialType)
          break
        default:
          coreModbusClient.internalDebug('Unknown Dynamic Reconnect Type ' + msg.payload.connectorType)
      }

      if (msg.payload.unitId) {
        node.unit_id = parseInt(msg.payload.unitId) || node.unit_id
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

      coreModbusClient.internalDebug('Dynamic Reconnect Starts')
      node.statlyMachine.failure().close()
    })

    node.on('close', function (done) {
      node.statlyMachine.failure().stop()
      verboseLog('close node')
      if (node.client) {
        node.client.close(function () {
          verboseLog('connection closed')
          done()
        }).catch(function (err) {
          verboseLog(err)
          done()
        })
      } else {
        done()
      }
    })
  }

  RED.nodes.registerType('modbus-client', ModbusClientNode)

  RED.httpAdmin.get('/serialports', RED.auth.needsPermission('serial.read'), function (req, res) {
    let SerialPort = require('serialport')
    SerialPort.list(function (err, ports) {
      if (err) console.log(err)
      res.json(ports)
    })
  })
}
