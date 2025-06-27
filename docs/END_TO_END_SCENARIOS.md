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

## Scenariusz 4: Frontend KSEF - Pełny Test Multi-Tenant (Kompletny Przepływ)

### 4.1 Test Kontekstu Autoryzacji w Przeglądarce

**Cel:** Weryfikacja poprawnego wyświetlania kontekstu autoryzacji dla użytkownika z tenant_mikro_dzialal

**Kroki:**
1. Otwórz przeglądarkę i przejdź do `http://localhost:3000`
2. Kliknij na aplikację "Symfonia KSEF"
3. Zaloguj się jako `admin_tenant_mikro_dzialal` (Jan Kowalski)

**Oczekiwany rezultat:**
```
Kontekst autoryzacji:
Użytkownik: admin_tenant_mikro_dzialal
Tenant: tenant_mikro_dzialal 
Wybrana firma: company_tenant_mikro_dzialal (Consulting Services Jan Kowalski)
Uprawnienia: Zakup: true, Sprzedaż: true
```

**Weryfikacja Backend (curl):**
```bash
# Test autoryzacji faktury sprzedaży
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "admin_tenant_mikro_dzialal",
      "tenant": "tenant_mikro_dzialal",
      "action": "view_invoices_sales",
      "company_id": "company_tenant_mikro_dzialal"
    }
  }' | jq
```

**Oczekiwana odpowiedź OPA:**
```json
{
  "result": true
}
```

**Monitorowanie logów Frontend:**
```bash
# Sprawdź logi Next.js (console w przeglądarce)
# Oczekiwane wpisy:
# [KSEF] Używam tenant z danych użytkownika: tenant_mikro_dzialal
# [KSEF] Sprawdzanie uprawnień dla użytkownika: admin_tenant_mikro_dzialal
# [KSEF] Dostęp do faktur zakupu: true
# [KSEF] Dostęp do faktur sprzedaży: true
```

### 4.2 Test Zakładek Faktury - Autoryzacja RBAC

**Cel:** Weryfikacja że zakładki faktury działają z poprawną autoryzacją po naprawie hardkodowanego tenanta

**Kroki:**
1. W aplikacji KSEF kliknij na "Faktury sprzedaży"
2. Sprawdź czy zawartość się ładuje (bez komunikatu "Brak dostępu")
3. Kliknij na "Faktury zakupu"  
4. Sprawdź czy zawartość się ładuje (bez komunikatu "Brak dostępu")

**Oczekiwany rezultat - Faktury sprzedaży:**
```
🎯 Faktury sprzedażowe
Faktury sprzedażowe z integracją OPA
Użytkownik: admin_tenant_mikro_dzialal | Tenant: tenant_mikro_dzialal | Firma: company_tenant_mikro_dzialal
```

**Oczekiwany rezultat - Faktury zakupu:**
```
🛒 Faktury zakupowe  
Faktury zakupowe z integracją OPA
Użytkownik: admin_tenant_mikro_dzialal | Tenant: tenant_mikro_dzialal | Firma: company_tenant_mikro_dzialal
```

**Weryfikacja Backend przez Frontend API:**
```bash
# Sprawdź logi API calls w konsoli przeglądarki
# Oczekiwane zapytania:
# POST /api/opa - view_invoices_sales → result: true
# POST /api/opa - view_invoices_purchase → result: true
```

**Monitorowanie logów komponentów:**
```bash
# Sprawdź logi w konsoli przeglądarki (F12)
# Oczekiwane wpisy:
# [SalesInvoicesTab] Sprawdzanie uprawnień dla userId: admin_tenant_mikro_dzialal, tenantId: tenant_mikro_dzialal, companyId: company_tenant_mikro_dzialal
# [SalesInvoicesTab] Dostęp do faktur sprzedaży: true
# [PurchaseInvoicesTab] Sprawdzanie uprawnień dla userId: admin_tenant_mikro_dzialal, tenantId: tenant_mikro_dzialal, companyId: company_tenant_mikro_dzialal  
# [PurchaseInvoicesTab] Dostęp do faktur zakupu: true
```

### 4.3 Test Autoryzacji ReBAC - Użytkownik z Zespołem

**Cel:** Weryfikacja autoryzacji przez zespół (user700 - Joanna Wiśniewska z zespołu "KSEF Północ")

**Przygotowanie danych:**
```bash
# Sprawdź synchronizację danych team_roles w OPA
curl -s "http://localhost:8181/v1/data/acl/tenant125" | jq '.result.team_roles'
```

**Weryfikacja Backend:**
```bash
# Test autoryzacji ReBAC przez zespół
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "user700", 
      "tenant": "tenant125",
      "action": "view_invoices_sales",
      "company_id": "company1"
    }
  }' | jq

# Test uprawnień zakupu przez zespół  
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "user700",
      "tenant": "tenant125", 
      "action": "view_invoices_purchase",
      "company_id": "company1"
    }
  }' | jq
```

**Oczekiwane odpowiedzi:**
```json
{
  "result": true
}
```

**Diagnostyka zespołów:**
```bash
# Sprawdź role zespołów w OPA 
curl -X POST http://localhost:8181/v1/data/ksef/user_team_ksef_roles \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "user700",
      "tenant": "tenant125"  
    }
  }' | jq
```

**Oczekiwana odpowiedź diagnostyczna:**
```json
{
  "result": [
    "Administrator", 
    "Księgowa"
  ]
}
```

### 4.4 Test Naprawy team_roles w Data Provider API

**Cel:** Weryfikacja że Data Provider API poprawnie eksportuje tabele team_roles

**Sprawdzenie eksportu team_roles:**
```bash
curl -s "http://localhost:8110/tenants/tenant125/acl" | jq '.team_roles'
```

**Oczekiwana odpowiedź:**
```json
[
  {
    "team_id": "3da9df20-e348-42cb-a8e7-203a62317459",
    "role_id": "7561c884-5e29-4d07-914f-2f855775bd8a",
    "team_name": "KSEF Północ",
    "role_name": "Administrator",
    "role_description": "Administrator with full access to all KSEF functions"
  },
  {
    "team_id": "3da9df20-e348-42cb-a8e7-203a62317459", 
    "role_id": "5a89fa9f-614d-43df-9715-03b399fcd075",
    "team_name": "KSEF Północ",
    "role_name": "Księgowa", 
    "role_description": "Accountant with access to purchase invoices"
  }
]
```

**Weryfikacja synchronizacji OPAL:**
```bash
# Sprawdź że OPAL Client odebrał team_roles
curl -s "http://localhost:8181/v1/data/acl/tenant125/team_roles" | jq
```

**Monitorowanie logów synchronizacji:**
```bash
# Logi OPAL Server
docker logs opal-server | grep "team_roles"

# Logi OPAL Client  
docker logs opal-client | grep "team_roles"

# Oczekiwane wpisy:
# [DEBUG] Updating OPA with team_roles data
# [SUCCESS] team_roles data synchronized
```

**Test przed naprawą vs po naprawie:**
```bash
# Sprawdź czy endpoint /tenants/{tenant_id}/acl zawiera team_roles
curl -s "http://localhost:8110/tenants/tenant125/acl" | jq 'keys | sort'
```

**Oczekiwana lista kluczy (po naprawie):**
```json
[
  "applications",
  "companies", 
  "permissions",
  "role_permissions",
  "roles",
  "team_companies",
  "team_memberships", 
  "team_roles",
  "teams",
  "user_companies",
  "users"
]
```

---

## Procedury Diagnostyczne - Frontend & Autoryzacja

### Sprawdzenie Logów Frontend w Czasie Rzeczywistym

```bash
# Uruchom frontend w trybie development
cd /path/to/project && npm run dev

# Sprawdź logi w terminalu Next.js
# Oczekiwane wpisy:
# ✓ Ready in 2.1s
# ○ Compiling /ksef/page.tsx...
# ✓ Compiled /ksef/page.tsx in XXXms
```

### Debugowanie Autoryzacji w Konsoli Przeglądarki

1. Otwórz Developer Tools (F12)
2. Przejdź do zakładki Console
3. Odśwież stronę KSEF
4. Sprawdź logi autoryzacji:

```javascript
// Oczekiwane logi w konsoli:
[KSEF] useEffect uruchomiony - sprawdzanie uprawnień...
[KSEF] Sprawdzanie uprawnień dla użytkownika: admin_tenant_mikro_dzialal
[KSEF] Tenant: tenant_mikro_dzialal
[KSEF] Kontekst firmy: company_tenant_mikro_dzialal
[KSEF] Dostęp do faktur zakupu: true
[KSEF] Dostęp do faktur sprzedaży: true
```

### Weryfikacja Stanu localStorage

```javascript
// W konsoli przeglądarki:
console.log('currentUser:', localStorage.getItem('currentUser'));
console.log('currentUserId:', localStorage.getItem('currentUserId'));
console.log('selectedCompany:', localStorage.getItem('selectedCompany'));

// Oczekiwane wartości:
// currentUser: {"id":"admin_tenant_mikro_dzialal","tenant_id":"tenant_mikro_dzialal",...}
// currentUserId: "admin_tenant_mikro_dzialal" 
// selectedCompany: {"company_id":"company_tenant_mikro_dzialal",...}
```

### Testowanie API Proxy Frontend

```bash
# Test przez frontend API proxy
curl -X POST http://localhost:3000/api/opa \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "admin_tenant_mikro_dzialal",
      "tenant": "tenant_mikro_dzialal", 
      "action": "view_invoices_sales",
      "company_id": "company_tenant_mikro_dzialal"
    }
  }' | jq
```

**Oczekiwana odpowiedź:**
```json
{
  "result": true
}
```

### Rozwiązywanie Problemów Frontend

#### Problem: Hardkodowany tenant w komponentach
```javascript
// Sprawdź w kodzie czy nie ma hardkodowanych wartości:
// ❌ Źle: const tenantId = 'tenant125'  
// ✅ Dobrze: const tenantId = authContext.tenant || 'defaultTenant'
```

#### Problem: Brak props w komponentach zakładek
```javascript
// Sprawdź czy komponenty otrzymują props:
// ✅ Dobrze: <SalesInvoicesTab userId={userId} tenantId={tenantId} companyId={companyId} />
// ❌ Źle: <SalesInvoicesTab />
```

#### Problem: Błędna autoryzacja mimo poprawnych danych
```bash
# Sprawdź czy OPA ma najnowsze polityki
curl -s "http://localhost:8181/v1/policies" | jq 'keys'

# Sprawdź czy OPAL Client działa
curl -s "http://localhost:7001/healthcheck" | jq

# Wymuś synchronizację polityk
docker restart opal-client
```

---

Ta dokumentacja zapewnia kompletne scenariusze testowania end-to-end z możliwościami diagnostycznymi dla systemu OPA Zero Poll. Każdy scenariusz może być wykonany niezależnie i zawiera kompleksowe procedury logowania oraz rozwiązywania problemów. 