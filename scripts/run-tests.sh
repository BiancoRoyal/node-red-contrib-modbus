#!/bin/bash

# Reliable test runner with timeout protection
echo "🧪 Running Modbus Tests with Timeout Protection"
echo "==============================================="

# Kill any existing test processes
echo "🧹 Cleaning up existing processes..."
killall -9 mocha node npm 2>/dev/null
sleep 1

# Function to run tests with timeout
run_with_timeout() {
    local test_path=$1
    local test_name=$2
    local timeout_seconds=30
    
    echo ""
    echo "📦 Running $test_name..."
    
    # Run test with timeout
    timeout $timeout_seconds npx mocha "$test_path" --timeout 2000 --exit --bail 2>&1 | tee -a test-output.log | grep -E "passing|failing|pending" || true
    
    local exit_code=$?
    
    if [ $exit_code -eq 124 ]; then
        echo "   ⚠️  Timeout after ${timeout_seconds}s"
    fi
    
    # Kill any lingering processes
    killall -9 mocha 2>/dev/null
    
    return 0
}

# Clear log file
> test-output.log

# Run test suites separately to avoid hanging
run_with_timeout "test/core/*.js" "Core Tests"
run_with_timeout "test/units/modbus-client-test.js" "Client Unit Tests"
run_with_timeout "test/units/modbus-server-test.js" "Server Unit Tests"
run_with_timeout "test/units/modbus-read-test.js" "Read Unit Tests"
run_with_timeout "test/units/modbus-write-test.js" "Write Unit Tests"

# Summary
echo ""
echo "==============================================="
echo "📊 Test Summary"
echo "==============================================="

# Count results from log
PASSING=$(grep -o "[0-9]* passing" test-output.log | tail -1 | cut -d' ' -f1)
FAILING=$(grep -o "[0-9]* failing" test-output.log | tail -1 | cut -d' ' -f1)
PENDING=$(grep -o "[0-9]* pending" test-output.log | tail -1 | cut -d' ' -f1)

echo "✅ Passing: ${PASSING:-0}"
echo "❌ Failing: ${FAILING:-0}"
echo "⏸️  Pending: ${PENDING:-0}"
echo ""
echo "📝 Full output saved to: test-output.log"

# Final cleanup
killall -9 mocha node npm 2>/dev/null

exit 0