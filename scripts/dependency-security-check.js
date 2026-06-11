#!/usr/bin/env node
/**
 * Security Check Script for Dependencies
 * Analyzes packages for known vulnerabilities and suspicious patterns
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const SUSPICIOUS_PATTERNS = [
  // Network operations that could be malicious
  { pattern: /require\(['"]child_process['"]\)/g, risk: 'HIGH', description: 'Executes system commands' },
  { pattern: /exec\(|execSync\(|spawn\(/g, risk: 'HIGH', description: 'Command execution' },
  { pattern: /require\(['"]net['"]\)|require\(['"]dgram['"]\)/g, risk: 'MEDIUM', description: 'Network operations' },
  { pattern: /require\(['"]http['"]\)|require\(['"]https['"]\)/g, risk: 'MEDIUM', description: 'HTTP requests' },

  // File system operations
  { pattern: /require\(['"]fs['"]\)\.unlink|fs\.rm/g, risk: 'HIGH', description: 'File deletion' },
  { pattern: /process\.env\.(HOME|USERPROFILE|USERNAME)/g, risk: 'MEDIUM', description: 'Accesses user directories' },

  // Crypto mining patterns
  { pattern: /stratum\+tcp:|cryptonight|monero|coinhive/gi, risk: 'CRITICAL', description: 'Cryptocurrency mining' },

  // Data exfiltration
  { pattern: /Buffer\.from\(.*\.env/g, risk: 'HIGH', description: 'Environment variable access' },
  { pattern: /process\.env\.AWS|process\.env\.GITHUB/g, risk: 'HIGH', description: 'Credential access' },

  // Obfuscation attempts
  { pattern: /eval\(|Function\(|new Function/g, risk: 'HIGH', description: 'Dynamic code execution' },
  { pattern: /\\x[0-9a-f]{2}|\\u[0-9a-f]{4}/gi, risk: 'LOW', description: 'Hex encoding (could be obfuscation)' },

  // Suspicious domains
  { pattern: /https?:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/g, risk: 'HIGH', description: 'IP address URLs' },
  { pattern: /pastebin\.com|bit\.ly|tinyurl/gi, risk: 'MEDIUM', description: 'URL shorteners or paste sites' }
]

const PACKAGES_TO_CHECK = [
  'winston',
  '@openp4nr/node-modbus',
  'jsmodbus',
  'serialport',
  'node-red'
]

class SecurityChecker {
  constructor () {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        safe: 0
      },
      packages: {},
      npmAudit: null
    }
  }

  async runNpmAudit () {
    console.log('🔍 Running npm audit for production dependencies...')
    try {
      const auditResult = execSync('npm audit --production --json', { encoding: 'utf8' })
      const audit = JSON.parse(auditResult)
      this.results.npmAudit = {
        vulnerabilities: audit.metadata.vulnerabilities,
        totalDependencies: audit.metadata.totalDependencies
      }

      if (audit.metadata.vulnerabilities.total > 0) {
        console.log(`⚠️  Found ${audit.metadata.vulnerabilities.total} vulnerabilities in production`)
      } else {
        console.log('✅ No vulnerabilities found in production dependencies')
      }
    } catch (e) {
      // npm audit returns non-zero exit code when vulnerabilities found
      try {
        const audit = JSON.parse(e.stdout)
        this.results.npmAudit = {
          vulnerabilities: audit.metadata.vulnerabilities,
          totalDependencies: audit.metadata.totalDependencies
        }
      } catch (parseError) {
        console.error('❌ Failed to parse npm audit results')
      }
    }
  }

  scanPackage (packageName) {
    console.log(`\n📦 Checking ${packageName}...`)

    const packagePath = path.join(__dirname, '..', 'node_modules', packageName)
    if (!fs.existsSync(packagePath)) {
      console.log('   ⚠️  Package not found in node_modules')
      this.results.packages[packageName] = { status: 'NOT_FOUND' }
      return
    }

    // Get package info
    const packageJsonPath = path.join(packagePath, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    this.results.packages[packageName] = {
      version: packageJson.version,
      license: packageJson.license,
      homepage: packageJson.homepage,
      repository: packageJson.repository,
      findings: [],
      fileCount: 0,
      suspiciousFiles: []
    }

    // Scan all JS files in the package
    const jsFiles = this.findJsFiles(packagePath)
    this.results.packages[packageName].fileCount = jsFiles.length

    console.log(`   📁 Scanning ${jsFiles.length} JavaScript files...`)

    for (const file of jsFiles) {
      const relativePath = path.relative(packagePath, file)
      const content = fs.readFileSync(file, 'utf8')

      // Check for suspicious patterns
      for (const check of SUSPICIOUS_PATTERNS) {
        const matches = content.match(check.pattern)
        if (matches) {
          this.results.packages[packageName].findings.push({
            file: relativePath,
            pattern: check.pattern.toString(),
            risk: check.risk,
            description: check.description,
            occurrences: matches.length
          })

          if (!this.results.packages[packageName].suspiciousFiles.includes(relativePath)) {
            this.results.packages[packageName].suspiciousFiles.push(relativePath)
          }
        }
      }
    }

    // Update summary
    const findings = this.results.packages[packageName].findings
    if (findings.length === 0) {
      console.log('   ✅ No suspicious patterns found')
      this.results.summary.safe++
    } else {
      const risks = findings.map(f => f.risk)
      if (risks.includes('CRITICAL')) this.results.summary.critical++
      else if (risks.includes('HIGH')) this.results.summary.high++
      else if (risks.includes('MEDIUM')) this.results.summary.medium++
      else this.results.summary.low++

      console.log(`   ⚠️  Found ${findings.length} suspicious patterns`)
    }
  }

  findJsFiles (dir, files = []) {
    // Skip test and example directories
    const skipDirs = ['test', 'tests', 'example', 'examples', 'docs', '.git', 'coverage']

    try {
      const items = fs.readdirSync(dir)
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          if (!skipDirs.includes(item) && !item.startsWith('.')) {
            this.findJsFiles(fullPath, files)
          }
        } else if (item.endsWith('.js') || item.endsWith('.mjs')) {
          files.push(fullPath)
        }
      }
    } catch (e) {
      // Permission errors, etc.
    }

    return files
  }

  checkWinstonSpecifically () {
    console.log('\n🔎 Deep analysis of winston package...')

    // Check winston's network usage
    const winstonPath = path.join(__dirname, '..', 'node_modules', 'winston')
    if (!fs.existsSync(winstonPath)) {
      console.log('   Winston not found')
      return
    }

    // Check for any postinstall scripts
    const packageJsonPath = path.join(winstonPath, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    if (packageJson.scripts) {
      if (packageJson.scripts.postinstall) {
        console.log(`   ⚠️  Has postinstall script: ${packageJson.scripts.postinstall}`)
        this.results.packages.winston.postinstall = packageJson.scripts.postinstall
      }
      if (packageJson.scripts.preinstall) {
        console.log(`   ⚠️  Has preinstall script: ${packageJson.scripts.preinstall}`)
        this.results.packages.winston.preinstall = packageJson.scripts.preinstall
      }
    }

    // Check main transports
    const transportsPath = path.join(winstonPath, 'lib', 'winston', 'transports')
    if (fs.existsSync(transportsPath)) {
      const transports = fs.readdirSync(transportsPath)
      console.log(`   📡 Available transports: ${transports.join(', ')}`)
      this.results.packages.winston.transports = transports
    }

    console.log('   ✅ Winston appears to be clean')
  }

  generateReport () {
    console.log('\n' + '='.repeat(60))
    console.log('SECURITY SCAN REPORT')
    console.log('='.repeat(60))

    console.log('\n📊 Summary:')
    console.log(`   Critical Issues: ${this.results.summary.critical}`)
    console.log(`   High Risk: ${this.results.summary.high}`)
    console.log(`   Medium Risk: ${this.results.summary.medium}`)
    console.log(`   Low Risk: ${this.results.summary.low}`)
    console.log(`   Safe Packages: ${this.results.summary.safe}`)

    if (this.results.npmAudit) {
      console.log('\n🛡️  NPM Audit (Production):')
      const vulns = this.results.npmAudit.vulnerabilities
      console.log(`   Total: ${vulns.total || 0}`)
      if (vulns.critical) console.log(`   Critical: ${vulns.critical}`)
      if (vulns.high) console.log(`   High: ${vulns.high}`)
      if (vulns.moderate) console.log(`   Moderate: ${vulns.moderate}`)
      if (vulns.low) console.log(`   Low: ${vulns.low}`)
    }

    // Detailed findings for packages with issues
    console.log('\n📋 Detailed Findings:')
    for (const [pkg, data] of Object.entries(this.results.packages)) {
      if (data.findings && data.findings.length > 0) {
        console.log(`\n   ${pkg} v${data.version}:`)
        const byRisk = {}
        for (const finding of data.findings) {
          if (!byRisk[finding.risk]) byRisk[finding.risk] = []
          byRisk[finding.risk].push(finding)
        }

        for (const [risk, findings] of Object.entries(byRisk)) {
          console.log(`     ${risk} Risk:`)
          for (const f of findings.slice(0, 3)) { // Show max 3 per risk level
            console.log(`       - ${f.description} in ${f.file}`)
          }
          if (findings.length > 3) {
            console.log(`       ... and ${findings.length - 3} more`)
          }
        }
      }
    }

    // Save detailed report
    const reportPath = path.join(__dirname, '..', 'security-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2))
    console.log('\n💾 Detailed report saved to: security-report.json')

    // Overall assessment
    console.log('\n' + '='.repeat(60))
    if (this.results.summary.critical > 0) {
      console.log('⛔ CRITICAL SECURITY ISSUES FOUND - IMMEDIATE ACTION REQUIRED')
    } else if (this.results.summary.high > 0) {
      console.log('⚠️  HIGH RISK ISSUES FOUND - Review and remediate')
    } else if (this.results.summary.medium > 0) {
      console.log('⚡ MEDIUM RISK ISSUES - Monitor and plan remediation')
    } else {
      console.log('✅ No significant security issues detected')
    }
    console.log('='.repeat(60))
  }

  async run () {
    console.log('🚀 Starting Security Scan...\n')

    // Run npm audit
    await this.runNpmAudit()

    // Check specific packages
    for (const pkg of PACKAGES_TO_CHECK) {
      this.scanPackage(pkg)
    }

    // Deep check winston
    this.checkWinstonSpecifically()

    // Generate report
    this.generateReport()
  }
}

// Run the security check
const checker = new SecurityChecker()
checker.run().catch(console.error)
