/**
 * Circuit Breaker implementation for Modbus connections
 * Provides automatic failure detection and recovery
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests are rejected
 * - HALF_OPEN: Testing if service has recovered
 */

'use strict'

const EventEmitter = require('events')

const CircuitBreakerState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
}

const CircuitBreakerError = class extends Error {
  constructor (message, state, nextAttempt) {
    super(message)
    this.name = 'CircuitBreakerError'
    this.state = state
    this.nextAttempt = nextAttempt
  }
}

class ModbusCircuitBreaker extends EventEmitter {
  constructor (options = {}) {
    super()

    // Configuration
    this.failureThreshold = options.failureThreshold || 5
    this.successThreshold = options.successThreshold || 2
    this.timeout = options.timeout || 60000 // 60 seconds
    this.resetTimeout = options.resetTimeout || 30000 // 30 seconds
    this.volumeThreshold = options.volumeThreshold || 10 // Minimum requests before opening
    this.rollingWindow = options.rollingWindow || 10000 // 10 seconds for rolling metrics
    this.errorFilter = options.errorFilter || null // Custom error filter function
    this.fallbackFunction = options.fallbackFunction || null // Fallback when circuit is open

    // State
    this.state = CircuitBreakerState.CLOSED
    this.failures = 0
    this.successes = 0
    this.requestCount = 0
    this.lastFailureTime = null
    this.nextAttempt = null
    this.rollingFailures = []
    this.rollingSuccesses = []

    // Metrics
    this.metrics = {
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      totalTimeouts: 0,
      totalCircuitBreaks: 0,
      totalFallbacks: 0,
      lastStateChange: new Date(),
      failureRate: 0,
      successRate: 0,
      averageResponseTime: 0,
      percentiles: { p50: 0, p90: 0, p95: 0, p99: 0 },
      responseTimes: []
    }

    // Start rolling window cleanup
    this.startRollingWindowCleanup()
  }

  /**
   * Execute a function through the circuit breaker
   * @param {Function} fn - The function to execute
   * @returns {Promise} - Result of the function or rejection if circuit is open
   */
  async execute (fn) {
    this.metrics.totalRequests++
    this.requestCount++

    if (this.state === CircuitBreakerState.OPEN) {
      if (this.nextAttempt && Date.now() < this.nextAttempt) {
        // Try fallback function if available
        if (this.fallbackFunction) {
          this.metrics.totalFallbacks++
          this.emit('fallback', { state: this.state })
          return await this.fallbackFunction()
        }

        this.emit('rejected', { state: this.state, reason: 'Circuit breaker is OPEN' })
        throw new CircuitBreakerError(
          `Circuit breaker is OPEN. Retry after ${new Date(this.nextAttempt).toISOString()}`,
          this.state,
          this.nextAttempt
        )
      }

      // Move to half-open state to test recovery
      this.transitionTo(CircuitBreakerState.HALF_OPEN)
    }

    const startTime = Date.now()

    try {
      const result = await Promise.race([
        fn(),
        this.createTimeout()
      ])

      const responseTime = Date.now() - startTime
      this.onSuccess(responseTime)
      return result
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.onFailure(error, responseTime)
      throw error
    }
  }

  /**
   * Create a timeout promise
   * @returns {Promise} - Rejects after timeout period
   */
  createTimeout () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.metrics.totalTimeouts++
        reject(new Error(`Operation timed out after ${this.timeout}ms`))
      }, this.timeout)
    })
  }

  /**
   * Handle successful operation
   * @param {number} responseTime - Response time in milliseconds
   */
  onSuccess (responseTime) {
    this.metrics.totalSuccesses++
    this.failures = 0

    // Add to rolling window
    this.rollingSuccesses.push({ timestamp: Date.now(), responseTime })
    this.updateResponseTimeMetrics(responseTime)

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successes++

      if (this.successes >= this.successThreshold) {
        this.transitionTo(CircuitBreakerState.CLOSED)
      }
    }

    this.updateMetrics()
    this.emit('success', { state: this.state, metrics: this.metrics })
  }

  /**
   * Handle failed operation
   * @param {Error} error - The error that occurred
   * @param {number} responseTime - Response time in milliseconds
   */
  onFailure (error, responseTime) {
    // Apply error filter if configured
    if (this.errorFilter && !this.errorFilter(error)) {
      // Error should not trigger circuit breaker
      return
    }

    this.metrics.totalFailures++
    this.failures++
    this.lastFailureTime = Date.now()

    // Add to rolling window
    this.rollingFailures.push({ timestamp: Date.now(), error, responseTime })

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.transitionTo(CircuitBreakerState.OPEN)
    } else if (this.state === CircuitBreakerState.CLOSED) {
      if (this.failures >= this.failureThreshold &&
          this.requestCount >= this.volumeThreshold) {
        this.transitionTo(CircuitBreakerState.OPEN)
      }
    }

    this.updateMetrics()
    this.emit('failure', { state: this.state, error, metrics: this.metrics })
  }

  /**
   * Transition to a new state
   * @param {string} newState - The new state to transition to
   */
  transitionTo (newState) {
    const previousState = this.state
    this.state = newState
    this.metrics.lastStateChange = new Date()

    switch (newState) {
      case CircuitBreakerState.CLOSED:
        this.failures = 0
        this.successes = 0
        this.nextAttempt = null
        break

      case CircuitBreakerState.OPEN:
        this.metrics.totalCircuitBreaks++
        this.nextAttempt = Date.now() + this.resetTimeout
        this.successes = 0
        break

      case CircuitBreakerState.HALF_OPEN:
        this.successes = 0
        this.failures = 0
        break
    }

    this.emit('stateChange', {
      from: previousState,
      to: newState,
      metrics: this.metrics
    })
  }

  /**
   * Update metrics
   */
  updateMetrics () {
    const totalAttempts = this.metrics.totalSuccesses + this.metrics.totalFailures
    this.metrics.failureRate = totalAttempts > 0
      ? (this.metrics.totalFailures / totalAttempts) * 100
      : 0
    this.metrics.successRate = totalAttempts > 0
      ? (this.metrics.totalSuccesses / totalAttempts) * 100
      : 0

    // Calculate rolling window failure rate
    this.cleanRollingWindows()
    const rollingTotal = this.rollingSuccesses.length + this.rollingFailures.length
    const rollingFailureRate = rollingTotal > 0
      ? (this.rollingFailures.length / rollingTotal) * 100
      : 0

    // Use rolling failure rate for more accurate assessment
    if (rollingTotal >= this.volumeThreshold) {
      this.metrics.failureRate = rollingFailureRate
    }
  }

  /**
   * Get current state and metrics
   * @returns {Object} - Current state and metrics
   */
  getStatus () {
    return {
      state: this.state,
      metrics: this.metrics,
      config: {
        failureThreshold: this.failureThreshold,
        successThreshold: this.successThreshold,
        timeout: this.timeout,
        resetTimeout: this.resetTimeout
      },
      nextAttempt: this.nextAttempt ? new Date(this.nextAttempt).toISOString() : null
    }
  }

  /**
   * Reset the circuit breaker
   */
  reset () {
    this.state = CircuitBreakerState.CLOSED
    this.failures = 0
    this.successes = 0
    this.requestCount = 0
    this.lastFailureTime = null
    this.nextAttempt = null

    this.emit('reset', { state: this.state })
  }

  /**
   * Force the circuit to open
   */
  tripCircuit () {
    this.transitionTo(CircuitBreakerState.OPEN)
  }

  /**
   * Force the circuit to close
   */
  closeCircuit () {
    this.transitionTo(CircuitBreakerState.CLOSED)
  }

  /**
   * Update response time metrics
   * @param {number} responseTime - Response time in milliseconds
   */
  updateResponseTimeMetrics (responseTime) {
    this.metrics.responseTimes.push(responseTime)

    // Keep only last 1000 response times
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift()
    }

    // Update average
    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0)
    this.metrics.averageResponseTime = sum / this.metrics.responseTimes.length

    // Calculate percentiles
    const sorted = [...this.metrics.responseTimes].sort((a, b) => a - b)
    const len = sorted.length

    if (len > 0) {
      this.metrics.percentiles.p50 = sorted[Math.floor(len * 0.5)]
      this.metrics.percentiles.p90 = sorted[Math.floor(len * 0.9)]
      this.metrics.percentiles.p95 = sorted[Math.floor(len * 0.95)]
      this.metrics.percentiles.p99 = sorted[Math.floor(len * 0.99)]
    }
  }

  /**
   * Clean rolling windows based on time window
   */
  cleanRollingWindows () {
    const cutoff = Date.now() - this.rollingWindow

    this.rollingSuccesses = this.rollingSuccesses.filter(
      item => item.timestamp > cutoff
    )

    this.rollingFailures = this.rollingFailures.filter(
      item => item.timestamp > cutoff
    )
  }

  /**
   * Start rolling window cleanup timer
   */
  startRollingWindowCleanup () {
    this.cleanupInterval = setInterval(() => {
      this.cleanRollingWindows()
      this.updateMetrics()
    }, this.rollingWindow / 2)
  }

  /**
   * Stop rolling window cleanup timer
   */
  stopRollingWindowCleanup () {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Destroy the circuit breaker and clean up resources
   */
  destroy () {
    this.stopRollingWindowCleanup()
    this.removeAllListeners()
  }
}

module.exports = {
  ModbusCircuitBreaker,
  CircuitBreakerState,
  CircuitBreakerError
}
