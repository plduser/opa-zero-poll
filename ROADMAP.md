# Policy Management - Roadmap rozwoju

## 🎯 **Aktualna sytuacja (Faza 1 - COMPLETED ✅)**

**Policy Management Portal** został pomyślnie zintegrowany z portalem Symfonia z następującymi funkcjonalnościami:

- ✅ Dashboard ze statystykami policy
- ✅ Przeglądanie policy (tylko odczyt) 
- ✅ Wyszukiwanie i filtrowanie policy
- ✅ Testowanie policy z mock data
- ✅ Integracja z AppSwitcher portalu Symfonia
- ✅ Responsywny design zgodny z portalem

---

## 🔑 **FAZA 1.5: Struktura bazowych uprawnień - Model 2** (PRIORYTET KRYTYCZNY)

### **Główny cel:**
Zdefiniowanie i implementacja hybrydowego modelu uprawnień (RBAC + REBAC-like) jako fundamentu dla całego systemu.

### **Epic 1: Definicja struktury Model 2**

#### **Zadanie 1.5.1: Zdefiniowanie struktury bazowych uprawnień - Model 2 (ID: 25)**
- **Opis**: Implementacja hybrydowego modelu łączącego separację ról aplikacyjnych od dostępu do firm
- **Struktura docelowa**: roles[user][app], access[user][tenant_id] = [company_id], teams, memberships
- **Komponenty**: Data Provider API, polityki OPA, Migration script, dokumentacja
- **Priorytet**: KRYTYCZNY (blokuje wszystkie pozostałe funkcjonalności)
- **Timeline**: 2 tygodnie

#### **Zadanie 1.5.2: UI dla zarządzania uprawnień Model 2 (ID: 26)**  
- **Opis**: Intuicyjny interfejs w stylu Model 1, zapisujący w strukturze Model 2
- **Interfejsy**: Panel Użytkowników, Panel Zespołów, Panel Firm, Admin Dashboard
- **Technologie**: Next.js 15.2.4, Tailwind CSS, Radix UI, TypeScript
- **Priorytet**: WYSOKI (umożliwia konfigurację uprawnień)
- **Timeline**: 3 tygodnie

#### **Zadanie 1.5.3: Implementacja User Data Sync Service (ID: 40)**
- **Opis**: Komponent odpowiedzialny za propagację zmian uprawnień z Portal Symfonia do OPA w czasie rzeczywistym
- **Funkcjonalności**: 
  - Event-driven synchronizacja z bazy danych PostgreSQL
  - Translacja zmian do formatu OPAL Data Updates  
  - Publikacja do OPAL Server (multi_tenant_data topic)
  - Eventual consistency między Portal UI a OPA
- **Architektura**: Oddzielny mikroservice z API do ręcznego triggerowania i health checks
- **Priorytet**: WYSOKI (kluczowy dla real-time synchronizacji)
- **Timeline**: 2 tygodnie

### **Dlaczego to jest krytyczne:**
🎯 **Wszystkie pozostałe funkcjonalności zależą od poprawnej struktury uprawnień**
- Testowanie z prawdziwymi danymi wymaga Model 2 dla realnych scenariuszy
- Policy Management Portal potrzebuje Model 2 dla zaawansowanych uprawnień  
- Git/GitHub workflow integration wymaga jasnego modelu ról i dostępu
- Multi-environment support opiera się na strukturze teams i memberships
- **User Data Sync Service zapewnia spójność między Portal UI a OPA w czasie rzeczywistym**

---

## 🚀 **FAZA 2: Dynamiczne zarządzanie zasobami** (ZAAWANSOWANE)

### **Główny cel:**
Rozszerzenie systemu o możliwość dynamicznego tworzenia zasobów i precyzyjnego zarządzania uprawnieniami na poziomie pojedynczych obiektów (podobnie do Permit.io).

### **Epic 1: Resource-Based Access Control (REBAC)**

#### **Zadanie 2.1: Bezpośrednie uprawnienia do zasobów**
- **Opis**: Implementacja mechanizmu nadawania uprawnień do konkretnych obiektów (faktury, dokumenty, raporty)
- **Komponenty**: 
  - Rozszerzenie Data Provider API o endpoint `/direct-permissions`
  - Aktualizacja polityk OPA o obsługę `direct_permissions`
  - UI w Portal Symfonia dla zarządzania uprawnieniami do zasobów
  - User Data Sync Service - propagacja zmian bezpośrednich uprawnień
- **Przykłady użycia**:
  - Uprawnienia do konkretnej faktury w KSEF: `invoice_12345: ["read", "approve"]`
  - Dostęp do specyficznego dokumentu w eDokumenty: `document_67890: ["edit", "delete"]`
  - Prawa do określonego raportu: `report_monthly: ["generate", "export"]`
- **Struktura danych**:
  ```javascript
  data.users["user123"].direct_permissions = {
    ksef: { "invoice_12345": ["read", "approve"] },
    ebiuro: { "declaration_555": ["submit"] }
  }
  ```
- **Priorytet**: Średni (po Model 2)
- **Timeline**: 3 tygodnie
- **Dependencies**: Zadanie 1.5.1, 1.5.2 (Model 2), User Data Sync Service

#### **Zadanie 2.2: Dynamiczne rejestrowanie typów zasobów**
- **Opis**: API umożliwiające aplikacjom definiowanie własnych typów zasobów i akcji
- **Komponenty**:
  - Resource Registry Service - katalog typów zasobów per aplikacja
  - Resource Definition API - endpoint do rejestracji nowych typów
  - Schema validation - walidacja struktury zasobów
  - Portal UI - dynamiczne wyświetlanie zasobów aplikacji
- **Przykłady**:
  ```javascript
  // Rejestracja typu zasobu przez aplikację KSEF
  POST /api/resources/register
  {
    "application": "ksef",
    "resource_type": "invoice",
    "actions": ["read", "write", "approve", "delete"],
    "attributes": ["amount", "customer", "status"]
  }
  ```
- **Priorytet**: Średni
- **Timeline**: 4 tygodnie

#### **Zadanie 2.3: Hierarchie zasobów**
- **Opis**: Wsparcie dla hierarchicznych struktur zasobów (Projekt → Zadanie → Podzadanie)
- **Komponenty**: Parent-child relationships, inheritance policies, recursive permissions
- **Priorytet**: Niski
- **Timeline**: 3 tygodnie

### **Epic 2: Portal Symfonia - zaawansowane zarządzanie**

#### **Zadanie 2.4: UI dla zarządzania zasobami**
- **Opis**: Rozszerzenie Portal Symfonia o sekcję "Uprawnienia zaawansowane"
- **Features**:
  - Lista zasobów per aplikacja z możliwością filtrowania
  - Przydzielanie uprawnień do konkretnych obiektów
  - Wizualizacja hierarchii zasobów
  - Bulk operations - masowe zmiany uprawnień
- **Priorytet**: Średni
- **Timeline**: 2 tygodnie

#### **Zadanie 2.5: Auditing i monitoring zasobów**
- **Opis**: System śledzenia zmian uprawnień na poziomie zasobów
- **Components**: Audit log, change tracking, permission analytics
- **Priorytet**: Niski
- **Timeline**: 2 tygodnie

**RAZEM Faza 2: ~14 tygodni (3.5 miesiąca)**

---

## 🧪 **FAZA 3: Testowanie z prawdziwymi danymi systemu** (PRIORYTET WYSOKI)

### **Główny cel:** 
Zastąpienie mock data prawdziwymi danymi z systemu Symfonia dla realistycznego testowania policy.

### **Epic 1: Backend Integration dla prawdziwych danych**

#### **Zadanie 2.1: API do pobierania danych użytkowników**
- **Opis**: Stworzenie endpointów do pobierania prawdziwych danych użytkowników, ról i uprawnień
- **Akceptacja**: 
  - Endpoint `/api/v1/data/users` zwraca listę użytkowników z rolami
  - Endpoint `/api/v1/data/tenants` zwraca listę tenantów
  - Endpoint `/api/v1/data/resources` zwraca listę zasobów systemu
- **Priorytet**: Wysoki
- **Estymacja**: 5 dni

#### **Zadanie 2.2: Data Provider Service**
- **Opis**: Serwis do aggregacji danych z różnych źródeł (HR, ERP, CRM)
- **Akceptacja**:
  - Adapter pattern dla różnych źródeł danych
  - Caching mechanizm dla wydajności
  - Error handling dla nieosiągalnych źródeł
- **Priorytet**: Wysoki  
- **Estymacja**: 8 dni

#### **Zadanie 2.3: Test Data Generator**
- **Opis**: Automatyczne generowanie realistycznych scenariuszy testowych
- **Akceptacja**:
  - Generator scenariuszy na podstawie prawdziwych danych
  - Różne typy testów (pozytywne, negatywne, edge cases)
  - Parametryzowalne scenariusze
- **Priorytet**: Średni
- **Estymacja**: 5 dni

### **Epic 2: Frontend Enhancement dla prawdziwych danych**

#### **Zadanie 2.4: Upgrade PolicyTestModal**
- **Opis**: Rozszerzenie modalu testowania o prawdziwe dane systemu
- **Akceptacja**:
  - Dropdown do wyboru użytkownika z systemu
  - Dropdown do wyboru tenanta
  - Dropdown do wyboru zasobu
  - Auto-generate test data based on selection
- **Priorytet**: Wysoki
- **Estymacja**: 3 dni

#### **Zadanie 2.5: Historia testów**
- **Opis**: Przechowywanie i wyświetlanie historii wykonanych testów
- **Akceptacja**:
  - Tabela z historią testów per policy
  - Możliwość powtórzenia poprzedniego testu
  - Filtrowanie historii po dacie, użytkowniku, wyniku
- **Priorytet**: Średni
- **Estymacja**: 4 dni

#### **Zadanie 2.6: Porównywanie wyników testów**
- **Opis**: Możliwość porównania wyników między wersjami policy
- **Akceptacja**:
  - Side-by-side comparison wyników
  - Highlighting różnic w wynikach
  - Export wyników do CSV/JSON
- **Priorytet**: Niski
- **Estymacja**: 3 dni

### **Epic 3: Monitoring i Analytics**

#### **Zadanie 2.7: Dashboard z metrykami**
- **Opis**: Rozszerzenie dashboardu o metryki z prawdziwych testów
- **Akceptacja**:
  - Wykres trendów testów (passed/failed over time)
  - Top 5 najczęściej testowanych policy
  - Average test execution time
  - Policy coverage metrics
- **Priorytet**: Średni
- **Estymacja**: 4 dni

#### **Zadanie 2.8: Alerting system**
- **Opis**: System powiadomień o problematycznych policy
- **Akceptacja**:
  - Alert gdy policy fail rate > threshold
  - Notification o nowych policy bez testów
  - Weekly report z statusem policy
- **Priorytet**: Niski  
- **Estymacja**: 3 dni

**RAZEM Faza 2: ~35 dni (7 tygodni)**

---

## 🔄 **Faza 3: Integracja z Git/GitHub workflow** (PRIORYTET ŚREDNI)

### **Główny cel:**
Pełna integracja z procesem Git-based policy management zapewniającym code review, CI/CD i kontrolę zmian.

### **Epic 4: Git Integration**

#### **Zadanie 3.1: GitHub API Integration**
- **Opis**: Połączenie z GitHub API dla synchronizacji policy
- **Akceptacja**:
  - Authentication z GitHub (OAuth/PAT)
  - Listing policy files z repo
  - Reading policy content z GitHub
  - Webhook handling dla zmian
- **Priorytet**: Wysoki
- **Estymacja**: 6 dni

#### **Zadanie 3.2: Code Review Workflow**
- **Opis**: Interface do zarządzania Pull Requests
- **Akceptacja**:
  - Lista otwartych PR z policy changes
  - Preview zmian w policy
  - Możliwość testowania policy z PR
  - Link do GitHub PR dla review
- **Priorytet**: Wysoki
- **Estymacja**: 5 dni

#### **Zadanie 3.3: CI/CD Status Integration**
- **Opis**: Wyświetlanie statusów CI/CD pipeline
- **Akceptacja**:
  - Status checks dla każdej policy
  - Build/test results z GitHub Actions
  - Deploy status per environment
  - Quality gates visualization
- **Priorytet**: Średni
- **Estymacja**: 4 dni

### **Epic 5: Version Control Features**

#### **Zadanie 3.4: Historia zmian policy**
- **Opis**: Wyświetlanie pełnej historii zmian z Git
- **Akceptacja**:
  - Timeline zmian per policy
  - Diff viewer między wersjami
  - Blame view dla linii policy
  - Link do commit/PR w GitHub
- **Priorytet**: Średni
- **Estymacja**: 4 dni

#### **Zadanie 3.5: Rollback mechanism**  
- **Opis**: Możliwość rollback do poprzedniej wersji
- **Akceptacja**:
  - One-click rollback przez interface
  - Preview zmian przed rollback
  - Automatic PR creation dla rollback
  - Notification zespołu o rollback
- **Priorytet**: Średni
- **Estymacja**: 5 dni

#### **Zadanie 3.6: Branch management**
- **Opis**: Zarządzanie policy na różnych branch'ach
- **Akceptacja**:
  - Switch między branch'ami w interface
  - Compare policy między branch'ami
  - Testing policy z feature branches
  - Merge conflict detection
- **Priorytet**: Niski
- **Estymacja**: 6 dni

**RAZEM Faza 3: ~30 dni (6 tygodni)**

---

## ⚙️ **Faza 4: Zaawansowane funkcjonalności** (PRIORYTET NISKI)

### **Epic 6: Multi-Environment Support**

#### **Zadanie 4.1: Environment Configuration**
- **Opis**: Zarządzanie policy w różnych środowiskach
- **Akceptacja**:
  - Configuration per environment (dev/staging/prod)
  - Environment-specific testing
  - Cross-environment policy comparison
  - Environment promotion workflow
- **Estymacja**: 8 dni

#### **Zadanie 4.2: A/B Testing Framework**
- **Opis**: Framework do testowania różnych wersji policy
- **Akceptacja**:
  - Traffic splitting configuration
  - A/B test results analysis
  - Gradual rollout mechanism
  - Performance metrics comparison
- **Estymacja**: 10 dni

### **Epic 7: Advanced Integrations**

#### **Zadanie 4.3: Slack/Teams Integration**
- **Opis**: Notyfikacje i interakcje przez chat
- **Akceptacja**:
  - Policy change notifications
  - Test results w channel
  - Slash commands dla basic operations
  - Approval workflow przez chat
- **Estymacja**: 5 dni

#### **Zadanie 4.4: Jira/Azure DevOps Integration**
- **Opis**: Śledzenie zmian policy w issue tracking
- **Akceptacja**:
  - Auto-linking policy changes do tickets
  - Policy testing requirements w tickets
  - Deployment tracking
  - Compliance reporting
- **Estymacja**: 6 dias

#### **Zadanie 4.5: LDAP/AD Integration**
- **Opis**: Enterprise authentication i authorization
- **Akceptacja**:
  - LDAP/AD authentication
  - Role-based access control w Policy Management
  - Group-based permissions
  - SSO integration
- **Estymacja**: 7 dni

**RAZEM Faza 4: ~36 dni (7-8 tygodni)**

---

## 📋 **Podsumowanie timeline**

- **Faza 1**: ✅ COMPLETED (Policy Management Portal)
- **Faza 2**: 🎯 **NAJBLIŻSZY CEL** - Testowanie z prawdziwymi danymi (~7 tygodni)
- **Faza 3**: Git/GitHub integration (~6 tygodni)  
- **Faza 4**: Advanced features (~7-8 tygodni)

**TOTAL DEVELOPMENT TIME: ~20-21 tygodni (5-6 miesięcy)**

---

## 🏆 **Wartość biznesowa per faza**

### **Faza 2: HIGH VALUE** 🔥
- **Realistic testing** eliminuje bugs production
- **Compliance verification** zapewnia bezpieczeństwo  
- **Impact analysis** przed wdrożeniem zmian

### **Faza 3: MEDIUM VALUE** ⚡
- **Proper governance** dla enterprise environments
- **Audit trail** dla compliance
- **Risk reduction** przez controlled changes

### **Faza 4: LOW VALUE** 📈  
- **Operational efficiency** dla dużych zespołów
- **Advanced workflows** dla mature organizations
- **Enterprise integrations** dla compliance

---

**Rekomendacja: Rozpocząć od Fazy 2 - największa wartość biznesowa przy względnie niskim nakładzie pracy!** 🚀 

---

## 🔮 **FAZA 2+: Dynamiczne zarządzanie zasobami** (PRZYSZŁE ROZSZERZENIE)

### **Główny cel:**
Rozszerzenie systemu o możliwość dynamicznego tworzenia zasobów i precyzyjnego zarządzania uprawnieniami na poziomie pojedynczych obiektów (podobnie do Permit.io).

**📋 Szczegółowy opis w dokumentacji: [docs/PORTAL_MANAGEMENT.md - Przyszłe rozszerzenie](docs/PORTAL_MANAGEMENT.md#przyszłe-rozszerzenie---bezpośrednie-uprawnienia-faza-2)**

### **Epic 1: Resource-Based Access Control (REBAC)**

#### **Zadanie 2+.1: Bezpośrednie uprawnienia do zasobów**
- **Opis**: Implementacja mechanizmu nadawania uprawnień do konkretnych obiektów (faktury, dokumenty, raporty)
- **Komponenty**: 
  - Rozszerzenie Data Provider API o endpoint `/direct-permissions`
  - Aktualizacja polityk OPA o obsługę `direct_permissions`
  - UI w Portal Symfonia dla zarządzania uprawnieniami do zasobów
  - User Data Sync Service - propagacja zmian bezpośrednich uprawnień
- **Przykłady użycia**:
  - Uprawnienia do konkretnej faktury w KSEF: `invoice_12345: ["read", "approve"]`
  - Dostęp do specyficznego dokumentu w eDokumenty: `document_67890: ["edit", "delete"]`
  - Prawa do określonego raportu: `report_monthly: ["generate", "export"]`
- **Struktura danych**:
  ```javascript
  data.users["user123"].direct_permissions = {
    ksef: { "invoice_12345": ["read", "approve"] },
    ebiuro: { "declaration_555": ["submit"] }
  }
  ```
- **Priorytet**: Średni (po Model 2)
- **Timeline**: 3 tygodnie
- **Dependencies**: Zadanie 1.5.1, 1.5.2 (Model 2), User Data Sync Service

#### **Zadanie 2+.2: Dynamiczne rejestrowanie typów zasobów**
- **Opis**: API umożliwiające aplikacjom definiowanie własnych typów zasobów i akcji
- **Komponenty**:
  - Resource Registry Service - katalog typów zasobów per aplikacja
  - Resource Definition API - endpoint do rejestracji nowych typów
  - Schema validation - walidacja struktury zasobów
  - Portal UI - dynamiczne wyświetlanie zasobów aplikacji
- **Przykłady**:
  ```javascript
  // Rejestracja typu zasobu przez aplikację KSEF
  POST /api/resources/register
  {
    "application": "ksef",
    "resource_type": "invoice",
    "actions": ["read", "write", "approve", "delete"],
    "attributes": ["amount", "customer", "status"]
  }
  ```
- **Priorytet**: Średni
- **Timeline**: 4 tygodnie

#### **Zadanie 2+.3: Hierarchie zasobów**
- **Opis**: Wsparcie dla hierarchicznych struktur zasobów (Projekt → Zadanie → Podzadanie)
- **Komponenty**: Parent-child relationships, inheritance policies, recursive permissions
- **Priorytet**: Niski
- **Timeline**: 3 tygodnie

### **Epic 2: Portal Symfonia - zaawansowane zarządzanie**

#### **Zadanie 2+.4: UI dla zarządzania zasobami**
- **Opis**: Rozszerzenie Portal Symfonia o sekcję "Uprawnienia zaawansowane"
- **Features**:
  - Lista zasobów per aplikacja z możliwością filtrowania
  - Przydzielanie uprawnień do konkretnych obiektów
  - Wizualizacja hierarchii zasobów
  - Bulk operations - masowe zmiany uprawnień
- **Priorytet**: Średni
- **Timeline**: 2 tygodnie

#### **Zadanie 2+.5: Auditing i monitoring zasobów**
- **Opis**: System śledzenia zmian uprawnień na poziomie zasobów
- **Components**: Audit log, change tracking, permission analytics
- **Priorytet**: Niski
- **Timeline**: 2 tygodnie

### **Zalety rozszerzonej architektury:**

1. **Stopniowe rozwijanie** - nie łamie obecnej architektury
2. **Elastyczność per aplikacja** - każda aplikacja definiuje własne zasoby
3. **Wspólny Data Provider** - dalej jeden punkt zarządzania danymi
4. **Kompatybilność wsteczna** - istniejące polityki nadal działają
5. **Fine-grained control** - precyzyjne uprawnienia na poziomie objektów
6. **Resource-based Access Control** - pełny REBAC dla aplikacji

### **Integracja z dynamicznymi zasobami (Permit.io-like):**

W tej fazie aplikacje będą mogły:
- **Dynamicznie rejestrować nowe typy zasobów** w systemie uprawnień
- **Tworzyć hierarchie zasobów** (np. Projekt → Zadanie → Podzadanie)
- **Definiować własne akcje** specyficzne dla domeny biznesowej
- **Zarządzać cyklem życia zasobów** (tworzenie, modyfikacja, usuwanie)

**Portal Symfonia** będzie w stanie wyświetlać i zarządzać tymi dynamicznymi zasobami bez konieczności zmian w kodzie, podobnie jak dzieje się to w rozwiązaniach typu Permit.io.

**RAZEM Faza 2+: ~14 tygodni (3.5 miesiąca)** 