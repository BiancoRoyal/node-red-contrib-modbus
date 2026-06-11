# Modbus TLS Docker Testing Environment

Complete Docker-based testing environment for Modbus TLS communication with Node-RED.

## 🐳 Overview

This directory provides a comprehensive Docker setup for testing secure Modbus communication with TLS encryption, including:
- Automated TLS certificate generation
- Pre-configured Node-RED instances (server and client)
- Modbus simulator for additional testing
- Standalone TLS connection tester

## 📁 Directory Structure

```
modbus-tls-docker/
├── README.md                        # This file
├── docker-compose.yml               # Docker orchestration
├── .env.example                     # Environment variables template
├── .gitignore                      # Git ignore rules
├── test-tls-connection.js          # Standalone TLS tester
├── modbus-tls-server-flow.json    # Server flow for Node-RED
├── modbus-tls-client-flow.json    # Client flow for Node-RED
└── certs/
    └── generate-certificates.sh    # Certificate generation script
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Port 1880, 1881, and 8502 available

### Step 1: Setup Environment

```bash
# Clone or navigate to this directory
cd example/modbus-tls-docker

# Copy environment template
cp .env.example .env

# Generate TLS certificates
cd certs
./generate-certificates.sh
cd ..
```

### Step 2: Start Docker Environment

```bash
# Start all services
docker-compose up -d

# Or start with logs visible
docker-compose up

# Check service status
docker-compose ps
```

### Step 3: Access Node-RED Instances

- **Server Node-RED**: http://localhost:1880
- **Client Node-RED**: http://localhost:1881

### Step 4: Import and Configure Flows

1. Open Server Node-RED (http://localhost:1880)
2. Import `modbus-tls-server-flow.json`
3. Configure TLS with generated certificates
4. Deploy the server flow

5. Open Client Node-RED (http://localhost:1881)
6. Import `modbus-tls-client-flow.json`
7. Configure TLS with client certificates
8. Deploy the client flow

## 🔧 Services Description

### node-red-server
- **Purpose**: Hosts the TLS-enabled Modbus server
- **Port**: 1880 (UI), 8502 (Modbus TLS)
- **Features**: Pre-installed node-red-contrib-modbus, TLS certificates mounted

### node-red-client
- **Purpose**: Hosts the TLS-enabled Modbus client
- **Port**: 1881 (UI)
- **Features**: Connects to server via TLS, monitoring capabilities

### modbus-simulator
- **Purpose**: Additional non-TLS Modbus server for testing
- **Port**: 5020 (standard Modbus TCP)
- **Features**: 100 registers of each type, verbose logging

### cert-generator
- **Purpose**: Automatically generates certificates if missing
- **Features**: One-time execution, creates complete PKI infrastructure

## 🧪 Testing

### Test TLS Connection

Use the standalone tester to verify TLS connectivity:

```bash
# Test local connection
node test-tls-connection.js localhost 8502

# Test remote connection
node test-tls-connection.js <server-ip> 8502
```

### Monitor Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f node-red-server
docker-compose logs -f node-red-client

# Check for TLS handshake
docker-compose logs | grep -i "tls\|ssl\|secure"
```

### Test Modbus Communication

The flows automatically test communication:
- Server generates sensor data every 5 seconds
- Client reads data and displays in debug panel
- Connection status shown in both UIs

## 🔐 Security Configuration

### Certificate Details
- **Algorithm**: RSA 2048-bit
- **Validity**: 10 years (testing only)
- **Subject Alt Names**: localhost, Docker networks
- **Key Usage**: Digital signature, key encipherment

### TLS Configuration
- **Protocol**: TLS 1.2+
- **Authentication**: Mutual TLS (mTLS)
- **Cipher Suites**: Modern secure ciphers only

### Network Security
- Isolated Docker network (172.30.0.0/16)
- Service-to-service communication only
- No external exposure except UI ports

## 📊 Data Flow

```
[Modbus Client]
    ↓ (TLS Encrypted)
[Port 8502]
    ↓
[Modbus Server]
    ↓
[Simulated Data]
```

### Simulated Data Points
- **Holding Registers (0-9)**:
  - 0: Temperature (x10)
  - 1: Humidity (x10)
  - 2: Pressure
  - 3-4: Timestamp
  - 5: Device ID
  - 6: Firmware version
  - 7: Random value
  - 8: Status flags
  - 9: Error code

- **Coils (0-15)**: Random digital states

## 🛠️ Advanced Configuration

### Custom Environment Variables

Edit `.env` file:

```bash
# Change ports
SERVER_UI_PORT=1880
CLIENT_UI_PORT=1881
MODBUS_TLS_PORT=8502

# Debug level
DEBUG_LEVEL=contribModbus*

# Certificate validity
CERT_VALIDITY_DAYS=3650
```

### Scaling Services

```bash
# Run multiple clients
docker-compose up -d --scale node-red-client=3
```

### Custom Networks

Modify `docker-compose.yml`:

```yaml
networks:
  modbus-network:
    ipam:
      config:
        - subnet: 192.168.100.0/24
```

## 📝 Troubleshooting

### Common Issues

1. **"Cannot connect to Docker daemon"**
   ```bash
   # Ensure Docker is running
   sudo systemctl start docker
   ```

2. **"Port already in use"**
   ```bash
   # Change ports in .env file or stop conflicting services
   lsof -i :1880
   ```

3. **"Certificate verification failed"**
   ```bash
   # Regenerate certificates
   cd certs
   rm *.pem *.key
   ./generate-certificates.sh
   ```

4. **"TLS handshake timeout"**
   ```bash
   # Check firewall rules
   sudo iptables -L -n | grep 8502
   ```

### Debug Commands

```bash
# Container shell access
docker-compose exec node-red-server /bin/bash

# Check certificate validity
docker-compose exec node-red-server openssl x509 -in /data/certs/server-cert.pem -text -noout

# Test internal connectivity
docker-compose exec node-red-client ping node-red-server

# View Node-RED logs
docker-compose exec node-red-server tail -f /data/.npm/_logs/*.log
```

## 🧹 Cleanup

```bash
# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Remove certificates
rm certs/*.pem certs/*.key

# Complete cleanup
docker-compose down -v --rmi all
```

## 🔄 Updating

```bash
# Pull latest images
docker-compose pull

# Rebuild with latest node-red-contrib-modbus
docker-compose build --no-cache

# Restart services
docker-compose restart
```

## 📚 Additional Documentation

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node-RED Docker Guide](https://nodered.org/docs/getting-started/docker)
- [Modbus TCP Specification](https://modbus.org/specs.php)
- [TLS Best Practices](https://github.com/ssllabs/research/wiki/TLS-Deployment-Best-Practices)

## ⚠️ Production Considerations

This setup is for **testing and development only**. For production:

1. **Certificates**: Use proper CA-signed certificates
2. **Secrets**: Use Docker secrets for sensitive data
3. **Networks**: Implement proper network segmentation
4. **Monitoring**: Add logging and monitoring solutions
5. **Backup**: Implement certificate and data backup strategies
6. **Updates**: Regular security updates and certificate rotation

## 🤝 Support

For issues specific to this Docker setup:
1. Check container logs: `docker-compose logs`
2. Verify certificate generation completed
3. Ensure all ports are available
4. Review the main project documentation

---

**Note**: This Docker environment is designed for testing TLS-enabled Modbus communication. Always use proper security measures in production environments.