# Data Provider API - Complete Documentation

## Przegląd

Data Provider API to kompleksowy serwis Multi-tenant ACL dla OPA z integracją PostgreSQL. Implementuje Enhanced Model 1 (RBAC) oraz zapewnia pełne zarządzanie użytkownikami, firmami, profilami aplikacji i integrację z OPAL External Data Sources.

**Base URL:** `http://localhost:8110`

## 📖 Interaktywna Dokumentacja

### 🌐 Swagger UI (Rekomendowane)
```
http://localhost:8110/docs
```
- Interaktywna dokumentacja z możliwością testowania endpointów
- Automatycznie generowana na podstawie specyfikacji OpenAPI
- Pełne opisy parametrów, odpowiedzi i przykłady

### 📝 OpenAPI Specification
```
http://localhost:8110/openapi.json
```
- Surowa specyfikacja OpenAPI 3.0.3 w formacie JSON
- Do importu w Postman, Insomnia lub innych narzędziach
- Zawiera kompletną definicję wszystkich endpointów

## Enhanced Model 1 Structure

Enhanced Model 1 wprowadza następujące ulepszenia w stosunku do podstawowego Model 1:

### 🎯 **Kluczowe cechy:**
- **Roles per aplikacja**: `user.roles.fk`, `user.roles.hr`, `user.roles.crm`
- **Permissions per aplikacja**: `user.permissions.fk`, `user.permissions.hr`, `user.permissions.crm`
- **Companies w minimalnym formacie**: tylko GUID arrays `["company1", "company2"]`
- **Role definitions per aplikacja**: definicje ról z odpowiednimi uprawnieniami
- **Pełna kompatybilność wsteczna**: zachowana zgodność z istniejącymi systemami

### 📊 **Struktura danych:**

```json
{
  "model": "1",
  "tenant_id": "tenant1",
  "timestamp": "2025-06-15T10:40:23.164248",
  "data": {
    "tenant_id": "tenant1",
    "tenant_name": "Test Company 1",
    "users": [
      {
        "user_id": "user1",
        "username": "admin_user",
        "roles": {
          "fk": ["fk_admin"],
          "hr": ["hr_admin"],
          "crm": ["crm_admin"]
        },
        "permissions": {
          "fk": ["view_entry", "edit_entry", "delete_entry", "manage_accounts"],
          "hr": ["view_profile", "edit_profile", "delete_profile", "manage_contracts"],
          "crm": ["view_client", "edit_client", "delete_client", "manage_deals"]
        },
        "companies": ["company1", "company2"]
      }
    ],
    "roles": {
      "fk": {
        "fk_admin": ["view_entry", "edit_entry", "delete_entry", "manage_accounts", "generate_reports", "approve_entries", "manage_chart_of_accounts"],
        "fk_editor": ["view_entry", "edit_entry", "generate_reports", "create_invoices", "edit_invoices"],
        "fk_viewer": ["view_entry", "generate_basic_reports", "view_invoices"]
      },
      "hr": {
        "hr_admin": ["view_profile", "edit_profile", "delete_profile", "manage_contracts", "manage_salaries", "generate_hr_reports", "manage_vacation_requests"],
        "hr_editor": ["view_profile", "edit_profile", "edit_contract", "generate_hr_reports", "manage_vacation_requests"],
        "hr_viewer": ["view_profile", "view_contract", "view_organizational_structure"]
      },
      "crm": {
        "crm_admin": ["view_client", "edit_client", "delete_client", "manage_deals", "generate_crm_reports", "manage_pipelines", "access_analytics"],
        "crm_editor": ["view_client", "edit_client", "manage_deals", "generate_crm_reports", "manage_activities"],
        "crm_viewer": ["view_client", "view_deals", "view_activities", "generate_basic_crm_reports"]
      }
    },
    "companies": ["company1", "company2"]
  }
}
```

## 📋 Kompletna Lista Endpointów

Poniżej znajduje się przegląd wszystkich dostępnych endpointów. **Dla szczegółowej dokumentacji z przykładami i interaktywnym testowaniem, użyj Swagger UI: http://localhost:8110/docs**

### 🔧 Endpointy Systemowe
- `GET /` - Informacje o API
- `GET /health` - Health check serwisu i bazy danych
- `GET /openapi.json` - Specyfikacja OpenAPI
- `GET /docs` - Swagger UI

### 🏢 Zarządzanie Tenantami
- `GET /tenants` - Lista wszystkich tenantów
- `GET /tenants/{tenant_id}/acl` - Dane ACL dla tenanta (Enhanced Model 1)

### 👥 Zarządzanie Użytkownikami  
- `GET /api/users` - Lista użytkowników (z filtrowaniem)
- `GET /api/users/{user_id}` - Szczegóły użytkownika
- `POST /api/users` - Dodanie nowego użytkownika
- `PUT /api/users/{user_id}` - Aktualizacja użytkownika
- `DELETE /api/users/{user_id}` - Usunięcie użytkownika

### 🏢 Zarządzanie Firmami
- `GET /api/companies` - Lista firm (z filtrowaniem)
- `GET /api/companies/{company_id}` - Szczegóły firmy
- `POST /api/companies` - Dodanie nowej firmy
- `PUT /api/companies/{company_id}` - Aktualizacja firmy
- `DELETE /api/companies/{company_id}` - Usunięcie firmy

### 📱 Zarządzanie Profilami Aplikacji
- `GET /api/profiles` - Lista profili aplikacji
- `GET /api/profiles/{profile_id}` - Szczegóły profilu
- `POST /api/profiles` - Dodanie nowego profilu
- `PUT /api/profiles/{profile_id}` - Aktualizacja profilu
- `DELETE /api/profiles/{profile_id}` - Usunięcie profilu

### 🔗 Zarządzanie Dostępami Użytkowników
- `GET /api/users/{user_id}/profiles` - Profile dostępne dla użytkownika
- `POST /api/users/{user_id}/profiles` - Przypisanie profilu do użytkownika
- `DELETE /api/users/{user_id}/profiles/{profile_id}` - Usunięcie dostępu do profilu
- `POST /api/users/{user_id}/sync-profiles` - Synchronizacja profili z OPAL

### 🔄 OPAL External Data Sources
- `GET /data/config` - Konfiguracja źródeł danych dla OPAL
- `GET /data/tenants-bootstrap` - Bootstrap wszystkich tenantów dla OPAL
- `GET /opal/health` - Health check integracji OPAL

### 🐛 Debug i Diagnostyka
- `GET /debug/user_access/{user_id}/{tenant_id}` - Debug dostępów użytkownika

## API Endpoints - Szczegółowa Dokumentacja

> **Uwaga:** Poniższe opisy to podstawowe informacje. Dla pełnej dokumentacji z przykładami, schematami i interaktywnym testowaniem, użyj Swagger UI pod adresem: http://localhost:8110/docs

### 1. Get Tenant ACL Data

#### `GET /tenants/{tenant_id}/acl`

Pobierz dane ACL dla konkretnego tenanta w formacie Enhanced Model 1.

**Path Parameters:**
- `tenant_id` (required): Identyfikator tenanta (np. "tenant1", "tenant2")

**Response:**
```json
{
  "model": "1",
  "tenant_id": "tenant1",
  "timestamp": "2025-06-15T10:40:23.164248",
  "data": {
    "tenant_id": "tenant1",
    "tenant_name": "Test Company 1",
    "users": [...],
    "roles": {...},
    "companies": [...]
  }
}
```

**Status Codes:**
- `200 OK`: Dane zwrócone pomyślnie
- `404 Not Found`: Tenant nie istnieje
- `500 Internal Server Error`: Błąd serwera

### 2. List Available Tenants

#### `GET /tenants`

Pobierz listę dostępnych tenantów.

**Response:**
```json
{
  "tenants": [
    {
      "tenant_id": "tenant1",
      "tenant_name": "Test Company 1",
      "status": "active"
    },
    {
      "tenant_id": "tenant2", 
      "tenant_name": "Test Company 2",
      "status": "active"
    }
  ],
  "total": 2
}
```

### 3. Health Check

#### `GET /health`

Sprawdź status serwisu Data Provider API i dostępność bazy danych.

**Response:**
```json
{
  "status": "healthy",
  "database_available": true,
  "timestamp": "2025-06-17T12:12:24.487308"
}
```

### 4. OPAL Health Check

#### `GET /opal/health`

Sprawdź status integracji OPAL External Data Sources.

**Response:**
```json
{
  "status": "healthy",
  "opal_integration": true,
  "timestamp": "2025-06-17T12:12:24.487308"
}
```

### 5. API Information

#### `GET /`

Podstawowe informacje o serwisie i dostępnych endpointach dokumentacji.

**Response:**
```json
{
  "service": "Data Provider API",
  "version": "3.1.0", 
  "description": "Multi-tenant ACL data provider for OPA with database integration",
  "database_integration": true,
  "openapi_docs": "/openapi.json",
  "swagger_ui": "/docs",
  "timestamp": "2025-06-17T12:12:24.487308"
}
```

## Aplikacje i Role

### 🏦 **FK (Finanse i Księgowość)**
- `fk_admin`: Pełne uprawnienia księgowe
- `fk_editor`: Edycja wpisów i generowanie raportów
- `fk_viewer`: Tylko odczyt i podstawowe raporty

### 👥 **HR (Zasoby Ludzkie)**
- `hr_admin`: Pełne zarządzanie profilami i kontraktami
- `hr_editor`: Edycja profili i zarządzanie urlopami
- `hr_viewer`: Tylko odczyt profili i struktury organizacyjnej

### 🤝 **CRM (Zarządzanie Klientami)**
- `crm_admin`: Pełne zarządzanie klientami i analityka
- `crm_editor`: Zarządzanie klientami i transakcjami
- `crm_viewer`: Tylko odczyt klientów i podstawowe raporty

## Migracja do Model 2

Enhanced Model 1 stanowi solidną podstawę dla przyszłej migracji do Model 2, który będzie supersetem obecnej struktury z dodatkowymi funkcjonalnościami:

- **Teams**: Grupy użytkowników z wspólnymi uprawnieniami
- **Memberships**: Przynależność użytkowników do zespołów
- **Inheritance**: Dziedziczenie uprawnień z zespołów
- **Advanced REBAC**: Relacyjne kontrole dostępu

## 🚀 Nowe Funkcjonalności (v3.1.0)

### 📖 Dokumentacja OpenAPI
- **Swagger UI** dostępny pod `/docs` z interaktywnym testowaniem
- **OpenAPI 3.0.3 Specification** pod `/openapi.json`
- **Automatyczna dokumentacja** wszystkich endpointów z opisami i przykładami

### 👥 Zarządzanie Użytkownikami
- **CRUD Operations** - pełne zarządzanie użytkownikami
- **Filtrowanie** po tenant_id, statusie, rolach
- **Synchronizacja** z OPAL przez User Data Sync Service

### 🏢 Zarządzanie Firmami
- **CRUD Operations** - zarządzanie firmami w systemie
- **Multi-tenant support** - firmy przypisane do tenantów
- **NIP integration** - obsługa numerów identyfikacyjnych

### 📱 Profile Aplikacji
- **Application Profiles** - definicje dostępów do aplikacji
- **Role mapping** - mapowanie ról na uprawnienia
- **User assignments** - przypisywanie profili użytkownikom

### 🔄 OPAL Integration
- **External Data Sources** - konfiguracja dla OPAL Client
- **Multi-tenant bootstrap** - automatyczne ładowanie danych wszystkich tenantów
- **Real-time sync** - synchronizacja zmian z OPAL Server

### 🐛 Debug & Monitoring
- **Health checks** - monitorowanie stanu serwisu i bazy danych
- **Debug endpoints** - diagnostyka dostępów użytkowników
- **Detailed logging** - rozszerzone logowanie operacji

---

# Policy Management Service - API Documentation

## Przegląd

Policy Management Service to hybrydowy serwis zarządzania politykami, który obsługuje zarówno GitHub webhooks jak i REST API do ręcznego zarządzania politykami. Serwis automatycznie emituje eventy `policy_updated` do OPAL Server po każdej zmianie.

**Base URL:** `http://localhost:8120`

## Autoryzacja

API może być chronione kluczem API. Jeśli jest skonfigurowany, należy dołączyć nagłówek:

```
Authorization: Bearer YOUR_API_KEY
```

## REST API Endpoints

### 1. Health Check

#### `GET /health`

Sprawdź status serwisu.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": "3600s"
}
```

### 2. Policy Management

#### `GET /api/policies`

Pobierz listę polityk z opcjonalnym filtrowaniem.

**Query Parameters:**
- `status` (optional): Filtruj po statusie (`active`, `inactive`, `draft`)
- `type` (optional): Filtruj po typie (`rbac`, `abac`, `custom`)
- `limit` (optional): Maksymalna liczba wyników (default: 100, max: 1000)
- `offset` (optional): Przesunięcie dla paginacji (default: 0)

**Response:**
```json
[
  {
    "id": "uuid-here",
    "name": "example-policy",
    "description": "Example RBAC policy",
    "type": "rbac",
    "status": "active",
    "content": "package rbac\n\nallow { ... }",
    "metadata": {},
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "version": 1
  }
]
```

#### `GET /api/policies/{policy_id}`

Pobierz szczegóły konkretnej polityki.

**Response:**
```json
{
  "id": "uuid-here",
  "name": "example-policy",
  "description": "Example RBAC policy",
  "type": "rbac",
  "status": "active",
  "content": "package rbac\n\nallow { ... }",
  "metadata": {},
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "version": 1
}
```

#### `POST /api/policies`

Utwórz nową politykę.

**Request Body:**
```json
{
  "name": "new-policy",
  "description": "New policy description",
  "type": "rbac",
  "status": "active",
  "content": "package rbac\n\nallow { ... }",
  "metadata": {
    "author": "admin",
    "tags": ["rbac", "production"]
  }
}
```

**Response:** (HTTP 201)
```json
{
  "id": "uuid-here",
  "name": "new-policy",
  "description": "New policy description",
  "type": "rbac",
  "status": "active",
  "content": "package rbac\n\nallow { ... }",
  "metadata": {
    "author": "admin",
    "tags": ["rbac", "production"]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "version": 1
}
```

#### `PUT /api/policies/{policy_id}`

Aktualizuj istniejącą politykę.

**Request Body:**
```json
{
  "name": "updated-policy-name",
  "description": "Updated description",
  "status": "inactive",
  "content": "package rbac\n\nupdated_rule { ... }"
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "name": "updated-policy-name",
  "description": "Updated description",
  "type": "rbac",
  "status": "inactive",
  "content": "package rbac\n\nupdated_rule { ... }",
  "metadata": {},
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:00:00Z",
  "version": 2
}
```

#### `DELETE /api/policies/{policy_id}`

Usuń politykę.

**Response:**
```json
{
  "success": true,
  "message": "Polityka 'example-policy' została usunięta",
  "data": {
    "policy_id": "uuid-here"
  },
  "timestamp": "2024-01-15T11:00:00Z"
}
```

### 3. Search & Statistics

#### `GET /api/policies/search`

Wyszukaj polityki po nazwie, opisie lub zawartości.

**Query Parameters:**
- `q` (required): Szukany tekst (minimum 2 znaki)

**Response:**
```json
[
  {
    "id": "uuid-here",
    "name": "matching-policy",
    "description": "Policy containing search term",
    "type": "rbac",
    "status": "active",
    "content": "package rbac\n\nsearch_term_here { ... }",
    "metadata": {},
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "version": 1
  }
]
```

#### `GET /api/policies/statistics`

Pobierz statystyki polityk.

**Response:**
```json
{
  "total": 25,
  "by_status": {
    "active": 20,
    "inactive": 3,
    "draft": 2
  },
  "by_type": {
    "rbac": 15,
    "abac": 8,
    "custom": 2
  }
}
```

### 4. Import/Export

#### `POST /api/policies/import`

Importuj polityki z JSON.

**Request Body:**
```json
[
  {
    "id": "uuid-1",
    "name": "imported-policy-1",
    "description": "First imported policy",
    "type": "rbac",
    "status": "active",
    "content": "package rbac\n\nallow { ... }",
    "metadata": {},
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "version": 1
  }
]
```

**Response:**
```json
{
  "success": true,
  "message": "Zaimportowano 15 z 20 polityk",
  "data": {
    "imported": 15,
    "total": 20
  },
  "timestamp": "2024-01-15T11:00:00Z"
}
```

#### `GET /api/policies/export`

Eksportuj wszystkie polityki.

**Response:**
```json
{
  "success": true,
  "count": 25,
  "policies": [
    {
      "id": "uuid-here",
      "name": "example-policy",
      "description": "Example policy",
      "type": "rbac",
      "status": "active",
      "content": "package rbac\n\nallow { ... }",
      "metadata": {},
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "version": 1
    }
  ]
}
```

### 5. Bulk Operations

#### `POST /api/policies/bulk-update`

Masowo aktualizuj polityki.

**Request Body:**
```json
{
  "policy_ids": ["uuid-1", "uuid-2", "uuid-3"],
  "updates": {
    "status": "inactive",
    "metadata": {
      "bulk_updated": true,
      "updated_by": "admin"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Zaktualizowano 3 z 3 polityk",
  "data": {
    "updated": 3,
    "total": 3,
    "errors": []
  },
  "timestamp": "2024-01-15T11:00:00Z"
}
```

## GitHub Webhooks

### `POST /webhook/github`

Endpoint do odbierania GitHub webhooks.

**Headers Required:**
- `X-GitHub-Event`: Typ eventu (`push`, `pull_request`)
- `X-GitHub-Delivery`: Unique delivery ID
- `X-Hub-Signature-256`: HMAC signature (jeśli skonfigurowany secret)

**Supported Events:**
- `push`: Na gałęzi main/master - automatycznie wykrywa pliki `.rego`, `.policy`, `.pol`
- `pull_request`: Action `closed` + merged - sprawdza zmiany w policy files

**Response:**
```json
{
  "received": true,
  "processed": true,
  "message": "Processed push event with 2 policy files",
  "event_id": "delivery-uuid",
  "timestamp": "2024-01-15T11:00:00Z"
}
```

#### `GET /webhook/github/test`

Test endpoint dla GitHub webhook configuration.

**Response:**
```json
{
  "status": "ok",
  "message": "GitHub webhook endpoint is ready",
  "webhook_url": "/webhook/github",
  "signature_verification": true
}
```

## Event Schema

### OPAL Event Format

Po każdej zmianie polityki serwis wysyła event do OPAL Server:

```json
{
  "type": "policy_updated",
  "policy_updated": true,
  "timestamp": "2024-01-15T11:00:00Z",
  "data": {
    "policy_id": "uuid-here",
    "policy_name": "policy-name",
    "source": "api",
    "metadata": {
      "action": "created",
      "type": "rbac",
      "version": 1,
      "author": "admin"
    },
    "event": {
      "event_type": "policy_updated",
      "policy_id": "uuid-here",
      "policy_name": "policy-name",
      "timestamp": "2024-01-15T11:00:00Z",
      "source": "api",
      "metadata": {}
    }
  }
}
```

## Error Responses

Wszystkie błędy zwracają strukturę:

```json
{
  "detail": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (nieprawidłowe dane)
- `401` - Unauthorized (brak lub nieprawidłowy API key)
- `404` - Not Found (polityka nie znaleziona)
- `409` - Conflict (polityka o tej nazwie już istnieje)
- `422` - Validation Error (błąd walidacji Pydantic)
- `500` - Internal Server Error (błąd serwera)

## Configuration

### Environment Variables

Wszystkie zmienne środowiskowe mają prefix `PMS_`:

```bash
# Podstawowe ustawienia
PMS_HOST=0.0.0.0
PMS_PORT=8120
PMS_DEBUG=false

# GitHub Webhook
PMS_GITHUB_WEBHOOK_SECRET=your-secret-here

# OPAL Server
PMS_OPAL_SERVER_URL=http://opal-server:7002

# Security (opcjonalne)
PMS_API_KEY=your-api-key-here

# Retry logic
PMS_MAX_RETRIES=3
PMS_RETRY_DELAY=1.0
```

## Examples

### cURL Examples

```bash
# Pobierz wszystkie polityki
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:8120/api/policies

# Utwórz nową politykę
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name":"test-policy","type":"rbac","content":"package test\nallow { true }"}' \
     http://localhost:8120/api/policies

# Wyszukaj polityki
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "http://localhost:8120/api/policies/search?q=rbac"

# Health check
curl http://localhost:8120/health
```

### Python Example

```python
import httpx

# Initialize client
client = httpx.Client(
    base_url="http://localhost:8120",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)

# Create policy
policy_data = {
    "name": "example-policy",
    "type": "rbac",
    "status": "active",
    "content": "package rbac\n\nallow { input.user.role == \"admin\" }"
}

response = client.post("/api/policies", json=policy_data)
policy = response.json()
print(f"Created policy: {policy['id']}")

# List policies
response = client.get("/api/policies", params={"status": "active"})
policies = response.json()
print(f"Found {len(policies)} active policies")
```

## Integration with OPAL

Policy Management Service jest zaprojektowany do bezproblemowej integracji z OPAL:

1. **Event Emission**: Każda zmiana polityki automatycznie emituje event do OPAL Server
2. **Retry Logic**: Wbudowana odporność na błędy z exponential backoff
3. **Health Monitoring**: Connection testing i health checks
4. **Metadata**: Bogate metadane w eventach dla lepszego debugowania

Serwis można łatwo zintegrować w docker-compose z OPAL Server i OPAL Client. 