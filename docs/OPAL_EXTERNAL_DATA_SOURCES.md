# OPAL External Data Sources - Implementacja Multi-Tenant

## Wprowadzenie

Podczas implementacji systemu multi-tenant z OPAL External Data Sources przeprowadziliśmy badania nad mechanizmami dynamicznej konfiguracji źródeł danych. Dokument przedstawia kluczowe ustalenia dotyczące priorytetów konfiguracji, dynamicznych aktualizacji i implementacji single topic multi-tenant.

## Kluczowe Ustalenia

### 1. Priorytety Konfiguracji Data Sources

**Pytanie badawcze:** Czy `OPAL_ALL_DATA_URL` blokuje dynamiczne data sources?

**Ustalenia:**
- `OPAL_ALL_DATA_URL` ma wyższy priorytet niż konfiguracja z pliku (`OPAL_DATA_CONFIG_SOURCES_FILE_PATH`)
- `OPAL_ALL_DATA_URL` **nie blokuje** dynamicznych data update events przez POST `/data/config`
- Dynamiczne eventy są przyjmowane i przetwarzane nawet gdy `OPAL_ALL_DATA_URL` jest ustawione
- `OPAL_DATA_CONFIG_SOURCES_FILE_PATH` jest opcjonalne - OPAL może działać bez statycznych data sources

### 2. Dynamiczne Data Update Events

**Właściwy endpoint:** `POST /data/config`

**Funkcja:** Publikowanie incremental policy data updates do OPAL clients

**Format żądania:**
```json
{
  "entries": [
    {
      "url": "http://data-provider-api:8110/tenants/tenant1/acl",
      "topics": ["multi_tenant_data"],
      "dst_path": "/acl/tenant1"
    }
  ],
  "reason": "Load tenant1 data"
}
```

**Przykład wywołania:**
```bash
curl -X POST http://localhost:7002/data/config \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [
      {
        "url": "http://data-provider-api:8110/tenants/tenant1/acl",
        "topics": ["multi_tenant_data"], 
        "dst_path": "/acl/tenant1"
      }
    ],
    "reason": "Load tenant1 data"
  }'
```

### 3. Single Topic Multi-Tenant Configuration

**OPAL Client Topics:**
```bash
OPAL_DATA_TOPICS=multi_tenant_data
```

**Mapowanie Data Provider → Topic → Paths:**
- `/tenants/tenant1/acl` → topic: `multi_tenant_data` → dst_path: `/acl/tenant1`
- `/tenants/tenant2/acl` → topic: `multi_tenant_data` → dst_path: `/acl/tenant2`  
- `/tenants/tenant3/acl` → topic: `multi_tenant_data` → dst_path: `/acl/tenant3`

## Architektura Rozwiązania

### Przepływ Danych

```
1. Provisioning API → POST /data/config → OPAL Server
2. OPAL Server → WebSocket (topic-based) → OPAL Client  
3. OPAL Client → HTTP GET → Data Provider API (fetch actual data)
4. OPAL Client → PUT /v1/data/{dst_path} → OPA
```

### Komponenty Systemu

- **OPAL Server**: Koordynator pub/sub, przyjmuje data update events
- **OPAL Client**: Subskrybuje topics, pobiera dane, aktualizuje OPA
- **Data Provider API**: Serwuje dane dla poszczególnych tenantów
- **OPA**: Przechowuje dane pod hierarchicznymi ścieżkami

## Weryfikacja Implementacji

### Logi OPAL Client (sukces):
```
INFO  | Saving fetched data to policy-store: source url='http://data-provider-api:8110/tenants/tenant1/acl', destination path='/acl/tenant1'
DEBUG | processing store transaction: {'success': True, 'actions': ['set_policy_data']}
```

### Sprawdzenie danych w OPA:
```bash
curl -s http://localhost:8181/v1/data/acl/tenant1 | jq .
```

## Rozwiązywanie Problemów

### Problem: "Failed to fetch data for entry"

**Przyczyna:** Niepoprawny URL w data update event

**Rozwiązanie:** Sprawdź czy endpoint istnieje:
```bash
curl -s http://localhost:8110/tenants/tenant1/acl
```

### Problem: OPAL Client nie otrzymuje eventów

**Przyczyna:** Brak subskrypcji na właściwy topic

**Rozwiązanie:** Sprawdź `OPAL_DATA_TOPICS`:
```bash
docker exec opal-client env | grep OPAL_DATA_TOPICS
```

### Problem: Dane nie są zapisywane w OPA

**Przyczyna:** Błędny `dst_path` lub problem z OPA

**Rozwiązanie:** Sprawdź logi OPAL Client i status transakcji

## Najlepsze Praktyki

### 1. Konfiguracja Runtime
- Wszystkie data sources mogą być dostarczane dynamicznie w runtime
- Nie jest wymagane ustawianie `OPAL_DATA_CONFIG_SOURCES_FILE_PATH`
- OPAL Server działa poprawnie bez statycznych źródeł

### 2. Topic Management
- Używaj konsystentnych nazw topics dla łatwiejszego debugowania
- OPAL Client musi być subskrybowany na właściwe topics
- Jeden topic może obsługiwać wiele data sources (single topic multi-tenant)

### 3. Error Handling
- Monitoruj logi OPAL Client dla błędów fetch
- Sprawdzaj dostępność endpoints przed wysłaniem events
- Używaj `reason` field dla ułatwienia debugowania

## Procedury Testowania

### Sprawdzenie Konfiguracji
```bash
# OPAL Server data config
curl -s http://localhost:7002/data/config | jq .

# OPAL Client topics  
docker exec opal-client env | grep OPAL_DATA_TOPICS

# Data Provider endpoints
curl -s http://localhost:8110/tenants/tenant1/acl | jq .
```

### Wysłanie Test Event
```bash
curl -X POST http://localhost:7002/data/config \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [
      {
        "url": "http://data-provider-api:8110/tenants/tenant1/acl",
        "topics": ["multi_tenant_data"],
        "dst_path": "/acl/tenant1"
      }
    ],
    "reason": "Test tenant1 data load"
  }'
```

### Weryfikacja Rezultatu
```bash
# Sprawdź logi
docker logs opal-client --tail 10

# Sprawdź dane w OPA
curl -s http://localhost:8181/v1/data/acl/tenant1 | jq .
```

## Wnioski

Implementacja OPAL External Data Sources z konfiguracją multi-tenant wykazała:

1. **Funkcjonalność dynamicznych data sources** - system poprawnie obsługuje runtime configuration
2. **Skuteczność topic-based routing** - umożliwia precyzyjne targetowanie klientów
3. **Izolację danych tenantów** - hierarchiczne ścieżki w OPA zapewniają separację
4. **Znaczenie monitoringu** - logi są kluczowe dla debugowania
5. **Elastyczność konfiguracji** - runtime configuration działa bez statycznych plików

## Następne Kroki

Po zakończeniu implementacji zalecane jest:

1. Zaimplementowanie automatycznych data updates w aplikacji
2. Dodanie error handling dla failed data fetches
3. Stworzenie monitoringu dla topic subscriptions
4. Przetestowanie scenariuszy failover
5. Dokumentacja API endpoints dla data providers

---

*Dokumentacja research utworzona na podstawie sesji testowej Task 36 - OPAL External Data Sources*  
*Autor: AI Assistant | Data: 2025-01-14* 