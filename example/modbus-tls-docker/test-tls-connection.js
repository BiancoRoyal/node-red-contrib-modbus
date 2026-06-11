#!/usr/bin/env node

/**
 * TLS Connection Test Script for Modbus TLS
 *
 * This script tests TLS connectivity without Node-RED
 * Usage: node test-tls-connection.js [host] [port]
 */

const tls = require('tls')
const fs = require('fs')
const path = require('path')

// Configuration
const HOST = process.argv[2] || 'localhost'
const PORT = process.argv[3] || 8502
const CERT_DIR = path.join(__dirname, 'certs')

// Check if certificates exist
const checkCertificates = () => {
  const required = ['client-cert.pem', 'client-key.pem', 'ca-cert.pem']
  const missing = required.filter(file => !fs.existsSync(path.join(CERT_DIR, file)))

  if (missing.length > 0) {
    console.error('❌ Missing certificates:', missing.join(', '))
    console.log('📝 Run ./certs/generate-certificates.sh first')
    process.exit(1)
  }

  console.log('✅ All certificates found')
}

// Test TLS connection
const testConnection = () => {
  console.log(`\n🔐 Testing TLS connection to ${HOST}:${PORT}...`)

  const options = {
    host: HOST,
    port: PORT,
    key: fs.readFileSync(path.join(CERT_DIR, 'client-key.pem')),
    cert: fs.readFileSync(path.join(CERT_DIR, 'client-cert.pem')),
    ca: fs.readFileSync(path.join(CERT_DIR, 'ca-cert.pem')),
    servername: 'modbus-server',
    rejectUnauthorized: true,
    checkServerIdentity: (hostname, cert) => {
      console.log('🔍 Server Certificate Info:')
      console.log('  Subject:', cert.subject)
      console.log('  Issuer:', cert.issuer)
      console.log('  Valid from:', cert.valid_from)
      console.log('  Valid to:', cert.valid_to)
      console.log('  Fingerprint:', cert.fingerprint)
      return undefined // Accept the certificate
    }
  }

  const socket = tls.connect(options, () => {
    console.log('\n✅ TLS Connection Established!')
    console.log('📊 Connection Details:')
    console.log('  Protocol:', socket.getProtocol())
    console.log('  Cipher:', JSON.stringify(socket.getCipher(), null, 2))
    console.log('  Authorized:', socket.authorized)
    console.log('  Encrypted:', socket.encrypted)
    console.log('  Remote Address:', socket.remoteAddress)
    console.log('  Remote Port:', socket.remotePort)

    // Test sending Modbus data (Read Holding Registers FC03)
    console.log('\n📤 Sending Modbus test packet...')

    // Modbus TCP/IP ADU for reading 10 holding registers starting at address 0
    const transactionId = Buffer.from([0x00, 0x01]) // Transaction ID
    const protocolId = Buffer.from([0x00, 0x00]) // Protocol ID (Modbus)
    const length = Buffer.from([0x00, 0x06]) // Length
    const unitId = Buffer.from([0x01]) // Unit ID
    const functionCode = Buffer.from([0x03]) // Function Code (Read Holding Registers)
    const startAddress = Buffer.from([0x00, 0x00]) // Starting Address
    const quantity = Buffer.from([0x00, 0x0A]) // Quantity (10 registers)

    const modbusPacket = Buffer.concat([
      transactionId,
      protocolId,
      length,
      unitId,
      functionCode,
      startAddress,
      quantity
    ])

    socket.write(modbusPacket)

    // Set timeout for response
    setTimeout(() => {
      if (!socket.destroyed) {
        console.log('\n⏰ No Modbus response received (server might not be running)')
        socket.end()
      }
    }, 5000)
  })

  socket.on('data', (data) => {
    console.log('\n📥 Received Modbus response:')
    console.log('  Raw data (hex):', data.toString('hex'))
    console.log('  Length:', data.length, 'bytes')

    if (data.length >= 9) {
      const transactionId = data.readUInt16BE(0)
      const protocolId = data.readUInt16BE(2)
      const length = data.readUInt16BE(4)
      const unitId = data.readUInt8(6)
      const functionCode = data.readUInt8(7)

      console.log('\n📊 Modbus Response Parsed:')
      console.log('  Transaction ID:', transactionId)
      console.log('  Protocol ID:', protocolId)
      console.log('  Length:', length)
      console.log('  Unit ID:', unitId)
      console.log('  Function Code:', functionCode)

      if (functionCode === 0x03 && data.length > 8) {
        const byteCount = data.readUInt8(8)
        console.log('  Byte Count:', byteCount)

        if (data.length >= 9 + byteCount) {
          console.log('  Register Values:')
          for (let i = 0; i < byteCount / 2; i++) {
            const value = data.readUInt16BE(9 + i * 2)
            console.log(`    Register ${i}:`, value, `(0x${value.toString(16).toUpperCase()})`)
          }
        }
      }
    }

    console.log('\n✅ TLS Modbus communication successful!')
    socket.end()
  })

  socket.on('error', (error) => {
    console.error('\n❌ TLS Connection Error:', error.message)
    if (error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
      console.log('💡 The server is using a self-signed certificate.')
      console.log('   This is expected for testing. For production, use proper CA-signed certificates.')
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Connection refused. Make sure the Modbus TLS server is running on port', PORT)
    } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      console.log('💡 Certificate verification failed. Check that the CA certificate is correct.')
    }
    process.exit(1)
  })

  socket.on('close', () => {
    console.log('\n🔌 Connection closed')
    process.exit(0)
  })

  socket.on('secureConnect', () => {
    console.log('🔒 Secure connection established')
  })
}

// Main execution
console.log('🔐 Modbus TLS Connection Tester')
console.log('================================')

checkCertificates()
testConnection()
