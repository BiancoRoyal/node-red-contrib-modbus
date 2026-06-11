#!/bin/bash

# Security Scanner for node_modules
# Comprehensive security analysis for Node.js dependencies

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SCAN_REPORT="$PROJECT_ROOT/security-scan-report.txt"
SUSPICIOUS_PATTERNS="$PROJECT_ROOT/suspicious-patterns.txt"

echo "========================================="
echo "Node Modules Security Scanner"
echo "========================================="
echo "Scan started at: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Initialize report
cat > "$SCAN_REPORT" << EOF
Security Scan Report
Generated: $(date)
Project: $PROJECT_ROOT
================================================================================

EOF

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "error")
            echo -e "${RED}[!] $message${NC}"
            echo "[!] $message" >> "$SCAN_REPORT"
            ;;
        "warning")
            echo -e "${YELLOW}[*] $message${NC}"
            echo "[*] $message" >> "$SCAN_REPORT"
            ;;
        "success")
            echo -e "${GREEN}[✓] $message${NC}"
            echo "[✓] $message" >> "$SCAN_REPORT"
            ;;
        *)
            echo "[-] $message"
            echo "[-] $message" >> "$SCAN_REPORT"
            ;;
    esac
}

# 1. NPM Audit Check
echo "1. Running NPM Security Audit..." | tee -a "$SCAN_REPORT"
echo "----------------------------------------" | tee -a "$SCAN_REPORT"
npm audit --json 2>/dev/null | jq -r '.metadata.vulnerabilities' >> "$SCAN_REPORT" 2>/dev/null || npm audit >> "$SCAN_REPORT"

CRITICAL=$(npm audit --json 2>/dev/null | jq -r '.metadata.vulnerabilities.critical' 2>/dev/null || echo "0")
HIGH=$(npm audit --json 2>/dev/null | jq -r '.metadata.vulnerabilities.high' 2>/dev/null || echo "0")

if [ "$CRITICAL" -gt 0 ]; then
    print_status "error" "Found $CRITICAL CRITICAL vulnerabilities!"
elif [ "$HIGH" -gt 0 ]; then
    print_status "warning" "Found $HIGH HIGH vulnerabilities"
else
    print_status "success" "No critical or high vulnerabilities found"
fi
echo ""

# 2. Check for known malicious patterns
echo "2. Scanning for Obfuscated/Malicious Code..." | tee -a "$SCAN_REPORT"
echo "----------------------------------------" | tee -a "$SCAN_REPORT"

# Patterns that indicate obfuscation or malicious code
PATTERNS=(
    # Obfuscated variable names
    "const_0x[0-9a-f]{3,}"
    "_0x[0-9a-f]{4,}"

    # Dangerous functions
    "eval\s*\("
    "Function\s*\("
    "new\s+Function"

    # Base64 encoded long strings (potential payloads)
    "[A-Za-z0-9+/]{100,}={0,2}"

    # Hex encoded strings
    "\\\\x[0-9a-f]{2}\\\\x[0-9a-f]{2}\\\\x[0-9a-f]{2}"

    # Suspicious network activity
    "require\(['\"]child_process['\"]\)"
    "exec\s*\("
    "execSync\s*\("
    "spawn\s*\("

    # Crypto mining indicators
    "cryptonight"
    "coinhive"
    "crypto-loot"
    "coin-hive"

    # Suspicious domains
    "pastebin\.com"
    "hastebin\.com"
    "raw\.githubusercontent\.com.*exec"
)

FOUND_SUSPICIOUS=0
> "$SUSPICIOUS_PATTERNS"

for pattern in "${PATTERNS[@]}"; do
    echo "Checking for: $pattern" >> "$SUSPICIOUS_PATTERNS"
    RESULTS=$(find "$PROJECT_ROOT/node_modules" -name "*.js" -type f -exec grep -l -E "$pattern" {} \; 2>/dev/null | head -20)
    if [ -n "$RESULTS" ]; then
        FOUND_SUSPICIOUS=$((FOUND_SUSPICIOUS + 1))
        echo "  Found in:" >> "$SUSPICIOUS_PATTERNS"
        echo "$RESULTS" | head -10 >> "$SUSPICIOUS_PATTERNS"
        echo "" >> "$SUSPICIOUS_PATTERNS"
    fi
done

if [ $FOUND_SUSPICIOUS -gt 0 ]; then
    print_status "warning" "Found $FOUND_SUSPICIOUS suspicious patterns (see suspicious-patterns.txt for details)"
else
    print_status "success" "No obviously malicious patterns detected"
fi
echo ""

# 3. Check for unusual file permissions
echo "3. Checking File Permissions..." | tee -a "$SCAN_REPORT"
echo "----------------------------------------" | tee -a "$SCAN_REPORT"
EXEC_FILES=$(find "$PROJECT_ROOT/node_modules" -type f -perm +111 -name "*.js" 2>/dev/null | wc -l)
if [ $EXEC_FILES -gt 0 ]; then
    print_status "warning" "Found $EXEC_FILES JavaScript files with execute permissions"
else
    print_status "success" "No suspicious file permissions found"
fi
echo ""

# 4. Check for hidden files
echo "4. Checking for Hidden Files..." | tee -a "$SCAN_REPORT"
echo "----------------------------------------" | tee -a "$SCAN_REPORT"
HIDDEN_FILES=$(find "$PROJECT_ROOT/node_modules" -name ".*" -type f ! -name ".npmignore" ! -name ".gitignore" ! -name ".eslintrc*" ! -name ".prettierrc*" 2>/dev/null | wc -l)
if [ $HIDDEN_FILES -gt 0 ]; then
    print_status "warning" "Found $HIDDEN_FILES hidden files in node_modules"
    find "$PROJECT_ROOT/node_modules" -name ".*" -type f ! -name ".npmignore" ! -name ".gitignore" ! -name ".eslintrc*" ! -name ".prettierrc*" 2>/dev/null | head -10 >> "$SCAN_REPORT"
else
    print_status "success" "No suspicious hidden files found"
fi
echo ""

# 5. Check package.json scripts for suspicious commands
echo "5. Checking package.json Scripts..." | tee -a "$SCAN_REPORT"
echo "----------------------------------------" | tee -a "$SCAN_REPORT"
SUSPICIOUS_SCRIPTS=$(find "$PROJECT_ROOT/node_modules" -name "package.json" -exec grep -l "curl\|wget\|nc\|/bin/sh\|bash -c\|powershell" {} \; 2>/dev/null | wc -l)
if [ $SUSPICIOUS_SCRIPTS -gt 0 ]; then
    print_status "warning" "Found $SUSPICIOUS_SCRIPTS packages with potentially suspicious scripts"
    find "$PROJECT_ROOT/node_modules" -name "package.json" -exec grep -l "curl\|wget\|nc\|/bin/sh\|bash -c\|powershell" {} \; 2>/dev/null | head -10 >> "$SCAN_REPORT"
else
    print_status "success" "No suspicious package scripts found"
fi
echo ""

# 6. Check for packages with postinstall scripts
echo "6. Checking Postinstall Scripts..." | tee -a "$SCAN_REPORT"
echo "----------------------------------------" | tee -a "$SCAN_REPORT"
POSTINSTALL=$(find "$PROJECT_ROOT/node_modules" -name "package.json" -exec grep -l "postinstall\|preinstall\|install\":" {} \; 2>/dev/null | wc -l)
if [ $POSTINSTALL -gt 10 ]; then
    print_status "warning" "Found $POSTINSTALL packages with install scripts (review these manually)"
else
    print_status "info" "Found $POSTINSTALL packages with install scripts"
fi
echo ""

# 7. Check for large or unusual files
echo "7. Checking for Unusual Files..." | tee -a "$SCAN_REPORT"
echo "----------------------------------------" | tee -a "$SCAN_REPORT"
LARGE_FILES=$(find "$PROJECT_ROOT/node_modules" -type f -size +5M ! -name "*.map" ! -name "*.wasm" 2>/dev/null | wc -l)
if [ $LARGE_FILES -gt 0 ]; then
    print_status "warning" "Found $LARGE_FILES unusually large files (>5MB)"
    find "$PROJECT_ROOT/node_modules" -type f -size +5M ! -name "*.map" ! -name "*.wasm" -exec ls -lh {} \; 2>/dev/null | head -10 >> "$SCAN_REPORT"
else
    print_status "success" "No unusually large files found"
fi
echo ""

# 8. Check for typosquatting
echo "8. Checking for Potential Typosquatting..." | tee -a "$SCAN_REPORT"
echo "----------------------------------------" | tee -a "$SCAN_REPORT"
# Common typosquatting patterns
TYPOSQUATS=$(find "$PROJECT_ROOT/node_modules" -maxdepth 1 -type d -name "*crossenv*" -o -name "*cross-env*" -o -name "*event-stream*" -o -name "*flatmap-stream*" -o -name "*eslint-scope*" -o -name "*eslint-config*" 2>/dev/null | grep -v "cross-env$" | grep -v "eslint-scope$" | grep -v "eslint-config-" | wc -l)
if [ $TYPOSQUATS -gt 0 ]; then
    print_status "error" "Potential typosquatting packages detected!"
else
    print_status "success" "No obvious typosquatting detected"
fi
echo ""

# Summary
echo "=========================================" | tee -a "$SCAN_REPORT"
echo "SCAN COMPLETE" | tee -a "$SCAN_REPORT"
echo "=========================================" | tee -a "$SCAN_REPORT"
echo "" | tee -a "$SCAN_REPORT"
echo "Report saved to: $SCAN_REPORT"
echo "Suspicious patterns saved to: $SUSPICIOUS_PATTERNS"
echo ""
echo "Recommended actions:"
echo "1. Run 'npm audit fix' to auto-fix vulnerabilities"
echo "2. Review packages with high/critical vulnerabilities"
echo "3. Manually inspect any suspicious files found"
echo "4. Consider using 'npm-check-updates' for outdated packages"
echo "5. Use 'snyk' or 'socket.dev' for continuous monitoring"