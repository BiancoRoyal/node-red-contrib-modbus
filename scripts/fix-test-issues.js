#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('Fixing common test issues...')

// Fix 1: Update test timeouts for async operations
function fixTimeouts (content, filename) {
  // Increase timeout for tests with setTimeout
  content = content.replace(/setTimeout\(\(\) => \{/g, 'await new Promise(resolve => setTimeout(() => {')
  content = content.replace(/\}, 1000\)\s*\}\)/g, '}, 1000)); resolve() }))')

  // Fix tests that use setTimeout without proper async handling
  content = content.replace(/setTimeout\(\(\) => \{([^}]+)\}, (\d+)\)/g, (match, body, timeout) => {
    if (!body.includes('resolve')) {
      return `await new Promise(resolve => setTimeout(() => {${body} resolve()}, ${timeout}))`
    }
    return match
  })

  return content
}

// Fix 2: Fix Sinon stubs for Jest
function fixSinonStubs (content, filename) {
  // Add proper cleanup for sinon
  if (content.includes('sinon.') && !content.includes('sinon.restore()')) {
    content = content.replace(/afterEach\(async \(\) => \{/,
      'afterEach(async () => {\n    sinon.restore()')
  }

  // Fix sinon.stub usage
  content = content.replace(/sinon\.stub\(([^,]+), '([^']+)'\)/g,
    'jest.spyOn($1, \'$2\').mockImplementation(() => {})')

  return content
}

// Fix 3: Fix helper.load calls
function fixHelperLoads (content, filename) {
  // Ensure all helper.load calls are awaited
  content = content.replace(/helper\.load\(([^)]+)\)(?!\s*\.then)/g, 'await helper.load($1)')

  // Fix helper.load with callbacks to async/await
  content = content.replace(/helper\.load\(([^,]+), ([^,]+), \(\) => \{([^}]+)\}\)/g,
    'await helper.load($1, $2)\n    $3')

  return content
}

// Fix 4: Fix expect statements
function fixExpectStatements (content, filename) {
  // Fix node property checks
  content = content.replace(/expect\((\w+)\)\.to\.have\.property\('([^']+)', '([^']+)'\)/g,
    'expect($1).toHaveProperty(\'$2\', \'$3\')')

  // Fix undefined checks
  content = content.replace(/expect\((\w+)\)\.to\.be\.undefined/g,
    'expect($1).toBeUndefined()')

  return content
}

// Process all test files
const testDirs = ['test/units', 'test/core', 'test/e2e']
let fixedCount = 0

testDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir)
  if (!fs.existsSync(fullPath)) return

  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.test.js'))

  files.forEach(file => {
    const filePath = path.join(fullPath, file)
    let content = fs.readFileSync(filePath, 'utf8')
    const originalContent = content

    content = fixTimeouts(content, file)
    content = fixSinonStubs(content, file)
    content = fixHelperLoads(content, file)
    content = fixExpectStatements(content, file)

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content)
      console.log(`✅ Fixed ${file}`)
      fixedCount++
    }
  })
})

console.log(`\n✅ Fixed ${fixedCount} test files`)
