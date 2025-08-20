# Node-RED Contrib Modbus API Documentation

## Overview

This document provides comprehensive API documentation for the `node-red-contrib-modbus` package, covering core functions, interfaces, and usage patterns for developers working with Modbus TCP and Serial communications in Node-RED.

## Table of Contents

1. [Core API](#core-api)
2. [Node Types](#node-types)
3. [Configuration](#configuration)
4. [Error Handling](#error-handling)
5. [State Management](#state-management)
6. [Message Patterns](#message-patterns)
7. [Utilities](#utilities)

## Core API

### Modbus Core Functions

The core Modbus functionality is exposed through the `modbus-core` module:

#### Function Code Mapping

```javascript
// Get function code for read operations
functionCodeModbusRead(dataType)
```

**Parameters:**
- `dataType` (string): Type of data to read
  - `'Coil'` → Function Code 1 (Read Coils)
  - `'Input'` → Function Code 2 (Read Discrete Inputs)
  - `'HoldingRegister'` → Function Code 3 (Read Holding Registers)
  - `'InputRegister'` → Function Code 4 (Read Input Registers)

**Returns:** (number) Function code or -1 if invalid

```javascript
// Get function code for write operations
functionCodeModbusWrite(dataType)
```

**Parameters:**
- `dataType` (string): Type of data to write
  - `'Coil'` → Function Code 5 (Write Single Coil)
  - `'HoldingRegister'` → Function Code 6 (Write Single Register)
  - `'MCoils'` → Function Code 15 (Write Multiple Coils)
  - `'MHoldingRegisters'` → Function Code 16 (Write Multiple Registers)

**Returns:** (number) Function code or -1 if invalid

#### Message Handling

```javascript
// Build response message structure
buildMessage(messageList, values, response, msg)
```

**Parameters:**
- `messageList` (Map): Message tracking map
- `values` (any): Processed values from Modbus response
- `response` (Buffer): Raw Modbus response buffer
- `msg` (Object): Original Node-RED message

**Returns:** Array containing `[processedMessage, rawMessage]`

```javascript
// Retrieve original message from tracking list
getOriginalMessage(messageList, msg)
```

**Parameters:**
- `messageList` (Map): Message tracking map
- `msg` (Object): Current message with messageId

**Returns:** (Object) Original message or current message if not found

#### Buffer Management

```javascript
// Clone buffer for Node-RED 4.1.0+ compatibility
cloneBuffer(buffer)
```

**Parameters:**
- `buffer` (Buffer): Buffer to clone

**Returns:** (Buffer) Deep cloned buffer to prevent corruption

#### Object ID Generation

```javascript
// Generate unique object identifier
getObjectId()
```

**Returns:** (ObjectId) BSON ObjectId for message tracking

### Modbus Basics API

The basics module provides utility functions and status management:

#### Status Management

```javascript
// Set node status with visual indicators
setNodeStatusTo(statusValue, node)
```

**Parameters:**
- `statusValue` (string): Status text
- `node` (Object): Node-RED node instance

**Status Values:**
- `'waiting'` → Blue ring, "waiting ..."
- `'connected'` → Green ring
- `'active'` → Green dot
- `'error'` → Red ring
- `'timeout'` → Red ring
- `'reconnecting'` → Yellow ring

```javascript
// Set node status properties
setNodeStatusProperties(statusValue, showActivities)
```

**Parameters:**
- `statusValue` (string): Status text
- `showActivities` (boolean): Whether to show detailed activities

**Returns:** (Object) `{ fill, shape, status }` for Node-RED status

#### Error Handling

```javascript
// Handle Modbus-specific errors
setModbusError(node, modbusClient, err, msg)
```

**Parameters:**
- `node` (Object): Node-RED node instance
- `modbusClient` (Object): Modbus client instance
- `err` (Error): Error object
- `msg` (Object): Current message

**Error Types:**
- `'Timed out'` → Sets timeout status
- `'FSM Not Ready To Reconnect'` → Sets not ready status
- `'Port Not Open'` → Triggers reconnect

#### Validation

```javascript
// Validate message payload
invalidPayloadIn(msg)
```

**Parameters:**
- `msg` (Object): Node-RED message

**Returns:** (boolean) True if invalid payload

```javascript
// Send empty message on failure
sendEmptyMsgOnFail(node, err, msg)
```

**Parameters:**
- `node` (Object): Node-RED node instance
- `err` (Error): Error object
- `msg` (Object): Original message

**Behavior:** Sends empty payload with error information if `node.emptyMsgOnFail` is true

#### Utility Functions

```javascript
// Check for null or undefined values
isNullOrUndefined(value)
```

**Parameters:**
- `value` (any): Value to check

**Returns:** (boolean) True if value is null or undefined

```javascript
// Calculate rate based on time unit
calc_rateByUnit(rate, rateUnit)
```

**Parameters:**
- `rate` (number): Base rate value
- `rateUnit` (string): Time unit ('ms', 's', 'm', 'h')

**Returns:** (number) Rate in milliseconds

## Node Types

### Client Configuration Node (`modbus-client`)

Manages connections to Modbus devices.

**Configuration Properties:**
```javascript
{
  clienttype: 'tcp' | 'serial' | 'simpleser',
  tcpHost: string,        // TCP host address
  tcpPort: number,        // TCP port (default: 502)
  tcpType: string,        // TCP connection type
  serialPort: string,     // Serial port path
  serialBaudrate: number, // Baud rate
  unit_id: number,        // Default unit ID
  clientTimeout: number,  // Connection timeout (ms)
  reconnectTimeout: number // Reconnect delay (ms)
}
```

**Events:**
- `'mbinit'` - Client initialized
- `'mbconnected'` - Connected to device
- `'mbactive'` - Client active and ready
- `'mberror'` - Error occurred
- `'mbclosed'` - Connection closed

### Read Nodes

#### `modbus-read`
Continuous reading from Modbus device.

**Input Message:** Not required (polls automatically)
**Output Messages:** 
1. `{ payload: values, responseBuffer: Buffer, ... }`
2. `{ payload: Buffer, values: values, ... }`

#### `modbus-getter` / `modbus-flex-getter`
On-demand reading triggered by input messages.

**Input Message:**
```javascript
{
  payload: any,           // Triggers read operation
  topic: string          // Optional topic
}
```

**Output Messages:** Same as modbus-read

### Write Nodes

#### `modbus-write`
Write data to Modbus device.

**Input Message:**
```javascript
{
  payload: {
    value: any,           // Value(s) to write
    unitid?: number,      // Override unit ID
    fc?: number,          // Override function code
    address?: number,     // Override address
    quantity?: number     // Override quantity
  }
}
```

**Function Code Behavior:**
- **FC 5/6**: `payload.value` = single value
- **FC 15/16**: `payload.value` = array of values

#### `modbus-flex-write`
Flexible write with dynamic parameters.

**Input Message:**
```javascript
{
  payload: {
    value: any,
    unitid: number,
    fc: number,
    address: number,
    quantity: number
  }
}
```

### Server Node (`modbus-server`)

Creates a Modbus server for testing and simulation.

**Configuration:**
```javascript
{
  serverPort: number,     // Server port
  unitId: number,         // Unit ID
  coils: number,          // Number of coils
  holdingRegisters: number // Number of holding registers
}
```

### Utility Nodes

#### `modbus-queue-info`
Provides queue status information.

**Output Message:**
```javascript
{
  payload: {
    unitId: number,
    queueLength: number,
    state: string
  }
}
```

#### `modbus-response`
Processes raw Modbus responses.

**Input:** Raw Modbus response
**Output:** Structured data

#### `modbus-response-filter`
Filters responses based on criteria.

**Configuration:**
```javascript
{
  filter: string,         // Filter expression
  filterType: string      // Filter type
}
```

## Configuration

### Connection Types

#### TCP Configuration
```javascript
{
  clienttype: 'tcp',
  tcpHost: '192.168.1.10',
  tcpPort: 502,
  tcpType: 'DEFAULT'      // or 'TCP-RTU-BUFFERED', 'TELNET', 'C701'
}
```

#### Serial Configuration
```javascript
{
  clienttype: 'serial',
  serialPort: '/dev/ttyUSB0',  // or 'COM1' on Windows
  serialBaudrate: 9600,
  serialDatabits: 8,
  serialStopbits: 1,
  serialParity: 'none',
  serialType: 'RTU-BUFFERD'    // or 'RTU', 'ASCII'
}
```

### Performance Tuning

#### Queue Configuration
```javascript
{
  bufferCommands: true,        // Enable command queueing
  commandDelay: 1,             // Delay between commands (ms)
  parallelUnitIdsAllowed: true // Allow parallel processing per unit ID
}
```

#### Timeout Configuration
```javascript
{
  clientTimeout: 1000,         // Command timeout (ms)
  reconnectOnTimeout: true,    // Auto-reconnect on timeout
  reconnectTimeout: 2000       // Reconnect delay (ms)
}
```

## Error Handling

### Error Types

#### Connection Errors
- `ECONNREFUSED` - Connection refused
- `ETIMEDOUT` - Connection timeout
- `EHOSTUNREACH` - Host unreachable

#### Modbus Errors
- `Timed out` - Command timeout
- `Port Not Open` - Serial port closed
- `FSM Not Ready To Reconnect` - State machine error

### Error Message Structure
```javascript
{
  error: {
    name: string,
    message: string,
    nodeStatus: string
  },
  payload: '',               // Empty on failure
  originalMessage: Object    // Original input message
}
```

### Error Handling Patterns

```javascript
// Handle errors in flow
node.on('input', function(msg) {
  if (msg.error) {
    // Handle error case
    node.warn('Modbus error: ' + msg.error.message);
    return;
  }
  // Process normal message
});
```

## State Management

### Client States
- `init` - Initializing
- `connected` - Connected to device
- `active` - Ready for operations
- `queueing` - Commands in queue
- `sending` - Sending command
- `broken` - Connection broken
- `closed` - Connection closed

### State Transitions
```
init → connected → active ⟷ queueing → sending → active
  ↓                            ↓
broken → reconnecting → connected
  ↓
closed
```

## Message Patterns

### Standard Message Flow

1. **Input Message** → Node processes input
2. **Queue Management** → Command queued if needed
3. **Modbus Command** → Sent to device
4. **Response Processing** → Raw response processed
5. **Output Messages** → Structured output sent

### Message Correlation

Messages are correlated using `messageId` for tracking:

```javascript
{
  messageId: ObjectId,
  topic: string,
  payload: {
    messageId: ObjectId,    // Same as top-level
    // ... other properties
  }
}
```

### Buffer Handling

Node-RED 4.1.0+ requires buffer cloning:

```javascript
// Always clone buffers to prevent corruption
const safeBuffer = cloneBuffer(originalBuffer);
```

## Utilities

### Debug Configuration

Enable debug output:
```bash
DEBUG=contribModbus* node-red -v
```

Debug categories:
- `contribModbus:core` - Core functionality
- `contribModbus:read` - Read operations
- `contribModbus:write` - Write operations
- `contribModbus:client` - Client management
- `contribModbus:server` - Server functionality

### Testing Utilities

The package includes test helpers:

```javascript
// Port allocation for testing
const { getPort } = require('./test/helper/test-helper-extensions');

getPort().then(port => {
  // Use dynamic port for testing
});
```

### Performance Considerations

1. **Use appropriate queue settings** for high-throughput scenarios
2. **Enable parallel unit IDs** when communicating with multiple devices
3. **Adjust command delays** based on device capabilities
4. **Monitor queue lengths** to prevent memory issues
5. **Clone buffers** for Node-RED 4.1.0+ compatibility

## Examples

### Basic Read Operation
```javascript
// modbus-read configuration
{
  unitid: 1,
  dataType: 'HoldingRegister',
  adr: 0,
  quantity: 10
}
```

### Basic Write Operation
```javascript
// Input message for modbus-write
{
  payload: {
    value: [1, 2, 3, 4, 5]  // Write 5 values starting at configured address
  }
}
```

### Error Handling with Catch Node
```javascript
// Flow with error handling
[
  {
    "id": "modbus1",
    "type": "modbus-read",
    "name": "Read Registers"
  },
  {
    "id": "catch1",
    "type": "catch",
    "scope": ["modbus1"],
    "wires": [["debug1"]]
  },
  {
    "id": "debug1",
    "type": "debug",
    "name": "Error Debug"
  }
]
```