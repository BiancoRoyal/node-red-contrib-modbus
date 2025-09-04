# Node-RED Modbus Implementation Guide

## Quick Start

### Installation

```bash
# Install from npm
npm install node-red-contrib-modbus

# Or install from GitHub
npm install github:biancoroyal/node-red-contrib-modbus#v6.0.0

# For development
git clone https://github.com/biancoroyal/node-red-contrib-modbus.git
cd node-red-contrib-modbus
npm install
npm run build
npm link
```

### Basic TCP Connection

```javascript
// Flow example
[
  {
    "id": "modbus-client-1",
    "type": "modbus-client",
    "name": "Modbus TCP Server",
    "clienttype": "tcp",
    "tcpHost": "192.168.1.100",
    "tcpPort": 502,
    "unit_id": 1,
    "clientTimeout": 1000,
    "reconnectTimeout": 2000
  },
  {
    "id": "read-node-1",
    "type": "modbus-read",
    "name": "Read Registers",
    "dataType": "HoldingRegister",
    "adr": 0,
    "quantity": 10,
    "rate": 1,
    "rateUnit": "s",
    "server": "modbus-client-1"
  }
]
```

### Secure TLS Connection

```javascript
// Environment variables
export MODBUS_TLS_PRIVATE_KEY="$(cat private-key.pem)"
export MODBUS_TLS_CERTIFICATE="$(cat certificate.pem)"
export MODBUS_TLS_CA="$(cat ca.pem)"

// Node configuration
{
  "type": "modbus-client",
  "tlsEnabled": true,
  "tlsRejectUnauthorized": true,
  "tlsServername": "modbus-server.example.com",
  "tcpHost": "modbus-server.example.com",
  "tcpPort": 8502
}
```

## Common Implementation Patterns

### 1. Polling Multiple Devices

```javascript
// Use connection pool for efficiency
const devices = [
  { host: "192.168.1.100", unitId: 1 },
  { host: "192.168.1.101", unitId: 1 },
  { host: "192.168.1.102", unitId: 1 }
];

// Function node to cycle through devices
let currentDevice = context.get('currentDevice') || 0;
const device = devices[currentDevice];

msg.payload = {
  fc: 3,
  address: 0,
  quantity: 10,
  unitId: device.unitId
};

// For dynamic connection
msg.payload.connectorType = 'TCP';
msg.payload.tcpHost = device.host;
msg.payload.tcpPort = 502;

currentDevice = (currentDevice + 1) % devices.length;
context.set('currentDevice', currentDevice);

return msg;
```

### 2. Batch Operations

```javascript
// Read multiple register ranges efficiently
async function batchRead(node, ranges) {
  const results = [];
  
  for (const range of ranges) {
    const msg = {
      payload: {
        fc: 3,
        address: range.start,
        quantity: range.count,
        priority: range.priority || 1
      }
    };
    
    const result = await readModbus(node, msg);
    results.push({
      ...range,
      data: result.payload
    });
  }
  
  return results;
}

// Usage
const ranges = [
  { name: "temperature", start: 100, count: 1, priority: 0 },
  { name: "pressure", start: 110, count: 1, priority: 0 },
  { name: "flow", start: 120, count: 2, priority: 1 }
];

const data = await batchRead(node, ranges);
```

### 3. Error Recovery

```javascript
// Implement retry with exponential backoff
function createRetryWrapper(operation, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2
  } = options;
  
  return async function(...args) {
    let lastError;
    let delay = initialDelay;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation(...args);
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries) {
          node.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * factor, maxDelay);
        }
      }
    }
    
    throw lastError;
  };
}

// Usage
const readWithRetry = createRetryWrapper(
  (msg) => node.emit('readModbus', msg),
  { maxRetries: 5, initialDelay: 500 }
);
```

### 4. Data Transformation

```javascript
// Convert Modbus data to meaningful values
function processModbusData(registers, mapping) {
  const result = {};
  
  for (const [key, config] of Object.entries(mapping)) {
    const { address, type, scale, offset } = config;
    let value = registers[address];
    
    switch (type) {
      case 'float32':
        // Combine two 16-bit registers to 32-bit float
        const high = registers[address];
        const low = registers[address + 1];
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt16BE(high, 0);
        buffer.writeUInt16BE(low, 2);
        value = buffer.readFloatBE(0);
        break;
        
      case 'int32':
        // Combine two registers to 32-bit integer
        value = (registers[address] << 16) | registers[address + 1];
        break;
        
      case 'int16':
        // Signed 16-bit integer
        value = registers[address] > 32767 
          ? registers[address] - 65536 
          : registers[address];
        break;
        
      case 'uint16':
        // Unsigned 16-bit integer (default)
        break;
    }
    
    // Apply scaling and offset
    if (scale !== undefined) value *= scale;
    if (offset !== undefined) value += offset;
    
    result[key] = value;
  }
  
  return result;
}

// Usage
const mapping = {
  temperature: { address: 0, type: 'int16', scale: 0.1, offset: 0 },
  pressure: { address: 1, type: 'uint16', scale: 0.01, offset: 0 },
  flow: { address: 2, type: 'float32' },
  status: { address: 4, type: 'uint16' }
};

const values = processModbusData(msg.payload, mapping);
// Result: { temperature: 25.6, pressure: 1.05, flow: 123.45, status: 1 }
```

### 5. Queue Management

```javascript
// Priority queue for critical operations
class PriorityModbusQueue {
  constructor(node) {
    this.node = node;
    this.queues = [[], [], []]; // 3 priority levels
    this.processing = false;
  }
  
  async add(msg, priority = 1) {
    const queueIndex = Math.min(priority, 2);
    this.queues[queueIndex].push(msg);
    
    if (!this.processing) {
      await this.process();
    }
  }
  
  async process() {
    this.processing = true;
    
    while (this.hasMessages()) {
      const msg = this.getNext();
      
      try {
        await this.executeModbus(msg);
      } catch (error) {
        this.node.error(error, msg);
      }
    }
    
    this.processing = false;
  }
  
  hasMessages() {
    return this.queues.some(q => q.length > 0);
  }
  
  getNext() {
    for (const queue of this.queues) {
      if (queue.length > 0) {
        return queue.shift();
      }
    }
    return null;
  }
  
  async executeModbus(msg) {
    return new Promise((resolve, reject) => {
      this.node.emit('readModbus', msg,
        (response) => resolve(response),
        (error, msg) => reject(error)
      );
    });
  }
}
```

## Advanced Features

### Circuit Breaker Implementation

```javascript
// Function node for circuit breaker pattern
const circuitBreaker = context.get('circuitBreaker') || {
  state: 'CLOSED',
  failures: 0,
  successCount: 0,
  lastFailureTime: null,
  config: {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000
  }
};

function shouldAttempt() {
  if (circuitBreaker.state === 'OPEN') {
    const elapsed = Date.now() - circuitBreaker.lastFailureTime;
    if (elapsed > circuitBreaker.config.timeout) {
      circuitBreaker.state = 'HALF_OPEN';
      node.warn('Circuit breaker entering HALF_OPEN state');
    } else {
      throw new Error('Circuit breaker is OPEN');
    }
  }
  return true;
}

function onSuccess() {
  if (circuitBreaker.state === 'HALF_OPEN') {
    circuitBreaker.successCount++;
    if (circuitBreaker.successCount >= circuitBreaker.config.successThreshold) {
      circuitBreaker.state = 'CLOSED';
      circuitBreaker.failures = 0;
      circuitBreaker.successCount = 0;
      node.warn('Circuit breaker CLOSED');
    }
  } else {
    circuitBreaker.failures = 0;
  }
}

function onFailure() {
  circuitBreaker.failures++;
  circuitBreaker.lastFailureTime = Date.now();
  
  if (circuitBreaker.failures >= circuitBreaker.config.failureThreshold) {
    circuitBreaker.state = 'OPEN';
    circuitBreaker.successCount = 0;
    node.error('Circuit breaker OPEN');
  }
}

// Usage in flow
try {
  if (shouldAttempt()) {
    // Attempt Modbus operation
    // ... modbus operation ...
    onSuccess();
  }
} catch (error) {
  onFailure();
  // Handle error or use fallback
}

context.set('circuitBreaker', circuitBreaker);
```

### Connection Pool Monitoring

```javascript
// Monitor connection pool health
setInterval(() => {
  const stats = node.connectionPool.getStatistics();
  const health = node.connectionPool.getHealthReport();
  
  // Log metrics
  node.log({
    timestamp: new Date().toISOString(),
    pool: {
      active: stats.currentActiveConnections,
      idle: stats.currentIdleConnections,
      queue: stats.queueLength,
      reuse: stats.totalConnectionsReused,
      failed: stats.totalConnectionsFailed
    },
    health: {
      healthy: health.healthyConnections,
      unhealthy: health.unhealthyConnections
    }
  });
  
  // Alert on issues
  if (health.unhealthyConnections > 0) {
    node.warn(`${health.unhealthyConnections} unhealthy connections detected`);
  }
  
  if (stats.queueLength > 50) {
    node.warn(`High queue depth: ${stats.queueLength}`);
  }
  
  const reuseRate = stats.totalConnectionsReused / 
    (stats.totalConnectionsCreated + stats.totalConnectionsReused);
  
  if (reuseRate < 0.5) {
    node.warn(`Low connection reuse rate: ${(reuseRate * 100).toFixed(1)}%`);
  }
}, 30000); // Every 30 seconds
```

### State Machine Monitoring

```javascript
// Monitor for deadlocks
node.stateValidator.on('deadlock', (details) => {
  node.error(`Deadlock detected: ${details.state} for ${details.duration}ms`);
  
  // Attempt recovery
  if (details.state === 'sending' && details.duration > 60000) {
    node.warn('Attempting deadlock recovery');
    node.stateService.send('BREAK');
    setTimeout(() => {
      node.stateService.send('RECONNECT');
    }, 5000);
  }
});

// Track state transitions
let stateMetrics = {};

node.stateService.subscribe((state) => {
  const stateName = state.value;
  
  if (!stateMetrics[stateName]) {
    stateMetrics[stateName] = {
      count: 0,
      totalDuration: 0,
      lastEntered: Date.now()
    };
  }
  
  const metric = stateMetrics[stateName];
  metric.count++;
  
  // Calculate duration in previous state
  const prevState = node.actualServiceStateBefore.value;
  if (stateMetrics[prevState]) {
    const duration = Date.now() - stateMetrics[prevState].lastEntered;
    stateMetrics[prevState].totalDuration += duration;
  }
  
  metric.lastEntered = Date.now();
});

// Report state metrics periodically
setInterval(() => {
  const report = {};
  for (const [state, metric] of Object.entries(stateMetrics)) {
    report[state] = {
      count: metric.count,
      avgDuration: metric.totalDuration / metric.count
    };
  }
  node.log('State metrics:', report);
}, 60000);
```

## Performance Optimization

### 1. Connection Reuse

```javascript
// Configure for maximum connection reuse
{
  enableConnectionPool: true,
  maxConnections: 10,
  maxConnectionsPerHost: 3,
  idleTimeout: 300000,  // 5 minutes
  connectionTimeout: 30000
}
```

### 2. Batch Reading

```javascript
// Read contiguous registers in one operation
// Instead of:
for (let i = 0; i < 10; i++) {
  msg.payload = { fc: 3, address: 100 + i, quantity: 1 };
  // Send message
}

// Do this:
msg.payload = { fc: 3, address: 100, quantity: 10 };
// Parse results array
```

### 3. Queue Optimization

```javascript
// Use appropriate queue sizes
{
  bufferCommands: true,
  maxQueueSize: 100,
  commandDelay: 10,  // Minimum delay between commands
  parallelUnitIdsAllowed: true  // Allow parallel ops to different units
}
```

## Troubleshooting

### Common Issues

#### 1. Connection Timeouts

```javascript
// Diagnosis
const diagnostics = node.getDiagnosticsReport();
if (diagnostics.errors.byType['CONNECTION_TIMEOUT'] > 0) {
  // Check network connectivity
  // Increase timeout values
  // Enable retry handler
}

// Solution
{
  clientTimeout: 5000,      // Increase from default 1000ms
  reconnectTimeout: 10000,  // Increase reconnect delay
  enableRetryHandler: true,
  maxRetries: 5
}
```

#### 2. Queue Overflow

```javascript
// Monitor queue depth
node.connectionPool.on('backpressure', ({ queueSize, maxSize }) => {
  const utilization = (queueSize / maxSize * 100).toFixed(1);
  node.warn(`Queue at ${utilization}% capacity`);
  
  // Implement backpressure
  if (queueSize > maxSize * 0.9) {
    // Stop accepting new requests temporarily
    node.status({ fill: "red", shape: "ring", text: "Queue full" });
  }
});
```

#### 3. State Machine Deadlock

```javascript
// Detect and recover from deadlock
const health = node.stateValidator.getHealthReport();
if (health.deadlockCheck.hasDeadlock) {
  node.warn('Deadlock detected:', health.deadlockCheck.warnings);
  
  // Force state machine reset
  node.stateService.send('STOP');
  setTimeout(() => {
    node.stateService.send('INIT');
  }, 1000);
}
```

### Debug Logging

```javascript
// Enable debug output
process.env.DEBUG = 'contribModbus*';

// Or specific components
process.env.DEBUG = 'contribModbus:core:client';

// In Node-RED settings.js
module.exports = {
  logging: {
    console: {
      level: "debug",
      metrics: false,
      audit: false
    }
  }
};
```

### Performance Profiling

```javascript
// Measure operation timing
const startTime = process.hrtime.bigint();

// ... Modbus operation ...

const endTime = process.hrtime.bigint();
const duration = Number(endTime - startTime) / 1000000; // Convert to ms

// Track metrics
const metrics = context.get('metrics') || {
  count: 0,
  total: 0,
  min: Infinity,
  max: 0
};

metrics.count++;
metrics.total += duration;
metrics.min = Math.min(metrics.min, duration);
metrics.max = Math.max(metrics.max, duration);

context.set('metrics', metrics);

// Report periodically
if (metrics.count % 100 === 0) {
  node.log({
    operations: metrics.count,
    avgTime: (metrics.total / metrics.count).toFixed(2),
    minTime: metrics.min.toFixed(2),
    maxTime: metrics.max.toFixed(2)
  });
}
```

## Security Best Practices

### 1. Credential Management

```javascript
// Never hardcode credentials
// BAD:
const tlsKey = "-----BEGIN PRIVATE KEY-----...";

// GOOD:
// Use environment variables
process.env.MODBUS_TLS_PRIVATE_KEY

// Or Node-RED credentials
this.credentials.tlsPrivateKey
```

### 2. Network Security

```javascript
// Use TLS for production
{
  tlsEnabled: true,
  tlsRejectUnauthorized: true,
  tlsServername: "modbus.example.com",
  secureProtocol: "TLSv1_3_method"
}

// Implement IP whitelisting
const allowedHosts = ['192.168.1.100', '192.168.1.101'];
if (!allowedHosts.includes(msg.payload.tcpHost)) {
  node.error('Unauthorized host');
  return;
}
```

### 3. Input Validation

```javascript
// Validate all inputs
function validateModbusMessage(msg) {
  const { fc, address, quantity, value } = msg.payload;
  
  // Validate function code
  const validFCs = [1, 2, 3, 4, 5, 6, 15, 16];
  if (!validFCs.includes(fc)) {
    throw new Error(`Invalid function code: ${fc}`);
  }
  
  // Validate address range
  if (address < 0 || address > 65535) {
    throw new Error(`Invalid address: ${address}`);
  }
  
  // Validate quantity
  if (quantity !== undefined) {
    const limits = {
      1: 2000,  // Coils
      2: 2000,  // Discrete inputs
      3: 125,   // Holding registers
      4: 125    // Input registers
    };
    
    if (quantity < 1 || quantity > (limits[fc] || 125)) {
      throw new Error(`Invalid quantity: ${quantity}`);
    }
  }
  
  return true;
}
```

## Testing

### Unit Testing

```javascript
// test/modbus-flow-test.js
const helper = require('node-red-node-test-helper');
const modbusNodes = require('../modbus/modbus-client.js');

describe('Modbus Client Node', function() {
  
  afterEach(function() {
    helper.unload();
  });
  
  it('should connect to TCP server', function(done) {
    const flow = [
      {
        id: "n1",
        type: "modbus-client",
        tcpHost: "127.0.0.1",
        tcpPort: 8502,
        clienttype: "tcp"
      }
    ];
    
    helper.load(modbusNodes, flow, function() {
      const n1 = helper.getNode("n1");
      
      n1.on('mbconnected', function() {
        done();
      });
      
      n1.on('mberror', function(err) {
        done(err);
      });
    });
  });
});
```

### Integration Testing

```javascript
// Test with mock Modbus server
const ModbusRTU = require('@openp4nr/node-modbus');
const server = new ModbusRTU.ServerTCP();

// Setup mock data
const holdingRegisters = new Array(100).fill(0);
holdingRegisters[0] = 1234;
holdingRegisters[1] = 5678;

server.setUnitID(1);
server.on('readHoldingRegisters', (addr, len, unitID, callback) => {
  const data = holdingRegisters.slice(addr, addr + len);
  callback(null, data);
});

// Start server
server.listen(8502, '127.0.0.1');

// Run tests against mock server
// ...

// Cleanup
server.close();
```

## Deployment

### Docker

```dockerfile
FROM nodered/node-red:latest

USER root
RUN apk add --no-cache python3 make g++

USER node-red
RUN npm install node-red-contrib-modbus

COPY flows.json /data/flows.json
COPY settings.js /data/settings.js

ENV MODBUS_TLS_PRIVATE_KEY=""
ENV MODBUS_TLS_CERTIFICATE=""
ENV MODBUS_TLS_CA=""

EXPOSE 1880
```

### Kubernetes

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: node-red-config
data:
  settings.js: |
    module.exports = {
      // Node-RED settings
    }
---
apiVersion: v1
kind: Secret
metadata:
  name: modbus-tls
type: Opaque
data:
  private-key: <base64-encoded-key>
  certificate: <base64-encoded-cert>
  ca: <base64-encoded-ca>
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-red-modbus
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: node-red
        image: custom/node-red-modbus:latest
        envFrom:
        - secretRef:
            name: modbus-tls
        volumeMounts:
        - name: config
          mountPath: /data/settings.js
          subPath: settings.js
      volumes:
      - name: config
        configMap:
          name: node-red-config
```