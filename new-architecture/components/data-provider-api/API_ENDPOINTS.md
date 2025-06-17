# Data Provider API - Kompletna Lista Endpointów

## 🔍 **Reverse Engineering Results**

Poniżej znajduje się kompletna lista wszystkich endpointów odkrytych w Data Provider API przez inspekcję kodu źródłowego.

## 📂 **Struktura Endpointów**

### 🔧 **1. ENDPOINTY SYSTEMOWE**

#### `/` - Informacje o API
- **Metoda:** `GET`
- **Źródło:** `app.py`
- **Opis:** Zwraca podstawowe informacje o serwisie
- **Odpowiedź:** Informacje o wersji, opisie, integracji z bazą danych

#### `/health` - Health Check
- **Metoda:** `GET`
- **Źródło:** `app.py`
- **Opis:** Sprawdza stan zdrowia serwisu i dostępność bazy danych
- **Odpowiedź:** Status serwisu (`healthy`/`degraded`) oraz dostępność bazy

#### `/debug/user_access/{user_id}/{tenant_id}` - Debug Dostępów
- **Metoda:** `GET`
- **Źródło:** `app.py`
- **Opis:** Endpoint debugowy do sprawdzania dostępów użytkownika
- **Parametry:** `user_id`, `tenant_id`

### 🏢 **2. ENDPOINTY TENANTÓW I ACL**

#### `/tenants` - Lista Tenantów
- **Metoda:** `GET`
- **Źródło:** `app.py`
- **Opis:** Zwraca prostą listę wszystkich dostępnych tenantów
- **Odpowiedź:** Lista tenantów z podstawowymi informacjami

#### `/tenants/{tenant_id}/acl` - Dane ACL Tenanta
- **Metoda:** `GET`
- **Źródło:** `app.py`
- **Opis:** Zwraca dane ACL (Enhanced Model 1) dla określonego tenanta
- **Parametry:** `tenant_id`
- **Odpowiedź:** Kompletne dane ACL tenanta z użytkownikami i uprawnieniami

### 🔗 **3. ENDPOINTY OPAL INTEGRATION**

#### `/data/config` - OPAL External Data Sources Config
- **Metoda:** `GET`
- **Źródło:** `opal_endpoints.py`
- **Opis:** Zwraca konfigurację data sources dla OPAL Client na podstawie JWT
- **Parametry:** `token` (query) - OPAL Client JWT token
- **Uwagi:** Obsługuje OPAL External Data Sources specification

#### `/data/tenants-bootstrap` - Tenant Discovery API
- **Metoda:** `GET`
- **Źródło:** `opal_endpoints.py`
- **Opis:** Zwraca konfigurację OPAL External Data Sources dla wszystkich tenantów
- **Użycie:** Bootstrap'owanie OPAL Server z konfiguracją dla wszystkich tenantów
- **Różnica od /tenants:** Zwraca złożoną konfigurację OPAL, nie prostą listę

#### `/opal/health` - OPAL Integration Health Check
- **Metoda:** `GET`
- **Źródło:** `opal_endpoints.py`
- **Opis:** Sprawdza gotowość integracji OPAL External Data Sources

### 👥 **4. ENDPOINTY ZARZĄDZANIA UŻYTKOWNIKAMI**

#### `/api/users` - Lista/Tworzenie Użytkowników
- **Metody:** `GET`, `POST`
- **Źródło:** `users_endpoints.py`
- **GET:** Zwraca listę aktywnych użytkowników z liczbą firm
- **POST:** Tworzy nowego użytkownika (wymaga: username, email, full_name)

#### `/api/users/{user_id}` - Szczegóły/Usuwanie Użytkownika
- **Metody:** `GET`, `DELETE`
- **Źródło:** `users_endpoints.py`
- **GET:** Zwraca szczegóły użytkownika z profilami aplikacji
- **DELETE:** Usuwa użytkownika i wszystkie jego powiązania

#### `/api/users/{user_id}/roles` - Przypisywanie Ról
- **Metoda:** `POST`
- **Źródło:** `users_endpoints.py`
- **Opis:** Przypisuje profil aplikacji użytkownikowi

#### `/api/users/{user_id}/roles/{profile_id}` - Usuwanie Ról
- **Metoda:** `DELETE`
- **Źródło:** `users_endpoints.py`
- **Opis:** Usuwa profil aplikacji od użytkownika

#### `/api/users/for-portal` - Użytkownicy dla Portalu
- **Metoda:** `GET`
- **Źródło:** `users_endpoints.py`
- **Opis:** Zwraca listę użytkowników w formacie przystosowanym dla Portal Symfonia

#### `/api/applications` - Lista Aplikacji
- **Metoda:** `GET`
- **Źródło:** `users_endpoints.py`
- **Opis:** Zwraca listę wszystkich aplikacji w systemie

### 🏢 **5. ENDPOINTY ZARZĄDZANIA FIRMAMI**

#### `/api/companies` - Lista/Tworzenie Firm
- **Metody:** `GET`, `POST`
- **Źródło:** `companies_endpoints.py`
- **GET:** Lista firm z filtrowaniem po tenant_id i statusie
- **POST:** Tworzy nową firmę (wymaga: tenant_id, company_name)

#### `/api/companies/{company_id}` - Zarządzanie Firmą
- **Metody:** `GET`, `PUT`, `DELETE`
- **Źródło:** `companies_endpoints.py`
- **GET:** Szczegóły firmy z listą użytkowników
- **PUT:** Aktualizuje dane firmy
- **DELETE:** Usuwa firmę

#### `/api/companies/{company_id}/users` - Użytkownicy Firmy
- **Metoda:** `GET`
- **Źródło:** `companies_endpoints.py`
- **Opis:** Zwraca listę użytkowników z dostępem do firmy

#### `/api/companies/{company_id}/users/{user_id}` - Dostęp do Firmy
- **Metody:** `POST`, `DELETE`
- **Źródło:** `companies_endpoints.py`
- **POST:** Przydziela użytkownikowi dostęp do firmy
- **DELETE:** Odbiera użytkownikowi dostęp do firmy

### 📋 **6. ENDPOINTY ZARZĄDZANIA PROFILAMI APLIKACJI**

#### `/api/profiles` - Lista/Tworzenie Profili
- **Metody:** `GET`, `POST`
- **Źródło:** `profiles_endpoints.py`
- **GET:** Lista profili z filtrowaniem po aplikacji
- **POST:** Tworzy nowy profil aplikacji

#### `/api/profiles/{profile_id}` - Zarządzanie Profilem
- **Metody:** `GET`, `PUT`, `DELETE`
- **Źródło:** `profiles_endpoints.py`
- **GET:** Szczegóły profilu z mapowaniami ról
- **PUT:** Aktualizuje profil
- **DELETE:** Usuwa profil

#### `/api/profiles/{profile_id}/role-mappings` - Mapowania Ról
- **Metoda:** `GET`
- **Źródło:** `profiles_endpoints.py`
- **Opis:** Zwraca mapowania ról dla profilu

### 🔐 **7. ENDPOINTY DOSTĘPÓW UŻYTKOWNIKÓW**

#### `/api/users/{user_id}/application-access` - Dostępy do Aplikacji
- **Metody:** `GET`, `POST`
- **Źródło:** `user_profiles_endpoints.py`
- **GET:** Pobiera dostępy użytkownika do aplikacji (profile)
- **POST:** Przypisuje profil aplikacji użytkownikowi

#### `/api/users/{user_id}/application-access/{profile_id}` - Usuwanie Dostępu
- **Metoda:** `DELETE`
- **Źródło:** `user_profiles_endpoints.py`
- **Opis:** Usuwa profil aplikacji od użytkownika

#### `/api/users/{user_id}/companies` - Firmy Użytkownika
- **Metody:** `GET`, `POST`
- **Źródło:** `user_profiles_endpoints.py`
- **GET:** Pobiera firmy przypisane do użytkownika
- **POST:** Przypisuje firmę użytkownikowi

#### `/api/users/{user_id}/companies/{company_id}` - Usuwanie Firmy
- **Metoda:** `DELETE`
- **Źródło:** `user_profiles_endpoints.py`
- **Opis:** Usuwa firmę od użytkownika

#### `/api/users/{user_id}/sync-profiles` - Synchronizacja Profili ⚡
- **Metoda:** `POST`
- **Źródło:** `user_profiles_endpoints.py`
- **Opis:** **Synchronizuje profile użytkownika z rolami** (User Data Sync Service)
- **Uwagi:** Kluczowy endpoint dla synchronizacji danych z OPAL

## 🔄 **USER DATA SYNC SERVICE**

**Komponent obecnie zintegrowany w Data Provider API** (`user_data_sync.py`):

### Funkcje dostępne:
- `notify_user_change(tenant_id, user_id, action)` - powiadomienie o zmianie użytkownika
- `notify_role_change(tenant_id, user_id, role_changes, action)` - powiadomienie o zmianie ról
- `notify_permission_change(tenant_id, user_id, permission_changes, action)` - powiadomienie o zmianie uprawnień
- `sync_full_tenant(tenant_id)` - pełna synchronizacja tenanta

### Mechanizm działania:
- Używa **wspólnego topic** `multi_tenant_data` dla wszystkich tenantów
- Różne `data-config` dla różnych tenantów
- Komunikacja z OPAL Server przez endpoint `/data/config`
- Hierarchiczne oddzielenie tenantów przez `dst_path: /acl/{tenant_id}`

## 🗺️ **TENANT DISCOVERY API MAPPING**

Zgodnie z ustaleniami:
- **`/tenants`** - prosta lista tenantów (do ogólnego użytku)
- **`/data/tenants-bootstrap`** - konfiguracja OPAL External Data Sources dla wszystkich tenantów (do bootstrap'owania OPAL)

## 📊 **PODSUMOWANIE STATYSTYK**

- **Łącznie endpointów:** 25+
- **Kategorie funkcjonalne:** 7
- **Metody HTTP:** GET, POST, PUT, DELETE
- **Integracje:** PostgreSQL, OPAL External Data Sources
- **Komponenty:** Enhanced Model 1, User Data Sync Service, Profile Role Mapper

## 🔧 **PLIKI ŹRÓDŁOWE**

1. **`app.py`** - główna aplikacja, endpointy systemowe i ACL
2. **`opal_endpoints.py`** - integracja OPAL External Data Sources
3. **`users_endpoints.py`** - zarządzanie użytkownikami
4. **`companies_endpoints.py`** - zarządzanie firmami
5. **`profiles_endpoints.py`** - zarządzanie profilami aplikacji
6. **`user_profiles_endpoints.py`** - dostępy użytkowników
7. **`user_data_sync.py`** - synchronizacja z OPAL

---

**Status:** ✅ **KOMPLETNE** - Wszystkie endpointy wykryte i skatalogowane 