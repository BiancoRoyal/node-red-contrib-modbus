# Local Testing Guide for Node-RED Modbus

## 🎉 Your Setup is Ready!

Node-RED is now running with your local development version of node-red-contrib-modbus at:
**http://localhost:1880**

## ✅ Setup Complete
- ✓ Package built successfully
- ✓ Linked to Node-RED
- ✓ All 18 Modbus nodes available
- ✓ New TLS nodes loaded
- ✓ Demo server node ready
- ✓ Node-RED running on port 1880

## 🧪 Testing the New Features

### 1. Access Node-RED
Open your browser and navigate to: http://localhost:1880

### 2. Check Available Nodes
In the Node-RED editor, look at the left palette under "network" category. You should see:
- All standard Modbus nodes (client, server, read, write, etc.)
- **NEW: Modbus Client TLS** - Secure client with TLS support
- **NEW: Modbus Server TLS** - Secure server with TLS support  
- **NEW: Modbus Server Demo** - Interactive demo server

### 3. Import Example Flows

#### Method 1: Import from File
1. Click menu (☰) → Import → select file
2. Navigate to `examples/` directory
3. Choose one of these new examples:
   - `Modbus-TLS-Security.json` - TLS secure communication demo
   - `Modbus-Demo-Server-Showcase.json` - Interactive server simulation
   - `Modbus-Advanced-Features.json` - Connection pooling, circuit breaker, retry strategies

#### Method 2: Copy & Paste
1. Open the example file in a text editor
2. Copy all content
3. In Node-RED: menu (☰) → Import → Clipboard
4. Paste and click Import

### 4. Test the TLS Security Flow
1. Import `Modbus-TLS-Security.json`
2. The flow includes:
   - TLS server and client configuration
   - Certificate setup instructions
   - Secure read/write operations
   - Error handling for TLS issues
3. Note: You'll need to generate certificates (instructions in the comment nodes)

### 5. Test the Demo Server
1. Import `Modbus-Demo-Server-Showcase.json`
2. Deploy the flow
3. Features to test:
   - Real-time sensor simulation (auto-updates every second)
   - Click inject nodes to trigger motor controls
   - Watch the alarm system detect threshold violations
   - Monitor performance metrics in debug panel

### 6. Test Advanced Features
1. Import `Modbus-Advanced-Features.json`
2. Test features:
   - **Connection Pool**: Click "Test Pool" to see round-robin connection selection
   - **Circuit Breaker**: Click "Test Breaker" repeatedly to trigger circuit opening
   - **Retry Logic**: Click "Test Retry" to see exponential backoff in action
   - **Batch Optimizer**: Click multiple inject nodes quickly to see request batching

## 🔍 Verification Checklist

### Node Palette
- [ ] Can you see "Modbus Client TLS" in the palette?
- [ ] Can you see "Modbus Server TLS" in the palette?
- [ ] Can you see "Modbus Server Demo" in the palette?
- [ ] Are all standard Modbus nodes visible?

### Example Flows
- [ ] Can you import the TLS Security example?
- [ ] Can you import the Demo Server example?
- [ ] Can you import the Advanced Features example?
- [ ] Do the comment nodes appear with explanations?

### Functionality
- [ ] Can you deploy a flow without errors?
- [ ] Do inject nodes trigger actions?
- [ ] Do debug nodes show output?
- [ ] Does the demo server show simulated data?

## 🐛 Troubleshooting

### If nodes are missing:
```bash
# Rebuild and relink
npm run clean && npm run build
npm link
cd ~/.node-red && npm link node-red-contrib-modbus
# Restart Node-RED
```

### If you see "missing node type" errors:
1. Check the browser console for detailed errors
2. Verify the build completed without errors
3. Try clearing browser cache and refreshing

### For debugging:
```bash
# Run Node-RED with debug output
DEBUG=contribModbus* node-red
```

### To see all available nodes:
```bash
# List all built node files
ls -la modbus/*.js | grep -v test
```

## 📊 What's New in This Version

### New Nodes
1. **Modbus Client TLS** - Secure client connections with TLS/SSL
2. **Modbus Server TLS** - Secure server with certificate authentication
3. **Modbus Server Demo** - Interactive simulation server

### New Features
- TLS/SSL encryption support
- Certificate-based authentication
- Connection pooling
- Circuit breaker pattern
- Retry strategies with exponential backoff
- Batch request optimization
- Enhanced error handling

### New Examples
- Comprehensive TLS security setup
- Industrial automation simulation
- Advanced patterns and optimizations
- Detailed comment nodes explaining each feature

## 🎯 Quick Tests

### Test 1: Basic Connectivity
1. Import Simple-Modbus-Demo.json
2. Deploy
3. Check debug output

### Test 2: TLS Security
1. Import Modbus-TLS-Security.json
2. Read the certificate setup guide in comment nodes
3. Configure paths (or use demo mode)
4. Deploy and test secure connection

### Test 3: Demo Server
1. Import Modbus-Demo-Server-Showcase.json
2. Deploy
3. Watch automatic sensor updates
4. Trigger motor controls
5. Observe alarm management

### Test 4: Advanced Features
1. Import Modbus-Advanced-Features.json
2. Test each pattern:
   - Connection pooling
   - Circuit breaker
   - Retry logic
   - Batch optimization

## 📝 Notes

- The package is running from your local development directory
- Changes to source files require rebuilding: `npm run build`
- Node-RED must be restarted after rebuilding
- All example flows include detailed comment nodes explaining functionality

## 🚀 Next Steps

1. Test all new features thoroughly
2. Try combining different patterns
3. Create your own test flows
4. Report any issues found
5. Celebrate the successful implementation! 🎉

---

**Current Status**: Node-RED is running at http://localhost:1880
**Package Version**: 6.0.0-beta.1
**Node.js Version**: v22.17.1
**Node-RED Version**: v4.1.0-git