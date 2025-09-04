/**
 * Global timeout fix for all tests
 * Prevents tests from hanging indefinitely
 */

const GLOBAL_TIMEOUT = 5000 // 5 seconds max per operation
const activeTimers = new Set()
const activePromises = new Map()

// Override setTimeout to track and limit timeouts
const originalSetTimeout = global.setTimeout
global.setTimeout = function (fn, delay, ...args) {
  // Cap all timeouts to GLOBAL_TIMEOUT
  const cappedDelay = Math.min(delay || 0, GLOBAL_TIMEOUT)

  const wrappedFn = function (...cbArgs) {
    try {
      const result = fn.apply(this, cbArgs)
      activeTimers.delete(timerId)
      return result
    } catch (err) {
      console.error('Error in timeout callback:', err.message)
      activeTimers.delete(timerId)
      throw err
    }
  }

  const timerId = originalSetTimeout(wrappedFn, cappedDelay, ...args)
  activeTimers.add(timerId)

  // Auto-clear after max timeout
  originalSetTimeout(() => {
    if (activeTimers.has(timerId)) {
      clearTimeout(timerId)
      activeTimers.delete(timerId)
    }
  }, GLOBAL_TIMEOUT + 1000)

  return timerId
}

// Don't override Promise globally as it causes issues
// Just export helpers for test use
const OriginalPromise = global.Promise

class TimeoutPromise extends OriginalPromise {
  constructor (executor) {
    super((resolve, reject) => {
      const promiseId = Math.random().toString(36).substr(2)
      let isSettled = false

      const timeoutId = originalSetTimeout(() => {
        if (!isSettled) {
          isSettled = true
          activePromises.delete(promiseId)
          reject(new Error(`Promise timeout after ${GLOBAL_TIMEOUT}ms`))
        }
      }, GLOBAL_TIMEOUT)

      activePromises.set(promiseId, timeoutId)

      const wrappedResolve = (value) => {
        if (!isSettled) {
          isSettled = true
          clearTimeout(timeoutId)
          activePromises.delete(promiseId)
          resolve(value)
        }
      }

      const wrappedReject = (reason) => {
        if (!isSettled) {
          isSettled = true
          clearTimeout(timeoutId)
          activePromises.delete(promiseId)
          reject(reason)
        }
      }

      try {
        executor(wrappedResolve, wrappedReject)
      } catch (err) {
        wrappedReject(err)
      }
    })
  }

  static resolve (value) {
    return OriginalPromise.resolve(value)
  }

  static reject (reason) {
    return OriginalPromise.reject(reason)
  }

  static all (promises) {
    return OriginalPromise.all(promises)
  }

  static race (promises) {
    return OriginalPromise.race(promises)
  }
}

// Clean up on exit
process.on('exit', () => {
  // Clear all active timers
  activeTimers.forEach(timerId => {
    try {
      clearTimeout(timerId)
    } catch (e) {}
  })
  activeTimers.clear()

  // Clear all promise timeouts
  activePromises.forEach(timeoutId => {
    try {
      clearTimeout(timeoutId)
    } catch (e) {}
  })
  activePromises.clear()
})

module.exports = {
  GLOBAL_TIMEOUT,
  TimeoutPromise,
  getActiveTimers: () => activeTimers.size,
  getActivePromises: () => activePromises.size,
  clearAll: () => {
    activeTimers.forEach(t => clearTimeout(t))
    activeTimers.clear()
    activePromises.forEach(t => clearTimeout(t))
    activePromises.clear()
  }
}
