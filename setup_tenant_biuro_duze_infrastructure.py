#!/usr/bin/env python3
"""
🏢 SETUP TENANT: Expert Tax Duże Biuro Rachunkowe
================================================

Najbardziej wymagająca konfiguracja - duże biuro rachunkowe z:
- 200 firm klienckich (150 mikro + 50 spółek)  
- 30 użytkowników w 6 zespołach specjalistycznych
- Złożone wzorce dostępów i uprawnień

Struktura zespołów (zgodnie z PRD):
1. Zarząd (3 osoby) - Dostęp do wszystkich 200 firm
2. Główni Księgowi (5 osób) - Dostęp do wszystkich 200 firm  
3. Księgowi - KPIR (10 osób) - Dostęp do 150 mikro firm
4. Księgowi - Spółki (7 osób) - Dostęp do 50 spółek
5. HR (5 osób) - Dostęp do 30 spółek z umową kadrową
6. Wszyscy Księgowi - grupa nadrzędna

✅ Oparte na przetestowanych API:
- Data Provider API (8110) - firmy, użytkownicy
- Portal API (3000) - zespoły, przypisania
"""

import requests
import json
import random
import time
from typing import List, Dict, Tuple

# Konfiguracja
TENANT_ID = "tenant_biuro_rachunkowe"
TENANT_NAME = "Expert Tax Duże Biuro Rachunkowe Sp. z o.o."
DATA_PROVIDER_API = "http://localhost:8110/api"
PORTAL_API = "http://localhost:3000/api"

def log_action(action: str, status: str = "INFO", details: str = ""):
    """Logger z ikonami dla lepszej czytelności"""
    icons = {"INFO": "ℹ️", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️"}
    print(f"{icons.get(status, 'ℹ️')} {action}")
    if details:
        print(f"   {details}")

def get_teams() -> Dict[str, str]:
    """Pobiera mapowanie nazw zespołów na ID"""
    try:
        response = requests.get(f"{PORTAL_API}/teams?tenant_id={TENANT_ID}")
        if response.status_code == 200:
            teams_data = response.json()
            teams_map = {}
            for team in teams_data.get('teams', []):
                teams_map[team['team_name']] = team['team_id']
            log_action(f"Pobrano {len(teams_map)} zespołów", "SUCCESS")
            return teams_map
        else:
            log_action(f"Błąd pobierania zespołów: {response.status_code}", "ERROR")
            return {}
    except Exception as e:
        log_action(f"Wyjątek przy pobieraniu zespołów: {e}", "ERROR")
        return {}

def create_company(company_data: Dict) -> str:
    """Tworzy firmę w systemie przez Data Provider API"""
    try:
        response = requests.post(f"{DATA_PROVIDER_API}/companies", json=company_data)
        if response.status_code in [200, 201]:
            result = response.json()
            company_id = result.get('company', {}).get('company_id')
            log_action(f"Utworzono firmę: {company_data['company_name']}", "SUCCESS", f"ID: {company_id}")
            return company_id
        elif response.status_code == 409:
            log_action(f"Firma już istnieje: {company_data['company_name']}", "WARNING")
            return None
        else:
            log_action(f"Błąd tworzenia firmy {company_data['company_name']}: {response.status_code}", "ERROR", response.text)
            return None
    except Exception as e:
        log_action(f"Wyjątek przy tworzeniu firmy {company_data['company_name']}: {e}", "ERROR")
        return None

def create_user(user_data: Dict) -> str:
    """Tworzy użytkownika w systemie przez Data Provider API"""
    try:
        headers = {
            "Content-Type": "application/json",
            "X-Tenant-ID": TENANT_ID  # KLUCZOWE dla przypisania do tenanta
        }
        response = requests.post(f"{DATA_PROVIDER_API}/users", json=user_data, headers=headers)
        if response.status_code in [200, 201]:
            result = response.json()
            user_id = result.get('user', {}).get('user_id')
            log_action(f"Utworzono użytkownika: {user_data['username']}", "SUCCESS", f"ID: {user_id}")
            return user_id
        elif response.status_code == 409:
            log_action(f"Użytkownik już istnieje: {user_data['username']}", "WARNING") 
            return None
        else:
            log_action(f"Błąd tworzenia użytkownika {user_data['username']}: {response.status_code}", "ERROR", response.text)
            return None
    except Exception as e:
        log_action(f"Wyjątek przy tworzeniu użytkownika {user_data['username']}: {e}", "ERROR")
        return None

def assign_user_to_team(team_id: str, user_id: str, role: str = "member") -> bool:
    """Przypisuje użytkownika do zespołu przez Portal API"""
    try:
        assignment_data = {
            "user_id": user_id,
            "role_in_team": role
        }
        response = requests.post(f"{PORTAL_API}/teams/{team_id}/members", json=assignment_data)
        if response.status_code in [200, 201]:
            log_action(f"Przypisano {user_id} do zespołu jako {role}", "SUCCESS")
            return True
        elif response.status_code == 409:
            log_action(f"Użytkownik {user_id} już jest w zespole", "WARNING")
            return True
        else:
            log_action(f"Błąd przypisania użytkownika {user_id} do zespołu: {response.status_code}", "ERROR", response.text)
            return False
    except Exception as e:
        log_action(f"Wyjątek przy przypisaniu użytkownika {user_id} do zespołu: {e}", "ERROR")
        return False

def assign_team_to_company(team_id: str, company_id: str, access_type: str = "admin") -> bool:
    """Przypisuje zespół do firmy przez Data Provider API"""
    try:
        assignment_data = {
            "company_id": company_id,
            "access_type": access_type  # view, edit, manage, admin
        }
        response = requests.post(f"{DATA_PROVIDER_API}/teams/{team_id}/companies", json=assignment_data)
        if response.status_code in [200, 201]:
            log_action(f"Przypisano zespół do firmy {company_id}", "SUCCESS")
            return True
        elif response.status_code == 409:
            log_action(f"Zespół już ma dostęp do firmy {company_id}", "WARNING")
            return True
        else:
            log_action(f"Błąd przypisania zespołu do firmy {company_id}: {response.status_code}", "ERROR", response.text)
            return False
    except Exception as e:
        log_action(f"Wyjątek przy przypisaniu zespołu do firmy {company_id}: {e}", "ERROR")
        return False

def generate_polish_names() -> List[Tuple[str, str]]:
    """Generuje listę polskich imion i nazwisk"""
    imiona = [
        "Adam", "Agnieszka", "Aleksandra", "Anna", "Bartosz", "Beata", "Damian", "Diana",
        "Ewa", "Filip", "Grzegorz", "Hanna", "Irena", "Jan", "Joanna", "Kamil", "Katarzyna",
        "Łukasz", "Magdalena", "Marcin", "Maria", "Mateusz", "Michał", "Natalia", "Oskar",
        "Patrycja", "Paweł", "Piotr", "Robert", "Sylwia", "Tomasz", "Urszula", "Wiktoria"
    ]
    
    nazwiska = [
        "Kowalski", "Nowak", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski",
        "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Jankowski", "Mazur",
        "Krawczyk", "Kaczmarek", "Piotrowski", "Grabowski", "Nowakowski", "Pawłowski",
        "Michalski", "Nowicki", "Adamczyk", "Dudek", "Zajęc", "Wieczorek", "Jabłoński",
        "Król", "Majewski", "Olszewski", "Jaworski", "Stępień", "Malinowski", "Pawlak"
    ]
    
    names = []
    used_combinations = set()
    
    for i in range(50):  # Więcej niż potrzeba
        while True:
            imie = random.choice(imiona)
            nazwisko = random.choice(nazwiska)
            combination = (imie, nazwisko)
            if combination not in used_combinations:
                used_combinations.add(combination)
                names.append(combination)
                break
    
    return names

def main():
    """Główna funkcja setupu"""
    log_action("🚀 Rozpoczynanie setupu Expert Tax Duże Biuro Rachunkowe", "INFO")
    log_action(f"Tenant: {TENANT_ID}", "INFO")
    
    # 1. Pobierz zespoły
    log_action("\n📋 KROK 1: Pobieranie zespołów", "INFO")
    teams_map = get_teams()
    if not teams_map:
        log_action("Nie można kontynuować bez zespołów", "ERROR")
        return
    
    log_action(f"Dostępne zespoły: {list(teams_map.keys())}", "INFO")
    
    # 2. Generuj firmy (200 firm)
    log_action("\n🏢 KROK 2: Tworzenie 200 firm", "INFO")
    
    # 150 firm mikro
    mikro_companies = []
    for i in range(1, 151):
        company_data = {
            "tenant_id": TENANT_ID,
            "company_name": f"Mikro Firma {i:03d} Sp. z o.o.",
            "company_code": f"MIKRO{i:03d}",
            "nip": f"123456{i:04d}",
            "description": f"Firma mikro z KPIR - {i}",
            "status": "active"
        }
        company_id = create_company(company_data)
        if company_id:
            mikro_companies.append(company_id)
        time.sleep(0.1)  # Throttling
    
    # 50 spółek
    spolki_companies = []
    for i in range(1, 51):
        company_data = {
            "tenant_id": TENANT_ID,
            "company_name": f"Spółka {i:02d} S.A.",
            "company_code": f"SPOLKA{i:02d}",
            "nip": f"987654{i:03d}",
            "description": f"Spółka kapitałowa - księgi rachunkowe {i}",
            "status": "active"
        }
        company_id = create_company(company_data)
        if company_id:
            spolki_companies.append(company_id)
        time.sleep(0.1)  # Throttling
    
    log_action(f"Utworzono {len(mikro_companies)} firm mikro i {len(spolki_companies)} spółek", "SUCCESS")
    
    # 3. Generuj użytkowników (30 osób)
    log_action("\n👥 KROK 3: Tworzenie 30 użytkowników", "INFO")
    
    polish_names = generate_polish_names()
    created_users = {}
    
    # Struktura zespołów zgodnie z PRD
    team_structure = {
        "Zarząd": {"count": 3, "users": []},
        "Główni Księgowi": {"count": 5, "users": []},
        "Księgowi KPIR": {"count": 10, "users": []},
        "Księgowi Spółki": {"count": 7, "users": []},
        "HR": {"count": 5, "users": []}
    }
    
    user_counter = 1
    for team_name, team_info in team_structure.items():
        for i in range(team_info["count"]):
            if user_counter > len(polish_names):
                break
                
            imie, nazwisko = polish_names[user_counter - 1]
            username = f"user_br_{user_counter:02d}"
            email = f"{username}@profinanse.pl"
            
            user_data = {
                "username": username,
                "email": email,
                "full_name": f"{imie} {nazwisko}",
                "status": "active"
            }
            
            user_id = create_user(user_data)
            if user_id:
                team_info["users"].append(user_id)
                created_users[user_id] = {
                    "name": f"{imie} {nazwisko}",
                    "team": team_name,
                    "username": username
                }
            
            user_counter += 1
            time.sleep(0.1)  # Throttling
    
    log_action(f"Utworzono {len(created_users)} użytkowników", "SUCCESS")
    
    # 4. Przypisz użytkowników do zespołów
    log_action("\n🔗 KROK 4: Przypisywanie użytkowników do zespołów", "INFO")
    
    for team_name, team_info in team_structure.items():
        if team_name in teams_map:
            team_id = teams_map[team_name]
            log_action(f"Przypisywanie do zespołu: {team_name}", "INFO")
            
            for user_id in team_info["users"]:
                role = "leader" if team_name == "Zarząd" else "member"
                assign_user_to_team(team_id, user_id, role)
                time.sleep(0.1)
    
    # 5. Przypisz zespoły do firm zgodnie z PRD
    log_action("\n🏢 KROK 5: Przypisywanie dostępów zespołów do firm", "INFO")
    
    # Zarząd + Główni Księgowi -> wszystkie firmy (200)
    all_companies = mikro_companies + spolki_companies
    for team_name in ["Zarząd", "Główni Księgowi"]:
        if team_name in teams_map:
            team_id = teams_map[team_name]
            log_action(f"Przypisywanie {team_name} do wszystkich {len(all_companies)} firm", "INFO")
            
            for company_id in all_companies:
                access_type = "admin" if team_name == "Zarząd" else "manage"
                assign_team_to_company(team_id, company_id, access_type)
                time.sleep(0.05)  # Szybszy throttling
    
    # Księgowi KPIR -> tylko firmy mikro (150)
    if "Księgowi KPIR" in teams_map:
        team_id = teams_map["Księgowi KPIR"]
        log_action(f"Przypisywanie Księgowi KPIR do {len(mikro_companies)} firm mikro", "INFO")
        
        for company_id in mikro_companies:
            assign_team_to_company(team_id, company_id, "edit")
            time.sleep(0.05)
    
    # Księgowi Spółki -> tylko spółki (50)
    if "Księgowi Spółki" in teams_map:
        team_id = teams_map["Księgowi Spółki"]
        log_action(f"Przypisywanie Księgowi Spółki do {len(spolki_companies)} spółek", "INFO")
        
        for company_id in spolki_companies:
            assign_team_to_company(team_id, company_id, "edit")
            time.sleep(0.05)
    
    # HR -> 30 spółek z umową kadrową
    if "HR" in teams_map and len(spolki_companies) >= 30:
        team_id = teams_map["HR"]
        hr_companies = spolki_companies[:30]  # Pierwsze 30 spółek
        log_action(f"Przypisywanie HR do {len(hr_companies)} spółek z umową kadrową", "INFO")
        
        for company_id in hr_companies:
            assign_team_to_company(team_id, company_id, "view")
            time.sleep(0.05)
    
    # 6. Podsumowanie
    log_action("\n✅ SETUP ZAKOŃCZONY POMYŚLNIE", "SUCCESS")
    log_action(f"📊 Podsumowanie dla {TENANT_ID}:", "INFO")
    log_action(f"   • Firmy mikro: {len(mikro_companies)}", "INFO")
    log_action(f"   • Spółki: {len(spolki_companies)}", "INFO")
    log_action(f"   • Użytkownicy: {len(created_users)}", "INFO")
    log_action(f"   • Zespoły: {len(teams_map)}", "INFO")
    
    # Wyświetl strukturę zespołów
    for team_name, team_info in team_structure.items():
        log_action(f"   • {team_name}: {len(team_info['users'])} osób", "INFO")

if __name__ == "__main__":
    main() 