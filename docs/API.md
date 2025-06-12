# API - OPA Zero Poll

## Data Provider API

### GET /health
- Sprawdza status serwisu i zależności
- Przykład:
  ```sh
  curl http://localhost:8110/health
  ```

### GET /tenants
- Zwraca listę tenantów

### GET /tenants/{tenant_id}/acl
- Zwraca dane ACL dla wybranego tenanta

### POST /webhook/policy-update
- Endpoint do odbierania webhooków GitHub
- Weryfikacja podpisu HMAC-SHA256
- Przykładowy payload: zobacz [WEBHOOKS.md](WEBHOOKS.md)

---

## Provisioning API

### GET /health
- Sprawdza status serwisu

### GET /tenants
- Lista tenantów

### POST /tenants
- Dodaje nowego tenanta

---

## OPA Standalone

### GET /
- Strona webowa OPA (do testów)

### POST /v1/data/{policy_path}
- Zapytanie o decyzję autoryzacyjną
- Przykład:
  ```sh
  curl -X POST http://localhost:8181/v1/data/tenant_data/tenant1 --data '{"input": {...}}'
  ```

---

## Integration Scripts
- Brak publicznego API – skrypty uruchamiane przez system

---

## Przykłady odpowiedzi
- Dodaj przykładowe odpowiedzi JSON dla każdego endpointu

---

## Statusy i błędy
- 200 OK – sukces
- 400 Bad Request – błąd danych wejściowych
- 401 Unauthorized – nieprawidłowy podpis webhooka
- 404 Not Found – brak zasobu
- 500 Internal Server Error – błąd serwera 