# Node-RED Modbus Examples

Welcome to the node-red-contrib-modbus examples! These examples are organized by complexity to help you learn Modbus communication in Node-RED.

## 📚 Example Categories

### 1️⃣ [Getting Started](./1-getting-started/)
Perfect for beginners learning Modbus basics:
- **simple-modbus-read.json** - Basic reading of holding registers
- **simple-modbus-write.json** - Writing values to registers

### 2️⃣ [Basic Operations](./2-basic-operations/)
Learn different Modbus data types and operations:
- **read-coils-and-inputs.json** - Working with all Modbus data types (FC01-FC04)

### 3️⃣ [Advanced Features](./3-advanced-features/)
Explore powerful features for complex scenarios:
- **flex-operations.json** - Dynamic addressing and custom function codes

### 4️⃣ [Security](./4-security/)
Implement secure Modbus communication:
- **[tls-secure-modbus/](./4-security/tls-secure-modbus/)** - Encrypted Modbus TCP with TLS/SSL
  - modbus-tls-server-flow.json - TLS-enabled server example
  - modbus-tls-client-flow.json - TLS-enabled client example
  - certs/generate-certificates.sh - Certificate generation script

## 🚀 How to Use These Examples

### Method 1: Import from Node-RED Menu (Recommended)
1. Open Node-RED in your browser
2. Click the menu (☰) in the top-right corner
3. Select **Import → Examples → node-red-contrib-modbus**
4. Navigate through the numbered categories
5. Select an example and click **Import**

### Method 2: Manual Import
1. Navigate to the desired category folder (1-getting-started, 2-basic-operations, etc.)
2. Open any `.json` file
3. Copy the entire content
4. In Node-RED, go to **Menu → Import → Clipboard**
5. Paste the content and click **Import**

## 🎯 Learning Path

### Beginner Journey
Start with **[1-getting-started](./1-getting-started/)** examples:
1. **simple-modbus-read.json** - Understand basic communication
2. **simple-modbus-write.json** - Learn sending data

### Intermediate Path
Progress to **[2-basic-operations](./2-basic-operations/)**:
1. **read-coils-and-inputs.json** - Master all Modbus data types
2. Understand function codes FC01-FC04

### Advanced Mastery
Explore **[3-advanced-features](./3-advanced-features/)**:
1. **flex-operations.json** - Dynamic operations with flex nodes
2. Custom function codes and runtime configuration

### Security Implementation
Implement **[4-security](./4-security/)** features:
1. Navigate to **[tls-secure-modbus/](./4-security/tls-secure-modbus/)**
2. Generate certificates using the provided script
3. Deploy server and client flows with TLS encryption

## 📋 Common Setup Steps

### For All Examples:
1. **TCP Examples**: Configure the Modbus client node with your server's IP (default: 127.0.0.1:502)
2. **TLS Examples**: Use port 8502 and configure certificates
3. **Serial Examples**: Set correct port and baud rate

### Quick Test Setup:
- Use `Modbus-Demo-Server-Showcase.json` as a test server
- Provides simulated data for all client examples

## 🛠️ Troubleshooting

### Connection Issues
- Verify IP address and port
- Check firewall settings
- For TLS: Ensure certificates are generated

### Enable Debug Output
```bash
DEBUG=contribModbus* node-red
```

---

## 📚 Legacy Example Flows

The following examples are maintained for backwards compatibility:

### 3. Server Examples

#### Modbus-Demo-Server-Showcase.json ⭐ NEW
Interactive demo server with simulated industrial data.
- **Features**:
  - Real-time sensor simulation
  - Motor control logic
  - Alarm management system
  - Data historian
  - Performance monitoring
- **Use Case**: Testing, development, training
- **Difficulty**: Intermediate

#### Modbus-Buffer-Server.json
Server with buffer management for data storage.
- **Features**: Buffer configuration, data persistence, memory management
- **Use Case**: Data buffering and caching
- **Difficulty**: Intermediate

#### Modbus-Slave.json
Modbus slave device simulation.
- **Features**: Slave configuration, response handling, register mapping
- **Use Case**: Device simulation and testing
- **Difficulty**: Intermediate

### 4. Advanced Features

#### Modbus-Advanced-Features.json ⭐ NEW
Showcases advanced patterns and optimizations.
- **Features**:
  - Connection pooling for load balancing
  - Circuit breaker pattern for fault tolerance
  - Exponential backoff retry strategies
  - Batch request optimization
  - Performance monitoring
- **Use Case**: Production deployments, high-availability systems
- **Difficulty**: Expert

#### Modbus-Flex-Suite.json
Flexible Modbus operations with dynamic configuration.
- **Features**: Dynamic addressing, runtime configuration, flexible function codes
- **Use Case**: Dynamic industrial systems
- **Difficulty**: Advanced

#### Modbus-Flex-FC.json
Flexible function code operations.
- **Features**: Custom function codes, protocol extensions
- **Use Case**: Special protocol requirements
- **Difficulty**: Advanced

### 5. Integration Examples

#### Modbus-HTTP.json
HTTP API integration with Modbus.
- **Features**: REST API, web dashboard, HTTP endpoints
- **Use Case**: Web integration, remote monitoring
- **Difficulty**: Intermediate

#### CODESYS-CSV-To-IO.json
CODESYS PLC integration with CSV data mapping.
- **Features**: CSV parsing, PLC integration, data transformation
- **Use Case**: CODESYS PLC systems
- **Difficulty**: Advanced

#### Modbus-Sequencer-Demo.json
Sequential Modbus operations.
- **Features**: Operation sequencing, timing control, state management
- **Use Case**: Complex operation workflows
- **Difficulty**: Intermediate

### 6. Multi-Device Examples

#### Modbus-Read-Write-Servers.json
Multiple server management.
- **Features**: Multi-server connections, load distribution, failover
- **Use Case**: Distributed systems
- **Difficulty**: Advanced

#### Multiple-Dynamic-FunctionCodes.json
Dynamic function code switching.
- **Features**: Runtime FC selection, protocol flexibility
- **Use Case**: Multi-protocol environments
- **Difficulty**: Advanced

#### modbus-switch-tcp.json
TCP connection switching and management.
- **Features**: Connection switching, failover, redundancy
- **Use Case**: High-availability systems
- **Difficulty**: Intermediate

## 🚀 Getting Started

### Installation

1. Ensure you have Node-RED installed
2. Install the node-red-contrib-modbus package:
   ```bash
   npm install node-red-contrib-modbus
   ```
3. Start Node-RED:
   ```bash
   node-red
   ```

### Importing Examples

1. Open Node-RED in your browser (default: http://localhost:1880)
2. Click the menu (☰) → Import → Examples → node-red-contrib-modbus
3. Select an example flow
4. Click Import

Alternatively, manually import:
1. Click the menu (☰) → Import
2. Select "Import from file"
3. Choose an example JSON file from this directory
4. Click Import

### Using the Examples

Each example includes:
- 📝 **Comment nodes** explaining the functionality
- 🔧 **Pre-configured nodes** ready to use
- 📊 **Debug nodes** to see the data flow
- 💡 **Best practices** demonstrated in the flow

## 📖 Example Categories Explained

### For Beginners
Start with:
1. `Simple-Modbus-Demo.json` - Basic read/write operations
2. `Simple-Modbus-IO-Demo.json` - IO operations

### For Security-Conscious Deployments
Focus on:
1. `Modbus-TLS-Security.json` - TLS encryption setup
2. Review security comment nodes for best practices

### For High-Performance Systems
Study:
1. `Modbus-Advanced-Features.json` - Performance optimizations
2. Connection pooling and batching examples

### For Testing and Development
Use:
1. `Modbus-Demo-Server-Showcase.json` - Full-featured test server
2. Includes sensor simulation and alarm management

## 🛠️ Customization Tips

### Adapting Examples to Your System

1. **Change IP addresses**: Update the TCP host in client nodes
2. **Modify ports**: Default is 502, change if needed
3. **Adjust timing**: Update polling rates and delays
4. **Scale registers**: Modify address ranges and quantities
5. **Add error handling**: Enhance with catch nodes

### Common Modifications

```javascript
// Example: Changing polling rate
// In modbus-read nodes, modify:
"rate": "5",        // Change from 5 seconds
"rateUnit": "s",    // to your requirement

// Example: Scaling register values
// In function nodes, add:
msg.payload = msg.payload.map(val => val * 0.1); // Scale by 0.1
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if Modbus server is running
   - Verify IP address and port
   - Check firewall settings

2. **Timeout Errors**
   - Increase timeout values in client configuration
   - Check network connectivity
   - Verify server response delay settings

3. **TLS Certificate Errors**
   - Ensure certificates are valid and not expired
   - Check file paths are correct
   - Verify certificate chain

4. **Data Mismatch**
   - Verify register addresses
   - Check data types (Coil, Register, etc.)
   - Confirm byte order (endianness)

## 📚 Additional Resources

### Documentation
- [Package Documentation](../README.md)
- [API Reference](../docs/api/API_SPECIFICATION.md)
- [Architecture Guide](../docs/architecture/ARCHITECTURE.md)

### Tutorials
- [Getting Started Guide](../docs/GETTING_STARTED.md)
- [TLS Setup Guide](../docs/development/TLS_NODES_DOCUMENTATION.md)
- [Performance Tuning](../docs/PERFORMANCE.md)

### Support
- [GitHub Issues](https://github.com/biancoroyal/node-red-contrib-modbus/issues)
- [Node-RED Forum](https://discourse.nodered.org/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/node-red-contrib-modbus)

## 🤝 Contributing

We welcome contributions! To add new examples:

1. Create a descriptive flow demonstrating a specific feature
2. Add comprehensive comment nodes explaining the functionality
3. Test the flow thoroughly
4. Submit a pull request with:
   - The example JSON file
   - Update to this README
   - Description of the use case

## 📄 License

These examples are provided under the same license as the node-red-contrib-modbus package (BSD-3-Clause).

---

**Note**: Examples marked with ⭐ are newly added and showcase the latest features of the package.