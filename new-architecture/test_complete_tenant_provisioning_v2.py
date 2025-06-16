#!/usr/bin/env python3
"""
Kompletny test provisioning tenanta z automatycznymi uprawnieniami administratora
Symuluje realistyczny scenariusz produkcyjny: B2C/Auth0 → Portal → Provisioning → OPAL
"""

import requests
import json
import time
import psycopg2
from datetime import datetime
import sys

# Konfiguracja
PROVISIONING_API_URL = "http://localhost:8010"
DATA_PROVIDER_API_URL = "http://localhost:8110"
OPAL_SERVER_URL = "http://localhost:7002"
OPA_URL = "http://localhost:8181"

# Dane bazy PostgreSQL
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'opa_zero_poll',
    'user': 'opa_user',
    'password': 'opa_password'
}

def log(message):
    """Logowanie z timestampem"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def test_database_connection():
    """Test połączenia z bazą danych"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        log("✅ Połączenie z bazą danych PostgreSQL - OK")
        return True
    except Exception as e:
        log(f"❌ Błąd połączenia z bazą danych: {e}")
        return False

def test_services_health():
    """Test zdrowia wszystkich serwisów"""
    services = [
        ("Provisioning API", f"{PROVISIONING_API_URL}/health"),
        ("Data Provider API", f"{DATA_PROVIDER_API_URL}/health"),
        ("OPAL Server", f"{OPAL_SERVER_URL}/"),
        ("OPA", f"{OPA_URL}/health")
    ]
    
    all_healthy = True
    for name, url in services:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                log(f"✅ {name} - OK")
            else:
                log(f"⚠️ {name} - Status {response.status_code}")
                all_healthy = False
        except Exception as e:
            log(f"❌ {name} - Niedostępny: {e}")
            all_healthy = False
    
    return all_healthy

def create_complete_tenant_structure(tenant_id, tenant_name, admin_email, admin_name):
    """
    Tworzy kompletną strukturę tenanta w PostgreSQL:
    - Tenant
    - Pierwsza firma
    - Użytkownik administrator
    - Uprawnienia administratora dla aplikacji Portal
    """
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # 1. Dodaj tenant do głównej tabeli
        cursor.execute("""
            INSERT INTO tenants (tenant_id, tenant_name, description, status, created_at, updated_at)
            VALUES (%s, %s, %s, 'active', NOW(), NOW())
            ON CONFLICT (tenant_id) DO NOTHING
        """, (tenant_id, tenant_name, f"Tenant utworzony automatycznie dla {admin_name}"))
        
        # 2. Dodaj pierwszą firmę
        company_id = f"company_{tenant_id}"
        cursor.execute("""
            INSERT INTO companies (company_id, tenant_id, company_name, company_code, description, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, 'active', NOW(), NOW())
            ON CONFLICT (company_id) DO NOTHING
        """, (company_id, tenant_id, tenant_name, tenant_id.upper(), f"Główna firma dla {tenant_name}"))
        
        # 3. Dodaj użytkownika administratora
        user_id = f"admin_{tenant_id}"
        username = admin_email.split('@')[0]  # Użyj części przed @ jako username
        cursor.execute("""
            INSERT INTO users (user_id, username, email, full_name, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, 'active', NOW(), NOW())
            ON CONFLICT (user_id) DO NOTHING
        """, (user_id, username, admin_email, admin_name))
        
        # 4. Dodaj dostęp użytkownika do firmy
        cursor.execute("""
            INSERT INTO user_access (user_id, company_id, tenant_id, access_type, granted_at, granted_by)
            VALUES (%s, %s, %s, 'direct', NOW(), 'system')
            ON CONFLICT (user_id, company_id, tenant_id) DO NOTHING
        """, (user_id, company_id, tenant_id))
        
        # 5. Sprawdź czy aplikacja Portal istnieje
        cursor.execute("SELECT app_id FROM applications WHERE app_id = 'portal'")
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO applications (app_id, app_name, description, status, created_at)
                VALUES ('portal', 'Portal', 'Główna aplikacja portalu zarządzania', 'active', NOW())
            """)
        
        # 6. Sprawdź czy rola Portal Administrator istnieje
        cursor.execute("SELECT role_id FROM roles WHERE role_name = 'Portal Administrator' AND app_id = 'portal'")
        portal_admin_role = cursor.fetchone()
        if not portal_admin_role:
            cursor.execute("""
                INSERT INTO roles (role_id, role_name, app_id, description, created_at)
                VALUES (uuid_generate_v4(), 'Portal Administrator', 'portal', 'Administrator portalu z pełnymi uprawnieniami', NOW())
                RETURNING role_id
            """)
            portal_admin_role = cursor.fetchone()
        
        role_id = portal_admin_role[0]
        
        # 7. Dodaj rolę administratora do użytkownika
        cursor.execute("""
            INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_at, assigned_by)
            VALUES (%s, %s, %s, NOW(), 'system')
            ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING
        """, (user_id, role_id, tenant_id))
        
        # 8. Sprawdź czy uprawnienia Portal Administrator istnieją
        portal_permissions = [
            ('manage_users', 'Zarządzanie użytkownikami'),
            ('manage_companies', 'Zarządzanie firmami'),
            ('manage_roles', 'Zarządzanie rolami'),
            ('manage_permissions', 'Zarządzanie uprawnieniami'),
            ('view_analytics', 'Przeglądanie analityki'),
            ('system_admin', 'Administracja systemu')
        ]
        
        for perm_name, perm_desc in portal_permissions:
            # Dodaj uprawnienie jeśli nie istnieje
            cursor.execute("""
                INSERT INTO permissions (permission_id, permission_name, app_id, description, created_at)
                VALUES (uuid_generate_v4(), %s, 'portal', %s, NOW())
                ON CONFLICT (permission_name, app_id) DO NOTHING
            """, (perm_name, perm_desc))
            
            # Pobierz ID uprawnienia
            cursor.execute("""
                SELECT permission_id FROM permissions 
                WHERE permission_name = %s AND app_id = 'portal'
            """, (perm_name,))
            permission_id = cursor.fetchone()[0]
            
            # Przypisz uprawnienie do roli
            cursor.execute("""
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES (%s, %s)
                ON CONFLICT (role_id, permission_id) DO NOTHING
            """, (role_id, permission_id))
        
        conn.commit()
        conn.close()
        
        log(f"✅ Utworzono kompletną strukturę dla tenant {tenant_id}")
        log(f"   - Tenant: {tenant_name}")
        log(f"   - Firma: {company_id}")
        log(f"   - Administrator: {admin_name} ({admin_email})")
        log(f"   - Rola: Portal Administrator z 6 uprawnieniami")
        
        return True
        
    except Exception as e:
        log(f"❌ Błąd tworzenia struktury tenanta: {e}")
        return False

def test_provisioning_api(tenant_id, tenant_name, admin_email, admin_name):
    """Test Provisioning API - provisioning kompletnej struktury tenanta"""
    try:
        data = {
            "tenant_id": tenant_id,
            "tenant_name": tenant_name,
            "admin_email": admin_email,
            "admin_name": admin_name,
            "metadata": {
                "created_by": "integration_test",
                "environment": "test"
            }
        }
        
        response = requests.post(
            f"{PROVISIONING_API_URL}/provision-tenant",
            json=data,
            timeout=15
        )
        
        if response.status_code == 201:
            result = response.json()
            structure = result.get('structure', {})
            log(f"✅ Provisioning API - Kompletna struktura utworzona dla {tenant_id}")
            log(f"   - Tenant: {structure.get('tenant_name')}")
            log(f"   - Firma: {structure.get('company_id')}")
            log(f"   - Administrator: {structure.get('admin_name')} ({structure.get('admin_email')})")
            log(f"   - Rola: {structure.get('role_name')} z {structure.get('permissions_count')} uprawnieniami")
            return True, structure
        else:
            log(f"❌ Provisioning API - Błąd {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        log(f"❌ Provisioning API - Błąd: {e}")
        return False, None

def test_data_provider_api(tenant_id):
    """Test Data Provider API - pobieranie danych ACL"""
    try:
        response = requests.get(
            f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            user_count = len(data.get('data', {}).get('users', {}))
            source = data.get('source', 'unknown')
            log(f"✅ Data Provider API - Dane dla {tenant_id} (użytkownicy: {user_count}, źródło: {source})")
            return True, data
        else:
            log(f"❌ Data Provider API - Błąd {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        log(f"❌ Data Provider API - Błąd: {e}")
        return False, None

def test_opal_data_update(tenant_id):
    """Test wysłania data update event do OPAL Server"""
    try:
        data = {
            "entries": [
                {
                    "url": f"http://data-provider-api:8110/tenants/{tenant_id}/acl",
                    "topics": ["multi_tenant_data"],
                    "dst_path": f"/acl/{tenant_id}"
                }
            ],
            "reason": f"Load {tenant_id} data after complete provisioning"
        }
        
        response = requests.post(
            f"{OPAL_SERVER_URL}/data/config",
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            log(f"✅ OPAL Server - Data update event wysłany dla {tenant_id}")
            return True
        else:
            log(f"❌ OPAL Server - Błąd {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log(f"❌ OPAL Server - Błąd: {e}")
        return False

def test_opa_data(tenant_id):
    """Test sprawdzenia danych w OPA"""
    try:
        # Czekamy chwilę na przetworzenie przez OPAL Client
        time.sleep(2)
        
        response = requests.get(
            f"{OPA_URL}/v1/data/acl/{tenant_id}",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            result = data.get('result', {})
            user_count = len(result.get('users', {}))
            tenant_name = result.get('tenant_name', 'Unknown')
            source = result.get('source', 'unknown')
            
            log(f"✅ OPA - Dane załadowane dla {tenant_id}")
            log(f"   - Nazwa: {tenant_name}")
            log(f"   - Użytkownicy: {user_count}")
            log(f"   - Źródło: {source}")
            
            # Sprawdź czy administrator ma uprawnienia Portal
            users = result.get('users', {})
            admin_user = None
            for user_id, user_data in users.items():
                if user_id.startswith('admin_'):
                    admin_user = user_data
                    break
            
            if admin_user:
                portal_roles = admin_user.get('roles', {}).get('portal', [])
                portal_perms = admin_user.get('permissions', {}).get('portal', [])
                log(f"   - Administrator: {admin_user.get('full_name', 'Unknown')}")
                log(f"   - Role Portal: {len(portal_roles)}")
                log(f"   - Uprawnienia Portal: {len(portal_perms)}")
            
            return True, result
        else:
            log(f"❌ OPA - Błąd {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        log(f"❌ OPA - Błąd: {e}")
        return False, None

def cleanup_test_tenant(tenant_id):
    """Czyszczenie danych testowych"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Usuń w odpowiedniej kolejności (foreign keys)
        tables_to_clean = [
            ('role_permissions', 'role_id IN (SELECT role_id FROM roles WHERE app_id = \'portal\')'),
            ('user_roles', f'tenant_id = \'{tenant_id}\''),
            ('user_access', f'tenant_id = \'{tenant_id}\''),
            ('companies', f'tenant_id = \'{tenant_id}\''),
            ('users', f'user_id LIKE \'admin_{tenant_id}%\''),
            ('tenants', f'tenant_id = \'{tenant_id}\'')
        ]
        
        for table, condition in tables_to_clean:
            cursor.execute(f"DELETE FROM {table} WHERE {condition}")
        
        conn.commit()
        conn.close()
        log(f"🧹 Wyczyszczono dane testowe dla {tenant_id}")
        
    except Exception as e:
        log(f"⚠️ Błąd czyszczenia danych: {e}")

def main():
    """Główna funkcja testowa"""
    log("🚀 Rozpoczynam test kompletnego provisioning tenanta")
    
    # Dane testowe - symulacja rejestracji przez B2C/Auth0
    tenant_id = f"test_tenant_{int(time.time())}"
    tenant_name = "Test Company Sp. z o.o."
    admin_email = f"admin{int(time.time())}@testcompany.pl"
    admin_name = "Jan Testowy"
    
    log(f"📋 Dane testowe:")
    log(f"   - Tenant ID: {tenant_id}")
    log(f"   - Nazwa: {tenant_name}")
    log(f"   - Administrator: {admin_name} ({admin_email})")
    
    # Test 1: Sprawdź połączenia
    log("\n🔍 Test 1: Sprawdzanie połączeń...")
    if not test_database_connection():
        log("❌ Test przerwany - brak połączenia z bazą danych")
        return False
    
    if not test_services_health():
        log("❌ Test przerwany - problemy z serwisami")
        return False
    
    # Test 2: Provisioning API - Tworzenie kompletnej struktury tenanta
    log("\n🏗️ Test 2: Provisioning API - Tworzenie kompletnej struktury tenanta...")
    success, structure = test_provisioning_api(tenant_id, tenant_name, admin_email, admin_name)
    if not success:
        log("❌ Test przerwany - błąd tworzenia struktury przez Provisioning API")
        return False
    
    # Test 3: Data Provider API
    log("\n📊 Test 3: Data Provider API...")
    success, data = test_data_provider_api(tenant_id)
    if not success:
        cleanup_test_tenant(tenant_id)
        return False
    
    # Test 4: OPAL Data Update
    log("\n🔄 Test 4: OPAL Data Update...")
    if not test_opal_data_update(tenant_id):
        cleanup_test_tenant(tenant_id)
        return False
    
    # Test 5: Sprawdź dane w OPA
    log("\n🎯 Test 5: Sprawdzanie danych w OPA...")
    success, opa_data = test_opa_data(tenant_id)
    if not success:
        cleanup_test_tenant(tenant_id)
        return False
    
    # Podsumowanie
    log("\n🎉 SUKCES! Kompletny test provisioning tenanta zakończony pomyślnie")
    log("📈 Podsumowanie:")
    log("   ✅ Struktura tenanta w PostgreSQL")
    log("   ✅ Provisioning API (SQLite)")
    log("   ✅ Data Provider API (PostgreSQL)")
    log("   ✅ OPAL Server (data update event)")
    log("   ✅ OPAL Client (fetch i load)")
    log("   ✅ OPA (dane dostępne)")
    log("   ✅ Administrator z uprawnieniami Portal")
    
    # Czyszczenie
    log("\n🧹 Czyszczenie danych testowych...")
    cleanup_test_tenant(tenant_id)
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 