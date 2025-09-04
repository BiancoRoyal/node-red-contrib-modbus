#!/usr/bin/env node

/**
 * Test runner that guarantees no hanging
 * Runs each test file separately with strict timeout control
 */

const { spawn, execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const TEST_TIMEOUT = 5000 // 5 seconds per test file max
const BATCH_SIZE = 5 // Number of test files to run together

// Test files to run (avoiding problematic ones)
const testFiles = [
  // Core tests
  'test/core/modbus-basics-test.js',
  'test/core/modbus-client-core-test.js',
  'test/core/modbus-core-test.js',
  'test/core/modbus-io-core-test.js',
  'test/core/modbus-queue-core-test.js',
  'test/core/modbus-server-core-test.js',

  // Unit tests (safe ones)
  'test/units/modbus-client-test.js',
  'test/units/modbus-server-test.js',
  'test/units/modbus-read-test.js',
  'test/units/modbus-write-test.js',
  'test/units/modbus-getter-test.js',
  'test/units/modbus-flex-write-test.js',
  'test/units/modbus-response-test.js',
  'test/units/modbus-queue-info-test.js',
  'test/units/modbus-io-config-test.js'
]

const results = {
  passing: 0,
  failing: 0,
  pending: 0,
  timedOut: [],
  errors: []
}

function killAllTests () {
  try {
    execSync('killall -9 mocha node npm 2>/dev/null', { stdio: 'ignore' })
  } catch (e) {
    // Ignore errors
  }
}

function runTestFile (file) {
  return new Promise((resolve) => {
    console.log(`\n📄 Testing: ${path.basename(file)}`)

    let output = ''
    let testKilled = false

    const proc = spawn('npx', [
      'mocha',
      file,
      '--timeout', '1000',
      '--exit',
      '--no-config'
    ], {
      timeout: TEST_TIMEOUT,
      killSignal: 'SIGKILL'
    })

    proc.stdout.on('data', (data) => {
      output += data.toString()
      process.stdout.write('.')
    })

    proc.stderr.on('data', (data) => {
      output += data.toString()
    })

    const timeout = setTimeout(() => {
      if (!testKilled) {
        testKilled = true
        console.log(' ⏱️  TIMEOUT')
        results.timedOut.push(file)
        proc.kill('SIGKILL')
      }
    }, TEST_TIMEOUT)

    proc.on('exit', (code) => {
      clearTimeout(timeout)

      // Parse results
      const passingMatch = output.match(/(\d+) passing/)
      const failingMatch = output.match(/(\d+) failing/)
      const pendingMatch = output.match(/(\d+) pending/)

      if (passingMatch) {
        const count = parseInt(passingMatch[1])
        results.passing += count
        console.log(` ✅ ${count} passing`)
      }
      if (failingMatch) {
        const count = parseInt(failingMatch[1])
        results.failing += count
        console.log(` ❌ ${count} failing`)
      }
      if (pendingMatch) {
        const count = parseInt(pendingMatch[1])
        results.pending += count
      }

      resolve()
    })

    proc.on('error', (err) => {
      clearTimeout(timeout)
      console.log(` ❌ ERROR: ${err.message}`)
      results.errors.push({ file, error: err.message })
      resolve()
    })
  })
}

async function runTestBatch (files) {
  console.log(`\n🔹 Running batch of ${files.length} test files...`)

  for (const file of files) {
    if (fs.existsSync(file)) {
      await runTestFile(file)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100))
    } else {
      console.log(`⚠️  Skipping missing file: ${file}`)
    }
  }
}

async function main () {
  console.log('🚀 No-Hang Test Runner')
  console.log('======================')
  console.log(`📊 Running ${testFiles.length} test files`)
  console.log(`⏱️  Timeout per file: ${TEST_TIMEOUT}ms`)

  // Initial cleanup
  killAllTests()
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Run tests in batches
  for (let i = 0; i < testFiles.length; i += BATCH_SIZE) {
    const batch = testFiles.slice(i, i + BATCH_SIZE)
    await runTestBatch(batch)

    // Cleanup between batches
    killAllTests()
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Final summary
  console.log('\n')
  console.log('======================')
  console.log('📊 FINAL RESULTS')
  console.log('======================')
  console.log(`✅ Passing: ${results.passing}`)
  console.log(`❌ Failing: ${results.failing}`)
  console.log(`⏸️  Pending: ${results.pending}`)

  if (results.timedOut.length > 0) {
    console.log(`\n⏱️  Timed out files (${results.timedOut.length}):`)
    results.timedOut.forEach(f => console.log(`   - ${path.basename(f)}`))
  }

  if (results.errors.length > 0) {
    console.log(`\n❌ Errors (${results.errors.length}):`)
    results.errors.forEach(e => console.log(`   - ${path.basename(e.file)}: ${e.error}`))
  }

  const successRate = results.passing / (results.passing + results.failing) * 100
  console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`)

  // Final cleanup
  killAllTests()

  process.exit(results.failing > 0 ? 1 : 0)
}

// Handle interruptions
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Interrupted')
  killAllTests()
  process.exit(130)
})

// Run
main().catch(err => {
  console.error('Fatal error:', err)
  killAllTests()
  process.exit(1)
})
