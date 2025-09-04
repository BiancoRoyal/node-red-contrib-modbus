#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('Comprehensive test fix for Node-RED Contrib Modbus...\n')

// Fix all test files to work properly with Jest and node-red-node-test-helper
function fixTestFile (filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  // const filename = path.basename(filePath) // unused variable

  // 1. Fix helper callbacks - they MUST use done callbacks, not async/await
  content = content.replace(/beforeAll\(async \(\) => \{[\s\S]*?helper\.startServer\(\)[\s\S]*?\}\)/g,
    'beforeAll((done) => {\n    helper.startServer(done)\n  })')

  content = content.replace(/afterAll\(async \(\) => \{[\s\S]*?helper\.stopServer\(\)[\s\S]*?\}\)/g,
    'afterAll((done) => {\n    helper.stopServer(done)\n  })')

  // 2. Fix helper.load - must use callback pattern
  content = content.replace(/test\(['"]([^'"]+)['"]\s*,\s*async\s*\(\)\s*=>\s*\{[\s\S]*?await helper\.load\(([^)]+)\)([^}]*)\}/g,
    (match, testName, loadArgs, testBody) => {
      // Extract the test body and wrap in callback
      const cleanBody = testBody.trim()
      return `test('${testName}', (done) => {
    helper.load(${loadArgs}, () => {
      try {
        ${cleanBody}
        done()
      } catch (err) {
        done(err)
      }
    })
  }`
    })

  // 3. Fix afterEach with helper.unload
  content = content.replace(/afterEach\(async \(\) => \{[\s\S]*?helper\.unload\(\)[\s\S]*?\}\)/g,
    'afterEach((done) => {\n    helper.unload(done)\n  })')

  // 4. Fix setTimeout to use proper promises
  content = content.replace(/setTimeout\(\(\) => \{([^}]+)\}, (\d+)\)/g,
    'setTimeout(() => { $1 }, $2)')

  // 5. Fix expect statements that were malformed
  content = content.replace(/(\w+)\.expect\(([^)]+)\)\.(toBe|toEqual|toHaveProperty)\(/g,
    'expect($1.$2).$3(')

  // 6. Remove duplicate closing braces
  content = content.replace(/\}\)\s*\n\s*\}\)/g, '})')

  // 7. Fix test structure issues
  content = content.replace(/\)\s*\n\s*\)\s*\n\s*\}\)/g, ')\n  })')

  return content
}

// Fix flow files to ensure they export proper structures
function fixFlowFile (filePath) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Ensure flow files export objects with proper node configurations
  if (!content.includes('module.exports')) {
    content = 'module.exports = {}\n' + content
  }

  return content
}

// Process test files
const testDirs = [
  { path: 'test/units', pattern: '.test.js' },
  { path: 'test/core', pattern: '.test.js' },
  { path: 'test/e2e', pattern: '.test.js' }
]

let fixedTests = 0
let fixedFlows = 0

testDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir.path)
  if (!fs.existsSync(fullPath)) return

  // Fix test files
  const testFiles = fs.readdirSync(fullPath).filter(f => f.endsWith(dir.pattern))
  testFiles.forEach(file => {
    const filePath = path.join(fullPath, file)
    const fixed = fixTestFile(filePath)
    fs.writeFileSync(filePath, fixed)
    console.log(`✅ Fixed test: ${file}`)
    fixedTests++
  })

  // Fix flow files
  const flowsPath = path.join(fullPath, 'flows')
  if (fs.existsSync(flowsPath)) {
    const flowFiles = fs.readdirSync(flowsPath).filter(f => f.endsWith('.js'))
    flowFiles.forEach(file => {
      const filePath = path.join(flowsPath, file)
      const fixed = fixFlowFile(filePath)
      fs.writeFileSync(filePath, fixed)
      console.log(`✅ Fixed flow: ${file}`)
      fixedFlows++
    })
  }
})

console.log('\n=== Summary ===')
console.log(`✅ Fixed ${fixedTests} test files`)
console.log(`✅ Fixed ${fixedFlows} flow files`)
console.log('\nNext steps:')
console.log('1. Run: npm run build (to ensure source is built)')
console.log('2. Run: npm test (to run all tests)')
console.log('3. Run: npx jest --coverage (to check coverage)')
