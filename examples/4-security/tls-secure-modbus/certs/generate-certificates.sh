#!/bin/bash

# TLS Certificate Generation Script for Modbus TLS Testing
# This script generates a complete PKI infrastructure for testing TLS with Modbus

set -e

CERT_DIR="$(dirname "$0")"
cd "$CERT_DIR"

echo "🔐 Generating TLS certificates for Modbus TLS testing..."

# Configuration
DAYS_VALID=3650
KEY_SIZE=2048
COUNTRY="US"
STATE="TestState"
CITY="TestCity"
ORG="ModbusTest"
OU="Testing"

# Clean up old certificates
rm -f *.pem *.key *.csr *.crt *.srl

echo "📁 Creating certificate directory structure..."

# 1. Generate CA private key
echo "🔑 Generating CA private key..."
openssl genrsa -out ca-key.pem $KEY_SIZE

# 2. Generate CA certificate
echo "📜 Generating CA certificate..."
openssl req -new -x509 -key ca-key.pem -out ca-cert.pem -days $DAYS_VALID \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=Modbus-CA"

# 3. Generate Server private key
echo "🔑 Generating Server private key..."
openssl genrsa -out server-key.pem $KEY_SIZE

# 4. Generate Server certificate signing request
echo "📝 Creating Server certificate request..."
cat > server.conf <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = $COUNTRY
ST = $STATE
L = $CITY
O = $ORG
OU = $OU
CN = modbus-server

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = modbus-server
DNS.3 = *.local
IP.1 = 127.0.0.1
IP.2 = ::1
IP.3 = 10.0.0.0/8
IP.4 = 172.16.0.0/12
IP.5 = 192.168.0.0/16
EOF

openssl req -new -key server-key.pem -out server.csr -config server.conf

# 5. Sign Server certificate with CA
echo "✍️ Signing Server certificate with CA..."
openssl x509 -req -in server.csr -CA ca-cert.pem -CAkey ca-key.pem \
    -CAcreateserial -out server-cert.pem -days $DAYS_VALID \
    -extensions v3_req -extfile server.conf

# 6. Generate Client private key
echo "🔑 Generating Client private key..."
openssl genrsa -out client-key.pem $KEY_SIZE

# 7. Generate Client certificate signing request
echo "📝 Creating Client certificate request..."
cat > client.conf <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = $COUNTRY
ST = $STATE
L = $CITY
O = $ORG
OU = $OU
CN = modbus-client

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = modbus-client
DNS.2 = client.local
EOF

openssl req -new -key client-key.pem -out client.csr -config client.conf

# 8. Sign Client certificate with CA
echo "✍️ Signing Client certificate with CA..."
openssl x509 -req -in client.csr -CA ca-cert.pem -CAkey ca-key.pem \
    -CAcreateserial -out client-cert.pem -days $DAYS_VALID \
    -extensions v3_req -extfile client.conf

# 9. Create combined certificate files for easier configuration
echo "📦 Creating combined certificate files..."
cat server-cert.pem server-key.pem > server-combined.pem
cat client-cert.pem client-key.pem > client-combined.pem

# 10. Verify certificates
echo "✅ Verifying certificates..."
openssl verify -CAfile ca-cert.pem server-cert.pem
openssl verify -CAfile ca-cert.pem client-cert.pem

# 11. Display certificate information
echo ""
echo "📊 Certificate Information:"
echo "=========================="
echo "CA Certificate:"
openssl x509 -in ca-cert.pem -noout -subject -issuer -dates

echo ""
echo "Server Certificate:"
openssl x509 -in server-cert.pem -noout -subject -issuer -dates -ext subjectAltName

echo ""
echo "Client Certificate:"
openssl x509 -in client-cert.pem -noout -subject -issuer -dates

# Clean up temporary files
rm -f *.csr *.conf *.srl

echo ""
echo "✅ Certificate generation complete!"
echo ""
echo "Generated files:"
echo "  📁 CA Certificate:     ca-cert.pem"
echo "  🔑 CA Private Key:     ca-key.pem"
echo "  📁 Server Certificate: server-cert.pem"
echo "  🔑 Server Private Key: server-key.pem"
echo "  📦 Server Combined:    server-combined.pem"
echo "  📁 Client Certificate: client-cert.pem"
echo "  🔑 Client Private Key: client-key.pem"
echo "  📦 Client Combined:    client-combined.pem"
echo ""
echo "🔒 Use these certificates in your Node-RED Modbus TLS configuration!"