# API - OPA Zero Poll

## Data Provider API
**Adres:** `http://localhost:8110`

### GET /health
- Sprawdza status serwisu i zależności
- Przykład:
  ```sh
  curl http://localhost:8110/health
  ```

### GET /tenants
- Zwraca listę tenantów
- Przykład:
  ```sh
  curl http://localhost:8110/tenants
  ```

### GET /tenants/{tenant_id}/acl
- Zwraca dane ACL dla wybranego tenanta
- Przykład:
  ```sh
  curl http://localhost:8110/tenants/tenant1/acl
  ```

### POST /webhook/policy-update
- Endpoint do odbierania webhooków GitHub
- Weryfikacja podpisu HMAC-SHA256
- Przykładowy payload: zobacz [WEBHOOKS.md](WEBHOOKS.md)

### Endpointy synchronizacji
- `POST /sync/trigger` - Pełna synchronizacja wszystkich tenantów
- `POST /sync/tenant/{tenant_id}` - Synchronizacja konkretnego tenanta
- `GET /sync/status` - Status ostatniej synchronizacji
- `GET /sync/health` - Sprawdzenie dostępności Integration Scripts

---

## Provisioning API
**Adres:** `http://localhost:8010`

### GET /health
- Sprawdza status serwisu
- Przykład:
  ```sh
  curl http://localhost:8010/health
  ```

### GET /tenants
- Lista tenantów
- Przykład:
  ```sh
  curl http://localhost:8010/tenants
  ```

### POST /tenants
- Dodaje nowego tenanta
- Przykład:
  ```sh
  curl -X POST http://localhost:8010/tenants \
    -H "Content-Type: application/json" \
    -d '{"name": "tenant_name", "description": "opis"}'
  ```

---

## OPA Standalone
**Adres:** `http://localhost:8181`

### GET /
- Strona webowa OPA (do testów)

### GET /health
- Health check OPA
- Przykład:
  ```sh
  curl http://localhost:8181/health
  ```

### GET /v1/policies
- Lista załadowanych polityk
- Przykład:
  ```sh
  curl http://localhost:8181/v1/policies
  ```

### GET /v1/data
- Wszystkie załadowane dane
- Przykład:
  ```sh
  curl http://localhost:8181/v1/data
  ```

### POST /v1/data/{policy_path}
- Zapytanie o decyzję autoryzacyjną
- Przykład - polityka main (RBAC):
  ```sh
  curl -X POST http://localhost:8181/v1/data/main/allow \
    -H "Content-Type: application/json" \
    -d '{"input": {
      "user_id": "user123",
      "tenant_id": "tenant1", 
      "action": "view_invoice"
    }}'
  ```

---

## Integration Scripts
**Adres:** `http://localhost:8000`

### GET /health
- Health check Integration Scripts API
- Przykład:
  ```sh
  curl http://localhost:8000/health
  ```

### POST /api/execute
- Wykonanie operacji synchronizacji
- Dostępne operacje: `sync_all`, `sync_tenant`, `health_check`
- Przykład:
  ```sh
  curl -X POST http://localhost:8000/api/execute \
    -H "Content-Type: application/json" \
    -d '{"operation": "sync_all"}'
  ```

### GET /api/status
- Status ostatniej operacji
- Przykład:
  ```sh
  curl http://localhost:8000/api/status
  ```

---

## OPAL Server
**Adres:** `http://localhost:7002`

### GET /healthcheck
- Health check OPAL Server
- Przykład:
  ```sh
  curl http://localhost:7002/healthcheck
  ```

### GET /policy
- Pobieranie polityk z repo GitHub
- Przykład:
  ```sh
  curl "http://localhost:7002/policy?path=new-architecture/components/opa-standalone/policies"
  ```

---

## OPAL Client  
**Adres:** `http://localhost:7001`

### GET /healthcheck
- Health check OPAL Client
- Przykład:
  ```sh
  curl http://localhost:7001/healthcheck
  ```

---

## Przykłady odpowiedzi

### Data Provider API - GET /tenants
```json
{
  "tenants": [
    {"id": "tenant1", "name": "Tenant 1"},
    {"id": "tenant2", "name": "Tenant 2"}
  ]
}
```

### OPA - POST /v1/data/main/allow
```json
{
  "result": true
}
```

### Integration Scripts - POST /api/execute
```json
{
  "status": "success",
  "operation": "sync_all",
  "message": "Synchronization completed successfully",
  "timestamp": "2024-06-13T09:00:00Z"
}
```

---

## Statusy i błędy
- `200 OK` – sukces
- `400 Bad Request` – błąd danych wejściowych
- `401 Unauthorized` – nieprawidłowy podpis webhooka
- `404 Not Found` – brak zasobu
- `500 Internal Server Error` – błąd serwera

## Architektura komunikacji
```
Data Provider API ←→ Integration Scripts ←→ OPA Standalone
       ↓                    ↓                    ↑
Provisioning API    OPAL Server ←→ OPAL Client ←↗
``` 