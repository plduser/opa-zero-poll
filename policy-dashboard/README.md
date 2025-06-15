# Policy Dashboard

Policy Dashboard to nowoczesna aplikacja webowa do zarządzania, walidacji i testowania policy OPA (Open Policy Agent). Składa się z frontendu React oraz backendu FastAPI z integracją OPA.

## 🏗️ Architektura

```
Frontend (React + TypeScript)     Backend (FastAPI + Python)
         ↓                                    ↓
   http://localhost:3000              http://localhost:8001
         ↓                                    ↓
    API calls ←→ CORS ←→ API endpoints ←→ OPA CLI
```

## ✨ Funkcje

### 🎯 Dashboard
- **Przegląd systemu** - statystyki policy, testów i deploymentów
- **Status policy** - aktywne, draft, wyłączone
- **Historia testów** - ostatnie wykonania i wyniki

### 📋 Zarządzanie Policy
- **Lista policy** - wszystkie policy z filtrowaniem i statusem
- **Szukanie** - szybkie wyszukiwanie po nazwie/tagach
- **Statusy** - active, draft, disabled

### ✏️ Edytor Policy
- **Edytor Rego** - składnia highlighting, walidacja w czasie rzeczywistym
- **Walidacja** - sprawdzanie składni przez OPA
- **Auto-save** - automatyczne zapisywanie zmian
- **Błędy/ostrzeżenia** - szczegółowe informacje o problemach

### 🧪 Tester Policy
- **Interaktywne testowanie** - testowanie policy z dowolnymi danymi JSON
- **Predefiniowane testy** - gotowe scenariusze testowe
- **Wyniki w czasie rzeczywistym** - instant feedback
- **Podgląd policy** - aktualny kod policy

### 📜 Historia i Audit
- **Timeline zmian** - chronologia wszystkich akcji
- **Integracja Git** - śledzenie commitów
- **Użytkownicy** - kto kiedy co zrobił
- **Szczegóły** - pełne informacje o każdej zmianie

## 🚀 Uruchomienie

### Wymagania
- **Node.js** 16+ (dla frontendu)
- **Python** 3.11+ (dla backendu)
- **OPA binary** (do walidacji i testów)
- **npm/yarn** (menedżer pakietów)

### Backend (FastAPI)

```bash
# Przejdź do katalogu backend
cd ../policy-backend

# Aktywuj środowisko wirtualne
source venv/bin/activate

# Uruchom serwer (port 8001)
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Backend będzie dostępny na: http://localhost:8001
API dokumentacja: http://localhost:8001/docs

### Frontend (React)

```bash
# Zainstaluj zależności (jeśli jeszcze nie)
npm install

# Uruchom development server (port 3000)
npm start
```

Frontend będzie dostępny na: http://localhost:3000

## 🔌 API Integration

### Endpoints
- `POST /api/v1/policy/validate` - walidacja policy Rego
- `POST /api/v1/policy/test` - testowanie policy z danymi
- `GET /api/v1/policy/health` - status OPA
- `GET /health` - status API

### Przykłady

#### Walidacja Policy
```bash
curl -X POST http://localhost:8001/api/v1/policy/validate \
  -H "Content-Type: application/json" \
  -d '{
    "policy_content": "package rbac\n\nimport future.keywords.if\n\ndefault allow := false\n\nallow if {\n    input.user.role == \"admin\"\n}",
    "policy_name": "rbac_policy"
  }'
```

#### Testowanie Policy
```bash
curl -X POST http://localhost:8001/api/v1/policy/test \
  -H "Content-Type: application/json" \
  -d '{
    "policy_content": "package rbac\n\nimport future.keywords.if\n\ndefault allow := false\n\nallow if {\n    input.user.role == \"admin\"\n}",
    "input_data": {"user": {"role": "admin"}}
  }'
```

## 🎨 Technologie

### Frontend
- **React 18** - biblioteka UI
- **TypeScript** - type safety
- **Tailwind CSS** - styling
- **Fetch API** - komunikacja z backendem

### Backend
- **FastAPI** - Python web framework
- **Pydantic** - walidacja danych
- **OPA CLI** - walidacja i wykonywanie policy
- **uvicorn** - ASGI server

## 🔧 Konfiguracja

### CORS
Backend jest skonfigurowany do akceptowania requestów z `http://localhost:3000`.

### API Base URL
Frontend jest skonfigurowany do komunikacji z `http://localhost:8001/api/v1`.

### OPA Integration
Backend używa lokalnej instalacji OPA CLI do:
- Walidacji składni policy (`opa fmt`)
- Testowania policy (`opa eval`)
- Parsowania błędów i ostrzeżeń

## 🐛 Debugging

### Sprawdź czy oba serwery działają:
```bash
# Backend health check
curl http://localhost:8001/health

# Frontend check
curl -I http://localhost:3000
```

### Sprawdź logi:
- **React**: sprawdź console w przeglądarce i terminal
- **FastAPI**: sprawdź terminal gdzie uruchomiony jest uvicorn

### Typowe problemy:
1. **CORS errors** - sprawdź czy backend działa na port 8001
2. **OPA errors** - sprawdź czy OPA jest zainstalowane (`opa version`)
3. **Port conflicts** - sprawdź czy porty 3000 i 8001 są wolne

## 📁 Struktura

```
policy-dashboard/
├── src/
│   ├── components/          # React komponenty
│   │   ├── Dashboard.tsx    # Główny dashboard
│   │   ├── PolicyList.tsx   # Lista policy
│   │   ├── PolicyEditor.tsx # Edytor z walidacją
│   │   ├── PolicyTester.tsx # Tester policy
│   │   └── AuditHistory.tsx # Historia zmian
│   ├── services/
│   │   └── api.ts          # API communication layer
│   ├── types/
│   │   └── index.ts        # TypeScript definicje
│   └── App.tsx             # Główna aplikacja
├── public/                 # Statyczne pliki
└── package.json           # Zależności npm
```

## 🎯 Następne kroki

Zaplanowane funkcje:
- [ ] Integracja z Git dla synchronizacji policy
- [ ] Zaawansowane testowanie (batch tests)
- [ ] Metryki i monitoring
- [ ] Role-based access control
- [ ] Deployment pipeline integration
