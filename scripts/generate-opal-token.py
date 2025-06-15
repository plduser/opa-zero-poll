#!/usr/bin/env python3

"""
OPAL JWT Token Generator
Generates JWT tokens for OPAL Client authentication with External Data Sources
"""

import jwt
import base64
import json
import argparse
import os
from datetime import datetime, timedelta
from pathlib import Path

def load_private_key():
    """Load RSA private key from .env file or .opal-keys directory"""
    
    # Try to load from .env file first
    env_file = Path('.env')
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                if line.startswith('OPAL_PRIVATE_KEY='):
                    key_b64 = line.split('=', 1)[1].strip()
                    try:
                        return base64.b64decode(key_b64).decode('utf-8')
                    except Exception as e:
                        print(f"❌ Error decoding private key from .env: {e}")
    
    # Fallback to .opal-keys directory
    key_file = Path('.opal-keys/opal-private-key.pem')
    if key_file.exists():
        return key_file.read_text()
    
    raise FileNotFoundError(
        "❌ Private key not found!\n"
        "   Run: ./scripts/generate-opal-keys.sh\n"
        "   Or ensure .env contains OPAL_PRIVATE_KEY"
    )

def generate_token(tenant_id, expires_hours=24, client_id="opal-client-1"):
    """Generate JWT token for OPAL Client"""
    
    try:
        private_key = load_private_key()
    except FileNotFoundError as e:
        print(e)
        return None
    
    # JWT payload
    now = datetime.utcnow()
    payload = {
        # Standard JWT claims
        'iss': 'https://opal.ac/',           # Issuer
        'aud': 'https://api.opal.ac/',       # Audience
        'sub': client_id,                    # Subject (OPAL Client ID)
        'iat': int(now.timestamp()),         # Issued at
        'exp': int((now + timedelta(hours=expires_hours)).timestamp()),  # Expires
        'jti': f"{client_id}-{int(now.timestamp())}",  # JWT ID
        
        # OPAL-specific claims
        'tenant_id': tenant_id,              # Tenant identifier
        'client_type': 'opal-client',        # Client type
        'permissions': [                     # Permissions
            'read:external_data',
            'read:config'
        ]
    }
    
    # Generate JWT token
    try:
        token = jwt.encode(
            payload, 
            private_key, 
            algorithm='RS256'
        )
        return token
    except Exception as e:
        print(f"❌ Error generating JWT token: {e}")
        return None

def update_env_file(token):
    """Update .env file with generated token"""
    env_file = Path('.env')
    
    # Read existing content
    lines = []
    if env_file.exists():
        with open(env_file, 'r') as f:
            lines = [line.rstrip() for line in f if not line.startswith('OPAL_CLIENT_TOKEN=')]
    
    # Add new token
    lines.append(f'OPAL_CLIENT_TOKEN={token}')
    
    # Write back
    with open(env_file, 'w') as f:
        f.write('\n'.join(lines) + '\n')

def main():
    parser = argparse.ArgumentParser(description='Generate OPAL JWT token')
    parser.add_argument('--tenant-id', required=True, help='Tenant ID for the token')
    parser.add_argument('--expires-hours', type=int, default=24, help='Token expiration in hours (default: 24)')
    parser.add_argument('--client-id', default='opal-client-1', help='OPAL Client ID (default: opal-client-1)')
    parser.add_argument('--update-env', action='store_true', help='Update .env file with generated token')
    parser.add_argument('--decode', help='Decode and display JWT token payload')
    
    args = parser.parse_args()
    
    if args.decode:
        # Decode mode
        try:
            # Decode without verification (for display purposes)
            payload = jwt.decode(args.decode, options={"verify_signature": False})
            print("🔍 JWT Token Payload:")
            print(json.dumps(payload, indent=2))
            
            # Check expiration
            exp = payload.get('exp')
            if exp:
                exp_date = datetime.fromtimestamp(exp)
                now = datetime.utcnow()
                if exp_date > now:
                    print(f"✅ Token valid until: {exp_date}")
                else:
                    print(f"❌ Token expired on: {exp_date}")
        except Exception as e:
            print(f"❌ Error decoding token: {e}")
        return
    
    # Generate mode
    print("🎫 OPAL JWT Token Generator")
    print("===========================")
    print(f"📋 Tenant ID: {args.tenant_id}")
    print(f"⏰ Expires: {args.expires_hours} hours")
    print(f"🆔 Client ID: {args.client_id}")
    print()
    
    token = generate_token(args.tenant_id, args.expires_hours, args.client_id)
    
    if token:
        print("✅ JWT Token generated successfully!")
        print()
        print("🎫 Token:")
        print(token)
        print()
        
        if args.update_env:
            update_env_file(token)
            print("💾 Token saved to .env file as OPAL_CLIENT_TOKEN")
            print()
        
        print("🔍 To decode this token:")
        print(f"   python3 scripts/generate-opal-token.py --decode '{token}'")
        print()
        print("🚀 Ready to use with OPAL Client!")
    else:
        print("❌ Failed to generate token")
        exit(1)

if __name__ == '__main__':
    main() 