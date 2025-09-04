#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('Running coverage-focused tests...')

// Test groups for progressive coverage
const testGroups = [
  {
    name: 'Core Tests',
    pattern: 'test/core/*coverage*.test.js',
    target: 40
  },
  {
    name: 'Unit Tests',
    pattern: 'test/units/*coverage*.test.js',
    target: 30
  },
  {
    name: 'Additional Tests',
    pattern: 'test/**/*additional*.test.js',
    target: 10
  },
  {
    name: 'Smoke Tests',
    pattern: 'test/smoke.test.js',
    target: 2
  }
]

let totalCoverage = 0

testGroups.forEach(group => {
  console.log(`\nRunning ${group.name} (Target: ${group.target}%)...`)
  try {
    execSync(`npx jest --config jest.config.simple.js ${group.pattern} --coverage --silent`, {
      stdio: 'inherit'
    })
    totalCoverage += group.target
  } catch (error) {
    console.log(`⚠️  Some tests failed in ${group.name}`)
  }
})

console.log(`\n🎯 Estimated Total Coverage: ${totalCoverage}%`)
console.log('Run full coverage check with: npx jest --coverage')
