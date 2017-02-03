/**
 Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2016-2017 Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
/**
 * Modbus flexible Getter node.
 * @module NodeRedModbusFlexGetter
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  let mbBasics = require('./modbus-basics')

  function ModbusFlexGetter (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.connection = null

    let node = this
    let modbusClient = RED.nodes.getNode(config.server)

    setNodeStatusTo('waiting')

    node.onModbusInit = function () {
      setNodeStatusTo('initialize')
    }

    node.onModbusConnect = function () {
      setNodeStatusTo('connected')
    }

    node.onModbusActive = function () {
      setNodeStatusTo('active')
    }

    node.onModbusError = function (failureMsg) {
      setNodeStatusTo('failure')
      node.warn(failureMsg)
    }

    node.onModbusClose = function () {
      setNodeStatusTo('closed')
    }

    modbusClient.on('mbinit', node.onModbusInit)
    modbusClient.on('mbconnected', node.onModbusConnect)
    modbusClient.on('mbactive', node.onModbusActive)
    modbusClient.on('mberror', node.onModbusError)
    modbusClient.on('mbclosed', node.onModbusClose)

    node.on('input', function (msg) {
      if (!modbusClient.client) {
        return
      }

      if (node.showStatusActivities) {
        setNodeStatusTo(modbusClient.statlyMachine.getMachineState())
      }

      if (msg.payload) {
        try {
          msg.payload.fc = parseInt(msg.payload.fc)
          msg.payload.address = parseInt(msg.payload.address)
          msg.payload.quantity = parseInt(msg.payload.quantity)

          if (!(Number.isInteger(msg.payload.fc) &&
            msg.payload.fc >= 1 &&
            msg.payload.fc <= 4)) {
            node.error('FC Not Valid', msg)
            return
          }

          if (!(Number.isInteger(msg.payload.address) &&
            msg.payload.address >= 0 &&
            msg.payload.address <= 65535)) {
            node.error('Address Not Valid', msg)
            return
          }

          if (!(Number.isInteger(msg.payload.quantity) &&
            msg.payload.quantity >= 1 &&
            msg.payload.quantity <= 65535)) {
            node.error('Quantity Not Valid', msg)
            return
          }
        } catch (err) {
          node.error(err, msg)
        }

        modbusClient.emit('readModbus', msg, node.onModbusReadDone, node.onModbusReadError)
      } else {
        node.error('Payload Not Valid', msg)
      }
    })

    node.onModbusReadDone = function (resp, msg) {
      if (node.showStatusActivities) {
        setNodeStatusTo('reading done')
      }
      node.send(buildMessage(resp.data, resp, msg))
    }

    node.onModbusReadError = function (err, msg) {
      setModbusError(err, msg)
    }

    node.on('close', function () {
      setNodeStatusTo('closed')
    })

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        node.log(logMessage)
      }
    }

    function buildMessage (values, response, msg) {
      if (msg.payload) {
        msg.payload.values = values
        msg.payload.response = response
      }
      return [msg, {payload: response}]
    }

    function setNodeStatusTo (statusValue) {
      let statusOptions = mbBasics.set_node_status_properties(statusValue, node.showStatusActivities)
      if (mbBasics.statusLog) {
        verboseLog('status options: ' + JSON.stringify(statusOptions))
      }
      node.status({
        fill: statusOptions.fill,
        shape: statusOptions.shape,
        text: statusOptions.status
      })
    }

    function setModbusError (err, msg) {
      let working = false

      if (err) {
        node.error(err, msg)
        switch (err) {
          case 'Timed out':
            setNodeStatusTo('timeout')
            working = true
            break
          case 'Port Not Open':
            setNodeStatusTo('reconnect')
            modbusClient.emit('reconnect')
            working = true
            break
          default:
            setNodeStatusTo('error: ' + JSON.stringify(err))
        }
      }
      return working
    }
  }

  RED.nodes.registerType('modbus-flex-getter', ModbusFlexGetter)
}
