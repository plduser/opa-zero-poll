#!/usr/bin/env python3
import re

def add_users_registration():
    # Wczytaj plik
    with open('app.py', 'r') as f:
        content = f.read()
    
    # Znajdź miejsce po CORS(app) i dodaj rejestrację
    pattern = r'(app = Flask\(__name__\)\nCORS\(app\))'
    replacement = r'''\1

# Rejestracja Users Management endpoints
if USERS_ENDPOINTS_AVAILABLE:
    try:
        register_users_endpoints(app)
        logger.info("✅ Users management endpoints registered")
    except Exception as e:
        logger.error(f"❌ Failed to register users endpoints: {e}")
        USERS_ENDPOINTS_AVAILABLE = False'''
    
    # Wykonaj zamianę
    new_content = re.sub(pattern, replacement, content)
    
    # Zapisz plik
    with open('app.py', 'w') as f:
        f.write(new_content)
    
    print("✅ Dodano rejestrację users endpoints")

if __name__ == "__main__":
    add_users_registration() 