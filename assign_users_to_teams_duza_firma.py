#!/usr/bin/env python3
"""
🎯 Przypisanie użytkowników do zespołów - tenant_duza_firma
=========================================================

Przypisuje użytkowników do odpowiednich zespołów na podstawie ich departamentów.

Mapowanie departament → zespół:
- IT → IT  
- Kadry → Kadry
- Księgowość → Księgowość
- Sales & Marketing → Sales & Marketing
- Zarząd → Zarząd

Znalezione użytkownicy:
- IT: 10 osób
- Kadry: 8 osób  
- Księgowość: 6 osób
- Sales & Marketing: 15 osób
- Zarząd: 5 osób
= Łącznie: 44 użytkowników
"""

import requests
import json
from typing import Dict, List

# Konfiguracja
TENANT_ID = "tenant_duza_firma"
PORTAL_API = "http://localhost:3000/api"

# Mapowanie zespołów (z wcześniejszego sprawdzenia)
TEAMS_MAP = {
    "Zarząd": "165ff625-6d07-47a8-b4ee-4a7ce279b6c8",
    "IT": "4d3ba7c2-0e53-4fca-8b9f-06fc4f4dfcd6", 
    "Sales & Marketing": "1b26d3f6-8efe-4859-8782-8b6ec891c7a8",
    "Kadry": "5f4832e1-2328-4471-9c38-b1ea828c567f",
    "Księgowość": "e4db01ae-d164-43c9-9b21-6faa07d48334"
}

# Użytkownicy z departamentami (z query bazy danych)
USERS_BY_DEPARTMENT = {
    "IT": [
        "user_1751002721_bq0p", "user_1751002721_837g", "user_1751002721_wh5b", 
        "user_1751002721_emtp", "user_1751002721_gajs", "user_1751002721_7usr",
        "user_1751002720_xflh", "user_1751002720_ewxv", "user_1751002721_qco2", 
        "user_1751002721_4ms4"
    ],
    "Kadry": [
        "user_1751002720_q18y", "user_1751002720_4l46", "user_1751002720_rlfr",
        "user_1751002720_2m95", "user_1751002720_mp82", "user_1751002720_0qj4",
        "user_1751002720_aafc", "user_1751002720_dk5n"
    ],
    "Księgowość": [
        "user_1751002718_qisa", "user_1751002719_4izw", "user_1751002720_y5fl",
        "user_1751002720_xb1l", "user_1751002720_99cm", "user_1751002720_982w"
    ],
    "Sales & Marketing": [
        "user_1751002720_1bg7", "user_1751002720_2q9n", "user_1751002720_ln9y",
        "user_1751002720_f18i", "user_1751002720_zbcx", "user_1751002720_mc87",
        "user_1751002720_ustm", "user_1751002720_rbid", "user_1751002720_cd2u",
        "user_1751002720_qwx8", "user_1751002720_devg", "user_1751002720_f37k",
        "user_1751002720_aa6j", "user_1751002720_8b8t", "user_1751002720_0g59"
    ],
    "Zarząd": [
        "user_1751002721_wfjh", "user_1751002721_w401", "user_1751002721_zj16",
        "user_1751002721_zdfn", "user_1751002721_plnq"
    ]
}

def log_action(action: str, status: str = "INFO", details: str = ""):
    """Logger z ikonami dla lepszej czytelności"""
    icons = {"INFO": "ℹ️", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️"}
    print(f"{icons.get(status, 'ℹ️')} {action}")
    if details:
        print(f"   {details}")

def assign_user_to_team(user_id: str, team_id: str, team_name: str) -> bool:
    """Przypisuje użytkownika do zespołu"""
    try:
        response = requests.post(
            f"{PORTAL_API}/teams/{team_id}/members",
            json={
                "user_id": user_id,
                "role_in_team": "member"
            }
        )
        
        if response.status_code in [200, 201]:
            log_action(f"Przypisano {user_id} do zespołu {team_name}", "SUCCESS")
            return True
        elif response.status_code == 409:
            log_action(f"Użytkownik {user_id} już jest w zespole {team_name}", "WARNING")
            return True  # Nie jest błędem
        else:
            log_action(f"Błąd przypisania {user_id} do {team_name}: {response.status_code}", "ERROR", 
                      f"Response: {response.text}")
            return False
            
    except Exception as e:
        log_action(f"Wyjątek przy przypisaniu {user_id} do {team_name}", "ERROR", str(e))
        return False

def main():
    """Główna funkcja przypisywania użytkowników do zespołów"""
    
    log_action("🎯 Rozpoczynam przypisywanie użytkowników do zespołów - tenant_duza_firma")
    
    total_users = sum(len(users) for users in USERS_BY_DEPARTMENT.values())
    log_action(f"Łącznie do przypisania: {total_users} użytkowników w {len(USERS_BY_DEPARTMENT)} departamentach")
    
    success_count = 0
    error_count = 0
    
    # Przypisanie dla każdego departamentu
    for department, user_ids in USERS_BY_DEPARTMENT.items():
        if department not in TEAMS_MAP:
            log_action(f"Brak zespołu dla departamentu: {department}", "WARNING")
            continue
            
        team_id = TEAMS_MAP[department]
        team_name = department
        
        log_action(f"📋 Przetwarzam departament: {department} ({len(user_ids)} użytkowników)")
        
        for user_id in user_ids:
            if assign_user_to_team(user_id, team_id, team_name):
                success_count += 1
            else:
                error_count += 1
        
        print()  # Pusta linia między departamentami
    
    # Podsumowanie
    log_action("🎉 Zakończono przypisywanie użytkowników do zespołów")
    log_action(f"✅ Sukces: {success_count} przypisań")
    if error_count > 0:
        log_action(f"❌ Błędy: {error_count} przypisań")
    
    # Sprawdź końcowy stan zespołów
    log_action("📊 Sprawdzanie końcowego stanu zespołów...")
    for department, team_id in TEAMS_MAP.items():
        try:
            response = requests.get(f"{PORTAL_API}/teams/{team_id}/members")
            if response.status_code == 200:
                members = response.json().get("members", [])
                log_action(f"Zespół {department}: {len(members)} członków", "INFO")
            else:
                log_action(f"Błąd sprawdzenia zespołu {department}", "WARNING")
        except:
            log_action(f"Wyjątek przy sprawdzeniu zespołu {department}", "WARNING")

if __name__ == "__main__":
    main() 