# Plan Nowej Architektury OPA Zero Poll

## 🎯 Cel
Przepisanie systemu OPA_ZERO_POLL z wykorzystaniem podejścia "małych, testowanych komponentów" w celu uniknięcia problemów z synchronizacją i połączeniami z oryginalnego rozwiązania.

## 🏗️ Podejście
1. **Każdy komponent jako osobny serwis** - własny Dockerfile, testy, dokumentacja
2. **Testowanie przed integracją** - komponenty muszą przejść testy przed połączeniem
3. **Stopniowa integracja** - dodajemy komponenty tylko gdy poprzednie działają
4. **Inspilacja z istniejącego kodu** - wykorzystujemy obecną konfigurację jako wzór

## 📦 Komponenty (w kolejności implementacji)

### Faza 1: Podstawowe API (Zadania 17-18)
- **Data Provider API** (standalone)
  - `/tenants/{tenant_id}/acl` - zwraca ACL dla tenanta
  - `/health` - endpoint zdrowia
  - Własne testy i Docker
  
- **Provisioning API** (standalone)  
  - `POST /provision-tenant` - rejestracja tenanta
  - `GET /tenants` - lista tenantów
  - `DELETE /tenants/{id}` - usuwanie tenanta
  - Baza danych (SQLite/PostgreSQL)
  - Własne testy i Docker

### Faza 2: OPA Engine (Zadanie 19)
- **OPA Standalone**
  - Podstawowe polityki RBAC w Rego
  - Testy polityk (`opa test`)
  - Endpoint decyzyjny
  - Dokumentacja polityk

### Faza 3: Prosta Integracja (Zadanie 20)
- **Integration Scripts**
  - Python skrypt łączący API z OPA
  - Pobieranie ACL → transformacja → ładowanie do OPA
  - Testy end-to-end
  - **BEZ OPAL** - prosty mechanizm

### Faza 4: Zaawansowana Integracja (po zadaniu 20)
- **OPAL Integration** (jeśli potrzebne)
  - Wprowadzenie OPAL dla zaawansowanej synchronizacji
  - Real-time updates
  - WebSocket connections
  - Webhook integration

## 🗂️ Struktura Folderów

```
new-architecture/
├── components/
│   ├── data-provider-api/
│   │   ├── Dockerfile
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   ├── tests/
│   │   └── docker-compose.yml
│   ├── provisioning-api/
│   │   ├── Dockerfile
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   ├── tests/
│   │   └── docker-compose.yml
│   ├── opa-engine/
│   │   ├── Dockerfile
│   │   ├── policies/
│   │   ├── tests/
│   │   └── docker-compose.yml
│   └── integration-scripts/
│       ├── sync_acl.py
│       ├── requirements.txt
│       └── tests/
├── tests/
│   ├── integration/
│   └── e2e/
├── scripts/
│   ├── build-all.sh
│   ├── test-all.sh
│   └── deploy.sh
└── docs/
    ├── api-specifications/
    ├── policies/
    └── deployment/
```

## ✅ Kryteria Sukcesu
- [ ] Każdy komponent przechodzi własne testy
- [ ] Integracja działa bez błędów synchronizacji
- [ ] End-to-end testy pokazują działającą autoryzację
- [ ] System można łatwo debugować i rozwijać
- [ ] Dokumentacja jest kompletna

## 🚀 Następne Kroki
1. Rozpoczęcie od **Data Provider API** (Zadanie 17)
2. Stworzenie pierwszego działającego komponentu
3. Przejście do **Provisioning API** (Zadanie 18)
4. Integracja z **OPA** (Zadanie 19) 