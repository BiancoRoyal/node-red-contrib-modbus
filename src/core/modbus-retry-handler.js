/**
 * Retry Handler for Modbus operations
 * Provides configurable retry strategies with exponential backoff
 */

'use strict'

const EventEmitter = require('events')

class RetryError extends Error {
  constructor (message, attempts, errors) {
    super(message)
    this.name = 'RetryError'
    this.attempts = attempts
    this.errors = errors
  }
}

class ModbusRetryHandler extends EventEmitter {
  constructor (options = {}) {
    super()

    // Configuration
    this.maxRetries = options.maxRetries || 3
    this.initialDelay = options.initialDelay || 1000
    this.maxDelay = options.maxDelay || 30000
    this.backoffMultiplier = options.backoffMultiplier || 2
    this.jitterFactor = options.jitterFactor || 0.1
    this.retryableErrors = options.retryableErrors || [
      'ETIMEDOUT',
      'ECONNRESET',
      'ECONNREFUSED',
      'EHOSTUNREACH',
      'ENETUNREACH',
      'ENOTFOUND',
      'EAI_AGAIN',
      'EPIPE',
      'ECONNABORTED'
    ]
    this.circuitBreaker = options.circuitBreaker || null
    this.onRetryCallback = options.onRetryCallback || null
    this.abortController = options.abortController || null

    // Statistics
    this.statistics = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      retriedAttempts: 0,
      exhaustedRetries: 0,
      averageRetries: 0,
      averageDelayTime: 0,
      totalDelayTime: 0,
      abortedAttempts: 0
    }

    // Active retry operations
    this.activeRetries = new Map()
  }

  /**
   * Execute operation with retry logic
   * @param {Function} operation - The operation to execute
   * @param {Object} context - Context for the operation
   * @param {Object} options - Retry options for this operation
   * @returns {Promise} - Result of the operation
   */
  async executeWithRetry (operation, context = {}, options = {}) {
    const retryOptions = {
      maxRetries: options.maxRetries !== undefined ? options.maxRetries : this.maxRetries,
      initialDelay: options.initialDelay || this.initialDelay,
      maxDelay: options.maxDelay || this.maxDelay,
      backoffMultiplier: options.backoffMultiplier || this.backoffMultiplier,
      retryCondition: options.retryCondition || this.defaultRetryCondition.bind(this),
      abortSignal: options.abortSignal || (this.abortController ? this.abortController.signal : null)
    }

    const retryId = this.generateRetryId()
    const retryState = {
      id: retryId,
      attempt: 0,
      startTime: Date.now(),
      delays: [],
      errors: []
    }

    this.activeRetries.set(retryId, retryState)
    this.statistics.totalAttempts++

    try {
      const result = await this.attemptOperation(
        operation,
        context,
        retryOptions,
        retryState
      )

      this.statistics.successfulAttempts++
      this.updateAverageRetries(retryState.attempt)
      this.activeRetries.delete(retryId)

      this.emit('success', {
        retryId,
        attempts: retryState.attempt + 1,
        duration: Date.now() - retryState.startTime,
        result
      })

      return result
    } catch (error) {
      this.statistics.failedAttempts++

      if (error.name === 'AbortError') {
        this.statistics.abortedAttempts++
      } else {
        this.statistics.exhaustedRetries++
      }

      this.activeRetries.delete(retryId)

      const retryError = new RetryError(
        `Operation failed after ${retryState.attempt + 1} attempts: ${error.message}`,
        retryState.attempt + 1,
        retryState.errors
      )

      this.emit('failed', {
        retryId,
        attempts: retryState.attempt + 1,
        duration: Date.now() - retryState.startTime,
        errors: retryState.errors,
        finalError: error
      })

      throw retryError
    }
  }

  /**
   * Attempt operation with retry logic
   * @param {Function} operation - The operation to execute
   * @param {Object} context - Context for the operation
   * @param {Object} options - Retry options
   * @param {Object} state - Retry state
   * @returns {Promise} - Result of the operation
   */
  async attemptOperation (operation, context, options, state) {
    while (state.attempt <= options.maxRetries) {
      // Check for abort signal
      if (options.abortSignal && options.abortSignal.aborted) {
        throw new Error('Operation aborted')
      }

      try {
        // Add delay if this is a retry
        if (state.attempt > 0) {
          const delay = this.calculateDelay(state.attempt, options)
          state.delays.push(delay)
          this.statistics.totalDelayTime += delay

          this.emit('retrying', {
            retryId: state.id,
            attempt: state.attempt,
            delay,
            previousError: state.errors[state.errors.length - 1]
          })

          // Execute onRetryCallback if provided
          if (this.onRetryCallback) {
            await this.onRetryCallback({
              attempt: state.attempt,
              delay,
              previousError: state.errors[state.errors.length - 1],
              context
            })
          }

          await this.delay(delay, options.abortSignal)
          this.statistics.retriedAttempts++
        }

        // Execute the operation, possibly through circuit breaker
        let result
        if (this.circuitBreaker) {
          result = await this.circuitBreaker.execute(() => operation(context))
        } else {
          result = await operation(context)
        }

        return result
      } catch (error) {
        state.errors.push({
          attempt: state.attempt,
          error: error.message || error,
          code: error.code,
          timestamp: Date.now()
        })

        // Check if this is a circuit breaker rejection
        if (error.name === 'CircuitBreakerError') {
          // Don't retry circuit breaker rejections
          throw error
        }

        // Check if we should retry
        const shouldRetry = await options.retryCondition(error, state.attempt, context)

        if (!shouldRetry || state.attempt >= options.maxRetries) {
          throw error
        }

        state.attempt++
      }
    }

    // Should not reach here, but throw last error if we do
    throw state.errors[state.errors.length - 1].error
  }

  /**
   * Default retry condition
   * @param {Error} error - The error that occurred
   * @param {number} attempt - Current attempt number
   * @param {Object} context - Operation context
   * @returns {boolean} - Whether to retry
   */
  defaultRetryCondition (error, attempt, context) {
    // Don't retry if we've been aborted
    if (error.name === 'AbortError') {
      return false
    }

    // Check if error is retryable
    if (error.code && this.retryableErrors.includes(error.code)) {
      return true
    }

    // Check for specific Modbus errors
    if (error.message) {
      const message = error.message.toLowerCase()
      if (message.includes('timeout') ||
          message.includes('connection') ||
          message.includes('network') ||
          message.includes('modbus exception')) {
        return true
      }

      // Don't retry Modbus illegal function errors
      if (message.includes('illegal function') ||
          message.includes('illegal data address') ||
          message.includes('illegal data value')) {
        return false
      }
    }

    return false
  }

  /**
   * Calculate delay for retry attempt
   * @param {number} attempt - Attempt number (1-based)
   * @param {Object} options - Retry options
   * @returns {number} - Delay in milliseconds
   */
  calculateDelay (attempt, options) {
    // Exponential backoff
    let delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1)

    // Apply maximum delay cap
    delay = Math.min(delay, options.maxDelay)

    // Add jitter to prevent thundering herd
    const jitter = delay * this.jitterFactor * (Math.random() * 2 - 1)
    delay = Math.round(delay + jitter)

    return Math.max(0, delay)
  }

  /**
   * Delay execution with abort support
   * @param {number} ms - Milliseconds to delay
   * @param {AbortSignal} abortSignal - Optional abort signal
   * @returns {Promise} - Resolves after delay
   */
  delay (ms, abortSignal) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms)

      if (abortSignal) {
        const abortHandler = () => {
          clearTimeout(timeout)
          reject(new Error('Delay aborted'))
        }

        if (abortSignal.aborted) {
          abortHandler()
        } else {
          abortSignal.addEventListener('abort', abortHandler, { once: true })
        }
      }
    })
  }

  /**
   * Generate unique retry ID
   * @returns {string} - Unique retry ID
   */
  generateRetryId () {
    return `retry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Update average retries statistic
   * @param {number} retries - Number of retries for this operation
   */
  updateAverageRetries (retries) {
    const total = this.statistics.successfulAttempts
    const currentAvg = this.statistics.averageRetries
    this.statistics.averageRetries = (currentAvg * (total - 1) + retries) / total

    // Update average delay time
    if (this.statistics.retriedAttempts > 0) {
      this.statistics.averageDelayTime = this.statistics.totalDelayTime / this.statistics.retriedAttempts
    }
  }

  /**
   * Create a retry policy
   * @param {Object} config - Policy configuration
   * @returns {Object} - Retry policy
   */
  createPolicy (config) {
    return {
      maxRetries: config.maxRetries || this.maxRetries,
      initialDelay: config.initialDelay || this.initialDelay,
      maxDelay: config.maxDelay || this.maxDelay,
      backoffMultiplier: config.backoffMultiplier || this.backoffMultiplier,
      retryCondition: config.retryCondition || this.defaultRetryCondition.bind(this)
    }
  }

  /**
   * Get retry statistics
   * @returns {Object} - Current statistics
   */
  getStatistics () {
    return {
      ...this.statistics,
      activeRetries: this.activeRetries.size,
      successRate: this.statistics.totalAttempts > 0
        ? (this.statistics.successfulAttempts / this.statistics.totalAttempts * 100).toFixed(2) + '%'
        : '0%',
      retryRate: this.statistics.totalAttempts > 0
        ? (this.statistics.retriedAttempts / this.statistics.totalAttempts * 100).toFixed(2) + '%'
        : '0%',
      abortRate: this.statistics.totalAttempts > 0
        ? (this.statistics.abortedAttempts / this.statistics.totalAttempts * 100).toFixed(2) + '%'
        : '0%',
      averageDelayTime: this.statistics.averageDelayTime.toFixed(2) + 'ms'
    }
  }

  /**
   * Cancel active retry operation
   * @param {string} retryId - Retry ID to cancel
   */
  cancelRetry (retryId) {
    const retryState = this.activeRetries.get(retryId)
    if (retryState) {
      this.activeRetries.delete(retryId)
      this.statistics.abortedAttempts++
      this.emit('cancelled', { retryId, attempts: retryState.attempt })
    }
  }

  /**
   * Cancel all active retry operations
   */
  cancelAll () {
    const count = this.activeRetries.size
    for (const [retryId, retryState] of this.activeRetries) {
      this.statistics.abortedAttempts++
      this.emit('cancelled', { retryId, attempts: retryState.attempt })
    }
    this.activeRetries.clear()

    if (count > 0) {
      this.emit('allCancelled', { count })
    }
  }

  /**
   * Clear all active retries
   */
  clearActiveRetries () {
    const count = this.activeRetries.size
    this.activeRetries.clear()

    if (count > 0) {
      this.emit('clearedActiveRetries', { count })
    }
  }

  /**
   * Reset statistics
   */
  resetStatistics () {
    this.statistics = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      retriedAttempts: 0,
      exhaustedRetries: 0,
      averageRetries: 0,
      averageDelayTime: 0,
      totalDelayTime: 0,
      abortedAttempts: 0
    }

    this.emit('statisticsReset')
  }

  /**
   * Set circuit breaker for retry handler
   * @param {Object} circuitBreaker - Circuit breaker instance
   */
  setCircuitBreaker (circuitBreaker) {
    this.circuitBreaker = circuitBreaker
  }

  /**
   * Set abort controller
   * @param {AbortController} controller - Abort controller instance
   */
  setAbortController (controller) {
    this.abortController = controller
  }
}

/**
 * Predefined retry policies
 */
ModbusRetryHandler.Policies = {
  /**
   * Aggressive retry policy for critical operations
   */
  AGGRESSIVE: {
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 60000,
    backoffMultiplier: 2
  },

  /**
   * Standard retry policy for normal operations
   */
  STANDARD: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2
  },

  /**
   * Conservative retry policy for non-critical operations
   */
  CONSERVATIVE: {
    maxRetries: 2,
    initialDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 1.5
  },

  /**
   * No retry policy
   */
  NONE: {
    maxRetries: 0,
    initialDelay: 0,
    maxDelay: 0,
    backoffMultiplier: 1
  }
}

module.exports = { ModbusRetryHandler, RetryError }
