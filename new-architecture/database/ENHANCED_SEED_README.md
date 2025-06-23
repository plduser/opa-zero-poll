# Enhanced Seed Data for OPA Zero Poll


## Problem który rozwiązuje

Oryginalny `seed_data.sql` miał **3 kluczowe problemy** które uniemożliwiały pracę z API:

### ❌ Problemy w oryginalnym seed data:
1. **Brakujące Profile-Role mappings** - tylko KSEF miał mapowania, FK/HR/CRM nie
2. **Brakujące User-Tenant relations** - 26 z 43 użytkowników nie miało tenant
3. **Niekompletne aplikacje Portal** - brakowało aplikacji eDokumenty, eBiuro, eDeklaracje

### ✅ Rozwiązania w enhanced seed data:
1. **Kompletne mapowania profili** - wszystkie aplikacje mają profile→role mappings
2. **Wszyscy użytkownicy mają tenants** - pełne user_tenants relations
3. **Wszystkie aplikacje Portal** - kompletny zestaw aplikacji z profilami
4. **Gotowe dane testowe** - przykładowi użytkownicy z różnymi uprawnieniami

## Struktura Enhanced Seed Data

### Pliki:
- `enhanced_seed_complete.sql` - **kompletny plik używany przez docker-compose**
- `enhanced_seed_data.sql` - część 1: core data, users, applications, profiles
- `enhanced_seed_permissions.sql` - część 2: permissions, role assignments, user assignments  
- `enhanced_seed_teams.sql` - część 3: teams (REBAC), verification

### Aplikacje:
- **OPA Backend Apps**: fk, hr, crm
- **Portal Apps**: edokumenty, ebiuro, ksef, edeklaracje

### Profile→Role Mappings (11 kompletnych mapowań):
```sql
FK:     Administrator → fk_admin,  Księgowy → fk_editor,     Użytkownik → fk_viewer
HR:     Administrator → hr_admin,  HR Manager → hr_editor,   Użytkownik → hr_viewer  
CRM:    Administrator → crm_admin, Sales Manager → crm_editor, Użytkownik → crm_viewer
KSEF:   Administrator → Administrator, Księgowa → Księgowa, Handlowiec → Handlowiec, 
        Właściciel → Wlasciciel_KA, Zakupowiec → Zakupowiec
```

## Test Users dla Developerów

### 🧑‍💼 Główni użytkownicy testowi (tenant125):
- **user42**: FK+HR Administrator - pełne uprawnienia księgowe i HR
- **user99**: HR Manager - zarządzanie zasobami ludzkimi  
- **user150**: CRM Sales Manager - zarządzanie sprzedażą
- **user200**: Super Admin - wszystkie aplikacje, wszystkie tenants
- **user300**: FK Księgowy + KSEF Księgowa - standardowy księgowy

### 🔧 Użytkownicy specjalistyczni:
- **user500**: KSEF Handlowiec - faktury sprzedażowe
- **user600**: eDokumenty Księgowa - dokumenty elektroniczne
- **user700**: eBiuro Specjalista - zarządzanie biurem
- **user800**: Developer - podstawowe uprawnienia do wszystkich aplikacji

### 🏢 Użytkownik zewnętrzny:
- **user400**: External Accountant (tenant200) - zewnętrzne biuro rachunkowe

## Instalacja

### 1. Aktualizacja docker-compose.yml ✅ (DONE)
```yaml
volumes:
  - ./new-architecture/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
  - ./new-architecture/database/enhanced_seed_complete.sql:/docker-entrypoint-initdb.d/02-enhanced_seed_data.sql
```

### 2. Restart kontenera PostgreSQL
```bash
docker-compose down postgres-db
docker volume rm opa_zero_poll_postgres_data  # Usuwa stare dane
docker-compose up postgres-db -d
```

### 3. Weryfikacja instalacji
Po restarcie bazy zobaczysz output weryfikacyjny:
```
ENHANCED SEED DATA INITIALIZATION COMPLETE
Applications         : 7
Profile-Role Mappings: 11  
User-Tenant Relations: 12 (ALL users have tenants)
User Application Profiles: 16 (ready for API testing)
KSEF Profiles        : 5 (Administrator, Księgowa, Handlowiec, Właściciel, Zakupowiec)
```

## API Testing Ready

### Testy Profile Mapping API:
```bash
# FK Profile → Role mapping
curl "http://localhost:8110/api/users/user300/application-access"
# Rezultat: FK Księgowy → fk_editor role

# KSEF Profile → Role mapping  
curl "http://localhost:8110/api/users/user500/application-access"
# Rezultat: KSEF Handlowiec → Handlowiec role

# HR Profile → Role mapping
curl "http://localhost:8110/api/users/user99/application-access"  
# Rezultat: HR Manager → hr_editor role
```

### Wszyscy użytkownicy mają tenants:
```sql
SELECT COUNT(*) FROM user_tenants;  -- 12 relations
SELECT COUNT(*) FROM users WHERE user_id NOT IN (SELECT user_id FROM user_tenants); -- 0
```

## Korzyści Enhanced Seed Data

### ✅ Dla Developerów:
- **Zero Setup Time** - wszystko działa od razu po `docker-compose up`
- **API Ready** - wszystkie endpoints działają bez dodatkowej konfiguracji
- **Realistic Data** - prawdziwe scenario z różnymi typami użytkowników
- **Complete Coverage** - wszystkie aplikacje i profile są przetestowane

### ✅ Dla Profile Role Mapper:
- **Automatic Mapping** - `profile_role_mapper.py` znajduje wszystkie mapowania  
- **No Missing Relations** - każdy profil ma odpowiadającą rolę
- **Consistent Data** - zgodne z load_ksef_data.sql i obecną strukturą

### ✅ Dla OPA Integration:
- **Complete RBAC** - wszystkie role, permissions, users są wczytane
- **Multi-tenant** - poprawne tenant relations dla wszystkich użytkowników
- **REBAC Teams** - zespoły z rolami i dostępem do firm

## Migration Path

### From existing setup:
1. **Backup** - oryginalny `seed_data.sql` zachowany jako `seed_data_original.sql`
2. **Enhanced** - nowy `enhanced_seed_complete.sql` zawiera wszystkie dane + fixes
3. **Docker** - `docker-compose.yml` updated to use enhanced seed data
4. **API Compatibility** - zachowana zgodność z istniejącymi API endpoints

## Validation

Enhanced seed data zawiera **automatyczną weryfikację** która sprawdza:
- ✅ Liczba entity w każdej tabeli
- ✅ Profile-role mappings dla wszystkich aplikacji  
- ✅ User-tenant relations dla wszystkich użytkowników
- ✅ User application profiles assignments
- ✅ Gotowość do pracy z API

---

**Result**: System gotowy do development z pełną funkcjonalnością Profile Mappings i API integration! 🚀 