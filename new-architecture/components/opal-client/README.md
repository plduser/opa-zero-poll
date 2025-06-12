# OPAL Client - Synchronizator

OPAL Client służy jako **Policy Enforcement Point (PEP)** w architekturze OPA_ZERO_POLL, odpowiedzialny za synchronizację polityk i danych między OPAL Server a instancją OPA.

## Architektura

```
GitHub Webhook → Data Provider API → OPAL Server → Postgres Broadcast → OPAL Client → OPA Instance
```

## Funkcjonalności

### 1. **WebSocket Connection z OPAL Server**
- Nawiązuje i utrzymuje połączenie WebSocket z OPAL Server
- Automatyczne ponowne łączenie w przypadku przerw w sieci
- Obsługa błędów połączenia z retry logic

### 2. **Real-time Policy Updates**
- Odbiera aktualizacje polityk z OPAL Server w czasie rzeczywistym
- Automatycznie ładuje nowe polityki do instancji OPA
- Zastępuje istniejące polityki gdy to konieczne

### 3. **Data Synchronization**
- Odbiera aktualizacje danych z Flask mock services:
  - Data Provider API (symulacja Database ATS)
  - Provisioning Service (zarządzanie tenantami)
- Transformuje i ładuje dane do OPA via REST API
- Obsługuje multiple data sources jednocześnie

### 4. **Integration Scripts Replacement**
- Zastępuje funkcjonalność Integration Scripts
- Przechodzi z HTTP-based sync na WebSocket-based real-time updates
- Zachowuje wszystkie istniejące funkcjonalności

## Konfiguracja

### Environment Variables

```bash
# OPAL Server connection
OPAL_SERVER_URL=http://opal-server:7002
OPAL_CLIENT_STAT_ID=opal-client-1

# OPA connection  
OPAL_POLICY_STORE_URL=http://opa-standalone-new:8181
OPAL_POLICY_SUBSCRIPTION_DIRS=policies

# Data sources
OPAL_DATA_UPDATER_ENABLED=true
OPAL_INLINE_OPA_ENABLED=false

# Performance
OPAL_LOG_LEVEL=INFO
OPAL_LOG_FORMAT_INCLUDE_PID=true

# Authentication (disabled for development)
OPAL_AUTH_TOKEN=
OPAL_CLIENT_TOKEN=
```

### Docker Configuration

OPAL Client jest skonfigurowany w `docker-compose.yml`:

```yaml
opal-client:
  image: permitio/opal-client:latest
  container_name: opal-client
  ports:
    - "7001:7000"  # OPAL Client API
  depends_on:
    - opal-server
    - opa-standalone
```

## API Endpoints

### Health Check
```bash
GET http://localhost:7001/healthcheck
```

### Client Status
```bash
GET http://localhost:7001/policy-store/status
```

### Policy Store Info
```bash
GET http://localhost:7001/policy-store/policy-modules
```

## Monitoring i Logging

### Logi
- Wszystkie operacje są logowane z poziomem INFO
- Tracking synchronization status
- Connection health monitoring
- Data loading operations

### Health Checks
- Automatyczne health checks co 30 sekund
- Monitoring połączenia z OPAL Server
- Sprawdzanie dostępności OPA instance

## Deployment

### Uruchomienie
```bash
# Uruchom całą architekturę
docker-compose up -d

# Sprawdź status OPAL Client
docker-compose logs opal-client

# Sprawdź health check
curl http://localhost:7001/healthcheck
```

### Troubleshooting

#### Problem z połączeniem do OPAL Server
```bash
# Sprawdź logi OPAL Client
docker-compose logs opal-client

# Sprawdź czy OPAL Server działa
curl http://localhost:7002/healthcheck

# Sprawdź network connectivity
docker-compose exec opal-client ping opal-server
```

#### Problem z połączeniem do OPA
```bash
# Sprawdź status OPA
curl http://localhost:8181/health

# Sprawdź czy OPA jest dostępne z OPAL Client
docker-compose exec opal-client curl http://opa-standalone-new:8181/health
```

## Integracja z Istniejącymi Komponentami

### Data Provider API
- Webhook forwarding do OPAL Server
- OPAL Client odbiera updates via broadcast channel
- Automatyczne ładowanie danych do OPA

### Provisioning API  
- Tenant management data synchronization
- Real-time updates przy zmianach tenantów
- Automatyczna aktualizacja polityk RBAC

### OPA Standalone
- Direct connection via REST API
- Policy loading i data updates
- Health monitoring

## Bezpieczeństwo

### Development Environment
- Authentication wyłączone dla development
- Brak token validation
- Open network access

### Production Considerations
- Włączyć OPAL authentication
- Skonfigurować proper tokens
- Network security (VPN/private networks)
- TLS encryption dla WebSocket connections

## Performance

### Optimizations
- Single worker configuration
- Efficient WebSocket handling
- Batch data updates
- Connection pooling

### Monitoring Metrics
- Connection uptime
- Update frequency
- Data synchronization latency
- Error rates

## Migracja z Integration Scripts

### Przed OPAL Client (Integration Scripts)
- HTTP-based polling synchronization
- Manual data fetching i loading
- Scheduled updates
- Point-to-point connections

### Po OPAL Client
- WebSocket-based real-time updates  
- Automatic policy i data synchronization
- Event-driven architecture
- Centralized policy management via OPAL Server

### Zachowane Funkcjonalności
- Wszystkie data sources (Data Provider API, Provisioning)
- OPA policy loading
- Error handling i retry logic
- Health monitoring
- Logging i debugging capabilities 