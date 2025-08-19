# Comprehensive Testing Plan for node-red-contrib-modbus v5.45.0

## Test Environment Setup

### Required Node.js and Node-RED Versions
| Environment | Node.js | Node-RED | Purpose |
|------------|---------|----------|---------|
| Legacy | 18.x | 4.0.9 | Baseline compatibility |
| Breaking | 20.x | 4.1.0 | Issue #540 reproduction |
| Current | 22.x | 4.1.3 | Latest compatibility |

### Test Infrastructure
```bash
# Setup test environments
nvm install 18
nvm install 20
nvm install 22

# Install Node-RED versions
npm install -g node-red@4.0.9
npm install -g node-red@4.1.0
npm install -g node-red@4.1.3
```

## Test Categories

### 1. Unit Tests

#### Location: `test/units/`

##### TCP Error Handling Tests
```javascript
// test/units/modbus-client-tcp-error-test.js
describe('TCP Error Handling', function() {
  it('should handle ECONNRESET without crashing', function(done) {
    // Test ECONNRESET handling
  })
  
  it('should handle ETIMEDOUT gracefully', function(done) {
    // Test timeout handling
  })
  
  it('should reconnect after network error', function(done) {
    // Test reconnection logic
  })
})
```

##### Buffer Compatibility Tests
```javascript
// test/units/modbus-buffer-compatibility-test.js
describe('Node-RED 4.1+ Buffer Compatibility', function() {
  it('should correctly read FC3 registers', function(done) {
    // Test register reading returns correct values
  })
  
  it('should isolate buffer memory', function(done) {
    // Test buffer cloning prevents corruption
  })
})
```

### 2. Integration Tests

#### Location: `test/e2e/`

##### Node-RED Version Compatibility
```javascript
// test/e2e/node-red-compatibility-test.js
const testVersions = ['4.0.9', '4.1.0', '4.1.3']

testVersions.forEach(version => {
  describe(`Node-RED ${version} Compatibility`, function() {
    it('should read Modbus registers correctly', function(done) {
      // Full flow test with actual Node-RED runtime
    })
  })
})
```

##### Memory Leak Detection
```javascript
// test/e2e/memory-leak-test.js
describe('Memory Leak Prevention', function() {
  it('should not leak memory on Exception 11', function(done) {
    this.timeout(60000) // 1 minute test
    // Monitor memory usage during repeated exceptions
  })
})
```

### 3. Stress Tests

#### Location: `test/stress/`

##### Connection Stress Test
```javascript
// test/stress/connection-stress-test.js
describe('Connection Stress Test', function() {
  it('should handle 1000 connect/disconnect cycles', async function() {
    this.timeout(300000) // 5 minutes
    
    for (let i = 0; i < 1000; i++) {
      // Connect
      // Send request
      // Disconnect with RST
      // Verify no crash
    }
  })
})
```

##### Concurrent Operations Test
```javascript
// test/stress/concurrent-operations-test.js
describe('Concurrent Operations', function() {
  it('should handle 100 concurrent connections', function(done) {
    // Test multiple simultaneous Modbus operations
  })
})
```

### 4. Regression Tests

#### Location: `test/regression/`

##### GitHub Issues Tests
```javascript
// test/regression/github-issues-test.js
describe('GitHub Issue Regression Tests', function() {
  describe('Issue #540 - Node-RED 4.1.0 FC3 Reading', function() {
    // Specific test for issue #540
  })
  
  describe('Issue #532 - TCP RST Crash', function() {
    // Specific test for issue #532
  })
  
  describe('Issue #536 - Memory Leak', function() {
    // Specific test for issue #536
  })
  
  describe('Issue #537 - Server Write', function() {
    // Specific test for issue #537
  })
})
```

## Test Execution Plan

### Phase 1: Pre-Implementation Testing (Baseline)
**Purpose**: Document current failures

1. **Run on Node-RED 4.0.9**
   ```bash
   npm test
   ```
   Expected: All pass

2. **Run on Node-RED 4.1.0**
   ```bash
   npm test
   ```
   Expected: FC3 failures (Issue #540)

3. **TCP RST Test**
   ```bash
   npm run test:tcp-rst
   ```
   Expected: Crash (Issue #532)

### Phase 2: Post-Fix Unit Testing
**Purpose**: Verify individual fixes

1. **Test Buffer Cloning**
   ```bash
   npm run test:units -- test/units/modbus-buffer-compatibility-test.js
   ```

2. **Test TCP Error Handling**
   ```bash
   npm run test:units -- test/units/modbus-client-tcp-error-test.js
   ```

3. **Test Memory Leak Prevention**
   ```bash
   npm run test:units -- test/units/modbus-queue-cleanup-test.js
   ```

### Phase 3: Integration Testing
**Purpose**: Verify complete system

1. **Multi-Version Test**
   ```bash
   npm run test:compatibility
   ```

2. **Full E2E Suite**
   ```bash
   npm run test:e2e
   ```

### Phase 4: Stress Testing
**Purpose**: Verify stability

1. **Connection Stress**
   ```bash
   npm run test:stress:connections
   ```

2. **Memory Monitoring**
   ```bash
   npm run test:stress:memory
   ```

3. **Performance Benchmark**
   ```bash
   npm run test:performance
   ```

### Phase 5: Regression Testing
**Purpose**: Verify no new issues

1. **All GitHub Issues**
   ```bash
   npm run test:regression
   ```

2. **Backward Compatibility**
   ```bash
   npm run test:backward-compat
   ```

## Test Data and Fixtures

### Modbus Simulator Setup
```javascript
// test/fixtures/modbus-server-simulator.js
const ModbusRTU = require('modbus-serial')
const server = new ModbusRTU.ServerTCP(vectors, {
  host: '127.0.0.1',
  port: 8502,
  debug: true
})

// Simulate various responses
server.on('readHoldingRegisters', function(request) {
  // Return test data
})
```

### Test Flows
```json
// test/fixtures/flows/fc3-read-test-flow.json
{
  "id": "test-flow",
  "type": "tab",
  "nodes": [
    {
      "id": "modbus-read-1",
      "type": "modbus-read",
      "fc": 3,
      "unitid": 1,
      "address": 0,
      "quantity": 10
    }
  ]
}
```

## Performance Benchmarks

### Metrics to Track
1. **Response Time**
   - Target: <200ms average
   - Measure: Each Modbus operation

2. **Memory Usage**
   - Target: <100MB for 1000 msg/min
   - Measure: RSS, Heap Used, External

3. **CPU Usage**
   - Target: <5% idle, <30% active
   - Measure: Process CPU percentage

4. **Connection Stability**
   - Target: 0 crashes in 24h
   - Measure: Uptime, reconnection count

### Benchmark Implementation
```javascript
// test/performance/benchmark.js
const { performance } = require('perf_hooks')

function benchmarkModbusRead() {
  const start = performance.now()
  // Perform operation
  const end = performance.now()
  return end - start
}
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
        node-red-version: [4.0.9, 4.1.0, 4.1.3]
    
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v2
      - name: Install Node-RED ${{ matrix.node-red-version }}
        run: npm install -g node-red@${{ matrix.node-red-version }}
      - name: Run tests
        run: npm test
```

## Test Reporting

### Coverage Requirements
- **Overall**: >85%
- **Critical Paths**: 100%
- **New Code**: >90%

### Generate Reports
```bash
# Coverage report
npm run coverage

# Performance report
npm run benchmark

# Compatibility matrix
npm run test:matrix
```

## Manual Testing Checklist

### Installation Testing
- [ ] Fresh install with npm
- [ ] Upgrade from v5.44.0
- [ ] Node-RED palette install
- [ ] Docker container deployment

### Functional Testing
- [ ] FC1: Read Coils
- [ ] FC2: Read Discrete Inputs
- [ ] FC3: Read Holding Registers
- [ ] FC4: Read Input Registers
- [ ] FC5: Write Single Coil
- [ ] FC6: Write Single Register
- [ ] FC15: Write Multiple Coils
- [ ] FC16: Write Multiple Registers

### Error Scenarios
- [ ] Network disconnect during operation
- [ ] Modbus device timeout
- [ ] Invalid address/quantity
- [ ] Queue overflow
- [ ] Rapid reconnection

### UI Testing
- [ ] Node configuration in editor
- [ ] Status display updates
- [ ] Error messages clarity
- [ ] Help text accuracy

## Test Documentation

### Test Result Template
```markdown
## Test Run: [Date]
- **Version**: 5.45.0-beta.1
- **Environment**: Node.js 20.x, Node-RED 4.1.0
- **Platform**: macOS/Linux/Windows

### Results Summary
- Total Tests: X
- Passed: X
- Failed: X
- Skipped: X

### Failed Tests
1. Test Name
   - Error: Description
   - Expected: Value
   - Actual: Value

### Performance Metrics
- Avg Response Time: Xms
- Memory Usage: XMB
- CPU Usage: X%
```

## Rollback Testing

### Rollback Procedure Test
1. Install v5.45.0
2. Deploy test flows
3. Rollback to v5.44.0
4. Verify flows still work
5. Document any issues

## User Acceptance Testing (UAT)

### Beta Testing Group
1. Select 5-10 P4NR community members
2. Provide beta version
3. Collect feedback forms
4. Monitor for issues
5. Iterate based on feedback

### UAT Checklist
- [ ] Installation smooth
- [ ] Existing flows work
- [ ] Performance acceptable
- [ ] No new errors
- [ ] Documentation clear

## Test Maintenance

### Weekly Tasks
- Review test failures
- Update test fixtures
- Add tests for new issues

### Monthly Tasks
- Review coverage reports
- Update performance baselines
- Audit test effectiveness

### Release Tasks
- Full regression suite
- Performance benchmarks
- Compatibility matrix
- Update test documentation

---
Last Updated: 2025-08-19
Version: 1.0
Status: Ready for Implementation
Test Suite: Comprehensive