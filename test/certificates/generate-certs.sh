#!/bin/bash

# Generate self-signed certificates for TLS testing
# These are for testing only - DO NOT use in production

echo "🔐 Generating self-signed certificates for TLS testing..."

# Create certificate directory
cd "$(dirname "$0")"

# Generate private key for CA
openssl genrsa -out ca-key.pem 2048

# Generate CA certificate
openssl req -new -x509 -days 365 -key ca-key.pem -out ca-cert.pem -subj "/C=US/ST=Test/L=Test/O=ModbusTest/CN=TestCA"

# Generate server private key
openssl genrsa -out server-key.pem 2048

# Generate server certificate request
openssl req -new -key server-key.pem -out server-csr.pem -subj "/C=US/ST=Test/L=Test/O=ModbusTest/CN=localhost"

# Sign server certificate with CA
openssl x509 -req -days 365 -in server-csr.pem -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem

# Generate client private key
openssl genrsa -out client-key.pem 2048

# Generate client certificate request
openssl req -new -key client-key.pem -out client-csr.pem -subj "/C=US/ST=Test/L=Test/O=ModbusTest/CN=client"

# Sign client certificate with CA
openssl x509 -req -days 365 -in client-csr.pem -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out client-cert.pem

# Clean up CSR files
rm -f server-csr.pem client-csr.pem ca-cert.srl

echo "✅ Certificates generated successfully!"
echo ""
echo "Generated files:"
echo "  - ca-cert.pem     (Certificate Authority)"
echo "  - ca-key.pem      (CA Private Key)"
echo "  - server-cert.pem (Server Certificate)"
echo "  - server-key.pem  (Server Private Key)"
echo "  - client-cert.pem (Client Certificate)"
echo "  - client-key.pem  (Client Private Key)"