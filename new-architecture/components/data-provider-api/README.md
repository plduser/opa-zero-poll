# Data Provider API

Multi-tenant ACL data provider dla OPA z integracją PostgreSQL. Obsługuje Enhanced Model 1 (RBAC), zarządzanie użytkownikami, firmami, profilami aplikacji oraz integrację z OPAL External Data Sources.

## 📖 Dokumentacja API

### 🌐 Interactive Documentation (Swagger UI)
```
http://localhost:8110/docs
```

### 📝 OpenAPI Specification (JSON)
```
http://localhost:8110/openapi.json
```

### 📋 Kompletna lista endpointów
Zobacz plik: [API_ENDPOINTS.md](./API_ENDPOINTS.md)

## 🚀 Uruchomienie

```bash
# Uruchomienie przez Docker Compose (z głównego katalogu projektu)
docker-compose up -d data-provider-api

# Sprawdzenie statusu
curl http://localhost:8110/health
```

## 🔧 Konfiguracja

Service działa na porcie **8110** i integruje się z:
- **PostgreSQL** - baza danych
- **OPAL Server/Client** - synchronizacja polityk
- **Provisioning API** - zarządzanie tenantami

## 📊 Główne funkcjonalności

- **Enhanced Model 1 (RBAC)** - zarządzanie rolami i uprawnieniami
- **Multi-tenant support** - obsługa wielu tenantów
- **OPAL External Data Sources** - integracja z OPAL
- **User Data Sync Service** - synchronizacja danych użytkowników
- **REST API** - pełne API do zarządzania danymi
- **OpenAPI Documentation** - interaktywna dokumentacja

Szczegółowa dokumentacja dostępna w: [docs/API.md](../../docs/API.md) 