# Provisioning API

**Standalone service do zarządzania tenantami w systemie OPA Zero Poll**

Provisioning API to niezależny mikroserwis odpowiedzialny za zarządzanie tenantami (najemcami) w systemie autoryzacji. Zapewnia pełne CRUD operacje dla tenantów z bezpiecznym przechowywaniem danych w bazie SQLite.

## 🚀 Funkcjonalności

- **Rejestracja tenantów** - dodawanie nowych tenantów do systemu
- **Zarządzanie tenantami** - listowanie, pobieranie szczegółów, aktualizacja statusu
- **Usuwanie tenantów** - bezpieczne usuwanie tenantów z systemu
- **Health checks** - monitoring zdrowia serwisu
- **Walidacja danych** - kompleksowa walidacja danych wejściowych
- **Logowanie** - szczegółowe logowanie wszystkich operacji
- **Baza danych SQLite** - trwałe przechowywanie danych tenantów
- **Docker support** - pełna konteneryzacja z health checks

## 📋 API Endpoints

### Health Check
```http
GET /health
```

**Odpowiedź:**
```json
{
  "status": "healthy",
  "service": "provisioning-api",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "database": "connected",
  "tenant_count": 5
}
```

### Dodawanie Tenanta
```http
POST /provision-tenant
Content-Type: application/json

{
  "tenant_id": "company123",
  "tenant_name": "Example Company Ltd",
  "metadata": {
    "type": "enterprise",
    "region": "EU",
    "contact": "admin@company.com"
  }
}
```

**Odpowiedź (201):**
```json
{
  "message": "Tenant provisioned successfully",
  "tenant": {
    "tenant_id": "company123",
    "tenant_name": "Example Company Ltd",
    "created_at": "2024-01-15T10:30:00.000Z",
    "status": "active",
    "metadata": {
      "type": "enterprise",
      "region": "EU",
      "contact": "admin@company.com"
    }
  }
}
```

### Lista Tenantów
```http
GET /tenants
GET /tenants?status=active
```

**Odpowiedź:**
```json
{
  "tenants": [
    {
      "tenant_id": "company123",
      "tenant_name": "Example Company Ltd",
      "created_at": "2024-01-15T10:30:00.000Z",
      "status": "active",
      "metadata": {
        "type": "enterprise",
        "region": "EU"
      }
    }
  ],
  "total_count": 1,
  "filter": "active",
  "retrieved_at": "2024-01-15T10:35:00.000Z"
}
```

### Szczegóły Tenanta
```http
GET /tenants/{tenant_id}
```

### Usuwanie Tenanta
```http
DELETE /tenants/{tenant_id}
```

**Odpowiedź:**
```json
{
  "message": "Tenant deleted successfully",
  "tenant_id": "company123",
  "deleted_at": "2024-01-15T10:40:00.000Z"
}
```

### Aktualizacja Statusu
```http
PUT /tenants/{tenant_id}/status
Content-Type: application/json

{
  "status": "inactive"
}
```

Dostępne statusy: `active`, `inactive`, `suspended`

## 🗄️ Schema Bazy Danych

```sql
CREATE TABLE tenants (
    tenant_id TEXT PRIMARY KEY,
    tenant_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    metadata TEXT
);
```

## 🛠️ Instalacja i Uruchomienie

### Wymagania
- Python 3.11+
- pip

### Lokalne uruchomienie

1. **Sklonuj projekt i przejdź do katalogu:**
```bash
cd new-architecture/components/provisioning-api
```

2. **Stwórz wirtualne środowisko:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# lub
venv\Scripts\activate     # Windows
```

3. **Zainstaluj zależności:**
```bash
pip install -r requirements.txt
```

4. **Uruchom aplikację:**
```bash
python app.py
```

Aplikacja będzie dostępna pod adresem `http://localhost:8010`

### Docker

1. **Zbuduj obraz:**
```bash
docker build -t provisioning-api .
```

2. **Uruchom kontener:**
```bash
docker run -p 8010:8010 provisioning-api
```

### Docker Compose

```bash
docker-compose up --build
```

## 🧪 Testy

### Uruchomienie testów jednostkowych

```bash
# W wirtualnym środowisku
python -m pytest test_app.py -v

# Lub bezpośrednio
python test_app.py
```

### Przykładowe testy manualne

```bash
# Health check
curl http://localhost:8010/health

# Dodanie tenanta
curl -X POST http://localhost:8010/provision-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test_company",
    "tenant_name": "Test Company",
    "metadata": {"region": "EU"}
  }'

# Lista tenantów
curl http://localhost:8010/tenants

# Szczegóły tenanta
curl http://localhost:8010/tenants/test_company

# Aktualizacja statusu
curl -X PUT http://localhost:8010/tenants/test_company/status \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'

# Usunięcie tenanta
curl -X DELETE http://localhost:8010/tenants/test_company
```

## ⚙️ Konfiguracja

### Zmienne Środowiskowe

| Zmienna | Domyślna wartość | Opis |
|---------|------------------|------|
| `PORT` | `8010` | Port na którym nasłuchuje serwis |
| `DEBUG` | `false` | Tryb debug Flask |
| `DATABASE_PATH` | `tenants.db` | Ścieżka do pliku bazy SQLite |

### Przykład konfiguracji Docker

```bash
docker run -e PORT=8020 -e DEBUG=true -p 8020:8020 provisioning-api
```

## 📊 Monitoring i Logowanie

Aplikacja loguje wszystkie operacje z następującymi poziomami:
- **INFO**: Normalne operacje (żądania, sukces)
- **WARNING**: Ostrzeżenia (duplikaty, nie znaleziono)
- **ERROR**: Błędy (problemy z bazą, walidacja)

Przykład logu:
```
2024-01-15 10:30:00,123 - INFO - Request: POST /provision-tenant from 127.0.0.1
2024-01-15 10:30:00,125 - INFO - Request data: {'tenant_id': 'company123', 'tenant_name': 'Company'}
2024-01-15 10:30:00,130 - INFO - Tenant company123 provisioned successfully
```

## 🔒 Bezpieczeństwo

- **Non-root user**: Kontener uruchamiany na użytkowniku bez uprawnień root
- **Input validation**: Walidacja wszystkich danych wejściowych
- **SQL injection protection**: Parametryzowane zapytania SQLite
- **Error handling**: Bezpieczne obsługiwanie błędów bez ujawniania szczegółów

## 🏗️ Architektura

```
provisioning-api/
├── app.py              # Główna aplikacja Flask
├── requirements.txt    # Zależności Python
├── Dockerfile         # Definicja obrazu Docker
├── docker-compose.yml # Konfiguracja Docker Compose
├── test_app.py        # Testy jednostkowe
├── README.md          # Dokumentacja
└── data/              # Katalog dla bazy danych (Docker volume)
    └── tenants.db     # Plik bazy SQLite
```

## 📈 Health Checks

Service posiada wbudowane health checks sprawdzające:
- Dostępność aplikacji
- Połączenie z bazą danych
- Liczbę tenantów w systemie

Docker health check:
- Interval: 30s
- Timeout: 10s
- Retries: 3
- Start period: 5s

## 🚦 Status Codes

| Kod | Znaczenie | Przykład użycia |
|-----|-----------|-----------------|
| 200 | OK | Sukces operacji GET, PUT, DELETE |
| 201 | Created | Tenant został utworzony |
| 400 | Bad Request | Błędne dane wejściowe |
| 404 | Not Found | Tenant lub endpoint nie istnieje |
| 409 | Conflict | Tenant już istnieje |
| 500 | Internal Server Error | Błąd serwera/bazy danych |

## 🔄 Integration Points

Provisioning API jest zaprojektowane jako standalone service, ale może być łatwo zintegrowane z:

- **Data Provider API** - synchronizacja danych tenantów
- **OPA Service** - konfiguracja polityk per tenant
- **Monitoring Tools** - poprzez health checks i logi
- **API Gateway** - jako upstream service

## 🎯 Przykłady Użycia

### Scenariusz: Dodanie nowego klienta

```bash
# 1. Dodaj tenanta
curl -X POST http://localhost:8010/provision-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "acme_corp",
    "tenant_name": "ACME Corporation",
    "metadata": {
      "type": "enterprise",
      "contact": "admin@acme.com",
      "created_by": "admin_user"
    }
  }'

# 2. Sprawdź czy został dodany
curl http://localhost:8010/tenants/acme_corp

# 3. Zobacz wszystkich tenantów
curl http://localhost:8010/tenants
```

### Scenariusz: Deaktywacja klienta

```bash
# Zmień status na nieaktywny
curl -X PUT http://localhost:8010/tenants/acme_corp/status \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'

# Sprawdź tylko aktywnych tenantów
curl http://localhost:8010/tenants?status=active
```

## 📝 Changelog

### v1.0.0 (2024-01-15)
- Pierwsza wersja Provisioning API
- Podstawowe operacje CRUD na tenantach
- Integracja z SQLite
- Docker support
- Kompletne testy jednostkowe
- Health checks i monitoring 