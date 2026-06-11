#!/usr/bin/env node

/**
 * Dependency Security Checker
 * Validates package integrity and checks for supply chain attacks
 */

const fs = require('fs')
const path = require('path')
// const crypto = require('crypto') - not currently used
const { execSync } = require('child_process')

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

class SecurityChecker {
  constructor () {
    this.issues = []
    this.warnings = []
    this.projectRoot = path.resolve(__dirname, '..')
  }

  log (message, type = 'info') {
    const prefix = {
      error: `${colors.red}[!]${colors.reset}`,
      warning: `${colors.yellow}[*]${colors.reset}`,
      success: `${colors.green}[✓]${colors.reset}`,
      info: `${colors.blue}[-]${colors.reset}`
    }
    console.log(`${prefix[type]} ${message}`)
  }

  // Check for packages with suspicious names (typosquatting)
  checkTyposquatting () {
    this.log('Checking for potential typosquatting...', 'info')

    const commonTargets = {
      'cross-env': ['crossenv', 'cross-env-', 'cros-env'],
      lodash: ['lodash-', 'lodahs', 'lodsh'],
      express: ['expres', 'exress', 'expresss'],
      react: ['reatc', 'raect', 'recat'],
      axios: ['axois', 'axio', 'axious'],
      mongoose: ['mongose', 'mongosse', 'mongooose'],
      nodemailer: ['node-mailer', 'nodemail', 'nodemailler']
    }

    const nodeModules = path.join(this.projectRoot, 'node_modules')
    if (!fs.existsSync(nodeModules)) return

    const installedPackages = fs.readdirSync(nodeModules)
      .filter(name => !name.startsWith('.') && !name.startsWith('@'))

    for (const [legitimate, typos] of Object.entries(commonTargets)) {
      for (const typo of typos) {
        if (installedPackages.includes(typo)) {
          this.issues.push(`Potential typosquatting: '${typo}' (did you mean '${legitimate}'?)`)
        }
      }
    }
  }

  // Check for packages that were published very recently (potential supply chain attack)
  checkRecentlyPublished () {
    this.log('Checking package publish dates...', 'info')

    try {
      const lockFile = path.join(this.projectRoot, 'package-lock.json')
      if (!fs.existsSync(lockFile)) return

      const lockContent = JSON.parse(fs.readFileSync(lockFile, 'utf8'))
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)

      const checkPackages = (packages, prefix = '') => {
        for (const [name, info] of Object.entries(packages || {})) {
          if (info.resolved) {
            // Try to get package metadata from npm registry
            try {
              const result = execSync(`npm view ${name} time.modified --json`, {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'ignore']
              })
              const modified = new Date(JSON.parse(result))

              if (modified.getTime() > oneWeekAgo) {
                this.warnings.push(`Package '${name}' was updated recently (${modified.toLocaleDateString()})`)
              }
            } catch (e) {
              // Silently skip if we can't get metadata
            }
          }

          if (info.dependencies) {
            checkPackages(info.dependencies, `${prefix}${name}/`)
          }
        }
      }

      if (lockContent.packages) {
        checkPackages(lockContent.packages)
      }
    } catch (error) {
      this.log(`Could not check publish dates: ${error.message}`, 'warning')
    }
  }

  // Check for packages with postinstall scripts
  checkPostinstallScripts () {
    this.log('Checking for postinstall scripts...', 'info')

    const nodeModules = path.join(this.projectRoot, 'node_modules')
    if (!fs.existsSync(nodeModules)) return

    const checkDir = (dir, depth = 0) => {
      if (depth > 2) return // Don't go too deep

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true })

        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            const packagePath = path.join(dir, entry.name, 'package.json')

            if (fs.existsSync(packagePath)) {
              const content = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

              if (content.scripts) {
                const dangerousScripts = ['postinstall', 'preinstall', 'install', 'prepare']
                const found = dangerousScripts.filter(s => content.scripts[s])

                if (found.length > 0) {
                  const script = content.scripts[found[0]]
                  // Check for suspicious commands
                  if (script.match(/curl|wget|nc |netcat|bash|sh |powershell|eval|base64/i)) {
                    this.issues.push(`Suspicious ${found[0]} script in '${content.name}': ${script}`)
                  } else {
                    this.warnings.push(`Package '${content.name}' has ${found.join(', ')} script(s)`)
                  }
                }
              }
            }

            // Check subdirectories (for scoped packages)
            if (entry.name.startsWith('@')) {
              checkDir(path.join(dir, entry.name), depth + 1)
            }
          }
        }
      } catch (error) {
        // Silently skip directories we can't read
      }
    }

    checkDir(nodeModules)
  }

  // Check for obfuscated code
  checkObfuscation () {
    this.log('Checking for obfuscated code...', 'info')

    const nodeModules = path.join(this.projectRoot, 'node_modules')
    if (!fs.existsSync(nodeModules)) return

    const patterns = [
      /_0x[0-9a-f]{4,}/,
      /const_0x[0-9a-f]{3,}/,
      /eval\s*\(/,
      /Function\s*\(/,
      /atob\s*\(/,
      /\[['"]\x65\x76\x61\x6c['"]\]/ // 'eval' in hex
    ]

    const whitelist = [
      'node_modules/bson/',
      'node_modules/node-forge/',
      'node_modules/regenerator-transform/',
      'node_modules/js-beautify/',
      'node_modules/jsesc/',
      '.min.js',
      '.bundle.js'
    ]

    const checkFile = (filePath) => {
      // Skip whitelisted paths
      if (whitelist.some(w => filePath.includes(w))) return

      try {
        const content = fs.readFileSync(filePath, 'utf8')
        const lines = content.split('\n')

        for (let i = 0; i < Math.min(lines.length, 100); i++) { // Check first 100 lines
          for (const pattern of patterns) {
            if (pattern.test(lines[i])) {
              const relativePath = path.relative(this.projectRoot, filePath)
              this.warnings.push(`Possible obfuscation in ${relativePath}:${i + 1}`)
              return
            }
          }
        }
      } catch (error) {
        // Skip files we can't read
      }
    }

    const scanDir = (dir, depth = 0) => {
      if (depth > 3) return // Don't go too deep

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)

          if (entry.isFile() && entry.name.endsWith('.js')) {
            checkFile(fullPath)
          } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
            scanDir(fullPath, depth + 1)
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    // Only scan top-level packages to avoid timeout
    const topLevel = fs.readdirSync(nodeModules, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .slice(0, 50) // Limit to first 50 packages

    for (const entry of topLevel) {
      scanDir(path.join(nodeModules, entry.name))
    }
  }

  // Check for hidden files
  checkHiddenFiles () {
    this.log('Checking for hidden files...', 'info')

    const nodeModules = path.join(this.projectRoot, 'node_modules')
    if (!fs.existsSync(nodeModules)) return

    const allowedHidden = ['.npmignore', '.gitignore', '.eslintrc', '.prettierrc', '.editorconfig', '.travis.yml']
    const foundHidden = []

    const scanDir = (dir, depth = 0) => {
      if (depth > 3) return

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true })

        for (const entry of entries) {
          if (entry.name.startsWith('.') && entry.isFile()) {
            if (!allowedHidden.some(allowed => entry.name.startsWith(allowed))) {
              const relativePath = path.relative(nodeModules, path.join(dir, entry.name))
              foundHidden.push(relativePath)
            }
          } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
            scanDir(path.join(dir, entry.name), depth + 1)
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    scanDir(nodeModules)

    if (foundHidden.length > 0) {
      this.warnings.push(`Found ${foundHidden.length} unusual hidden files`)
      foundHidden.slice(0, 5).forEach(file => {
        this.log(`  - ${file}`, 'warning')
      })
    }
  }

  async run () {
    console.log('=====================================')
    console.log('   Dependency Security Check')
    console.log('=====================================\n')

    this.checkTyposquatting()
    this.checkPostinstallScripts()
    this.checkObfuscation()
    this.checkHiddenFiles()
    // this.checkRecentlyPublished(); // Commented out as it's slow

    console.log('\n=====================================')
    console.log('           Summary')
    console.log('=====================================')

    if (this.issues.length === 0 && this.warnings.length === 0) {
      this.log('No security issues found!', 'success')
    } else {
      if (this.issues.length > 0) {
        console.log(`\n${colors.red}Critical Issues (${this.issues.length}):${colors.reset}`)
        this.issues.forEach(issue => this.log(issue, 'error'))
      }

      if (this.warnings.length > 0) {
        console.log(`\n${colors.yellow}Warnings (${this.warnings.length}):${colors.reset}`)
        this.warnings.slice(0, 20).forEach(warning => this.log(warning, 'warning'))
        if (this.warnings.length > 20) {
          this.log(`... and ${this.warnings.length - 20} more warnings`, 'warning')
        }
      }
    }

    console.log('\nRecommendations:')
    console.log('1. Run "npm audit fix" to fix known vulnerabilities')
    console.log('2. Review packages with postinstall scripts')
    console.log('3. Consider using "npx depcheck" to find unused dependencies')
    console.log('4. Use "npx snyk test" for comprehensive vulnerability scanning')
    console.log('5. Enable npm audit on CI/CD pipeline')
  }
}

// Run the checker
const checker = new SecurityChecker()
checker.run().catch(error => {
  console.error('Error running security check:', error)
  process.exit(1)
})
