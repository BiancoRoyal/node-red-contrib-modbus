#!/bin/bash

# Setup script for Node-RED test environment
# This script initializes a local Node-RED instance with the modbus nodes

set -e

echo "🚀 Setting up Node-RED test environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_DIR="$PROJECT_ROOT/.node-red-test"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Test directory: $TEST_DIR"

# Build the modbus package first
echo -e "\n${YELLOW}Building modbus package...${NC}"
cd "$PROJECT_ROOT"
npm run build

# Create test directory
echo -e "\n${YELLOW}Creating test directory...${NC}"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Initialize package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo -e "\n${YELLOW}Initializing package.json...${NC}"
    npm init -y
fi

# Install Node-RED locally in test directory
echo -e "\n${YELLOW}Installing Node-RED...${NC}"
npm install --save node-red

# Link the local modbus package
echo -e "\n${YELLOW}Installing local modbus package...${NC}"
npm install --save "file:$PROJECT_ROOT"

# Copy settings file if it doesn't exist
if [ ! -f "settings.js" ]; then
    echo -e "\n${YELLOW}Copying settings.js...${NC}"
    cp "$PROJECT_ROOT/.node-red-test/settings.js" . 2>/dev/null || echo "Settings file will be created on first run"
fi

# Copy test flow if it doesn't exist
if [ ! -f "flows.json" ] && [ -f "$PROJECT_ROOT/.node-red-test/test-flow.json" ]; then
    echo -e "\n${YELLOW}Copying test flow...${NC}"
    cp "$PROJECT_ROOT/.node-red-test/test-flow.json" flows.json
fi

# Create a start script
echo -e "\n${YELLOW}Creating start script...${NC}"
cat > start.sh << 'EOF'
#!/bin/bash
echo "Starting Node-RED with modbus nodes..."
npx node-red -u . -s settings.js
EOF
chmod +x start.sh

# Success message
echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\nTo start Node-RED, run one of:"
echo -e "  ${GREEN}cd $TEST_DIR && ./start.sh${NC}"
echo -e "  ${GREEN}npm run node-red${NC}"
echo -e "\nNode-RED will be available at: ${GREEN}http://localhost:1880${NC}"
echo -e "\nThe modbus nodes should now be available in the palette!"