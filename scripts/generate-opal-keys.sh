#!/bin/bash

# OPAL JWT Keys Generator
# Generates RSA key pair for OPAL External Data Sources authentication

set -e

KEYS_DIR=".opal-keys"
PRIVATE_KEY_FILE="$KEYS_DIR/opal-private-key.pem"
PUBLIC_KEY_FILE="$KEYS_DIR/opal-public-key.pem"
ENV_FILE=".env"

echo "🔐 OPAL JWT Keys Generator"
echo "=========================="

# Create keys directory
mkdir -p "$KEYS_DIR"

# Generate RSA private key (2048 bits)
echo "📝 Generating RSA private key..."
openssl genrsa -out "$PRIVATE_KEY_FILE" 2048

# Extract public key (PEM format)
echo "🔑 Extracting public key (PEM format)..."
openssl rsa -in "$PRIVATE_KEY_FILE" -pubout -out "$PUBLIC_KEY_FILE"

# Extract public key (SSH format for OPAL)
echo "🔑 Extracting public key (SSH format for OPAL)..."
SSH_PUBLIC_KEY=$(ssh-keygen -y -f "$PRIVATE_KEY_FILE")

# Convert keys to base64 for environment variables
echo "📦 Converting keys to base64..."
PRIVATE_KEY_B64=$(base64 -i "$PRIVATE_KEY_FILE" | tr -d '\n')
PUBLIC_KEY_B64=$(base64 -i "$PUBLIC_KEY_FILE" | tr -d '\n')
SSH_PUBLIC_KEY_B64=$(echo "$SSH_PUBLIC_KEY" | base64 | tr -d '\n')

# Update .env file
echo "💾 Updating .env file..."
if [ -f "$ENV_FILE" ]; then
    # Remove existing OPAL key entries
    grep -v "^OPAL_PRIVATE_KEY=" "$ENV_FILE" | grep -v "^OPAL_PUBLIC_KEY=" | grep -v "^OPAL_PUBLIC_KEY_PEM=" > "$ENV_FILE.tmp"
    mv "$ENV_FILE.tmp" "$ENV_FILE"
fi

# Add new keys to .env
cat >> "$ENV_FILE" << EOF

# OPAL JWT Keys (Generated $(date))
OPAL_PRIVATE_KEY=$PRIVATE_KEY_B64
OPAL_PUBLIC_KEY=$SSH_PUBLIC_KEY_B64
OPAL_PUBLIC_KEY_PEM=$PUBLIC_KEY_B64
EOF

echo "✅ RSA key pair generated successfully!"
echo ""
echo "📁 Files created:"
echo "   - Private key: $PRIVATE_KEY_FILE"
echo "   - Public key:  $PUBLIC_KEY_FILE"
echo "   - Environment: $ENV_FILE (updated)"
echo ""
echo "🔒 Keys added to .env file as base64-encoded environment variables"
echo "   - OPAL_PRIVATE_KEY: PEM format (base64)"
echo "   - OPAL_PUBLIC_KEY: SSH format (base64) - for OPAL Server"
echo "   - OPAL_PUBLIC_KEY_PEM: PEM format (base64) - for Data Provider API"
echo ""
echo "🚀 Ready for OPAL External Data Sources!"
echo ""
echo "⚠️  SECURITY NOTE:"
echo "   - Keep private key secure and never commit to version control"
echo "   - Add .opal-keys/ to .gitignore"
echo "   - Rotate keys regularly in production" 