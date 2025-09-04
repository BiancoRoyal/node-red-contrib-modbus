# Security Documentation

## Security Policy

### Supported Versions

These versions are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 6.x     | :white_check_mark: |
| 5.x     | :white_check_mark: |
| < 5.0   | :x:                |

### Reporting a Vulnerability

To report security vulnerabilities:
1. **DO NOT** create a public issue
2. Send an email to the maintainers with details
3. Include steps to reproduce if possible
4. Allow time for a fix before public disclosure

## Security Guidelines

This section provides security guidelines and best practices for deploying Node-RED Modbus in production environments.

### 🔐 TLS/SSL Configuration

#### 1. Enable TLS with Strong Protocols
```javascript
{
  "tlsEnabled": true,
  "secureProtocol": "TLSv1_3_method",  // Use TLS 1.3
  "minVersion": "TLSv1.2",              // Minimum TLS 1.2
  "tlsRejectUnauthorized": true         // Verify certificates
}
```

#### 2. Certificate Management

**Never store certificates in configuration files.**

Use environment variables:
```bash
# Store certificates securely
export MODBUS_TLS_PRIVATE_KEY="$(cat /secure/path/private-key.pem)"
export MODBUS_TLS_CERTIFICATE="$(cat /secure/path/certificate.pem)"
export MODBUS_TLS_CA="$(cat /secure/path/ca.pem)"

# Set proper permissions
chmod 400 /secure/path/*.pem
chown node-red:node-red /secure/path/*.pem
```

Use Node-RED credentials:
```javascript
// In your node
this.credentials = {
  tlsPrivateKey: { type: "password" },
  tlsCertificate: { type: "password" },
  tlsCa: { type: "password" }
};
```

#### 3. Server Identity Verification
```javascript
{
  "tlsCheckServerIdentity": true,
  "tlsServername": "modbus.example.com"  // Must match certificate
}
```

### 🛡️ Network Security

#### Firewall Configuration
- Restrict Modbus TCP ports (default 502) to known IP addresses
- Use VPN or private networks for Modbus communication
- Implement network segmentation

#### Port Security
```bash
# Example iptables rules
iptables -A INPUT -p tcp --dport 502 -s trusted.ip.address -j ACCEPT
iptables -A INPUT -p tcp --dport 502 -j DROP
```

### 🔑 Authentication & Authorization

#### Node-RED Security
1. Enable Node-RED authentication
2. Use strong passwords
3. Implement role-based access control
4. Regular security audits

#### Modbus Security
- Use unit ID validation
- Implement request rate limiting
- Monitor for unusual patterns
- Log all Modbus transactions

### 📊 Security Monitoring

#### Logging Best Practices
```javascript
// Enable security logging
{
  "logLevel": "info",
  "auditLog": true,
  "logFailedAuth": true,
  "logConnectionAttempts": true
}
```

#### Monitoring Checklist
- [ ] Monitor connection attempts
- [ ] Track authentication failures
- [ ] Watch for unusual traffic patterns
- [ ] Alert on certificate expiration
- [ ] Regular security updates

### 🚨 Common Security Issues

1. **Unencrypted Communication**
   - Always use TLS in production
   - Never transmit sensitive data over plain TCP

2. **Default Credentials**
   - Change all default passwords
   - Use strong, unique credentials

3. **Exposed Services**
   - Never expose Modbus directly to internet
   - Use VPN or secure tunneling

4. **Missing Updates**
   - Regular security updates
   - Monitor security advisories

### 📚 Additional Resources

- [Node-RED Security Documentation](https://nodered.org/docs/user-guide/runtime/securing-node-red)
- [Modbus Security Guidelines](https://www.modbus.org/docs/MB-TCP-Security-v21_2018-07-24.pdf)
- [OWASP IoT Security](https://owasp.org/www-project-internet-of-things/)

---

*Last Updated: 2024-08*
*Version: 6.0.0*