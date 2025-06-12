# 🚀 OPA Zero Poll - New Architecture Startup Guide

Instrukcja uruchomienia nowej architektury składającej się z 3 niezależnych mikroserwisów.

## 📋 Wymagania

- Docker i Docker Compose
- `curl` i `jq` (do testowania)
- Porty 8010, 8110, 8181 wolne

## 🏃‍♂️ Szybkie uruchomienie

### 1. Zatrzymaj stare kontenery (jeśli działają)

```bash
# Sprawdź działające kontenery
docker ps

# Zatrzymaj stary provisioning-api jeśli działa
docker stop provisioning-api
```

### 2. Uruchom nową architekturę

```bash
# Z głównego katalogu projektu
docker-compose -f docker-compose-new-arch.yml up --build -d

# Sprawdź status kontenerów
docker ps
```

### 3. Zweryfikuj czy wszystko działa

```bash
# Uruchom automatyczne testy
./test-new-architecture.sh
```

## 🔍 Manualna weryfikacja

Jeśli wolisz przetestować ręcznie:

### Data Provider API (port 8110)
```bash
# Health check
curl http://localhost:8110/health | jq .

# Pobierz użytkowników tenant1
curl http://localhost:8110/tenants/tenant1/users | jq .

# Pobierz dane ACL dla tenant2
curl http://localhost:8110/tenants/tenant2/acl | jq .
```

### Provisioning API (port 8010)
```bash
# Health check
curl http://localhost:8010/health | jq .

# Lista tenantów
curl http://localhost:8010/tenants | jq .

# Dodaj nowego tenanta
curl -X POST http://localhost:8010/provision-tenant \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "test-company", "tenant_name": "Test Company"}' | jq .

# Sprawdź dodanego tenanta
curl http://localhost:8010/tenants/test-company | jq .
```

### OPA Standalone (port 8181)
```bash
# Health check
curl http://localhost:8181/health

# Test polityki - admin może wszystko
curl -X POST http://localhost:8181/v1/data/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": "admin1", "role": "admin", "action": "read", "resource": "data"}}' | jq .
# → {"result": true}

# Test polityki - user nie może usuwać cudzych danych
curl -X POST http://localhost:8181/v1/data/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": "user1", "role": "user", "action": "delete", "resource": "data", "owner": "user2"}}' | jq .
# → {"result": false}

# Powód decyzji
curl -X POST http://localhost:8181/v1/data/rbac/reason \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": "user1", "role": "user", "action": "delete", "resource": "data", "owner": "user2"}}' | jq .
# → {"result": "Role 'user' cannot perform action 'delete' on resource 'data'"}
```

## 🧹 Zatrzymanie i czyszczenie

```bash
# Zatrzymaj wszystkie kontenery
docker-compose -f docker-compose-new-arch.yml down

# Usuń volumes (opcjonalnie)
docker-compose -f docker-compose-new-arch.yml down -v

# Usuń obrazy (opcjonalnie)
docker rmi $(docker images | grep -E "(data-provider-api|provisioning-api|opa-standalone)" | awk '{print $3}')
```

## 🔧 Debugging

### Sprawdź logi kontenerów
```bash
docker logs data-provider-api
docker logs provisioning-api-new
docker logs opa-standalone-new
```

### Sprawdź czy porty są zajęte
```bash
lsof -i :8010  # Provisioning API
lsof -i :8110  # Data Provider API  
lsof -i :8181  # OPA Standalone
```

### Rebuild konkretnego serwisu
```bash
# Rebuild tylko Data Provider API
docker-compose -f docker-compose-new-arch.yml up --build -d data-provider-api

# Rebuild tylko Provisioning API
docker-compose -f docker-compose-new-arch.yml up --build -d provisioning-api

# Rebuild tylko OPA Standalone
docker-compose -f docker-compose-new-arch.yml up --build -d opa-standalone
```

## 📊 Oczekiwane rezultaty

Po uruchomieniu `./test-new-architecture.sh` powinieneś zobaczyć:

```
🚀 Testing OPA Zero Poll New Architecture
=========================================

🔍 Checking if services are running...
Testing Data Provider API (8110)... ✓ OK
Testing Provisioning API (8010)... ✓ OK  
Testing OPA Standalone (8181)... ✓ OK

🧪 Testing API functionality...
Data Provider API:
  Health check... ✓ OK
  Tenant1 users... ✓ OK
  Tenant2 users... ✓ OK
Provisioning API:
  Health check... ✓ OK
  Tenants list... ✓ OK
OPA Standalone:
Testing Health check... ✓ OK
  Admin access test... ✓ OK
  User access test... ✓ OK

🎯 Integration test: Full workflow
Adding test tenant... ✓ OK
Retrieving test tenant... ✓ OK

✅ New Architecture Testing Complete!
```

## 🎯 Następne kroki

Po pomyślnym uruchomieniu i testach możesz przejść do:
- **Task 20**: Integration scripts - skrypty łączące wszystkie komponenty
- Dalsze testowanie scenariuszy integracyjnych
- Rozwijanie polityk OPA według potrzeb aplikacji

---

**🏗️ Nowa architektura OPA Zero Poll**  
**Mikroserwisy:** Data Provider API + Provisioning API + OPA Standalone  
**Bez OPAL:** Standalone authorization decisions 