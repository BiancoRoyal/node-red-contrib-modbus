/**
 * XState Machine Validator for Modbus Client
 * Detects potential deadlocks and invalid state transitions
 */

'use strict'

class ModbusStateValidator {
  constructor () {
    // Define valid state transitions
    this.validTransitions = {
      init: ['connected', 'failed', 'broken'],
      connected: ['activated', 'failed', 'broken', 'closed'],
      activated: ['queueing', 'failed', 'broken', 'closed'],
      queueing: ['sending', 'empty', 'failed', 'broken', 'closed'],
      sending: ['activated', 'queueing', 'failed', 'broken', 'closed'],
      empty: ['activated', 'failed', 'broken', 'closed'],
      failed: ['init', 'broken', 'closed'],
      broken: ['init', 'closed'],
      closed: ['init']
    }

    // Define states that can cause deadlocks if stuck
    this.potentialDeadlockStates = ['sending', 'queueing']

    // Track state history for deadlock detection
    this.stateHistory = []
    this.maxHistorySize = 100
    this.deadlockDetectionWindow = 20
    this.stuckStateThreshold = 10 // Number of same states to consider stuck
  }

  /**
   * Validate a state transition
   * @param {string} fromState - Current state
   * @param {string} toState - Target state
   * @returns {Object} Validation result with warnings
   */
  validateTransition (fromState, toState) {
    const result = {
      valid: false,
      warnings: [],
      suggestions: []
    }

    // Check if transition is valid
    if (this.validTransitions[fromState]) {
      result.valid = this.validTransitions[fromState].includes(toState)
    }

    if (!result.valid) {
      result.warnings.push(`Invalid transition: ${fromState} -> ${toState}`)
      result.suggestions.push(`Valid transitions from ${fromState}: ${this.validTransitions[fromState]?.join(', ') || 'none'}`)
    }

    // Check for potential issues
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

  /**
   * Record state change and check for deadlocks
   * @param {string} state - Current state
   * @param {number} timestamp - Timestamp of state change
   * @returns {Object} Deadlock detection result
   */
  recordStateChange (state, timestamp = Date.now()) {
    this.stateHistory.push({ state, timestamp })

    // Keep history bounded
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift()
    }

    return this.detectDeadlock()
  }

  /**
   * Detect potential deadlocks in state machine
   * @returns {Object} Detection result with warnings
   */
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

    // Get recent states
    const recentStates = this.stateHistory.slice(-this.deadlockDetectionWindow)

    // Check for stuck state (same state repeated)
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

    // Check for rapid cycling between states
    const transitions = []
    for (let i = 1; i < recentStates.length; i++) {
      if (recentStates[i].state !== recentStates[i - 1].state) {
        transitions.push(`${recentStates[i - 1].state}->${recentStates[i].state}`)
      }
    }

    // Detect cycles (e.g., A->B->A->B)
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

    // Check time spent in states
    const now = Date.now()
    const lastState = recentStates[recentStates.length - 1]
    const timeInState = now - lastState.timestamp

    if (timeInState > 30000 && this.potentialDeadlockStates.includes(lastState.state)) {
      result.warnings.push(`Long duration in ${lastState.state} state: ${timeInState}ms`)
      result.suggestions.push('Check if operations are completing properly')
    }

    return result
  }

  /**
   * Get state machine health report
   * @returns {Object} Health report
   */
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

    // Add recommendations based on patterns
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

  /**
   * Calculate average time between state transitions
   * @returns {number} Average time in milliseconds
   */
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

  /**
   * Reset validator state
   */
  reset () {
    this.stateHistory = []
  }
}

module.exports = {
  ModbusStateValidator
}
