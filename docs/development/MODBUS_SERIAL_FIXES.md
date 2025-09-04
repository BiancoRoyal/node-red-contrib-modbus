# modbus-serial Package Fixes

## Package Information
- **Package**: @openp4nr/modbus-serial
- **Current Version**: 8.2.0
- **Target Version**: 8.2.1
- **Location**: `/Users/biancode/Development/P4NR/modbus/node-modbus-serial`
- **Original Repository**: https://github.com/yaacov/node-modbus-serial
- **P4NR Repository**: https://scm.plus4nodered.com/P4NR/node-modbus-serial

## MERGE PROBLEMS on Git Repositories need to be resolved

The **Original Repository**: https://github.com/yaacov/node-modbus-serial
and the in some points improved **P4NR Repository**: https://scm.plus4nodered.com/P4NR/node-modbus-serial
need to be merged together in **P4NR Repository**: https://scm.plus4nodered.com/P4NR/node-modbus-serial
so that the changes can be applied to the **P4NR Repository**: https://scm.plus4nodered.com/P4NR/node-modbus-serial
and the **P4NR Repository**: https://scm.plus4nodered.com/P4NR/node-modbus-serial
can be used as a single source of truth or a new PR can be created to the **Original Repository**: https://github.com/yaacov/node-modbus-serial.

Do not forget to use the node-modbus-serial local changes to link them for testings with the package node-red-contrib-modbus locally as long as I did the next best release later.

## Critical Issue: TCP RST Crash (Related to node-red-contrib-modbus #532)

### Problem Description
When a TCP connection is closed with an RST flag (instead of FIN), the package doesn't properly handle the ECONNRESET error, causing an uncaught exception that crashes Node-RED.

### Root Cause Analysis
The current error handling in `ports/tcpport.js` (lines 118-122) only logs errors and calls callbacks but doesn't prevent uncaught exceptions from bubbling up to the Node.js process level.

### Files Requiring Changes

#### 1. ports/tcpport.js

**Current Code (lines 118-122):**
```javascript
this._client.on("error", function(had_error) {
    modbus.openFlag = false;
    modbusSerialDebug("TCP port: signal error: " + had_error);
    handleCallback(had_error);
});
```

**Fixed Code:**
```javascript
// Enhanced error handling constructor additions
constructor(ip, options) {
    // ... existing code ...
    
    // Add early error handler to prevent uncaught exceptions
    this._client.on('error', (err) => {
        if (err.code === 'ECONNRESET' || err.code === 'EPIPE') {
            modbusSerialDebug(`TCP port: Connection error ${err.code} - handling gracefully`);
            this.openFlag = false;
            
            // Mark as handled to prevent uncaught exception
            if (!err.handled) {
                err.handled = true;
                this.emit('error', err);
            }
            
            // Ensure clean disconnection
            if (!this._client.destroyed) {
                this._client.destroy();
            }
        }
    });
    
    // Add socket-level error handling for additional safety
    this._client.on('socket', (socket) => {
        socket.on('error', (err) => {
            const networkErrors = ['ECONNRESET', 'EPIPE', 'ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH'];
            if (networkErrors.includes(err.code)) {
                modbusSerialDebug(`TCP socket error: ${err.code} - preventing crash`);
                // Prevent error from bubbling up
                err.handled = true;
                
                // Trigger graceful cleanup
                if (!this._client.destroyed) {
                    this._client.destroy();
                }
            }
        });
        
        // Handle abrupt disconnections
        socket.on('close', (hadError) => {
            if (hadError) {
                modbusSerialDebug('TCP socket closed with error - cleaning up');
                this.openFlag = false;
            }
        });
    });
}

// Update the existing error handler to be more robust
this._client.on("error", function(err) {
    modbus.openFlag = false;
    modbusSerialDebug("TCP port: signal error: " + err);
    
    // Only call callback if not already handled
    if (!err.handled) {
        handleCallback(err);
    }
});
```

#### 2. ports/tcprtubufferedport.js

**Apply Similar Changes:**
```javascript
// Add to constructor after line 50
this._client.on('error', (err) => {
    const networkErrors = ['ECONNRESET', 'EPIPE', 'ECONNREFUSED', 'ETIMEDOUT'];
    if (networkErrors.includes(err.code)) {
        modbusSerialDebug(`TCP RTU Buffered port: ${err.code} - handling gracefully`);
        this.openFlag = false;
        err.handled = true;
        this.emit('error', err);
        
        if (!this._client.destroyed) {
            this._client.destroy();
        }
    }
});

// Add socket-level handling
this._client.on('socket', (socket) => {
    socket.on('error', (err) => {
        if (err.code === 'ECONNRESET') {
            err.handled = true;
            modbusSerialDebug('TCP RTU socket reset - preventing crash');
        }
    });
});
```

#### 3. ports/telnetport.js

**Similar Pattern for Telnet:**
```javascript
// Add ECONNRESET handling to telnet port
this._client.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
        modbusSerialDebug('Telnet port: Connection reset - handling gracefully');
        this.openFlag = false;
        err.handled = true;
        this.emit('error', err);
        
        if (!this._client.destroyed) {
            this._client.destroy();
        }
    }
});
```

## Additional Improvements

### 1. Connection Cleanup Enhancement

**File**: All TCP-based ports
**Purpose**: Ensure proper cleanup on all disconnection scenarios

```javascript
// Add cleanup method to all TCP ports
cleanup() {
    if (this._client) {
        this._client.removeAllListeners();
        if (!this._client.destroyed) {
            this._client.destroy();
        }
        this._client = null;
    }
    this.openFlag = false;
}
```

### 2. Reconnection Logic Improvement

**File**: ports/tcpport.js
**Purpose**: Better reconnection handling after errors

```javascript
// Add reconnection capability
reconnect(callback) {
    this.cleanup();
    setTimeout(() => {
        this.open(callback);
    }, this._reconnectDelay || 1000);
}
```

### 3. Error Classification

**File**: New file utils/errors.js
**Purpose**: Centralized error handling

```javascript
// utils/errors.js
const networkErrors = [
    'ESOCKETTIMEDOUT', 
    'ETIMEDOUT', 
    'ECONNRESET', 
    'ECONNREFUSED', 
    'EHOSTUNREACH',
    'ENETUNREACH',
    'ENOTCONN',
    'EPIPE'
];

const isNetworkError = (err) => {
    return err && networkErrors.includes(err.code);
};

const isRecoverableError = (err) => {
    return isNetworkError(err) && err.code !== 'ECONNREFUSED';
};

module.exports = {
    networkErrors,
    isNetworkError,
    isRecoverableError
};
```

## Testing Requirements

### 1. TCP RST Test
```javascript
// test/ports/tcpport-rst.test.js
describe('TCP Port RST Handling', () => {
    it('should not crash on ECONNRESET', (done) => {
        const port = new TcpPort('127.0.0.1', { port: 502 });
        
        port.on('error', (err) => {
            assert.equal(err.code, 'ECONNRESET');
            assert.equal(err.handled, true);
            done();
        });
        
        // Simulate RST
        port._client.emit('error', { code: 'ECONNRESET' });
    });
});
```

### 2. Stress Test
```javascript
// test/reliability/connection-stress.test.js
describe('Connection Stress Test', () => {
    it('should handle rapid connect/disconnect cycles', async () => {
        for (let i = 0; i < 100; i++) {
            const port = new TcpPort('127.0.0.1', { port: 502 });
            await port.open();
            // Simulate abrupt disconnect
            port._client.destroy();
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    });
});
```

## Implementation Checklist

- [ ] Update ports/tcpport.js with enhanced error handling
- [ ] Update ports/tcprtubufferedport.js similarly
- [ ] Update ports/telnetport.js for consistency
- [ ] Add utils/errors.js for centralized error handling
- [ ] Add cleanup methods to all TCP-based ports
- [ ] Create comprehensive tests for RST handling
- [ ] Test with node-red-contrib-modbus
- [ ] Update package version to 8.2.1
- [ ] Create PR to yaacov/node-modbus-serial
- [ ] Publish to P4NR Cloudsmith registry

## Upstream Contribution

### PR to yaacov/node-modbus-serial
1. Fork and create feature branch
2. Implement fixes
3. Add tests
4. Create PR with description:
   ```
   Fix: Prevent crashes on TCP RST (ECONNRESET)
   
   This PR adds proper handling for TCP connection resets that use
   the RST flag instead of FIN. Previously, these would cause
   uncaught exceptions that could crash the Node.js process.
   
   Changes:
   - Added socket-level error handlers
   - Implemented graceful cleanup on ECONNRESET
   - Added error.handled flag to prevent bubbling
   - Enhanced all TCP-based ports consistency
   
   Fixes issues reported in dependent packages where abrupt
   client disconnections would crash the application.
   ```

## Version Release Plan

### Version 8.2.1 Changes
```json
{
  "version": "8.2.1",
  "description": "Fix TCP RST crash and improve error handling",
  "changes": [
    "Fixed: ECONNRESET errors no longer cause uncaught exceptions",
    "Added: Socket-level error handling for all TCP ports",
    "Added: Graceful cleanup on connection errors",
    "Improved: Error classification and handling"
  ]
}
```

## Validation Steps

1. **Unit Tests Pass**: All existing tests still pass
2. **RST Test Pass**: New RST handling tests pass
3. **Integration Test**: Works with node-red-contrib-modbus
4. **Stress Test**: No crashes under rapid disconnect scenarios
5. **Memory Test**: No memory leaks after 1000 connect/disconnect cycles

## Notes

- The fix must be backward compatible
- No API changes allowed
- Performance impact should be minimal
- Error messages should be descriptive but not expose internal details

---
Last Updated: 2025-08-19
Version: 1.0
Status: Ready for Implementation