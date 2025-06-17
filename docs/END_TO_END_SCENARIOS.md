# Scenariusze End-to-End: Testowanie Kompletnego Przepływu Danych

Ten dokument opisuje kompletne scenariusze testowania systemu OPA Zero Poll, od tworzenia tenantów przez zarządzanie użytkownikami do autoryzacji OPA. Każdy scenariusz zawiera komendy CURL, oczekiwane logi i procedury diagnostyczne.

## Wymagania wstępne

Upewnij się, że wszystkie usługi są uruchomione:
```bash
docker-compose up -d
docker-compose ps  # Sprawdź czy wszystkie usługi są zdrowe
```

## Scenariusz 1: Konfiguracja Nowego Tenanta (Kompletny Przepływ)

### 1.1 Utworzenie Tenanta + Użytkownika Administratora

**Wywołanie API:**
```bash
curl -X POST http://localhost:8010/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FirmaTestowa",
    "admin_user": {
      "username": "admin.firma@testowa.pl",
      "email": "admin.firma@testowa.pl", 
      "full_name": "Admin Firmowy"
    }
  }'
```

**Oczekiwana odpowiedź:**
```json
{
  "message": "Tenant created successfully",
  "tenant_id": "tenant_1750173XXX",
  "admin_user_id": "admin_tenant_1750173XXX"
}
```

**Monitorowanie logów:**
```bash
# Logi Provisioning API
docker logs provisioning-api-new -f

# Oczekiwane wpisy:
# [INFO] Creating tenant: FirmaTestowa
# [INFO] Creating admin user for tenant: tenant_1750173XXX
# [INFO] User created with ID: admin_tenant_1750173XXX
# [INFO] Tenant created successfully: tenant_1750173XXX
```

### 1.2 Weryfikacja Utworzenia Tenanta

**Wywołanie API:**
```bash
curl -X GET "http://localhost:8010/api/tenants" | jq
```

**Oczekiwana odpowiedź:**
```json
{
  "tenants": [
    {
      "id": "tenant_1750173XXX",
      "name": "FirmaTestowa",
      "created_at": "2025-01-17T...",
      "status": "active"
    }
  ]
}
```

### 1.3 Uruchomienie Procesu Provisioning

**Wywołanie API:**
```bash
curl -X POST "http://localhost:8010/api/tenants/tenant_1750173XXX/provision" \
  -H "Content-Type: application/json"
```

**Oczekiwana odpowiedź:**
```json
{
  "message": "Provisioning initiated for tenant tenant_1750173XXX",
  "status": "in_progress"
}
```

**Monitorowanie logów:**
```bash
# Logi Provisioning API
docker logs provisioning-api-new -f

# Oczekiwane wpisy:
# [INFO] Starting provisioning for tenant: tenant_1750173XXX
# [INFO] Fetching ACL data for tenant: tenant_1750173XXX
# [INFO] Sending OPAL notification for tenant: tenant_1750173XXX
# [SUCCESS] Provisioning completed for tenant: tenant_1750173XXX
```

### 1.4 Weryfikacja Odbioru Aktualizacji przez OPAL Server

**Monitorowanie logów:**
```bash
# Logi OPAL Server
docker logs opal-server -f

# Oczekiwane wpisy:
# [DEBUG] Received data update notification
# [INFO] Processing tenant data: tenant_1750173XXX
# [DEBUG] Broadcasting update to clients
```

### 1.5 Weryfikacja Synchronizacji Danych przez OPAL Client

**Monitorowanie logów:**
```bash
# Logi OPAL Client  
docker logs opal-client -f

# Oczekiwane wpisy:
# [DEBUG] Received data update from server
# [INFO] Updating OPA with new tenant data: tenant_1750173XXX
# [SUCCESS] Data sync completed for tenant: tenant_1750173XXX
```

### 1.6 Weryfikacja Danych w OPA

**Wywołanie API:**
```bash
curl -s "http://localhost:8181/v1/data/acl/tenant_1750173XXX" | jq
```

**Oczekiwana odpowiedź:**
```json
{
  "result": {
    "access": {
      "admin_tenant_1750173XXX": {
        "tenant_1750173XXX": ["Administrator"]
      }
    },
    "roles": {
      "admin_tenant_1750173XXX": {}
    }
  }
}
```

### 1.7 Test Autoryzacji

**Wywołanie API:**
```bash
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "admin_tenant_1750173XXX",
      "tenant": "tenant_1750173XXX", 
      "action": "view_invoices_purchase"
    }
  }' | jq
```

**Oczekiwana odpowiedź:**
```json
{
  "result": true
}
```

---

## Scenariusz 2: Dodawanie Nowego Użytkownika (Kompletny Przepływ)

### 2.1 Utworzenie Nowego Użytkownika

**Wywołanie API:**
```bash
curl -X POST http://localhost:8110/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jan.kowalski@testowa.pl",
    "email": "jan.kowalski@testowa.pl",
    "full_name": "Jan Kowalski",
    "tenant_id": "tenant_1750173XXX"
  }'
```

**Oczekiwana odpowiedź:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_1750174XXX",
    "username": "jan.kowalski@testowa.pl",
    "email": "jan.kowalski@testowa.pl",
    "full_name": "Jan Kowalski",
    "tenant_id": "tenant_1750173XXX",
    "status": "active"
  }
}
```

**Monitorowanie logów:**
```bash
# Logi Data Provider API
docker logs data-provider-api -f

# Oczekiwane wpisy:
# [INFO] Creating user: jan.kowalski@testowa.pl
# [DEBUG] User created successfully with ID: user_1750174XXX
# [INFO] Publishing user_create event for user: user_1750174XXX
# [INFO] Publishing translated_permission_event for user: user_1750174XXX
# [DEBUG] Notification sent to OPAL Server
```

### 2.2 Przypisanie Roli do Użytkownika

**Wywołanie API:**
```bash
curl -X POST "http://localhost:8110/api/users/user_1750174XXX/roles" \
  -H "Content-Type: application/json" \
  -d '{
    "role_name": "Handlowiec",
    "tenant_id": "tenant_1750173XXX"
  }'
```

**Oczekiwana odpowiedź:**
```json
{
  "message": "Role assigned successfully",
  "user_id": "user_1750174XXX",
  "role_name": "Handlowiec",
  "tenant_id": "tenant_1750173XXX"
}
```

**Monitorowanie logów:**
```bash
# Logi Data Provider API
docker logs data-provider-api -f

# Oczekiwane wpisy:
# [INFO] Assigning role Handlowiec to user user_1750174XXX in tenant tenant_1750173XXX
# [DEBUG] Role assignment successful
# [INFO] Publishing role_assign event
# [INFO] Publishing translated_permission_event for role assignment
# [DEBUG] Notification sent to OPAL Server
```

### 2.3 Weryfikacja Propagacji OPAL

**Monitorowanie logów:**
```bash
# Logi OPAL Server
docker logs opal-server -f

# Oczekiwane wpisy:
# [DEBUG] Received permission event: user_create
# [DEBUG] Received permission event: translated_permission_event
# [INFO] Broadcasting data updates to clients

# Logi OPAL Client
docker logs opal-client -f

# Oczekiwane wpisy:
# [DEBUG] Processing data update for tenant: tenant_1750173XXX
# [INFO] Updating OPA data store
# [SUCCESS] Data synchronization completed
```

### 2.4 Weryfikacja Zaktualizowanych Danych OPA

**Wywołanie API:**
```bash
curl -s "http://localhost:8181/v1/data/acl/tenant_1750173XXX" | jq
```

**Oczekiwana odpowiedź:**
```json
{
  "result": {
    "access": {
      "admin_tenant_1750173XXX": {
        "tenant_1750173XXX": ["Administrator"]
      },
      "user_1750174XXX": {
        "tenant_1750173XXX": ["Handlowiec"]
      }
    },
    "roles": {
      "admin_tenant_1750173XXX": {},
      "user_1750174XXX": {}
    }
  }
}
```

### 2.5 Test Autoryzacji Nowego Użytkownika

**Wywołanie API:**
```bash
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "user_1750174XXX",
      "tenant": "tenant_1750173XXX",
      "action": "create_invoices_sale"
    }
  }' | jq
```

**Oczekiwana odpowiedź:**
```json
{
  "result": true
}
```

---

## Scenariusz 3: Aktualizacja Uprawnień (Kompletny Przepływ)

### 3.1 Usunięcie Roli od Użytkownika

**Wywołanie API:**
```bash
curl -X DELETE "http://localhost:8110/api/users/user_1750174XXX/roles" \
  -H "Content-Type: application/json" \
  -d '{
    "role_name": "Handlowiec",
    "tenant_id": "tenant_1750173XXX"
  }'
```

**Oczekiwana odpowiedź:**
```json
{
  "message": "Role removed successfully",
  "user_id": "user_1750174XXX",
  "role_name": "Handlowiec",
  "tenant_id": "tenant_1750173XXX"
}
```

### 3.2 Przypisanie Nowej Roli

**Wywołanie API:**
```bash
curl -X POST "http://localhost:8110/api/users/user_1750174XXX/roles" \
  -H "Content-Type: application/json" \
  -d '{
    "role_name": "Ksiegowa",
    "tenant_id": "tenant_1750173XXX"
  }'
```

**Oczekiwana odpowiedź:**
```json
{
  "message": "Role assigned successfully", 
  "user_id": "user_1750174XXX",
  "role_name": "Ksiegowa",
  "tenant_id": "tenant_1750173XXX"
}
```

**Monitorowanie logów:**
```bash
# Logi Data Provider API
docker logs data-provider-api -f

# Oczekiwane wpisy:
# [INFO] Removing role Handlowiec from user user_1750174XXX
# [INFO] Publishing role_remove event
# [INFO] Publishing translated_permission_event for role removal
# [INFO] Assigning role Ksiegowa to user user_1750174XXX
# [INFO] Publishing role_assign event
# [INFO] Publishing translated_permission_event for role assignment
```

### 3.3 Weryfikacja Zmiany Uprawnień w OPA

**Wywołanie API:**
```bash
curl -s "http://localhost:8181/v1/data/acl/tenant_1750173XXX" | jq
```

**Oczekiwana odpowiedź:**
```json
{
  "result": {
    "access": {
      "admin_tenant_1750173XXX": {
        "tenant_1750173XXX": ["Administrator"]
      },
      "user_1750174XXX": {
        "tenant_1750173XXX": ["Ksiegowa"]
      }
    },
    "roles": {
      "admin_tenant_1750173XXX": {},
      "user_1750174XXX": {}
    }
  }
}
```

### 3.4 Test Zaktualizowanej Autoryzacji

**Poprzednie uprawnienie (powinno teraz być odrzucone):**
```bash
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "user_1750174XXX",
      "tenant": "tenant_1750173XXX",
      "action": "create_invoices_sale"
    }
  }' | jq
```

**Oczekiwana odpowiedź:**
```json
{
  "result": false
}
```

**Nowe uprawnienie (powinno zostać zaakceptowane):**
```bash
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "user_1750174XXX", 
      "tenant": "tenant_1750173XXX",
      "action": "view_reports_financial"
    }
  }' | jq
```

**Oczekiwana odpowiedź:**
```json
{
  "result": true
}
```

---

## Procedury Diagnostyczne

### Sprawdzenie Stanu Usług

```bash
# Status wszystkich usług
docker-compose ps

# Health check poszczególnych usług
curl -f http://localhost:8010/health  # Provisioning API
curl -f http://localhost:8110/health  # Data Provider API  
curl -f http://localhost:8181/health  # OPA
curl -f http://localhost:7002/healthcheck  # OPAL Server
```

### Monitorowanie Logów w Czasie Rzeczywistym

```bash
# Logi wszystkich usług
docker-compose logs -f

# Logi konkretnych usług
docker logs provisioning-api-new -f
docker logs data-provider-api -f
docker logs opal-server -f
docker logs opal-client -f
docker logs opa-standalone-new -f
```

### Sprawdzenie Stanu OPAL Client

```bash
curl -s "http://localhost:7001/healthcheck" | jq
```

**Oczekiwana odpowiedź:**
```json
{
  "policy_updater": true,
  "data_updater": true, 
  "policy": true,
  "data": true
}
```

### Weryfikacja Synchronizacji Danych

```bash
# Sprawdź wszystkie dane tenantów w OPA
curl -s "http://localhost:8181/v1/data/acl" | jq

# Sprawdź konkretny tenant
curl -s "http://localhost:8181/v1/data/acl/[TENANT_ID]" | jq

# Sprawdź statystyki OPAL Server
curl -s "http://localhost:7002/stats" | jq
```

### Rozwiązywanie Typowych Problemów

#### Problem: OPAL Client pokazuje "unavailable"
```bash
# Sprawdź logi OPAL Client
docker logs opal-client -f

# Restartuj OPAL Client
docker restart opal-client

# Zweryfikuj połączenie z Redis
docker exec -it redis-broadcast redis-cli ping
```

#### Problem: Dane OPA nie są aktualizowane
```bash
# Sprawdź źródła danych OPAL Server
curl -s "http://localhost:7002/data/config" | jq

# Manualne odświeżenie danych
curl -X POST "http://localhost:7002/data/config/update"

# Sprawdź łączność z Data Provider API
curl -s "http://localhost:8110/data/config" | jq
```

#### Problem: Autoryzacja niespodziewanie zawodzi
```bash
# Sprawdź ładowanie polityk
curl -s "http://localhost:8181/v1/policies" | jq

# Testuj ocenę polityk z debugiem
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "[USER_ID]",
      "tenant": "[TENANT_ID]", 
      "action": "[ACTION]"
    }
  }' | jq

# Sprawdź logi decyzji OPA
docker logs opa-standalone-new | grep -i decision
```

---

## Monitorowanie Wydajności

### Testowanie Czasów Odpowiedzi

```bash
# Zmierz czas odpowiedzi API
time curl -X POST http://localhost:8110/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","full_name":"Test","tenant_id":"tenant1"}'

# Zmierz czas odpowiedzi autoryzacji
time curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -H "Content-Type: application/json" \
  -d '{"input":{"user":"user_id","tenant":"tenant_id","action":"view_invoices"}}'
```

### Testowanie Obciążenia (Opcjonalne)

```bash
# Prosty test obciążenia dla tworzenia użytkowników
for i in {1..10}; do
  curl -X POST http://localhost:8110/api/users \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"user$i@test.com\",\"email\":\"user$i@test.com\",\"full_name\":\"User $i\",\"tenant_id\":\"tenant1\"}" &
done
wait
```

---

## Oczekiwane Czasy

- **Tworzenie Tenanta**: 1-2 sekundy
- **Tworzenie Użytkownika**: 0.5-1 sekunda  
- **Przypisanie Roli**: 0.5-1 sekunda
- **Propagacja OPAL**: 2-5 sekund
- **Synchronizacja Danych OPA**: 1-3 sekundy
- **Zapytanie Autoryzacyjne**: <100ms

---

Ta dokumentacja zapewnia kompletne scenariusze testowania end-to-end z możliwościami diagnostycznymi dla systemu OPA Zero Poll. Każdy scenariusz może być wykonany niezależnie i zawiera kompleksowe procedury logowania oraz rozwiązywania problemów. 