#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('Running tests safely...\n')

// Get all test files
const testDirs = ['test/units', 'test/core', 'test/e2e']
const testFiles = []

testDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir)
  if (!fs.existsSync(fullPath)) return

  const files = fs.readdirSync(fullPath)
    .filter(f => f.endsWith('.test.js'))
    .map(f => path.join(dir, f))

  testFiles.push(...files)
})

let passed = 0
let failed = 0
const results = []

// Test each file individually with a timeout
testFiles.forEach((file, index) => {
  process.stdout.write(`[${index + 1}/${testFiles.length}] Testing ${file}... `)

  try {
    const result = execSync(
      `npx jest --config jest.config.simple.js ${file} --no-coverage --silent 2>&1`,
      {
        timeout: 10000, // 10 second timeout per file
        encoding: 'utf8'
      }
    )

    if (result.includes('PASS')) {
      process.stdout.write('✅\n')
      passed++
      results.push({ file, status: 'PASS' })
    } else {
      process.stdout.write('❌\n')
      failed++
      results.push({ file, status: 'FAIL' })
    }
  } catch (error) {
    process.stdout.write('❌ (error or timeout)\n')
    failed++
    results.push({ file, status: 'ERROR' })
  }
})

// Summary
console.log('\n=== Test Summary ===')
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📊 Total: ${testFiles.length}`)
console.log(`🎯 Pass Rate: ${((passed / testFiles.length) * 100).toFixed(1)}%`)

// Show failed tests
if (failed > 0) {
  console.log('\n=== Failed Tests ===')
  results.filter(r => r.status !== 'PASS').forEach(r => {
    console.log(`❌ ${r.file} (${r.status})`)
  })
}

// Save results to file
fs.writeFileSync(
  path.join(__dirname, '..', 'test-results.json'),
  JSON.stringify(results, null, 2)
)

console.log('\nResults saved to test-results.json')
