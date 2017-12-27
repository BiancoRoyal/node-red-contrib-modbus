/**
 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus
 node-red-contrib-modbusio

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
module.exports = function (RED) {
  'use strict'
  const coreIO = require('./core/modbus-io-core')

  function ModbusIOConfigNode (config) {
    const fs = require('fs-extra')
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.path = config.path
    this.format = config.format

    let node = this
    node.lastUpdatedAt = null
    let lineReader = new coreIO.LineByLineReader(node.path)
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
    })

    coreIO.internalDebug('Loading IO File Started For ' + node.path)

    node.watcher = fs.watchFile(node.path, (curr, prev) => {
      coreIO.internalDebug(`the current mtime is: ${curr.mtime}`)
      coreIO.internalDebug(`the previous mtime was: ${prev.mtime}`)

      if (curr.mtime !== prev.mtime) {
        coreIO.internalDebug('Reload IO File ' + node.path)
        node.configData = []
        delete node.lastUpdatedAt

        let lineReader = new coreIO.LineByLineReader(node.path)
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
