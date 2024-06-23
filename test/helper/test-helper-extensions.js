/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-modbus
 *
 **/

'use strict'

const { PortHelper } = require('./test-helper-port')
const portHelper = new PortHelper()

module.exports = {
  cleanFlowPositionData: (jsonFlow) => {
    const cleanFlow = []
    // flow is an array of JSON objects with x,y,z from the Node-RED export
    jsonFlow.forEach((item, index, array) => {
      const newObject = JSON.parse(JSON.stringify(item))
      if (newObject.type === 'helper') {
        cleanFlow.push({ id: newObject.id, type: 'helper', wires: newObject.wires })
      } else {
        delete newObject.x
        delete newObject.y
        delete newObject.z
        cleanFlow.push(newObject)
      }
    })

    return cleanFlow
  },
  getPort: async () => {
    return await portHelper.getPort()
  }
}
