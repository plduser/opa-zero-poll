#!/usr/bin/env python3
"""
Model 2 Data Structure Validator and Test Suite
Walidacja i testy dla hybrydowego modelu RBAC + REBAC
"""

import json
import sys
from typing import Dict, List, Any, Tuple, Optional
from jsonschema import validate, ValidationError


class Model2Validator:
    """Walidator struktury danych Model 2"""
    
    def __init__(self):
        self.schema = self._get_model2_schema()
    
    def _get_model2_schema(self) -> Dict[str, Any]:
        """Definicja JSON Schema dla Model 2"""
        return {
            "type": "object",
            "properties": {
                "roles": {
                    "type": "object",
                    "patternProperties": {
                        "^[a-zA-Z0-9_-]+$": {  # user_id pattern
                            "type": "object",
                            "patternProperties": {
                                "^[a-zA-Z0-9_-]+$": {  # app_name pattern
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "minItems": 1
                                }
                            },
                            "additionalProperties": False
                        }
                    },
                    "additionalProperties": False
                },
                "access": {
                    "type": "object",
                    "patternProperties": {
                        "^[a-zA-Z0-9_-]+$": {  # user_id pattern
                            "type": "object",
                            "patternProperties": {
                                "^[a-zA-Z0-9_-]+$": {  # tenant_id pattern
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "minItems": 1
                                }
                            },
                            "additionalProperties": False
                        }
                    },
                    "additionalProperties": False
                },
                "teams": {
                    "type": "object",
                    "patternProperties": {
                        "^[a-zA-Z0-9_ąćęłńóśźż-]+$": {  # team_id pattern (z polskimi znakami)
                            "type": "object",
                            "properties": {
                                "name": {"type": "string", "minLength": 1},
                                "description": {"type": "string"},
                                "roles": {
                                    "type": "object",
                                    "patternProperties": {
                                        "^[a-zA-Z0-9_-]+$": {  # app_name pattern
                                            "type": "array",
                                            "items": {"type": "string"},
                                            "minItems": 1
                                        }
                                    },
                                    "additionalProperties": False
                                },
                                "companies": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "minItems": 1
                                },
                                "tenant_id": {"type": "string"}
                            },
                            "required": ["name", "roles", "companies", "tenant_id"],
                            "additionalProperties": False
                        }
                    },
                    "additionalProperties": False
                },
                "memberships": {
                    "type": "object",
                    "patternProperties": {
                        "^[a-zA-Z0-9_-]+$": {  # user_id pattern
                            "type": "array",
                            "items": {"type": "string"},
                            "minItems": 1
                        }
                    },
                    "additionalProperties": False
                },
                "permissions": {
                    "type": "object",
                    "patternProperties": {
                        "^[a-zA-Z0-9_-]+$": {  # app_name pattern
                            "type": "object",
                            "patternProperties": {
                                "^[a-zA-Z0-9_-]+$": {  # role_name pattern
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "minItems": 1
                                }
                            },
                            "additionalProperties": False
                        }
                    },
                    "additionalProperties": False
                }
            },
            "required": ["roles", "access", "teams", "memberships", "permissions"],
            "additionalProperties": False
        }
    
    def validate_schema(self, data: Dict[str, Any]) -> Tuple[bool, str]:
        """Walidacja zgodności ze schematem JSON"""
        try:
            validate(instance=data, schema=self.schema)
            return True, "Schema validation successful"
        except ValidationError as e:
            return False, f"Schema validation error: {e.message}"
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    def validate_business_rules(self, data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Walidacja reguł biznesowych"""
        errors = []
        
        # 1. Sprawdź czy wszystkie role w roles istnieją w permissions
        for user_id, user_roles in data.get("roles", {}).items():
            for app, roles in user_roles.items():
                if app not in data.get("permissions", {}):
                    errors.append(f"App '{app}' used in roles[{user_id}] not found in permissions")
                    continue
                
                for role in roles:
                    if role not in data.get("permissions", {}).get(app, {}):
                        errors.append(f"Role '{role}' for app '{app}' used in roles[{user_id}] not found in permissions")
        
        # 2. Sprawdź czy wszystkie role w teams istnieją w permissions
        for team_id, team in data.get("teams", {}).items():
            for app, roles in team.get("roles", {}).items():
                if app not in data.get("permissions", {}):
                    errors.append(f"App '{app}' used in teams[{team_id}] not found in permissions")
                    continue
                
                for role in roles:
                    if role not in data.get("permissions", {}).get(app, {}):
                        errors.append(f"Role '{role}' for app '{app}' used in teams[{team_id}] not found in permissions")
        
        # 3. Sprawdź czy wszyscy użytkownicy w memberships mają zdefiniowane access lub roles
        for user_id, teams in data.get("memberships", {}).items():
            has_access = user_id in data.get("access", {})
            has_roles = user_id in data.get("roles", {})
            
            if not has_access and not has_roles:
                errors.append(f"User '{user_id}' in memberships has no access or roles defined")
            
            # Sprawdź czy wszystkie zespoły istnieją
            for team_id in teams:
                if team_id not in data.get("teams", {}):
                    errors.append(f"Team '{team_id}' used in memberships[{user_id}] not found in teams")
        
        # 4. Sprawdź konsystencję tenant_id w teams i access
        team_tenants = set()
        for team in data.get("teams", {}).values():
            team_tenants.add(team.get("tenant_id"))
        
        access_tenants = set()
        for user_access in data.get("access", {}).values():
            access_tenants.update(user_access.keys())
        
        # Ostrzeżenie o nieużywanych tenant_id
        unused_tenants = team_tenants - access_tenants
        if unused_tenants:
            errors.append(f"Warning: Tenants {unused_tenants} defined in teams but not used in access")
        
        return len(errors) == 0, errors
    
    def validate_full(self, data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Pełna walidacja: schema + reguły biznesowe"""
        # Schema validation
        schema_valid, schema_error = self.validate_schema(data)
        if not schema_valid:
            return False, [schema_error]
        
        # Business rules validation
        rules_valid, business_errors = self.validate_business_rules(data)
        
        return rules_valid, business_errors


class Model2AuthorizationEngine:
    """Silnik autoryzacji dla Model 2"""
    
    def __init__(self, data: Dict[str, Any]):
        self.data = data
        # Walidacja danych przy inicjalizacji
        validator = Model2Validator()
        valid, errors = validator.validate_full(data)
        if not valid:
            raise ValueError(f"Invalid Model 2 data: {errors}")
    
    def has_permission(self, user_id: str, tenant_id: str, company_id: str, 
                      app: str, action: str) -> bool:
        """
        Sprawdza czy użytkownik ma uprawnienie do wykonania akcji
        
        Args:
            user_id: ID użytkownika
            tenant_id: ID tenanta
            company_id: ID firmy
            app: Nazwa aplikacji
            action: Nazwa akcji
            
        Returns:
            bool: True jeśli użytkownik ma uprawnienie
        """
        # 1. Sprawdź uprawnienia bezpośrednie
        if self._has_direct_permission(user_id, tenant_id, company_id, app, action):
            return True
        
        # 2. Sprawdź uprawnienia zespołowe
        if self._has_team_permission(user_id, tenant_id, company_id, app, action):
            return True
        
        return False
    
    def _has_direct_permission(self, user_id: str, tenant_id: str, company_id: str,
                              app: str, action: str) -> bool:
        """Sprawdza uprawnienia bezpośrednie użytkownika"""
        # Sprawdź czy użytkownik ma role w aplikacji
        user_roles = self.data.get("roles", {}).get(user_id, {}).get(app, [])
        if not user_roles:
            return False
        
        # Sprawdź czy ma dostęp do firmy
        user_companies = self.data.get("access", {}).get(user_id, {}).get(tenant_id, [])
        if company_id not in user_companies:
            return False
        
        # Sprawdź czy któraś z ról ma wymagane uprawnienie
        for role in user_roles:
            role_permissions = self.data.get("permissions", {}).get(app, {}).get(role, [])
            if action in role_permissions:
                return True
        
        return False
    
    def _has_team_permission(self, user_id: str, tenant_id: str, company_id: str,
                            app: str, action: str) -> bool:
        """Sprawdza uprawnienia zespołowe użytkownika"""
        # Znajdź zespoły użytkownika
        user_teams = self.data.get("memberships", {}).get(user_id, [])
        if not user_teams:
            return False
        
        # Sprawdź każdy zespół
        for team_id in user_teams:
            team = self.data.get("teams", {}).get(team_id, {})
            
            # Sprawdź czy zespół obsługuje tenant i firmę
            if (team.get("tenant_id") == tenant_id and 
                company_id in team.get("companies", [])):
                
                # Sprawdź role zespołowe w aplikacji
                team_roles = team.get("roles", {}).get(app, [])
                for role in team_roles:
                    role_permissions = self.data.get("permissions", {}).get(app, {}).get(role, [])
                    if action in role_permissions:
                        return True
        
        return False
    
    def get_user_effective_roles(self, user_id: str, app: str) -> List[str]:
        """Zwraca wszystkie efektywne role użytkownika w aplikacji (bezpośrednie + zespołowe)"""
        roles = set()
        
        # Role bezpośrednie
        direct_roles = self.data.get("roles", {}).get(user_id, {}).get(app, [])
        roles.update(direct_roles)
        
        # Role zespołowe
        user_teams = self.data.get("memberships", {}).get(user_id, [])
        for team_id in user_teams:
            team = self.data.get("teams", {}).get(team_id, {})
            team_roles = team.get("roles", {}).get(app, [])
            roles.update(team_roles)
        
        return list(roles)
    
    def get_user_companies(self, user_id: str, tenant_id: str) -> List[str]:
        """Zwraca wszystkie firmy do których użytkownik ma dostęp (bezpośredni + zespołowy)"""
        companies = set()
        
        # Dostęp bezpośredni
        direct_companies = self.data.get("access", {}).get(user_id, {}).get(tenant_id, [])
        companies.update(direct_companies)
        
        # Dostęp zespołowy
        user_teams = self.data.get("memberships", {}).get(user_id, [])
        for team_id in user_teams:
            team = self.data.get("teams", {}).get(team_id, {})
            if team.get("tenant_id") == tenant_id:
                companies.update(team.get("companies", []))
        
        return list(companies)


def run_model2_tests():
    """Uruchamia testy Model 2"""
    print("🧪 Rozpoczynam testy Model 2...")
    
    # Wczytaj przykładowe dane
    try:
        with open("model2-sample-data.json", "r", encoding="utf-8") as f:
            sample_data = json.load(f)
        print("✅ Wczytano przykładowe dane")
    except FileNotFoundError:
        print("❌ Nie znaleziono pliku model2-sample-data.json")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Błąd parsowania JSON: {e}")
        return False
    
    # Test walidacji
    print("\n📋 Test walidacji...")
    validator = Model2Validator()
    valid, errors = validator.validate_full(sample_data)
    
    if valid:
        print("✅ Walidacja przeszła pomyślnie")
    else:
        print("❌ Błędy walidacji:")
        for error in errors:
            print(f"   - {error}")
        return False
    
    # Test silnika autoryzacji
    print("\n🔐 Test silnika autoryzacji...")
    try:
        auth = Model2AuthorizationEngine(sample_data)
        print("✅ Silnik autoryzacji zainicjalizowany")
    except ValueError as e:
        print(f"❌ Błąd inicjalizacji silnika: {e}")
        return False
    
    # Testy scenariuszy autoryzacji
    test_cases = [
        # (user_id, tenant_id, company_id, app, action, expected, description)
        ("user42", "tenant125", "company1", "fk", "view_entry", True, "Bezpośrednie uprawnienie admin FK"),
        ("user42", "tenant125", "company1", "hr", "edit_profile", False, "Brak uprawnień HR editor (ma tylko viewer)"),
        ("user99", "tenant125", "company7", "hr", "edit_contract", True, "Uprawnienie zespołowe kadry"),
        ("user42", "tenant125", "company7", "fk", "view_entry", False, "Brak dostępu do company7"),
        ("user150", "tenant125", "company7", "hr", "edit_contract", True, "Uprawnienie zespołowe kadry"),
        ("user150", "tenant125", "company1", "crm", "edit_client", False, "Brak dostępu CRM do company1"),
        ("user200", "tenant125", "company1", "fk", "manage_accounts", True, "Admin uprawnienia zespołowe"),
        ("user300", "tenant125", "company1", "fk", "delete_entry", True, "Uprawnienie zespołowe księgowi_abc"),
    ]
    
    passed = 0
    failed = 0
    
    for user_id, tenant_id, company_id, app, action, expected, description in test_cases:
        result = auth.has_permission(user_id, tenant_id, company_id, app, action)
        if result == expected:
            print(f"✅ {description}")
            passed += 1
        else:
            print(f"❌ {description} (expected: {expected}, got: {result})")
            failed += 1
    
    print(f"\n📊 Wyniki testów: {passed} ✅ / {failed} ❌")
    
    # Test pomocniczych funkcji
    print("\n🔍 Test funkcji pomocniczych...")
    
    # Test efektywnych ról
    user42_fk_roles = auth.get_user_effective_roles("user42", "fk")
    print(f"User42 efektywne role FK: {user42_fk_roles}")
    
    user150_hr_roles = auth.get_user_effective_roles("user150", "hr")
    print(f"User150 efektywne role HR: {user150_hr_roles}")
    
    # Test dostępnych firm
    user42_companies = auth.get_user_companies("user42", "tenant125")
    print(f"User42 dostępne firmy tenant125: {user42_companies}")
    
    user150_companies = auth.get_user_companies("user150", "tenant125")
    print(f"User150 dostępne firmy tenant125: {user150_companies}")
    
    return failed == 0


if __name__ == "__main__":
    success = run_model2_tests()
    sys.exit(0 if success else 1) 