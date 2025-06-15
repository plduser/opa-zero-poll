# Product Requirements Document (PRD): System RBAC Zero-Polling z OPAL + OPA + Policy Viewer Portal

## 1. Cel projektu
System autoryzacji RBAC dla środowiska SaaS, oparty o OPA i OPAL, umożliwiający dynamiczne zarządzanie uprawnieniami, synchronizację polityk i danych bez aktywnego odpytywania (zero-polling), z obsługą wielu tenantów i aplikacji, rozszerzony o **Policy Viewer Portal** do przeglądania aktualnych polityk przez interfejs webowy.

## 2. Zakres projektu
- Obsługa wielu aplikacji (fk, ksef, hr, edeklaracje, edokumenty)
- Użytkownicy przypisani do wielu tenantów i firm
- Uprawnienia oparte na rolach per aplikacja
- Dostęp do firm ograniczony przez ACL na poziomie tenantów
- Dynamiczne provisionowanie tenantów i danych przez **OPAL External Data Sources**
- **Portal przeglądania polityk** zintegrowany z systemem uprawnień Symfonia

## 3. Wymagania funkcjonalne
1. System musi umożliwiać:
   - Dynamiczne provisionowanie nowych tenantów przez API
   - Przypisywanie użytkowników do tenantów i firm
   - Definiowanie ról i uprawnień per aplikacja
   - Synchronizację polityk Rego z repozytorium GitHub do OPA przez OPAL
   - **Per-tenant data sources przez OPAL External Data Sources z JWT authentication**
   - **HTTP 307 redirects z tenant_id w JWT claims**
   - Ewaluację uprawnień przez OPA (data.policies.rbac.allow)
2. API Data Provider musi zwracać strukturę danych dla tenanta:
   - tenants, companies, roles, permissions
   - **Implementować OPAL External Data Sources API**
   - **Obsługiwać JWT token validation i per-tenant DataSourceConfig**
3. API Provisioning musi umożliwiać rejestrację nowego tenant'a i dynamiczne dodanie źródła danych do OPAL
4. **Policy Viewer Portal** musi umożliwiać:
   - Przeglądanie aktualnych polityk Rego w czytelnej formie
   - Listę wszystkich polityk z podstawowymi informacjami
   - Szczegółowy widok polityki z syntax highlighting
   - Integrację z systemem autoryzacji portalu Symfonia
   - **NIE zawiera**: edycji, tworzenia, czy usuwania polityk (zarządzane przez CI/CD + GitHub)

## 4. Wymagania niefunkcjonalne
- Brak aktywnego odpytywania (zero-polling)
- Wysoka wydajność i skalowalność
- Obsługa cold start i restartu systemu
- Możliwość rozbudowy o nowe aplikacje i typy zasobów
- Testowalność (opa test), benchmarki wydajności (opa bench)
- **Intuicyjny interfejs użytkownika** zintegrowany z portalem Symfonia
- **Bezpieczeństwo**: autoryzacja dostępu do zarządzania politykami

## 5. Architektura
### Warstwa Core (istniejąca):
- OPAL Server: klonuje repozytorium polityk, publikuje zdarzenia, obsługuje dynamiczne źródła danych
- OPAL Client: subskrybuje polityki i dane, synchronizuje z OPA (inline)
- OPA: silnik decyzyjny, ewaluacja **hybrydowych reguł RBAC + REBAC-like** (role aplikacyjne + zespoły + dziedziczenie)
- Data Provider API: zwraca dane ACL dla tenantów
- Provisioning API: rejestruje tenantów, dodaje źródła danych do OPAL

### Warstwa Policy Viewer (nowa):
- **Next.js Portal Symfonia**: rozszerzony o aplikację `/app/policy-management/`
- **Bezpośrednia integracja z OPAL Server**: pobieranie polityk przez Portal API calls
- **Architektura**: Portal → OPAL Server API (direct connection)

## 6. Komponenty i interfejsy
### Istniejące:
- **OPAL Server**: API /data/config, klonowanie polityk z GitHub
- **OPAL Client**: subskrypcja topiców, aktualizacja OPA
- **OPA**: endpointy decyzyjne (np. /v1/data/policies/rbac/allow)
- **Data Provider API**: GET /access/<tenant_id>
- **Provisioning API**: POST /provision-tenant

### Nowe - Policy Management:
- **Portal Policy Management**: `/app/policy-management/` - interfejs zarządzania
- **FastAPI Policy Service**: 
  - POST `/api/v1/webhooks/github` - GitHub webhook receiver
  - GET/POST/PUT/DELETE `/api/v1/policies/*` - policy CRUD (proxy do OPAL)
  - POST `/api/v1/policies/validate` - walidacja Rego 
  - POST `/api/v1/policies/test` - testowanie polityk
  - GET `/api/v1/policies/*/history` - historia zmian

## 7. Przykładowe dane wejściowe/wyjściowe
**Data Provider API (GET /access/tenant125):**
```json
{
  "tenants": { "user42": ["tenant125"] },
  "companies": { "user42": { "tenant125": ["company124"] } },
  "roles": { "user42": { "fk": ["fk_admin"] } },
  "permissions": { "fk": { "fk_admin": ["view_entry", "edit_entry"] } }
}
```

**Provisioning API (POST /provision-tenant):**
```json
{
  "url": "http://data-provider-api:8100/access/tenant125",
  "topics": ["access.companies.tenant125"],
  "dst_path": "access.companies.tenant125",
  "polling_interval_seconds": 0
}
```

**Policy Management API (POST /api/v1/policies/validate):**
```json
{
  "policy_content": "package policies.rbac\ndefault allow = false\nallow { input.user.role == \"admin\" }",
  "input_data": { "user": { "role": "admin" } }
}
```

## 8. Kryteria akceptacji
- System umożliwia dynamiczne dodanie nowego tenant'a i jego danych
- Polityki i dane są synchronizowane do OPA bez aktywnego odpytywania
- OPA poprawnie ewaluuje uprawnienia RBAC na podstawie danych i polityk
- Możliwość rozbudowy o kolejne aplikacje i typy zasobów
- **Portal umożliwia zarządzanie politykami przez interfejs webowy**
- **Real-time walidacja i testowanie polityk działa poprawnie**
- **GitHub webhook automatycznie synchronizuje zmiany polityk**
- **System autoryzacji portalu kontroluje dostęp do zarządzania politykami**

## 9. Dalsze kroki i możliwości rozwoju
- Dodanie wsparcia dla REBAC (relacyjnego RBAC)
- ✅ Integracja z webhookiem GitHub do automatycznej synchronizacji polityk
- Skalowanie OPAL Client per aplikacja lub tenant
- Optymalizacja czasu uruchomienia (preload danych)
- Pokrycie testami i benchmarki wydajności
- **Rozszerzenie portalu o zaawansowane funkcje zarządzania uprawnieniami**
- **Integracja z systemami CI/CD dla policy testing**

## 10. Zasoby
- Dokumentacja OPA
- Projekt OPAL
- Przykłady RBAC w Rego
- **Portal Symfonia** (Next.js 15.2.4 + App Router + Radix UI)
- **FastAPI Documentation** dla Policy Management Service 