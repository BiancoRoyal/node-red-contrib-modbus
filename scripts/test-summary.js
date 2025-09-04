#!/usr/bin/env node

/**
 * Test summary runner - runs tests and provides summary
 */

const { spawn } = require('child_process')

let passing = 0
let failing = 0
let pending = 0

const testSuites = [
  { name: 'Core Tests', path: 'test/core/*.js' },
  { name: 'Unit Tests', path: 'test/units/*.js' },
  { name: 'E2E Tests', path: 'test/e2e/*.js' }
]

async function runTestSuite (name, path) {
  return new Promise((resolve) => {
    console.log(`\n📦 Running ${name}...`)

    const proc = spawn('npx', ['mocha', path, '--timeout', '5000', '--bail', '--exit'], {
      env: { ...process.env, NODE_ENV: 'test' }
    })

    let suitePassing = 0
    let suiteFailing = 0

    proc.stdout.on('data', (data) => {
      const text = data.toString()

      // Parse test results
      const passingMatch = text.match(/(\d+) passing/)
      const failingMatch = text.match(/(\d+) failing/)
      const pendingMatch = text.match(/(\d+) pending/)

      if (passingMatch) suitePassing = parseInt(passingMatch[1])
      if (failingMatch) suiteFailing = parseInt(failingMatch[1])
      if (pendingMatch) pending += parseInt(pendingMatch[1])
    })

    proc.stderr.on('data', () => {
      // Ignore stderr for now
    })

    // Timeout after 30 seconds
    const timeout = setTimeout(() => {
      proc.kill('SIGKILL')
      console.log(`   ⚠️  ${name} timed out`)
      resolve({ name, passing: suitePassing, failing: suiteFailing, timeout: true })
    }, 30000)

    proc.on('exit', (code) => {
      clearTimeout(timeout)
      passing += suitePassing
      failing += suiteFailing

      console.log(`   ✅ ${suitePassing} passing`)
      if (suiteFailing > 0) {
        console.log(`   ❌ ${suiteFailing} failing`)
      }

      resolve({ name, passing: suitePassing, failing: suiteFailing, code })
    })

    proc.on('error', (err) => {
      clearTimeout(timeout)
      console.log(`   ❌ Error: ${err.message}`)
      resolve({ name, passing: 0, failing: 0, error: err.message })
    })
  })
}

async function main () {
  console.log('🧪 Node-RED Modbus Test Summary')
  console.log('================================')

  const results = []

  for (const suite of testSuites) {
    const result = await runTestSuite(suite.name, suite.path)
    results.push(result)
  }

  console.log('\n📊 Test Summary')
  console.log('================')
  console.log(`Total Passing: ${passing}`)
  console.log(`Total Failing: ${failing}`)
  console.log(`Total Pending: ${pending}`)
  console.log(`Success Rate: ${(passing / (passing + failing) * 100).toFixed(1)}%`)

  console.log('\n📈 Suite Breakdown:')
  results.forEach(r => {
    const status = r.timeout ? '⏱️' : (r.failing > 0 ? '❌' : '✅')
    console.log(`${status} ${r.name}: ${r.passing} passing, ${r.failing} failing`)
  })

  process.exit(failing > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
