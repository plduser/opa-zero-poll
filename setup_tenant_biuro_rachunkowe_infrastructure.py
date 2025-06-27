#!/usr/bin/env python3
"""
Setup infrastruktury dla TENANT_BIURO_RACHUNKOWE
===============================================

Biuro Rachunkowe "ProFinanse" Sp. z o.o.
- 40 firm klientów + 1 firma główna biura
- 7 użytkowników (właściciele + księgowi)
- 6 zespołów z logicznym podziałem uprawnień
- Specjalna logika: zespół "Wszyscy Księgowi" ma dostęp do wszystkich firm klientów,
  ale NIE do firmy głównej biura (ochrona danych finansowych biura)

Struktura zespołów:
1. Zarząd - pełny dostęp do wszystkich firm + aplikacji zarządczych
2. Główni Księgowi - dostęp do wszystkich firm + aplikacje księgowe zaawansowane
3. Księgowi KPIR - dostęp do firm KPIR + aplikacje podstawowe
4. Księgowi Spółki - dostęp do spółek + aplikacje zaawansowane
5. HR - dostęp do wszystkich firm + aplikacje kadrowe
6. Wszyscy Księgowi - dostęp do WSZYSTKICH firm klientów (bez firmy głównej)
   + BEZ dostępu do aplikacji (tylko dane firm)

Autor: AI Assistant
Data: 2024-12-26
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Konfiguracja API
PROVISIONING_API_URL = "http://localhost:8010"
DATA_PROVIDER_API_URL = "http://localhost:8110"
OPAL_SYNC_URL = "http://localhost:7002"

# Konfiguracja biura rachunkowego
TENANT_CONFIG = {
    "id": "tenant_biuro_rachunkowe",
    "name": "ProFinanse Biuro Rachunkowe Sp. z o.o.",
    "nip": "1234567890",
    "description": "Profesjonalne biuro rachunkowe obsługujące 40 firm klientów",
    "profile": "Biuro rachunkowe - kompleksowa obsługa księgowa",
    "users_count": 7,
    "teams_count": 6,
    "companies_count": 41  # 40 klientów + 1 firma główna
}

def log_message(message: str, level: str = "INFO") -> None:
    """Logowanie z timestampem"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    icons = {"INFO": "ℹ️", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️", "STEP": "🏗️"}
    print(f"[{timestamp}] {icons.get(level, '📝')} {message}")

def make_request(method: str, url: str, data: dict = None, params: dict = None) -> Tuple[bool, dict]:
    """Wykonuje żądanie HTTP z obsługą błędów"""
    try:
        headers = {"Content-Type": "application/json"}
        
        if method.upper() == "GET":
            response = requests.get(url, params=params, headers=headers, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=30)
        else:
            return False, {"error": f"Unsupported method: {method}"}
        
        if response.status_code in [200, 201]:
            try:
                return True, response.json()
            except:
                return True, {"message": "Success"}
        else:
            try:
                error_data = response.json()
            except:
                error_data = {"error": f"HTTP {response.status_code}"}
            return False, error_data
            
    except requests.exceptions.RequestException as e:
        return False, {"error": f"Request failed: {str(e)}"}

def create_tenant() -> bool:
    """Tworzy tenant biura rachunkowego"""
    log_message("Tworzenie tenanta...", "STEP")
    
    tenant_data = {
        "tenant_id": TENANT_CONFIG["id"],
        "tenant_name": TENANT_CONFIG["name"],
        "tenant_nip": TENANT_CONFIG["nip"],
        "description": TENANT_CONFIG["description"],
        "admin_email": "admin@profinanse.pl",
        "admin_name": "Administrator ProFinanse"
    }
    
    success, result = make_request("POST", f"{PROVISIONING_API_URL}/provision-tenant", tenant_data)
    
    if success:
        log_message(f"Tenant utworzony: {TENANT_CONFIG['name']}", "SUCCESS")
        return True
    else:
        if "already exists" in str(result.get("error", "")):
            log_message(f"Tenant już istnieje: {TENANT_CONFIG['name']}", "INFO")
            return True
        else:
            log_message(f"Błąd tworzenia tenanta: {result.get('error', 'Unknown error')}", "ERROR")
            return False

def create_companies() -> List[Dict]:
    """Tworzy firmę główną biura + 40 firm klientów"""
    log_message("Tworzenie firm...", "STEP")
    created_companies = []
    
    # Firma główna biura rachunkowego
    main_company = {
        "tenant_id": TENANT_CONFIG["id"],
        "company_id": "BIURO_MAIN",
        "company_name": "ProFinanse Biuro Rachunkowe Sp. z o.o.",
        "nip": "1234567890",
        "description": "Firma główna biura rachunkowego - dane wewnętrzne",
        "access_level": "manage"
    }
    
    success, result = make_request("POST", f"{DATA_PROVIDER_API_URL}/api/companies", main_company)
    if success:
        log_message("✅ Firma główna biura utworzona: ProFinanse Biuro Rachunkowe Sp. z o.o.", "SUCCESS")
        created_companies.append(main_company)
    else:
        if "already exists" in str(result.get("error", "")):
            log_message("ℹ️ Firma główna już istnieje: ProFinanse Biuro Rachunkowe Sp. z o.o.", "INFO")
            created_companies.append(main_company)
        else:
            log_message(f"Błąd tworzenia firmy głównej: {result.get('error', 'Unknown')}", "WARNING")
    
    # 40 firm klientów biura rachunkowego
    client_companies = [
        # Firmy KPIR (księga przychodów i rozchodów) - 20 firm
        {"id": "KPIR001", "name": "Warsztat Samochodowy Jan Kowalski", "nip": "1111111001", "type": "KPIR", "desc": "Naprawa samochodów osobowych"},
        {"id": "KPIR002", "name": "Fryzjerstwo Anna Nowak", "nip": "1111111002", "type": "KPIR", "desc": "Usługi fryzjerskie i kosmetyczne"},
        {"id": "KPIR003", "name": "Sklep Spożywczy Marek Wiśniewski", "nip": "1111111003", "type": "KPIR", "desc": "Handel detaliczny artykułami spożywczymi"},
        {"id": "KPIR004", "name": "Pizzeria Bella Vista", "nip": "1111111004", "type": "KPIR", "desc": "Gastronomia - pizza i dania włoskie"},
        {"id": "KPIR005", "name": "Usługi Remontowe Krzysztof Maj", "nip": "1111111005", "type": "KPIR", "desc": "Remonty mieszkań i domów"},
        {"id": "KPIR006", "name": "Taxi Premium Tomasz Król", "nip": "1111111006", "type": "KPIR", "desc": "Transport osobowy taxi"},
        {"id": "KPIR007", "name": "Gabinet Weterynaryjny Dr Zofia Lis", "nip": "1111111007", "type": "KPIR", "desc": "Opieka weterynaryjna"},
        {"id": "KPIR008", "name": "Centrum Fitness Adam Strong", "nip": "1111111008", "type": "KPIR", "desc": "Usługi fitness i siłownia"},
        {"id": "KPIR009", "name": "Kwiaciarnia Róża Maria Kwiat", "nip": "1111111009", "type": "KPIR", "desc": "Handel kwiatami i roślinami"},
        {"id": "KPIR010", "name": "Punkt Fotograficzny Obiektyw", "nip": "1111111010", "type": "KPIR", "desc": "Usługi fotograficzne"},
        {"id": "KPIR011", "name": "Instalacje Elektryczne Volt", "nip": "1111111011", "type": "KPIR", "desc": "Instalacje i naprawy elektryczne"},
        {"id": "KPIR012", "name": "Salon Masażu Relaks", "nip": "1111111012", "type": "KPIR", "desc": "Masaże i terapie manualne"},
        {"id": "KPIR013", "name": "Usługi Ogrodnicze Zielony Świat", "nip": "1111111013", "type": "KPIR", "desc": "Projektowanie i pielęgnacja ogrodów"},
        {"id": "KPIR014", "name": "Pracownia Krawiecka Elegancja", "nip": "1111111014", "type": "KPIR", "desc": "Szycie i przeróbki odzieży"},
        {"id": "KPIR015", "name": "Szkółka Jeździecka Konik", "nip": "1111111015", "type": "KPIR", "desc": "Nauka jazdy konnej"},
        {"id": "KPIR016", "name": "Biuro Tłumaczeń Lingua", "nip": "1111111016", "type": "KPIR", "desc": "Tłumaczenia pisemne i ustne"},
        {"id": "KPIR017", "name": "Zakład Stolarski Drewno Plus", "nip": "1111111017", "type": "KPIR", "desc": "Meble na wymiar"},
        {"id": "KPIR018", "name": "Centrum Dietetyczne Zdrowie", "nip": "1111111018", "type": "KPIR", "desc": "Porady dietetyczne"},
        {"id": "KPIR019", "name": "Usługi Pralnicze Clean Master", "nip": "1111111019", "type": "KPIR", "desc": "Pranie chemiczne i prasowanie"},
        {"id": "KPIR020", "name": "Autodetailing Premium Cars", "nip": "1111111020", "type": "KPIR", "desc": "Profesjonalne mycie samochodów"},
        
        # Spółki z o.o. i S.A. - 20 firm
        {"id": "SP001", "name": "TechnoSoft Solutions Sp. z o.o.", "nip": "2222222001", "type": "SP_ZOO", "desc": "Oprogramowanie dla biznesu"},
        {"id": "SP002", "name": "MediCare Plus S.A.", "nip": "2222222002", "type": "SA", "desc": "Prywatna opieka medyczna"},
        {"id": "SP003", "name": "GreenEnergy Sp. z o.o.", "nip": "2222222003", "type": "SP_ZOO", "desc": "Odnawialne źródła energii"},
        {"id": "SP004", "name": "LogiTrans S.A.", "nip": "2222222004", "type": "SA", "desc": "Transport i logistyka"},
        {"id": "SP005", "name": "FoodChain Sp. z o.o.", "nip": "2222222005", "type": "SP_ZOO", "desc": "Sieć restauracji"},
        {"id": "SP006", "name": "BuildMaster S.A.", "nip": "2222222006", "type": "SA", "desc": "Budownictwo mieszkaniowe"},
        {"id": "SP007", "name": "DigitalMark Sp. z o.o.", "nip": "2222222007", "type": "SP_ZOO", "desc": "Marketing cyfrowy"},
        {"id": "SP008", "name": "PharmaCorp S.A.", "nip": "2222222008", "type": "SA", "desc": "Dystrybucja farmaceutyków"},
        {"id": "SP009", "name": "AutoParts Plus Sp. z o.o.", "nip": "2222222009", "type": "SP_ZOO", "desc": "Części samochodowe"},
        {"id": "SP010", "name": "FinanceConsult S.A.", "nip": "2222222010", "type": "SA", "desc": "Doradztwo finansowe"},
        {"id": "SP011", "name": "EcoPackaging Sp. z o.o.", "nip": "2222222011", "type": "SP_ZOO", "desc": "Opakowania ekologiczne"},
        {"id": "SP012", "name": "SportEquip S.A.", "nip": "2222222012", "type": "SA", "desc": "Sprzęt sportowy"},
        {"id": "SP013", "name": "SmartHome Sp. z o.o.", "nip": "2222222013", "type": "SP_ZOO", "desc": "Inteligentne systemy domowe"},
        {"id": "SP014", "name": "AgroMax S.A.", "nip": "2222222014", "type": "SA", "desc": "Maszyny rolnicze"},
        {"id": "SP015", "name": "DesignStudio Sp. z o.o.", "nip": "2222222015", "type": "SP_ZOO", "desc": "Projektowanie wnętrz"},
        {"id": "SP016", "name": "CleanTech S.A.", "nip": "2222222016", "type": "SA", "desc": "Technologie oczyszczania"},
        {"id": "SP017", "name": "EventPro Sp. z o.o.", "nip": "2222222017", "type": "SP_ZOO", "desc": "Organizacja wydarzeń"},
        {"id": "SP018", "name": "SecureSystems S.A.", "nip": "2222222018", "type": "SA", "desc": "Systemy bezpieczeństwa"},
        {"id": "SP019", "name": "WaterTech Sp. z o.o.", "nip": "2222222019", "type": "SP_ZOO", "desc": "Uzdatnianie wody"},
        {"id": "SP020", "name": "MobileSoft S.A.", "nip": "2222222020", "type": "SA", "desc": "Aplikacje mobilne"}
    ]
    
    # Tworzenie firm klientów
    for company_data in client_companies:
        company_payload = {
            "tenant_id": TENANT_CONFIG["id"],
            "company_id": company_data["id"],
            "company_name": company_data["name"],
            "nip": company_data["nip"],
            "description": f"{company_data['desc']} | Typ: {company_data['type']}",
            "access_level": "manage"
        }
        
        success, result = make_request("POST", f"{DATA_PROVIDER_API_URL}/api/companies", company_payload)
        if success:
            log_message(f"✅ Firma klienta utworzona: {company_data['name']}", "SUCCESS")
            created_companies.append(company_payload)
        else:
            if "already exists" in str(result.get("error", "")):
                log_message(f"ℹ️ Firma już istnieje: {company_data['name']}", "INFO")
                created_companies.append(company_payload)
            else:
                log_message(f"⚠️ Błąd tworzenia firmy {company_data['name']}: {result.get('error', 'Unknown')}", "WARNING")
    
    log_message(f"Utworzono łącznie {len(created_companies)} firm", "INFO")
    return created_companies

def create_teams_and_assign_companies(companies: List[Dict]) -> List[Dict]:
    """Tworzy zespoły biura rachunkowego z przemyślaną logiką uprawnień"""
    log_message("Tworzenie zespołów...", "STEP")
    created_teams = []
    
    # Definicja zespołów biura rachunkowego
    teams_config = [
        {
            "name": "Zarząd",
            "department": "Zarząd",
            "description": "Zarząd biura rachunkowego - pełny dostęp do wszystkich firm i aplikacji",
            "company_access": "ALL_INCLUDING_MAIN",  # Wszystkie firmy + firma główna
            "applications": ["KSEF", "eBiuro", "eDeklaracje", "eDokumenty", "FK"]
        },
        {
            "name": "Główni Księgowi",
            "department": "Księgowość",
            "description": "Główni księgowi - nadzór nad wszystkimi firmami klientów + zaawansowane aplikacje",
            "company_access": "ALL_CLIENTS_ONLY",  # Wszystkie firmy klientów (bez firmy głównej)
            "applications": ["KSEF", "eBiuro", "eDeklaracje", "FK"]
        },
        {
            "name": "Księgowi KPIR",
            "department": "Księgowość",
            "description": "Księgowi specjalizujący się w księgach przychodów i rozchodów",
            "company_access": "KPIR_ONLY",  # Tylko firmy KPIR
            "applications": ["KSEF", "eDeklaracje"]
        },
        {
            "name": "Księgowi Spółki",
            "department": "Księgowość", 
            "description": "Księgowi obsługujący spółki z o.o. i S.A.",
            "company_access": "COMPANIES_ONLY",  # Tylko spółki (SP_ZOO, SA)
            "applications": ["KSEF", "eBiuro", "FK"]
        },
        {
            "name": "HR",
            "department": "Kadry",
            "description": "Zespół HR - dostęp do wszystkich firm w zakresie kadrowo-płacowym",
            "company_access": "ALL_CLIENTS_ONLY",  # Wszystkie firmy klientów (bez firmy głównej)
            "applications": ["eBiuro"]  # Tylko aplikacje kadrowe
        },
        {
            "name": "Wszyscy Księgowi",
            "department": "Księgowość",
            "description": "Wszyscy księgowi - dostęp do WSZYSTKICH firm klientów BEZ dostępu do aplikacji i BEZ firmy głównej",
            "company_access": "ALL_CLIENTS_ONLY",  # Wszystkie firmy klientów (bez firmy głównej)
            "applications": []  # BEZ dostępu do aplikacji - tylko dane firm
        }
    ]
    
    for team_config in teams_config:
        # Tworzenie zespołu
        team_data = {
            "tenant_id": TENANT_CONFIG["id"],
            "team_name": team_config["name"],
            "department": team_config["department"],
            "description": team_config["description"]
        }
        
        success, result = make_request("POST", f"{DATA_PROVIDER_API_URL}/api/teams", team_data)
        if success:
            team_id = result.get("team_id")
            log_message(f"✅ Zespół utworzony: {team_config['name']} (ID: {team_id})", "SUCCESS")
            
            # Przypisywanie firm do zespołu według logiki biznesowej
            assigned_companies = assign_companies_to_team(team_id, team_config, companies)
            
            team_info = {
                "id": team_id,
                "name": team_config["name"],
                "department": team_config["department"],
                "description": team_config["description"],
                "company_access": team_config["company_access"],
                "applications": team_config["applications"],
                "assigned_companies": assigned_companies
            }
            created_teams.append(team_info)
            
        else:
            log_message(f"❌ Błąd tworzenia zespołu {team_config['name']}: {result.get('error', 'Unknown')}", "ERROR")
    
    return created_teams

def assign_companies_to_team(team_id: str, team_config: Dict, companies: List[Dict]) -> List[str]:
    """Przypisuje firmy do zespołu według logiki biznesowej"""
    assigned_companies = []
    
    for company in companies:
        should_assign = False
        company_name = company["company_name"]
        company_id = company["company_id"]
        
        # Logika przypisywania firm według typu zespołu
        if team_config["company_access"] == "ALL_INCLUDING_MAIN":
            # Zarząd - wszystkie firmy włącznie z firmą główną
            should_assign = True
            
        elif team_config["company_access"] == "ALL_CLIENTS_ONLY":
            # Wszystkie firmy klientów, ale BEZ firmy głównej biura
            should_assign = company_id != "BIURO_MAIN"
            
        elif team_config["company_access"] == "KPIR_ONLY":
            # Tylko firmy KPIR
            should_assign = company_id.startswith("KPIR")
            
        elif team_config["company_access"] == "COMPANIES_ONLY":
            # Tylko spółki (SP_ZOO, SA)
            should_assign = company_id.startswith("SP")
        
        if should_assign:
            # Przypisanie zespołu do firmy
            assignment_data = {
                "team_id": team_id,
                "company_id": company_id
            }
            
            success, result = make_request("POST", f"{DATA_PROVIDER_API_URL}/api/teams/{team_id}/companies", assignment_data)
            if success:
                assigned_companies.append(company_name)
            else:
                log_message(f"❌ Błąd przypisania zespołu {team_config['name']} do firmy {company_name}: {result.get('error', 'Unknown')}", "WARNING")
    
    log_message(f"🔗 Zespół '{team_config['name']}' przypisany do {len(assigned_companies)} firm", "INFO")
    return assigned_companies

def print_final_summary(teams: List[Dict], companies: List[Dict]) -> None:
    """Wyświetla szczegółowe podsumowanie utworzonej infrastruktury"""
    log_message("SUKCES! Setup infrastruktury TENANT_BIURO_RACHUNKOWE zakończony", "SUCCESS")
    log_message("📈 Utworzone elementy:", "INFO")
    log_message(f"   ✅ Tenant: {TENANT_CONFIG['name']}", "INFO")
    log_message(f"   ✅ Firmy: {len(companies)}", "INFO")
    log_message(f"   ✅ Zespoły: {len(teams)}", "INFO")
    
    print()
    log_message("🏢 Struktura firm biura rachunkowego:", "INFO")
    
    # Firma główna
    main_company = [c for c in companies if c["company_id"] == "BIURO_MAIN"]
    if main_company:
        log_message(f"   🏦 FIRMA GŁÓWNA: {main_company[0]['company_name']}", "INFO")
        log_message(f"      Dostęp tylko dla Zarządu - ochrona danych finansowych biura", "INFO")
    
    # Firmy KPIR
    kpir_companies = [c for c in companies if c["company_id"].startswith("KPIR")]
    log_message(f"   📊 FIRMY KPIR ({len(kpir_companies)}): Księga przychodów i rozchodów", "INFO")
    for company in kpir_companies[:3]:  # Pokazuj tylko pierwsze 3
        log_message(f"      - {company['company_name']} ({company['company_id']})", "INFO")
    if len(kpir_companies) > 3:
        log_message(f"      ... i {len(kpir_companies)-3} innych firm KPIR", "INFO")
    
    # Spółki
    sp_companies = [c for c in companies if c["company_id"].startswith("SP")]
    log_message(f"   🏢 SPÓŁKI ({len(sp_companies)}): Sp. z o.o. i S.A.", "INFO")
    for company in sp_companies[:3]:  # Pokazuj tylko pierwsze 3
        log_message(f"      - {company['company_name']} ({company['company_id']})", "INFO")
    if len(sp_companies) > 3:
        log_message(f"      ... i {len(sp_companies)-3} innych spółek", "INFO")
    
    print()
    log_message("👥 Struktura zespołów i uprawnień:", "INFO")
    
    for team in teams:
        log_message(f"   - {team['name']} ({team['department']}) - ID: {team['id']}", "INFO")
        log_message(f"     {team['description']}", "INFO")
        log_message(f"     📊 Firmy: {len(team['assigned_companies'])} | 🚀 Aplikacje: {', '.join(team['applications']) if team['applications'] else 'BRAK'}", "INFO")
        
        # Specjalne oznaczenia dla zespołów
        if team['name'] == "Wszyscy Księgowi":
            log_message(f"     🔒 SPECJALNE: Dostęp do firm BEZ aplikacji + BEZ firmy głównej", "WARNING")
        elif team['name'] == "Zarząd":
            log_message(f"     🔑 PEŁNY DOSTĘP: Wszystkie firmy + firma główna + wszystkie aplikacje", "INFO")
    
    print()
    log_message("🔐 Logika uprawnień biura rachunkowego:", "INFO")
    log_message("   1. ZARZĄD - pełny dostęp do wszystkich firm (w tym firmy głównej) + wszystkie aplikacje", "INFO")
    log_message("   2. GŁÓWNI KSIĘGOWI - wszystkie firmy klientów + zaawansowane aplikacje księgowe", "INFO")
    log_message("   3. KSIĘGOWI KPIR - tylko firmy KPIR + podstawowe aplikacje", "INFO")
    log_message("   4. KSIĘGOWI SPÓŁKI - tylko spółki + zaawansowane aplikacje", "INFO")
    log_message("   5. HR - wszystkie firmy klientów + aplikacje kadrowe", "INFO")
    log_message("   6. WSZYSCY KSIĘGOWI - wszystkie firmy klientów (bez głównej) + BEZ aplikacji", "INFO")
    
    print()
    log_message("🚀 Następne kroki:", "INFO")
    log_message("   1. Dodaj 7 użytkowników:", "INFO")
    log_message("      - Właściciel biura (zarząd)", "INFO")
    log_message("      - 2 głównych księgowych", "INFO")
    log_message("      - 2 księgowych KPIR", "INFO")
    log_message("      - 1 księgowy spółki", "INFO")
    log_message("      - 1 specjalista HR", "INFO")
    log_message("   2. Przypisz użytkowników do odpowiednich zespołów", "INFO")
    log_message("   3. Skonfiguruj profile aplikacji dla zespołów", "INFO")
    log_message("   4. Przetestuj segregację dostępu (szczególnie ochronę firmy głównej)", "INFO")
    log_message("   5. Synchronizuj dane z OPA przez OPAL", "INFO")

def main():
    """Główna funkcja setup infrastruktury biura rachunkowego"""
    print("🚀 Rozpoczynam setup infrastruktury TENANT_BIURO_RACHUNKOWE")
    log_message(f"📋 Tenant: {TENANT_CONFIG['name']} ({TENANT_CONFIG['id']})", "INFO")
    log_message(f"👔 Zespoły: {TENANT_CONFIG['teams_count']}", "INFO")
    log_message(f"🏢 Firmy: {TENANT_CONFIG['companies_count']} (1 główna + 40 klientów)", "INFO")
    log_message(f"🎯 Profil: {TENANT_CONFIG['profile']}", "INFO")
    print()
    
    try:
        # Krok 1: Tworzenie tenanta
        if not create_tenant():
            log_message("Nie udało się utworzyć tenanta. Przerywam setup.", "ERROR")
            return False
        
        # Krok 2: Tworzenie firm
        companies = create_companies()
        if not companies:
            log_message("Nie udało się utworzyć firm. Przerywam setup.", "ERROR")
            return False
        
        # Krok 3: Tworzenie zespołów i przypisywanie firm
        teams = create_teams_and_assign_companies(companies)
        if not teams:
            log_message("Nie udało się utworzyć zespołów. Przerywam setup.", "ERROR")
            return False
        
        # Podsumowanie końcowe
        print()
        print("="*80)
        print_final_summary(teams, companies)
        print("="*80)
        
        log_message("✅ Setup infrastruktury TENANT_BIURO_RACHUNKOWE zakończony pomyślnie!", "SUCCESS")
        return True
        
    except Exception as e:
        log_message(f"❌ Nieprzewidziany błąd podczas setup: {str(e)}", "ERROR")
        return False

if __name__ == "__main__":
    main() 