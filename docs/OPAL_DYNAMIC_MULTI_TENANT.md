# OPAL Dynamic Multi-Tenant Configuration

## Idea i Cel

**Dynamiczne zarządzanie tenantami w OPAL** umożliwia dodawanie nowych tenantów **bez restartowania serwisów** przy użyciu **single topic multi-tenant** architecture. Rozwiązanie pozwala na:

- ✅ **Real-time tenant provisioning** - natychmiastowa dostępność nowych tenantów
- ✅ **Single topic scalability** - jeden topic obsługuje wszystkich tenantów  
- ✅ **Zero downtime** - brak konieczności restartów przy zmianach
- ✅ **Automatyczna synchronizacja** - wszystkie komponenty są natychmiast zaktualizowane

## Jak to Działa

### Architektura Single Topic Multi-Tenant

Tradycyjne podejście (wymaga restartu):
```bash
OPAL_DATA_TOPICS=tenant_1_data,tenant_2_data,tenant_3_data  # ❌ Statyczna konfiguracja
```

**Nasze rozwiązanie** (bez restartu):
```bash  
OPAL_DATA_TOPICS=multi_tenant_data  # ✅ Dynamiczna konfiguracja
```

### Kluczowe Odkrycie

**Separacja tenantów** odbywa się nie przez różne topics, ale przez:
1. **Różne URL endpoints** w Data Provider API: `/tenants/{tenant_id}/acl`
2. **Różne destination paths** w OPA: `/acl/{tenant_id}`
3. **Single topic** `multi_tenant_data` dla wszystkich powiadomień

## Przepływ End-to-End

### 1. Provisioning Nowego Tenanta
```
Portal UI → Provisioning API → PostgreSQL → OPAL Server Event
```

### 2. OPAL Data Synchronization  
```
OPAL Server → WebSocket publish → OPAL Client → Data Provider API → OPA
```

### 3. Data Isolation
```
OPA: /acl/tenant-125/users/[...]
     /acl/tenant-200/users/[...]
     /acl/tenant-300/users/[...]
```

## Ścieżka Wywołań

### Krok 1: Wywołanie OPAL Update Event
```bash
curl -X POST http://localhost:7002/data/config \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [{
      "url": "http://data-provider-api:8110/tenants/tenant-1234567890/acl",
      "topics": ["multi_tenant_data"],
      "dst_path": "/acl/tenant-1234567890"
    }],
    "reason": "Load new tenant tenant-1234567890 data"
  }'
```

**Oczekiwana odpowiedź:** `{"status":"ok"}`

### Krok 2: Sprawdzenie logów OPAL Server
```bash
docker logs opal-server --tail 10
```

**Oczekiwane logi:**
```
fastapi_websocket_pubsub.rpc_event_me...| INFO  | Notifying other side: subscription={'topic': 'multi_tenant_data'}
fastapi_websocket_pubsub.event_broadc...| INFO  | Broadcasting incoming event: {'topic': 'multi_tenant_data'}
```

### Krok 3: Sprawdzenie przetwarzania OPAL Client
```bash
docker logs opal-client --since 5m | grep -E "(data|config|tenant|acl)" | tail -5
```

**Oczekiwane logi:**
```
opal_client.data.rpc | INFO | Received notification of event: multi_tenant_data
opal_client.data.updater | INFO | Updating policy data, reason: Load new tenant tenant-1234567890 data
opal_client.data.fetcher | INFO | Fetching data from url: http://data-provider-api:8110/tenants/tenant-1234567890/acl
opal_client.data.updater | INFO | Saving fetched data to policy-store: destination path='/acl/tenant-1234567890'
```

### Krok 4: Sprawdzenie danych w OPA
```bash
curl -s "http://localhost:8181/v1/data/acl/tenant-1234567890" | jq '.'
```

**Oczekiwana odpowiedź:**
```json
{
  "result": {
    "tenant_id": "tenant-1234567890",
    "tenant_name": "Test Company Sp. z o.o.",
    "users": {
      "admin_tenant-1234567890": {
        "email": "admin@company.com",
        "full_name": "Jan Kowalski",
        "roles": ["portal_admin"]
      }
    },
    "companies": {...},
    "roles": {...}
  }
}
```

### Krok 5: Test ewaluacji polityk
```bash
curl -X POST "http://localhost:8181/v1/data/policy_evaluation" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": {
        "id": "admin_tenant-1234567890",
        "email": "admin@company.com"
      },
      "tenant_id": "tenant-1234567890",
      "action": "manage_users",
      "resource": "portal"
    }
  }'
```

**Oczekiwana odpowiedź:** `{"result": true}` (authorized)

## Implementacja w Provisioning API

### Automatyczne OPAL Updates

```python
def notify_opal_about_tenant(tenant_id: str):
    \"\"\"Powiadamia OPAL Server o nowym/zmienionym tencie\"\"\"
    opal_event = {
        "entries": [{
            "url": f"http://data-provider-api:8110/tenants/{tenant_id}/acl",
            "topics": ["multi_tenant_data"],
            "dst_path": f"/acl/{tenant_id}"
        }],
        "reason": f"Tenant add: {tenant_id} provisioning complete"
    }
    
    response = requests.post(
        f"{OPAL_SERVER_URL}/data/config",
        json=opal_event,
        headers={"Content-Type": "application/json"}
    )
    
    return response.status_code == 200

@app.post("/provision-tenant")
async def provision_tenant(tenant: TenantProvisionRequest):
    # 1. Create tenant in database
    db_tenant = create_tenant_in_db(tenant)
    
    # 2. Notify OPAL immediately  
    if notify_opal_about_tenant(tenant.tenant_id):
        logger.info(f"OPAL notified about tenant {tenant.tenant_id}")
    else:
        logger.warning(f"Failed to notify OPAL about tenant {tenant.tenant_id}")
    
    return db_tenant
```

## Konfiguracja Environment

### OPAL Client
```bash
# Single topic configuration
OPAL_DATA_TOPICS=multi_tenant_data
OPAL_DATA_UPDATER_ENABLED=true
OPAL_SERVER_URL=http://opal-server:7002
```

### Provisioning API
```bash
# OPAL integration
OPAL_SERVER_URL=http://opal-server:7002
DATA_PROVIDER_API_URL=http://data-provider-api:8110
```

## Verification Checklist

### ✅ Kryteria Pełnego Sukcesu

1. **OPAL Server Event:** Status 200 response from `/data/config`
2. **OPAL Server Logs:** "Broadcasting incoming event" with multi_tenant_data
3. **OPAL Client Logs:** "Received notification" and "Fetching data from url"  
4. **Data Provider API:** Returns tenant data for `/tenants/{tenant_id}/acl`
5. **OPA Data:** Tenant data available under `/acl/{tenant_id}`
6. **Policy Evaluation:** Authorization decisions work for new tenant

### 🔧 Troubleshooting

| Problem | Check | Solution |
|---------|--------|----------|
| OPAL event fails | OPAL Server logs | Verify OPAL_SERVER_URL connectivity |
| No client processing | OPAL Client logs | Check OPAL_DATA_TOPICS configuration |
| Data fetch fails | Data Provider API | Verify endpoint `/tenants/{tenant_id}/acl` |
| No data in OPA | OPA v1/data endpoint | Check dst_path `/acl/{tenant_id}` |

## Zalety Rozwiązania

### 🚀 Korzyści Operacyjne
- **Dodawanie tenantów bez przestojów**
- **Synchronizacja danych w czasie rzeczywistym**  
- **Automatyczna odporność na awarie**
- **Uproszczone operacje**

### 📈 Korzyści Techniczne  
- **Single topic scalability** - unlimited tenants
- **Hierarchical data isolation** in OPA
- **Architektura sterowana zdarzeniami**
- **Niezależność od restartów kontenerów**

### 💰 Korzyści Biznesowe
- **Szybsze wdrażanie klientów**
- **Obniżone koszty operacyjne**  
- **Zwiększona niezawodność systemu**
- **Ulepszona skalowalność**

## Podsumowanie

**OPAL Dynamic Multi-Tenant** z single topic architecture umożliwia **enterprise-grade multi-tenancy** z:

1. **Real-time tenant provisioning** bez restartów
2. **Automatic data synchronization** między wszystkimi komponentami  
3. **Complete data isolation** przez hierarchiczne ścieżki OPA
4. **Unlimited scalability** dzięki single topic design
5. **Production-ready reliability** z pełnym monitoring i troubleshooting

To rozwiązanie stanowi fundament dla **high-performance authorization systems** w środowiskach enterprise z tysiącami tenantów. 