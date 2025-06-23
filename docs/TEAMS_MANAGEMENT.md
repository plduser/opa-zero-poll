# Teams Management w Model 2: Rozwiązanie dla Dużych Organizacji

## Wprowadzenie

Teams Management to kluczowy komponent Model 2, który rozwiązuje fundamentalne problemy zarządzania uprawnieniami w dużych organizacjach. Zespoły stanowią warstwę abstrakcji między indywidualnymi użytkownikami a systemem uprawnień, umożliwiając skalowalne i spójne zarządzanie dostępem.

## Problemy Dużych Organizacji

### 1. **Problem Skali**
W organizacjach z setkami lub tysiącami użytkowników zarządzanie uprawnieniami indywidualnie staje się niewykonalne:
- Administrator musi ręcznie konfigurować każdego użytkownika
- Każda zmiana organizacyjna wymaga aktualizacji setek rekordów
- Ryzyko błędów i niespójności rośnie exponencjalnie
- Audyt uprawnień staje się praktycznie niemożliwy

### 2. **Problem Spójności**
```
Scenariusz: Zespół Księgowy (15 osób)
Bez Teams: 15 × indywidualnych konfiguracji = 15 miejsc na błędy
Z Teams: 1 × konfiguracja zespołu + 15 × członkostwo = spójność gwarantowana
```

### 3. **Problem Organizacyjnej Rzeczywistości**
Tradycyjne RBAC nie odzwierciedla rzeczywistej struktury organizacyjnej:
- Ludzie pracują w zespołach, nie jako izolowane jednostki
- Uprawnienia są często zespołowe, nie indywidualne
- Odpowiedzialność i delegation działają na poziomie zespołów

### 4. **Problem Audytu i Compliance**
```
Pytanie auditora: "Kto ma dostęp do danych finansowych firmy XYZ?"
Bez Teams: Przegląd 200+ indywidualnych uprawnień
Z Teams: Sprawdzenie zespołu "Księgowi_XYZ" i jego członków
```

## Rozwiązanie: Teams jako Warstwa Abstrakcji

### Koncepcja Architekturalna

Teams w Model 2 działają jako **organizacyjne namespace'y** które:
1. **Grupują użytkowników** o podobnych potrzebach dostępu
2. **Definiują role i uprawnienia** na poziomie zespołu
3. **Określają scope dostępu** (firmy, zasoby)
4. **Umożliwiają delegation** zarządzania uprawnień
5. **Zapewniają audytowalność** przez grupowanie logiczne

### Struktura Zespołu

```json
{
  "teams": {
    "księgowi_abc": {
      "name": "Księgowi ABC Sp. z o.o.",
      "description": "Zespół księgowy obsługujący firmę ABC",
      "team_type": "functional",
      "tenant_id": "tenant125",
      "roles": {
        "fk": ["fk_admin"],
        "hr": ["hr_viewer"]  
      },
      "companies": ["company1"],
      "status": "active"
    }
  },
  "memberships": {
    "user42": ["księgowi_abc"],
    "user99": ["księgowi_abc"]
  }
}
```

## Typy Zespołów

### 1. **Functional Teams** - Zespoły Funkcjonalne
```json
{
  "kadry": {
    "name": "Zespół Kadr",
    "team_type": "functional",
    "roles": {
      "hr": ["hr_editor", "hr_admin"]
    },
    "companies": ["company7", "company8", "company12"]
  }
}
```
**Zastosowanie:** Zespoły HR, księgowi, sprzedaż - trwałe struktury organizacyjne

### 2. **Project Teams** - Zespoły Projektowe  
```json
{
  "projekt_erp": {
    "name": "Implementacja ERP",
    "team_type": "project", 
    "roles": {
      "erp": ["erp_admin"],
      "fk": ["fk_viewer"]
    },
    "companies": ["company1", "company2"]
  }
}
```
**Zastosowanie:** Czasowe zespoły projektowe z określonym celem

### 3. **Department Teams** - Zespoły Departamentowe
```json
{
  "dział_finansowy": {
    "name": "Dział Finansowy",
    "team_type": "department",
    "roles": {
      "fk": ["fk_admin"],
      "hr": ["hr_viewer"],
      "crm": ["crm_viewer"]
    }
  }
}
```
**Zastosowanie:** Duże działy z szerokim zakresem uprawnień

### 4. **External Teams** - Zespoły Zewnętrzne
```json
{
  "biuro_rachunkowe_xyz": {
    "name": "Biuro Rachunkowe XYZ", 
    "team_type": "external",
    "roles": {
      "fk": ["fk_admin"]
    },
    "companies": ["company20", "company21"]
  }
}
```
**Zastosowanie:** Dostawcy usług, partnerzy, zespoły outsourcingowe

## Role w Zespole

### Hierarchia Ról Zespołowych

1. **Admin** - Administrator zespołu
   - Może zarządzać członkami zespołu
   - Może modyfikować uprawnienia zespołu
   - Może delegować uprawnienia
   - Pełny dostęp do zasobów zespołu

2. **Lead** - Lider zespołu  
   - Może dodawać/usuwać członków
   - Może zarządzać przydziałem zadań
   - Ograniczone uprawnienia administracyjne

3. **Member** - Członek zespołu
   - Dostęp do zasobów zespołu zgodnie z rolami aplikacyjnymi
   - Nie może zarządzać zespołem
   - Standardowe uprawnienia użytkownika

### Additive Permission Model

```json
{
  "user_effective_permissions": {
    "direct_roles": ["fk_viewer"],           // Role bezpośrednie
    "team_roles": {
      "księgowi_abc": ["fk_admin"],          // Role z zespołu 1
      "kadry": ["hr_editor"]                 // Role z zespołu 2  
    },
    "effective_combined": ["fk_viewer", "fk_admin", "hr_editor"]
  }
}
```

**Kluczowa zasada:** Użytkownik posiada **sumę** wszystkich uprawnień:
- Bezpośrednich (individual)
- Z wszystkich zespołów których jest członkiem (additive)

## Scenariusze Użycia

### Scenariusz 1: Nowy Pracownik Księgowy

**Tradycyjne podejście:**
1. Sprawdź jakie uprawnienia mają inni księgowi
2. Skonfiguruj indywidualnie każdą rolę i dostęp
3. Ryzyko pomylenia lub pominięcia uprawnień

**Podejście Teams:**
1. Dodaj użytkownika do zespołu "Księgowi ABC"
2. Automatycznie otrzymuje wszystkie uprawnienia zespołu
3. Gwarancja spójności z resztą zespołu

```bash
# API call
POST /api/teams/księgowi_abc/members
{
  "user_id": "user456",
  "role_in_team": "member"
}
```

### Scenariusz 2: Zmiana Zakresu Dostępu Zespołu

**Sytuacja:** Zespół księgowy przejmuje obsługę nowej firmy

**Tradycyjne podejście:**
1. Znajdź wszystkich członków zespołu księgowego
2. Ręcznie dodaj dostęp do nowej firmy każdemu członkowi
3. Ryzyko pominięcia kogoś lub błędu

**Podejście Teams:**
1. Dodaj firmę do teams.companies
2. Wszyscy członkowie automatycznie otrzymują dostęp

```json
{
  "teams": {
    "księgowi_abc": {
      "companies": ["company1", "company5"]  // Dodano company5
    }
  }
}
```

### Scenariusz 3: Audit Uprawnień

**Pytanie:** "Kto ma dostęp administracyjny do systemu FK w firmie ABC?"

**Tradycyjne podejście:**
```sql
SELECT u.username FROM users u 
JOIN user_roles ur ON u.user_id = ur.user_id 
JOIN user_companies uc ON u.user_id = uc.user_id
WHERE ur.role = 'fk_admin' AND uc.company_id = 'company1'
```

**Podejście Teams:**
```sql
SELECT u.username FROM users u
JOIN team_memberships tm ON u.user_id = tm.user_id  
JOIN teams t ON tm.team_id = t.team_id
WHERE 'fk_admin' = ANY(t.roles->'fk') 
  AND 'company1' = ANY(t.companies)
```

**Wynik:** Jasna odpowiedź "Członkowie zespołu Księgowi ABC"

### Scenariusz 4: Delegation - Delegowanie Zarządzania

```json
{
  "team_memberships": {
    "user_manager": {
      "team_id": "księgowi_abc",
      "role_in_team": "admin"  // Może zarządzać zespołem
    }
  }
}
```

Manager zespołu może:
- Dodawać/usuwać członków zespołu
- Zmieniać role członków w zespole (member ↔ lead)
- Zarządzać dostępem zespołu do aplikacji/firm
- **Nie może** nadawać uprawnień poza scope zespołu

## Implementacja w UI

### Portal Symfonia - Zarządzanie Zespołami

**Widok listy zespołów:**
```
/ustawienia/zespoly/
├── Zespół Kadr (12 członków, 3 firmy)
├── Księgowi ABC (5 członków, 1 firma)  
├── Sprzedaż Północ (8 członków, 4 firmy)
└── [+ Utwórz nowy zespół]
```

**Widok szczegółów zespołu:**
```
/ustawienia/zespoly/księgowi_abc/
├── Informacje podstawowe
├── Członkowie zespołu (5)
│   ├── Jan Kowalski (Admin)
│   ├── Anna Nowak (Lead)
│   ├── Piotr Wiśniewski (Member)
│   └── [+ Dodaj członka]
├── Dostęp do aplikacji (2)
│   ├── FK - fk_admin
│   ├── HR - hr_viewer
│   └── [+ Nadaj dostęp]
└── Dostęp do firm (1)
    ├── ABC Sp. z o.o.
    └── [+ Dodaj firmę]
```

### Workflow Dodawania Członka

1. **Wybór użytkownika** - autocomplete z listy użytkowników tenanta
2. **Wybór roli w zespole** - member/lead/admin
3. **Automatyczne dziedziczenie** - użytkownik otrzymuje wszystkie uprawnienia zespołu
4. **Notyfikacja** - powiadomienie o dodaniu do zespołu

## Autoryzacja w OPA

### Sprawdzanie Uprawnień Zespołowych

```rego
# Sprawdź uprawnienia zespołowe
team_permission if {
    # Znajdź zespoły użytkownika
    user_teams := data.memberships[input.user_id]
    some team_id in user_teams
    
    # Sprawdź zespół
    team := data.teams[team_id]
    team.tenant_id == input.tenant_id
    input.company_id in team.companies
    
    # Sprawdź rolę zespołową (ADDITIVE)
    team_roles := team.roles[input.app]
    some role in team_roles
    
    # Sprawdź uprawnienia roli
    role_permissions := data.permissions[input.app][role]
    input.action in role_permissions
}
```

### Query Helpers

```rego
# Pobierz wszystkie zespoły użytkownika
user_teams[team] if {
    teams := data.memberships[input.user_id]
    some team_id in teams
    team := data.teams[team_id]
}

# Pobierz wszystkie efektywne role (bezpośrednie + zespołowe)
user_effective_roles[app] := roles if {
    # Role bezpośrednie
    direct_roles := object.get(data.roles[input.user_id], app, [])
    
    # Role zespołowe
    team_roles := [role |
        user_teams := data.memberships[input.user_id]
        some team_id in user_teams
        team := data.teams[team_id]
        some role in object.get(team.roles, app, [])
    ]
    
    # Suma wszystkich ról (ADDITIVE)
    all_roles := array.concat(direct_roles, team_roles)
    roles := {role | some role in all_roles}
}
```

## Korzyści Biznesowe

### 1. **Redukcja Kompleksności Zarządzania**
- **Było:** 100 użytkowników × 10 aplikacji × 5 firm = 5000 konfiguracji
- **Jest:** 10 zespołów × 10 aplikacji × 5 firm = 500 konfiguracji + członkostwo

### 2. **Zwiększona Spójność**
- Wszyscy członkowie zespołu mają identyczne uprawnienia bazowe
- Automatyczna synchronizacja przy zmianach organizacyjnych
- Eliminacja "drift" uprawnień między podobnymi rolami

### 3. **Lepszy Audit i Compliance**
- Jasna odpowiedź na pytanie "kto ma dostęp"
- Logiczne grupowanie dla audytorów
- Tracking zmian na poziomie zespołów

### 4. **Scalable Delegation**
- Team Leaders mogą zarządzać swoimi zespołami
- Zmniejszenie obciążenia administratorów systemu
- Lepsze dopasowanie do struktury organizacyjnej

### 5. **Flexible Organizational Changes**
- Łatwe przenoszenie ludzi między zespołami
- Szybkie tworzenie zespołów projektowych
- Zmiana scope'u dostępu zespołu bez indywidualnych modyfikacji

## Migration Path

### Faza 1: Mapowanie Istniejących Grup
1. Zidentyfikuj naturalne grupy użytkowników
2. Utwórz zespoły odpowiadające tym grupom
3. Przenieś wspólne uprawnienia na poziom zespołu

### Faza 2: Gradualna Migracja
1. Zachowaj istniejące indywidualne uprawnienia (backward compatibility)
2. Dodaj użytkowników do odpowiednich zespołów
3. Stopniowo usuwaj duplikujące się indywidualne uprawnienia

### Faza 3: Teams-First Approach
1. Nowi użytkownicy dostają uprawnienia przez zespoły
2. Wyjątki indywidualne tylko dla uzasadnionych przypadków
3. Regular audit i cleanup duplikatów

## Podsumowanie

Teams Management w Model 2 rozwiązuje fundamentalne problemy skalowalności RBAC w dużych organizacjach przez wprowadzenie warstwy abstrakcji, która:

- **Odzwierciedla rzeczywistą strukturę organizacyjną**
- **Zapewnia skalowalne zarządzanie uprawnieniami**  
- **Gwarantuje spójność uprawnień w zespołach**
- **Umożliwia efektywny audit i compliance**
- **Wspiera delegation i decentralizację zarządzania**

Model additive (suma uprawnień indywidualnych i zespołowych) zapewnia backward compatibility, umożliwiając stopniową migrację z tradycyjnego RBAC do zespół-centrycznego podejścia. 