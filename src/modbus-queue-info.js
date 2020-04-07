/**
 Copyright (c) 2016,2017,2018,2019,2020 Klaus Landsdorf (https://bianco-royal.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/
/**
 * Modbus Read node.
 * @module NodeRedModbusRead
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const coreModbusQueue = require('./core/modbus-queue-core')
  const internalDebugLog = require('debug')('contribModbus:queue')

  function ModbusQueueInfo (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.topic = config.topic
    this.unitid = parseInt(config.unitid)
    this.lowLowLevel = parseInt(config.lowLowLevel)
    this.lowLevel = parseInt(config.lowLevel)
    this.highLevel = parseInt(config.highLevel)
    this.highHighLevel = parseInt(config.highHighLevel)
    this.errorOnHighLevel = config.errorOnHighLevel
    this.queueReadIntervalTime = config.queueReadIntervalTime || 1000
    this.showStatusActivities = config.showStatusActivities
    this.updateOnAllQueueChanges = config.updateOnAllQueueChanges

    this.internalDebugLog = internalDebugLog

    const node = this
    node.queueReadInterval = null
    node.updateStatusRrunning = false
    mbBasics.setNodeStatusTo('waiting', node)

    const modbusClient = RED.nodes.getNode(config.server)
    if (!modbusClient) {
      return
    }
    modbusClient.registerForModbus(node)
    mbBasics.initModbusClientEvents(node, modbusClient)

    node.resetStates = function () {
      node.lowLowLevelReached = true
      node.lowLevelReached = false
      node.highLevelReached = false
      node.highHighLevelReached = false
    }

    node.resetStates()

    node.checkLowLevelReached = function (node, items, unit) {
      if (!node.lowLevelReached && items > node.lowLowLevel && items < node.lowLevel) {
        node.lowLevelReached = true
        const msg = {
          payload: Date.now(),
          topic: node.topic,
          state: 'low level reached',
          unitid: unit,
          modbusClientName: modbusClient.name,
          items: items
        }

        node.send(msg)
      }
    }

    node.checkHighLevelReached = function (node, items, unit) {
      if (!node.highLevelReached && items > node.lowLevel && items > node.highLevel) {
        node.highLevelReached = true
        const msg = {
          payload: Date.now(),
          topic: node.topic,
          state: 'high level reached',
          unitid: unit,
          modbusClientName: modbusClient.name,
          highLevel: node.highLevel,
          items: items
        }

        if (node.errorOnHighLevel) {
          node.error(new Error('Queue High Level Reached'), msg)
        } else {
          node.warn(msg)
        }

        node.send(msg)
      }
    }

    node.checkHighHighLevelReached = function (node, items, unit) {
      if (!node.highHighLevelReached && items > node.highLevel && items > node.highHighLevel) {
        node.highHighLevelReached = true
        const msg = {
          payload: Date.now(),
          topic: node.topic,
          state: 'high high level reached',
          unitid: unit,
          modbusClientName: modbusClient.name,
          highLevel: node.highLevel,
          highHighLevel: node.highHighLevel,
          items: items
        }
        node.error(new Error('Queue High High Level Reached'), msg)
        node.send(msg)
      }
    }

    node.getStatusSituationFillColor = function () {
      let fillColor = 'blue'

      if (node.lowLevelReached) {
        fillColor = 'green'
      }

      if (node.highLevelReached) {
        if (node.errorOnHighLevel) {
          fillColor = 'red'
        } else {
          fillColor = 'yellow'
        }
      }

      if (node.highHighLevelReached) {
        fillColor = 'red'
      }

      return fillColor
    }

    node.readFromQueue = function () {
      if (node.updateStatusRrunning) {
        return
      }
      node.updateStatusRrunning = true
      let unit = node.unitid || 1

      if (modbusClient.bufferCommands) {
        if (unit < 1 || unit > 255) {
          unit = 1
        }

        const items = modbusClient.bufferCommandList.get(unit).length
        if (!items || (!node.lowLowLevelReached && items < node.lowLowLevel)) {
          node.resetStates()
        }

        node.checkLowLevelReached(node, items, unit)
        node.checkHighLevelReached(node, items, unit)
        node.checkHighHighLevelReached(node, items, unit)

        if (node.showStatusActivities) {
          node.status({
            fill: node.getStatusSituationFillColor(),
            shape: 'ring',
            text: 'active unit ' + unit + ' queue items: ' + items
          })
        }
      } else if (node.showStatusActivities) {
        mbBasics.setNodeStatusTo('active unit ' + unit + ' without queue', node)
      }
      node.updateStatusRrunning = false
    }

    modbusClient.on('mbinit', node.readFromQueue)
    modbusClient.on('mbconnected', node.readFromQueue)

    if (node.updateOnAllQueueChanges) { // more CPU-Load on many requests
      modbusClient.on('mbactive', node.readFromQueue)
      modbusClient.on('mbqueue', node.readFromQueue)
    }

    modbusClient.on('mberror', node.readFromQueue)
    modbusClient.on('mbclosed', node.readFromQueue)

    node.queueReadInterval = setInterval(node.readFromQueue, node.queueReadIntervalTime)

    node.on('input', function (msg) {
      msg.queueEnabled = modbusClient.bufferCommands

      if (Number.isInteger(node.unitid)) {
        msg.queue = modbusClient.bufferCommandList.get(node.unitid)
        msg.unitid = node.unitid
      } else {
        msg.queues = modbusClient.bufferCommandList
      }

      msg.queueOptions = {
        date: Date.now(),
        state: 'queue request',
        modbusClientName: modbusClient.name,
        lowlowLevel: node.lowlowLevel,
        lowLevel: node.lowLevel,
        highLevel: node.highLevel,
        highHighLevel: node.highHighLevel
      }

      if (msg && msg.resetQueue && modbusClient.bufferCommands) {
        coreModbusQueue.initQueue(modbusClient)
        if (RED.settings.verbose) {
          const infoText = 'Init Queue By External Node'
          modbusClient.warn(infoText)
          internalDebugLog(infoText)
        }
        node.resetStates()

        if (node.showStatusActivities) {
          node.status({
            fill: 'blue',
            shape: 'ring',
            text: 'active empty unit queue'
          })
        }
        msg.queueOptions.state = 'queue reset done'
      }

      node.send(msg)
    })

    node.on('close', function (done) {
      mbBasics.setNodeStatusTo('closed', node)
      if (node.queueReadInterval) {
        clearInterval(node.queueReadInterval)
      }
      node.queueReadInterval = null
      modbusClient.deregisterForModbus(node.id, done)
    })
  }

  RED.nodes.registerType('modbus-queue-info', ModbusQueueInfo)
}
