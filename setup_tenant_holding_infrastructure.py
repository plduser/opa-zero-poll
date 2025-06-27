#!/usr/bin/env python3
"""
Setup infrastruktury dla TENANT_HOLDING (Europa Holdings S.A.)
- Duży holding z wieloma firmami
- Centralizowane zespoły obsługujące wiele spółek
- Hierarchiczna struktura organizacyjna
"""

import requests
import json
import time

# Konfiguracja API
PROVISIONING_API_URL = "http://localhost:8010"
DATA_PROVIDER_API_URL = "http://localhost:8110"

# Konfiguracja TENANT_HOLDING
TENANT_CONFIG = {
    "tenant_id": "tenant_holding",
    "tenant_name": "Europa Holdings S.A.",
    "admin_email": "prezes@europaholdings.test.pl",
    "admin_name": "Marek Nowicki",
    "teams": [
        {
            "name": "Zarząd Holdingu",
            "description": "Zarząd naczelny holdingu",
            "department": "Zarząd",
            "role_mapping": "Prezes/Wiceprezes"
        },
        {
            "name": "Centrum Usług Wspólnych - Księgowość",
            "description": "Centralna księgowość dla wszystkich spółek",
            "department": "Księgowość",
            "role_mapping": "Główny Księgowy"
        },
        {
            "name": "Centrum Usług Wspólnych - Kadry",
            "description": "Centralne zarządzanie kadrami",
            "department": "Kadry", 
            "role_mapping": "Dyrektor HR"
        },
        {
            "name": "Centrum Usług Wspólnych - IT",
            "description": "Centralny zespół informatyczny",
            "department": "IT",
            "role_mapping": "Dyrektor IT"
        },
        {
            "name": "Audyt Wewnętrzny",
            "description": "Kontrola i audyt wewnętrzny",
            "department": "Audyt",
            "role_mapping": "Audytor"
        },
        {
            "name": "Compliance i Prawo",
            "description": "Zgodność prawna i obsługa prawna",
            "department": "Prawo",
            "role_mapping": "Radca Prawny"
        },
        {
            "name": "Controlling Holdingu",
            "description": "Kontroling i planowanie finansowe",
            "department": "Finanse",
            "role_mapping": "Controller"
        },
        {
            "name": "Spółka A - Zespół Operacyjny",
            "description": "Lokalny zespół operacyjny Spółki A",
            "department": "Operacje",
            "role_mapping": "Manager Operacyjny"
        },
        {
            "name": "Spółka B - Zespół Operacyjny", 
            "description": "Lokalny zespół operacyjny Spółki B",
            "department": "Operacje",
            "role_mapping": "Manager Operacyjny"
        },
        {
            "name": "Spółka C - Zespół Operacyjny",
            "description": "Lokalny zespół operacyjny Spółki C",
            "department": "Operacje", 
            "role_mapping": "Manager Operacyjny"
        }
    ],
    "companies": [
        {
            "company_id": "company_holding_glowna",
            "company_name": "Europa Holdings S.A.",
            "company_code": "HOLD001",
            "description": "Spółka dominująca holdingu",
            "access_type": "manage"
        },
        {
            "company_id": "company_holding_spol_a",
            "company_name": "Europa Produkcja Sp. z o.o.",
            "company_code": "HOLD002",
            "description": "Spółka zależna - produkcja",
            "access_type": "manage"
        },
        {
            "company_id": "company_holding_spol_b",
            "company_name": "Europa Usługi S.A.",
            "company_code": "HOLD003", 
            "description": "Spółka zależna - usługi",
            "access_type": "manage"
        },
        {
            "company_id": "company_holding_spol_c",
            "company_name": "Europa Handel Sp. z o.o.",
            "company_code": "HOLD004",
            "description": "Spółka zależna - handel",
            "access_type": "manage"
        },
        {
            "company_id": "company_holding_nieruchomosci",
            "company_name": "Europa Nieruchomości S.A.",
            "company_code": "HOLD005",
            "description": "Spółka zależna - nieruchomości",
            "access_type": "view"
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
                "environment": "test",
                "company_size": "enterprise",
                "industry": "holding",
                "structure": "multi_company"
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

def assign_teams_to_companies_smart():
    """Inteligentne przypisanie zespołów do firm według logiki biznesowej"""
    
    # Mapowanie zespołów do firm
    team_company_mapping = {
        # Zespoły holdingowe - dostęp do wszystkich firm
        "Zarząd Holdingu": "all_companies",
        "Centrum Usług Wspólnych - Księgowość": "all_companies", 
        "Centrum Usług Wspólnych - Kadry": "all_companies",
        "Centrum Usług Wspólnych - IT": "all_companies",
        "Audyt Wewnętrzny": "all_companies",
        "Compliance i Prawo": "all_companies",
        "Controlling Holdingu": "all_companies",
        
        # Zespoły lokalne - tylko do swoich firm
        "Spółka A - Zespół Operacyjny": ["company_holding_spol_a"],
        "Spółka B - Zespół Operacyjny": ["company_holding_spol_b"], 
        "Spółka C - Zespół Operacyjny": ["company_holding_spol_c"]
    }
    
    return team_company_mapping

def main():
    """Główna funkcja setupu infrastruktury"""
    log("🚀 Rozpoczynam setup infrastruktury TENANT_HOLDING")
    log(f"📋 Tenant: {TENANT_CONFIG['tenant_name']} ({TENANT_CONFIG['tenant_id']})")
    log(f"👔 Zespoły: {len(TENANT_CONFIG['teams'])}")
    log(f"🏢 Firmy: {len(TENANT_CONFIG['companies'])}")
    log("🎯 Profil: Duży holding - struktura korporacyjna")
    
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
    
    # Krok 3: Utworzenie zespołów
    log("\n👥 Krok 3: Tworzenie zespołów...")
    created_teams = {}
    
    for team_config in TENANT_CONFIG["teams"]:
        success, team_id = create_team(team_config)
        if success and team_id:
            created_teams[team_config["name"]] = (team_id, team_config)
        else:
            log(f"❌ Setup przerwany - błąd tworzenia zespołu {team_config['name']}")
            return False
    
    # Krok 4: Inteligentne przypisanie zespołów do firm
    log("\n🔗 Krok 4: Przypisywanie zespołów do firm...")
    team_company_mapping = assign_teams_to_companies_smart()
    
    for team_name, company_assignment in team_company_mapping.items():
        if team_name in created_teams:
            team_id, team_config = created_teams[team_name]
            
            if company_assignment == "all_companies":
                # Przypisz do wszystkich firm
                for company_config in TENANT_CONFIG["companies"]:
                    assign_success = assign_team_to_company(team_id, company_config)
                    if assign_success:
                        log(f"   ✅ {team_name} → {company_config['company_name']}")
            else:
                # Przypisz do konkretnych firm
                for company_id in company_assignment:
                    company_config = next((c for c in TENANT_CONFIG["companies"] if c["company_id"] == company_id), None)
                    if company_config:
                        assign_success = assign_team_to_company(team_id, company_config)
                        if assign_success:
                            log(f"   ✅ {team_name} → {company_config['company_name']}")
    
    # Podsumowanie
    log("\n🎉 SUKCES! Setup infrastruktury TENANT_HOLDING zakończony")
    log("📈 Utworzone elementy:")
    log(f"   ✅ Tenant: {TENANT_CONFIG['tenant_name']}")
    log(f"   ✅ Firmy: {len(TENANT_CONFIG['companies'])}")
    log(f"   ✅ Zespoły: {len(created_teams)}")
    
    log("\n🏢 Struktura holdingu - firmy:")
    for company_config in TENANT_CONFIG["companies"]:
        log(f"   - {company_config['company_name']} ({company_config['company_code']})")
        log(f"     {company_config['description']} | Access: {company_config['access_type']}")
    
    log("\n👥 Struktura organizacyjna - zespoły:")
    for team_name, (team_id, team_config) in created_teams.items():
        log(f"   - {team_config['name']} ({team_config['department']}) - ID: {team_id}")
        log(f"     {team_config['description']}")
    
    log("\n🔗 Mapowanie zespołów do firm:")
    team_company_mapping = assign_teams_to_companies_smart()
    for team_name, company_assignment in team_company_mapping.items():
        if company_assignment == "all_companies":
            log(f"   - {team_name}: WSZYSTKIE FIRMY (centralna funkcja)")
        else:
            companies = [next((c["company_name"] for c in TENANT_CONFIG["companies"] if c["company_id"] == comp_id), comp_id) for comp_id in company_assignment]
            log(f"   - {team_name}: {', '.join(companies)}")
    
    log("\n🚀 Następne kroki:")
    log("   1. Dodaj użytkowników:")
    log("      - Marek Nowicki (prezes) - do zespołu 'Zarząd Holdingu'")
    log("      - Dyrektorzy CUW - do zespołów centrum usług wspólnych")
    log("      - Managerowie operacyjni - do zespołów lokalnych spółek")
    log("   2. Skonfiguruj hierarchię uprawnień (zarząd > dyrektorzy > managerowie)")
    log("   3. Ustaw uprawnienia aplikacji dla struktury holdingowej")
    log("   4. Przetestuj autoryzację między-spółkową w OPA")
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Setup infrastruktury TENANT_HOLDING zakończony pomyślnie!")
    else:
        print("\n❌ Setup infrastruktury TENANT_HOLDING nieudany!") 