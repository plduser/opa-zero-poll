# 🧠 AI Assistant Guide - OPA Zero Poll System

**⚠️ WAŻNE: Przeczytaj ten dokument PRZED przeczytaniem README.md**

Ten dokument zawiera kluczowe informacje dla AI Assistant pracujących z systemem OPA Zero Poll - kompleksowym rozwiązaniem autoryzacji multi-tenant opartym na OPA/OPAL.

## 🎯 Kluczowe Założenia Systemu

### 1. **Innowacyjna Architektura Single Topic Multi-Tenant**
```sql
-- Portal → user_application_profiles → profile_role_mapper.py → user_roles → OPA
user99 ma profil "Księgowa KSEF" → automatycznie rola "Księgowa" w aplikacji KSEF
```

#### Model 1 (RBAC) - Tradycyjny
```sql
-- Portal → user_application_profiles → profile_role_mapper.py → user_roles → OPA
user99 ma profil "Księgowa KSEF" → automatycznie rola "Księgowa" w aplikacji KSEF
```

#### Model 2 (ReBAC) - Zespoły i relacje
```sql
-- Portal → teams + team_memberships + team_companies → OPA
user99 w zespole "KSEF Południe" → dostęp do firm: DEF S.A., GHI Sp. z o.o.
```

### 3. **Separacja Odpowiedzialności**
- **Portal/Provisioning**: Zarządzanie użytkownikami, profilami, zespołami
- **profile_role_mapper.py**: JEDNORAZOWE mapowanie profili na role
- **Data Provider API**: Dostarcza SUROWE dane źródłowe (nie agreguje!)
- **OPA Polityki**: Obliczają dostęp w locie na surowych danych

## 🔧 Kluczowe Komponenty (Porty)

| Komponent | Port | Funkcja | Kluczowa cecha |
|-----------|------|---------|----------------|
| **Next.js Portal** | 3000 | UI zarządzania | Symuluje Portal Symfonia |
| **Provisioning API** | 8010 | Zarządzanie tenantami | PostgreSQL, OPAL integration |
| **Data Provider API** | 8110 | OPAL External Data Sources | **Surowe dane ACL** |
| **OPA Standalone** | 8181 | Policy Engine | **Oblicza autoryzację** |
| **OPAL Server** | 7002 | Orkiestracja | GitHub policies + single topic |
| **OPAL Client** | 7000 | Synchronizacja | JWT fetch per tenant |
| **PostgreSQL** | 5432 | Baza danych | Model 1 + Model 2 |
| **Redis** | 6380 | PubSub | OPAL broadcast channel |

## 📊 Przykłady Testowych Danych

### Anna Nowak (user99) w tenant125
**Model 1 (RBAC):**
- Profil: "Księgowa KSEF" → Rola: "Księgowa" w aplikacji KSEF
- Uprawnienia: `canViewPurchaseInvoices`, `canCreatePurchaseInvoices`, etc.

**Model 2 (ReBAC):**
- Zespół: "KSEF Południe" (role: member)
- Dostęp do firm: DEF S.A. (company2), GHI Sp. z o.o. (company7)

**Testy autoryzacji:**
```bash
# Test globalny (bez company_id)
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -d '{"input": {"user": "user99", "tenant": "tenant125", "action": "view_invoices_purchase"}}' 
# Wynik: true ✅

# Test z dostępem do firmy
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -d '{"input": {"user": "user99", "tenant": "tenant125", "action": "view_invoices_purchase", "company_id": "company2"}}' 
# Wynik: true ✅ (ma dostęp przez zespół)

# Test bez dostępu do firmy
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -d '{"input": {"user": "user99", "tenant": "tenant125", "action": "view_invoices_purchase", "company_id": "company1"}}' 
# Wynik: false ❌ (brak dostępu)
```

## 🚀 Kluczowe Operacje

### 1. **Synchronizacja Danych (OPAL)**
```bash
# Synchronizacja tenant125 do OPA
curl -X POST http://localhost:7002/data/config \
  -d '{
    "entries": [{
      "url": "http://data-provider-api:8110/tenants/tenant125/acl",
      "topics": ["multi_tenant_data"],
      "dst_path": "/acl/tenant125"
    }]
  }'

# Sprawdzenie czy dane są w OPA
curl -s "http://localhost:8181/v1/data/acl/tenant125" | jq '.result.data | keys'
# Oczekiwane: ["applications", "users", "roles", "permissions", "role_permissions", "companies", "teams", "team_memberships", "team_companies", "user_companies"]
```

### 2. **Restartowanie po zmianach w kodzie**
```bash
# Po zmianach w Data Provider API (pliki .py)
docker cp new-architecture/components/data-provider-api/app.py data-provider-api:/app/app.py
docker restart data-provider-api

# Po zmianach w politykach OPA (.rego)
git add . && git commit -m "update policies" && git push
# OPAL Server wykryje zmiany automatycznie w ciągu 30s
```

### 3. **Diagnostyka**
```bash
# Status wszystkich kontenerów
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logi komponentów
docker logs data-provider-api --tail 20
docker logs opal-server --tail 20  
docker logs opal-client --tail 20

# Test endpointów
curl http://localhost:8110/health                    # Data Provider
curl http://localhost:8010/health                    # Provisioning  
curl http://localhost:8181/health                    # OPA
curl http://localhost:7002/healthcheck               # OPAL Server
```

## 🔍 Zrozumienie Struktur Danych

### ACL Endpoint Response (/tenants/{tenant_id}/acl)
```json
{
  "data": {
    "applications": {},      // RBAC: aplikacje (KSEF, eBiuro, FK)
    "roles": {},            // RBAC: role w aplikacjach  
    "permissions": {},      // RBAC: uprawnienia (canViewPurchaseInvoices)
    "role_permissions": [], // RBAC: mapowanie role→uprawnienia
    "users": {},           // PRZYPISANIA: użytkownicy z rolami
    "companies": {},       // Firmy w tenant
    "teams": {},           // ReBAC: zespoły
    "team_memberships": [], // ReBAC: członkostwa w zespołach
    "team_companies": [],   // ReBAC: zespół→firma relacje  
    "user_companies": []    // Bezpośredni dostęp user→firma
  }
}
```

### Polityka KSEF (nowa zoptymalizowana wersja)
- **Statyczne dane** (role, uprawnienia, mapowania) **wbudowane w politykę**
- **Dynamiczne dane** (przypisania użytkowników) **z ACL endpoint**
- **Redukcja rozmiaru** ACL o ~80% (z 49KB do ~10KB na tenant)
- **Dual model support**: RBAC + ReBAC jednocześnie

## ⚠️ Częste Problemy i Rozwiązania

### 1. **"column does not exist" w PostgreSQL**
- Sprawdź `new-architecture/database/enhanced_seed_complete.sql`
- Popularne problemy: `is_active` → `status`, `created_by` w teams, `role` → `role_in_team`

### 2. **Polityki nie aktualizują się**
- Sprawdź logi OPAL Server: `docker logs opal-server --tail 20`
- OPAL Server sprawdza GitHub co 30 sekund
- Po push do git, zmiany powinny się załadować automatycznie

### 3. **Brak danych w OPA po synchronizacji**
- Sprawdź endpoint ACL: `curl http://localhost:8110/tenants/tenant125/acl`
- Sprawdź logi OPAL Client: `docker logs opal-client --tail 20`
- Sprawdź czy dane są w OPA: `curl http://localhost:8181/v1/data/acl`

### 4. **False w autoryzacji mimo uprawnień**
- Sprawdź strukturę danych: `curl http://localhost:8181/v1/data/acl/tenant125/data/users/user99`
- Sprawdź diagnostykę polityki: `curl -X POST http://localhost:8181/v1/data/ksef/user_effective_permissions`
- Sprawdź mapowanie akcji: polityka ma `action_to_permission` mapping

## 📋 Checklist dla Nowych Zadań

### Przed rozpoczęciem pracy:
- [ ] Sprawdź status kontenerów: `docker ps`
- [ ] Sprawdź dane w OPA: `curl http://localhost:8181/v1/data/acl`
- [ ] Jeśli brak danych, wykonaj synchronizację OPAL
- [ ] Sprawdź ostatnie logi komponentów

### Przy wprowadzaniu zmian:
- [ ] **Kod Python**: Kopiuj pliki do kontenera + restart
- [ ] **Polityki OPA**: Commit → push → czekaj 30s na auto-reload  
- [ ] **Schema/SQL**: Zwykle wymaga pełnego restartu: `docker-compose down && docker-compose up`

### Po zmianach:
- [ ] Przetestuj podstawowe endpointy
- [ ] Sprawdź logi pod kątem błędów
- [ ] Wykonaj test autoryzacji na znanych danych
- [ ] Zweryfikuj synchronizację OPAL

## 🎯 Szybkie Testy Funkcjonalności

```bash
# 1. Quick Health Check
curl http://localhost:8110/tenants | jq 'keys'

# 2. Test autoryzacji Anna Nowak
curl -X POST http://localhost:8181/v1/data/ksef/allow \
  -d '{"input": {"user": "user99", "tenant": "tenant125", "action": "view_invoices_purchase"}}'

# 3. Sprawdź role użytkownika  
curl -X POST http://localhost:8181/v1/data/ksef/user_ksef_roles \
  -d '{"input": {"user": "user99", "tenant": "tenant125"}}'

# 4. Sprawdź uprawnienia użytkownika
curl -X POST http://localhost:8181/v1/data/ksef/user_effective_permissions \
  -d '{"input": {"user": "user99", "tenant": "tenant125"}}'
```

## 💡 Kluczowe Zasady do Zapamiętania

1. **ACL zawiera SUROWE dane źródłowe**, nie zagregowane
2. **OPA polityki obliczają dostęp w locie** na surowych danych  
3. **Profile są mapowane na role JEDNORAZOWO** przez profile_role_mapper.py
4. **Endpoint ACL TYLKO CZYTA** już zmapowane dane z user_roles
5. **Single topic multi-tenant** = jeden topic dla wszystkich tenantów
6. **Hierarchiczna izolacja** = `/acl/{tenant_id}` separuje dane
7. **Dual model** = RBAC + ReBAC działają jednocześnie
8. **Statyczne dane w politykach** = optymalizacja wydajności

---

**Po przeczytaniu tego przewodnika, przeczytaj [README.md](../README.md) dla pełnej dokumentacji architektonicznej.** 