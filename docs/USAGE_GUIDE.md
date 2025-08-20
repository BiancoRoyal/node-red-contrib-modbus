# Node-RED Contrib Modbus Usage Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Connection Setup](#connection-setup)
3. [Reading Data](#reading-data)
4. [Writing Data](#writing-data)
5. [Advanced Patterns](#advanced-patterns)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Quick Start

### Installation

```bash
# Install in Node-RED directory
npm install node-red-contrib-modbus

# Global installation
npm install -g node-red-contrib-modbus
```

### Basic Flow Example

1. **Create a Modbus Client** configuration node
2. **Add a Modbus Read** node
3. **Connect to Debug** node to see output

```json
[
  {
    "id": "client1",
    "type": "modbus-client",
    "name": "PLC Connection",
    "clienttype": "tcp",
    "tcpHost": "192.168.1.100",
    "tcpPort": 502,
    "unit_id": 1
  },
  {
    "id": "read1",
    "type": "modbus-read",
    "server": "client1",
    "dataType": "HoldingRegister",
    "adr": 0,
    "quantity": 10,
    "rate": 1000,
    "rateUnit": "ms"
  },
  {
    "id": "debug1",
    "type": "debug"
  }
]
```

## Connection Setup

### TCP Connection

**For Ethernet/WiFi connected PLCs:**

```javascript
// Configuration
{
  name: "Production PLC",
  clienttype: "tcp",
  tcpHost: "192.168.1.100",
  tcpPort: 502,                    // Standard Modbus TCP port
  tcpType: "DEFAULT",              // Most common
  unit_id: 1,                      // Device unit ID
  clientTimeout: 1000,             // 1 second timeout
  reconnectTimeout: 2000           // 2 second reconnect delay
}
```

**TCP Types:**
- `DEFAULT` - Standard Modbus TCP
- `TCP-RTU-BUFFERED` - RTU over TCP (some PLCs)
- `TELNET` - Telnet-based connection
- `C701` - Schneider Electric specific
- `UDP` - UDP-based Modbus

### Serial Connection

**For RS-485/RS-232 connected devices:**

```javascript
// Basic Serial Configuration
{
  name: "Serial Device",
  clienttype: "simpleser",         // Simplified serial
  serialPort: "/dev/ttyUSB0",      // Linux/Mac
  // serialPort: "COM3",           // Windows
  serialBaudrate: 9600,
  unit_id: 1
}

// Advanced Serial Configuration  
{
  clienttype: "serial",
  serialPort: "/dev/ttyUSB0",
  serialBaudrate: 19200,
  serialDatabits: 8,
  serialStopbits: 1,
  serialParity: "none",
  serialType: "RTU-BUFFERD",       // Most common
  serialConnectionDelay: 100       // Delay after connect
}
```

**Serial Types:**
- `RTU-BUFFERD` - RTU with buffering (recommended)
- `RTU` - Standard RTU
- `ASCII` - ASCII mode (rarely used)

### Connection Verification

Add debug nodes to monitor connection status:

```javascript
// Monitor connection events
node.on('mbconnected', () => {
  console.log('Modbus connected');
});

node.on('mberror', (err) => {
  console.log('Modbus error:', err);
});
```

## Reading Data

### Continuous Reading (`modbus-read`)

**For periodic monitoring:**

```javascript
{
  dataType: "HoldingRegister",     // Data type to read
  adr: 100,                       // Starting address (0-based)
  quantity: 10,                   // Number of registers
  rate: 5,                        // Poll every 5 seconds
  rateUnit: "s",
  server: "client_config_id"
}
```

**Data Types:**
- `Coil` - Read coils (FC 1)
- `Input` - Read discrete inputs (FC 2)  
- `HoldingRegister` - Read holding registers (FC 3)
- `InputRegister` - Read input registers (FC 4)

### On-Demand Reading (`modbus-getter`)

**For event-driven reads:**

```javascript
// Send any message to trigger read
msg.payload = {};  // Trigger read

// Override parameters per message
msg.payload = {
  unitid: 2,        // Different unit ID
  address: 200,     // Different address
  quantity: 5       // Different quantity
};
```

### Flexible Reading (`modbus-flex-getter`)

**For dynamic reading with full parameter control:**

```javascript
// Input message with all parameters
msg.payload = {
  unitid: 1,
  fc: 3,                    // Function code (1-4)
  address: 0,
  quantity: 10
};
```

### Reading Output Format

**Output 1** (Processed values):
```javascript
{
  payload: [100, 200, 150, 300],  // Processed values
  responseBuffer: <Buffer>,        // Raw response
  input: {...},                   // Original input message
  topic: "modbus/read"
}
```

**Output 2** (Raw buffer):
```javascript
{
  payload: <Buffer 00 64 00 c8>,  // Raw response buffer
  values: [100, 200, 150, 300],   // Processed values
  input: {...}                    // Original input message
}
```

## Writing Data

### Fixed Writing (`modbus-write`)

**For writing to fixed addresses:**

```javascript
// Configuration
{
  dataType: "HoldingRegister",    // Write type
  adr: 100,                      // Starting address
  quantity: 1,                   // Number of registers
  server: "client_config_id"
}

// Input messages
// Single coil (FC 5)
msg.payload = true;  // or false, 1, 0

// Single register (FC 6)
msg.payload = 1234;

// Multiple coils (FC 15)
msg.payload = [true, false, true, false];

// Multiple registers (FC 16)
msg.payload = [1000, 2000, 3000];
```

### Flexible Writing (`modbus-flex-write`)

**For dynamic writing with variable parameters:**

```javascript
// Complete parameter control
msg.payload = {
  value: 1500,        // Value to write
  unitid: 1,          // Unit ID
  fc: 6,              // Function code
  address: 200,       // Target address  
  quantity: 1         // Number of registers
};

// Multiple values
msg.payload = {
  value: [100, 200, 300],
  unitid: 1,
  fc: 16,             // Write multiple registers
  address: 100,
  quantity: 3
};
```

### HTTP Integration

**Writing from HTTP requests:**

```javascript
// URL parameters automatically parsed
// GET /write?value=1234
msg.payload = {
  value: "1234"       // String converted to number
};

// Array values from HTTP
// GET /write?value=100,200,300
msg.payload = {
  value: "100,200,300"  // Parsed to [100, 200, 300]
};

// Boolean from HTTP  
// GET /write?value=true
msg.payload = {
  value: "true"       // Converted to boolean true
};
```

## Advanced Patterns

### Custom Function Codes (`modbus-flex-fc`)

**For proprietary or custom Modbus functions:**

```javascript
// Configuration
{
  fc: "0x08",              // Custom function code in hex
  unitid: 1,
  requestCard: 8,          // Request data length
  responseCard: 16         // Expected response length
}

// Dynamic custom FC
msg.payload = {
  unitid: 1,
  fc: 0x08,                // Custom function code
  requestCard: 8,
  responseCard: 16
};
```

### Sequencing Operations (`modbus-flex-sequencer`)

**For complex multi-step operations:**

```javascript
// Input: Array of Modbus operations
msg.payload = {
  sequences: [
    {
      unitid: 1,
      fc: 3,                // Read holding registers
      address: 0,
      quantity: 10
    },
    {
      unitid: 1, 
      fc: 16,               // Write multiple registers
      address: 100,
      quantity: 2,
      values: [1000, 2000]
    }
  ]
};
```

### Server Node (`modbus-server`)

**For testing and simulation:**

```javascript
// Create Modbus server
{
  serverPort: 10502,        // Custom port
  unitId: 1,
  coils: 1000,             // Number of coils
  holdingRegisters: 1000,   // Number of registers
  logEnabled: true
}

// Server receives write operations and can respond to reads
// Connect to: modbus://localhost:10502
```

### Queue Management

**Monitor operation queues:**

```javascript
// modbus-queue-info output
{
  payload: {
    unitId: 1,
    queueLength: 3,         // Operations in queue
    state: "active"         // Current state
  }
}
```

### Response Processing

**Filter and process responses:**

```javascript
// modbus-response-filter
{
  filter: "address >= 100 && address <= 200",  // Filter expression
  filterType: "javascript"
}

// Custom processing with modbus-response
// Converts raw buffer to structured data
```

## Performance Optimization

### Connection Optimization

```javascript
// Optimize for high-throughput
{
  bufferCommands: true,           // Queue commands
  commandDelay: 1,               // Minimum delay (ms)
  parallelUnitIdsAllowed: true,  // Parallel processing
  clientTimeout: 500,            // Shorter timeout
  reconnectOnTimeout: true       // Auto-reconnect
}
```

### Reading Optimization

**Batch reads instead of individual:**
```javascript
// Instead of multiple single reads:
// address: 0, quantity: 1
// address: 1, quantity: 1  
// address: 2, quantity: 1

// Use single batch read:
address: 0, quantity: 10       // Read 10 registers at once
```

**Adjust poll rates:**
```javascript
// Critical data - fast polling
rate: 100, rateUnit: "ms"      // 100ms = 10 Hz

// Status data - medium polling  
rate: 1, rateUnit: "s"         // 1 second

// Configuration data - slow polling
rate: 30, rateUnit: "s"        // 30 seconds
```

### Memory Management

**Clean up resources:**
```javascript
node.on('close', function(done) {
  // Clear message buffers
  node.bufferMessageList.clear();
  
  // Clean up timers
  if (node.inputDelayTimer) {
    clearTimeout(node.inputDelayTimer);
  }
  
  done();
});
```

## Troubleshooting

### Common Connection Issues

**TCP Connection Refused:**
```bash
# Check device IP and port
ping 192.168.1.100
telnet 192.168.1.100 502
```

**Serial Port Access:**
```bash
# Linux/Mac: Check permissions
ls -la /dev/ttyUSB*
sudo chmod 666 /dev/ttyUSB0

# List available ports
node -e "console.log(require('serialport').list())"
```

### Debug Configuration

**Enable detailed logging:**
```bash
# All Modbus debug output
DEBUG=contribModbus* node-red -v

# Specific categories
DEBUG=contribModbus:read,contribModbus:write node-red -v

# Include modbus-serial debug
DEBUG=contribModbus*,modbus-serial node-red -v
```

### Error Patterns

**Timeout Errors:**
```javascript
// Increase timeout for slow devices
clientTimeout: 5000    // 5 seconds

// Or disable reconnect for testing
reconnectOnTimeout: false
```

**Queue Overruns:**
```javascript
// Reduce polling frequency
rate: 1000, rateUnit: "ms"  // Slower polling

// Increase command delay
commandDelay: 10            // 10ms between commands
```

**Buffer Corruption (Node-RED 4.1.0+):**
```javascript
// Already handled in v6+ with cloneBuffer()
// Upgrade to latest version
npm install node-red-contrib-modbus@latest
```

### Testing with Tools

**Modbus simulator:**
```bash
# Install modbus simulator
npm install -g modbus-simulator

# Start TCP server on port 502
modbus-simulator --tcp --port 502

# Connect from Node-RED to localhost:502
```

**Command-line testing:**
```bash
# Test with modpoll (if available)
modpoll -m tcp -a 1 -r 1 -c 10 192.168.1.100
```

## Best Practices

### Security

1. **Network Segmentation**
   - Use dedicated VLAN for Modbus devices
   - Firewall rules to limit access
   - VPN for remote access

2. **Authentication**
   - Change default passwords on devices
   - Use read-only accounts where possible
   - Regular security updates

### Reliability

1. **Error Handling**
   ```javascript
   // Always use catch nodes
   [
     {"type": "modbus-read", "id": "read1"},
     {"type": "catch", "scope": ["read1"], "wires": [["error-handler"]]}
   ]
   ```

2. **Redundancy**
   - Multiple communication paths
   - Backup polling mechanisms
   - Graceful degradation

### Performance

1. **Minimize Polling**
   - Poll only necessary data
   - Use appropriate intervals
   - Batch related operations

2. **Connection Management**
   - Reuse connections
   - Monitor queue lengths
   - Handle reconnections gracefully

### Maintenance

1. **Documentation**
   - Document device configurations
   - Map register addresses
   - Version control flows

2. **Monitoring**
   - Log communication errors
   - Monitor response times
   - Track data quality

### Flow Organization

```javascript
// Organized flow structure
[
  {
    "id": "config-tab",
    "type": "tab", 
    "label": "Modbus Configuration"
  },
  {
    "id": "read-tab",
    "type": "tab",
    "label": "Data Reading" 
  },
  {
    "id": "write-tab",
    "type": "tab",
    "label": "Control Writing"
  }
]
```

### Code Comments

```javascript
// Use descriptive node names
{
  "name": "PLC_Line1_Status_Registers",  // Clear purpose
  "info": "Reads production line status from registers 0-10"
}

// Document register mappings
{
  "name": "Temperature_Sensors",
  "info": "R0=Tank1_Temp, R1=Tank2_Temp, R2=Ambient_Temp"
}
```