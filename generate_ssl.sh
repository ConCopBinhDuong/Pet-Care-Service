#!/bin/bash

# SSL Certificate Generation Script for Development
# This creates self-signed certificates for HTTPS development

echo "🔐 Generating SSL Certificates for HTTPS Development"

# Create SSL directory
mkdir -p ssl
cd ssl

# Generate private key
echo "🔑 Generating private key..."
openssl genrsa -out server.key 2048

# Generate certificate signing request
echo "📝 Generating certificate signing request..."
openssl req -new -key server.key -out server.csr -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=PetCareService/OU=Development/CN=localhost"

# Generate self-signed certificate
echo "📜 Generating self-signed certificate..."
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert

# Set proper permissions
chmod 600 server.key
chmod 644 server.cert

echo "✅ SSL Certificates generated successfully!"
echo "📁 Location: $(pwd)"
echo "🔑 Private Key: server.key"
echo "📜 Certificate: server.cert"
echo ""
echo "⚠️  Note: This is a self-signed certificate for development only"
echo "🔒 For production, use certificates from a trusted CA"
echo ""
echo "🚀 You can now start the HTTPS server with:"
echo "   node src/server_https.js"

# Clean up CSR file
rm server.csr
