# OPAL Server Configuration

## Overview

OPAL Server działa jako centralny Policy Information Point (PIP) w architekturze OPA_ZERO_POLL. Zarządza politykami z GitHub repository i synchronizuje zmiany policy/data w czasie rzeczywistym z OPAL Clients.

## Architecture

```
GitHub Repository (polityki)
    ↓ webhook/polling
OPAL SERVER (PIP) ←→ Flask Mocki (Data Provider API, Provisioning API)
    ↓ WebSocket/PubSub (Redis)
OPAL CLIENT (Synchronizator)
    ↓ REST API
OPA Standalone
```

## Services

### 1. Redis (Broadcast Channel)
- **Image**: `redis:7-alpine`
- **Port**: `6379`
- **Function**: PubSub komunikacja między OPAL Server a OPAL Clients
- **Persistence**: Redis AOF (Append Only File)

### 2. OPAL Server
- **Image**: `permitio/opal-server:latest`
- **Ports**: 
  - `7002` - REST API
  - `7003` - WebSocket
- **Function**: Policy Information Point (PIP)

## Environment Variables

### Core Configuration
- `OPAL_BROADCAST_URI`: `redis://redis:6379` - Redis connection dla PubSub
- `OPAL_POLICY_REPO_URL`: GitHub repository URL z politykami
- `OPAL_POLICY_REPO_POLLING_INTERVAL`: `30` - interwał sprawdzania zmian (sekundy)

### Data Sources
`OPAL_DATA_CONFIG_SOURCES` konfiguruje źródła danych (nasze Flask mocki):

```json
{
  "config": {
    "entries": [
      {
        "url": "http://data-provider-api:8110/tenants/tenant1/acl",
        "topics": ["policy_data"],
        "dst_path": "/tenant1"
      },
      {
        "url": "http://data-provider-api:8110/tenants/tenant2/acl", 
        "topics": ["policy_data"],
        "dst_path": "/tenant2"
      },
      {
        "url": "http://provisioning-api:8010/tenants",
        "topics": ["policy_data"],
        "dst_path": "/tenants"
      }
    ]
  }
}
```

### Performance & Logging
- `UVICORN_NUM_WORKERS`: `2` - liczba worker processes
- `OPAL_LOG_LEVEL`: `INFO` - poziom logowania
- `OPAL_LOG_FORMAT_INCLUDE_PID`: `true` - include PID w logach

## Usage

### Start Services
```bash
cd new-architecture/components/opal-server
docker-compose up -d
```

### Check Status
```bash
# OPAL Server health
curl http://localhost:7002/healthcheck

# Redis health
docker exec opal-redis redis-cli ping
```

### View Logs
```bash
# OPAL Server logs
docker logs opal-server

# Redis logs
docker logs opal-redis
```

## Integration Points

### 1. GitHub Webhook
- Webhook endpoint w Data Provider API przekierowuje do OPAL Server
- OPAL Server automatycznie wykrywa zmiany w policy repository

### 2. Flask Mock Services
- **Data Provider API**: `http://data-provider-api:8110`
- **Provisioning API**: `http://provisioning-api:8010`
- OPAL Server pobiera dane z tych endpoints i publikuje do OPAL Clients

### 3. OPAL Client Communication
- WebSocket na porcie `7003`
- Redis PubSub dla broadcast updates
- Automatyczne reconnection i error handling

## Testing

### Policy Updates
```bash
# Trigger policy update (symulacja GitHub webhook)
curl -X POST http://localhost:7002/policy-update \
  -H "Content-Type: application/json" \
  -d '{"ref": "refs/heads/main"}'
```

### Data Updates
```bash
# Trigger data update
curl -X POST http://localhost:7002/data/config \
  -H "Content-Type: application/json" \
  -d '{"entries": [...]}'
```

## Troubleshooting

### Common Issues
1. **Redis Connection Failed**: Sprawdź czy Redis container jest uruchomiony
2. **GitHub Access**: Sprawdź czy repository URL jest publiczny lub skonfiguruj auth
3. **Flask Services Unreachable**: Sprawdź network connectivity z Data Provider/Provisioning APIs

### Debug Commands
```bash
# Check Redis connectivity
docker exec opal-server redis-cli -h redis ping

# Check OPAL Server logs
docker logs opal-server -f

# Check network connectivity
docker exec opal-server curl -f http://data-provider-api:8110/health
``` 