# Model 2 - Przykłady Scenariuszy Użycia

## Scenariusz 1: Dodanie Nowego Pracownika przez Kopiowanie Wzorca

### Problem (Model 1):
```
Nowy pracownik Jan potrzebuje takich samych uprawnień jak Piotr:
- Dostęp do aplikacji FK jako fk_admin
- Dostęp do firm: company1, company2 w tenant125
- Dostęp do aplikacji HR jako hr_viewer
```

### Rozwiązanie (Model 2):
```json
{
  "teams": {
    "team_accounting": {
      "tenant_id": "tenant125",
      "roles": {
        "fk": ["fk_admin"],
        "hr": ["hr_viewer"]
      },
      "companies": ["company1", "company2"],
      "resources": ["project:accounting_2024"]
    }
  },
  "memberships": {
    "piotr": ["team_accounting"],
    "jan": ["team_accounting"]  // ← Wystarczy dodać Jana do zespołu!
  }
}
```

**Rezultat**: Jan automatycznie dziedziczy wszystkie uprawnienia Piotra.

## Scenariusz 2: Additive Roles - Użytkownik w Wielu Zespołach

### Dane:
```json
{
  "roles": {
    "anna": {
      "fk": ["fk_viewer"]  // Bezpośrednia rola
    }
  },
  "teams": {
    "team_accounting": {
      "roles": {"fk": ["fk_admin"]},
      "companies": ["company1"]
    },
    "team_hr": {
      "roles": {"fk": ["fk_editor"]},
      "companies": ["company2"]
    }
  },
  "memberships": {
    "anna": ["team_accounting", "team_hr"]
  }
}
```

### Efektywne Role Anny (ADDITIVE):
```json
{
  "fk": ["fk_viewer", "fk_admin", "fk_editor"]  // Suma wszystkich ról
}
```

### Efektywne Uprawnienia (Non-Destructive):
```json
{
  "fk": ["view_entry", "edit_entry", "delete_entry", "admin_panel"]
}
```

## Scenariusz 3: Dynamic Resources - Projekty

### Definicja Resource Type:
```json
{
  "resource_types": {
    "project": {
      "name": "Project",
      "actions": ["view", "edit", "delete", "assign_team"],
      "attributes": {
        "name": {"type": "string", "required": true},
        "owner": {"type": "string", "required": true},
        "budget": {"type": "number", "required": false},
        "status": {"type": "enum", "values": ["active", "completed"]}
      },
      "relationships": {
        "owner": {"type": "user", "cardinality": "one"},
        "companies": {"type": "company", "cardinality": "many"},
        "parent_project": {"type": "project", "cardinality": "one"}
      }
    }
  }
}
```

### Resource Instances:
```json
{
  "resources": {
    "project:modernization_2024": {
      "type": "project",
      "attributes": {
        "name": "Factory Modernization 2024",
        "owner": "anna",
        "budget": 500000,
        "status": "active"
      },
      "relationships": {
        "companies": ["company1"],
        "parent_project": null
      }
    },
    "project:phase1_electrical": {
      "type": "project",
      "attributes": {
        "name": "Phase 1: Electrical Systems",
        "owner": "jan",
        "budget": 150000,
        "status": "active"
      },
      "relationships": {
        "companies": ["company1"],
        "parent_project": "project:modernization_2024"
      }
    }
  }
}
```

## Scenariusz 4: Autoryzacja OR Logic

### Query OPA:
```json
{
  "input": {
    "user_id": "anna",
    "tenant_id": "tenant125",
    "app": "fk",
    "action": "edit_entry",
    "company_id": "company1",
    "resource_type": "project",
    "resource_id": "project:phase1_electrical"
  }
}
```

### Ewaluacja (3 ścieżki - OR Logic):

#### Ścieżka 1: Direct Permission (RBAC)
```rego
# anna ma bezpośrednią rolę fk_viewer w aplikacji fk
# fk_viewer ma uprawnienia ["view_entry"]
# edit_entry NOT IN ["view_entry"] → FALSE
```

#### Ścieżka 2: Team Permission (REBAC-like)
```rego
# anna należy do team_accounting
# team_accounting ma rolę fk_admin w aplikacji fk
# fk_admin ma uprawnienia ["view_entry", "edit_entry", "delete_entry"]
# edit_entry IN ["view_entry", "edit_entry", "delete_entry"] → TRUE
```

#### Ścieżka 3: Dynamic Resource Permission
```rego
# project:phase1_electrical ma parent project:modernization_2024
# anna jest owner project:modernization_2024
# owner ma pełny dostęp → TRUE
```

**Rezultat**: `allow = TRUE` (bo ścieżka 2 i 3 zwróciły TRUE)

## Scenariusz 5: Resource Explorer UI - Dodanie Nowego Typu

### Administrator dodaje typ "Document":
```json
{
  "resource_types": {
    "document": {
      "name": "Document",
      "description": "Company documents and contracts",
      "actions": ["view", "edit", "sign", "archive"],
      "attributes": {
        "title": {"type": "string", "required": true},
        "author": {"type": "string", "required": true},
        "confidentiality": {"type": "enum", "values": ["public", "internal", "confidential"]},
        "expiry_date": {"type": "date", "required": false}
      },
      "relationships": {
        "author": {"type": "user", "cardinality": "one"},
        "company": {"type": "company", "cardinality": "one"},
        "related_project": {"type": "project", "cardinality": "one"}
      }
    }
  }
}
```

### Auto-generated OPA Bundle:
```rego
# Automatycznie wygenerowane przez system
package dynamic_resources.document

allow if {
    input.resource_type == "document"
    input.action in ["view", "edit", "sign", "archive"]
    
    # Owner access
    resource := data.resources[input.resource_id]
    resource.attributes.author == input.user_id
}

allow if {
    input.resource_type == "document"
    
    # Team access through related project
    resource := data.resources[input.resource_id]
    project_id := resource.relationships.related_project
    
    user_teams := data.memberships[input.user_id]
    some team_id in user_teams
    team := data.teams[team_id]
    project_id in team.resources
}
```

## Scenariusz 6: Migration z Model 1 do Model 2

### Dane Model 1:
```json
{
  "tenant125": {
    "user42": {
      "fk": ["fk_admin"],
      "companies": ["company1", "company2"]
    }
  }
}
```

### Po migracji do Model 2:
```json
{
  "roles": {
    "user42": {
      "fk": ["fk_admin"]
    }
  },
  "access": {
    "user42": {
      "tenant125": ["company1", "company2"]
    }
  },
  "permissions": {
    "fk": {
      "fk_admin": ["view_entry", "edit_entry", "delete_entry"]
    }
  },
  "teams": {},
  "memberships": {}
}
```

**Backwards Compatibility**: Wszystkie istniejące uprawnienia zachowane, gotowe do rozszerzenia o zespoły.

## Podsumowanie Korzyści

### 1. **Łatwość Zarządzania**
- Dodanie pracownika = dodanie do zespołu
- Zmiana uprawnień zespołu = automatyczna propagacja do wszystkich członków

### 2. **Elastyczność**
- ADDITIVE roles (więcej uprawnień, nigdy mniej)
- OR logic (dostęp przez dowolną ścieżkę)
- Dynamic resources (nowe typy bez zmian w kodzie)

### 3. **Skalowalność**
- Teams dla dużych organizacji
- Resource hierarchies (parent-child)
- Auto-generated OPA policies

### 4. **Zgodność**
- Backwards compatibility z Model 1
- Stopniowa migracja możliwa
- Istniejące UI nadal działa 