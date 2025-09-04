#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('Fixing helper callback patterns...')

// Fix helper.startServer and helper.stopServer to use callbacks
function fixHelperCallbacks (content, filename) {
  // Fix beforeAll with helper.startServer
  content = content.replace(/beforeAll\(async \(\) => \{\s*await helper\.startServer\(\)\s*\}\)/g,
    'beforeAll((done) => {\n    helper.startServer(done)\n  })')

  // Fix afterAll with helper.stopServer
  content = content.replace(/afterAll\(async \(\) => \{\s*await helper\.stopServer\(\)\s*\}\)/g,
    'afterAll((done) => {\n    helper.stopServer(done)\n  })')

  // Fix afterEach with helper.unload
  content = content.replace(/afterEach\(async \(\) => \{\s*await helper\.unload\(\)\s*\}\)/g,
    'afterEach((done) => {\n    helper.unload(done)\n  })')

  // Fix sinon.restore() in afterEach
  content = content.replace(/afterEach\(async \(\) => \{\s*sinon\.restore\(\)\s*await helper\.unload\(\)\s*\}\)/g,
    'afterEach((done) => {\n    sinon.restore()\n    helper.unload(done)\n  })')

  // Fix helper.load to use callbacks properly
  content = content.replace(/await helper\.load\(([^,]+), ([^)]+)\)\s*\n\s*([^}])/g,
    (match, nodes, flows, nextLine) => {
      return `helper.load(${nodes}, ${flows}, () => {\n      ${nextLine}`
    })

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

    content = fixHelperCallbacks(content, file)

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content)
      console.log(`✅ Fixed ${file}`)
      fixedCount++
    }
  })
})

console.log(`\n✅ Fixed ${fixedCount} test files`)
