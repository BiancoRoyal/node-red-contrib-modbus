# Migration Plan: Modbus Server to Separate Package

## Overview
Extract all Modbus server functionality from `node-red-contrib-modbus` into a new package `node-red-contrib-modbus-server` to remove the `jsmodbus` dependency from the main package.

## Current Analysis

### Files Using jsmodbus (Server-Only)
- `src/modbus-server.js` - Main server node
- `src/modbus-server-tls.js` - TLS server node
- `src/modbus-server-demo.js` - Demo server node
- `src/core/modbus-server-core.js` - Server core logic

### Server Node Files to Move

#### JavaScript Files
```
src/
├── modbus-server.js
├── modbus-server.html
├── modbus-server-tls.js
├── modbus-server-tls.html
├── modbus-server-demo.js
├── modbus-server-demo.html
└── core/
    └── modbus-server-core.js
```

#### Built Files (Generated)
```
modbus/
├── modbus-server.js
├── modbus-server.html
├── modbus-server-tls.js
├── modbus-server-tls.html
├── modbus-server-demo.js
├── modbus-server-demo.html
└── core/
    └── modbus-server-core.js
```

#### Test Files
```
test/
├── units/
│   ├── modbus-server-test.js
│   └── flows/
│       └── modbus-server-flows.js
├── core/
│   └── modbus-server-core-test.js
└── e2e/
    └── [any server-related e2e tests]
```

#### Example Files
```
examples/
├── 6-server/
│   ├── Modbus-Buffer-Server.json
│   └── Modbus-Demo-Server-Showcase.json
└── [other examples using modbus-server nodes]
```

#### Localization Files
```
src/locales/
├── de/
│   ├── modbus-server.json
│   ├── modbus-server-tls.json
│   └── modbus-server-demo.json
├── en-US/
│   ├── modbus-server.json
│   ├── modbus-server-tls.json
│   └── modbus-server-demo.json
└── [other languages...]
```

## Dependencies Analysis

### Current Dependencies Used by Server
- **jsmodbus** (4.0.10) - Only used by server nodes
- **winston** - Shared logging (will need to be duplicated)
- **underscore** - Utility functions
- **@xstate/fsm** - State machine (used in server-core)

### Shared Code Dependencies
- `modbus-basics.js` - Shared utilities
- `modbus-logger.js` - Logging configuration

## Migration Steps

### Phase 1: Preparation
1. **Create new repository** `node-red-contrib-modbus-server`
2. **Setup package structure**:
   ```json
   {
     "name": "@plus4nodered/node-red-contrib-modbus-server",
     "version": "1.0.0",
     "description": "Modbus Server nodes for Node-RED",
     "dependencies": {
       "jsmodbus": "^4.0.10",
       "winston": "^3.17.0",
       "underscore": "^1.13.6",
       "@xstate/fsm": "^2.0.0"
     },
     "node-red": {
       "nodes": {
         "Modbus-Server": "modbus/modbus-server.js",
         "Modbus-Server-TLS": "modbus/modbus-server-tls.js",
         "Modbus-Server-Demo": "modbus/modbus-server-demo.js"
       }
     }
   }
   ```

### Phase 2: Code Extraction
1. **Copy server files** to new repository
2. **Extract shared utilities** needed:
   - Copy relevant functions from `modbus-basics.js`
   - Copy `modbus-logger.js` configuration
3. **Update imports** in server files:
   ```javascript
   // Old: const mbBasics = require('./modbus-basics')
   // New: const mbBasics = require('./modbus-server-basics')
   ```

### Phase 3: Main Package Cleanup
1. **Remove from package.json**:
   - Remove `jsmodbus` dependency
   - Remove server nodes from `node-red.nodes`
2. **Delete server files** from src/
3. **Update build process** to exclude server files
4. **Remove server tests**

### Phase 4: Testing
1. **Test new server package** independently
2. **Test main package** without server functionality
3. **Create integration examples** showing both packages working together

### Phase 5: Documentation
1. **Update README.md** in main package:
   ```markdown
   ## Modbus Server Support
   Server functionality has been moved to a separate package:
   ```bash
   npm install @plus4nodered/node-red-contrib-modbus-server
   ```
   ```
2. **Create README.md** for server package
3. **Update migration guide** for existing users

## Impact Analysis

### Breaking Changes
- Users with server nodes will need to install additional package
- Import paths in custom code may break

### Benefits
1. **Security**: Remove jsmodbus dependency from main package
2. **Size**: Smaller main package (~30% reduction)
3. **Maintenance**: Separate release cycles
4. **Focus**: Client-only vs Server-only installations

### User Migration Path
```bash
# Before: Single package
npm install node-red-contrib-modbus

# After: Choose what you need
npm install node-red-contrib-modbus              # Client only
npm install node-red-contrib-modbus-server       # Server only
npm install node-red-contrib-modbus node-red-contrib-modbus-server  # Both
```

## Implementation Timeline

1. **Week 1**: Setup new repository and package structure
2. **Week 2**: Extract and adapt code
3. **Week 3**: Testing and bug fixes
4. **Week 4**: Documentation and release

## Rollback Plan

If issues arise:
1. Keep jsmodbus in main package temporarily
2. Mark server nodes as deprecated
3. Give users 6-month migration period
4. Remove in next major version (7.0.0)

## Alternative Approaches

### Option A: Lazy Loading (Not Recommended)
- Keep server files but lazy-load jsmodbus
- Problem: Still listed as dependency

### Option B: Optional Dependencies
- Mark jsmodbus as optionalDependency
- Problem: Still downloaded unless --no-optional

### Option C: Complete Removal (Recommended)
- Separate package for clean separation
- Best for security and maintenance

## Checklist

- [ ] Create new repository
- [ ] Extract server code
- [ ] Setup build process
- [ ] Write tests
- [ ] Update documentation
- [ ] Create migration examples
- [ ] Test with Node-RED
- [ ] Publish to npm
- [ ] Update main package
- [ ] Announce to users
- [ ] Monitor issues

## Notes

- Server functionality represents ~20% of codebase
- jsmodbus is 68 files, ~300KB
- Removing it improves security posture significantly
- Most users only use client functionality