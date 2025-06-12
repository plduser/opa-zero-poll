# Product Requirements Document (PRD): System RBAC Zero-Polling z OPAL + OPA

## 1. Cel projektu
System autoryzacji RBAC dla środowiska SaaS, oparty o OPA i OPAL, umożliwiający dynamiczne zarządzanie uprawnieniami, synchronizację polityk i danych bez aktywnego odpytywania (zero-polling), z obsługą wielu tenantów i aplikacji.

## 2. Zakres projektu
- Obsługa wielu aplikacji (fk, ksef, hr, edeklaracje, edokumenty)
- Użytkownicy przypisani do wielu tenantów i firm
- Uprawnienia oparte na rolach per aplikacja
- Dostęp do firm ograniczony przez ACL na poziomie tenantów
- Dynamiczne provisionowanie tenantów i danych

## 3. Wymagania funkcjonalne
1. System musi umożliwiać:
   - Dynamiczne provisionowanie nowych tenantów przez API
   - Przypisywanie użytkowników do tenantów i firm
   - Definiowanie ról i uprawnień per aplikacja
   - Synchronizację polityk Rego z repozytorium GitHub do OPA przez OPAL
   - Subskrypcję i aktualizację danych ACL per tenant (topic: access.companies.<tenant_id>)
   - Ewaluację uprawnień przez OPA (data.policies.rbac.allow)
2. API Data Provider musi zwracać strukturę danych dla tenanta:
   - tenants, companies, roles, permissions
3. API Provisioning musi umożliwiać rejestrację nowego tenant'a i dynamiczne dodanie źródła danych do OPAL

## 4. Wymagania niefunkcjonalne
- Brak aktywnego odpytywania (zero-polling)
- Wysoka wydajność i skalowalność
- Obsługa cold start i restartu systemu
- Możliwość rozbudowy o nowe aplikacje i typy zasobów
- Testowalność (opa test), benchmarki wydajności (opa bench)

## 5. Architektura
- OPAL Server: klonuje repozytorium polityk, publikuje zdarzenia, obsługuje dynamiczne źródła danych
- OPAL Client: subskrybuje polityki i dane, synchronizuje z OPA (inline)
- OPA: silnik decyzyjny, ewaluacja reguł RBAC/REBAC
- Data Provider API: zwraca dane ACL dla tenantów
- Provisioning API: rejestruje tenantów, dodaje źródła danych do OPAL

## 6. Komponenty i interfejsy
- **OPAL Server**: API /data/config, klonowanie polityk z GitHub
- **OPAL Client**: subskrypcja topiców, aktualizacja OPA
- **OPA**: endpointy decyzyjne (np. /v1/data/policies/rbac/allow)
- **Data Provider API**: GET /access/<tenant_id>
- **Provisioning API**: POST /provision-tenant

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

## 8. Kryteria akceptacji
- System umożliwia dynamiczne dodanie nowego tenant'a i jego danych
- Polityki i dane są synchronizowane do OPA bez aktywnego odpytywania
- OPA poprawnie ewaluuje uprawnienia RBAC na podstawie danych i polityk
- Możliwość rozbudowy o kolejne aplikacje i typy zasobów

## 9. Dalsze kroki i możliwości rozwoju
- Dodanie wsparcia dla REBAC (relacyjnego RBAC)
- Integracja z webhookiem GitHub do automatycznej synchronizacji polityk
- Skalowanie OPAL Client per aplikacja lub tenant
- Optymalizacja czasu uruchomienia (preload danych)
- Pokrycie testami i benchmarki wydajności

## 10. Zasoby
- Dokumentacja OPA
- Projekt OPAL
- Przykłady RBAC w Rego 