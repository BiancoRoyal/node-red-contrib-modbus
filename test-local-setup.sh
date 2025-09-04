#!/bin/bash

echo "🔧 Node-RED Modbus Local Testing Setup"
echo "======================================"
echo ""

# Check if Node-RED is installed
echo "✅ Checking Node-RED installation..."
if command -v node-red &> /dev/null; then
    NODE_RED_VERSION=$(node-red --version 2>&1 | head -1)
    echo "   Node-RED found: $NODE_RED_VERSION"
else
    echo "❌ Node-RED not found. Please install it first."
    exit 1
fi

# Check Node.js version
echo ""
echo "✅ Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "   Node.js version: $NODE_VERSION"

# Build the package
echo ""
echo "🔨 Building the package..."
npm run clean
npm run build

# Link the package
echo ""
echo "🔗 Linking package to Node-RED..."
npm link
cd ~/.node-red
npm link node-red-contrib-modbus
cd -

# Check if nodes are available
echo ""
echo "📦 Checking Modbus nodes..."
echo "   Standard nodes:"
ls modbus/*.js | grep -v test | wc -l | xargs echo "   - Found" "Modbus node files"
echo ""
echo "   New TLS nodes:"
ls modbus/*tls*.js 2>/dev/null && echo "   ✅ TLS nodes found" || echo "   ❌ TLS nodes missing"
echo ""
echo "   Demo server node:"
ls modbus/*demo*.js 2>/dev/null && echo "   ✅ Demo server found" || echo "   ❌ Demo server missing"

# Show how to access Node-RED
echo ""
echo "🚀 Ready to test!"
echo "=================="
echo ""
echo "To start testing:"
echo "1. Start Node-RED: node-red"
echo "2. Open browser: http://localhost:1880"
echo "3. Import examples from: examples/*.json"
echo ""
echo "Available example flows:"
echo "  - Modbus-TLS-Security.json (NEW)"
echo "  - Modbus-Demo-Server-Showcase.json (NEW)"
echo "  - Modbus-Advanced-Features.json (NEW)"
echo "  - Simple-Modbus-Demo.json"
echo "  - And more in the examples/ directory"
echo ""
echo "To import an example:"
echo "  1. Click menu (☰) → Import"
echo "  2. Select 'Clipboard' tab"
echo "  3. Copy content from examples/*.json file"
echo "  4. Paste and click Import"
echo ""
echo "Debugging tips:"
echo "  - Enable debug: DEBUG=contribModbus* node-red"
echo "  - Check browser console for errors"
echo "  - Look for nodes in palette (left sidebar)"
echo ""