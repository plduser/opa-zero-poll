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