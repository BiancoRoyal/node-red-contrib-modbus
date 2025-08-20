# Developer Guide - Node-RED Contrib Modbus

## Table of Contents

1. [Development Environment](#development-environment)
2. [Architecture Overview](#architecture-overview)
3. [Building and Testing](#building-and-testing)
4. [Node Development](#node-development)
5. [Core Module Development](#core-module-development)
6. [Testing Guidelines](#testing-guidelines)
7. [Contributing](#contributing)
8. [Release Process](#release-process)

## Development Environment

### Prerequisites

- **Node.js**: LTS version (18+)
- **Node-RED**: v3.1.0+ (v4.1.0+ recommended)
- **Git**: For version control
- **npm**: Package management

### Setup

```bash
# Clone repository
git clone https://github.com/BiancoRoyal/node-red-contrib-modbus.git
cd node-red-contrib-modbus

# Install dependencies
npm install

# Build project (transpile ES2019 → ES2015)
npm run build

# Link for local development
npm run dev:link
```

### Project Structure

```
src/                    # Source files (ES2019)
├── core/              # Core business logic
├── modbus-*.js        # Node runtime implementations
├── modbus-*.html      # Node-RED editor UI
└── locales/          # Internationalization

modbus/                # Built files (ES2015) - deployed to Node-RED
test/                  # Test suites
├── units/             # Unit tests
├── core/              # Core module tests  
├── e2e/               # End-to-end tests
└── helper/            # Test utilities

docs/                  # Documentation
examples/              # Example flows
```

## Architecture Overview

### Core Components

#### 1. Node Types
- **Configuration Node**: `modbus-client` - Connection management
- **Read Nodes**: `modbus-read`, `modbus-getter`, `modbus-flex-getter`
- **Write Nodes**: `modbus-write`, `modbus-flex-write`
- **Server Node**: `modbus-server` - Test server
- **Utility Nodes**: `modbus-queue-info`, `modbus-response`, etc.

#### 2. Core Modules (`src/core/`)
- **`modbus-core.js`** - Message handling, function codes, buffer management
- **`modbus-client-core.js`** - Connection management, state machine
- **`modbus-io-core.js`** - Data processing, type conversion
- **`modbus-queue-core.js`** - Command queuing, scheduling
- **`modbus-server-core.js`** - Server functionality

#### 3. State Management
Uses XState FSM (`@xstate/fsm`) for robust state management:

```javascript
const states = {
  init: 'Initializing connection',
  connected: 'TCP/Serial connected', 
  activated: 'Ready for operations',
  queueing: 'Commands in queue',
  sending: 'Sending command',
  closed: 'Connection closed'
};
```

### Data Flow

```
Input Message → Validation → Queue → Modbus Command → Device Response → Processing → Output
```

1. **Input Processing**: Validate and parse incoming messages
2. **Queue Management**: Buffer commands based on client settings
3. **Command Execution**: Send Modbus protocol commands
4. **Response Handling**: Process device responses
5. **Output Generation**: Create structured Node-RED messages

## Building and Testing

### Build Commands

```bash
# Clean previous builds
npm run clean

# Full build (lint + transpile + docs)
npm run build

# Lint only
npm run lint

# Generate documentation
npm run docs
```

### Build Process

1. **StandardJS Linting** - Code style enforcement
2. **Babel Transpilation** - ES2019 → ES2015 for compatibility
3. **Gulp Processing** - File copying, minification
4. **Documentation Generation** - JSDoc-based API docs

### Test Commands

```bash
# Run all tests in parallel
npm test

# Run specific test suites
npm run test:units      # Unit tests only
npm run test:core       # Core modules only
npm run test:e2e        # End-to-end tests only

# Run with extended timeout for slow systems
npm run test:slow

# Run single test file
npm run mocha:base -- test/units/modbus-client-test.js

# Generate coverage report
npm run coverage
```

### Test Structure

```javascript
// Test file structure
describe('Node Type Tests', function() {
  beforeEach(function() {
    // Setup test environment
    helper.startServer(() => {
      // Test flow initialization
    });
  });

  afterEach(function() {
    helper.unload(); // Clean up
  });

  it('should perform specific test', function(done) {
    // Test implementation
  });
});
```

## Node Development

### Creating a New Node

#### 1. Runtime Implementation (`src/modbus-new-node.js`)

```javascript
module.exports = function (RED) {
  'use strict';
  const mbBasics = require('./modbus-basics');
  const mbCore = require('./core/modbus-core');
  
  function ModbusNewNode(config) {
    RED.nodes.createNode(this, config);
    
    // Node configuration
    this.name = config.name;
    this.showStatusActivities = config.showStatusActivities;
    
    const node = this;
    const modbusClient = RED.nodes.getNode(config.server);
    
    if (!modbusClient) {
      return;
    }
    
    // Event handlers
    node.onModbusInit = function(data) {
      mbBasics.setNodeStatusTo('init', node);
    };
    
    // Register with client
    mbBasics.registerNode(node, modbusClient);
    
    // Input handler
    node.on('input', function(msg) {
      if (mbBasics.invalidPayloadIn(msg)) {
        return;
      }
      
      // Process message
      const newMsg = node.buildMessage(msg);
      modbusClient.emit('readModbus', newMsg, node.onSuccess, node.onError);
    });
    
    // Cleanup
    node.on('close', function(done) {
      mbBasics.deregisterNode(node);
      modbusClient.deregisterForModbus(node.id, done);
    });
  }
  
  RED.nodes.registerType('modbus-new-node', ModbusNewNode);
};
```

#### 2. Editor UI (`src/modbus-new-node.html`)

```html
<script type="text/javascript">
  RED.nodes.registerType('modbus-new-node', {
    category: 'modbus',
    color: '#E9967A',
    defaults: {
      name: {value: ''},
      server: {type: 'modbus-client', required: true},
      // Additional configuration
    },
    inputs: 1,
    outputs: 1,
    icon: 'modbus.png',
    label: function() {
      return this.name || 'Modbus New Node';
    },
    oneditprepare: function() {
      // Editor initialization
    }
  });
</script>

<script type="text/x-red" data-template-name="modbus-new-node">
  <!-- Node configuration form -->
  <div class="form-row">
    <label for="node-input-name">Name</label>
    <input type="text" id="node-input-name" placeholder="Name">
  </div>
</script>

<script type="text/x-red" data-help-name="modbus-new-node">
  <!-- Help documentation -->
  <p>Description of the node functionality.</p>
</script>
```

#### 3. Localization (`src/locales/en-US/modbus-new-node.json`)

```json
{
  "modbus-new-node": {
    "label": {
      "name": "Name",
      "server": "Server"
    },
    "placeholder": {
      "name": "Node name"
    }
  }
}
```

### Node Development Best Practices

1. **Error Handling**
   ```javascript
   try {
     // Risky operation
     const result = processData(msg);
     node.send(result);
   } catch (err) {
     node.errorProtocolMsg(err, msg);
     mbBasics.sendEmptyMsgOnFail(node, err, msg);
   }
   ```

2. **Status Management**
   ```javascript
   // Always update status appropriately
   mbBasics.setNodeStatusTo('processing', node);
   
   // Reset on completion
   if (node.showStatusActivities) {
     mbBasics.setNodeStatusTo('active', node);
   }
   ```

3. **Memory Management**
   ```javascript
   node.on('close', function(done) {
     // Clean up resources
     node.bufferMessageList.clear();
     
     if (node.intervalId) {
       clearInterval(node.intervalId);
     }
     
     done();
   });
   ```

## Core Module Development

### Modbus Core Functions

#### Function Implementation Pattern

```javascript
/**
 * Function description
 * @param {type} param - Parameter description
 * @returns {type} Return value description
 */
de.biancoroyal.modbus.core.newFunction = function(param) {
  // Validation
  if (!param) {
    throw new Error('Parameter required');
  }
  
  // Implementation
  const result = processParam(param);
  
  // Return
  return result;
};
```

#### Buffer Handling (Node-RED 4.1.0+)

```javascript
// Always clone buffers to prevent corruption
de.biancoroyal.modbus.core.processBuffer = function(buffer) {
  const safeBuffer = this.cloneBuffer(buffer);
  
  // Process safely without affecting original
  return safeBuffer;
};
```

#### Message Correlation

```javascript
// Use ObjectIds for message tracking
de.biancoroyal.modbus.core.createMessage = function(payload) {
  return {
    messageId: this.getObjectId(),
    payload: payload,
    timestamp: Date.now()
  };
};
```

### State Machine Integration

```javascript
const { createMachine, interpret } = require('@xstate/fsm');

const modbusStateMachine = createMachine({
  id: 'modbus-client',
  initial: 'init',
  states: {
    init: {
      on: { CONNECT: 'connecting' }
    },
    connecting: {
      on: { 
        CONNECTED: 'connected',
        ERROR: 'error'
      }
    },
    connected: {
      on: { 
        ACTIVATE: 'active',
        DISCONNECT: 'disconnected'
      }
    },
    active: {
      on: {
        QUEUE: 'queueing',
        ERROR: 'error'
      }
    }
  }
});
```

## Testing Guidelines

### Test Structure

#### Unit Tests
```javascript
const helper = require('node-red-node-test-helper');
const clientNode = require('../src/modbus-client.js');

describe('Modbus Client Node', function() {
  beforeEach(function(done) {
    helper.startServer(done);
  });

  afterEach(function(done) {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', function(done) {
    const flow = [{
      id: 'n1',
      type: 'modbus-client',
      name: 'test-client'
    }];
    
    helper.load(clientNode, flow, function() {
      const n1 = helper.getNode('n1');
      expect(n1).to.have.property('name', 'test-client');
      done();
    });
  });
});
```

#### Integration Tests
```javascript
it('should read holding registers', function(done) {
  getPort().then((port) => {
    const flow = [
      {
        id: 'server',
        type: 'modbus-server',
        serverPort: port
      },
      {
        id: 'client',
        type: 'modbus-client',
        tcpHost: '127.0.0.1',
        tcpPort: port
      },
      {
        id: 'read',
        type: 'modbus-read',
        server: 'client',
        dataType: 'HoldingRegister',
        adr: 0,
        quantity: 5
      }
    ];
    
    helper.load([serverNode, clientNode, readNode], flow, function() {
      const readNode = helper.getNode('read');
      
      readNode.on('input', function(msg) {
        expect(msg.payload).to.be.an('array');
        expect(msg.payload).to.have.length(5);
        done();
      });
      
      // Trigger read
      readNode.receive({});
    });
  });
});
```

### Dynamic Port Allocation

**Always use dynamic ports to prevent conflicts:**

```javascript
const { getPort } = require('../helper/test-helper-extensions');

it('should connect to server', function(done) {
  getPort().then((port) => {
    // Use port in test configuration
    flow[0].serverPort = port;
    flow[1].tcpPort = port;
    
    helper.load(nodes, flow, function() {
      // Test implementation
    });
  });
});
```

### Test Coverage

Aim for comprehensive test coverage:
- **Unit Tests**: 90%+ line coverage
- **Integration Tests**: All major workflows
- **Error Cases**: Network failures, timeouts, invalid data
- **Edge Cases**: Boundary conditions, malformed inputs

## Contributing

### Development Workflow

1. **Fork Repository**
   ```bash
   git clone https://github.com/your-username/node-red-contrib-modbus.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-functionality
   ```

3. **Development Cycle**
   ```bash
   # Make changes
   npm run build      # Build and test
   npm test          # Run tests
   npm run lint      # Check code style
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add new functionality
   
   - Implement feature X
   - Add tests for edge cases
   - Update documentation"
   ```

5. **Submit Pull Request**
   - Target: `develop` branch
   - Include: Tests, documentation, examples
   - Follow: Existing code patterns

### Code Style

**StandardJS** is enforced:
```javascript
// Use semicolon-free style
const value = getValue()

// Use single quotes
const message = 'Hello world'

// 2-space indentation
if (condition) {
  doSomething()
}

// Object spacing
const config = { host: '127.0.0.1', port: 502 }
```

### Documentation Requirements

1. **JSDoc Comments** for all public functions
2. **README Updates** for new features
3. **Example Flows** for complex functionality
4. **Changelog Entries** following semantic versioning

## Release Process

### Versioning

**Semantic Versioning** (semver):
- **Major** (x.0.0): Breaking changes
- **Minor** (x.y.0): New features, backwards compatible
- **Patch** (x.y.z): Bug fixes, backwards compatible

### Release Commands

```bash
# Alpha release (testing)
npm run release:alpha

# Beta release (pre-release)
npm run release:beta

# Production release
npm run release

# Manual versioning
npm version patch  # or minor, major
```

### Release Checklist

1. **Code Quality**
   - [ ] All tests passing
   - [ ] Code coverage maintained
   - [ ] No linting errors
   - [ ] Documentation updated

2. **Compatibility**
   - [ ] Node-RED version compatibility verified
   - [ ] Node.js LTS compatibility tested
   - [ ] Dependencies updated (security patches)

3. **Documentation**
   - [ ] CHANGELOG.md updated
   - [ ] README.md reflects changes
   - [ ] API documentation generated
   - [ ] Examples updated

4. **Testing**
   - [ ] Manual testing on multiple platforms
   - [ ] Integration tests with real devices
   - [ ] Performance regression testing

5. **Release**
   - [ ] Git tags created
   - [ ] NPM package published
   - [ ] GitHub release notes
   - [ ] Community notification

### Branch Strategy

- **`master`**: Production releases
- **`develop`**: Integration branch
- **`feature/*`**: Feature development
- **`hotfix/*`**: Critical fixes
- **`release/*`**: Release preparation

### Security Considerations

1. **Dependency Scanning**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Code Security**
   - Input validation
   - Buffer overflow prevention
   - Network security
   - Error information disclosure

3. **Release Security**
   - Signed releases
   - Vulnerability disclosure process
   - Security update notifications