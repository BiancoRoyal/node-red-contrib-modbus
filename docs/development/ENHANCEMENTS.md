# Node-RED Modbus v6.0 Enhancements

## Overview
This document details the enterprise-grade enhancements implemented in Node-RED Modbus v6.0, providing production-ready resilience, security, and performance features.

## 🛡️ Security Enhancements

### TLS 1.3 Support with Secure Credential Management

#### Configuration
```javascript
// Environment Variables (Recommended)
export MODBUS_TLS_PRIVATE_KEY="$(cat private-key.pem)"
export MODBUS_TLS_CERTIFICATE="$(cat certificate.pem)"
export MODBUS_TLS_CA="$(cat ca.pem)"

// Node Configuration
{
  "tlsEnabled": true,
  "tlsRejectUnauthorized": true,  // Default: true (secure)
  "secureProtocol": "TLSv1_3_method",  // Default: TLS 1.3
  "minVersion": "TLSv1.2"  // Minimum TLS 1.2
}
```

#### Security Features
- **Credential Hierarchy**: Node-RED credentials → Environment variables → Config (with warnings)
- **Modern Encryption**: TLS 1.3 default with TLS 1.2 minimum
- **Server Verification**: Certificate validation and identity checks
- **Security Warnings**: Automatic alerts for plain text credentials

## 🔄 Resilience Features

### Circuit Breaker Pattern

Prevents cascading failures and provides graceful degradation.

```javascript
class ModbusCircuitBreaker {
  constructor(options) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 30000;
    this.state = 'CLOSED';  // CLOSED | OPEN | HALF_OPEN
  }
}
```

#### States
- **CLOSED**: Normal operation, requests pass through
- **OPEN**: Circuit tripped, requests fail fast
- **HALF_OPEN**: Testing recovery, limited requests allowed

#### Configuration
```javascript
{
  "enableCircuitBreaker": true,
  "failureThreshold": 5,      // Failures before opening
  "successThreshold": 2,      // Successes to close
  "circuitBreakerTimeout": 30000  // Time before half-open (ms)
}
```

### Connection Pool Management

Efficient connection reuse with resource protection.

```javascript
class ModbusConnectionPool {
  constructor(options) {
    this.maxConnections = options.maxConnections || 10;
    this.maxConnectionsPerHost = options.maxConnectionsPerHost || 3;
    this.maxQueueSize = options.maxQueueSize || 100;
    this.priorityLevels = options.priorityLevels || 3;
  }
}
```

#### Features
- **Connection Reuse**: 40-60% latency reduction
- **Priority Queuing**: 3-level priority system (0 = highest)
- **Health Monitoring**: Automatic unhealthy connection removal
- **Backpressure**: Queue limit protection with warnings at 80%

#### Configuration
```javascript
{
  "enableConnectionPool": true,
  "maxConnections": 10,
  "maxConnectionsPerHost": 3,
  "connectionTimeout": 30000,
  "idleTimeout": 120000,
  "healthCheckInterval": 30000
}
```

### Retry Handler with Exponential Backoff

Intelligent retry mechanism for transient failures.

```javascript
class ModbusRetryHandler {
  async execute(operation, options) {
    const { maxRetries = 3, initialDelay = 1000, factor = 2 } = options;
    let delay = initialDelay;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i < maxRetries) {
          await this.delay(delay);
          delay = Math.min(delay * factor, 30000);
        } else {
          throw error;
        }
      }
    }
  }
}
```

#### Configuration
```javascript
{
  "enableRetryHandler": true,
  "maxRetries": 3,
  "initialRetryDelay": 1000,
  "maxRetryDelay": 30000,
  "retryFactor": 2
}
```

## 🔍 Monitoring & Diagnostics

### State Machine Validator

Detects and prevents deadlocks in the FSM.

```javascript
class ModbusStateValidator {
  detectDeadlock() {
    // Monitor for stuck states
    // Detect rapid cycling
    // Track state duration
    return {
      hasDeadlock: boolean,
      stuckState: string,
      warnings: string[],
      suggestions: string[]
    };
  }
}
```

#### Features
- **Deadlock Detection**: Identifies stuck states and cycles
- **Health Reporting**: State machine health metrics
- **Recovery Suggestions**: Actionable recommendations
- **Transition Validation**: Ensures valid state changes

### Timer Manager

Centralized timer management prevents memory leaks.

```javascript
class ModbusTimerManager {
  constructor(options) {
    this.maxTimersPerNode = options.maxTimersPerNode || 20;
    this.warningThreshold = options.warningThreshold || 50;
    this.enableAutoCleanup = options.enableAutoCleanup !== false;
  }
}
```

#### Features
- **Leak Prevention**: Automatic cleanup of stale timers
- **Resource Limits**: Per-node timer limits
- **Tracking**: Comprehensive timer statistics
- **Warnings**: Alerts for high timer counts

### Enhanced Diagnostics

Comprehensive metrics and health reporting.

```javascript
const report = node.getDiagnosticsReport();
```

#### Report Contents
```javascript
{
  connections: {
    total, active, idle, failed, successRate
  },
  performance: {
    averageResponseTime, p95ResponseTime, successRate
  },
  errors: {
    total, byType, recent
  },
  queue: {
    depth, waiting, averageWaitTime
  },
  state: {
    current, transitions, deadlockCheck
  },
  timers: {
    active, peak, leaked
  },
  alerts: []
}
```

## ⚡ Performance Improvements

### Resource Protection

#### Memory Protection
- **Queue Limits**: Maximum 100 queued requests
- **Backpressure**: Warnings at 80% capacity
- **Error Context**: Rich error information with limits

#### Connection Optimization
- **Pooling**: Reuse connections across operations
- **Priority**: Critical operations get priority
- **Health Checks**: Remove unhealthy connections

### Error Handling

Enhanced error context for better debugging.

```javascript
{
  message: "Connection timeout",
  code: "CONNECTION_TIMEOUT",
  context: {
    nodeId: "abc123",
    config: {
      host: "192.168.1.100",
      port: 502,
      priority: 1
    },
    timestamp: "2024-01-15T10:30:00Z"
  },
  originalError: Error
}
```

## 📋 Configuration Examples

### High Reliability Setup

```javascript
{
  "name": "High Reliability Modbus",
  "clienttype": "tcp",
  "tcpHost": "modbus.example.com",
  "tcpPort": 8502,
  
  // Security
  "tlsEnabled": true,
  "tlsRejectUnauthorized": true,
  
  // Resilience
  "enableCircuitBreaker": true,
  "failureThreshold": 3,
  "successThreshold": 2,
  
  "enableConnectionPool": true,
  "maxConnections": 5,
  
  "enableRetryHandler": true,
  "maxRetries": 5,
  
  // Monitoring
  "enableDiagnostics": true,
  "enableTimerTracking": true,
  
  // Timeouts
  "clientTimeout": 5000,
  "reconnectTimeout": 10000,
  "reconnectOnTimeout": true
}
```

### Performance Optimized Setup

```javascript
{
  "name": "Performance Modbus",
  
  // Connection Pool
  "enableConnectionPool": true,
  "maxConnections": 20,
  "maxConnectionsPerHost": 5,
  "idleTimeout": 300000,
  
  // Queue Management
  "bufferCommands": true,
  "parallelUnitIdsAllowed": true,
  "commandDelay": 5,
  
  // Minimal Retries
  "enableRetryHandler": true,
  "maxRetries": 2,
  "initialRetryDelay": 500,
  
  // Fast Timeouts
  "clientTimeout": 2000,
  "reconnectTimeout": 5000
}
```

### Security Focused Setup

```javascript
{
  "name": "Secure Modbus",
  
  // TLS Configuration
  "tlsEnabled": true,
  "tlsRejectUnauthorized": true,
  "secureProtocol": "TLSv1_3_method",
  "minVersion": "TLSv1.2",
  "tlsCheckServerIdentity": true,
  
  // Use Environment Variables for Credentials
  // MODBUS_TLS_PRIVATE_KEY
  // MODBUS_TLS_CERTIFICATE
  // MODBUS_TLS_CA
  
  // Conservative Limits
  "maxConnections": 3,
  "maxConnectionsPerHost": 1,
  "maxQueueSize": 50,
  
  // Extensive Logging
  "showErrors": true,
  "showWarnings": true,
  "failureLogEnabled": true,
  "enableDiagnostics": true
}
```

## 🚀 Migration from v5.x

### Breaking Changes
- Minimum Node.js: 18.5
- Minimum Node-RED: 4.0
- TLS 1.0/1.1 no longer supported

### New Features to Enable
```javascript
// Add to existing configurations
{
  // Resilience
  "enableCircuitBreaker": true,
  "enableConnectionPool": true,
  "enableRetryHandler": true,
  
  // Security
  "tlsRejectUnauthorized": true,  // Now defaults to true
  "secureProtocol": "TLSv1_3_method",
  
  // Monitoring
  "enableDiagnostics": true,
  "enableTimerTracking": true
}
```

### Credential Migration
```bash
# Move credentials to environment variables
export MODBUS_TLS_PRIVATE_KEY="$(cat /path/to/key.pem)"
export MODBUS_TLS_CERTIFICATE="$(cat /path/to/cert.pem)"
export MODBUS_TLS_CA="$(cat /path/to/ca.pem)"
```

## 📊 Monitoring Integration

### Prometheus Metrics

```javascript
// Export metrics in Prometheus format
const metrics = node.exportMetrics('prometheus');

// Example output:
# HELP modbus_connections_active Active Modbus connections
# TYPE modbus_connections_active gauge
modbus_connections_active{node="abc123"} 5

# HELP modbus_requests_total Total Modbus requests
# TYPE modbus_requests_total counter
modbus_requests_total{node="abc123",status="success"} 1234
modbus_requests_total{node="abc123",status="failure"} 12

# HELP modbus_response_time_seconds Response time histogram
# TYPE modbus_response_time_seconds histogram
modbus_response_time_seconds_bucket{le="0.1"} 1000
modbus_response_time_seconds_bucket{le="0.5"} 1150
```

### Event Monitoring

```javascript
// Monitor resilience events
node.connectionPool.on('backpressure', ({ level, queueSize }) => {
  console.log(`Queue backpressure: ${level} at ${queueSize}`);
});

node.circuitBreaker.on('stateChange', ({ from, to }) => {
  console.log(`Circuit breaker: ${from} -> ${to}`);
});

node.timerManager.on('warning', ({ type, details }) => {
  console.log(`Timer warning: ${type}`, details);
});
```

## 🔧 Troubleshooting

### Common Issues

#### High Queue Depth
```javascript
// Monitor and adjust
if (diagnostics.queue.depth > 80) {
  // Increase pool size
  node.connectionPool.maxConnections = 15;
  // Or reduce load
  node.commandDelay = 20;
}
```

#### Circuit Breaker Tripping
```javascript
// Check failure rate
if (circuitBreaker.state === 'OPEN') {
  // Increase thresholds
  circuitBreaker.failureThreshold = 10;
  // Or increase timeout
  node.clientTimeout = 10000;
}
```

#### Memory Leaks
```javascript
// Check timer leaks
const timerStats = node.timerManager.getStatistics();
if (timerStats.leaked > 0) {
  // Enable auto-cleanup
  node.timerManager.enableAutoCleanup = true;
}
```

## 📚 Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Specification](./API_SPECIFICATION.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Security Best Practices](./SECURITY.md)
- [Performance Tuning Guide](./PERFORMANCE.md)