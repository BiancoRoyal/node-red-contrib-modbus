#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('Running complete coverage test suite...\n')

// Run tests with coverage
try {
  execSync('npx jest --config jest.config.simple.js test/coverage --coverage --collectCoverageFrom="src/**/*.js" --silent', {
    stdio: 'inherit'
  })
} catch (error) {
  console.log('Some tests failed, but coverage was collected')
}

// Parse coverage summary
const coverageFile = path.join(__dirname, '..', 'coverage', 'coverage-summary.json')
if (fs.existsSync(coverageFile)) {
  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'))
  const total = coverage.total

  console.log('\n📊 Coverage Summary:')
  console.log(`  Lines:      ${total.lines.pct}%`)
  console.log(`  Statements: ${total.statements.pct}%`)
  console.log(`  Functions:  ${total.functions.pct}%`)
  console.log(`  Branches:   ${total.branches.pct}%`)

  if (total.lines.pct >= 92) {
    console.log('\n✅ Target coverage of 92% achieved!')
  } else {
    console.log(`\n⚠️  Need ${92 - total.lines.pct}% more coverage to reach 92% target`)
  }
}
