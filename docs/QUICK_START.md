# 🚀 Quick Start Guide - OPA Zero Poll POC

Przewodnik uruchomienia **OPA Zero Poll** w 5 minut od zera do działającego POC.

## ⚡ Szybki Start (TL;DR)

```bash
# 1. Sklonuj repo
git clone https://github.com/plduser/opa-zero-poll.git
cd opa-zero-poll

# 2. Uruchom automatyczny setup
./scripts/setup.sh

# 3. Sprawdź czy wszystko działa
./scripts/verify.sh

# 4. Utwórz pierwszego tenant-a
curl -X POST http://localhost:8010/provision-tenant \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "demo123", "tenant_name": "Demo Company", "admin_email": "admin@demo.com", "admin_name": "Jan Kowalski"}'
```

**✅ Gotowe!** POC działa na `http://localhost:3000`

---

## 📋 Wymagania Systemowe

### **🖥️ Obsługiwane systemy:**
- ✅ **macOS** (Intel i Apple Silicon M1/M2)
- ✅ **Linux** (Ubuntu, Debian, RHEL, CentOS, Fedora)
- ✅ **Windows** (z Docker Desktop + WSL2)

### **🔧 Wymagane narzędzia:**
- **Docker Desktop** (najnowsza wersja)
- **Docker Compose** v2.0+
- **Git**
- **curl** (do testowania API)

### **🌐 Porty:**
Upewnij się, że następujące porty są wolne:
- `3000` - Portal UI (Next.js)
- `5432` - PostgreSQL
- `6380` - Redis
- `7000` - OPAL Client
- `7002` - OPAL Server
- `8010` - Provisioning API
- `8110` - Data Provider API
- `8181` - OPA Engine

---

## 🏃‍♂️ Krok po kroku (Manual Setup)

### **1. 📥 Pobranie i przygotowanie**

```bash
# Sklonuj repozytorium
git clone https://github.com/plduser/opa-zero-poll.git
cd opa-zero-poll

# Sprawdź czy Docker działa
docker --version
docker-compose --version
```

### **2. 🔧 Konfiguracja platformy (automatyczna)**

```bash
# Automatyczna detekcja i konfiguracja platformy
./scripts/platform-detect.sh

# LUB ręcznie (jeśli skrypt nie działa):
# macOS Intel lub Linux:
export DOCKER_PLATFORM=linux/amd64

# macOS Apple Silicon:
export DOCKER_PLATFORM=linux/arm64

# Windows:
export DOCKER_PLATFORM=linux/amd64
```

### **3. 🐳 Uruchomienie środowiska**

```bash
# Uruchom wszystkie serwisy
docker-compose up -d

# Sprawdź status kontenerów
docker-compose ps

# Sprawdź logi (opcjonalnie)
docker-compose logs --tail=50
```

**Oczekiwany wynik:**
```
✅ postgres-db         ... Up (healthy)
✅ data-provider-api   ... Up (healthy)  
✅ provisioning-api    ... Up (healthy)
✅ opa-standalone      ... Up (healthy)
✅ redis-broadcast     ... Up (healthy)
✅ opal-server         ... Up (healthy)
✅ opal-client         ... Up (healthy)
```

### **4. ✅ Weryfikacja działania**

```bash
# Health checks wszystkich serwisów
curl http://localhost:8110/health  # Data Provider API
curl http://localhost:8010/health  # Provisioning API
curl http://localhost:8181/health  # OPA Engine
curl http://localhost:7002/healthcheck  # OPAL Server
curl http://localhost:7000/healthcheck  # OPAL Client

# Sprawdź czy baza danych ma dane
curl http://localhost:8110/tenants
curl http://localhost:8010/tenants
```

**Wszystkie powinny zwrócić status `200 OK`**

### **5. 🎯 Test podstawowej funkcjonalności**

```bash
# Utwórz nowego tenant-a
curl -X POST http://localhost:8010/provision-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "demo_tenant_123",
    "tenant_name": "Demo Company Ltd",
    "admin_email": "admin@democompany.com",
    "admin_name": "Jan Kowalski"
  }'

# Sprawdź czy tenant został utworzony
curl http://localhost:8110/tenants | jq .

# Sprawdź czy dane są w OPA
curl http://localhost:8181/v1/data/acl/demo_tenant_123 | jq .

# Test autoryzacji
curl "http://localhost:8181/v1/data/rbac/allow" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "admin_demo_tenant_123",
      "action": "manage_users", 
      "resource": "portal",
      "tenant": "demo_tenant_123"
    }
  }' | jq .
```

**Oczekiwany wynik:** `{"result": true}` - administrator ma uprawnienia

### **6. 🌐 Uruchomienie Portal UI (opcjonalnie)**

```bash
# Przejdź do głównego katalogu (jeśli nie jesteś tam)
cd /path/to/opa-zero-poll

# Zainstaluj zależności Node.js
npm install

# Uruchom aplikację Next.js
npm run dev
```

**Portal dostępny na:** `http://localhost:3000`

---

## ⚡ Automatyzacja - Skrypty

### **🔧 `./scripts/setup.sh`** - Automatyczny setup
```bash
# Kompletny setup w jednej komendzie
./scripts/setup.sh

# Z dodatkowymi opcjami:
./scripts/setup.sh --with-portal    # + uruchomienie Portal UI
./scripts/setup.sh --clean          # + czyszczenie kontenerów
./scripts/setup.sh --verbose        # + szczegółowe logi
```

### **✅ `./scripts/verify.sh`** - Weryfikacja
```bash
# Sprawdź czy wszystko działa
./scripts/verify.sh

# Szczegółowa diagnostyka
./scripts/verify.sh --detailed

# Test z utworzeniem tenant-a
./scripts/verify.sh --test-tenant
```

### **🔄 `./scripts/restart.sh`** - Restart
```bash
# Restart wszystkich serwisów
./scripts/restart.sh

# Restart tylko backend serwisów
./scripts/restart.sh --backend-only
```

---

## 🎯 Następne kroki

Po uruchomieniu POC możesz:

### **📖 Przeczytać dokumentację:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - architektura systemu
- [DEPLOYMENT.md](DEPLOYMENT.md) - szczegółowy deployment
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - struktura bazy danych

### **🧪 Przetestować funkcjonalności:**
- [Portal Management](PORTAL_MANAGEMENT.md) - zarządzanie uprawnieniami
- [Teams Management](TEAMS_MANAGEMENT.md) - zarządzanie zespołami
- [End-to-End Scenarios](END_TO_END_SCENARIOS.md) - kompletne scenariusze

### **🔧 Konfiguracja zaawansowana:**
- Integracja z własną bazą danych
- Konfiguracja zewnętrznych OPAL Data Sources
- Customowe polityki OPA
- Monitoring i logowanie

---

## ❌ Troubleshooting

### **🐳 Docker problemy:**

```bash
# Sprawdź czy Docker działa
docker ps

# Restart Docker Desktop (macOS/Windows)
# Restart docker service (Linux):
sudo systemctl restart docker

# Wyczyść cache Docker
docker system prune -a

# Rebuild kontenerów bez cache
docker-compose build --no-cache
docker-compose up -d
```

### **🌐 Problemy z portami:**

```bash
# Sprawdź które porty są zajęte
netstat -an | grep LISTEN | grep -E "3000|5432|6380|7000|7002|8010|8110|8181"

# Zatrzymaj proces na porcie (przykład dla 3000):
lsof -ti:3000 | xargs kill -9
```

### **🔧 Problemy z platformą:**

```bash
# macOS Intel / Linux:
sed -i 's/platform: linux\/arm64/platform: linux\/amd64/g' docker-compose.yml

# macOS Apple Silicon:
sed -i 's/platform: linux\/amd64/platform: linux\/arm64/g' docker-compose.yml

# Windows (w Git Bash lub WSL):
sed -i 's/platform: linux\/arm64/platform: linux\/amd64/g' docker-compose.yml
```

### **🏥 Health Check problemy:**

```bash
# Sprawdź szczegółowe logi serwisu
docker-compose logs data-provider-api --tail=100
docker-compose logs provisioning-api --tail=100
docker-compose logs opal-server --tail=100

# Restart konkretnego serwisu
docker-compose restart data-provider-api
```

---

## 📞 Pomoc

Jeśli masz problemy:

1. **📋 Uruchom diagnostykę:** `./scripts/verify.sh --detailed`
2. **📝 Sprawdź logi:** `docker-compose logs --tail=100`  
3. **🔄 Spróbuj restart:** `./scripts/restart.sh`
4. **🧹 Wyczyść środowisko:** `docker-compose down -v && docker system prune -a`

### **💬 Kontakt:**
- **Issues:** [GitHub Issues](https://github.com/plduser/opa-zero-poll/issues)
- **Dokumentacja:** [docs/](../docs/)
- **README:** [README.md](../README.md)

---

**🎉 Gotowe! Twój POC OPA Zero Poll działa lokalnie!** 🚀 