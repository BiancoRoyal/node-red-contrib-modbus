/**
 * Centralized Timer Manager for Modbus
 * Manages all timers to prevent memory leaks and improve debugging
 */

'use strict'

const EventEmitter = require('events')

class ModbusTimerManager extends EventEmitter {
  constructor (options = {}) {
    super()

    this.timers = new Map() // timerId -> timer info
    this.nodeTimers = new Map() // nodeId -> Set of timerIds
    this.statistics = {
      totalCreated: 0,
      totalCleared: 0,
      currentActive: 0,
      peakActive: 0,
      leakedTimers: 0
    }

    this.enableTracking = options.enableTracking !== false
    this.warningThreshold = options.warningThreshold || 50 // Warn if more than 50 active timers
    this.maxTimersPerNode = options.maxTimersPerNode || 20
    this.enableAutoCleanup = options.enableAutoCleanup !== false

    // Periodic cleanup check
    if (this.enableAutoCleanup) {
      this.cleanupInterval = setInterval(() => {
        this.performCleanup()
      }, 60000) // Every minute
    }
  }

  /**
   * Create a managed setTimeout
   * @param {Function} callback - Function to execute
   * @param {number} delay - Delay in milliseconds
   * @param {string} nodeId - Node identifier
   * @param {string} purpose - Timer purpose for debugging
   * @returns {string} Timer ID
   */
  setTimeout (callback, delay, nodeId, purpose = 'unknown') {
    const timerId = this.generateTimerId()

    // Check node timer limit
    if (this.nodeTimers.has(nodeId)) {
      const nodeTimerCount = this.nodeTimers.get(nodeId).size
      if (nodeTimerCount >= this.maxTimersPerNode) {
        this.emit('warning', {
          type: 'TIMER_LIMIT_EXCEEDED',
          nodeId,
          count: nodeTimerCount,
          limit: this.maxTimersPerNode
        })

        // Optionally reject timer creation
        if (this.enableTracking) {
          throw new Error(`Timer limit exceeded for node ${nodeId}`)
        }
      }
    }

    // Wrap callback to auto-cleanup
    const wrappedCallback = () => {
      try {
        callback()
      } catch (error) {
        this.emit('error', {
          timerId,
          nodeId,
          purpose,
          error
        })
      } finally {
        this.clearTimer(timerId)
      }
    }

    const timer = setTimeout(wrappedCallback, delay)

    // Store timer info
    const timerInfo = {
      id: timerId,
      type: 'timeout',
      timer,
      nodeId,
      purpose,
      delay,
      created: Date.now(),
      stackTrace: this.enableTracking ? new Error().stack : null
    }

    this.timers.set(timerId, timerInfo)

    // Track by node
    if (!this.nodeTimers.has(nodeId)) {
      this.nodeTimers.set(nodeId, new Set())
    }
    this.nodeTimers.get(nodeId).add(timerId)

    // Update statistics
    this.statistics.totalCreated++
    this.statistics.currentActive++
    if (this.statistics.currentActive > this.statistics.peakActive) {
      this.statistics.peakActive = this.statistics.currentActive
    }

    // Check warning threshold
    if (this.statistics.currentActive > this.warningThreshold) {
      this.emit('warning', {
        type: 'HIGH_TIMER_COUNT',
        count: this.statistics.currentActive,
        threshold: this.warningThreshold
      })
    }

    return timerId
  }

  /**
   * Create a managed setInterval
   * @param {Function} callback - Function to execute
   * @param {number} interval - Interval in milliseconds
   * @param {string} nodeId - Node identifier
   * @param {string} purpose - Timer purpose for debugging
   * @returns {string} Timer ID
   */
  setInterval (callback, interval, nodeId, purpose = 'unknown') {
    const timerId = this.generateTimerId()

    // Wrap callback for error handling
    const wrappedCallback = () => {
      try {
        callback()
      } catch (error) {
        this.emit('error', {
          timerId,
          nodeId,
          purpose,
          error
        })
        // Optionally clear interval on error
        this.clearTimer(timerId)
      }
    }

    const timer = setInterval(wrappedCallback, interval)

    // Store timer info
    const timerInfo = {
      id: timerId,
      type: 'interval',
      timer,
      nodeId,
      purpose,
      interval,
      created: Date.now(),
      stackTrace: this.enableTracking ? new Error().stack : null
    }

    this.timers.set(timerId, timerInfo)

    // Track by node
    if (!this.nodeTimers.has(nodeId)) {
      this.nodeTimers.set(nodeId, new Set())
    }
    this.nodeTimers.get(nodeId).add(timerId)

    // Update statistics
    this.statistics.totalCreated++
    this.statistics.currentActive++
    if (this.statistics.currentActive > this.statistics.peakActive) {
      this.statistics.peakActive = this.statistics.currentActive
    }

    return timerId
  }

  /**
   * Clear a managed timer
   * @param {string} timerId - Timer ID to clear
   * @returns {boolean} Success status
   */
  clearTimer (timerId) {
    const timerInfo = this.timers.get(timerId)
    if (!timerInfo) {
      return false
    }

    // Clear the actual timer
    if (timerInfo.type === 'timeout') {
      clearTimeout(timerInfo.timer)
    } else {
      clearInterval(timerInfo.timer)
    }

    // Remove from tracking
    this.timers.delete(timerId)

    // Remove from node tracking
    if (this.nodeTimers.has(timerInfo.nodeId)) {
      this.nodeTimers.get(timerInfo.nodeId).delete(timerId)

      // Clean up empty sets
      if (this.nodeTimers.get(timerInfo.nodeId).size === 0) {
        this.nodeTimers.delete(timerInfo.nodeId)
      }
    }

    // Update statistics
    this.statistics.totalCleared++
    this.statistics.currentActive--

    return true
  }

  /**
   * Clear all timers for a specific node
   * @param {string} nodeId - Node identifier
   * @returns {number} Number of timers cleared
   */
  clearNodeTimers (nodeId) {
    const nodeTimerSet = this.nodeTimers.get(nodeId)
    if (!nodeTimerSet) {
      return 0
    }

    let cleared = 0
    for (const timerId of nodeTimerSet) {
      if (this.clearTimer(timerId)) {
        cleared++
      }
    }

    return cleared
  }

  /**
   * Perform cleanup of stale timers
   */
  performCleanup () {
    const now = Date.now()
    const staleTimeout = 300000 // 5 minutes for timeouts

    for (const [timerId, timerInfo] of this.timers.entries()) {
      // Only check timeouts, not intervals
      if (timerInfo.type === 'timeout') {
        const expectedEnd = timerInfo.created + timerInfo.delay

        // Check if timer should have fired by now
        if (now > expectedEnd + staleTimeout) {
          this.emit('warning', {
            type: 'STALE_TIMER_DETECTED',
            timerId,
            nodeId: timerInfo.nodeId,
            purpose: timerInfo.purpose,
            age: now - timerInfo.created
          })

          // Clean up stale timer
          this.clearTimer(timerId)
          this.statistics.leakedTimers++
        }
      }
    }
  }

  /**
   * Get timer statistics
   * @returns {Object} Statistics object
   */
  getStatistics () {
    return {
      ...this.statistics,
      nodeBreakdown: this.getNodeBreakdown()
    }
  }

  /**
   * Get timer breakdown by node
   * @returns {Object} Node timer counts
   */
  getNodeBreakdown () {
    const breakdown = {}
    for (const [nodeId, timerSet] of this.nodeTimers.entries()) {
      breakdown[nodeId] = timerSet.size
    }
    return breakdown
  }

  /**
   * Get detailed timer information
   * @param {string} nodeId - Optional filter by node
   * @returns {Array} Timer information array
   */
  getTimerDetails (nodeId = null) {
    const details = []

    for (const [timerId, timerInfo] of this.timers.entries()) {
      if (!nodeId || timerInfo.nodeId === nodeId) {
        details.push({
          id: timerId,
          type: timerInfo.type,
          nodeId: timerInfo.nodeId,
          purpose: timerInfo.purpose,
          age: Date.now() - timerInfo.created,
          delay: timerInfo.delay || timerInfo.interval
        })
      }
    }

    return details
  }

  /**
   * Generate unique timer ID
   * @returns {string} Timer ID
   */
  generateTimerId () {
    return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Destroy the timer manager
   */
  destroy () {
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    // Clear all managed timers
    for (const timerId of this.timers.keys()) {
      this.clearTimer(timerId)
    }

    // Clear maps
    this.timers.clear()
    this.nodeTimers.clear()

    // Remove all event listeners
    this.removeAllListeners()
  }
}

module.exports = {
  ModbusTimerManager
}
