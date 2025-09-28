#!/usr/bin/env node
/**
 * Migration script to replace debug package with winston logger
 * Run with: node scripts/migrate-debug-to-winston.js
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Configuration
const srcDir = path.join(__dirname, '..', 'src')
const testDir = path.join(__dirname, '..', 'test')
const backupDir = path.join(__dirname, '..', '.backup-before-winston')

// Patterns to find and replace
const patterns = [
  {
    // Standard debug require
    find: /const\s+(\w+)\s*=\s*require\s*\(\s*['"]debug['"]\s*\)\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    replace: "const $1 = require('./core/modbus-logger').getDebugLogger('$2')"
  },
  {
    // Debug require with path resolution for core modules
    findInCore: /const\s+(\w+)\s*=\s*require\s*\(\s*['"]debug['"]\s*\)\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    replace: "const $1 = require('./modbus-logger').getDebugLogger('$2')"
  },
  {
    // Variable assignment pattern
    find: /(\w+)\s*=\s*require\s*\(\s*['"]debug['"]\s*\)\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    replace: "$1 = require('./core/modbus-logger').getDebugLogger('$2')"
  }
]

// Files to process
const filesToProcess = [
  ...glob.sync(path.join(srcDir, '**/*.js')),
  ...glob.sync(path.join(testDir, '**/*.js'))
]

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
}

console.log('🚀 Starting migration from debug to winston...\n')

let filesModified = 0
let totalReplacements = 0

filesToProcess.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8')
  let modifiedContent = content
  let replacements = 0

  // Check if file uses debug
  if (!content.includes("require('debug')") && !content.includes('require("debug")')) {
    return
  }

  console.log(`📝 Processing: ${path.relative(process.cwd(), filePath)}`)

  // Create backup
  const backupPath = path.join(backupDir, path.relative(process.cwd(), filePath))
  const backupDirPath = path.dirname(backupPath)
  if (!fs.existsSync(backupDirPath)) {
    fs.mkdirSync(backupDirPath, { recursive: true })
  }
  fs.writeFileSync(backupPath, content)

  // Determine if this is a core module
  const isCore = filePath.includes(path.join('src', 'core'))

  // Apply patterns
  patterns.forEach(pattern => {
    if (isCore && pattern.findInCore) {
      // Use core-specific pattern
      const matches = modifiedContent.match(pattern.findInCore)
      if (matches) {
        modifiedContent = modifiedContent.replace(pattern.findInCore, pattern.replace)
        replacements += matches.length
      }
    } else if (!isCore && pattern.find) {
      // Use standard pattern
      const matches = modifiedContent.match(pattern.find)
      if (matches) {
        // Adjust path for non-core modules
        let replacement = pattern.replace
        if (filePath.includes(path.join('src')) && !isCore) {
          // Files in src/ but not in core/
          replacement = replacement.replace('./core/modbus-logger', './core/modbus-logger')
        } else if (filePath.includes(path.join('test'))) {
          // Test files need different path
          const depth = path.relative(path.dirname(filePath), testDir).split(path.sep).length
          const relPath = '../'.repeat(depth) + 'src/core/modbus-logger'
          replacement = replacement.replace('./core/modbus-logger', relPath)
        }
        modifiedContent = modifiedContent.replace(pattern.find, replacement)
        replacements += matches.length
      }
    }
  })

  // Write modified content if changes were made
  if (replacements > 0) {
    fs.writeFileSync(filePath, modifiedContent)
    console.log(`   ✅ Replaced ${replacements} debug instances`)
    filesModified++
    totalReplacements += replacements
  }
})

console.log('\n📊 Migration Summary:')
console.log(`   Files modified: ${filesModified}`)
console.log(`   Total replacements: ${totalReplacements}`)
console.log(`   Backup created at: ${backupDir}`)

// Update package.json to add winston and remove debug
const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

// Add winston if not present
if (!packageJson.dependencies.winston) {
  packageJson.dependencies.winston = '^3.11.0'
  console.log('\n✅ Added winston to dependencies')
}

// Remove debug if present
if (packageJson.dependencies.debug) {
  delete packageJson.dependencies.debug
  console.log('✅ Removed debug from dependencies')
}

// Sort dependencies
packageJson.dependencies = Object.keys(packageJson.dependencies)
  .sort()
  .reduce((acc, key) => {
    acc[key] = packageJson.dependencies[key]
    return acc
  }, {})

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
console.log('✅ Updated package.json')

console.log('\n🎉 Migration complete!')
console.log('   Run "npm install" to install winston')
console.log('   Run "npm run build" to rebuild the project')
console.log('   Run "npm test" to verify everything works')
console.log('\n⚠️  Important: Review the changes and test thoroughly before committing!')
