# Node Modules Security Guide

## 🛡️ Comprehensive Security Scanning Tools

### Quick Security Check
```bash
# NPM built-in audit
npm audit

# Fix automatically fixable issues
npm audit fix

# Force fixes (use with caution)
npm audit fix --force
```

### Custom Security Scripts

I've created two powerful security scanning scripts for your project:

#### 1. **Security Scanner** (`scripts/security-scan.sh`)
Comprehensive bash script that performs:
- NPM vulnerability audit
- Obfuscated code detection
- Malicious pattern scanning
- File permission checks
- Hidden file detection
- Package script analysis
- Large/unusual file detection
- Typosquatting detection

**Usage:**
```bash
./scripts/security-scan.sh
```

#### 2. **Dependency Checker** (`scripts/check-dependencies.js`)
Node.js security analyzer that checks:
- Typosquatting attempts
- Postinstall script analysis
- Code obfuscation detection
- Hidden file scanning
- Recent publication dates (supply chain attacks)

**Usage:**
```bash
node scripts/check-dependencies.js
```

## 🔍 Common Attack Vectors

### 1. **Supply Chain Attacks**
- Malicious packages disguised as legitimate ones
- Compromised popular packages
- Typosquatting (similar names to popular packages)

### 2. **Obfuscated Malware**
**Indicators:**
- Variables like `_0x1234`, `const_0x112`
- Heavy use of `eval()`, `Function()`
- Base64 encoded strings
- Hex-encoded payloads

### 3. **Cryptominers**
**Keywords to search:**
- `cryptonight`, `coinhive`, `crypto-loot`
- Unusual CPU usage patterns

### 4. **Data Exfiltration**
**Suspicious patterns:**
- Unexplained network requests
- Access to environment variables
- File system scanning

## 🚨 Manual Security Checks

### Search for Suspicious Patterns
```bash
# Find obfuscated code
grep -r "_0x[0-9a-f]\{4,\}\|eval(\|Function(" node_modules/

# Find network operations
grep -r "require('child_process')\|exec(\|spawn(" node_modules/

# Find crypto mining
grep -r "cryptonight\|coinhive\|crypto-loot" node_modules/

# Find base64 encoded content
grep -r "[A-Za-z0-9+/]\{50,\}=" node_modules/
```

### Check Package Integrity
```bash
# Verify package checksums
npm ls --depth=0 --json | jq '.dependencies | keys[]' | xargs -I {} npm pack {} --dry-run

# Check for modified files
npm ls --depth=0 --json | jq '.dependencies | keys[]' | xargs -I {} sh -c 'echo "Checking {}" && npm diff {}'
```

## 🛠️ Professional Security Tools

### 1. **Snyk** (Recommended)
```bash
# Install globally
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor

# Auto-fix vulnerabilities
snyk wizard
```

### 2. **Socket Security**
```bash
# Install Socket CLI
npm install -g @socketsecurity/cli

# Scan project
socket scan
```

### 3. **npm-check-updates**
```bash
# Install
npm install -g npm-check-updates

# Check outdated packages
ncu

# Update package.json
ncu -u
```

### 4. **OSS Security Tools**
```bash
# Retire.js - Check for vulnerable JS libraries
npm install -g retire
retire

# bundlesize - Monitor bundle sizes
npm install -g bundlesize
bundlesize

# depcheck - Find unused dependencies
npm install -g depcheck
depcheck
```

## 📋 Security Best Practices

### 1. **Prevention**
- ✅ Use `package-lock.json` to lock dependency versions
- ✅ Enable 2FA on npm account
- ✅ Review `postinstall` scripts before installation
- ✅ Use `--ignore-scripts` flag when installing untrusted packages
- ✅ Regularly update dependencies
- ✅ Use `.npmrc` with `save-exact=true` for exact versions

### 2. **package.json Configuration**
```json
{
  "scripts": {
    "preinstall": "npx only-allow npm",
    "audit": "npm audit --audit-level=moderate",
    "security": "./scripts/security-scan.sh"
  }
}
```

### 3. **CI/CD Integration**
```yaml
# GitHub Actions example
- name: Security Audit
  run: |
    npm audit --audit-level=moderate
    npm run security
```

### 4. **.npmrc Security Settings**
```ini
# Disable scripts on install
ignore-scripts=true

# Use exact versions
save-exact=true

# Audit on install
audit=true
audit-level=moderate

# Use official registry only
registry=https://registry.npmjs.org/
```

## 🔐 Incident Response

If you find malicious code:

1. **Isolate**: Don't run the project
2. **Document**: Save evidence (file paths, code snippets)
3. **Remove**: `npm uninstall <malicious-package>`
4. **Clean**: `rm -rf node_modules && npm install`
5. **Report**: Report to npm security team
6. **Audit**: Run full security scan

## 📊 Current Security Status

Based on the scan:
- **54 vulnerabilities found** (8 critical, 20 high, 23 moderate, 3 low)
- **Action Required**: Run `npm audit fix` to resolve fixable issues

## 🎯 Quick Actions

```bash
# 1. Fix vulnerabilities
npm audit fix

# 2. Run custom security scan
./scripts/security-scan.sh

# 3. Check dependencies
node scripts/check-dependencies.js

# 4. Update all packages
npm update

# 5. Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [NPM Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [Snyk Vulnerability Database](https://security.snyk.io/)
- [Socket.dev Package Analysis](https://socket.dev/)