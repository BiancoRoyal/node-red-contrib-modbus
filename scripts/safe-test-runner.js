#!/usr/bin/env node

/**
 * Safe test runner that prevents hanging and crashes
 * Runs tests with proper timeout and cleanup
 */

const { spawn } = require('child_process')

// Configuration
const TEST_TIMEOUT = 60000 // 60 seconds total timeout
const CLEANUP_TIMEOUT = 5000 // 5 seconds for cleanup

let testProcess = null
let timeoutHandle = null
let cleanupInProgress = false

// Graceful cleanup
function cleanup (exitCode = 0) {
  if (cleanupInProgress) return
  cleanupInProgress = true

  console.log('\n🧹 Cleaning up test process...')

  if (timeoutHandle) {
    clearTimeout(timeoutHandle)
    timeoutHandle = null
  }

  if (testProcess && !testProcess.killed) {
    console.log('Terminating test process...')
    testProcess.kill('SIGTERM')

    // Force kill after timeout
    setTimeout(() => {
      if (testProcess && !testProcess.killed) {
        console.log('Force killing test process...')
        testProcess.kill('SIGKILL')
      }
    }, CLEANUP_TIMEOUT)
  }

  // Exit after cleanup
  setTimeout(() => {
    process.exit(exitCode)
  }, CLEANUP_TIMEOUT + 1000)
}

// Handle signals
process.on('SIGINT', () => {
  console.log('\n⚠️  Interrupted by user')
  cleanup(130)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️  Termination signal received')
  cleanup(143)
})

// Run tests
function runTests (args = []) {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting test runner...')
    console.log(`📋 Command: mocha ${args.join(' ')}`)
    console.log(`⏱️  Timeout: ${TEST_TIMEOUT / 1000} seconds\n`)

    // Spawn mocha process
    testProcess = spawn('npx', ['mocha', ...args], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        FORCE_COLOR: '1'
      }
    })

    // Set timeout
    timeoutHandle = setTimeout(() => {
      console.error('\n❌ Test timeout exceeded!')
      cleanup(1)
    }, TEST_TIMEOUT)

    // Handle process exit
    testProcess.on('exit', (code, signal) => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
        timeoutHandle = null
      }

      if (signal) {
        console.log(`\n⚠️  Test process killed by signal: ${signal}`)
        resolve(1)
      } else if (code === 0) {
        console.log('\n✅ Tests completed successfully!')
        resolve(0)
      } else {
        console.log(`\n❌ Tests failed with exit code: ${code}`)
        resolve(code || 1)
      }
    })

    // Handle errors
    testProcess.on('error', (err) => {
      console.error('\n❌ Failed to start test process:', err.message)
      cleanup(1)
    })
  })
}

// Parse arguments
function parseArgs () {
  const args = process.argv.slice(2)

  // Default arguments
  const defaultArgs = [
    '--timeout', '5000',
    '--exit',
    '--bail'
  ]

  // Determine test target
  if (args.length === 0) {
    // Run unit tests by default
    return [...defaultArgs, 'test/units/*.js']
  } else if (args[0] === 'all') {
    // Run all tests
    return [...defaultArgs, 'test/**/*.js']
  } else if (args[0] === 'units') {
    // Run unit tests
    return [...defaultArgs, 'test/units/*.js']
  } else if (args[0] === 'e2e') {
    // Run e2e tests
    return [...defaultArgs, 'test/e2e/*.js']
  } else if (args[0] === 'core') {
    // Run core tests
    return [...defaultArgs, 'test/core/*.js']
  } else {
    // Pass through custom arguments
    return [...defaultArgs, ...args]
  }
}

// Main execution
async function main () {
  const args = parseArgs()

  try {
    const exitCode = await runTests(args)
    cleanup(exitCode)
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    cleanup(1)
  }
}

// Run
main()
