/**
 * FSM subscribe handler — side effects for modbus-client state transitions (v6).
 * @module core/client/modbus-fsm-handler
 */
'use strict'
// SOURCE-MAP-REQUIRED

/**
 * Run init-state connection bootstrap (first connect or reconnect timer).
 * @param {object} node
 * @param {object} deps
 */
function runInitConnection (node, deps) {
  const {
    coreModbusQueue,
    verboseWarn,
    serialConnectionDelayTimeMS,
    logHintText
  } = deps

  verboseWarn('fsm init state after ' + (node.actualServiceStateBefore && node.actualServiceStateBefore.value))
  node.updateServerinfo()
  coreModbusQueue.initQueue(node)
  node.reconnectTimeoutId = 0

  try {
    const isFirst = node.isFirstInitOfConnection
    const delay = isFirst ? serialConnectionDelayTimeMS : node.reconnectTimeout

    if (isFirst) {
      node.isFirstInitOfConnection = false
      verboseWarn('first fsm init in ' + delay + ' ms')
    } else {
      verboseWarn('fsm init in ' + delay + ' ms')
    }

    if (node.timerManager) {
      node.timerManager.setTimeout(node.connectClient, delay, node.id,
        isFirst ? 'initial-connection' : 'reconnection')
    } else {
      setTimeout(node.connectClient, delay)
    }
  } catch (err) {
    node.error(err, { payload: 'client connection error ' + logHintText })
  }

  const data = node.generateEvent('init', {})
  node.emitGlobalStateChange('mbinit', data)
}

/**
 * Create the stateService.subscribe handler for a modbus-client node.
 * @param {object} node
 * @param {object} deps
 * @returns {Function}
 */
function createFsmHandler (node, deps) {
  const {
    coreModbusQueue,
    verboseWarn,
    stateLog,
    reconnectTimeMS,
    logHintText
  } = deps

  return function fsmHandler (state) {
    node.actualServiceStateBefore = node.actualServiceState
    node.actualServiceState = state
    stateLog(state.value)

    if (!state.value || node.actualServiceState.value === undefined) {
      return
    }

    if (node.actualServiceStateBefore.value === node.actualServiceState.value) {
      return
    }

    if (node.stateValidator) {
      const validationResult = node.stateValidator.recordStateChange(state.value)
      if (validationResult.hasDeadlock) {
        verboseWarn('Potential deadlock detected: ' + validationResult.warnings.join(', '))
      }
    }

    if (state.matches('init')) {
      runInitConnection(node, deps)
    }

    if (state.matches('connected')) {
      verboseWarn('fsm connected after state ' + node.actualServiceStateBefore.value + logHintText)
      coreModbusQueue.queueSerialUnlockCommand(node)
      const data = node.generateEvent('connected', {})
      node.emitGlobalStateChange('mbconnected', data)
      node.stateService.send('ACTIVATE')
    }

    if (state.matches('activated')) {
      const data = node.generateEvent('active', {})
      node.emitGlobalStateChange('mbactive', data)
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
      } else if (node.serialSendingAllowed) {
        coreModbusQueue.queueSerialLockCommand(node)
        node.stateService.send('SEND')
      }
    }

    if (state.matches('sending')) {
      const dequeueDelay = node.commandDelay
      if (node.timerManager) {
        node.timerManager.setTimeout(() => {
          coreModbusQueue.dequeueCommand(node)
        }, dequeueDelay, node.id, 'dequeue')
      } else {
        setTimeout(() => {
          coreModbusQueue.dequeueCommand(node)
        }, dequeueDelay)
      }
      const data = node.generateEvent('queue', {})
      node.emitGlobalStateChange('mbqueue', data)
    }

    if (state.matches('opened')) {
      coreModbusQueue.queueSerialUnlockCommand(node)
      const data = node.generateEvent('open', {})
      node.emitGlobalStateChange('mbopen', data)
    }

    if (state.matches('switch')) {
      node.setCloseIntent('switch')
      const data = node.generateEvent('switch', {})
      node.emitGlobalStateChange('mbswitch', data)
      node.stateService.send('CLOSE')
    }

    if (state.matches('closed')) {
      const data = node.generateEvent('closed', {})
      node.emitGlobalStateChange('mbclosed', data)
      const intent = node.getCloseIntent()
      node.resetCloseIntent()
      if (node.reconnectOnTimeout && intent === 'error') {
        node.stateService.send('RECONNECT')
      }
    }

    if (state.matches('stopped')) {
      verboseWarn('stopped state without reconnecting')
      const data = node.generateEvent('closed', {})
      node.emitGlobalStateChange('mbclosed', data)
    }

    if (state.matches('failed')) {
      verboseWarn('fsm failed state after ' + node.actualServiceStateBefore.value + logHintText)
      const data = node.generateEvent('error', {
        message: 'Modbus Failure On State ' + node.actualServiceStateBefore.value + logHintText
      })
      node.emitGlobalStateChange('mberror', data)
      node.stateService.send('BREAK')
    }

    if (state.matches('broken')) {
      verboseWarn('fsm broken state after ' + node.actualServiceStateBefore.value + logHintText)
      const data = node.generateEvent('broken', {
        message: 'Modbus Broken On State ' + node.actualServiceStateBefore.value + logHintText
      })
      node.emitGlobalStateChange('mbbroken', data)

      if (node.reconnectOnTimeout) {
        node.setCloseIntent('error')
        node.stateService.send('RECONNECT')
      } else {
        node.stateService.send('ACTIVATE')
      }
    }

    if (state.matches('reconnecting')) {
      verboseWarn('fsm reconnect state after ' + node.actualServiceStateBefore.value + logHintText)
      coreModbusQueue.queueSerialLockCommand(node)
      const data = node.generateEvent('reconnecting', {})
      node.emitGlobalStateChange('mbreconnecting', data)
      if (node.reconnectTimeout <= 0) {
        node.reconnectTimeout = reconnectTimeMS
      }
      const reconnectDelay = node.reconnectTimeout
      if (node.timerManager) {
        node.timerManager.setTimeout(() => {
          node.reconnectTimeoutId = 0
          node.stateService.send('INIT')
        }, reconnectDelay, node.id, 'reconnect')
      } else {
        setTimeout(() => {
          node.reconnectTimeoutId = 0
          node.stateService.send('INIT')
        }, reconnectDelay)
      }
    }
  }
}

module.exports = {
  createFsmHandler,
  runInitConnection
}
