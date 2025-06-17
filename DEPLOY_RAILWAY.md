# 🚀 Railway Deployment Guide - OPA Zero Poll

Przewodnik krok po krok dla deployment'u architektury OPA Zero Poll na Railway.

## 📋 Prerequisites

- Konto Railway (https://railway.app)
- GitHub repo z kodem OPA Zero Poll
- Railway CLI (opcjonalne): `npm install -g @railway/cli`

## 🎯 Deployment Plan

1. **PostgreSQL Database** → Foundation
2. **Data Provider API** → Backend services  
3. **Next.js Frontend Update** → Environment variables

---

## 🗄️ Krok 1: PostgreSQL Database

### Option A: Railway Dashboard (Recommended)

1. Idź do Railway Dashboard: https://railway.app/dashboard
2. Kliknij **"New Project"**
3. Wybierz **"Deploy PostgreSQL"**
4. **Konfiguracja**:
   ```
   Service Name: opa-postgres-db
   Database Name: opa_zero_poll
   Username: opa_user
   Password: [auto-generated]
   ```

5. **Po utworzeniu bazy**:
   - Przejdź do zakładki **"Connect"**
   - Skopiuj **"Private Network URL"** 
   - Zapisz też **DATABASE_URL** (będzie potrzebny)

### Option B: Railway CLI
```bash
railway login
railway init opa-zero-poll
railway add postgresql
```

### 🔧 Initialize Database Schema

1. W Railway Dashboard → PostgreSQL service → **"Data"** tab
2. Otwórz **Query Editor**
3. Uruchom skrypty w kolejności:
   
```sql
-- 1. Wklej zawartość new-architecture/database/schema.sql
-- 2. Uruchom (Create Tables)
-- 3. Wklej zawartość new-architecture/database/seed_data.sql  
-- 4. Uruchom (Load Sample Data)
```

**Alternatywnie** - użyj psql lokalnie:
```bash
# Pobierz DATABASE_URL z Railway Dashboard
export DATABASE_URL="postgresql://postgres:password@host:port/dbname"

# Uruchom inicjalizację
psql $DATABASE_URL -f new-architecture/database/schema.sql
psql $DATABASE_URL -f new-architecture/database/seed_data.sql
```

---

## 🔧 Krok 2: Data Provider API

### Railway Dashboard Deployment

1. W Railway Dashboard → **"New Service"**
2. Wybierz **"GitHub Repo"** 
3. Podłącz repo: `opa-zero-poll` 
4. **Root Directory**: `new-architecture/components/data-provider-api`
5. **Environment Variables**:

```env
# Basic Configuration
PORT=8110
DEBUG=false
WEBHOOK_SECRET=railway_production_secret_2025!

# Database Connection (używaj wartości z PostgreSQL service)
DB_HOST=[Private Network URL z PostgreSQL - tylko hostname]
DB_PORT=5432
DB_USER=opa_user
DB_PASSWORD=[hasło z PostgreSQL service]
DB_NAME=opa_zero_poll

# Feature Flags
DISABLE_JWT_VALIDATION=true
```

6. **Deploy** → Railway automatycznie użyje Dockerfile

### 🔗 Service Linking 

W Railway Dashboard:
1. PostgreSQL service → **"Settings"** → **"Networking"** 
2. Zanotuj **Private Network URL**: `opa-postgres-db.railway.internal:5432`
3. Data Provider API → **"Variables"** → użyj:
   ```
   DB_HOST=opa-postgres-db.railway.internal
   ```

---

## 🌐 Krok 3: Update Next.js Frontend

### Environment Variables Update

1. Istniejący Next.js service → **"Variables"**
2. Dodaj/Aktualizuj:

```env
# Data Provider API URL (użyj Public URL z service)
DATA_PROVIDER_API_URL=https://[data-provider-api-url].railway.app

# Opcjonalne - dla development debug
NODE_ENV=production
```

### 🚀 Redeploy Frontend

Railway automatycznie zredeploy'uje frontend po dodaniu zmiennych.

---

## ✅ Verification & Testing

### 1. Test Database Connection
```bash
curl https://[data-provider-api-url].railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "available",
  "timestamp": "2025-01-17T..."
}
```

### 2. Test API Endpoints
```bash
# Users
curl https://[data-provider-api-url].railway.app/api/users

# Applications
curl https://[data-provider-api-url].railway.app/api/applications

# Profiles  
curl https://[data-provider-api-url].railway.app/api/profiles
```

### 3. Test Frontend Integration
1. Otwórz: https://opa-zero-poll-production.up.railway.app/users
2. Sprawdź czy:
   - Lista użytkowników się ładuje
   - Zarządzanie dostępem działa  
   - Brak błędów w konsoli

---

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL service logs
railway logs --service opa-postgres-db

# Check Data Provider API logs  
railway logs --service data-provider-api
```

### Common Solutions
1. **Connection refused**: Sprawdź Private Network URL
2. **Authentication failed**: Sprawdź DB_PASSWORD  
3. **Database not found**: Sprawdź DB_NAME
4. **CORS errors**: Sprawdź DATA_PROVIDER_API_URL w frontend

---

## 📊 Monitoring

Railway Dashboard provides:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Health Checks**: Automated service monitoring

## 🔄 Future Steps (Optional)

Po pomyślnym deployment'u podstawowych komponentów:

4. **OPA Standalone** (authorization engine)
5. **OPAL Server/Client** (policy management)  
6. **Provisioning API** (tenant management)
7. **Redis** (caching layer)

---

Ready to deploy! 🚀 