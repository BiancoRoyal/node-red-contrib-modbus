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

let modbusNodesBootstrapped = false

function cleanFlowPositionData (jsonFlow) {
  const cleanFlow = []
  jsonFlow.forEach((item) => {
    const newObject = JSON.parse(JSON.stringify(item))
    if (newObject.type === 'helper') {
      cleanFlow.push({ id: newObject.id, type: 'helper', wires: newObject.wires })
    } else {
      delete newObject.x
      delete newObject.y
      delete newObject.z
      delete newObject.d
      cleanFlow.push(newObject)
    }
  })
  return cleanFlow
}

function hardenModbusFlow (flowTemplate, options = {}) {
  const flow = JSON.parse(JSON.stringify(flowTemplate))
  const preserveReconnect = options.preserveReconnect === true
  for (const node of flow) {
    if (node.type === 'modbus-client' || node.type === 'modbus-client-tls') {
      if (!preserveReconnect) {
        node.reconnectOnTimeout = false
        node.tcpAlwaysReconnect = false
      }
      node.clientTimeout = node.clientTimeout || '100'
    }
    if (node.type === 'modbus-read' && node.rateUnit === 's') {
      node.rate = '3600'
    }
  }
  return flow
}

function resetModbusTestBootstrap () {
  modbusNodesBootstrapped = false
}

function isModbusTestBootstrapped () {
  return modbusNodesBootstrapped
}

function markModbusTestBootstrapped () {
  modbusNodesBootstrapped = true
}

async function waitForFlowsStarted (helper, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    if (!helper._events || typeof helper._events.on !== 'function') {
      return resolve()
    }
    const timer = setTimeout(() => {
      helper._events.removeListener('flows:started', onStarted)
      reject(new Error('timeout waiting event'))
    }, timeoutMs)
    const onStarted = () => {
      clearTimeout(timer)
      resolve()
    }
    helper._events.on('flows:started', onStarted)
  })
}

async function clearTestFlows (helper) {
  if (!helper._redNodes || typeof helper.setFlows !== 'function') {
    return
  }
  try {
    await helper.setFlows([])
  } catch (e) {
    // ignore between tests
  }
}

async function unloadAndResetBootstrap (helper) {
  resetModbusTestBootstrap()
  if (helper && typeof helper.unload === 'function') {
    await helper.unload()
  }
}

async function bootstrapModbusTestNodes (helper, nodes) {
  if (modbusNodesBootstrapped) {
    return
  }
  const loadFn = helper._legacyLoad || helper.load.bind(helper)
  await loadFn(nodes, [{ id: 'bootstrap-helper', type: 'helper', wires: [] }])
  modbusNodesBootstrapped = true
}

function getTestNode (helper, id) {
  const isUsable = (n) => {
    if (!n) return false
    if (typeof n.receive === 'function' ||
      typeof n.connectClient === 'function' ||
      typeof n.deregisterForModbus === 'function' ||
      n.type === 'modbus-queue-info' ||
      n.type === 'modbus-io-config' ||
      n.type === 'modbus-response' ||
      n.type === 'modbus-response-filter') {
      return true
    }
    return n.type === 'helper' && typeof n.on === 'function'
  }

  const lookup = helper._originalGetNode || helper.getNode.bind(helper)
  const direct = lookup(id)
  if (isUsable(direct)) return direct

  let match = null
  if (helper._redNodes && typeof helper._redNodes.eachNode === 'function') {
    helper._redNodes.eachNode((n) => {
      if (n.id === id && isUsable(n)) {
        match = n
      }
    })
  }
  return match || null
}

async function activateModbusTestClients (helper, flow) {
  for (const nodeConfig of flow) {
    if (nodeConfig.type !== 'modbus-client' && nodeConfig.type !== 'modbus-client-tls') {
      continue
    }
    const client = getTestNode(helper, nodeConfig.id)
    if (!client) {
      continue
    }
    const activated = { value: 'activated' }
    client.actualServiceState = activated
  }
}

async function deployModbusFlow (helper, nodes, flowTemplate, flowOptions = {}) {
  await bootstrapModbusTestNodes(helper, nodes)
  const flow = hardenModbusFlow(cleanFlowPositionData(flowTemplate), flowOptions)
  const hasServer = flow.some((node) => node.type === 'modbus-server' || node.type === 'modbus-server-tls')
  const hasClient = flow.some((node) => node.type === 'modbus-client' || node.type === 'modbus-client-tls')

  if (hasServer && hasClient) {
    const serverBootstrap = flow.filter((node) =>
      node.type === 'tab' ||
      node.type === 'modbus-server' ||
      node.type === 'modbus-server-tls'
    )
    try {
      await helper.setFlows(serverBootstrap)
      try {
        await waitForFlowsStarted(helper)
      } catch (e) {
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
      await new Promise((resolve) => setTimeout(resolve, 800))
    } catch (e) {
      // continue with full flow deploy
    }
  }

  try {
    await helper.setFlows(flow)
    await waitForFlowsStarted(helper)
  } catch (err) {
    if (/timeout waiting event/i.test(err.message)) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    } else {
      throw err
    }
  }
  await activateModbusTestClients(helper, flow)
  if (hasServer) {
    await new Promise((resolve) => setTimeout(resolve, 800))
  }
}

function assignModbusTcpPorts (flow, port) {
  const portStr = String(port)
  for (const node of flow) {
    if (node.type === 'modbus-server' || node.type === 'modbus-server-tls') {
      node.serverPort = portStr
      if (node.port) node.port = portStr
    }
    if (node.type === 'modbus-client' || node.type === 'modbus-client-tls') {
      node.tcpPort = portStr
    }
  }
  return flow
}

module.exports = {
  bootstrapModbusTestNodes,
  deployModbusFlow,
  clearTestFlows,
  unloadAndResetBootstrap,
  resetModbusTestBootstrap,
  isModbusTestBootstrapped,
  markModbusTestBootstrapped,
  cleanFlowPositionData,
  hardenModbusFlow,

  getPort: async () => {
    return await portHelper.getPort()
  },

  /**
   * Resolve a deployed node by id after helper.load().
   */
  getTestNode,

  assignModbusTcpPorts,

  /**
   * Assign dynamic TCP port to modbus-server/modbus-client nodes; add server if missing.
   */
  prepareModbusTcpFlow: async (flowTemplate, options = {}) => {
    const addServerIfMissing = options.addServerIfMissing !== false
    const port = await portHelper.getPort()
    const flow = assignModbusTcpPorts(Array.from(flowTemplate), port)
    const portStr = String(port)
    let hasServer = false

    for (const node of flow) {
      if (node.type === 'modbus-server') {
        hasServer = true
      }
    }

    if (addServerIfMissing && !hasServer && flow.some(n => n.type === 'modbus-client')) {
      const tabId = flow.find(n => n.type === 'tab')?.id || flow.find(n => n.z)?.z
      if (tabId && !flow.some(n => n.id === tabId)) {
        flow.unshift({
          id: tabId,
          type: 'tab',
          label: 'Dynamic Test Tab',
          disabled: false,
          info: ''
        })
      }
      flow.unshift({
        id: 'dynamic-modbus-test-server',
        type: 'modbus-server',
        name: 'Dynamic Test Server',
        z: tabId,
        hostname: '127.0.0.1',
        serverPort: portStr,
        responseDelay: 100,
        delayUnit: 'ms',
        coilsBufferSize: 100,
        holdingBufferSize: 100,
        inputBufferSize: 100,
        discreteBufferSize: 100,
        showErrors: false,
        showStatusActivities: false,
        wires: [[], [], [], [], []]
      })
    }

    for (const node of flow) {
      if (node.type === 'modbus-client') {
        node.reconnectOnTimeout = false
        if (!node.clientTimeout) node.clientTimeout = '100'
      }
    }

    return flow
  }
}
