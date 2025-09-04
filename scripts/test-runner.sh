#!/bin/bash
# Test Runner with Force Termination for Node-RED Modbus Tests
# Prevents hanging tests by enforcing hard timeouts

set -e

# Configuration
MAX_TEST_TIME=30      # Maximum time for any single test in seconds
CLEANUP_DELAY=2       # Time to wait after test completion for cleanup
FORCE_KILL_DELAY=3    # Time to wait before force killing

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track running processes
declare -a TEST_PIDS=()
declare -a CHILD_PIDS=()

# Cleanup function
cleanup() {
    echo -e "${YELLOW}🧹 Starting comprehensive cleanup...${NC}"
    
    # Kill all tracked test processes
    for pid in "${TEST_PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            echo "🔴 Force killing test process $pid"
            kill -9 "$pid" 2>/dev/null || true
        fi
    done
    
    # Kill all tracked child processes  
    for pid in "${CHILD_PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            echo "🔴 Force killing child process $pid"
            kill -9 "$pid" 2>/dev/null || true
        fi
    done
    
    # Kill any remaining mocha processes
    pkill -f "mocha.*modbus" 2>/dev/null || true
    pkill -f "node.*test" 2>/dev/null || true
    
    # Clean up any leftover Node-RED processes
    pkill -f "node-red" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Set up trap for script interruption
trap cleanup EXIT INT TERM

# Function to run a single test file with timeout
run_test_with_timeout() {
    local test_file="$1"
    local timeout="${2:-$MAX_TEST_TIME}"
    
    echo -e "${YELLOW}🧪 Running test: $test_file${NC}"
    
    # Start test in background and get PID
    npx mocha "$test_file" --timeout 5000 --exit --reporter spec &
    local test_pid=$!
    TEST_PIDS+=($test_pid)
    
    echo "📍 Test process started with PID: $test_pid"
    
    # Wait for test or timeout
    local elapsed=0
    while kill -0 "$test_pid" 2>/dev/null; do
        if [ $elapsed -ge $timeout ]; then
            echo -e "${RED}⏰ Test timeout reached ($timeout seconds)${NC}"
            
            # Get child processes
            local children=$(pgrep -P "$test_pid" 2>/dev/null || true)
            for child in $children; do
                CHILD_PIDS+=($child)
                echo "📍 Found child process: $child"
            done
            
            # Try graceful termination first
            echo "🛑 Sending SIGTERM to test process $test_pid"
            kill -TERM "$test_pid" 2>/dev/null || true
            
            # Wait briefly for graceful termination
            sleep $FORCE_KILL_DELAY
            
            # Force kill if still running
            if kill -0 "$test_pid" 2>/dev/null; then
                echo -e "${RED}💀 Force killing stuck test process $test_pid${NC}"
                kill -9 "$test_pid" 2>/dev/null || true
            fi
            
            # Force kill children
            for child in "${CHILD_PIDS[@]}"; do
                if kill -0 "$child" 2>/dev/null; then
                    echo "💀 Force killing child process $child"
                    kill -9 "$child" 2>/dev/null || true
                fi
            done
            
            echo -e "${RED}❌ Test failed due to timeout${NC}"
            return 1
        fi
        
        sleep 1
        ((elapsed++))
        
        # Show progress every 5 seconds
        if [ $((elapsed % 5)) -eq 0 ]; then
            echo "⏳ Test running... ${elapsed}/${timeout}s"
        fi
    done
    
    # Test completed, wait for process to finish
    wait "$test_pid"
    local exit_code=$?
    
    # Small delay for cleanup
    sleep $CLEANUP_DELAY
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ Test completed successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Test failed with exit code $exit_code${NC}"
        return $exit_code
    fi
}

# Function to check for hanging processes
check_for_hanging_processes() {
    echo -e "${YELLOW}🔍 Checking for hanging processes...${NC}"
    
    # Check for hanging mocha processes
    local hanging_mocha=$(pgrep -f "mocha.*modbus" | wc -l)
    if [ $hanging_mocha -gt 0 ]; then
        echo -e "${RED}⚠️ Found $hanging_mocha hanging mocha processes${NC}"
        pgrep -f "mocha.*modbus" | xargs kill -9 2>/dev/null || true
    fi
    
    # Check for hanging node processes
    local hanging_node=$(pgrep -f "node.*test" | wc -l)
    if [ $hanging_node -gt 0 ]; then
        echo -e "${RED}⚠️ Found $hanging_node hanging node processes${NC}"
        pgrep -f "node.*test" | xargs kill -9 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Process check completed${NC}"
}

# Function to run all tests in a directory
run_test_directory() {
    local test_dir="$1"
    local pattern="${2:-*.test.js}"
    
    echo -e "${YELLOW}📁 Running tests in directory: $test_dir${NC}"
    echo -e "${YELLOW}🔍 Pattern: $pattern${NC}"
    
    local passed=0
    local failed=0
    local total=0
    
    # Find test files
    while IFS= read -r -d '' test_file; do
        ((total++))
        echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}📋 Test $total: $(basename "$test_file")${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        if run_test_with_timeout "$test_file"; then
            ((passed++))
            echo -e "${GREEN}✅ Test passed${NC}"
        else
            ((failed++))
            echo -e "${RED}❌ Test failed${NC}"
        fi
        
        # Check for hanging processes after each test
        check_for_hanging_processes
        
        # Brief pause between tests
        sleep 1
        
    done < <(find "$test_dir" -name "$pattern" -type f -print0)
    
    # Summary
    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📊 Test Summary${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "📝 Total tests: $total"
    echo -e "${GREEN}✅ Passed: $passed${NC}"
    echo -e "${RED}❌ Failed: $failed${NC}"
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}💥 Some tests failed${NC}"
        return 1
    fi
}

# Function to run a single test
run_single_test() {
    local test_file="$1"
    
    if [ ! -f "$test_file" ]; then
        echo -e "${RED}❌ Test file not found: $test_file${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🎯 Running single test: $test_file${NC}"
    run_test_with_timeout "$test_file"
}

# Function to show debug info for hanging processes
debug_hanging_processes() {
    echo -e "${YELLOW}🔍 Debugging hanging processes...${NC}"
    
    # Show all node processes
    echo -e "\n${YELLOW}📋 All Node.js processes:${NC}"
    pgrep -f node | while read pid; do
        echo "PID: $pid - $(ps -p $pid -o command= 2>/dev/null || echo 'Process not found')"
    done
    
    # Show all mocha processes  
    echo -e "\n${YELLOW}📋 All Mocha processes:${NC}"
    pgrep -f mocha | while read pid; do
        echo "PID: $pid - $(ps -p $pid -o command= 2>/dev/null || echo 'Process not found')"
    done
    
    # Show listening ports
    echo -e "\n${YELLOW}📋 Listening ports (Node.js):${NC}"
    lsof -i -P -n | grep node || echo "No node processes listening"
    
    # Show system resources
    echo -e "\n${YELLOW}📋 System resources:${NC}"
    echo "Memory: $(free -h 2>/dev/null || echo 'N/A (not Linux)')"
    echo "Load: $(uptime)"
}

# Main script logic
main() {
    echo -e "${GREEN}🚀 Node-RED Modbus Test Runner${NC}"
    echo -e "${GREEN}=================================${NC}"
    
    case "${1:-help}" in
        "single")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ Usage: $0 single <test-file>${NC}"
                exit 1
            fi
            run_single_test "$2"
            ;;
        "directory"|"dir")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ Usage: $0 directory <test-directory> [pattern]${NC}"
                exit 1
            fi
            run_test_directory "$2" "${3:-*.test.js}"
            ;;
        "units")
            run_test_directory "test/units" "*.test.js"
            ;;
        "e2e")
            run_test_directory "test/e2e" "*.test.js"
            ;;
        "all")
            echo -e "${YELLOW}🎯 Running all tests...${NC}"
            local overall_result=0
            
            if ! run_test_directory "test/units" "*.test.js"; then
                overall_result=1
            fi
            
            if ! run_test_directory "test/e2e" "*.test.js"; then
                overall_result=1
            fi
            
            exit $overall_result
            ;;
        "debug")
            debug_hanging_processes
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|*)
            echo -e "${YELLOW}📖 Usage:${NC}"
            echo "  $0 single <test-file>              - Run single test file"
            echo "  $0 directory <dir> [pattern]       - Run all tests in directory"
            echo "  $0 units                           - Run all unit tests"
            echo "  $0 e2e                             - Run all e2e tests"
            echo "  $0 all                             - Run all tests"
            echo "  $0 debug                           - Show debugging info"
            echo "  $0 cleanup                         - Force cleanup processes"
            echo "  $0 help                            - Show this help"
            echo ""
            echo -e "${YELLOW}📝 Examples:${NC}"
            echo "  $0 single test/units/modbus-real-flow-fixed.test.js"
            echo "  $0 directory test/units '*.test.js'"
            echo "  $0 units"
            exit 0
            ;;
    esac
}

# Run main function with all arguments
main "$@"