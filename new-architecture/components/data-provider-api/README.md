# Data Provider API - Standalone Service

Prosty serwis ACL (Access Control List) symulujący zewnętrzny system uprawnień dla projektu OPA Zero Poll.

## 🎯 Cel

Dostarczanie danych uprawnień (ACL) dla różnych tenantów w sposób standaryzowany i testowany. Ten komponent działa jako standalone serwis z własnymi testami przed integracją z resztą systemu.

## 📋 Funkcjonalności

- **Endpoint ACL**: Zwracanie danych uprawnień dla określonego tenanta
- **Health Check**: Monitoring zdrowia serwisu
- **Lista Tenantów**: Przegląd dostępnych tenantów
- **Logowanie**: Szczegółowe logowanie wszystkich żądań
- **Obsługa błędów**: Prawidłowa obsługa błędów 404/500

## 🚀 Quickstart

### Uruchomienie z Docker Compose
```bash
# Uruchomienie serwisu
docker-compose up --build

# Sprawdzenie zdrowia
curl http://localhost:8110/health

# Pobranie ACL dla tenant1
curl http://localhost:8110/tenants/tenant1/acl
```

### Uruchomienie lokalne
```bash
# Instalacja zależności
pip install -r requirements.txt

# Uruchomienie aplikacji
python app.py
```

## 📊 API Endpoints

### GET /health
**Opis**: Sprawdzenie zdrowia serwisu  
**Odpowiedź**:
```json
{
    "status": "healthy",
    "service": "data-provider-api", 
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0"
}
```

### GET /tenants/{tenant_id}/acl
**Opis**: Pobranie danych ACL dla określonego tenanta  
**Parametry**: 
- `tenant_id` (string): Identyfikator tenanta (tenant1, tenant2)

**Odpowiedź dla tenant1**:
```json
{
    "tenant_id": "tenant1",
    "tenant_name": "Test Company 1",
    "users": [
        {
            "user_id": "user1",
            "username": "admin_user",
            "roles": ["admin"],
            "permissions": ["read", "write", "delete", "manage_users"]
        },
        {
            "user_id": "user2",
            "username": "regular_user", 
            "roles": ["user"],
            "permissions": ["read", "write"]
        }
    ],
    "roles": {
        "admin": ["read", "write", "delete", "manage_users", "manage_tenant"],
        "user": ["read", "write"]
    },
    "retrieved_at": "2024-01-01T12:00:00.000Z"
}
```

### GET /tenants
**Opis**: Lista wszystkich dostępnych tenantów  
**Odpowiedź**:
```json
{
    "tenants": [
        {
            "tenant_id": "tenant1",
            "tenant_name": "Test Company 1",
            "users_count": 2,
            "roles_count": 2
        },
        {
            "tenant_id": "tenant2", 
            "tenant_name": "Test Company 2",
            "users_count": 1,
            "roles_count": 1
        }
    ],
    "total_count": 2,
    "retrieved_at": "2024-01-01T12:00:00.000Z"
}
```

### GET /
**Opis**: Informacje o API i dostępnych endpoint'ach

## 🧪 Testowanie

### Uruchomienie testów
```bash
# Instalacja zależności testowych
pip install -r requirements.txt

# Uruchomienie wszystkich testów
pytest tests/ -v

# Uruchomienie testów z pokryciem
pytest tests/ --cov=app --cov-report=html
```

### Testy integracyjne z curl
```bash
# Health check
curl http://localhost:8110/health

# ACL dla tenant1 
curl http://localhost:8110/tenants/tenant1/acl

# ACL dla tenant2
curl http://localhost:8110/tenants/tenant2/acl

# Lista tenantów
curl http://localhost:8110/tenants

# Test błędu 404
curl http://localhost:8110/tenants/nonexistent/acl
```

## 📂 Dane testowe

### Tenant1 (Test Company 1)
- **user1** (admin_user): rola `admin` - pełne uprawnienia
- **user2** (regular_user): rola `user` - uprawnienia podstawowe

### Tenant2 (Test Company 2)  
- **user3** (viewer_user): rola `viewer` - tylko odczyt

## ⚙️ Konfiguracja

### Zmienne środowiskowe
- `PORT`: Port serwisu (domyślnie: 8110)
- `DEBUG`: Tryb debug (domyślnie: false)

### Docker
- **Port**: 8110
- **Health check**: Wbudowany health check endpoint
- **Logi**: Dostępne w kontenerze

## 🔧 Rozwój

### Struktura plików
```
data-provider-api/
├── app.py              # Główna aplikacja Flask
├── requirements.txt    # Zależności Python
├── Dockerfile         # Obraz Docker
├── docker-compose.yml # Kompozycja Docker
├── README.md         # Ta dokumentacja
└── tests/
    └── test_app.py   # Testy jednostkowe
```

### Dodawanie nowych tenantów
Edytuj zmienną `ACL_DATA` w `app.py` i dodaj nowego tenanta z odpowiednią strukturą danych.

## ✅ Status implementacji

- [x] Endpoint `/tenants/{tenant_id}/acl`
- [x] Endpoint `/health` 
- [x] Endpoint `/tenants`
- [x] Endpoint `/` (root info)
- [x] Statyczne dane testowe
- [x] Logowanie żądań
- [x] Obsługa błędów
- [x] Testy jednostkowe
- [x] Dockerfile
- [x] Docker Compose
- [x] Dokumentacja API

## 🎯 Następne kroki

Po zakończeniu testów tego komponentu, będzie on gotowy do integracji z:
1. **Provisioning API** (zadanie 18)
2. **OPA Engine** (zadanie 19) 
3. **Integration Scripts** (zadanie 20) 