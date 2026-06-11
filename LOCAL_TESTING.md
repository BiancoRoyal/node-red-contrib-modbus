# Local Node-RED Testing Guide

This guide explains how to test @plus4nodered/node-red-contrib-modbus with a local Node-RED instance during development.

## 🚀 Quick Start

### First Time Setup
```bash
# Initialize the test environment (only needed once)
npm run node-red:init

# This will:
# 1. Build the modbus package
# 2. Create .node-red-test directory
# 3. Install Node-RED locally
# 4. Install the modbus nodes from your local development
# 5. Copy test flows and settings
```

### Start Node-RED
```bash
# Start Node-RED with modbus nodes
npm run node-red

# Or for first time setup + start
npm run node-red:start
```

Open http://localhost:1880 - the modbus nodes will be in the palette!

### After Making Changes
```bash
# Rebuild and update the nodes
npm run build
npm run node-red:update
npm run node-red
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run node-red` | Start Node-RED with modbus nodes |
| `npm run node-red:debug` | Start with debug output enabled |
| `npm run node-red:init` | Initialize test environment with modbus nodes |
| `npm run node-red:update` | Update modbus nodes after changes |
| `npm run node-red:clean` | Remove test directory completely |
| `npm run node-red:start` | Full setup (init + run) |
| `npm run node-red:watch` | Auto-rebuild on source changes |

## 🛠️ Development Workflow

### Basic Development
```bash
# 1. Make changes to source files in src/

# 2. Build and test
npm run node-red

# 3. Open browser to http://localhost:1880
```

### Watch Mode (Auto-rebuild)
```bash
# Install nodemon if not already installed
npm install -g nodemon

# Start watch mode
npm run node-red:watch

# Now changes in src/ will automatically rebuild and restart Node-RED
```

### Debug Mode
```bash
# Run with debug output
npm run node-red:debug

# This enables: DEBUG=contribModbus*
```

## 📁 Test Directory Structure

```
.node-red-test/
├── settings.js          # Node-RED configuration
├── test-flow.json       # Pre-configured test flow
├── flows.json          # Your active flows
├── package.json        # Local package.json
└── node_modules/       # Local dependencies
```

## 🧪 Test Flow

A pre-configured test flow is included with:
- Modbus TCP Server (port 10502)
- Modbus TCP Client
- Read/Write operations
- Flex node examples
- Debug outputs

To use:
1. Start Node-RED: `npm run node-red`
2. Open http://localhost:1880
3. Import `test-flow.json` or it may auto-load
4. Deploy and test

## 🔧 Configuration

### Custom Settings
Edit `.node-red-test/settings.js` to:
- Change port (default: 1880)
- Modify logging levels
- Add global context variables
- Configure authentication

### Test Different Scenarios

#### Test TLS
```bash
# Generate certificates
cd examples/4-security/tls-secure-modbus/certs
./generate-certificates.sh

# Start Node-RED and import TLS examples
npm run node-red
```

#### Test Serial
Configure serial port in test flow:
- Linux: `/dev/ttyUSB0`
- macOS: `/dev/tty.usbserial-*`
- Windows: `COM3`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in settings.js or use environment variable
PORT=1881 npm run node-red
```

### Module Not Found
```bash
# Rebuild and reinstall
npm run build
npm run node-red:install
npm run node-red
```

### Clean Start
```bash
# Remove everything and start fresh
npm run node-red:clean
npm run node-red:start
```

### View Logs
```bash
# Enable debug output
npm run node-red:debug

# Check Node-RED logs
tail -f .node-red-test/.npm/_logs/*.log
```

## 🔄 Updating Dependencies

After changing dependencies:
```bash
# Reinstall in test directory
cd .node-red-test
npm install
cd ..
npm run node-red
```

## 🎯 Testing Checklist

- [ ] Server nodes deploy without errors
- [ ] Client nodes connect successfully
- [ ] Read operations return data
- [ ] Write operations complete
- [ ] Flex nodes handle dynamic configs
- [ ] TLS nodes work with certificates
- [ ] Error handling works correctly
- [ ] Reconnection logic functions

## 💡 Tips

1. **Use Debug Nodes**: Add debug nodes to monitor data flow
2. **Check Status**: Node status indicators show connection state
3. **Monitor Console**: Watch terminal for debug output
4. **Test Incrementally**: Test one feature at a time
5. **Use Inject Nodes**: Trigger operations manually

## 🔗 Integration with VSCode

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Node-RED Test",
  "program": "${workspaceFolder}/node_modules/.bin/node-red",
  "args": ["-u", ".node-red-test"],
  "env": {
    "DEBUG": "contribModbus*"
  }
}
```

## 📊 Performance Testing

Monitor performance:
```bash
# Run with performance metrics
npm run node-red

# In another terminal, monitor
npm run test:units
```

## 🚢 Before Committing

Always run before committing:
```bash
# Full test suite
npm test

# Lint check
npm run lint

# Clean build
npm run clean && npm run build
```

---

**Note**: The `.node-red-test` directory is git-ignored except for `settings.js` and `test-flow.json`.