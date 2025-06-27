#!/usr/bin/env python3
"""
Setup infrastruktury dla TENANT_MEDIUM (InnovateTech S.A.)
- Zespoły
- Firmy  
- Bez użytkowników (można dodać ręcznie)
"""

import requests
import json
import time

# Konfiguracja API
PROVISIONING_API_URL = "http://localhost:8010"
DATA_PROVIDER_API_URL = "http://localhost:8110"

# Konfiguracja TENANT_MEDIUM
TENANT_CONFIG = {
    "tenant_id": "tenant_duza_firma",
    "tenant_name": "InnovateTech S.A.",
    "admin_email": "admin@duza_firma.test.pl",
    "admin_name": "Robert Kowalczyk",
    "teams": [
        {
            "name": "Księgowość",
            "description": "Zespół księgowości i finansów",
            "department": "Księgowość",
            "role_mapping": "Księgowy"
        },
        {
            "name": "Kadry", 
            "description": "Zespół zarządzania kadrami",
            "department": "Kadry",
            "role_mapping": "Specjalista HR"
        },
        {
            "name": "Sales & Marketing",
            "description": "Zespół sprzedaży i marketingu", 
            "department": "Sprzedaż",
            "role_mapping": "Specjalista Sprzedaży"
        },
        {
            "name": "IT",
            "description": "Zespół informatyczny",
            "department": "IT", 
            "role_mapping": "Administrator IT"
        },
        {
            "name": "Zarząd",
            "description": "Zespół zarządzający",
            "department": "Zarząd",
            "role_mapping": "Dyrektor"
        }
    ],
    "companies": [
        {
            "company_id": "company_tenant_duza_firma",
            "company_name": "InnovateTech S.A.",
            "company_code": "INNO001",
            "description": "Główna firma InnovateTech S.A.",
            "access_type": "manage"
        }
    ]
}

def log(message):
    """Logger z timestampem"""
    timestamp = time.strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def create_tenant():
    """Utworzenie tenanta w Provisioning API"""
    try:
        data = {
            "tenant_id": TENANT_CONFIG["tenant_id"],
            "tenant_name": TENANT_CONFIG["tenant_name"],
            "admin_email": TENANT_CONFIG["admin_email"],
            "admin_name": TENANT_CONFIG["admin_name"],
            "metadata": {
                "created_by": "infrastructure_setup",
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
            log(f"✅ Tenant utworzony: {TENANT_CONFIG['tenant_name']}")
            return True, result
        elif response.status_code == 409:
            log(f"ℹ️ Tenant już istnieje: {TENANT_CONFIG['tenant_name']}")
            return True, None
        else:
            log(f"❌ Błąd tworzenia tenanta {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        log(f"❌ Błąd tworzenia tenanta: {e}")
        return False, None

def create_team(team_config):
    """Utworzenie zespołu"""
    try:
        data = {
            "tenant_id": TENANT_CONFIG["tenant_id"],
            "team_name": team_config["name"],
            "description": team_config["description"],
            "metadata": {
                "department": team_config["department"],
                "role_mapping": team_config["role_mapping"]
            }
        }
        
        response = requests.post(
            f"{DATA_PROVIDER_API_URL}/api/teams",
            json=data,
            timeout=10
        )
        
        if response.status_code == 201:
            result = response.json()
            team_id = result.get("team", {}).get("team_id")
            log(f"✅ Zespół utworzony: {team_config['name']} (ID: {team_id})")
            return True, team_id
        else:
            log(f"❌ Błąd tworzenia zespołu {team_config['name']}: {response.status_code} - {response.text}")
            return False, None
            
    except Exception as e:
        log(f"❌ Błąd tworzenia zespołu {team_config['name']}: {e}")
        return False, None

def create_company(company_config):
    """Utworzenie firmy"""
    try:
        data = {
            "tenant_id": TENANT_CONFIG["tenant_id"],
            "company_id": company_config["company_id"],
            "company_name": company_config["company_name"],
            "company_code": company_config["company_code"],
            "description": company_config["description"],
            "status": "active"
        }
        
        response = requests.post(
            f"{DATA_PROVIDER_API_URL}/api/companies",
            json=data,
            timeout=10
        )
        
        if response.status_code == 201:
            result = response.json()
            log(f"✅ Firma utworzona: {company_config['company_name']}")
            return True, result
        elif response.status_code == 409:
            log(f"ℹ️ Firma już istnieje: {company_config['company_name']}")
            return True, None
        else:
            log(f"❌ Błąd tworzenia firmy {company_config['company_name']}: {response.status_code} - {response.text}")
            return False, None
            
    except Exception as e:
        log(f"❌ Błąd tworzenia firmy {company_config['company_name']}: {e}")
        return False, None

def assign_team_to_company(team_id, company_config):
    """Przypisanie zespołu do firmy"""
    try:
        data = {
            "company_id": company_config["company_id"],
            "access_type": company_config["access_type"]
        }
        
        response = requests.post(
            f"{DATA_PROVIDER_API_URL}/api/teams/{team_id}/companies",
            json=data,
            timeout=10
        )
        
        if response.status_code == 201:
            log(f"✅ Zespół przypisany do firmy: {company_config['company_name']}")
            return True
        else:
            log(f"❌ Błąd przypisania zespołu do firmy: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        log(f"❌ Błąd przypisania zespołu do firmy: {e}")
        return False

def main():
    """Główna funkcja setupu infrastruktury"""
    log("🚀 Rozpoczynam setup infrastruktury TENANT_MEDIUM")
    log(f"📋 Tenant: {TENANT_CONFIG['tenant_name']} ({TENANT_CONFIG['tenant_id']})")
    log(f"👔 Zespoły: {len(TENANT_CONFIG['teams'])}")
    log(f"🏢 Firmy: {len(TENANT_CONFIG['companies'])}")
    
    # Krok 1: Utworzenie tenanta
    log("\n🏗️ Krok 1: Tworzenie tenanta...")
    success, tenant_result = create_tenant()
    if not success:
        log("❌ Setup przerwany - błąd tworzenia tenanta")
        return False
    
    # Krok 2: Utworzenie firm
    log("\n🏢 Krok 2: Tworzenie firm...")
    for company_config in TENANT_CONFIG["companies"]:
        success, company_result = create_company(company_config)
        if not success:
            log(f"❌ Setup przerwany - błąd tworzenia firmy {company_config['company_name']}")
            return False
    
    # Krok 3: Utworzenie zespołów i przypisanie do firm
    log("\n👥 Krok 3: Tworzenie zespołów...")
    created_teams = []
    
    for team_config in TENANT_CONFIG["teams"]:
        success, team_id = create_team(team_config)
        if success and team_id:
            created_teams.append((team_id, team_config))
            
            # Przypisz zespół do głównej firmy
            for company_config in TENANT_CONFIG["companies"]:
                assign_success = assign_team_to_company(team_id, company_config)
                if not assign_success:
                    log(f"⚠️ Błąd przypisania zespołu {team_config['name']} do firmy {company_config['company_name']}")
        else:
            log(f"❌ Setup przerwany - błąd tworzenia zespołu {team_config['name']}")
            return False
    
    # Podsumowanie
    log("\n🎉 SUKCES! Setup infrastruktury TENANT_MEDIUM zakończony")
    log("📈 Utworzone elementy:")
    log(f"   ✅ Tenant: {TENANT_CONFIG['tenant_name']}")
    log(f"   ✅ Firmy: {len(TENANT_CONFIG['companies'])}")
    log(f"   ✅ Zespoły: {len(created_teams)}")
    
    log("\n📝 Zespoły utworzone:")
    for team_id, team_config in created_teams:
        log(f"   - {team_config['name']} ({team_config['department']}) - ID: {team_id}")
    
    log("\n🚀 Następne kroki:")
    log("   1. Dodaj użytkowników ręcznie przez portal lub API")
    log("   2. Przypisz użytkowników do zespołów")
    log("   3. Skonfiguruj uprawnienia dla aplikacji")
    log("   4. Przetestuj autoryzację OPA")
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Setup infrastruktury zakończony pomyślnie!")
    else:
        print("\n❌ Setup infrastruktury nieudany!") 