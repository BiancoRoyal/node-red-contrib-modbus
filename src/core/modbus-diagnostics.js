/**
 * Modbus Diagnostics and Monitoring System
 * Provides comprehensive monitoring, metrics collection, and diagnostics
 */

'use strict'

const EventEmitter = require('events')
const os = require('os')

class DiagnosticsAlert {
  constructor (name, message, severity, metrics) {
    this.timestamp = Date.now()
    this.name = name
    this.message = message
    this.severity = severity // 'critical', 'warning', 'info'
    this.metrics = metrics
    this.acknowledged = false
  }
}

class ModbusDiagnostics extends EventEmitter {
  constructor (options = {}) {
    super()

    // Configuration
    this.enableMetrics = options.enableMetrics !== false
    this.enableTracing = options.enableTracing || false
    this.enableHealthCheck = options.enableHealthCheck !== false
    this.metricsInterval = options.metricsInterval || 10000 // 10 seconds
    this.historySize = options.historySize || 1000
    this.alertThresholds = options.alertThresholds || {}
    this.customMetrics = options.customMetrics || {}
    this.exportFormat = options.exportFormat || 'json' // json, prometheus, influx

    // Metrics storage
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        timeout: 0,
        rate: 0,
        averageResponseTime: 0
      },
      connections: {
        active: 0,
        idle: 0,
        failed: 0,
        reconnects: 0,
        totalUptime: 0,
        totalDowntime: 0
      },
      errors: {
        byType: new Map(),
        byDevice: new Map(),
        recent: []
      },
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        queueLength: 0,
        throughput: 0
      },
      devices: new Map(), // Device-specific metrics
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        loadAverage: [0, 0, 0],
        uptime: 0
      },
      custom: {} // Custom metrics from external sources
    }

    // Historical data
    this.history = {
      requests: [],
      errors: [],
      performance: [],
      connections: []
    }

    // Tracing data
    this.traces = []
    this.traceIdCounter = 0

    // Alert system
    this.alerts = []
    this.alertHistory = []
    this.alertRules = this.initializeAlertRules()
    this.alertSubscribers = new Set()

    // Integration points
    this.circuitBreaker = null
    this.connectionPool = null
    this.retryHandler = null

    // Start metrics collection
    if (this.enableMetrics) {
      this.startMetricsCollection()
    }
  }

  /**
   * Record a request
   * @param {Object} request - Request details
   * @returns {string} - Trace ID for this request
   */
  recordRequest (request) {
    const traceId = this.generateTraceId()
    const timestamp = Date.now()

    const requestRecord = {
      traceId,
      timestamp,
      device: request.device || 'unknown',
      functionCode: request.functionCode,
      address: request.address,
      quantity: request.quantity,
      unitId: request.unitId
    }

    // Update metrics
    this.metrics.requests.total++

    // Store in history
    this.addToHistory('requests', requestRecord)

    // Start trace if enabled
    if (this.enableTracing) {
      this.startTrace(traceId, requestRecord)
    }

    return traceId
  }

  /**
   * Record a response
   * @param {string} traceId - Trace ID from the request
   * @param {Object} response - Response details
   */
  recordResponse (traceId, response) {
    const timestamp = Date.now()

    // Find the original request
    const request = this.history.requests.find(r => r.traceId === traceId)
    if (request) {
      const responseTime = timestamp - request.timestamp

      // Update metrics
      if (response.success) {
        this.metrics.requests.successful++
        this.updateAverageResponseTime(responseTime)

        // Update device-specific metrics
        this.updateDeviceMetrics(request.device, {
          successfulRequests: 1,
          responseTime
        })
      } else {
        this.metrics.requests.failed++
        this.recordError({
          traceId,
          device: request.device,
          error: response.error,
          timestamp
        })
      }

      // Complete trace if enabled
      if (this.enableTracing) {
        this.completeTrace(traceId, response, responseTime)
      }
    }

    // Check for alerts
    this.checkAlerts()
  }

  /**
   * Record an error
   * @param {Object} error - Error details
   */
  recordError (error) {
    const timestamp = error.timestamp || Date.now()

    const errorRecord = {
      timestamp,
      device: error.device || 'unknown',
      type: error.error?.code || 'UNKNOWN',
      message: error.error?.message || 'Unknown error',
      traceId: error.traceId
    }

    // Update error metrics
    const errorType = errorRecord.type
    this.metrics.errors.byType.set(
      errorType,
      (this.metrics.errors.byType.get(errorType) || 0) + 1
    )

    const deviceErrors = this.metrics.errors.byDevice.get(errorRecord.device) || 0
    this.metrics.errors.byDevice.set(errorRecord.device, deviceErrors + 1)

    // Add to recent errors
    this.metrics.errors.recent.unshift(errorRecord)
    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent.pop()
    }

    // Store in history
    this.addToHistory('errors', errorRecord)

    this.emit('error', errorRecord)
  }

  /**
   * Record connection status change
   * @param {Object} status - Connection status
   */
  recordConnectionStatus (status) {
    const timestamp = Date.now()

    const statusRecord = {
      timestamp,
      device: status.device,
      state: status.state,
      reason: status.reason
    }

    // Update connection metrics
    if (status.state === 'connected') {
      this.metrics.connections.active++
      if (this.metrics.connections.active > 0 && this.metrics.connections.idle > 0) {
        this.metrics.connections.idle--
      }
    } else if (status.state === 'disconnected') {
      if (this.metrics.connections.active > 0) {
        this.metrics.connections.active--
      }
      this.metrics.connections.idle++
    } else if (status.state === 'failed') {
      this.metrics.connections.failed++
    } else if (status.state === 'reconnecting') {
      this.metrics.connections.reconnects++
    }

    // Store in history
    this.addToHistory('connections', statusRecord)

    // Update device-specific metrics
    this.updateDeviceMetrics(status.device, {
      connectionState: status.state,
      lastConnectionChange: timestamp
    })

    this.emit('connectionStatus', statusRecord)
  }

  /**
   * Update average response time
   * @param {number} responseTime - Response time in milliseconds
   */
  updateAverageResponseTime (responseTime) {
    const total = this.metrics.requests.successful
    const currentAvg = this.metrics.requests.averageResponseTime
    this.metrics.requests.averageResponseTime =
      (currentAvg * (total - 1) + responseTime) / total
  }

  /**
   * Update device-specific metrics
   * @param {string} deviceId - Device identifier
   * @param {Object} updates - Metrics to update
   */
  updateDeviceMetrics (deviceId, updates) {
    if (!this.metrics.devices.has(deviceId)) {
      this.metrics.devices.set(deviceId, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastSeen: Date.now(),
        connectionState: 'unknown',
        errors: 0
      })
    }

    const deviceMetrics = this.metrics.devices.get(deviceId)

    if (updates.successfulRequests) {
      deviceMetrics.successfulRequests += updates.successfulRequests
      deviceMetrics.totalRequests++
    }

    if (updates.failedRequests) {
      deviceMetrics.failedRequests += updates.failedRequests
      deviceMetrics.totalRequests++
      deviceMetrics.errors++
    }

    if (updates.responseTime) {
      const total = deviceMetrics.successfulRequests
      const currentAvg = deviceMetrics.averageResponseTime
      deviceMetrics.averageResponseTime =
        (currentAvg * (total - 1) + updates.responseTime) / total
    }

    if (updates.connectionState) {
      deviceMetrics.connectionState = updates.connectionState
    }

    deviceMetrics.lastSeen = Date.now()
  }

  /**
   * Start a trace
   * @param {string} traceId - Trace ID
   * @param {Object} request - Request details
   */
  startTrace (traceId, request) {
    if (!this.enableTracing) return

    const trace = {
      traceId,
      startTime: Date.now(),
      request,
      events: [],
      response: null,
      duration: null
    }

    this.traces.push(trace)

    // Limit trace storage
    if (this.traces.length > this.historySize) {
      this.traces.shift()
    }
  }

  /**
   * Add event to trace
   * @param {string} traceId - Trace ID
   * @param {Object} event - Event details
   */
  addTraceEvent (traceId, event) {
    if (!this.enableTracing) return

    const trace = this.traces.find(t => t.traceId === traceId)
    if (trace) {
      trace.events.push({
        timestamp: Date.now(),
        type: event.type,
        details: event.details
      })
    }
  }

  /**
   * Complete a trace
   * @param {string} traceId - Trace ID
   * @param {Object} response - Response details
   * @param {number} duration - Duration in milliseconds
   */
  completeTrace (traceId, response, duration) {
    if (!this.enableTracing) return

    const trace = this.traces.find(t => t.traceId === traceId)
    if (trace) {
      trace.response = response
      trace.duration = duration
      trace.endTime = Date.now()
    }
  }

  /**
   * Initialize alert rules
   * @returns {Array} - Alert rules
   */
  initializeAlertRules () {
    return [
      {
        name: 'High Error Rate',
        severity: 'critical',
        condition: () => {
          const errorRate = this.getErrorRate()
          return errorRate > (this.alertThresholds.errorRate || 10)
        },
        message: () => `Error rate (${this.getErrorRate().toFixed(2)}%) exceeded threshold`
      },
      {
        name: 'Slow Response Time',
        severity: 'warning',
        condition: () => {
          const avgResponseTime = this.metrics.requests.averageResponseTime
          return avgResponseTime > (this.alertThresholds.responseTime || 5000)
        },
        message: () => `Average response time (${this.metrics.requests.averageResponseTime.toFixed(0)}ms) exceeded threshold`
      },
      {
        name: 'Connection Failures',
        severity: 'critical',
        condition: () => {
          const failureRate = this.getConnectionFailureRate()
          return failureRate > (this.alertThresholds.connectionFailure || 20)
        },
        message: () => `Connection failure rate (${this.getConnectionFailureRate().toFixed(2)}%) exceeded threshold`
      },
      {
        name: 'Queue Buildup',
        severity: 'warning',
        condition: () => {
          const queueLength = this.metrics.performance.queueLength
          return queueLength > (this.alertThresholds.queueLength || 100)
        },
        message: () => `Queue length (${this.metrics.performance.queueLength}) exceeded threshold`
      },
      {
        name: 'High Memory Usage',
        severity: 'warning',
        condition: () => {
          const memUsage = this.metrics.system.memoryUsage
          const totalMem = os.totalmem() / 1024 / 1024 // MB
          const memPercent = (memUsage / totalMem) * 100
          return memPercent > (this.alertThresholds.memoryUsage || 80)
        },
        message: () => {
          const memUsage = this.metrics.system.memoryUsage
          const totalMem = os.totalmem() / 1024 / 1024
          const memPercent = (memUsage / totalMem) * 100
          return `Memory usage (${memPercent.toFixed(2)}%) exceeded threshold`
        }
      },
      {
        name: 'Circuit Breaker Open',
        severity: 'critical',
        condition: () => {
          return this.circuitBreaker && this.circuitBreaker.state === 'OPEN'
        },
        message: () => 'Circuit breaker is OPEN - requests are being rejected'
      }
    ]
  }

  /**
   * Check for alerts
   */
  checkAlerts () {
    const activeAlerts = new Set(this.alerts.map(a => a.name))

    for (const rule of this.alertRules) {
      const isTriggered = rule.condition()
      const alertName = rule.name
      const wasActive = activeAlerts.has(alertName)

      if (isTriggered && !wasActive) {
        // New alert triggered
        const alert = new DiagnosticsAlert(
          rule.name,
          typeof rule.message === 'function' ? rule.message() : rule.message,
          rule.severity || 'info',
          this.getSnapshot()
        )

        this.alerts.push(alert)
        this.alertHistory.push(alert)
        this.emit('alert', alert)
        this.notifySubscribers(alert)

        // Limit alert storage
        if (this.alerts.length > 100) {
          this.alerts.shift()
        }
        if (this.alertHistory.length > 1000) {
          this.alertHistory.shift()
        }
      } else if (!isTriggered && wasActive) {
        // Alert resolved
        const alertIndex = this.alerts.findIndex(a => a.name === alertName)
        if (alertIndex !== -1) {
          const resolvedAlert = this.alerts.splice(alertIndex, 1)[0]
          this.emit('alertResolved', {
            alert: resolvedAlert,
            duration: Date.now() - resolvedAlert.timestamp
          })
        }
      }
    }
  }

  /**
   * Get error rate
   * @returns {number} - Error rate as percentage
   */
  getErrorRate () {
    const total = this.metrics.requests.total
    if (total === 0) return 0

    return (this.metrics.requests.failed / total) * 100
  }

  /**
   * Get connection failure rate
   * @returns {number} - Connection failure rate as percentage
   */
  getConnectionFailureRate () {
    const total = this.metrics.connections.active +
                  this.metrics.connections.idle +
                  this.metrics.connections.failed

    if (total === 0) return 0

    return (this.metrics.connections.failed / total) * 100
  }

  /**
   * Add to history
   * @param {string} type - History type
   * @param {Object} record - Record to add
   */
  addToHistory (type, record) {
    if (!this.history[type]) return

    this.history[type].push(record)

    // Limit history size
    if (this.history[type].length > this.historySize) {
      this.history[type].shift()
    }
  }

  /**
   * Generate trace ID
   * @returns {string} - Unique trace ID
   */
  generateTraceId () {
    return `trace-${Date.now()}-${++this.traceIdCounter}`
  }

  /**
   * Start metrics collection
   */
  startMetricsCollection () {
    this.metricsTimer = setInterval(() => {
      this.collectPerformanceMetrics()
      this.calculateRates()
      this.emit('metrics', this.getSnapshot())
    }, this.metricsInterval)
  }

  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics () {
    // System metrics
    const cpuUsage = process.cpuUsage()
    this.metrics.system.cpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000 // seconds

    const memUsage = process.memoryUsage()
    this.metrics.system.memoryUsage = memUsage.heapUsed / 1024 / 1024 // MB
    this.metrics.performance.memoryUsage = this.metrics.system.memoryUsage

    this.metrics.system.loadAverage = os.loadavg()
    this.metrics.system.uptime = process.uptime()

    // Collect metrics from integrated components
    this.collectIntegratedMetrics()

    // Calculate throughput
    const requests = this.metrics.requests.total
    const timespan = this.metricsInterval / 1000 // Convert to seconds
    this.metrics.performance.throughput = requests / timespan

    // Store in history
    this.addToHistory('performance', {
      timestamp: Date.now(),
      ...this.metrics.performance
    })
  }

  /**
   * Calculate request rates
   */
  calculateRates () {
    const recentRequests = this.history.requests.filter(
      r => r.timestamp > Date.now() - 60000 // Last minute
    )

    this.metrics.requests.rate = recentRequests.length / 60 // Requests per second
  }

  /**
   * Get current metrics snapshot
   * @returns {Object} - Current metrics
   */
  getSnapshot () {
    const snapshot = {
      timestamp: Date.now(),
      requests: { ...this.metrics.requests },
      connections: { ...this.metrics.connections },
      errors: {
        total: Array.from(this.metrics.errors.byType.values())
          .reduce((sum, count) => sum + count, 0),
        byType: Object.fromEntries(this.metrics.errors.byType),
        recent: this.metrics.errors.recent.slice(0, 10)
      },
      performance: { ...this.metrics.performance },
      system: { ...this.metrics.system },
      devices: Array.from(this.metrics.devices.entries()).map(([id, metrics]) => ({
        id,
        ...metrics
      })),
      custom: { ...this.metrics.custom }
    }

    // Add integrated component metrics if available
    if (this.circuitBreaker) {
      snapshot.circuitBreaker = this.circuitBreaker.getStatus()
    }
    if (this.connectionPool) {
      snapshot.connectionPool = this.connectionPool.getStatistics()
    }
    if (this.retryHandler) {
      snapshot.retryHandler = this.retryHandler.getStatistics()
    }

    return snapshot
  }

  /**
   * Get diagnostics report
   * @returns {Object} - Comprehensive diagnostics report
   */
  getReport () {
    return {
      summary: {
        uptime: process.uptime(),
        totalRequests: this.metrics.requests.total,
        successRate: this.metrics.requests.total > 0
          ? (this.metrics.requests.successful / this.metrics.requests.total * 100).toFixed(2) + '%'
          : '0%',
        errorRate: this.getErrorRate().toFixed(2) + '%',
        averageResponseTime: this.metrics.requests.averageResponseTime.toFixed(2) + 'ms',
        activeConnections: this.metrics.connections.active,
        alertsActive: this.alerts.filter(a => a.timestamp > Date.now() - 300000).length
      },
      metrics: this.getSnapshot(),
      recentErrors: this.metrics.errors.recent.slice(0, 20),
      activeAlerts: this.alerts.filter(a => a.timestamp > Date.now() - 300000),
      deviceHealth: this.getDeviceHealthReport(),
      traces: this.enableTracing ? this.traces.slice(-20) : []
    }
  }

  /**
   * Get device health report
   * @returns {Array} - Device health status
   */
  getDeviceHealthReport () {
    return Array.from(this.metrics.devices.entries()).map(([id, metrics]) => {
      const successRate = metrics.totalRequests > 0
        ? (metrics.successfulRequests / metrics.totalRequests * 100)
        : 0

      return {
        id,
        status: this.getDeviceHealthStatus(successRate, metrics),
        successRate: successRate.toFixed(2) + '%',
        averageResponseTime: metrics.averageResponseTime.toFixed(2) + 'ms',
        lastSeen: new Date(metrics.lastSeen).toISOString(),
        connectionState: metrics.connectionState
      }
    })
  }

  /**
   * Get device health status
   * @param {number} successRate - Success rate percentage
   * @param {Object} metrics - Device metrics
   * @returns {string} - Health status
   */
  getDeviceHealthStatus (successRate, metrics) {
    if (metrics.connectionState === 'disconnected') return 'offline'
    if (successRate >= 95) return 'healthy'
    if (successRate >= 80) return 'degraded'
    return 'unhealthy'
  }

  /**
   * Collect metrics from integrated components
   */
  collectIntegratedMetrics () {
    if (this.circuitBreaker) {
      const cbStatus = this.circuitBreaker.getStatus()
      this.metrics.custom.circuitBreakerState = cbStatus.state
      this.metrics.custom.circuitBreakerFailureRate = cbStatus.metrics.failureRate
    }

    if (this.connectionPool) {
      const poolStats = this.connectionPool.getStatistics()
      this.metrics.custom.poolActiveConnections = poolStats.currentActiveConnections
      this.metrics.custom.poolQueueLength = poolStats.queueLength
    }

    if (this.retryHandler) {
      const retryStats = this.retryHandler.getStatistics()
      this.metrics.custom.retrySuccessRate = parseFloat(retryStats.successRate)
      this.metrics.custom.retryActiveOperations = retryStats.activeRetries
    }
  }

  /**
   * Export metrics in specified format
   * @param {string} format - Export format (json, prometheus, influx)
   * @returns {string} - Formatted metrics
   */
  exportMetrics (format) {
    const snapshot = this.getSnapshot()

    switch (format || this.exportFormat) {
      case 'prometheus':
        return this.formatPrometheus(snapshot)
      case 'influx':
        return this.formatInflux(snapshot)
      default:
        return JSON.stringify(snapshot, null, 2)
    }
  }

  /**
   * Format metrics for Prometheus
   * @param {Object} snapshot - Metrics snapshot
   * @returns {string} - Prometheus formatted metrics
   */
  formatPrometheus (snapshot) {
    const lines = []
    const prefix = 'modbus_'

    // Request metrics
    lines.push(`${prefix}requests_total ${snapshot.requests.total}`)
    lines.push(`${prefix}requests_successful ${snapshot.requests.successful}`)
    lines.push(`${prefix}requests_failed ${snapshot.requests.failed}`)
    lines.push(`${prefix}response_time_avg ${snapshot.requests.averageResponseTime}`)

    // Connection metrics
    lines.push(`${prefix}connections_active ${snapshot.connections.active}`)
    lines.push(`${prefix}connections_failed ${snapshot.connections.failed}`)

    // System metrics
    lines.push(`${prefix}memory_usage_mb ${snapshot.system.memoryUsage}`)
    lines.push(`${prefix}cpu_usage_seconds ${snapshot.system.cpuUsage}`)
    lines.push(`${prefix}uptime_seconds ${snapshot.system.uptime}`)

    return lines.join('\n')
  }

  /**
   * Format metrics for InfluxDB
   * @param {Object} snapshot - Metrics snapshot
   * @returns {string} - InfluxDB line protocol
   */
  formatInflux (snapshot) {
    const measurement = 'modbus_metrics'
    const tags = []
    const fields = []

    // Add fields
    fields.push(`requests_total=${snapshot.requests.total}i`)
    fields.push(`requests_successful=${snapshot.requests.successful}i`)
    fields.push(`requests_failed=${snapshot.requests.failed}i`)
    fields.push(`response_time_avg=${snapshot.requests.averageResponseTime}`)
    fields.push(`connections_active=${snapshot.connections.active}i`)
    fields.push(`memory_usage=${snapshot.system.memoryUsage}`)

    return `${measurement}${tags.length > 0 ? ',' + tags.join(',') : ''} ${fields.join(',')} ${snapshot.timestamp}`
  }

  /**
   * Subscribe to alerts
   * @param {Function} callback - Alert callback
   * @returns {Function} - Unsubscribe function
   */
  subscribeToAlerts (callback) {
    this.alertSubscribers.add(callback)
    return () => this.alertSubscribers.delete(callback)
  }

  /**
   * Notify alert subscribers
   * @param {Object} alert - Alert object
   */
  notifySubscribers (alert) {
    for (const subscriber of this.alertSubscribers) {
      try {
        subscriber(alert)
      } catch (error) {
        this.emit('error', { error, context: 'alert notification' })
      }
    }
  }

  /**
   * Acknowledge an alert
   * @param {string} alertName - Name of alert to acknowledge
   */
  acknowledgeAlert (alertName) {
    const alert = this.alerts.find(a => a.name === alertName)
    if (alert) {
      alert.acknowledged = true
      this.emit('alertAcknowledged', alert)
    }
  }

  /**
   * Set integration components
   * @param {Object} components - Integration components
   */
  setIntegrations (components) {
    if (components.circuitBreaker) {
      this.circuitBreaker = components.circuitBreaker
    }
    if (components.connectionPool) {
      this.connectionPool = components.connectionPool
    }
    if (components.retryHandler) {
      this.retryHandler = components.retryHandler
    }
  }

  /**
   * Register custom metric
   * @param {string} name - Metric name
   * @param {Function} collector - Metric collector function
   */
  registerCustomMetric (name, collector) {
    this.customMetrics[name] = collector
  }

  /**
   * Collect custom metrics
   */
  collectCustomMetrics () {
    for (const [name, collector] of Object.entries(this.customMetrics)) {
      try {
        this.metrics.custom[name] = collector()
      } catch (error) {
        this.emit('error', { error, metric: name })
      }
    }
  }

  /**
   * Clear all metrics and history
   */
  clear () {
    // Clear metrics
    this.metrics.requests = {
      total: 0,
      successful: 0,
      failed: 0,
      timeout: 0,
      rate: 0,
      averageResponseTime: 0
    }

    this.metrics.connections = {
      active: 0,
      idle: 0,
      failed: 0,
      reconnects: 0,
      totalUptime: 0,
      totalDowntime: 0
    }

    this.metrics.errors.byType.clear()
    this.metrics.errors.byDevice.clear()
    this.metrics.errors.recent = []

    this.metrics.devices.clear()

    // Clear history
    this.history.requests = []
    this.history.errors = []
    this.history.performance = []
    this.history.connections = []

    // Clear traces and alerts
    this.traces = []
    this.alerts = []

    // Stop timers
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer)
    }

    this.emit('cleared')
  }
}

module.exports = { ModbusDiagnostics, DiagnosticsAlert }
