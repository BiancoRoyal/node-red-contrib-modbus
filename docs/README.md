# Node-RED Contrib Modbus Documentation

Welcome to the comprehensive documentation for `node-red-contrib-modbus`, the all-in-one Modbus TCP and Serial contribution package for Node-RED.

## Documentation Structure

### 📚 Core Documentation

- **[API.md](API.md)** - Complete API reference for developers
  - Core functions and interfaces
  - Node types and their configurations
  - Message patterns and data structures
  - Error handling patterns
  - Utilities and helper functions

- **[USAGE_GUIDE.md](USAGE_GUIDE.md)** - Practical usage guide for users
  - Quick start and installation
  - Connection setup (TCP/Serial)
  - Reading and writing data
  - Advanced patterns and best practices
  - Performance optimization
  - Troubleshooting common issues

- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Development and contribution guide
  - Development environment setup
  - Architecture overview
  - Building and testing procedures
  - Creating new nodes
  - Contributing guidelines
  - Release process

### 🔧 Generated Documentation

- **[gen/](gen/)** - Auto-generated JSDoc API documentation
  - Detailed function documentation
  - Module interfaces
  - Type definitions
  - Code examples

### 📋 Quick Reference

#### Node Types
| Node | Purpose | Input | Output |
|------|---------|-------|--------|
| `modbus-client` | Connection management | - | Events |
| `modbus-read` | Continuous reading | Timer | Data arrays |
| `modbus-write` | Data writing | Values | Confirmation |
| `modbus-getter` | On-demand reading | Trigger | Data arrays |
| `modbus-flex-*` | Dynamic operations | Parameters | Results |
| `modbus-server` | Test server | - | Responses |

#### Function Codes
| Code | Operation | Data Type | Description |
|------|-----------|-----------|-------------|
| 1 | Read Coils | Boolean | Digital outputs |
| 2 | Read Discrete Inputs | Boolean | Digital inputs |
| 3 | Read Holding Registers | 16-bit | Read/write registers |
| 4 | Read Input Registers | 16-bit | Read-only registers |
| 5 | Write Single Coil | Boolean | Single digital output |
| 6 | Write Single Register | 16-bit | Single register |
| 15 | Write Multiple Coils | Boolean[] | Multiple digital outputs |
| 16 | Write Multiple Registers | 16-bit[] | Multiple registers |

#### Common Status Values
| Status | Color | Meaning |
|--------|-------|---------|
| `waiting` | Blue | Waiting for connection |
| `connected` | Green | Connected to device |
| `active` | Green | Ready for operations |
| `error` | Red | Error occurred |
| `timeout` | Red | Command timeout |

## Getting Started

### 1. Installation
```bash
npm install node-red-contrib-modbus
```

### 2. Basic Configuration
1. Add a `modbus-client` configuration node
2. Configure connection (TCP or Serial)
3. Add read/write nodes as needed
4. Connect to debug nodes to see results

### 3. First Flow
```json
[
  {
    "id": "client1",
    "type": "modbus-client",
    "clienttype": "tcp",
    "tcpHost": "192.168.1.100",
    "tcpPort": 502
  },
  {
    "id": "read1", 
    "type": "modbus-read",
    "server": "client1",
    "dataType": "HoldingRegister",
    "adr": 0,
    "quantity": 10
  }
]
```

## Architecture Overview

### Core Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Node-RED UI   │    │   Runtime Nodes  │    │  Core Modules   │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ modbus-*.html   │───▶│  modbus-*.js     │───▶│ modbus-core.js  │
│ Configuration   │    │  Event Handlers  │    │ modbus-basics.js│
│ Editor Forms    │    │  Message Flow    │    │ State Management│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                ▲                        │
                                │                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Node-RED      │    │  Modbus Client   │    │  Modbus Device  │
│   Flow Engine   │◀───┤  State Machine   │◀───┤  (PLC/Sensor)   │
│                 │    │  Connection Mgmt │    │  TCP/Serial     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow

```
Input Message → Validation → Queue → Modbus Command → Device → Response → Processing → Output
```

### State Management

The client uses a finite state machine for robust connection handling:

```
init → connecting → connected → active ⟷ queueing → sending → active
 ↓                                ↓
error ← broken ← reconnecting ← timeout
 ↓
closed
```

## Key Features

### ✅ Comprehensive Protocol Support
- **Modbus TCP** - Ethernet/WiFi communications
- **Modbus RTU** - Serial RS-485/RS-232
- **Modbus ASCII** - ASCII serial protocol
- **Custom Function Codes** - Proprietary commands

### ✅ Robust Connection Management
- **State Machine** - Reliable connection handling
- **Auto-Reconnection** - Automatic recovery from failures
- **Queue Management** - Command buffering and scheduling
- **Error Handling** - Comprehensive error recovery

### ✅ Performance Optimization
- **Parallel Processing** - Multiple unit ID support
- **Command Buffering** - Reduces network overhead
- **Dynamic Polling** - Configurable refresh rates
- **Memory Efficiency** - Proper resource cleanup

### ✅ Developer Friendly
- **TypeScript Support** - Type definitions included
- **Comprehensive Testing** - Unit and integration tests
- **Debug Support** - Detailed logging capabilities
- **Documentation** - Extensive guides and examples

## Common Use Cases

### Industrial Automation
- **PLC Communication** - Read/write PLC registers
- **Sensor Monitoring** - Continuous data collection
- **Process Control** - Automated system control
- **Data Logging** - Historical data collection

### IoT Integration
- **Gateway Applications** - Protocol conversion
- **Cloud Connectivity** - IoT platform integration
- **Edge Computing** - Local data processing
- **Remote Monitoring** - Distributed system oversight

### Testing and Simulation
- **Device Simulation** - Mock Modbus devices
- **Protocol Testing** - Verify communications
- **Load Testing** - Performance validation
- **Development Support** - Offline development

## Support and Community

### 📖 Resources
- [GitHub Repository](https://github.com/BiancoRoyal/node-red-contrib-modbus)
- [npm Package](https://www.npmjs.com/package/node-red-contrib-modbus)
- [Node-RED Library](https://flows.nodered.org/node/node-red-contrib-modbus)
- [Wiki Documentation](https://github.com/BiancoRoyal/node-red-contrib-modbus/wiki)

### 🎓 Learning
- [Example Flows](../examples/) - Ready-to-use examples
- [YouTube Tutorials](http://bit.ly/2jzwjqP) - Video guides
- [Leanpub Book](https://leanpub.com/p4nr-contribution-modbus/) - Comprehensive guide

### 🤝 Community
- [GitHub Issues](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/BiancoRoyal/node-red-contrib-modbus/discussions) - Community support
- [P4NR Community](https://plus4nodered.com/) - Professional support

### 💡 Contributing
We welcome contributions! See our [Developer Guide](DEVELOPER_GUIDE.md) for:
- Development environment setup
- Coding standards and guidelines
- Testing procedures
- Pull request process

## License and Copyright

Copyright (c) since 2016 Klaus Landsdorf (http://plus4nodered.com/)  
Licensed under BSD 3-Clause License

### Contributors
This project exists thanks to all the people who contribute:
- **Klaus Landsdorf** - Original author and maintainer
- **P4NR Community** - Current development team
- **Community Contributors** - Bug fixes, features, documentation

## Version Information

- **Current Version**: Check [package.json](../package.json)
- **Node.js Compatibility**: LTS versions (18+)
- **Node-RED Compatibility**: v3.1.0+ (v4.1.0+ recommended)
- **Source Version**: ES2019
- **Deploy Version**: ES2015

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for detailed version history and [HISTORY.md](../HISTORY.md) for legacy information.