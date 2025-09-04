/**
 * Modbus Testable Core
 * Refactored core functionality with better testability
 */

'use strict'

/**
 * Queue Manager for Modbus commands
 */
class ModbusQueueManager {
  constructor () {
    this.queues = new Map()
    this.maxQueueSize = 100
  }

  /**
   * Add command to queue for specific unit
   */
  addToQueue (unitId, command) {
    if (!this.queues.has(unitId)) {
      this.queues.set(unitId, [])
    }

    const queue = this.queues.get(unitId)
    if (queue.length >= this.maxQueueSize) {
      throw new Error(`Queue full for unit ${unitId}`)
    }

    queue.push(command)
    return queue.length
  }

  /**
   * Get next command from queue
   */
  getNext (unitId) {
    const queue = this.queues.get(unitId)
    if (!queue || queue.length === 0) {
      return null
    }

    return queue.shift()
  }

  /**
   * Get queue size for unit
   */
  getQueueSize (unitId) {
    const queue = this.queues.get(unitId)
    return queue ? queue.length : 0
  }

  /**
   * Clear queue for unit
   */
  clearQueue (unitId) {
    if (unitId === undefined) {
      this.queues.clear()
    } else {
      this.queues.delete(unitId)
    }
  }

  /**
   * Get all unit IDs with pending commands
   */
  getActiveUnits () {
    return Array.from(this.queues.keys()).filter(
      unitId => this.queues.get(unitId).length > 0
    )
  }
}

/**
 * Connection State Manager
 */
class ModbusStateManager {
  constructor () {
    this.states = new Map()
    this.validStates = [
      'init',
      'connecting',
      'connected',
      'activated',
      'queueing',
      'sending',
      'reading',
      'writing',
      'empty',
      'closed',
      'failed',
      'broken'
    ]
    this.validTransitions = {
      init: ['connecting', 'failed', 'closed'],
      connecting: ['connected', 'failed', 'closed'],
      connected: ['activated', 'failed', 'closed'],
      activated: ['queueing', 'reading', 'writing', 'closed'],
      queueing: ['sending', 'empty', 'closed'],
      sending: ['activated', 'queueing', 'failed', 'closed'],
      reading: ['activated', 'failed', 'closed'],
      writing: ['activated', 'failed', 'closed'],
      empty: ['activated', 'closed'],
      closed: ['init'],
      failed: ['broken', 'init', 'closed'],
      broken: ['init', 'closed']
    }
  }

  /**
   * Get current state for connection
   */
  getState (connectionId) {
    return this.states.get(connectionId) || 'init'
  }

  /**
   * Set state for connection
   */
  setState (connectionId, newState) {
    const currentState = this.getState(connectionId)

    if (!this.validStates.includes(newState)) {
      throw new Error(`Invalid state: ${newState}`)
    }

    if (!this.isValidTransition(currentState, newState)) {
      throw new Error(`Invalid transition from ${currentState} to ${newState}`)
    }

    this.states.set(connectionId, newState)
    return newState
  }

  /**
   * Check if transition is valid
   */
  isValidTransition (fromState, toState) {
    if (fromState === toState) return true

    const allowedTransitions = this.validTransitions[fromState]
    return allowedTransitions && allowedTransitions.includes(toState)
  }

  /**
   * Check if connection is in active state
   */
  isActive (connectionId) {
    const state = this.getState(connectionId)
    return ['connected', 'activated', 'queueing', 'sending', 'reading', 'writing'].includes(state)
  }

  /**
   * Check if connection is ready to send
   */
  isReadyToSend (connectionId) {
    const state = this.getState(connectionId)
    return ['activated', 'queueing'].includes(state)
  }

  /**
   * Reset connection state
   */
  reset (connectionId) {
    this.states.set(connectionId, 'init')
  }

  /**
   * Remove connection from state tracking
   */
  remove (connectionId) {
    this.states.delete(connectionId)
  }
}

/**
 * Message Builder for Modbus operations
 */
class ModbusMessageBuilder {
  /**
   * Build read request message
   */
  static buildReadRequest (fc, address, quantity, unitId) {
    if (!Number.isInteger(fc) || fc < 1 || fc > 4) {
      throw new Error('Invalid function code for read operation')
    }

    if (!Number.isInteger(address) || address < 0 || address > 65535) {
      throw new Error('Invalid address')
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 2000) {
      throw new Error('Invalid quantity')
    }

    return {
      fc,
      address,
      quantity,
      unitId: unitId || 1,
      timestamp: Date.now()
    }
  }

  /**
   * Build write request message
   */
  static buildWriteRequest (fc, address, value, unitId) {
    if (![5, 6, 15, 16].includes(fc)) {
      throw new Error('Invalid function code for write operation')
    }

    if (!Number.isInteger(address) || address < 0 || address > 65535) {
      throw new Error('Invalid address')
    }

    // Validate value based on function code
    if (fc === 5) {
      // Write single coil
      if (typeof value !== 'boolean') {
        throw new Error('Value must be boolean for FC5')
      }
    } else if (fc === 6) {
      // Write single register
      if (!Number.isInteger(value) || value < 0 || value > 65535) {
        throw new Error('Value must be 16-bit integer for FC6')
      }
    } else if (fc === 15) {
      // Write multiple coils
      if (!Array.isArray(value) || !value.every(v => typeof v === 'boolean')) {
        throw new Error('Value must be array of booleans for FC15')
      }
    } else if (fc === 16) {
      // Write multiple registers
      if (!Array.isArray(value) || !value.every(v => Number.isInteger(v) && v >= 0 && v <= 65535)) {
        throw new Error('Value must be array of 16-bit integers for FC16')
      }
    }

    return {
      fc,
      address,
      value,
      unitId: unitId || 1,
      timestamp: Date.now()
    }
  }

  /**
   * Parse response message
   */
  static parseResponse (buffer, fc) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Response must be a Buffer')
    }

    const response = {
      fc,
      timestamp: Date.now(),
      data: null,
      buffer
    }

    // Parse based on function code
    switch (fc) {
      case 1: // Read coils
      case 2: // Read discrete inputs
        response.data = this.parseBooleanData(buffer)
        break

      case 3: // Read holding registers
      case 4: // Read input registers
        response.data = this.parseRegisterData(buffer)
        break

      case 5: // Write single coil
      case 6: // Write single register
      case 15: // Write multiple coils
      case 16: // Write multiple registers
        response.data = { success: true }
        break

      default:
        throw new Error(`Unsupported function code: ${fc}`)
    }

    return response
  }

  /**
   * Parse boolean data from buffer
   */
  static parseBooleanData (buffer) {
    const data = []
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i]
      for (let bit = 0; bit < 8; bit++) {
        data.push((byte & (1 << bit)) !== 0)
      }
    }
    return data
  }

  /**
   * Parse register data from buffer
   */
  static parseRegisterData (buffer) {
    const data = []
    for (let i = 0; i < buffer.length; i += 2) {
      data.push(buffer.readUInt16BE(i))
    }
    return data
  }
}

/**
 * Error Handler for Modbus operations
 */
class ModbusErrorHandler {
  static errorCodes = {
    1: 'Illegal Function',
    2: 'Illegal Data Address',
    3: 'Illegal Data Value',
    4: 'Server Device Failure',
    5: 'Acknowledge',
    6: 'Server Device Busy',
    7: 'Negative Acknowledge',
    8: 'Memory Parity Error',
    10: 'Gateway Path Unavailable',
    11: 'Gateway Target Device Failed to Respond'
  }

  /**
   * Create error from Modbus exception
   */
  static createModbusError (code, context) {
    const message = this.errorCodes[code] || `Unknown Modbus error code: ${code}`
    const error = new Error(message)
    error.code = code
    error.modbusCode = code
    error.context = context
    return error
  }

  /**
   * Create timeout error
   */
  static createTimeoutError (operation, timeout) {
    const error = new Error(`Modbus operation timeout: ${operation} (${timeout}ms)`)
    error.code = 'ETIMEDOUT'
    error.timeout = timeout
    error.operation = operation
    return error
  }

  /**
   * Create connection error
   */
  static createConnectionError (reason) {
    const error = new Error(`Modbus connection error: ${reason}`)
    error.code = 'ECONNREFUSED'
    error.reason = reason
    return error
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverable (error) {
    if (!error) return false

    // Timeout errors are recoverable
    if (error.code === 'ETIMEDOUT') return true

    // Some Modbus errors are recoverable
    if (error.modbusCode && [5, 6].includes(error.modbusCode)) return true

    // Connection errors might be recoverable
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') return true

    return false
  }
}

/**
 * Metrics Collector for monitoring
 */
class ModbusMetrics {
  constructor () {
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      timeouts: 0,
      avgResponseTime: 0,
      responseTimes: []
    }
    this.maxSamples = 100
  }

  /**
   * Record request
   */
  recordRequest () {
    this.metrics.requests++
    return Date.now()
  }

  /**
   * Record response
   */
  recordResponse (startTime) {
    this.metrics.responses++
    const responseTime = Date.now() - startTime

    this.metrics.responseTimes.push(responseTime)
    if (this.metrics.responseTimes.length > this.maxSamples) {
      this.metrics.responseTimes.shift()
    }

    this.updateAverageResponseTime()
    return responseTime
  }

  /**
   * Record error
   */
  recordError (error) {
    this.metrics.errors++
    if (error && error.code === 'ETIMEDOUT') {
      this.metrics.timeouts++
    }
  }

  /**
   * Update average response time
   */
  updateAverageResponseTime () {
    if (this.metrics.responseTimes.length === 0) {
      this.metrics.avgResponseTime = 0
    } else {
      const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0)
      this.metrics.avgResponseTime = Math.round(sum / this.metrics.responseTimes.length)
    }
  }

  /**
   * Get success rate
   */
  getSuccessRate () {
    if (this.metrics.requests === 0) return 100
    return Math.round((this.metrics.responses / this.metrics.requests) * 100)
  }

  /**
   * Get current metrics
   */
  getMetrics () {
    return {
      ...this.metrics,
      successRate: this.getSuccessRate()
    }
  }

  /**
   * Reset metrics
   */
  reset () {
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      timeouts: 0,
      avgResponseTime: 0,
      responseTimes: []
    }
  }
}

module.exports = {
  ModbusQueueManager,
  ModbusStateManager,
  ModbusMessageBuilder,
  ModbusErrorHandler,
  ModbusMetrics
}
