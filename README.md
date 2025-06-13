# OPA Zero Poll

**OPA Zero Poll** to nowoczesny system zarządzania politykami RBAC i autoryzacją, oparty na OPA, z integracją OPAL. Architektura oparta o mikroserwisy, integrację przez REST i webhooki GitHub.

---

## Założenia projektu (Proof of Concept)

Ten projekt jest **Proof of Concept (POC)**, który ma za zadanie **pokazać realizowalność** docelowej architektury systemu autoryzacji dla aplikacji enterprise. 

### Architektura docelowa
![Architektura docelowa](docs/architektura-docelowa.png)

Docelowy system ma obsługiwać:
- **Wiele aplikacji klienckich** korzystających z centralnej autoryzacji
- **Dynamiczne zarządzanie politykami** przez administratorów
- **Skalowalne rozwiązanie** dla dużej liczby użytkowników i tenantów
- **Real-time aktualizacje** polityk bez restartowania aplikacji

### Rola komponentów w architekturze docelowej

#### 🏢 **Data Provider API** (Port 8110)
**Cel**: Symuluje **Enterprise Data Source** z diagramu docelowego
- Dostarcza dane użytkowników, ról i uprawnień dla każdego tenanta
- Odbiera webhooki GitHub o zmianach w politykach i przekierowuje je do OPAL
- Orkiestruje synchronizację danych między systemami przez API Integration Scripts
- W docelowym systemie zostanie zastąpiony przez prawdziwe systemy HR/ERP/CRM

#### ⚙️ **Provisioning API** (Port 8010) 
**Cel**: Symuluje **Tenant Management System** z diagramu docelowego
- Zarządza cyklem życia tenantów (dodawanie, usuwanie, konfiguracja)
- W docelowym systemie będzie zintegrowany z systemami onboardingu klientów

#### 🔄 **Integration Scripts** (Port 8000)
**Cel**: Symuluje **legacy data processing** w obecnym POC
- Orkiestruje przepływ danych między systemami (obecna implementacja)
- Zapewnia transformację danych do formatu wymaganego przez OPA
- W docelowym systemie zostanie zastąpiony przez event-driven data sources

#### 🛡️ **OPA + OPAL**
**Cel**: Stanowią rdzeń **Policy Decision Point (PDP)** z diagramu docelowego
- **OPA Standalone**: Silnik decyzyjny autoryzacji
- **OPAL Server**: Zarządzanie politykami i ich dystrybucja
- **OPAL Client**: Synchronizacja polityk w czasie rzeczywistym

### 📋 Co dowodzi ten POC?

1. **✅ Integracja mikroserwisów** - wszystkie komponenty komunikują się przez REST API
2. **✅ Real-time updates** - zmiany w politykach są automatycznie propagowane przez OPAL
3. **✅ Tenant isolation** - każdy tenant ma odrębne dane źródłowe (topiki w data-sources)  
4. **✅ GitHub-based policy management** - polityki są zarządzane jako kod
5. **✅ Health monitoring** - każdy komponent eksponuje endpointy health check
6. **✅ Skalowalna architektura** - komponenty mogą być niezależnie skalowane

---

## Architektura POC

```mermaid
graph TD
    A["Tenant Created Event"] --> B["Tenant Provisioning Service"]
    B --> E["OPAL Server<br/>Register Data Source"]
    C["User Role Changed Event"] --> D["User Data Sync Service"]
    D --> E["OPAL Server<br/>POST /data-config"]
    E --> F["OPAL Client"]
    F --> G["Data Provider API<br/>?tenant_id=X"]
    G --> F
    H["GitHub Policy Webhook"] --> I["Policy Management Service"]
    I --> E
    J["Recovery Process"] --> K["Tenant Discovery API"]
    K --> L["Full Data Export"]
    M["Manual Policy API"] --> I
```

- **Data Provider API** (Flask, port 8110) – dostarcza dane ACL dla tenantów, odbiera webhooki GitHub, orkiestruje synchronizację danych
- **Provisioning API** (Flask, port 8010) – zarządzanie tenantami
- **OPA Standalone** (port 8181) – silnik autoryzacji z politykami Rego
- **Integration Scripts** – synchronizacja danych i polityk, obsługa webhooków
- **OPAL Client** – synchronizuje dane z OPAL Server
- **OPAL Server** – zarządza politykami i synchronizacją z OPA

---

## Szybki start

1. **Klonuj repozytorium**
   ```sh
   git clone https://github.com/plduser/opa-zero-poll.git
   cd opa-zero-poll
   ```

2. **Uruchom wszystkie serwisy**
   ```sh
   docker-compose up --build -d
   ```

3. **Sprawdź health check wszystkich serwisów**
   ```sh
   curl http://localhost:8110/health  # Data Provider API
   curl http://localhost:8010/health  # Provisioning API
   curl http://localhost:8181/health  # OPA Standalone
   curl http://localhost:8000/health  # Integration Scripts
   ```

4. **Dodaj tenant2 (wymagane do testów)**
   ```sh
   curl -X POST http://localhost:8010/provision-tenant \
     -H "Content-Type: application/json" \
     -d '{"tenant_id": "tenant2", "tenant_name": "Test Company 2", "status": "active"}'
   ```

5. **Wykonaj synchronizację danych**
   ```sh
   curl -X POST http://localhost:8110/sync/trigger
   ```

6. **Uruchom testy systemu**
   ```sh
   python test_full_system.py
   ```

7. **Dodaj webhook GitHub (opcjonalnie)**
   - Skonfiguruj webhook na adres: `http://localhost:8110/webhook/policy-update` (lub przez ngrok)
   - Ustaw `WEBHOOK_SECRET` w pliku `.env` lub w zmiennych środowiskowych Dockera

8. **Testuj autoryzację ręcznie**
   ```sh
   # Test: Admin może czytać
   curl -X POST http://localhost:8181/v1/data/rbac/allow \
     -H "Content-Type: application/json" \
     -d '{"input": {"user": "user1", "role": "admin", "action": "read", "resource": "data", "tenant": "tenant1"}}'
   
   # Test: Viewer nie może pisać  
   curl -X POST http://localhost:8181/v1/data/rbac/allow \
     -H "Content-Type: application/json" \
     -d '{"input": {"user": "user3", "role": "viewer", "action": "write", "resource": "data", "tenant": "tenant2"}}'
   ```

---

## Dokumentacja

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – szczegóły architektury i diagramy
- [docs/API.md](docs/API.md) – opis endpointów
- [docs/WEBHOOKS.md](docs/WEBHOOKS.md) – integracja z GitHub

## Testowanie systemu

System zawiera automatyczne testy integracyjne w pliku `test_full_system.py`. Testy sprawdzają:

### 🔍 **Faza 1: Health Check Serwisów**
- Sprawdza czy wszystkie 4 główne serwisy odpowiadają prawidłowo
- Weryfikuje endpointy `/health` każdego komponentu

### 🔄 **Faza 2: Mechanizm Synchronizacji**  
- Testuje endpoint `/sync/health` dla statusu synchronizacji
- Sprawdza pełną synchronizację (`/sync/trigger`)
- Testuje synchronizację specyficzną dla tenanta (`/sync/tenant/{id}`)

### 📊 **Faza 3: Weryfikacja Danych w OPA**
- Sprawdza czy dane obu tenantów zostały załadowane do OPA
- Weryfikuje strukturę danych (użytkownicy, role, uprawnienia)

### 🔐 **Faza 4: Testowanie Autoryzacji**
Wykonuje 6 różnych scenariuszy autoryzacji:
- ✅ Admin może czytać
- ✅ Admin może pisać  
- ✅ User może czytać własne dane
- ✅ Viewer może czytać
- ❌ Viewer nie może pisać
- ❌ User nie może usuwać

### Uruchomienie testów

**Wymagania przed testami:**
1. Wszystkie serwisy muszą być uruchomione (`docker-compose up -d`)
2. Tenant2 musi być dodany (`curl -X POST http://localhost:8010/provision-tenant ...`)
3. Synchronizacja musi być wykonana (`curl -X POST http://localhost:8110/sync/trigger`)

**Komenda:**
```bash
python test_full_system.py
```

**Oczekiwany wynik:**
```
🎉 ALL TESTS PASSED! System is working correctly!
✅ Services: All healthy
✅ Synchronization: Working  
✅ Data Loading: Working
✅ Authorization: Working
```

## Wymagania

- Docker, Docker Compose
- Python 3.11 (jeśli chcesz uruchamiać serwisy lokalnie)

## Autorzy

- Jacek Paszek (plduser)
- Claude (Anthropic) - AI Assistant 

---

## 🖥️ Konfiguracja dla różnych systemów operacyjnych

### macOS (Apple Silicon - M1/M2/M3)

**Problem**: Kontenery Docker mogą mieć problemy z architekturą ARM64.

**Rozwiązanie**: W pliku `docker-compose.yml` już dodano `platform: linux/arm64` dla wszystkich serwisów. Jeśli nadal występują problemy:

```yaml
# W docker-compose.yml dla każdego serwisu:
services:
  data-provider-api:
    platform: linux/arm64  # ← Upewnij się że ta linia istnieje
    build: ./new-architecture/components/data-provider-api
  
  # Dla obrazów OPAL i Postgres może być potrzebne dodanie platform:
  opal-server:
    image: permitio/opal-server:latest
    platform: linux/arm64  # ← Dodaj jeśli występują problemy
  
  broadcast_channel:
    image: postgres:alpine  
    platform: linux/arm64  # ← Dodaj jeśli występują problemy
```

**Dodatkowe kroki**:
1. Sprawdź czy Docker Desktop ma włączone "Use Rosetta for x86/amd64 emulation"
2. Jeśli problemy z budowaniem, wymuś rebuild: `docker-compose build --no-cache`

### macOS (Intel)

**Zmiana wymagana**: Zamień `platform: linux/arm64` na `platform: linux/amd64` w `docker-compose.yml`:

```yaml
services:
  data-provider-api:
    platform: linux/amd64  # ← Zmień z arm64 na amd64
```

### Windows

**Wymagania**:
- Docker Desktop z WSL2
- Git for Windows lub WSL2 Ubuntu

**Zmiany w docker-compose.yml**:
```yaml
services:
  data-provider-api:
    platform: linux/amd64  # ← Użyj amd64 na Windows
```

**Potencjalne problemy**:
- **Mapowanie portów**: Sprawdź czy porty 8000, 8010, 8110, 8181, 7001, 7002 nie są zajęte
- **Ścieżki**: Używaj forward slashy (`/`) zamiast backslash (`\`) w ścieżkach

### Linux (Ubuntu/Debian/RHEL)

**Zmiany w docker-compose.yml**:
```yaml
services:
  data-provider-api:
    platform: linux/amd64  # ← Usuń lub zmień na amd64
```

**Dodatkowe zależności**:
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install docker.io docker-compose-plugin

# RHEL/CentOS/Fedora  
sudo dnf install docker docker-compose
```

### 🔧 Sprawdzenie konfiguracji

Po dostosowaniu platformy, sprawdź czy wszystko działa:

```bash
# 1. Restart wszystkich kontenerów
docker-compose down
docker-compose up --build -d

# 2. Sprawdź status
docker-compose ps

# 3. Test health checków
curl http://localhost:8110/health
curl http://localhost:8010/health
curl http://localhost:8181/health
curl http://localhost:8000/health
```

### 🚨 Częste problemy

#### Problem z portami
```bash
# Sprawdź zajęte porty
netstat -tulpn | grep :8110
# lub na macOS
lsof -i :8110

# Zmień porty w docker-compose.yml jeśli zajęte:
ports:
  - "8111:8110"  # Użyj innego portu zewnętrznego
```

#### Problem z pamięcią
```bash
# Zwiększ zasoby Docker Desktop:
# Settings → Resources → Advanced
# RAM: minimum 4GB, zalecane 8GB
# Swap: minimum 2GB
```

#### Problem z logami
```bash
# Sprawdź logi konkretnego serwisu
docker-compose logs data-provider-api
docker-compose logs opal-server

# Sprawdź logi na żywo
docker-compose logs -f
```

---
