/**
 * Winston logger configuration for node-red-contrib-modbus
 * Replaces the debug package for enhanced security and features
 */

const winston = require('winston')

// Create custom format for Node-RED compatibility
const nodeRedFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, label, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${label || 'modbus'}] ${level}: ${message}`
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`
    }
    return msg
  })
)

// Create logger factory
class ModbusLoggerFactory {
  constructor () {
    this.loggers = new Map()
    this.defaultLevel = process.env.MODBUS_LOG_LEVEL ||
                        (process.env.DEBUG ? 'debug' : 'info')

    // Parse DEBUG environment variable for compatibility
    this.debugNamespaces = this.parseDebugEnv()
  }

  parseDebugEnv () {
    const debugEnv = process.env.DEBUG || ''
    if (!debugEnv) return []

    return debugEnv.split(',').map(ns => ns.trim())
  }

  shouldEnableDebug (namespace) {
    if (!this.debugNamespaces.length) return false

    // Check if namespace matches any debug pattern
    return this.debugNamespaces.some(pattern => {
      // Support wildcard patterns
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
        return regex.test(namespace)
      }
      return pattern === namespace
    })
  }

  getLogger (namespace) {
    if (!namespace) namespace = 'modbus'

    // Return existing logger if already created
    if (this.loggers.has(namespace)) {
      return this.loggers.get(namespace)
    }

    // Determine log level based on namespace and DEBUG env
    let level = this.defaultLevel
    if (this.shouldEnableDebug(namespace)) {
      level = 'debug'
    }

    // Create new logger instance
    const logger = winston.createLogger({
      level,
      format: nodeRedFormat,
      defaultMeta: { label: namespace },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            nodeRedFormat
          )
        })
      ]
    })

    // Add compatibility layer for debug package
    logger.extend = (subNamespace) => {
      return this.getLogger(`${namespace}:${subNamespace}`)
    }

    // Store and return logger
    this.loggers.set(namespace, logger)
    return logger
  }

  // Create a debug-compatible function
  createDebugFunction (namespace) {
    const logger = this.getLogger(namespace)

    // Return a function that mimics debug package behavior
    const debugFn = function (...args) {
      // Convert arguments to string like debug does
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg)
          } catch (e) {
            return String(arg)
          }
        }
        return String(arg)
      }).join(' ')

      logger.debug(message)
    }

    // Add namespace property for compatibility
    debugFn.namespace = namespace

    // Add extend method for sub-namespaces
    debugFn.extend = (subNamespace) => {
      return this.createDebugFunction(`${namespace}:${subNamespace}`)
    }

    // Add enabled property
    Object.defineProperty(debugFn, 'enabled', {
      get: () => logger.level === 'debug',
      set: (value) => {
        logger.level = value ? 'debug' : 'info'
      }
    })

    return debugFn
  }
}

// Create singleton instance
const loggerFactory = new ModbusLoggerFactory()

// Export factory methods
module.exports = {
  // Get winston logger instance
  getLogger: (namespace) => loggerFactory.getLogger(namespace),

  // Get debug-compatible function
  getDebugLogger: (namespace) => loggerFactory.createDebugFunction(namespace),

  // Direct export for drop-in replacement of require('debug')
  default: (namespace) => loggerFactory.createDebugFunction(namespace)
}

// Support both CommonJS and ES6 imports
module.exports.default.default = module.exports.default
