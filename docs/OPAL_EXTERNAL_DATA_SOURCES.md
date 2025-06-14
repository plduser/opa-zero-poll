# OPAL External Data Sources - Research i Wnioski

## Podsumowanie Sesji Testowej

**Data:** 2025-01-14  
**Zadanie:** Task 36 - Implementacja OPAL External Data Sources z konfiguracją multi-tenant  
**Status:** ✅ SUKCES - Dynamiczne data sources działają poprawnie

## 🔍 Kluczowe Odkrycia Research

### 1. Priorytet Konfiguracji Data Sources

**❓ Pytanie:** Czy `OPAL_ALL_DATA_URL` blokuje dynamiczne data sources?

**✅ Odpowiedź:** 
- `OPAL_ALL_DATA_URL` **ma wyższy priorytet** niż konfiguracja z pliku (`OPAL_DATA_CONFIG_SOURCES_FILE_PATH`)
- `OPAL_ALL_DATA_URL` **NIE blokuje** dynamicznych data update events przez POST `/data/config`
- Dynamiczne eventy są **przyjmowane i przetwarzane** nawet gdy `OPAL_ALL_DATA_URL` jest ustawione
- **Kluczowe:** `OPAL_DATA_CONFIG_SOURCES_FILE_PATH` jest **opcjonalne** - OPAL może działać bez statycznych data sources

### 2. Dynamiczne Data Update Events - Właściwe API

**✅ Właściwy endpoint:** `POST /data/config`

**Funkcja:** Publikowanie incremental policy data updates do OPAL clients

**Format żądania:**
```json
{
  "entries": [
    {
      "url": "http://simple-api-provider:8090/acl/tenant1",
      "topics": ["tenant_1_data"],
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
        "url": "http://simple-api-provider:8090/acl/tenant1",
        "topics": ["tenant_1_data"], 
        "dst_path": "/acl/tenant1"
      }
    ],
    "reason": "Load tenant1 data"
  }'
```

### 3. Multi-Tenant Topic Configuration

**OPAL Client Topics:**
```bash
OPAL_DATA_TOPICS=tenant_1_data,tenant_2_data,tenant_3_data
```

**Mapowanie Data Provider → Topics → Paths:**
- `/acl/tenant1` → topic: `tenant_1_data` → dst_path: `/acl/tenant1`
- `/acl/tenant2` → topic: `tenant_2_data` → dst_path: `/acl/tenant2`  
- `/acl/tenant3` → topic: `tenant_3_data` → dst_path: `/acl/tenant3`

## 🏗️ Architektura Rozwiązania

### Przepływ Danych (Data Flow)

```
1. Data Provider → POST /data/config → OPAL Server
2. OPAL Server → WebSocket (topic-based) → OPAL Client  
3. OPAL Client → HTTP GET → Data Provider (fetch actual data)
4. OPAL Client → PUT /v1/data/{dst_path} → OPA
```

### Kluczowe Komponenty

- **OPAL Server**: Koordynator pub/sub, przyjmuje data update events
- **OPAL Client**: Subskrybuje topics, pobiera dane, aktualizuje OPA
- **Data Provider**: Serwuje dane dla poszczególnych tenantów
- **OPA**: Przechowuje dane pod hierarchicznymi ścieżkami

## ✅ Weryfikacja Sukcesu

### Logi OPAL Client (sukces):
```
INFO  | Saving fetched data to policy-store: source url='http://simple-api-provider:8090/acl/tenant1', destination path='/acl/tenant1'
DEBUG | processing store transaction: {'success': True, 'actions': ['set_policy_data']}
```

### Sprawdzenie danych w OPA:
```bash
curl -s http://localhost:8181/v1/data/acl/tenant1 | jq .
```

## 🚨 Typowe Błędy i Rozwiązania

### Problem: "Failed to fetch data for entry"

**Przyczyna:** Niepoprawny URL w data update event

**Rozwiązanie:** Sprawdź czy endpoint istnieje:
```bash
curl -s http://localhost:8090/acl/tenant1
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

## 📋 Najlepsze Praktyki

### 1. Konfiguracja Runtime
- **Wszystkie data sources mogą być dostarczane dynamicznie w runtime**
- Nie musisz ustawiać `OPAL_DATA_CONFIG_SOURCES_FILE_PATH`
- OPAL Server działa poprawnie bez statycznych źródeł

### 2. Topic Management
- Używaj konsystentnych nazw topics: `tenant_{ID}_data`
- OPAL Client musi być subskrybowany na właściwe topics
- Jeden topic może obsługiwać wiele data sources

### 3. Error Handling
- Monitoruj logi OPAL Client dla błędów fetch
- Sprawdzaj dostępność endpoints przed wysłaniem events
- Używaj `reason` field dla debugowania

## 🧪 Procedury Testowania

### Sprawdzenie Konfiguracji
```bash
# OPAL Server data config
curl -s http://localhost:7002/data/config | jq .

# OPAL Client topics  
docker exec opal-client env | grep OPAL_DATA_TOPICS

# Data Provider endpoints
curl -s http://localhost:8090/acl/tenant1 | jq .
```

### Wysłanie Test Event
```bash
curl -X POST http://localhost:7002/data/config \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [
      {
        "url": "http://simple-api-provider:8090/acl/tenant1",
        "topics": ["tenant_1_data"],
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

## 🎯 Kluczowe Wnioski

1. **✅ OPAL External Data Sources działają poprawnie** z konfiguracją multi-tenant
2. **✅ Dynamiczne data update events** są kluczowe dla real-time updates
3. **✅ Topic-based routing** umożliwia precyzyjne targetowanie klientów
4. **✅ Hierarchiczne ścieżki w OPA** pozwalają na izolację danych tenantów
5. **✅ Monitoring logów** jest niezbędny dla debugowania
6. **✅ Runtime configuration** jest w pełni funkcjonalna bez statycznych plików

## 🔄 Następne Kroki

Po udanym research i implementacji:

1. **Zaimplementuj automatyczne data updates** w aplikacji
2. **Dodaj error handling** dla failed data fetches
3. **Stwórz monitoring** dla topic subscriptions
4. **Przetestuj failover scenarios** 
5. **Dokumentuj API endpoints** dla data providers

---

*Dokumentacja research utworzona na podstawie sesji testowej Task 36 - OPAL External Data Sources*  
*Autor: AI Assistant | Data: 2025-01-14* 