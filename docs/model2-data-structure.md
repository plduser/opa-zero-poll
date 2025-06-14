# Model 2: Hybrid RBAC + REBAC Data Structure Specification

## Przegląd

Model 2 wprowadza separację ról aplikacyjnych od dostępu do firm, umożliwiając lepszą skalowalność i centralne zarządzanie uprawnieniami. W przeciwieństwie do Model 1, gdzie uprawnienia są osadzone bezpośrednio w kontekście firm, Model 2 rozdziela te aspekty na niezależne komponenty.

## Struktura Danych

### 1. Roles (Role Aplikacyjne)

```json
{
  "roles": {
    "user42": {
      "fk": ["fk_admin", "fk_viewer"],
      "hr": ["hr_viewer"],
      "crm": ["crm_editor"]
    },
    "user99": {
      "hr": ["hr_editor"],
      "fk": ["fk_viewer"]
    }
  }
}
```

**Opis:**
- `roles[user_id][app_name]` = lista ról użytkownika w danej aplikacji
- Role są niezależne od kontekstu firmy
- Użytkownik może mieć różne role w różnych aplikacjach
- Role są ponownie wykorzystywalne między użytkownikami

### 2. Access (Dostęp do Firm)

```json
{
  "access": {
    "user42": {
      "tenant125": ["company1", "company2", "company5"],
      "tenant200": ["company10"]
    },
    "user99": {
      "tenant125": ["company7", "company8"]
    }
  }
}
```

**Opis:**
- `access[user_id][tenant_id]` = lista firm do których użytkownik ma dostęp
- Dostęp jest niezależny od ról aplikacyjnych
- Użytkownik może mieć dostęp do wielu firm w ramach tenant'a
- Można łatwo zarządzać dostępem zbiorczym

### 3. Teams (Zespoły)

```json
{
  "teams": {
    "kadry": {
      "name": "Zespół Kadr",
      "description": "Zespół odpowiedzialny za zarządzanie zasobami ludzkimi",
      "roles": {
        "hr": ["hr_editor", "hr_admin"],
        "fk": ["fk_viewer"]
      },
      "companies": ["company7", "company8", "company12"],
      "tenant_id": "tenant125"
    },
    "księgowi_abc": {
      "name": "Księgowi ABC Sp. z o.o.",
      "description": "Zespół księgowy obsługujący firmę ABC",
      "roles": {
        "fk": ["fk_admin"],
        "hr": ["hr_viewer"]
      },
      "companies": ["company1"],
      "tenant_id": "tenant125"
    }
  }
}
```

**Opis:**
- Teams grupują użytkowników z podobnymi rolami i dostępem
- `teams[team_id].roles` = role zespołowe w aplikacjach
- `teams[team_id].companies` = firmy obsługiwane przez zespół
- Umożliwia REBAC-like zarządzanie relacyjne

### 4. Memberships (Przynależność do Zespołów)

```json
{
  "memberships": {
    "user99": ["kadry"],
    "user42": ["księgowi_abc"],
    "user150": ["kadry", "księgowi_abc"]
  }
}
```

**Opis:**
- `memberships[user_id]` = lista zespołów do których należy użytkownik
- Użytkownik może należeć do wielu zespołów
- Członkowie zespołu dziedziczą role i dostęp zespołowy

### 5. Permissions (Definicje Uprawnień)

```json
{
  "permissions": {
    "fk": {
      "fk_admin": [
        "view_entry", "edit_entry", "delete_entry", 
        "manage_accounts", "generate_reports", "approve_entries"
      ],
      "fk_editor": [
        "view_entry", "edit_entry", "generate_reports"
      ],
      "fk_viewer": [
        "view_entry", "generate_basic_reports"
      ]
    },
    "hr": {
      "hr_admin": [
        "view_profile", "edit_profile", "delete_profile",
        "manage_contracts", "manage_salaries", "generate_hr_reports"
      ],
      "hr_editor": [
        "view_profile", "edit_profile", "edit_contract", "generate_hr_reports"
      ],
      "hr_viewer": [
        "view_profile", "view_contract"
      ]
    },
    "crm": {
      "crm_admin": [
        "view_client", "edit_client", "delete_client",
        "manage_deals", "generate_crm_reports"
      ],
      "crm_editor": [
        "view_client", "edit_client", "manage_deals"
      ],
      "crm_viewer": [
        "view_client", "view_deals"
      ]
    }
  }
}
```

**Opis:**
- `permissions[app][role]` = lista konkretnych uprawnień dla roli w aplikacji
- Centralna definicja wszystkich uprawnień
- Łatwe rozszerzanie o nowe aplikacje i role

### 6. Dynamic Resources (Permit.io-style)

```json
{
  "resource_types": {
    "company": {
      "name": "Company",
      "description": "Business entity in the system",
      "actions": ["view", "edit", "manage", "delete"],
      "attributes": {
        "name": {"type": "string", "required": true},
        "tenant_id": {"type": "string", "required": true},
        "parent_company": {"type": "string", "required": false},
        "industry": {"type": "string", "required": false}
      },
      "relationships": {
        "parent": {"type": "company", "cardinality": "one"},
        "children": {"type": "company", "cardinality": "many"},
        "projects": {"type": "project", "cardinality": "many"}
      }
    },
    "project": {
      "name": "Project",
      "description": "Shared project dictionary",
      "actions": ["view", "edit", "create", "delete", "assign"],
      "attributes": {
        "name": {"type": "string", "required": true},
        "owner": {"type": "string", "required": true},
        "status": {"type": "enum", "values": ["active", "completed", "archived"]},
        "budget": {"type": "number", "required": false}
      },
      "relationships": {
        "owner": {"type": "user", "cardinality": "one"},
        "companies": {"type": "company", "cardinality": "many"},
        "team": {"type": "team", "cardinality": "one"}
      }
    }
  }
}
```

### Resource Instances

```json
{
  "resources": {
    "company:company1": {
      "type": "company",
      "attributes": {
        "name": "ABC Sp. z o.o.",
        "tenant_id": "tenant125",
        "industry": "manufacturing"
      },
      "relationships": {
        "children": ["company:company1_branch"],
        "projects": ["project:abc_modernization"]
      }
    },
    "project:abc_modernization": {
      "type": "project",
      "attributes": {
        "name": "ABC Factory Modernization",
        "owner": "user42",
        "status": "active",
        "budget": 500000
      },
      "relationships": {
        "owner": "user42",
        "companies": ["company:company1"],
        "team": "team:engineering"
      }
    }
  }
}
```

### Dynamic Resource Authorization

```rego
package rbac.dynamic_resources

import future.keywords.if
import future.keywords.in

# Główna reguła autoryzacji dla dynamic resources
allow if {
    resource_permission
}

# Sprawdzenie uprawnień do zasobu
resource_permission if {
    # Pobierz typ zasobu
    resource_type := data.resources[input.resource].type
    resource_def := data.resource_types[resource_type]
    
    # Sprawdź czy akcja jest dozwolona dla tego typu
    input.action in resource_def.actions
    
    # Sprawdź uprawnienia użytkownika
    user_has_resource_access
}

# Sprawdzenie dostępu użytkownika do zasobu
user_has_resource_access if {
    # Bezpośrednie uprawnienia (owner)
    resource_owner_access
}

user_has_resource_access if {
    # Uprawnienia przez zespoły
    team_resource_access
}

user_has_resource_access if {
    # Uprawnienia przez hierarchie zasobów
    hierarchical_resource_access
}

# Owner ma pełny dostęp
resource_owner_access if {
    resource := data.resources[input.resource]
    resource.attributes.owner == input.user
}

# Dostęp przez zespoły
team_resource_access if {
    user_teams := data.memberships[input.user]
    some team_id in user_teams
    team := data.teams[team_id]
    
    # Sprawdź czy zespół ma dostęp do zasobu
    input.resource in team.resources
    
    # Sprawdź czy zespół ma odpowiednią rolę
    team_roles := team.roles[input.app]
    some role in team_roles
    role_permissions := data.permissions[input.app][role]
    input.action in role_permissions
}

# Dostęp przez hierarchie (parent-child)
hierarchical_resource_access if {
    resource := data.resources[input.resource]
    parent_resources := resource.relationships.parent
    
    # Sprawdź dostęp do parent resource
    some parent in parent_resources
    user_has_access_to_resource(parent)
}

# Helper function - sprawdzenie dostępu do konkretnego zasobu
user_has_access_to_resource(resource_id) if {
    # Rekurencyjne sprawdzenie dostępu
    saved_resource := input.resource
    input.resource := resource_id
    user_has_resource_access
    input.resource := saved_resource
}
```

## Kompletny Przykład

```json
{
  "roles": {
    "user42": {
      "fk": ["fk_admin"],
      "hr": ["hr_viewer"]
    },
    "user99": {
      "hr": ["hr_editor"]
    },
    "user150": {
      "fk": ["fk_viewer"],
      "crm": ["crm_editor"]
    }
  },
  "access": {
    "user42": {
      "tenant125": ["company1", "company2"]
    },
    "user99": {
      "tenant125": ["company7", "company8"]
    },
    "user150": {
      "tenant125": ["company1", "company7"],
      "tenant200": ["company20"]
    }
  },
  "teams": {
    "kadry": {
      "name": "Zespół Kadr",
      "description": "HR dla wszystkich firm",
      "roles": {
        "hr": ["hr_editor"]
      },
      "companies": ["company7", "company8"],
      "tenant_id": "tenant125"
    },
    "księgowi_abc": {
      "name": "Księgowi ABC",
      "description": "Obsługa księgowa firmy ABC",
      "roles": {
        "fk": ["fk_admin"],
        "hr": ["hr_viewer"]
      },
      "companies": ["company1"],
      "tenant_id": "tenant125"
    }
  },
  "memberships": {
    "user99": ["kadry"],
    "user42": ["księgowi_abc"],
    "user150": ["kadry"]
  },
  "permissions": {
    "fk": {
      "fk_admin": ["view_entry", "edit_entry", "delete_entry", "manage_accounts"],
      "fk_viewer": ["view_entry"]
    },
    "hr": {
      "hr_editor": ["view_profile", "edit_contract"],
      "hr_viewer": ["view_profile"]
    },
    "crm": {
      "crm_editor": ["view_client", "edit_client", "manage_deals"],
      "crm_viewer": ["view_client"]
    }
  }
}
```

## Logika Autoryzacji

### Sprawdzanie Uprawnień Bezpośrednich

1. **Sprawdź role użytkownika**: `roles[user_id][app]`
2. **Sprawdź dostęp do firmy**: `access[user_id][tenant_id]` zawiera `company_id`
3. **Sprawdź uprawnienia roli**: `permissions[app][role]` zawiera `action`

### Sprawdzanie Uprawnień Zespołowych

1. **Znajdź zespoły użytkownika**: `memberships[user_id]`
2. **Dla każdego zespołu**:
   - Sprawdź czy `teams[team_id].companies` zawiera `company_id`
   - Sprawdź czy `teams[team_id].roles[app]` zawiera potrzebną rolę
   - Sprawdź czy rola ma wymagane uprawnienie

### Algorytm Krok po Kroku

```
function hasPermission(user_id, tenant_id, company_id, app, action):
    // 1. Sprawdź uprawnienia bezpośrednie
    if (roles[user_id][app] exists and 
        access[user_id][tenant_id] contains company_id):
        for each role in roles[user_id][app]:
            if permissions[app][role] contains action:
                return true
    
    // 2. Sprawdź uprawnienia zespołowe
    if (memberships[user_id] exists):
        for each team_id in memberships[user_id]:
            team = teams[team_id]
            if (team.tenant_id == tenant_id and 
                team.companies contains company_id and
                team.roles[app] exists):
                for each role in team.roles[app]:
                    if permissions[app][role] contains action:
                        return true
    
    return false
```

## Zalety Model 2

### 1. Skalowalność
- Centralne zarządzanie rolami aplikacyjnymi
- Niezależne zarządzanie dostępem do firm
- Łatwe dodawanie nowych użytkowników i firm

### 2. Elastyczność
- Teams umożliwiają zarządzanie zbiorcze
- REBAC-like relacje między zespołami a firmami
- Dziedziczenie uprawnień w zespołach

### 3. Utrzymanie
- Jednoznaczne definicje uprawnień
- Łatwe audytowanie i śledzenie zmian
- Możliwość bulk operations

### 4. Backwards Compatibility
- UI może symulować Model 1 ("Pani Basia dla firmy X ma rolę Y")
- Dane Model 1 można migrować do Model 2
- Istniejące API może być kompatybilne

## Migracja z Model 1

### Mapowanie Danych

**Model 1 → Model 2:**

```python
def migrate_model1_to_model2(model1_data):
    model2 = {
        "roles": {},
        "access": {},
        "teams": {},
        "memberships": {},
        "permissions": {}
    }
    
    for tenant_id, tenant_data in model1_data.items():
        # Migruj permissions (pozostają bez zmian)
        for app, app_roles in tenant_data.get("roles", {}).items():
            model2["permissions"][app] = app_roles
        
        # Migruj users
        for user in tenant_data.get("users", []):
            user_id = user["user_id"]
            
            # Utwórz roles dla każdej aplikacji (wykryj z permissions)
            for app in model2["permissions"].keys():
                user_roles = [role for role in user["roles"] 
                             if role in model2["permissions"][app]]
                if user_roles:
                    if user_id not in model2["roles"]:
                        model2["roles"][user_id] = {}
                    model2["roles"][user_id][app] = user_roles
            
            # Utwórz access (wszystkie company w tenant'e)
            if user_id not in model2["access"]:
                model2["access"][user_id] = {}
            # W Model 1 użytkownik ma dostęp do całego tenant'a
            # Można to dostosować w zależności od logiki biznesowej
            model2["access"][user_id][tenant_id] = ["default_company"]
    
    return model2
```

## Walidacja i Testy

### Schema Validation

```python
from jsonschema import validate

model2_schema = {
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
                            "items": {"type": "string"}
                        }
                    }
                }
            }
        },
        "access": {
            "type": "object",
            "patternProperties": {
                "^[a-zA-Z0-9_-]+$": {  # user_id pattern
                    "type": "object",
                    "patternProperties": {
                        "^[a-zA-Z0-9_-]+$": {  # tenant_id pattern
                            "type": "array",
                            "items": {"type": "string"}
                        }
                    }
                }
            }
        },
        "teams": {
            "type": "object",
            "patternProperties": {
                "^[a-zA-Z0-9_-]+$": {  # team_id pattern
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "description": {"type": "string"},
                        "roles": {"type": "object"},
                        "companies": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "tenant_id": {"type": "string"}
                    },
                    "required": ["name", "roles", "companies", "tenant_id"]
                }
            }
        },
        "memberships": {
            "type": "object",
            "patternProperties": {
                "^[a-zA-Z0-9_-]+$": {  # user_id pattern
                    "type": "array",
                    "items": {"type": "string"}
                }
            }
        },
        "permissions": {
            "type": "object",
            "patternProperties": {
                "^[a-zA-Z0-9_-]+$": {  # app_name pattern
                    "type": "object",
                    "patternProperties": {
                        "^[a-zA-Z0-9_-]+$": {  # role_name pattern
                            "type": "array",
                            "items": {"type": "string"}
                        }
                    }
                }
            }
        }
    },
    "required": ["roles", "access", "teams", "memberships", "permissions"]
}

def validate_model2_data(data):
    try:
        validate(instance=data, schema=model2_schema)
        return True, "Validation successful"
    except Exception as e:
        return False, str(e)
```

### Test Cases

```python
def test_model2_authorization():
    """Test scenariuszy autoryzacji w Model 2"""
    
    # Test 1: Bezpośrednie uprawnienia użytkownika
    assert hasPermission("user42", "tenant125", "company1", "fk", "view_entry") == True
    assert hasPermission("user42", "tenant125", "company1", "hr", "edit_profile") == False
    
    # Test 2: Uprawnienia zespołowe
    assert hasPermission("user99", "tenant125", "company7", "hr", "edit_contract") == True
    
    # Test 3: Brak dostępu do firmy
    assert hasPermission("user42", "tenant125", "company7", "fk", "view_entry") == False
    
    # Test 4: Kombinacja ról bezpośrednich i zespołowych
    assert hasPermission("user150", "tenant125", "company7", "hr", "edit_contract") == True
```

## Podsumowanie

Model 2 zapewnia:

1. **Separację ról od dostępu** - lepszą skalowalność
2. **Teams i REBAC-like features** - zarządzanie zbiorcze
3. **Centralne permissions** - łatwiejsze utrzymanie
4. **Backwards compatibility** - możliwość migracji z Model 1
5. **Elastyczność UI** - może wyglądać jak Model 1 ale działać jak Model 2

Ta struktura stanowi podstawę dla kolejnych subtasków implementacji w Data Provider API, politykach OPA oraz interfejsie Policy Management Portal. 

## Implementacja w OPA Rego

```rego
package rbac.model2

import future.keywords.if
import future.keywords.in

# GŁÓWNA REGUŁA AUTORYZACJI - OR Logic
# Dostęp przyznany jeśli KTÓRAKOLWIEK ścieżka zwróci TRUE
allow if {
    direct_permission
}

allow if {
    team_permission
}

allow if {
    dynamic_resource_permission
}

# ŚCIEŻKA 1: Sprawdzenie uprawnień bezpośrednich (RBAC)
direct_permission if {
    # Sprawdź czy użytkownik ma rolę w aplikacji
    user_roles := data.roles[input.user_id][input.app]
    some role in user_roles
    
    # Sprawdź czy ma dostęp do firmy/zasobu
    user_companies := data.access[input.user_id][input.tenant_id]
    input.company_id in user_companies
    
    # Sprawdź czy rola ma wymagane uprawnienie
    role_permissions := data.permissions[input.app][role]
    input.action in role_permissions
}

# ŚCIEŻKA 2: Sprawdzenie uprawnień zespołowych (REBAC-like)
team_permission if {
    # Znajdź zespoły użytkownika
    user_teams := data.memberships[input.user_id]
    some team_id in user_teams
    
    # Sprawdź zespół
    team := data.teams[team_id]
    team.tenant_id == input.tenant_id
    input.company_id in team.companies
    
    # Sprawdź rolę zespołową (ADDITIVE - wszystkie role zespołu)
    team_roles := team.roles[input.app]
    some role in team_roles
    
    # Sprawdź uprawnienia roli
    role_permissions := data.permissions[input.app][role]
    input.action in role_permissions
}

# ŚCIEŻKA 3: Sprawdzenie uprawnień do dynamic resources
dynamic_resource_permission if {
    # Sprawdź czy to zapytanie o dynamic resource
    input.resource_type
    input.resource_id
    
    # Pobierz definicję typu zasobu
    resource_def := data.resource_types[input.resource_type]
    input.action in resource_def.actions
    
    # Sprawdź dostęp do zasobu
    resource_access
}

# Dostęp do dynamic resource
resource_access if {
    # Owner ma pełny dostęp
    resource := data.resources[input.resource_id]
    resource.attributes.owner == input.user_id
}

resource_access if {
    # Dostęp przez zespoły do zasobów
    user_teams := data.memberships[input.user_id]
    some team_id in user_teams
    team := data.teams[team_id]
    
    # Sprawdź czy zespół ma dostęp do zasobu
    input.resource_id in team.resources
    
    # Sprawdź role zespołowe (ADDITIVE)
    team_roles := team.roles[input.app]
    some role in team_roles
    role_permissions := data.permissions[input.app][role]
    input.action in role_permissions
}

resource_access if {
    # Dostęp przez hierarchie zasobów (parent-child)
    resource := data.resources[input.resource_id]
    parent_id := resource.relationships.parent
    parent_id != null
    
    # Rekurencyjne sprawdzenie dostępu do parent
    has_parent_access(parent_id)
}

# HELPER FUNCTIONS

# Pobierz wszystkie efektywne role użytkownika (ADDITIVE)
user_effective_roles[app] := roles if {
    # Role bezpośrednie
    direct_roles := object.get(data.roles[input.user_id], app, [])
    
    # Role zespołowe (ADDITIVE - suma wszystkich ról ze wszystkich zespołów)
    team_roles := [role |
        user_teams := data.memberships[input.user_id]
        some team_id in user_teams
        team := data.teams[team_id]
        team.tenant_id == input.tenant_id
        some role in object.get(team.roles, app, [])
    ]
    
    # Połącz wszystkie role (ADDITIVE)
    all_roles := array.concat(direct_roles, team_roles)
    roles := {role | some role in all_roles}
}

# Pobierz wszystkie efektywne uprawnienia użytkownika
user_effective_permissions[app] := permissions if {
    user_roles := user_effective_roles[app]
    permissions := {permission |
        some role in user_roles
        role_permissions := data.permissions[app][role]
        some permission in role_permissions
    }
}

# Sprawdź dostęp do parent resource (rekurencyjnie)
has_parent_access(parent_id) if {
    # Sprawdź bezpośredni dostęp do parent
    saved_resource_id := input.resource_id
    input.resource_id := parent_id
    resource_access
    input.resource_id := saved_resource_id
}

# Pomocnicze queries dla debugowania
user_apps[app] if {
    data.roles[input.user_id][app]
}

user_companies[company] if {
    companies := data.access[input.user_id][input.tenant_id]
    some company in companies
}

user_teams[team_id] if {
    teams := data.memberships[input.user_id]
    some team_id in teams
}

# Query do sprawdzenia wszystkich dostępnych zasobów dla użytkownika
user_accessible_resources[resource_id] if {
    # Zasoby przez ownership
    resource := data.resources[resource_id]
    resource.attributes.owner == input.user_id
}

user_accessible_resources[resource_id] if {
    # Zasoby przez zespoły
    user_teams := data.memberships[input.user_id]
    some team_id in user_teams
    team := data.teams[team_id]
    resource_id in team.resources
}

user_accessible_resources[resource_id] if {
    # Zasoby przez hierarchie (dzieci zasobów do których mam dostęp)
    accessible := user_accessible_resources[parent_id]
    resource := data.resources[resource_id]
    resource.relationships.parent == parent_id
}
```

## Kluczowe Zasady Autoryzacji

### 1. **OR Logic** - Wielościeżkowa autoryzacja
```rego
allow if { direct_permission }     # RBAC path
allow if { team_permission }       # REBAC-like path  
allow if { dynamic_resource_permission }  # Dynamic resources path
```

### 2. **ADDITIVE Roles** - Sumowanie uprawnień
```rego
# Użytkownik może mieć role z różnych źródeł:
# - Bezpośrednie: data.roles[user][app] = ["role1"]
# - Zespół A: team.roles[app] = ["role2"] 
# - Zespół B: team.roles[app] = ["role3"]
# WYNIK: user ma ["role1", "role2", "role3"]
```

### 3. **Non-Destructive** - Role nie odbierają uprawnień
```rego
# Jeśli user ma role ["viewer", "admin"]:
# - viewer: ["read"]
# - admin: ["read", "write", "delete"]
# WYNIK: user może ["read", "write", "delete"]
# (admin nie odbiera uprawnień viewer)
``` 