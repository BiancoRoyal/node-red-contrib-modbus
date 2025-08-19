# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node-RED contribution package (`node-red-contrib-modbus`) that provides comprehensive Modbus TCP and Serial communication nodes for Node-RED. The package runs within the Node-RED environment and cannot be executed standalone.

## Architecture

### Core Structure
- **Source Code**: All Node-RED nodes are in `src/` directory
  - Node definitions: `modbus-*.js` files (runtime logic)
  - HTML templates: `modbus-*.html` files (Node-RED editor UI)
  - Core logic: `src/core/` contains shared business logic
  - Localization: `src/locales/` for multi-language support

- **Build Process**: Source files are transpiled from ES2019 to ES2015 using Babel/Gulp
  - Source: `src/` → Built: `modbus/` (via `npm run build`)
  - The `modbus/` directory is the deployed code used by Node-RED

### Node Types
- **Client Nodes**: `modbus-client` (connection management)
- **Read Nodes**: `modbus-read`, `modbus-getter`, `modbus-flex-getter`
- **Write Nodes**: `modbus-write`, `modbus-flex-write`
- **Server Node**: `modbus-server`
- **Utility Nodes**: `modbus-queue-info`, `modbus-response`, `modbus-response-filter`
- **Flex Nodes**: `modbus-flex-connector`, `modbus-flex-sequencer`, `modbus-flex-fc`
- **Config Node**: `modbus-io-config`

### State Management
The package uses XState FSM (`@xstate/fsm`) for connection state management in the client and server nodes.

## Development Commands

```bash
# Build the package (transpile src/ to modbus/)
npm run build

# Clean build artifacts
npm run clean

# Run tests
npm test                    # Run all tests in parallel
npm run test:slow          # Run tests with extended timeout
npm run test:units         # Run unit tests only
npm run test:core          # Run core module tests
npm run test:e2e           # Run end-to-end tests
npm run test:jest          # Run Jest tests

# Run specific test file
npm run mocha:base -- test/units/modbus-client-test.js

# Code quality
npm run lint               # Run StandardJS linting (auto-fix)
npm run coverage          # Generate coverage report

# Development workflow
npm run dev:link          # Link package locally for Node-RED development
npm run dev:unlink        # Unlink the package

# Release management
npm run release           # Create a new release
npm run release:beta      # Create a beta release
npm run release:alpha     # Create an alpha release
```

## Testing

### Test Structure
- **Unit Tests**: `test/units/` - Test individual node functionality
- **Core Tests**: `test/core/` - Test core modules
- **E2E Tests**: `test/e2e/` - Test complete flows
- **Jest Tests**: `__tests__/` - New test suite using Jest
- **Test Flows**: `test/*/flows/` - Node-RED flow definitions for testing
- **Test Helper**: `test/helper/` - Shared test utilities

### Running Tests
Tests use Mocha (primary) and Jest (being introduced). The Node-RED test helper is used to simulate the Node-RED runtime environment.

## Debugging

Enable debug output with:
```bash
DEBUG=contribModbus* node-red -v
# Or specific components:
DEBUG=contribModbus:config:client node-red -v
```

## Important Considerations

1. **Node-RED Environment**: This package only works within Node-RED. Do not attempt to run nodes directly with Node.js.

2. **Build Before Test**: Always run `npm run build` after modifying source files in `src/` before testing.

3. **Dependencies**: 
   - Core dependency: `@openp4nr/modbus-serial` (custom Cloudsmith package)
   - Server functionality: `jsmodbus`
   - Optional: `serialport` for listing serial ports

4. **Parallel Testing**: Tests run in parallel by default. Use `--recursive` without `--parallel` for sequential execution if debugging test interactions.

5. **Port Management**: Tests use dynamic port allocation via `test/helper/test-helper-extensions.js` to avoid conflicts.

6. **State Machine**: Client and server nodes use FSM for connection management. States include: `init`, `connected`, `activated`, `queueing`, `sending`, `closed`, etc.

## Code Style

The project uses StandardJS for code formatting. Configuration is in `package.json` under the `standard` key. Key rules:
- No semicolons
- 2 space indentation
- Single quotes for strings
- Space after keywords

## Node-RED Integration

Nodes are registered in `package.json` under `node-red.nodes`. Each node consists of:
- JavaScript file: Runtime logic
- HTML file: Editor UI definition and help text
- Localization files: Multi-language support in `src/locales/`