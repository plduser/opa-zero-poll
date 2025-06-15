# Dynamiczne Zarządzanie Tenantami w OPAL

## Wprowadzenie

Podczas implementacji systemu multi-tenant z OPAL External Data Sources odkryliśmy skuteczne rozwiązanie dla dynamicznego dodawania tenantów bez konieczności restartowania serwisów. Rozwiązanie opiera się na **single topic multi-tenant** z automatycznym powiadamianiem OPAL o zmianach.

## Architektura Rozwiązania

### Kluczowe Komponenty

1. **Provisioning API** - zarządza tenantami i automatycznie powiadamia OPAL
2. **OPAL Server** - odbiera powiadomienia i dystrybuuje je do klientów
3. **OPAL Client** - subskrybuje jeden topic dla wszystkich tenantów
4. **Data Provider API** - dostarcza dane per-tenant na żądanie

### Przepływ Danych

```
Provisioning API → POST /data/config → OPAL Server
OPAL Server → WebSocket (single topic) → OPAL Client
OPAL Client → HTTP GET → Data Provider API
OPAL Client → PUT /v1/data/{tenant_id} → OPA
```

## Konfiguracja Single Topic Multi-Tenant

### OPAL Client Configuration

```bash
# Jeden topic dla wszystkich tenantów
OPAL_DATA_TOPICS=multi_tenant_data
```

### Data Provider API Response

```python
def get_opal_data_config():
    """Zwraca konfigurację dla wszystkich tenantów w jednym topic"""
    return {
        "entries": [
            {
                "url": f"http://data-provider-api:8110/tenants/{tenant_id}/acl",
                "topics": ["multi_tenant_data"],
                "dst_path": f"/acl/{tenant_id}"
            }
            for tenant_id in get_all_tenants()
        ]
    }
```

## Automatyczne Powiadamianie o Zmianach

### Provisioning API Integration

```python
def publish_tenant_update():
    """Powiadamia OPAL Server o zmianach w tenantach"""
    config = {
        "entries": [
            {
                "url": f"http://data-provider-api:8110/tenants/{tenant_id}/acl",
                "topics": ["multi_tenant_data"],
                "dst_path": f"/acl/{tenant_id}"
            }
            for tenant_id in get_all_tenants()
        ],
        "reason": "Tenant configuration updated"
    }
    
    response = requests.post(
        f"{OPAL_SERVER_URL}/data/config",
        json=config,
        headers={"Content-Type": "application/json"}
    )
    return response.status_code == 200
```

### Automatyczne Wywołanie przy Zmianach

```python
@app.post("/tenants")
async def add_tenant(tenant: TenantCreate):
    # Dodaj tenanta do bazy
    new_tenant = create_tenant(tenant)
    
    # Powiadom OPAL o zmianie
    if not publish_tenant_update():
        logger.warning("Failed to notify OPAL about tenant changes")
    
    return new_tenant

@app.delete("/tenants/{tenant_id}")
async def remove_tenant(tenant_id: str):
    # Usuń tenanta z bazy
    delete_tenant(tenant_id)
    
    # Powiadom OPAL o zmianie
    if not publish_tenant_update():
        logger.warning("Failed to notify OPAL about tenant changes")
    
    return {"status": "deleted"}
```

## Zalety Single Topic Multi-Tenant

### 1. Uproszczona Konfiguracja
- Jeden topic zamiast wielu per-tenant topics
- Brak konieczności rekonfiguracji OPAL Client przy dodawaniu tenantów
- Centralne zarządzanie subskrypcjami

### 2. Automatyczna Synchronizacja
- Wszystkie zmiany tenantów są automatycznie propagowane
- Brak opóźnień w dostępności nowych tenantów
- Spójność danych między komponentami

### 3. Skalowalność
- Dodawanie nowych tenantów bez restartów
- Efektywne wykorzystanie zasobów WebSocket
- Możliwość obsługi dużej liczby tenantów

## Implementacja w Praktyce

### Environment Variables

```bash
# Provisioning API
OPAL_SERVER_URL=http://opal-server:7002
DATA_PROVIDER_API_URL=http://data-provider-api:8110

# OPAL Client
OPAL_DATA_TOPICS=multi_tenant_data
```

### Testowanie Rozwiązania

```bash
# 1. Dodaj nowego tenanta
curl -X POST http://localhost:8010/tenants \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "test_tenant", "name": "Test Company"}'

# 2. Sprawdź czy dane są dostępne w OPA
curl -s http://localhost:8181/v1/data/acl/test_tenant | jq .

# 3. Sprawdź logi OPAL Client
docker logs opal-client --tail 20
```

### Oczekiwane Logi Sukcesu

```
INFO  | Received data update event for topic: multi_tenant_data
INFO  | Fetching data from: http://data-provider-api:8110/tenants/test_tenant/acl
INFO  | Saving fetched data to policy-store: destination path='/acl/test_tenant'
DEBUG | Processing store transaction: {'success': True, 'actions': ['set_policy_data']}
```

## Monitoring i Diagnostyka

### Sprawdzenie Konfiguracji OPAL

```bash
# OPAL Server data config
curl -s http://localhost:7002/data/config | jq .

# OPAL Client topics
docker exec opal-client env | grep OPAL_DATA_TOPICS
```

### Typowe Problemy i Rozwiązania

#### Problem: Nowy tenant nie jest widoczny w OPA
**Rozwiązanie:** Sprawdź czy Provisioning API wywołuje `publish_tenant_update()`

#### Problem: OPAL Client nie otrzymuje eventów
**Rozwiązanie:** Sprawdź konfigurację `OPAL_DATA_TOPICS` i połączenie WebSocket

#### Problem: Data Provider zwraca błąd 404
**Rozwiązanie:** Upewnij się, że endpoint `/tenants/{tenant_id}/acl` istnieje

## Podsumowanie

Rozwiązanie single topic multi-tenant z automatycznym powiadamianiem zapewnia:

- **Dynamiczne dodawanie tenantów** bez restartów serwisów
- **Automatyczną synchronizację** między wszystkimi komponentami
- **Uproszczoną konfigurację** OPAL Client
- **Skalowalność** dla dużej liczby tenantów
- **Niezawodność** dzięki centralnej koordynacji

To podejście stanowi solidną podstawę dla systemów multi-tenant wymagających wysokiej dostępności i elastyczności w zarządzaniu tenantami. 