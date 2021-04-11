/**
 Copyright (c) 2016,2017,2018,2019,2020,2021 Klaus Landsdorf (https://bianco-royal.space/)
 All rights reserved.
 node-red-contrib-modbus
 node-red-contrib-modbusio

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const coreIO = require('./core/modbus-io-core')

  function ModbusIOConfigNode (config) {
    const fs = require('fs-extra')
    const UNLIMITED_LISTENERS = 0

    RED.nodes.createNode(this, config)

    this.name = config.name
    this.path = config.path
    this.format = config.format
    this.addressOffset = config.addressOffset

    const node = this
    node.setMaxListeners(UNLIMITED_LISTENERS)
    node.lastUpdatedAt = null
    const lineReader = new coreIO.LineByLineReader(node.path)
    coreIO.internalDebug('Read IO File ' + node.path)
    node.configData = []

    lineReader.on('error', function (err) {
      coreIO.internalDebug(err.message)
    })

    lineReader.on('line', function (line) {
      if (line) {
        node.configData.push(JSON.parse(line))
      }
    })

    lineReader.on('end', function () {
      node.lastUpdatedAt = Date.now()
      coreIO.internalDebug('Read IO Done From File ' + node.path)
      node.warn({ payload: coreIO.allValueNamesFromIOFile(node), name: 'Modbus Value Names From IO File', path: node.path })
      node.emit('updatedConfig', node.configData)
    })

    coreIO.internalDebug('Loading IO File Started For ' + node.path)

    node.watcher = fs.watchFile(node.path, (curr, prev) => {
      coreIO.internalDebug(`the current mtime is: ${curr.mtime}`)
      coreIO.internalDebug(`the previous mtime was: ${prev.mtime}`)

      if (curr.mtime !== prev.mtime) {
        coreIO.internalDebug('Reload IO File ' + node.path)
        node.configData = []
        delete node.lastUpdatedAt

        const lineReader = new coreIO.LineByLineReader(node.path)
        lineReader.on('error', function (err) {
          coreIO.internalDebug(err.message)
        })

        lineReader.on('line', function (line) {
          if (line) {
            node.configData.push(JSON.parse(line))
          }
        })

        lineReader.on('end', function () {
          node.lastUpdatedAt = Date.now()
          coreIO.internalDebug('Reload IO Done From File ' + node.path)
          node.warn({ payload: coreIO.allValueNamesFromIOFile(node), name: 'Modbus Value Names From IO File', path: node.path })
          node.emit('updatedConfig', node.configData)
        })

        coreIO.internalDebug('Reloading IO File Started For ' + node.path)
      }
    })

    node.on('close', function (done) {
      fs.unwatchFile(node.path)
      node.watcher.close()
      done()
    })
  }

  RED.nodes.registerType('modbus-io-config', ModbusIOConfigNode)
}
