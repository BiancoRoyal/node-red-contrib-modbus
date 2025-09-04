#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('Converting all tests to use official node-red-node-test-helper...\n')

function fixTestFile (filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  // const filename = path.basename(filePath) // unused variable

  // 1. Replace custom helper import with official one
  content = content.replace(
    /const helper = require\(['"]\.\.\/helpers\/node-red-helper['"]\)/g,
    "const helper = require('node-red-node-test-helper')"
  )

  // 2. Fix async patterns to callback patterns
  // beforeAll
  content = content.replace(
    /beforeAll\(async \(\) => \{\s*await helper\.startServer\(\)\s*\}\)/g,
    'beforeAll((done) => {\n    helper.startServer(done)\n  })'
  )

  // afterAll
  content = content.replace(
    /afterAll\(async \(\) => \{\s*await helper\.stopServer\(\)\s*\}\)/g,
    'afterAll((done) => {\n    helper.stopServer(done)\n  })'
  )

  // afterEach
  content = content.replace(
    /afterEach\(async \(\) => \{\s*await helper\.unload\(\)\s*\}\)/g,
    'afterEach((done) => {\n    helper.unload(done)\n  })'
  )

  // Fix test cases with helper.load
  content = content.replace(
    /test\(['"]([^'"]+)['"]\s*,\s*async\s*\(\)\s*=>\s*\{([\s\S]*?)await helper\.load\(([^)]+)\)([\s\S]*?)\}\)/g,
    (match, testName, before, loadArgs, after) => {
      // Clean up the test body
      const testBody = (before + after).trim()
      return `test('${testName}', (done) => {
    helper.load(${loadArgs}, () => {
      try {
        ${testBody}
        done()
      } catch (err) {
        done(err)
      }
    })
  })`
    }
  )

  return content
}

// Process all test files
const testDirs = ['test/units', 'test/core', 'test/e2e']
let fixedCount = 0
const results = []

testDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir)
  if (!fs.existsSync(fullPath)) return

  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.test.js'))

  files.forEach(file => {
    const filePath = path.join(fullPath, file)
    const original = fs.readFileSync(filePath, 'utf8')
    const fixed = fixTestFile(filePath)

    if (original !== fixed) {
      fs.writeFileSync(filePath, fixed)
      console.log(`✅ Fixed ${file}`)
      fixedCount++
      results.push({ file, status: 'fixed' })
    } else {
      results.push({ file, status: 'unchanged' })
    }
  })
})

console.log('\n=== Summary ===')
console.log(`✅ Fixed ${fixedCount} files to use official helper`)
console.log(`📝 Total test files: ${results.length}`)
console.log('\nAll tests now use \'node-red-node-test-helper\' with callbacks.')
console.log('\nNext steps:')
console.log('1. Run: npm run build')
console.log('2. Run: npm test')
console.log('3. If tests timeout, increase timeout in jest.config.js')
