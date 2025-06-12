# 🔗 OPA Zero Poll - Integration Scripts

Kompleksowe skrypty integracji danych między Data Provider API a OPA, umożliwiające testowanie funkcjonalności bez OPAL.

## 📋 Przegląd

Ten katalog zawiera kompletne rozwiązanie integracyjne składające się z:

- **`data_integration.py`** - Główny skrypt integracji danych 
- **`monitor.py`** - System monitorowania w czasie rzeczywistym
- **`run_tests.sh`** - Skrypt testowy dla całej integracji
- **`config.json`** - Plik konfiguracyjny

## 🏗️ Architektura Integracji

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐
│ Data Provider   │    │  Integration     │    │ OPA         │
│ API (port 8110) │◄───┤  Scripts         ├───►│ Standalone  │
└─────────────────┘    └──────────────────┘    │ (port 8181) │
                                                └─────────────┘
           ▲                                             ▲
           │                                             │
           ▼                                             ▼
┌─────────────────┐                           ┌─────────────┐
│ Provisioning    │                           │ RBAC Policy │
│ API (port 8010) │                           │ Decisions   │
└─────────────────┘                           └─────────────┘
```

## 🚀 Szybkie uruchomienie

### 1. Upewnij się że wszystkie serwisy działają

```bash
# Z głównego katalogu projektu
docker-compose -f docker-compose-new-arch.yml up -d

# Sprawdź status
docker ps
```

### 2. Uruchom pełne testy integracyjne

```bash
cd new-architecture/integration-scripts
./run_tests.sh all
```

## 📖 Szczegółowe użycie

### Skrypt główny (`data_integration.py`)

```bash
# Health check wszystkich serwisów
python data_integration.py health

# Synchronizacja danych wszystkich tenantów
python data_integration.py sync

# Pełny test end-to-end
python data_integration.py test

# Ciągłe monitorowanie i odświeżanie (co 5 min)
python data_integration.py watch
```

### System monitorowania (`monitor.py`)

```bash
# Jednorazowy raport statusu
python monitor.py status

# Dashboard w czasie rzeczywistym
python monitor.py dashboard

# Ciągłe monitorowanie (logowanie co 30s)
python monitor.py watch 30
```

### Skript testowy (`run_tests.sh`)

```bash
# Setup środowiska Python
./run_tests.sh setup

# Sprawdź czy serwisy działają
./run_tests.sh check

# Poszczególne testy
./run_tests.sh health      # Test health check
./run_tests.sh sync        # Test synchronizacji
./run_tests.sh e2e         # Test end-to-end
./run_tests.sh monitor     # Test monitorowania
./run_tests.sh performance # Test wydajności

# Wszystkie testy
./run_tests.sh all

# Czyszczenie środowiska
./run_tests.sh clean
```

## ⚙️ Konfiguracja

### `config.json`

```json
{
  "data_provider_url": "http://localhost:8110",
  "opa_url": "http://localhost:8181", 
  "provisioning_url": "http://localhost:8010",
  "refresh_interval_minutes": 5,
  "log_level": "INFO",
  "max_retries": 3,
  "retry_delay": 2
}
```

### Zmienne środowiskowe (opcjonalne)

```bash
export DATA_PROVIDER_URL="http://localhost:8110"
export OPA_URL="http://localhost:8181"
export PROVISIONING_URL="http://localhost:8010"
export LOG_LEVEL="DEBUG"
```

## 🔄 Proces integracji

### 1. Pobieranie danych ACL

Skrypt automatycznie:
- Pobiera listę tenantów z Provisioning API
- Dla każdego tenanta pobiera dane ACL z Data Provider API
- Loguje wszystkie operacje

### 2. Transformacja danych

Dane ACL są transformowane do formatu OPA:

```json
{
  "tenant_data": {
    "tenant1": {
      "tenant_id": "tenant1",
      "tenant_name": "Test Company 1",
      "users": {
        "user1": {
          "username": "admin_user",
          "roles": ["admin"],
          "permissions": ["read", "write", "delete", "manage_users"]
        }
      },
      "roles": {
        "admin": ["read", "write", "delete", "manage_users", "manage_tenant"],
        "user": ["read", "write"]
      },
      "updated_at": "2025-06-12T18:00:00"
    }
  }
}
```

### 3. Ładowanie do OPA

Dane są ładowane do OPA przez REST API:
- `PUT /v1/data/tenant_data/{tenant_id}`
- Automatyczna weryfikacja załadowania
- Retry w przypadku błędów

### 4. Testowanie decyzji

Skrypt testuje czy OPA podejmuje prawidłowe decyzje:

```json
{
  "input": {
    "user": "user1",
    "role": "admin",
    "action": "delete",
    "resource": "data"
  }
}
```

## 🧪 Scenariusze testowe

### Test Cases w `config.json`

1. **Admin Access** - admin może wszystko
2. **User Restrictions** - użytkownik nie może usuwać cudzych danych
3. **Owner Access** - użytkownik może modyfikować swoje dane
4. **Viewer Limits** - viewer tylko czyta publiczne zasoby

### Performance Tests

- 10 zapytań w szybkiej sekwencji
- Pomiar czasu odpowiedzi
- Test stabilności OPA

## 📊 Monitorowanie

### Real-time Dashboard

```
🚀 OPA Zero Poll System Monitor
============================================
Last updated: 2025-06-12 18:15:30

📊 Service Status:
------------------------------------------------------------
✅ Data Provider API    Status: healthy     Uptime: 100.0% Response:   45.2ms
✅ Provisioning API     Status: healthy     Uptime: 100.0% Response:   32.1ms  
✅ OPA Standalone       Status: healthy     Uptime: 100.0% Response:   18.5ms

🧠 OPA Decision Test: ✅ working
🏢 Active Tenants: 2
```

### Logowanie

Wszystkie operacje są logowane do plików:
- `data_integration.log` - operacje integracji
- `system_monitor.log` - monitorowanie systemu
- `integration_tests.log` - wyniki testów

## 🔧 Troubleshooting

### Częste problemy

1. **Services not running**
   ```bash
   docker-compose -f ../../docker-compose-new-arch.yml up -d
   ```

2. **Connection refused**
   - Sprawdź czy porty 8010, 8110, 8181 są wolne
   - Sprawdź logi kontenerów: `docker logs <container_name>`

3. **Permission denied**
   ```bash
   chmod +x *.py *.sh
   ```

4. **Python dependencies**
   ```bash
   ./run_tests.sh setup
   ```

### Debugowanie

```bash
# Verbose logging
export LOG_LEVEL="DEBUG"
python data_integration.py test

# Sprawdź health check ręcznie
curl http://localhost:8110/health
curl http://localhost:8010/health  
curl http://localhost:8181/health

# Sprawdź dane w OPA
curl http://localhost:8181/v1/data/tenant_data
```

## 📈 Metryki i wydajność

### Oczekiwane wartości

- **Health check**: < 100ms
- **Data sync**: < 5s na tenant
- **OPA decisions**: < 50ms
- **Uptime**: > 99%

### Alerting

System automatycznie alarmuje gdy:
- Serwis nie odpowiada > 30s
- OPA zwraca błędne decyzje
- Synchronizacja danych nie powiodła się

## 🎯 Następne kroki

Po pomyślnym uruchomieniu integration scripts:

1. **Rozwiń polityki OPA** - dodaj więcej ról i uprawnień
2. **Dodaj więcej tenantów** - przetestuj skalowalność
3. **Zintegruj z aplikacją** - użyj jako backend autoryzacji
4. **Monitoruj w produkcji** - ustaw alerty i dashboardy

---

**🏗️ Task 20: Integration Scripts**  
**Status:** ✅ Completed  
**Funkcjonalność:** Pełna integracja Data Provider API + OPA + Provisioning API bez OPAL 