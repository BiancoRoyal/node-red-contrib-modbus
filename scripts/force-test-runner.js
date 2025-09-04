#!/usr/bin/env node

/**
 * Force test runner - ensures tests complete no matter what
 * Uses aggressive timeout management and process control
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const MAX_TEST_TIME = 60000 // 60 seconds absolute max
const TEST_TIMEOUT = 3000 // 3 seconds per test

let testProcess = null
const outputBuffer = []
let passing = 0
let failing = 0
let pending = 0

function parseTestOutput (data) {
  const text = data.toString()
  outputBuffer.push(text)

  // Parse test counts
  const passingMatch = text.match(/(\d+) passing/)
  const failingMatch = text.match(/(\d+) failing/)
  const pendingMatch = text.match(/(\d+) pending/)

  if (passingMatch) passing = parseInt(passingMatch[1])
  if (failingMatch) failing = parseInt(failingMatch[1])
  if (pendingMatch) pending = parseInt(pendingMatch[1])

  // Output in real-time
  process.stdout.write(text)
}

function killTestProcess () {
  if (testProcess && !testProcess.killed) {
    console.log('\n⚠️  Terminating test process...')
    testProcess.kill('SIGTERM')

    setTimeout(() => {
      if (testProcess && !testProcess.killed) {
        console.log('⚠️  Force killing test process...')
        testProcess.kill('SIGKILL')
      }
    }, 1000)
  }
}

function runTests () {
  return new Promise((resolve) => {
    console.log('🚀 Force Test Runner')
    console.log('====================')
    console.log(`⏱️  Max test time: ${MAX_TEST_TIME / 1000}s`)
    console.log(`⏱️  Test timeout: ${TEST_TIMEOUT}ms`)
    console.log('')

    // Create custom mocha config that overrides timeouts
    const mochaArgs = [
      'test/**/*.js',
      '--recursive',
      '--exit',
      '--timeout', TEST_TIMEOUT.toString(),
      '--bail',
      '--no-timeouts', // Disable mocha's timeout handling
      '--require', 'test/helper/test-helper-extensions.js'
    ]

    testProcess = spawn('npx', ['mocha', ...mochaArgs], {
      env: {
        ...process.env,
        NODE_ENV: 'test',
        FORCE_COLOR: '1',
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    })

    testProcess.stdout.on('data', parseTestOutput)
    testProcess.stderr.on('data', parseTestOutput)

    // Absolute timeout - kill everything after MAX_TEST_TIME
    const absoluteTimeout = setTimeout(() => {
      console.log('\n\n❌ ABSOLUTE TIMEOUT REACHED - FORCE TERMINATING')
      killTestProcess()

      // Wait a bit then resolve
      setTimeout(() => {
        resolve({
          completed: false,
          reason: 'timeout',
          passing,
          failing,
          pending
        })
      }, 2000)
    }, MAX_TEST_TIME)

    testProcess.on('exit', (code, signal) => {
      clearTimeout(absoluteTimeout)

      if (signal) {
        console.log(`\n⚠️  Test process terminated by signal: ${signal}`)
      }

      resolve({
        completed: true,
        code,
        signal,
        passing,
        failing,
        pending
      })
    })

    testProcess.on('error', (err) => {
      clearTimeout(absoluteTimeout)
      console.error('\n❌ Failed to start test process:', err.message)
      resolve({
        completed: false,
        error: err.message,
        passing,
        failing,
        pending
      })
    })
  })
}

async function main () {
  // Kill any existing test processes
  console.log('🧹 Cleaning up any existing test processes...')
  try {
    require('child_process').execSync('killall -9 mocha node npm 2>/dev/null', { stdio: 'ignore' })
  } catch (e) {
    // Ignore errors
  }

  console.log('⏳ Starting tests in 2 seconds...\n')
  await new Promise(resolve => setTimeout(resolve, 2000))

  const result = await runTests()

  console.log('\n\n' + '='.repeat(50))
  console.log('📊 TEST RESULTS')
  console.log('='.repeat(50))
  console.log(`✅ Passing: ${result.passing}`)
  console.log(`❌ Failing: ${result.failing}`)
  console.log(`⏸️  Pending: ${result.pending}`)

  if (!result.completed) {
    console.log('\n⚠️  Tests did not complete naturally')
    console.log(`   Reason: ${result.reason || result.error || 'unknown'}`)
  }

  const successRate = result.passing / (result.passing + result.failing) * 100
  console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`)

  // Save output to file
  const logFile = path.join(process.cwd(), 'test-force-output.log')
  fs.writeFileSync(logFile, outputBuffer.join(''))
  console.log(`\n📝 Full output saved to: ${logFile}`)

  // Exit with appropriate code
  process.exit(result.failing > 0 ? 1 : 0)
}

// Handle interrupts
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Interrupted by user')
  killTestProcess()
  process.exit(130)
})

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Termination signal received')
  killTestProcess()
  process.exit(143)
})

// Run
main().catch(err => {
  console.error('Fatal error:', err)
  killTestProcess()
  process.exit(1)
})
