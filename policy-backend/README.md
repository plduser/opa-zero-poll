# Policy Dashboard Backend

FastAPI backend dla Policy Dashboard - narzędzia do zarządzania politykami OPA.

## Funkcjonalności

- 🔍 **Walidacja polityk w czasie rzeczywistym** - kompilacja i sprawdzanie składni Rego
- 🧪 **Testowanie polityk** - wykonywanie polityk z danymi wejściowymi
- 🚀 **REST API** - RESTful endpoints dla integracji z frontendem
- 📊 **Health Check** - monitoring dostępności OPA
- 🔐 **CORS Support** - skonfigurowany dla frontendów lokalnych

## Wymagania

- Python 3.11+
- OPA CLI zainstalowane i dostępne w PATH
- pip i venv

## Instalacja

1. **Stwórz środowisko wirtualne:**
```bash
python3 -m venv venv
source venv/bin/activate
```

2. **Zainstaluj zależności:**
```bash
pip install -r requirements.txt
```

3. **Sprawdź dostępność OPA:**
```bash
opa version
```

## Uruchomienie

### Development
```bash
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Production
```bash
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Docker
```bash
docker build -t policy-dashboard-backend .
docker run -p 8001:8000 policy-dashboard-backend
```

## API Endpoints

### Health Checks
- `GET /` - Informacje o API
- `GET /health` - Status serwisu
- `GET /api/v1/policy/health` - Status OPA

### Policy Operations
- `POST /api/v1/policy/validate` - Walidacja polityki Rego
- `POST /api/v1/policy/test` - Testowanie polityki z danymi

### API Documentation
- `GET /api/v1/docs` - Swagger UI
- `GET /api/v1/redoc` - ReDoc documentation

## Użycie

### Walidacja polityki
```bash
curl -X POST http://localhost:8001/api/v1/policy/validate \
  -H "Content-Type: application/json" \
  -d '{
    "policy_content": "package test\n\nallow = true",
    "policy_name": "test"
  }'
```

### Testowanie polityki
```bash
curl -X POST http://localhost:8001/api/v1/policy/test \
  -H "Content-Type: application/json" \
  -d '{
    "policy_content": "package test\n\nallow = input.user == \"admin\"",
    "input_data": {"user": "admin"}
  }'
```

## Testowanie

```bash
source venv/bin/activate
python -m pytest tests/ -v
```

## Konfiguracja

Ustawienia można skonfigurować przez zmienne środowiskowe lub plik `.env`:

```bash
# OPA Configuration
OPA_BINARY_PATH=opa
OPA_TIMEOUT=30

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8001

# Security
SECRET_KEY=your-secret-key
DEBUG=false
```

## Struktura Projektu

```
policy-backend/
├── app/
│   ├── core/           # Konfiguracja
│   ├── models/         # Modele Pydantic
│   ├── routers/        # Endpointy FastAPI
│   ├── services/       # Logika biznesowa
│   └── main.py         # Główna aplikacja
├── tests/              # Testy
├── requirements.txt    # Zależności Python
├── Dockerfile         # Container setup
└── README.md          # Ta dokumentacja
```

## Integracja z Frontendem

Backend jest skonfigurowany dla pracy z React frontendem na porcie 3000. CORS jest skonfigurowany automatycznie.

Przykład użycia w React:
```typescript
const response = await fetch('http://localhost:8001/api/v1/policy/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    policy_content: policyCode,
    input_data: testData
  })
});
``` 