# TLS Integration Test Guide

## Overview
The Modbus nodes now have integrated TLS support. Instead of separate TLS nodes, the standard `modbus-client` configuration node now includes a TLS option that can be enabled for any Modbus node.

## Access Node-RED
Open your browser and navigate to: **http://localhost:1880**

## Testing the Integrated TLS Functionality

### 1. Check the Updated Modbus Client Configuration

1. Drag any Modbus node onto the canvas (e.g., `modbus-read`, `modbus-write`, `modbus-getter`)
2. Double-click to configure it
3. Click the pencil icon next to the Server field to edit the client configuration
4. You should now see:
   - **Enable TLS** checkbox at the top of the security settings
   - When checked, TLS configuration fields appear:
     - Private Key (file path or content)
     - Certificate (file path or content)  
     - CA Certificate (file path or content)
     - Server Name
     - Reject Unauthorized checkbox
     - Secure Protocol dropdown
     - Check Server Identity checkbox

### 2. Test Non-TLS Connection (Default Behavior)

1. Create a simple Modbus flow:
   - Add an `inject` node
   - Add a `modbus-read` node
   - Add a `debug` node
   - Connect them: inject → modbus-read → debug

2. Configure the modbus-read node:
   - Server: Create new modbus-client
   - Type: TCP
   - Host: localhost
   - Port: 10502
   - **Leave "Enable TLS" unchecked**
   - Save configuration

3. Deploy and test - should work as normal Modbus TCP

### 3. Test TLS-Enabled Connection

1. Edit the same client configuration:
   - **Check "Enable TLS"**
   - Configure TLS options (see options below)
   - Save configuration

2. The same nodes will now use TLS for communication

### 4. TLS Configuration Options

#### Option A: Demo Mode (Self-Signed Certificates)
- Leave certificate fields empty
- Uncheck "Reject Unauthorized"
- The client will accept self-signed certificates (for testing only)

#### Option B: File Paths
- Private Key: `/path/to/client-key.pem`
- Certificate: `/path/to/client-cert.pem`
- CA Certificate: `/path/to/ca-cert.pem`

#### Option C: Direct Content
- Paste the certificate content directly into the fields
- Content should include the BEGIN/END markers

#### Option D: Environment Variables
- Set environment variables:
  - `MODBUS_TLS_PRIVATE_KEY`
  - `MODBUS_TLS_CERTIFICATE`
  - `MODBUS_TLS_CA`
- Leave fields empty to use environment variables

### 5. Test the Example Flows

Import the example flows to see TLS in action:

1. **Menu (☰) → Import → select file**
2. Choose from `examples/` directory:
   - `Modbus-TLS-Security.json` - Now uses integrated TLS in standard nodes
   - `Modbus-Demo-Server-Showcase.json` - Test with demo server
   - `Modbus-Advanced-Features.json` - Advanced patterns with TLS

### 6. Verify TLS is Working

1. Check the node status:
   - Green dot = connected with TLS (if enabled)
   - Red = connection failed (check certificates)

2. Enable debug output for detailed TLS information:
   ```bash
   DEBUG=contribModbus* node-red
   ```

3. Look for TLS-related messages in debug output:
   - "TLS enabled with options: [...]"
   - "Using TLS connection"
   - Certificate validation messages

### 7. Test Different Node Types with TLS

All these nodes now support TLS through the client configuration:
- `modbus-read` - Read operations with TLS
- `modbus-write` - Write operations with TLS
- `modbus-getter` - Get operations with TLS
- `modbus-flex-getter` - Flexible get with TLS
- `modbus-flex-write` - Flexible write with TLS
- `modbus-flex-connector` - Flexible connection with TLS
- `modbus-flex-sequencer` - Sequencer with TLS
- `modbus-response` - Response handling with TLS

### 8. Security Best Practices

1. **Production Use**:
   - Always use proper certificates (not self-signed)
   - Keep "Reject Unauthorized" checked
   - Use TLS 1.2 or higher
   - Store certificates securely

2. **Certificate Management**:
   - Use Node-RED's credential system (fields are automatically encrypted)
   - Or use environment variables for sensitive data
   - Never commit certificates to version control

3. **Testing vs Production**:
   - Demo mode (self-signed) for testing only
   - Proper PKI infrastructure for production

### 9. Troubleshooting

If TLS connections fail:

1. **Check certificates**:
   - Ensure paths are correct
   - Verify certificate format (PEM)
   - Check certificate validity dates

2. **Check server compatibility**:
   - Server must support Modbus over TLS
   - Matching TLS versions
   - Compatible cipher suites

3. **Debug mode**:
   - Enable debug logging
   - Check Node-RED console output
   - Look for SSL/TLS error messages

4. **Common issues**:
   - Self-signed certificates: Uncheck "Reject Unauthorized" for testing
   - Path issues: Use absolute paths for certificate files
   - Format issues: Ensure PEM format with proper headers

### 10. Migration from Separate TLS Nodes

If you were using the proposed separate TLS nodes:
1. The functionality is now integrated into the standard `modbus-client`
2. Simply enable TLS in the client configuration
3. All nodes using that client will automatically use TLS
4. No need for separate node types

## Summary

The TLS integration provides:
- **Seamless Integration**: TLS is now an option in standard Modbus nodes
- **Backward Compatibility**: Existing flows work unchanged
- **Flexibility**: Easy to enable/disable TLS per client configuration
- **Security**: Proper credential management and certificate validation
- **Simplicity**: One set of nodes for both TLS and non-TLS connections

Test each configuration option and verify that TLS connections work correctly with your Modbus devices or servers.