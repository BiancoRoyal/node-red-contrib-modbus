/**
 * XState Machine Validator for Modbus Client (v6 — 12 states)
 */

'use strict'

class ModbusStateValidator {
  constructor () {
    this.validTransitions = {
      init: ['opened', 'connected', 'failed', 'broken', 'stopped', 'switch'],
      opened: ['connected', 'failed', 'broken', 'closed', 'stopped', 'switch'],
      connected: ['activated', 'queueing', 'failed', 'broken', 'closed', 'stopped', 'switch'],
      activated: ['queueing', 'failed', 'broken', 'closed', 'stopped', 'switch'],
      queueing: ['sending', 'activated', 'failed', 'broken', 'closed', 'stopped', 'switch'],
      sending: ['activated', 'failed', 'broken', 'stopped', 'switch'],
      closed: ['failed', 'broken', 'connected', 'reconnecting', 'init', 'stopped', 'switch'],
      reconnecting: ['init', 'stopped'],
      failed: ['closed', 'broken', 'stopped', 'switch'],
      broken: ['init', 'failed', 'activated', 'reconnecting', 'stopped'],
      switch: ['closed', 'broken', 'stopped'],
      stopped: ['init', 'stopped']
    }

    this.potentialDeadlockStates = ['sending', 'queueing']
    this.stateHistory = []
    this.maxHistorySize = 100
    this.deadlockDetectionWindow = 20
    this.stuckStateThreshold = 10
    this.stuckThresholdMs = 30000
  }

  validateTransition (fromState, toState) {
    const result = {
      valid: false,
      warnings: [],
      suggestions: []
    }

    if (this.validTransitions[fromState]) {
      result.valid = this.validTransitions[fromState].includes(toState)
    }

    if (!result.valid) {
      result.warnings.push(`Invalid transition: ${fromState} -> ${toState}`)
      result.suggestions.push(`Valid transitions from ${fromState}: ${this.validTransitions[fromState]?.join(', ') || 'none'}`)
    }

    if (toState === 'queueing' && fromState === 'sending') {
      result.warnings.push('Potential queue buildup detected')
      result.suggestions.push('Monitor queue size to prevent memory issues')
    }

    if (this.potentialDeadlockStates.includes(toState)) {
      result.warnings.push(`Entering potentially blocking state: ${toState}`)
      result.suggestions.push('Ensure proper timeout handling in this state')
    }

    return result
  }

  recordStateChange (state, timestamp = Date.now()) {
    this.stateHistory.push({ state, timestamp })

    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift()
    }

    return this.detectDeadlock()
  }

  detectDeadlock () {
    const result = {
      hasDeadlock: false,
      stuckState: null,
      cycleDetected: false,
      warnings: [],
      suggestions: []
    }

    if (this.stateHistory.length < this.deadlockDetectionWindow) {
      return result
    }

    const recentStates = this.stateHistory.slice(-this.deadlockDetectionWindow)
    const stateCounts = {}
    recentStates.forEach(entry => {
      stateCounts[entry.state] = (stateCounts[entry.state] || 0) + 1
    })

    for (const [state, count] of Object.entries(stateCounts)) {
      if (count >= this.stuckStateThreshold && this.potentialDeadlockStates.includes(state)) {
        result.hasDeadlock = true
        result.stuckState = state
        result.warnings.push(`Potential deadlock: Stuck in ${state} state (${count} occurrences)`)
        result.suggestions.push(`Check timeout configuration for ${state} state`)
        result.suggestions.push('Verify error handling and recovery mechanisms')
      }
    }

    const transitions = []
    for (let i = 1; i < recentStates.length; i++) {
      if (recentStates[i].state !== recentStates[i - 1].state) {
        transitions.push(`${recentStates[i - 1].state}->${recentStates[i].state}`)
      }
    }

    const transitionCounts = {}
    transitions.forEach(t => {
      transitionCounts[t] = (transitionCounts[t] || 0) + 1
    })

    for (const [transition, count] of Object.entries(transitionCounts)) {
      if (count > 3) {
        result.cycleDetected = true
        result.warnings.push(`Rapid cycling detected: ${transition} (${count} times)`)
        result.suggestions.push('Add delays or backoff mechanisms to prevent rapid state changes')
      }
    }

    const now = Date.now()
    const lastState = recentStates[recentStates.length - 1]
    const timeInState = now - lastState.timestamp

    if (timeInState > this.stuckThresholdMs && this.potentialDeadlockStates.includes(lastState.state)) {
      result.warnings.push(`Long duration in ${lastState.state} state: ${timeInState}ms`)
      result.suggestions.push('Check if operations are completing properly')
    }

    return result
  }

  getHealthReport () {
    const uniqueStates = new Set(this.stateHistory.map(h => h.state))
    const transitionCount = this.stateHistory.length - 1

    const report = {
      totalTransitions: transitionCount,
      uniqueStatesVisited: uniqueStates.size,
      currentState: this.stateHistory[this.stateHistory.length - 1]?.state,
      deadlockCheck: this.detectDeadlock(),
      recommendations: []
    }

    if (uniqueStates.has('failed') || uniqueStates.has('broken')) {
      report.recommendations.push('Implement retry mechanisms for failed states')
    }

    if (transitionCount > 0) {
      const avgTransitionTime = this.calculateAverageTransitionTime()
      report.averageTransitionTime = avgTransitionTime

      if (avgTransitionTime < 100) {
        report.recommendations.push('State changes are very rapid, consider adding delays')
      }
    }

    return report
  }

  calculateAverageTransitionTime () {
    if (this.stateHistory.length < 2) {
      return 0
    }

    let totalTime = 0
    let transitionCount = 0

    for (let i = 1; i < this.stateHistory.length; i++) {
      const timeDiff = this.stateHistory[i].timestamp - this.stateHistory[i - 1].timestamp
      totalTime += timeDiff
      transitionCount++
    }

    return transitionCount > 0 ? totalTime / transitionCount : 0
  }

  reset () {
    this.stateHistory = []
  }
}

module.exports = {
  ModbusStateValidator
}
