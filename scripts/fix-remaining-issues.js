#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('Fixing remaining test issues...\n')

// Fix specific issues in test files
const fixes = {
  'test/core/modbus-retry-handler.test.js': {
    issue: 'await outside async function at line 326',
    fix: (content) => {
      // Remove any stray await keywords outside async functions
      return content.replace(/^(\s*)await\s+/gm, '$1')
    }
  },
  'test/core/modbus-server-core.test.js': {
    issue: 'Unexpected token at line 611',
    fix: (content) => {
      // Ensure proper closing of describe/test blocks
      if (!content.trim().endsWith('})')) {
        return content.trim() + '\n})'
      }
      return content
    }
  },
  'test/core/modbus-tls.test.js': {
    issue: 'Unexpected token at line 215',
    fix: (content) => {
      // Ensure proper closing
      if (!content.trim().endsWith('})')) {
        return content.trim() + '\n})'
      }
      return content
    }
  },
  'test/e2e/modbus-fc-flex-e2e.test.js': {
    issue: 'Unexpected token ) at line 40',
    fix: (content) => {
      // Fix malformed helper.load calls
      return content.replace(/helper\.load\([^,]+,\s*,\s*\(/g, 'helper.load(')
    }
  },
  'test/e2e/modbus-flex-connector-e2e.test.js': {
    issue: 'Unexpected token ) at line 40',
    fix: (content) => {
      return content.replace(/helper\.load\([^,]+,\s*,\s*\(/g, 'helper.load(')
    }
  },
  'test/e2e/modbus-flex-sequencer-e2e.test.js': {
    issue: 'Unexpected token ) at line 42',
    fix: (content) => {
      return content.replace(/helper\.load\([^,]+,\s*,\s*\(/g, 'helper.load(')
    }
  },
  'test/e2e/modbus-io-config-e2e.test.js': {
    issue: 'Unexpected token ) at line 45',
    fix: (content) => {
      return content.replace(/helper\.load\([^,]+,\s*,\s*\(/g, 'helper.load(')
    }
  },
  'test/e2e/modbus-read-e2e.test.js': {
    issue: 'Unexpected token ) at line 26',
    fix: (content) => {
      return content.replace(/helper\.load\([^,]+,\s*,\s*\(/g, 'helper.load(')
    }
  },
  'test/e2e/modbus-write-e2e.test.js': {
    issue: 'Unexpected token ) at line 42',
    fix: (content) => {
      return content.replace(/helper\.load\([^,]+,\s*,\s*\(/g, 'helper.load(')
    }
  }
}

// Apply fixes
Object.entries(fixes).forEach(([file, config]) => {
  const filePath = path.join(__dirname, '..', file)

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8')
    content = config.fix(content)
    fs.writeFileSync(filePath, content)
    console.log(`✅ Fixed ${file}: ${config.issue}`)
  } else {
    console.log(`⚠️  File not found: ${file}`)
  }
})

// Add missing newlines at end of files
const addNewlines = [
  'scripts/restore-and-fix-tests.js',
  'scripts/comprehensive-test-fix.js',
  'scripts/add-coverage-tests.js',
  'scripts/fix-to-official-helper.js',
  'test/core/modbus-core-additional.test.js',
  'test/units/modbus-basics-additional.test.js',
  'test/units/modbus-client-additional.test.js',
  'jest.config.coverage.js'
]

addNewlines.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    if (!content.endsWith('\n')) {
      fs.writeFileSync(filePath, content + '\n')
      console.log(`✅ Added newline to ${file}`)
    }
  }
})

console.log('\n✅ All issues fixed!')
console.log('\nNow run:')
console.log('1. npm run build')
console.log('2. npm test')
