# Modbus TLS Nodes Documentation

## Overview

Two new nodes have been added to the node-red-contrib-modbus package to support secure TLS/SSL encrypted Modbus TCP communication:

1. **Modbus-Server-TLS**: A demo server with automatic data generation and TLS support
2. **Modbus-Client-TLS**: A secure client with advanced reliability features

## Features

### Modbus TLS Demo Server (`modbus-server-tls`)

#### Key Features:
- **TLS/SSL Encryption**: Secure communication with configurable TLS options
- **Self-Signed Certificate Generation**: Automatic certificate generation in demo mode
- **Demo Data Generation**: Four different data patterns for testing
- **All Modbus Functions**: Support for coils, discrete inputs, holding registers, and input registers
- **Configurable Buffer Sizes**: Adjustable memory allocation for each register type

#### Data Generation Patterns:
1. **Sequential**: Incrementing counter values
2. **Random**: Random values within range
3. **Sine Wave**: Sinusoidal pattern for analog simulation
4. **Square Wave**: Alternating high/low values for digital simulation

#### Configuration Options:
- **Server Settings**:
  - Host: IP address to bind (default: 0.0.0.0)
  - Port: Server port (default: 8502)
  - Response Delay: Configurable delay for testing slow responses
  
- **TLS Settings**:
  - Private Key: Server private key (file path or PEM content)
  - Certificate: Server certificate (file path or PEM content)
  - CA Certificate: Certificate authority (optional)
  - TLS Protocol: TLSv1.2, TLSv1.3, or auto
  - Reject Unauthorized: Client certificate validation
  - Request Client Certificate: Mutual TLS authentication

- **Demo Mode Settings**:
  - Enable Demo Mode: Auto-generate test data
  - Data Pattern: Sequential, Random, Sine, or Square wave
  - Update Interval: How often to update demo data (ms)

#### Usage:
```javascript
// Control via input messages
msg.payload = "start"    // Start server
msg.payload = "stop"     // Stop server
msg.payload = "restart"  // Restart server

// Update configuration
msg.payload = {
  pattern: "sine",      // Change data pattern
  interval: 2000        // Change update interval
}
```

### Modbus TLS Client (`modbus-client-tls`)

#### Key Features:
- **TLS/SSL Encryption**: Secure connection to Modbus TLS servers
- **Circuit Breaker**: Protection against cascading failures
- **Retry Handler**: Automatic retry with exponential backoff
- **Connection Pool**: Efficient connection management (optional)
- **Diagnostics**: Comprehensive monitoring and alerting (optional)
- **Client Certificate Auth**: Support for mutual TLS

#### Advanced Reliability Features:

##### Circuit Breaker:
- Prevents system overload during failures
- Three states: CLOSED (normal), OPEN (blocked), HALF_OPEN (testing)
- Configurable failure and success thresholds
- Automatic recovery with timeout

##### Retry Handler:
- Exponential backoff with jitter
- Configurable max retries and delays
- Smart retry conditions for network errors
- Statistics tracking

##### Connection Pool:
- Limit connections per host
- Queue management for pending requests
- Connection reuse for efficiency

##### Diagnostics:
- Request/response tracking
- Performance metrics
- Error monitoring
- Alert generation

#### Configuration Options:
- **Connection Settings**:
  - Host: Server hostname or IP
  - Port: Server port (default: 8502)
  - Unit ID: Modbus unit identifier
  
- **TLS Settings**:
  - Client Key: Private key for client auth (optional)
  - Client Certificate: Certificate for client auth (optional)
  - CA Certificate: For server verification
  - Server Name: SNI (Server Name Indication)
  - Reject Unauthorized: Validate server certificate
  - Check Server Identity: Verify server hostname

- **Timing Settings**:
  - Command Delay: Delay between commands
  - Timeout: Request timeout
  - Reconnect Timeout: Time before reconnection attempt

- **Advanced Features** (all optional):
  - Circuit Breaker: Enable/disable with thresholds
  - Retry Handler: Configure retry behavior
  - Connection Pool: Pool size limits
  - Diagnostics: Metrics and alerting

#### Usage:
```javascript
// Control via input messages
msg.payload = "connect"     // Connect to server
msg.payload = "disconnect"  // Disconnect from server
msg.payload = "reconnect"   // Reconnect to server
```

## Integration with New Core Features

Both TLS nodes integrate with the newly implemented core features:

1. **Circuit Breaker** (`modbus-circuit-breaker.js`):
   - Automatic failure protection
   - State management
   - Recovery mechanisms

2. **Retry Handler** (`modbus-retry-handler.js`):
   - Smart retry logic
   - Exponential backoff
   - Error classification

3. **Connection Pool** (`modbus-connection-pool.js`):
   - Connection management
   - Resource optimization
   - Queue handling

4. **Diagnostics** (`modbus-diagnostics.js`):
   - Performance monitoring
   - Error tracking
   - Alert system

## Security Considerations

### TLS Configuration Best Practices:
1. **Production Use**:
   - Use proper certificates from a trusted CA
   - Enable "Reject Unauthorized" for certificate validation
   - Use TLS 1.2 or higher
   - Implement mutual TLS for enhanced security

2. **Testing/Development**:
   - Self-signed certificates acceptable
   - Can disable certificate validation for testing
   - Demo mode generates certificates automatically

3. **Certificate Management**:
   - Store certificates securely
   - Rotate certificates regularly
   - Use strong key sizes (2048-bit RSA minimum)

## Example Node-RED Flow

```json
[
  {
    "id": "tls-server",
    "type": "modbus-server-tls",
    "name": "Demo TLS Server",
    "hostname": "0.0.0.0",
    "serverPort": 8502,
    "demoMode": true,
    "demoDataPattern": "sine",
    "demoUpdateInterval": 1000
  },
  {
    "id": "tls-client",
    "type": "modbus-client-tls",
    "name": "Secure Client",
    "tcpHost": "localhost",
    "tcpPort": 8502,
    "rejectUnauthorized": false,
    "circuitBreakerEnabled": true,
    "retryHandlerEnabled": true
  },
  {
    "id": "modbus-read",
    "type": "modbus-read",
    "name": "Read Registers",
    "dataType": "HoldingRegister",
    "adr": 0,
    "quantity": 10,
    "server": "tls-client"
  }
]
```

## Testing

The TLS nodes include comprehensive unit tests:
- Configuration validation
- TLS option handling
- Demo data generation patterns
- Integration with core features

Run tests:
```bash
npm run mocha:base -- test/core/modbus-tls-test.js
```

## Dependencies

New dependency added:
- `node-forge`: For self-signed certificate generation in demo mode

## Migration from Standard TCP

To migrate from standard Modbus TCP to TLS:

1. Replace `modbus-client` with `modbus-client-tls`
2. Replace `modbus-server` with `modbus-server-tls`
3. Configure TLS certificates
4. Update port numbers (typically 502 → 8502)
5. Enable security features as needed

## Troubleshooting

### Common Issues:

1. **Certificate Errors**:
   - Ensure certificate paths are correct
   - Check certificate validity dates
   - Verify certificate chain

2. **Connection Failures**:
   - Check circuit breaker status
   - Verify TLS protocol compatibility
   - Ensure firewall allows TLS port

3. **Performance Issues**:
   - Adjust retry handler settings
   - Configure connection pool limits
   - Monitor with diagnostics

## Future Enhancements

Potential improvements for future versions:
- Certificate rotation automation
- OCSP stapling support
- Enhanced certificate validation options
- Performance optimizations for high-throughput scenarios
- Integration with external PKI systems