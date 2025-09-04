# Node-RED Modbus API Specification

## Version: 6.0.0

## Overview
This document defines the complete API specification for the Node-RED Modbus contribution package, including message formats, node configurations, and integration patterns.

## Table of Contents
1. [Message API](#message-api)
2. [Node Configuration API](#node-configuration-api)
3. [Resilience API](#resilience-api)
4. [Diagnostics API](#diagnostics-api)
5. [Event API](#event-api)

---

## Message API

### Input Message Format

All Modbus nodes accept messages with the following structure:

```javascript
{
  // Core payload
  payload: {
    // Function code (required for operations)
    fc: 1 | 2 | 3 | 4 | 5 | 6 | 15 | 16,
    
    // Start address (required)
    address: number,  // 0-65535
    
    // Quantity for read operations
    quantity: number, // 1-2000 (depends on FC)
    
    // Value(s) for write operations
    value: boolean | number | boolean[] | number[],
    
    // Optional unit ID override
    unitId: number,   // 0-255 (TCP) or 0-247 (Serial)
    
    // Optional timing overrides
    commandDelay: number,      // ms
    clientTimeout: number,     // ms
    reconnectTimeout: number,  // ms
    
    // Priority for queue management
    priority: 0 | 1 | 2,  // 0 = highest
    
    // Connection override for flex nodes
    connectorType: 'TCP' | 'SERIAL',
    tcpHost: string,
    tcpPort: number,
    serialPort: string,
    serialBaudrate: number
  },
  
  // Message metadata
  topic: string,      // Optional topic for routing
  messageId: string,  // Optional unique message ID
  
  // Queue control
  queueUnit: number,  // Unit ID for queue management
  queueControl: {
    priority: number,
    maxRetries: number,
    retryDelay: number
  }
}
```

### Output Message Format

Modbus nodes output messages with enhanced information:

```javascript
{
  // Original payload (for read operations, contains the result)
  payload: boolean[] | number[] | Buffer,
  
  // Response buffer details
  responseBuffer: {
    data: number[],      // Array of register/coil values
    buffer: Buffer,      // Raw response buffer
    length: number,      // Response length
    address: number,     // Start address
    quantity: number,    // Number of items read
    fc: number          // Function code used
  },
  
  // Modbus metadata
  modbus: {
    unitId: number,           // Unit ID used
    fc: number,               // Function code
    address: number,          // Start address
    quantity: number,         // Quantity read/written
    value: any,              // Value written (for write operations)
    transactionId: number,    // Modbus transaction ID
    protocolId: number,       // Protocol identifier
    timestamp: number,        // Operation timestamp
    responseTime: number,     // Response time in ms
    retry: number,           // Retry count
    connection: {
      type: string,          // 'TCP' or 'SERIAL'
      host: string,          // TCP host
      port: number,          // TCP port
      path: string           // Serial port path
    }
  },
  
  // Original message properties preserved
  topic: string,
  messageId: string,
  
  // Error information (if applicable)
  error: {
    message: string,         // Error message
    code: string,           // Error code
    errno: string,          // System error number
    syscall: string,        // System call that failed
    modbusCode: number,     // Modbus exception code
    context: {
      unitId: number,
      fc: number,
      address: number,
      state: string,        // FSM state when error occurred
      timestamp: string
    }
  }
}
```

### Function Codes

| FC | Name | Operation | Input | Output |
|----|------|-----------|-------|--------|
| 1 | Read Coils | Read discrete outputs | address, quantity | boolean[] |
| 2 | Read Discrete Inputs | Read discrete inputs | address, quantity | boolean[] |
| 3 | Read Holding Registers | Read holding registers | address, quantity | number[] |
| 4 | Read Input Registers | Read input registers | address, quantity | number[] |
| 5 | Write Single Coil | Write single coil | address, value (boolean) | boolean |
| 6 | Write Single Register | Write single register | address, value (number) | number |
| 15 | Write Multiple Coils | Write multiple coils | address, value (boolean[]) | quantity |
| 16 | Write Multiple Registers | Write multiple registers | address, value (number[]) | quantity |

---

## Node Configuration API

### modbus-client Configuration

```javascript
{
  // Connection Type
  clienttype: "tcp" | "serial",
  
  // TCP Configuration
  tcpHost: string,           // IP or hostname
  tcpPort: number,           // Default: 502
  tcpType: "DEFAULT" | "C701" | "TELNET" | "TCP-RTU-BUFFERED" | "UDP",
  
  // TLS Configuration
  tlsEnabled: boolean,
  tlsPrivateKey: string,     // Use credentials API
  tlsCertificate: string,    // Use credentials API
  tlsCa: string,            // Use credentials API
  tlsRejectUnauthorized: boolean,  // Default: true
  tlsServername: string,
  tlsSecureProtocol: string,  // Default: "TLSv1_3_method"
  tlsCheckServerIdentity: boolean,
  
  // Serial Configuration
  serialPort: string,        // e.g., "/dev/ttyUSB0"
  serialBaudrate: number,    // e.g., 9600
  serialDatabits: 7 | 8,
  serialStopbits: 1 | 2,
  serialParity: "none" | "even" | "odd" | "mark" | "space",
  serialType: "RTU" | "RTU-BUFFERED" | "ASCII",
  serialConnectionDelay: number,  // ms
  serialAsciiResponseStartDelimiter: string,  // Hex string
  
  // Unit Configuration
  unit_id: number,           // 0-255 (TCP) or 0-247 (Serial)
  
  // Timing Configuration
  commandDelay: number,      // Min delay between commands (ms)
  clientTimeout: number,     // Response timeout (ms)
  reconnectTimeout: number,  // Reconnection delay (ms)
  reconnectOnTimeout: boolean,
  
  // Queue Configuration
  bufferCommands: boolean,
  parallelUnitIdsAllowed: boolean,
  
  // Resilience Configuration
  enableCircuitBreaker: boolean,
  failureThreshold: number,   // Default: 5
  successThreshold: number,   // Default: 2
  circuitBreakerTimeout: number,  // ms
  
  enableConnectionPool: boolean,
  maxConnections: number,      // Default: 10
  maxConnectionsPerHost: number,  // Default: 3
  connectionPoolTimeout: number,
  
  enableRetryHandler: boolean,
  maxRetries: number,         // Default: 3
  initialRetryDelay: number,  // Default: 1000ms
  maxRetryDelay: number,      // Default: 30000ms
  
  enableDiagnostics: boolean,
  enableTimerTracking: boolean,
  
  // Logging Configuration
  showErrors: boolean,
  showWarnings: boolean,
  showLogs: boolean,
  queueLogEnabled: boolean,
  stateLogEnabled: boolean,
  failureLogEnabled: boolean
}
```

### modbus-read Configuration

```javascript
{
  name: string,              // Node name
  topic: string,            // Output topic
  dataType: "Coil" | "Input" | "HoldingRegister" | "InputRegister",
  adr: number,              // Start address
  quantity: number,         // Number to read
  rate: number,             // Poll rate (ms)
  rateUnit: "ms" | "s" | "m" | "h",
  
  showStatusActivities: boolean,
  showErrors: boolean,
  showWarnings: boolean,
  
  server: string,           // Reference to modbus-client node
  
  // Optional input override
  useIOFile: boolean,
  ioFile: string,          // Reference to io-config node
  useIOForPayload: boolean,
  
  // Advanced options
  emptyMsgOnFail: boolean,
  keepMsgProperties: boolean,
  
  // Queueing
  x: number,               // Node position
  y: number,
  wires: [[string]]       // Output connections
}
```

### modbus-write Configuration

```javascript
{
  name: string,
  topic: string,
  dataType: "Coil" | "HoldingRegister" | "MCoils" | "MHoldingRegisters",
  adr: number,
  quantity: number,
  
  showStatusActivities: boolean,
  showErrors: boolean,
  showWarnings: boolean,
  
  server: string,
  
  // Value source
  useIOFile: boolean,
  ioFile: string,
  useIOForPayload: boolean,
  
  // Advanced
  emptyMsgOnFail: boolean,
  keepMsgProperties: boolean,
  
  // Write options
  prioritizeWriteMultiple: boolean
}
```

---

## Resilience API

### Circuit Breaker API

```javascript
// Enable circuit breaker
node.enableCircuitBreaker({
  failureThreshold: 5,      // Failures before opening
  successThreshold: 2,      // Successes to close
  timeout: 30000,           // Time before half-open (ms)
  fallbackFunction: async () => {
    // Custom fallback logic
    return defaultValue;
  },
  onStateChange: (oldState, newState) => {
    // Handle state changes
    console.log(`Circuit breaker: ${oldState} -> ${newState}`);
  }
});

// Check circuit breaker state
const state = node.getCircuitBreakerState();
// Returns: 'CLOSED' | 'OPEN' | 'HALF_OPEN'

// Get circuit breaker statistics
const stats = node.getCircuitBreakerStats();
// Returns: { failures: n, successes: n, lastFailureTime: timestamp }
```

### Connection Pool API

```javascript
// Get connection from pool
const connection = await node.connectionPool.getConnection(config, {
  priority: 1,              // 0-2 (0 = highest)
  timeout: 5000            // Max wait time
});

// Release connection
node.connectionPool.releaseConnection(connection);

// Get pool statistics
const stats = node.connectionPool.getStatistics();
/* Returns:
{
  totalConnectionsCreated: number,
  totalConnectionsReused: number,
  totalConnectionsClosed: number,
  totalConnectionsFailed: number,
  currentActiveConnections: number,
  currentIdleConnections: number,
  averageWaitTime: number,
  queueLength: number
}
*/

// Health check
const health = node.connectionPool.getHealthReport();
/* Returns:
{
  totalConnections: number,
  healthyConnections: number,
  unhealthyConnections: number,
  connections: [
    {
      id: string,
      healthy: boolean,
      state: string,
      useCount: number,
      errorCount: number,
      age: number
    }
  ]
}
*/
```

### Retry Handler API

```javascript
// Execute with retry
const result = await node.retryHandler.execute(
  async () => {
    // Operation to retry
    return await modbusOperation();
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    factor: 2,              // Exponential backoff factor
    onRetry: (error, retryCount) => {
      console.log(`Retry ${retryCount} after error: ${error.message}`);
    }
  }
);
```

---

## Diagnostics API

### Get Diagnostics Report

```javascript
const report = node.getDiagnosticsReport();
/* Returns:
{
  timestamp: ISO8601,
  nodeId: string,
  nodeName: string,
  
  connections: {
    total: number,
    active: number,
    idle: number,
    failed: number,
    successRate: number
  },
  
  performance: {
    averageResponseTime: number,
    minResponseTime: number,
    maxResponseTime: number,
    p50ResponseTime: number,
    p95ResponseTime: number,
    p99ResponseTime: number,
    totalRequests: number,
    successfulRequests: number,
    failedRequests: number
  },
  
  errors: {
    total: number,
    byType: {
      [errorType: string]: number
    },
    recent: [
      {
        timestamp: ISO8601,
        error: string,
        context: object
      }
    ]
  },
  
  queue: {
    depth: number,
    processing: number,
    waiting: number,
    averageWaitTime: number
  },
  
  state: {
    current: string,
    transitions: number,
    history: string[],
    deadlockCheck: {
      hasDeadlock: boolean,
      warnings: string[]
    }
  },
  
  timers: {
    active: number,
    peak: number,
    leaked: number,
    byPurpose: {
      [purpose: string]: number
    }
  },
  
  alerts: [
    {
      level: 'info' | 'warning' | 'error' | 'critical',
      message: string,
      timestamp: ISO8601,
      details: object
    }
  ]
}
*/
```

### Export Metrics

```javascript
// Prometheus format
const metrics = node.exportMetrics('prometheus');
/* Returns:
# HELP modbus_requests_total Total number of Modbus requests
# TYPE modbus_requests_total counter
modbus_requests_total{node="node_id",status="success"} 1234
modbus_requests_total{node="node_id",status="failure"} 56

# HELP modbus_response_time_seconds Response time in seconds
# TYPE modbus_response_time_seconds histogram
modbus_response_time_seconds_bucket{le="0.1"} 1000
modbus_response_time_seconds_bucket{le="0.5"} 1200
...
*/

// JSON format
const metrics = node.exportMetrics('json');
```

---

## Event API

### Node Events

```javascript
// Connection events
node.on('mbinit', (nodeId, data) => {
  // FSM initialized
});

node.on('mbconnected', (nodeId, data) => {
  // Connected to Modbus device
});

node.on('mbactive', (nodeId, data) => {
  // Ready for operations
});

node.on('mbqueue', (nodeId, data) => {
  // Command queued
});

node.on('mbclosed', (nodeId, data) => {
  // Connection closed
});

node.on('mberror', (nodeId, data) => {
  // Error occurred
  const { message, code, context } = data;
});

node.on('mbbroken', (nodeId, data) => {
  // Connection broken
});

node.on('mbreconnecting', (nodeId, data) => {
  // Attempting reconnection
});

// Pool events
node.connectionPool.on('connectionCreated', ({ connectionId }) => {
  // New connection created
});

node.connectionPool.on('connectionReused', ({ connectionId }) => {
  // Connection reused from pool
});

node.connectionPool.on('connectionRemoved', ({ connectionId }) => {
  // Connection removed from pool
});

node.connectionPool.on('backpressure', ({ level, queueSize, utilization }) => {
  // Queue approaching limits
});

// Circuit breaker events
node.circuitBreaker.on('stateChange', ({ from, to, metrics }) => {
  // Circuit breaker state changed
});

node.circuitBreaker.on('fallback', ({ error }) => {
  // Fallback executed
});

// Timer manager events
node.timerManager.on('warning', ({ type, details }) => {
  // Timer warning (leak, high count, etc.)
});

node.timerManager.on('error', ({ timerId, error }) => {
  // Timer execution error
});
```

### Custom Events

```javascript
// Register for Modbus operations
node.registerForModbus(clientNodeId);

// Custom Modbus message
node.emit('customModbusMessage', msg, 
  (response) => {
    // Success callback
  },
  (error, msg) => {
    // Error callback
  }
);

// Read operation
node.emit('readModbus', msg,
  (response) => {
    // Success callback
  },
  (error, msg) => {
    // Error callback
  }
);

// Write operation
node.emit('writeModbus', msg,
  (response) => {
    // Success callback
  },
  (error, msg) => {
    // Error callback
  }
);

// Dynamic reconnection
node.emit('dynamicReconnect', {
  payload: {
    connectorType: 'TCP',
    tcpHost: 'new-host.com',
    tcpPort: 502,
    unitId: 1
  }
},
  (msg) => {
    // Success callback
  },
  (error, msg) => {
    // Error callback
  }
);

// Deregister from Modbus
node.deregisterForModbus(clientNodeId, done);
```

---

## Error Codes

### Modbus Exception Codes

| Code | Name | Description |
|------|------|-------------|
| 0x01 | ILLEGAL_FUNCTION | Function code not supported |
| 0x02 | ILLEGAL_DATA_ADDRESS | Invalid data address |
| 0x03 | ILLEGAL_DATA_VALUE | Invalid data value |
| 0x04 | SLAVE_DEVICE_FAILURE | Device failure |
| 0x05 | ACKNOWLEDGE | Request acknowledged, processing |
| 0x06 | SLAVE_DEVICE_BUSY | Device busy |
| 0x08 | MEMORY_PARITY_ERROR | Memory parity error |
| 0x0A | GATEWAY_PATH_UNAVAILABLE | Gateway path unavailable |
| 0x0B | GATEWAY_TARGET_DEVICE_FAILED | Gateway target failed |

### Custom Error Codes

| Code | Description |
|------|-------------|
| POOL_CONNECTION_ERROR | Failed to get connection from pool |
| QUEUE_LIMIT_EXCEEDED | Connection pool queue full |
| CIRCUIT_BREAKER_OPEN | Circuit breaker preventing operation |
| TIMER_LIMIT_EXCEEDED | Too many timers for node |
| STATE_INVALID | Invalid FSM state for operation |
| TLS_CREDENTIAL_MISSING | Required TLS credential not found |
| CONNECTION_TIMEOUT | Connection attempt timed out |
| OPERATION_TIMEOUT | Operation timed out |
| RETRY_EXHAUSTED | All retry attempts failed |

---

## Rate Limiting

### Configuration

```javascript
{
  rateLimit: {
    enabled: boolean,
    maxRequestsPerSecond: number,
    maxBurst: number,
    strategy: 'sliding-window' | 'token-bucket',
    onRateLimit: (msg) => {
      // Handle rate limited message
    }
  }
}
```

### Usage

```javascript
// Check if rate limited
if (node.isRateLimited()) {
  // Delay or queue operation
}

// Get rate limit status
const status = node.getRateLimitStatus();
/* Returns:
{
  currentRate: number,
  limit: number,
  remaining: number,
  resetTime: timestamp
}
*/
```

---

## Examples

### Basic Read Operation

```javascript
// Input message
msg.payload = {
  fc: 3,              // Read holding registers
  address: 100,       // Start at register 100
  quantity: 10,       // Read 10 registers
  unitId: 1          // Unit ID 1
};

// Output message
{
  payload: [1234, 5678, ...],  // 10 register values
  responseBuffer: {
    data: [1234, 5678, ...],
    buffer: Buffer,
    length: 20,
    address: 100,
    quantity: 10,
    fc: 3
  },
  modbus: {
    unitId: 1,
    fc: 3,
    address: 100,
    quantity: 10,
    responseTime: 45,
    // ... additional metadata
  }
}
```

### Write with Priority

```javascript
msg.payload = {
  fc: 16,                      // Write multiple registers
  address: 200,
  value: [100, 200, 300],
  unitId: 1,
  priority: 0                  // High priority
};
```

### Error Handling

```javascript
// Connection error
{
  error: {
    message: "Connection timeout",
    code: "CONNECTION_TIMEOUT",
    context: {
      host: "192.168.1.100",
      port: 502,
      timeout: 5000,
      unitId: 1,
      state: "connecting"
    }
  }
}

// Modbus exception
{
  error: {
    message: "Modbus exception",
    modbusCode: 0x02,
    code: "ILLEGAL_DATA_ADDRESS",
    context: {
      unitId: 1,
      fc: 3,
      address: 9999,
      quantity: 10
    }
  }
}
```