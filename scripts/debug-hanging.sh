#!/bin/bash
# Debug Hanging Test Processes
# Comprehensive debugging for Node-RED Modbus test issues

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}🔍 Node-RED Modbus Test Debug Utility${NC}"
echo -e "${GREEN}=====================================${NC}"

# Function to show process tree
show_process_tree() {
    echo -e "\n${YELLOW}🌳 Process Tree (Node.js processes):${NC}"
    
    # Find all node processes and show hierarchy
    pgrep -f node | while read pid; do
        local cmd=$(ps -p $pid -o command= 2>/dev/null || echo "Process not found")
        local ppid=$(ps -p $pid -o ppid= 2>/dev/null | tr -d ' ' || echo "0")
        local cpu=$(ps -p $pid -o %cpu= 2>/dev/null | tr -d ' ' || echo "0")
        local mem=$(ps -p $pid -o %mem= 2>/dev/null | tr -d ' ' || echo "0")
        local time=$(ps -p $pid -o time= 2>/dev/null | tr -d ' ' || echo "0")
        
        echo -e "${CYAN}PID: $pid${NC} (Parent: $ppid) CPU: ${cpu}% MEM: ${mem}% TIME: $time"
        echo -e "  └─ $cmd"
        
        # Show child processes
        local children=$(pgrep -P $pid 2>/dev/null || true)
        if [ -n "$children" ]; then
            for child in $children; do
                local child_cmd=$(ps -p $child -o command= 2>/dev/null || echo "Process not found")
                echo -e "     └─ ${BLUE}Child PID: $child${NC} - $child_cmd"
            done
        fi
        echo ""
    done
}

# Function to show network connections
show_network_connections() {
    echo -e "\n${YELLOW}🌐 Network Connections (Node.js processes):${NC}"
    
    if command -v lsof >/dev/null 2>&1; then
        local connections=$(lsof -i -P -n | grep node || true)
        if [ -n "$connections" ]; then
            echo "$connections" | while read line; do
                echo -e "${CYAN}$line${NC}"
            done
        else
            echo "No network connections found for node processes"
        fi
    else
        echo "lsof not available, skipping network analysis"
    fi
}

# Function to show file descriptors
show_file_descriptors() {
    echo -e "\n${YELLOW}📁 File Descriptors (Node.js processes):${NC}"
    
    pgrep -f node | while read pid; do
        local cmd=$(ps -p $pid -o command= 2>/dev/null | head -c 80 || echo "Process not found")
        local fd_count=$(ls /proc/$pid/fd 2>/dev/null | wc -l || echo "N/A")
        
        if [ "$fd_count" != "N/A" ] && [ "$fd_count" -gt 0 ]; then
            echo -e "${CYAN}PID: $pid${NC} - FDs: $fd_count - $cmd"
            
            # Show some file descriptors if high count
            if [ "$fd_count" -gt 50 ]; then
                echo -e "${YELLOW}  ⚠️ High FD count, showing first 10:${NC}"
                ls -la /proc/$pid/fd 2>/dev/null | head -10 | while read line; do
                    echo "    $line"
                done
            fi
        fi
    done
}

# Function to show memory usage
show_memory_usage() {
    echo -e "\n${YELLOW}🧠 Memory Usage (Node.js processes):${NC}"
    
    echo -e "${CYAN}PID       %MEM    RSS      VSZ      COMMAND${NC}"
    ps -eo pid,%mem,rss,vsz,command | grep node | head -10 | while read line; do
        echo "$line"
    done
}

# Function to check for test-related processes
check_test_processes() {
    echo -e "\n${YELLOW}🧪 Test-Related Processes:${NC}"
    
    # Mocha processes
    echo -e "${BLUE}Mocha processes:${NC}"
    pgrep -f mocha | while read pid; do
        local cmd=$(ps -p $pid -o command= 2>/dev/null || echo "Process not found")
        local time=$(ps -p $pid -o etime= 2>/dev/null | tr -d ' ' || echo "0")
        echo -e "  ${CYAN}PID: $pid${NC} (Running: $time) - $cmd"
    done || echo "  No mocha processes found"
    
    # Node-RED test helper processes
    echo -e "${BLUE}Node-RED helper processes:${NC}"
    pgrep -f "node-red" | while read pid; do
        local cmd=$(ps -p $pid -o command= 2>/dev/null || echo "Process not found")
        local time=$(ps -p $pid -o etime= 2>/dev/null | tr -d ' ' || echo "0")
        echo -e "  ${CYAN}PID: $pid${NC} (Running: $time) - $cmd"
    done || echo "  No node-red processes found"
    
    # Modbus-related processes
    echo -e "${BLUE}Modbus-related processes:${NC}"
    pgrep -f modbus | while read pid; do
        local cmd=$(ps -p $pid -o command= 2>/dev/null || echo "Process not found")
        local time=$(ps -p $pid -o etime= 2>/dev/null | tr -d ' ' || echo "0")
        echo -e "  ${CYAN}PID: $pid${NC} (Running: $time) - $cmd"
    done || echo "  No modbus-related processes found"
}

# Function to check ports in use
check_ports() {
    echo -e "\n${YELLOW}🔌 Ports in Use:${NC}"
    
    if command -v netstat >/dev/null 2>&1; then
        echo -e "${BLUE}Listening ports:${NC}"
        netstat -tlnp 2>/dev/null | grep LISTEN | grep node || echo "  No node processes listening"
        
        echo -e "${BLUE}Ports in TIME_WAIT:${NC}"
        netstat -an | grep TIME_WAIT | wc -l | xargs echo "  TIME_WAIT connections:"
    elif command -v ss >/dev/null 2>&1; then
        echo -e "${BLUE}Listening ports (ss):${NC}"
        ss -tlnp | grep node || echo "  No node processes listening"
    else
        echo "Neither netstat nor ss available, skipping port analysis"
    fi
}

# Function to show system resources
show_system_resources() {
    echo -e "\n${YELLOW}⚡ System Resources:${NC}"
    
    # Load average
    echo -e "${BLUE}Load average:${NC} $(uptime | awk -F'load average:' '{ print $NF }')"
    
    # Memory
    if command -v free >/dev/null 2>&1; then
        echo -e "${BLUE}Memory:${NC}"
        free -h | while read line; do echo "  $line"; done
    fi
    
    # Disk space for tmp
    echo -e "${BLUE}Disk space (/tmp):${NC}"
    df -h /tmp | tail -n 1 | while read line; do echo "  $line"; done
    
    # Number of processes
    echo -e "${BLUE}Process count:${NC} $(ps aux | wc -l) total processes"
}

# Function to analyze stuck states
analyze_stuck_states() {
    echo -e "\n${YELLOW}🔒 Analyzing Potentially Stuck States:${NC}"
    
    # Long-running node processes
    echo -e "${BLUE}Long-running Node.js processes (>30s):${NC}"
    ps -eo pid,etime,command | grep node | awk '$2 !~ /^00:00:[0-2][0-9]$/' | while read line; do
        echo -e "  ${YELLOW}⚠️ $line${NC}"
    done || echo "  No long-running processes found"
    
    # High CPU processes
    echo -e "${BLUE}High CPU Node.js processes (>5%):${NC}"
    ps -eo pid,%cpu,command | grep node | awk '$2 > 5' | while read line; do
        echo -e "  ${YELLOW}⚠️ $line${NC}"
    done || echo "  No high CPU processes found"
}

# Function to suggest cleanup actions
suggest_cleanup() {
    echo -e "\n${YELLOW}🧹 Cleanup Suggestions:${NC}"
    
    local mocha_count=$(pgrep -f mocha | wc -l)
    local node_test_count=$(pgrep -f "node.*test" | wc -l)
    local node_red_count=$(pgrep -f "node-red" | wc -l)
    
    if [ $mocha_count -gt 0 ]; then
        echo -e "${RED}💀 Kill all mocha processes:${NC}"
        echo "  pkill -f mocha"
        echo "  # Or force kill: pkill -9 -f mocha"
    fi
    
    if [ $node_test_count -gt 0 ]; then
        echo -e "${RED}💀 Kill all node test processes:${NC}"
        echo "  pkill -f 'node.*test'"
        echo "  # Or force kill: pkill -9 -f 'node.*test'"
    fi
    
    if [ $node_red_count -gt 0 ]; then
        echo -e "${RED}💀 Kill all node-red processes:${NC}"
        echo "  pkill -f node-red"
        echo "  # Or force kill: pkill -9 -f node-red"
    fi
    
    echo -e "${BLUE}🔧 Additional cleanup:${NC}"
    echo "  # Clean npm cache: npm cache clean --force"
    echo "  # Remove node_modules: rm -rf node_modules && npm install"
    echo "  # Clean test artifacts: rm -rf coverage .nyc_output test-results*"
}

# Function to run automatic cleanup
auto_cleanup() {
    echo -e "\n${RED}🚨 Running Automatic Cleanup...${NC}"
    
    # Kill test processes
    echo "Killing mocha processes..."
    pkill -f mocha 2>/dev/null || echo "No mocha processes to kill"
    
    echo "Killing node test processes..."
    pkill -f "node.*test" 2>/dev/null || echo "No node test processes to kill"
    
    echo "Killing node-red processes..."
    pkill -f "node-red" 2>/dev/null || echo "No node-red processes to kill"
    
    # Wait a bit
    sleep 2
    
    # Force kill any remaining
    echo "Force killing any remaining..."
    pkill -9 -f mocha 2>/dev/null || true
    pkill -9 -f "node.*test" 2>/dev/null || true
    pkill -9 -f "node-red" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main function
main() {
    case "${1:-all}" in
        "processes"|"proc")
            show_process_tree
            ;;
        "network"|"net")
            show_network_connections
            check_ports
            ;;
        "memory"|"mem")
            show_memory_usage
            show_system_resources
            ;;
        "test"|"tests")
            check_test_processes
            ;;
        "stuck")
            analyze_stuck_states
            ;;
        "cleanup")
            auto_cleanup
            ;;
        "suggest")
            suggest_cleanup
            ;;
        "all")
            show_process_tree
            check_test_processes
            show_network_connections
            check_ports
            show_memory_usage
            analyze_stuck_states
            show_system_resources
            suggest_cleanup
            ;;
        "help"|*)
            echo -e "${YELLOW}📖 Usage:${NC}"
            echo "  $0 all         - Show all debug information"
            echo "  $0 processes   - Show process tree"
            echo "  $0 network     - Show network connections"
            echo "  $0 memory      - Show memory usage"
            echo "  $0 test        - Show test processes"
            echo "  $0 stuck       - Analyze stuck states"
            echo "  $0 cleanup     - Auto cleanup hanging processes"
            echo "  $0 suggest     - Suggest cleanup commands"
            echo "  $0 help        - Show this help"
            ;;
    esac
}

main "$@"