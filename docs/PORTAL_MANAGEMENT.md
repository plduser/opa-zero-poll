# Portal Symfonia - Zarządzanie Uprawnieniami

## Przegląd

Portal Symfonia jest centralnym interfejsem użytkownika do zarządzania uprawnieniami w ekosystemie aplikacji Symfonia. Implementuje zaawansowany system oparty na koncepcji **Application Profiles**, który umożliwia separację odpowiedzialności między zespołami przy zachowaniu spójności i bezpieczeństwa całego systemu.

## Koncepcja Application Profiles

### Definicja
**Application Profile** to warstwa abstrakcji między interfejsem użytkownika Portalu a szczegółowymi rolami technicznymi w poszczególnych aplikacjach. Profile stanowią "umowę" między zespołem Portalu a zespołami aplikacji.

### Zalety Architecture Profiles

#### 1. **Separacja odpowiedzialności między zespołami**
- **Zespół Portal Symfonia** - odpowiada za:
  - Interfejs użytkownika do zarządzania uprawnieniami
  - Koncepcję Application Profiles jako warstwy abstrakcji
  - Mapowanie Profili na role bazowe
  - Zarządzanie dostępem do firm (companies)

- **Zespoły aplikacji** (KSEF, eBiuro, eDokumenty, etc.) - odpowiadają za:
  - Własne polityki OPA specyficzne dla ich domeny
  - Rozszerzanie bazowego systemu o dodatkowe reguły
  - Własne interpretacje ról i uprawnień
  - Definicję mapowań Profile → Role

#### 2. **Elastyczność systemów uprawnień per aplikacja**
- **KSEF/eBiuro**: User może należeć tylko do jednej roli
- **eDokumenty**: User może mieć kilka ról jednocześnie
- **Inne aplikacje**: Mogą implementować własne modele uprawnień

#### 3. **Izolacja zmian**
- Zmiany w politykach aplikacji X nie wpływają na aplikację Y
- Zespoły mogą niezależnie rozwijać swoje reguły autoryzacji
- Bazowe struktury danych pozostają niezmienione

#### 4. **Możliwość rozszerzania**
- Aplikacje mogą dodawać własne polityki do wydzielonych katalogów w GitHub
- OPAL Client per aplikacja subskrybuje:
  - Bazowe polityki (wspólne dla wszystkich)
  - Specyficzne polityki z dedykowanego katalogu aplikacji

## Struktura Portalu

### Główne sekcje
1. **Użytkownicy** - zarządzanie użytkownikami i ich uprawnieniami
2. **Firmy** - zarządzanie firmami w ramach tenantów
3. **Ustawienia** - konfiguracja systemu

### Proces zarządzania uprawnieniami

#### 1. **Dodawanie użytkownika**
```
Portal → Formularz nowego użytkownika
├── Dane podstawowe (email, imię, nazwisko)
├── Rola ogólna (Administrator/Użytkownik)
└── Tenant assignment
```

#### 2. **Przydzielanie uprawnień do aplikacji**
Administrator w Portalu wybiera jedną z trzech metod nadawania uprawnień:

```
Portal → Edycja użytkownika → "Nadaj dostęp do aplikacji"
├── Wybór aplikacji (KSEF, eBiuro, eDokumenty, etc.)
└── Wybór metody uprawnień:
    ├── **PROFIL** (zalecane)
    │   ├── Administrator → [ksef_admin] + [grupy] + [uprawnienia]
    │   ├── Księgowa → [ksef_accountant] + [grupy] + [uprawnienia]
    │   └── Handlowiec → [ksef_sales] + [uprawnienia ograniczone]
    ├── **GRUPY** (zaawansowane)
    │   ├── Administrator KSEF
    │   ├── Wystawiający faktury
    │   ├── Odbierający faktury
    │   └── Przeglądający
    └── **BEZPOŚREDNIE UPRAWNIENIA** (precyzyjne)
        ├── Zarządzanie uprawnieniami
        ├── Odczyt uprawnień
        ├── Wystawianie faktur
        └── Odbieranie faktur
```

#### 3. **Wykonanie mapowania w tle**
```
System backend automatycznie:
├── Odczytuje mapowania Profilu dla danej aplikacji
├── Wykonuje INSERT do tabel: user_roles, user_groups, user_permissions
├── Wyzwala User Data Sync Service
└── Propaguje zmiany do OPA przez OPAL
```

#### 4. **Widok w aplikacji docelowej**
```
Aplikacja KSEF → Ustawienia → Uprawnienia
├── Tabela użytkowników z kolumnami:
│   ├── Użytkownik, Email
│   ├── **Profil** (jeśli nadany przez Profil)
│   ├── **Bezpośrednie uprawnienia** (jeśli nadane indywidualnie)
│   └── Akcje (edytuj/usuń)
└── Możliwość lokalnego zarządzania przez administratora aplikacji
```

#### 5. **Zarządzanie dostępem do firm**
```
Portal → Edycja użytkownika → Sekcja "Dostęp do firm"
├── Lista firm w ramach tenanta
├── Przydzielanie/odbieranie dostępu (niezależne od Profili)
└── Kontrola zasobów per firma (REBAC)
```

## Model danych w Portalu

### Kluczowe tabele
- **users** - globalni użytkownicy systemu
- **tenants** - izolacja multi-tenant
- **companies** - firmy w ramach tenantów (zasoby)
- **applications** - aplikacje w ekosystemie
- **application_profiles** - profile jako warstwa abstrakcji
- **roles** - szczegółowe role techniczne
- **user_access** - przydzielenie użytkowników do firm
- **user_application_access** - uprawnienia użytkowników do aplikacji

### Mapowania
```sql
-- Mapowanie Profile → Role per aplikacja
profile_role_mappings:
  application_id → application_profile_id → role_id

-- Przykład dla aplikacji "Finanse i Księgowość":
"Administrator" → ["fk_admin", "fk_full_access"]
"Edytor" → ["fk_editor", "fk_read_write"]  
"Przeglądający" → ["fk_viewer", "fk_read_only"]
```

## Integracja z OPA

### Przepływ danych
1. **Portal** - administrator zarządza uprawnieniami przez UI z użyciem Application Profiles
2. **Profile → Role Mapping** - podczas przydziału Profilu uruchamia się kod, który:
   - Odczytuje mapowania Profilu na role i grupy dla danej aplikacji
   - Zapisuje konkretne przypisania ról do użytkownika w bazie danych
   - Wyzwala User Data Sync Service do propagacji zmian
3. **User Data Sync Service** - propaguje zmiany do OPA w czasie rzeczywistym
4. **Data Provider API** - dostarcza dane do OPAL (partycjonowanie per tenant)
5. **OPAL Server/Client** - synchronizuje polityki i dane
6. **OPA** - ewaluuje uprawnienia na podstawie ról i uprawnień (bez wiedzy o Profilach)

### Model autoryzacji w OPA

**Profile są transparentne dla OPA** - polityki operują wyłącznie na rolach i uprawnieniach:

```rego
# Bazowa polityka - sprawdza role użytkownika w aplikacji
allow {
    user_roles := data.users[input.user_id].roles[input.application]
    role := user_roles[_]
    
    # Delegacja do polityki aplikacji
    app_policy_allow(role, input.action, input.resource)
}

# Polityka aplikacji - interpretuje role w kontekście aplikacji
app_policy_allow(role, action, resource) {
    role == "ksef_admin"
    # Administrator KSEF może wszystko
}

app_policy_allow(role, action, resource) {
    role == "ksef_issuer"
    action == "issue_invoice"
    # Wystawiający faktury może wystawiać faktury
}

# Sprawdzanie uprawnień przez grupy
allow {
    user_groups := data.users[input.user_id].groups[input.application]
    group := user_groups[_]
    group_permissions := data.groups[group].permissions
    permission := group_permissions[_]
    permission == required_permission(input.action, input.resource)
}

# Sprawdzanie bezpośrednich uprawnień
allow {
    user_permissions := data.users[input.user_id].permissions[input.application]
    permission := user_permissions[_]
    permission == required_permission(input.action, input.resource)
}
```

### Workflow przydziału uprawnień

#### 1. **Wybór Profilu w Portal Symfonia**
Administrator wybiera Application Profile (np. "Administrator KSEF")

#### 2. **Mapowanie Profilu → Role/Grupy/Uprawnienia**
```javascript
// Przykład mapowania dla aplikacji KSEF
const profileMappings = {
  "Administrator": {
    roles: ["ksef_admin"],
    groups: ["Administrator KSEF"],
    permissions: ["zarządzanie_uprawnieniami", "odczyt_uprawnień"]
  },
  "Księgowa": {
    roles: ["ksef_accountant"],
    groups: ["Wystawiający faktury", "Odbierający faktury"],
    permissions: ["wystawianie_faktur", "odbieranie_faktur"]
  },
  "Handlowiec": {
    roles: ["ksef_sales"],
    groups: ["Wystawiający faktury"],
    permissions: ["wystawianie_faktur"]
  }
}
```

#### 3. **Zapisanie w bazie danych**
System zapisuje konkretne przypisania:
```sql
-- Zapisanie ról użytkownika
INSERT INTO user_roles (user_id, application_id, role_name)
VALUES (123, 'ksef', 'ksef_admin');

-- Zapisanie członkostwa w grupach
INSERT INTO user_groups (user_id, application_id, group_name)
VALUES (123, 'ksef', 'Administrator KSEF');

-- Zapisanie bezpośrednich uprawnień
INSERT INTO user_permissions (user_id, application_id, permission_name)
VALUES (123, 'ksef', 'zarządzanie_uprawnieniami');
```

#### 4. **Widoczność w aplikacjach**
- **Portal Symfonia** - widzi tylko Profile (abstrakcja)
- **Aplikacja KSEF** - widzi role, grupy i uprawnienia (szczegóły implementacyjne)
- **OPA** - operuje tylko na rolach i uprawnieniach

### Zalety tego podejścia

1. **Ukrycie złożoności** - Portal pokazuje proste Profile zamiast skomplikowanych ról
2. **Separacja odpowiedzialności** - zespoły aplikacji definiują własne mapowania
3. **Elastyczność** - różne aplikacje mogą interpretować ten sam Profil różnie
4. **Rozszerzalność** - można dodawać nowe Profile bez zmian w OPA
5. **Spójność UX** - jednolity interfejs w Portalu dla wszystkich aplikacji

### Przyszłe rozszerzenie - bezpośrednie uprawnienia (Faza 2)

#### **Problem do rozwiązania**
Niektóre aplikacje mogą potrzebować indywidualnego nadawania uprawnień do konkretnych zasobów (bez pośrednictwa ról). Przykłady:
- Uprawnienia do konkretnej faktury w KSEF
- Dostęp do specyficznego dokumentu w eDokumenty
- Prawa do określonego raportu w Finanse

#### **Architektura rozszerzona**

**Data Provider API** będzie dostarczać dodatkowe dane per aplikacja:

```javascript
// Obecne dane bazowe (Faza 1)
data.users["user123"] = {
  roles: { ksef: ["ksef_sales"] },
  companies: ["company1", "company2"]
}

// Rozszerzenie - bezpośrednie uprawnienia (Faza 2)
data.users["user123"] = {
  roles: { ksef: ["ksef_sales"] },
  companies: ["company1", "company2"],
  direct_permissions: {
    ksef: {
      "invoice_12345": ["read", "approve"],
      "document_67890": ["edit", "delete"],
      "report_monthly": ["generate"]
    },
    ebiuro: {
      "declaration_555": ["submit", "validate"]
    }
  }
}
```

**Polityki OPA** będą obsługiwać oba mechanizmy:

```rego
# Sprawdzanie przez role (obecne)
allow {
    user_roles := data.users[input.user_id].roles[input.application]
    role := user_roles[_]
    app_policy_allow(role, input.action, input.resource)
}

# Sprawdzanie bezpośrednich uprawnień (przyszłe)
allow {
    user_direct := data.users[input.user_id].direct_permissions[input.application]
    resource_perms := user_direct[input.resource_id]
    input.action in resource_perms
}

# Kombinacja - użytkownik może mieć dostęp przez rolę LUB bezpośrednie uprawnienie
allow {
    # Dostęp przez rolę
    user_roles := data.users[input.user_id].roles[input.application]
    role := user_roles[_]
    app_policy_allow(role, input.action, input.resource)
}

allow {
    # Dostęp bezpośredni
    user_direct := data.users[input.user_id].direct_permissions[input.application]
    resource_perms := user_direct[input.resource_id]
    input.action in resource_perms
}
```

#### **UI w Portal Symfonia (Faza 2)**

```
Edycja użytkownika → Aplikacja KSEF → "Uprawnienia zaawansowane"
├── **Uprawnienia przez Profile/Role** (obecne)
│   └── Księgowa → [ksef_accountant] + standardowe uprawnienia
└── **Bezpośrednie uprawnienia do zasobów** (nowe)
    ├── Lista zasobów aplikacji
    │   ├── Faktury → Faktura #12345 → [read, approve]
    │   ├── Dokumenty → Dokument #67890 → [edit, delete]
    │   └── Raporty → Raport miesięczny → [generate]
    └── Przycisk "Dodaj uprawnienie do zasobu"
```

#### **Data Provider API extension**

```javascript
// Nowy endpoint dla bezpośrednich uprawnień
GET /api/tenant/{tenant_id}/direct-permissions

Response:
{
  "users": {
    "user123": {
      "ksef": {
        "invoice_12345": ["read", "approve"],
        "document_67890": ["edit", "delete"]
      },
      "ebiuro": {
        "declaration_555": ["submit", "validate"]
      }
    }
  },
  "resource_definitions": {
    "ksef": {
      "invoice": ["read", "write", "approve", "delete"],
      "document": ["read", "write", "edit", "delete"],
      "report": ["read", "generate", "export"]
    }
  }
}
```

#### **Zalety rozszerzonej architektury**

1. **Stopniowe rozwijanie** - nie łamie obecnej architektury
2. **Elastyczność per aplikacja** - każda aplikacja definiuje własne zasoby
3. **Wspólny Data Provider** - dalej jeden punkt zarządzania danymi
4. **Kompatybilność wsteczna** - istniejące polityki nadal działają
5. **Fine-grained control** - precyzyjne uprawnienia na poziomie objektów
6. **Resource-based Access Control** - pełny REBAC dla aplikacji

#### **Integracja z dynamicznymi zasobami (Permit.io-like)**

W Fazie 2 aplikacje będą mogły:
- **Dynamicznie rejestrować nowe typy zasobów** w systemie uprawnień
- **Tworzyć hierarchie zasobów** (np. Projekt → Zadanie → Podzadanie)
- **Definiować własne akcje** specyficzne dla domeny biznesowej
- **Zarządzać cyklem życia zasobów** (tworzenie, modyfikacja, usuwanie)

**Portal Symfonia** będzie w stanie wyświetlać i zarządzać tymi dynamicznymi zasobami bez konieczności zmian w kodzie, podobnie jak dzieje się to w rozwiązaniach typu Permit.io.

## Roadmap - Faza 2

### Dynamiczne zarządzanie zasobami
Planowany mechanizm podobny do Permit.io do dynamicznego tworzenia zasobów:

- **Aplikacje** będą mogły definiować własne typy zasobów
- **Profile** będą rozszerzane o uprawnienia do konkretnych zasobów
- **Polityki** będą generowane dynamicznie na podstawie definicji zasobów
- **Bazowe struktury danych** pozostaną niezmienione

### Korzyści dla zespołów
- **Większa autonomia** zespołów aplikacji
- **Szybsze wprowadzanie** nowych funkcjonalności
- **Lepsza skalowalność** systemu uprawnień
- **Zachowanie spójności** architektury

## Podsumowanie

Portal Symfonia z koncepcją Application Profiles zapewnia:
- **Spójny interfejs** zarządzania uprawnieniami
- **Elastyczność** dla zespołów aplikacji  
- **Skalowalność** systemu
- **Izolację** między aplikacjami
- **Możliwość rozszerzania** bez wpływu na inne komponenty

Ten model umożliwia efektywną współpracę wielu zespołów przy zachowaniu bezpieczeństwa i spójności całego ekosystemu aplikacji Symfonia. 