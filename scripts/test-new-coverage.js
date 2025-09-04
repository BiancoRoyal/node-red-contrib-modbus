#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('Testing new coverage files individually...\n')

const testFiles = [
  'test/e2e/modbus-client-tls-e2e.test.js',
  'test/e2e/modbus-flex-write-e2e.test.js',
  'test/e2e/modbus-getter-e2e.test.js'
]

let passedTests = 0
let failedTests = 0
const results = []

// First, ensure we have a build
console.log('Building project...')
try {
  execSync('npm run build', { stdio: 'inherit' })
} catch (e) {
  console.error('Build failed')
  process.exit(1)
}

// Test each file separately to avoid port conflicts
testFiles.forEach(testFile => {
  const fullPath = path.join(__dirname, '..', testFile)

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Test file not found: ${testFile}`)
    failedTests++
    results.push({ file: testFile, status: 'not found' })
    return
  }

  console.log(`\nTesting: ${testFile}`)
  console.log('='.repeat(60))

  try {
    // Run test with a shorter timeout to avoid hanging
    const output = execSync(`npx mocha ${testFile} --exit --timeout 3000`, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10
    })

    // Parse output for pass/fail counts
    const lines = output.split('\n')
    const summaryLine = lines.find(line => line.includes('passing'))

    if (summaryLine) {
      console.log(`✅ ${summaryLine.trim()}`)
      passedTests++
      results.push({ file: testFile, status: 'passed', summary: summaryLine.trim() })
    } else {
      console.log('✅ Tests passed')
      passedTests++
      results.push({ file: testFile, status: 'passed' })
    }
  } catch (error) {
    console.log('❌ Tests failed or timed out')
    failedTests++

    // Extract error summary if available
    const errorLines = error.stdout ? error.stdout.split('\n') : []
    const failLine = errorLines.find(line => line.includes('failing'))

    results.push({
      file: testFile,
      status: 'failed',
      error: failLine ? failLine.trim() : 'Test execution failed'
    })
  }
})

// Summary
console.log('\n' + '='.repeat(60))
console.log('TEST SUMMARY')
console.log('='.repeat(60))
console.log(`Total files tested: ${testFiles.length}`)
console.log(`Passed: ${passedTests}`)
console.log(`Failed: ${failedTests}`)

console.log('\nDetails:')
results.forEach(result => {
  const icon = result.status === 'passed' ? '✅' : '❌'
  console.log(`${icon} ${path.basename(result.file)}: ${result.status}`)
  if (result.summary) {
    console.log(`   ${result.summary}`)
  }
  if (result.error) {
    console.log(`   Error: ${result.error}`)
  }
})

// Now run coverage on existing tests
console.log('\n' + '='.repeat(60))
console.log('RUNNING COVERAGE ANALYSIS')
console.log('='.repeat(60))

try {
  execSync('npx nyc --reporter=text-summary mocha test/units/modbus-basics-test.js test/core/modbus-core-test.js --exit --timeout 5000', {
    stdio: 'inherit'
  })
} catch (e) {
  console.log('Coverage analysis completed with some errors')
}

console.log('\n✨ Testing complete!')
console.log('Run "npm run coverage" for full coverage report')
