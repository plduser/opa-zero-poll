# Policy Management - Dokumentacja Aplikacji

**Policy Management** to nowoczesna aplikacja w ekosystemie Symfonia Portal, umożliwiająca zarządzanie politykami bezpieczeństwa Open Policy Agent (OPA) przez intuicyjny interfejs graficzny.

---

## 🎯 Przegląd funkcjonalności

### ✅ **Dostępne funkcjonalności**

#### 📊 **Monitorowanie statusu policy na dashboardzie**
- **Lokalizacja**: Zakładka "Pulpit" w menu bocznym (domyślna)
- **Karty statystyk**:
  - **Łączna liczba policy** - całkowita liczba policy w systemie
  - **Aktywne policy** - policy ze statusem "active"
  - **Testy zaliczone** - policy z testsStatus "passed"
- **Sekcja "Ostatnie policy"**: Podgląd najnowszych policy z podstawowymi informacjami

#### 👁️ **Przeglądanie policy przez interfejs**
- **Lokalizacja**: Zakładka "Policy" w menu bocznym
- **Funkcjonalności**:
  - ✅ **Przeglądanie**: Tabela ze wszystkimi policy i ich szczegółami
  - ✅ **Statusy**: Wyświetlanie statusu policy (aktywna/szkic/nieaktywna)
  - ✅ **Historia testów**: Podgląd wyników testów (zaliczone/niezaliczone/oczekujące)
- **Uwaga**: Policy są zarządzane przez system kontroli wersji (Git/GitHub)

#### 🔍 **Wyszukiwanie i filtrowanie policy**
- **Lokalizacja**: Pole wyszukiwania nad tabelą policy
- **Funkcjonalność**: 
  - Filtrowanie w czasie rzeczywistym
  - Wyszukiwanie po nazwie policy
  - Wyszukiwanie po opisie policy
  - Aktualizacja licznika wyników

#### 🧪 **Testowanie policy z różnymi danymi wejściowymi**
- **Lokalizacja**: Przycisk "Testuj policy" w tabeli → Modal testowania
- **Funkcjonalności**:
  - **Automatyczne dane testowe**: Generator przykładowych danych JSON na podstawie typu policy
  - **Edytor JSON**: Możliwość edycji danych testowych
  - **Formatowanie**: Przycisk "Formatuj JSON" do poprawienia czytelności
  - **Wykonanie testu**: Przycisk "Uruchom test" → połączenie z backendem
  - **Wyniki**: Sekcja z wynikami testu (DOZWOLONE/ODRZUCONE) i szczegółami

### ❌ **Funkcjonalności ukryte (zarządzanie przez Git)**

Następujące funkcjonalności zostały **celowo ukryte**, ponieważ policy powinny być zarządzane przez system kontroli wersji, a nie bezpośrednio w interfejsie webowym:

- ~~**Edycja policy**~~ → Edycja przez Git/GitHub
- ~~**Dodawanie nowych policy**~~ → Dodawanie przez Git/GitHub  
- ~~**Usuwanie policy**~~ → Usuwanie przez Git/GitHub
- ~~**Walidacja składni w interfejsie**~~ → Walidacja w pipeline CI/CD

**Powód**: W środowisku enterprise policy bezpieczeństwa muszą przechodzić przez proces code review, testy automatyczne i zatwierdzeń przed wdrożeniem. Bezpośrednia edycja w interfejsie webowym omija te krytyczne mechanizmy kontroli.

---

## 🏗️ Architektura aplikacji

### **Frontend (Next.js 15.2.4)**
```
portal-integration/
├── app/
│   ├── policy-management/
│   │   └── page.tsx                    # Główna strona aplikacji
│   └── components/
│       ├── header.tsx                  # Wspólny header portalu
│       └── app-switcher.tsx           # Przełącznik aplikacji
├── components/
│   └── policy-management/
│       ├── PolicyModal.tsx            # Modal dodawania/edycji
│       └── PolicyTestModal.tsx        # Modal testowania
└── lib/
    └── api.ts                         # API service layer
```

### **Backend (FastAPI + OPA CLI)**
```
policy-backend/
├── app/
│   ├── main.py                        # FastAPI server
│   ├── models.py                      # Modele danych
│   └── services/
│       └── opa_service.py            # Integracja z OPA CLI
└── requirements.txt                   # Zależności Python
```

### **Komunikacja**
- **Frontend → Backend**: HTTP REST API (port 8001)
- **Backend → OPA**: OPA CLI commands
- **CORS**: Skonfigurowane dla komunikacji między portami

---

## 🚀 Instalacja i uruchomienie

### **Wymagania**
- Node.js 18+ 
- Python 3.11+
- OPA CLI zainstalowane lokalnie

### **Backend (Policy Management API)**
```bash
# 1. Przejdź do katalogu backend
cd policy-backend

# 2. Utwórz wirtualne środowisko
python -m venv venv
source venv/bin/activate  # macOS/Linux
# lub venv\Scripts\activate  # Windows

# 3. Zainstaluj zależności
pip install -r requirements.txt

# 4. Uruchom serwer
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### **Frontend (Portal Symfonia)**
```bash
# 1. Przejdź do katalogu portal
cd portal-integration

# 2. Zainstaluj zależności
npm install --legacy-peer-deps

# 3. Uruchom portal
npm run dev
```

### **Dostęp do aplikacji**
- **Portal Symfonia**: http://localhost:3000
- **Policy Management**: http://localhost:3000/policy-management
- **Backend API**: http://localhost:8001

---

## 📱 Przewodnik użytkownika

### **1. Dostęp do aplikacji**
1. Otwórz portal Symfonia: http://localhost:3000
2. Kliknij ikonę siatki (AppSwitcher) w prawym górnym rogu
3. Wybierz "PM Policy Management" z listy aplikacji

### **2. Dashboard - monitoring policy**
1. Po wejściu domyślnie wyświetla się zakładka "Pulpit"
2. Przejrzyj statystyki:
   - Łączną liczbę policy
   - Liczbę aktywnych policy  
   - Liczbę policy z zaliczonymi testami
3. Sprawdź sekcję "Ostatnie policy" dla szybkiego podglądu

### **3. Przeglądanie policy**
1. Kliknij zakładkę "Policy" w menu bocznym
2. Przejrzyj tabelę ze wszystkimi policy:
   - **Nazwa i opis** policy
   - **Status** (aktywna/szkic/nieaktywna)
   - **Wersja** aktualnej policy
   - **Wyniki testów** z ikonami statusu
3. **Uwaga**: Policy są zarządzane przez system Git/GitHub, nie można ich edytować bezpośrednio w interfejsie

### **4. Wyszukiwanie policy**
1. W zakładce "Policy" użyj pola wyszukiwania
2. Wpisz fragment nazwy lub opisu policy
3. Lista zostanie automatycznie przefiltrowana
4. Licznik pokaże aktualne wyniki (np. "2 z 5 policy")

### **5. Testowanie policy**
1. W tabeli policy kliknij ikonę probówki przy wybranej policy
2. W modal testowania:
   - Sprawdź automatycznie wygenerowane dane testowe
   - Edytuj dane JSON według potrzeb
   - Użyj "Formatuj JSON" dla lepszej czytelności
   - Kliknij "Uruchom test"
3. Sprawdź wyniki w sekcji "Wynik testu"

### **6. Zarządzanie policy przez Git**
**Aby dodać, edytować lub usunąć policy**:
1. Sklonuj repozytorium policy z Git/GitHub
2. Dokonaj zmian w plikach `.rego`
3. Utwórz Pull Request z opisem zmian
4. Przejdź przez proces code review
5. Po merge zmiany automatycznie wdrożą się do systemu
6. Sprawdź wyniki w interfejsie Policy Management

---

## 🔧 Konfiguracja

### **Zmienne środowiskowe**
Utwórz plik `.env` w katalogu `policy-backend/`:
```env
# OPA CLI Configuration
OPA_BINARY_PATH=opa                    # Ścieżka do binarki OPA
OPA_TIMEOUT=30                         # Timeout dla operacji OPA

# CORS Configuration  
CORS_ORIGINS=["http://localhost:3000"] # Dozwolone origins
CORS_METHODS=["GET", "POST", "OPTIONS"] # Dozwolone metody HTTP

# Logging
LOG_LEVEL=INFO                         # Poziom logowania
```

### **Konfiguracja CORS**
Jeśli portal działa na innym porcie, zaktualizuj `CORS_ORIGINS` w pliku `policy-backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Dodaj nowy port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🧪 Testowanie

### **1. Health Check**
```bash
# Backend API
curl http://localhost:8001/health
# Oczekiwany wynik: {"status": "healthy", "opa_available": true}

# Portal Symfonia  
curl http://localhost:3000
# Oczekiwany wynik: HTML strona portalu
```

### **2. API Endpoints**
```bash
# Test walidacji policy
curl -X POST http://localhost:8001/validate \
  -H "Content-Type: application/json" \
  -d '{"policy": "package test\ndefault allow = true"}'

# Test wykonania policy
curl -X POST http://localhost:8001/test \
  -H "Content-Type: application/json" \
  -d '{"policy": "package test\ndefault allow = true", "input": {}}'
```

### **3. Test interfejsu**
1. Otwórz http://localhost:3000/policy-management
2. Sprawdź czy wyświetla się dashboard
3. Przejdź do zakładki "Policy"
4. Przetestuj dodawanie, edycję i usuwanie policy
5. Przetestuj wyszukiwanie
6. Przetestuj funkcję testowania policy

---

## 🔮 Roadmap rozwoju

### **Faza 1.5: Struktura bazowych uprawnień - Model 2 (priorytet krytyczny)**

#### 🏗️ **Definicja modelu uprawnień**
- **Cel**: Implementacja hybrydowego modelu uprawnień łączącego RBAC i REBAC
- **Model docelowy**: Separacja ról aplikacyjnych od dostępu do firm
- **Struktura danych**: 
  ```json
  {
    "roles": {"user42": {"fk": ["fk_admin"], "hr": ["hr_viewer"]}},
    "access": {"user42": {"tenant125": ["company1", "company2"]}},
    "teams": {"kadry": {"roles": {"hr": ["hr_editor"]}, "companies": ["company7"]}},
    "memberships": {"user99": ["kadry"]},
    "permissions": {"fk": {"fk_admin": ["view_entry", "edit_entry", "delete_entry"]}}
  }
  ```

#### 🎨 **UI dla zarządzania uprawnień**
- **Cel**: Intuicyjny interfejs w stylu Model 1, zapisujący w strukturze Model 2
- **Funkcjonalności**:
  - Panel Użytkowników z modalem przypisywania uprawnień per firma
  - Panel Zespołów z zarządzaniem rolami zespołowymi
  - Panel Firm z access matrix view
  - Admin Dashboard ze statystykami i audit logiem
  - Conflicts detection i bulk operations

### **Przyszłe funkcjonalności (roadmap)**

#### 🧪 **Sekcja "Testowanie"**
- Dedykowany interfejs do testowania wielu policy naraz
- Historia testów z możliwością powtarzania
- Zbiory testów (test suites) z możliwością zapisywania
- Automatyczne testy regresyjne

#### 👥 **Sekcja "Użytkownicy"**  
- Zarządzanie dostępem do policy per użytkownik
- Role i uprawnienia w ramach Policy Management
- Historia działań użytkowników (audit log)
- Notyfikacje o zmianach w policy

#### ⚙️ **Sekcja "Ustawienia"**
- Konfiguracja połączenia z różnymi instancjami OPA
- Parametry testów (timeout, retry)
- Eksport/import policy (backup/restore)
- Integracja z systemami CI/CD

#### 📊 **Rozszerzone raportowanie**
- Szczegółowe metryki wykorzystania policy
- Analiza pokrycia testami
- Wykrywanie nieutilizowanych policy
- Dashboard z wykresami wydajności

#### 🔗 **Integracje**
- GitHub/GitLab dla verzjonowania policy
- Slack/Teams dla notyfikacji
- Jira/Azure DevOps dla śledzenia zmian
- LDAP/AD dla autoryzacji użytkowników

### **Faza 2: Integracja z prawdziwymi danymi systemu (priorytet wysoki)**

#### 🧪 **Testowanie z danymi z systemu**
- **Cel**: Testowanie policy z prawdziwymi danymi użytkowników, ról i zasobów
- **Funkcjonalności**:
  - Automatyczne pobieranie danych użytkowników z systemu Symfonia
  - Generowanie testów na podstawie rzeczywistych ról i uprawnień
  - Testowanie policy z kontekstem konkretnych tenantów
  - Historia testów z możliwością powtarzania
  - Porównywanie wyników między wersjami policy

#### 📊 **Rozszerzone raportowanie**
- **Cel**: Szczegółowa analiza działania policy w środowisku
- **Funkcjonalności**:
  - Metryki wykorzystania policy (które policy są najczęściej używane)
  - Analiza pokrycia testami (które scenariusze nie są testowane)
  - Wykrywanie nieutilizowanych lub konfliktowych policy
  - Dashboard z wykresami wydajności i trendami

### **Faza 3: Integracja z systemem kontroli wersji (priorytet średni)**

#### 🔄 **Integracja Git/GitHub**
- **Cel**: Połączenie interfejsu z workflow Git-based policy management
- **Funkcjonalności**:
  - **Code review workflow**: Każda zmiana przechodzi przez proces przeglądu
  - **Testy automatyczne**: Walidacja policy w pipeline CI/CD przed merge
  - **Historia zmian**: Pełne śledzenie kto, kiedy i dlaczego zmienił policy
  - **Rollback mechanism**: Łatwy powrót do poprzedniej wersji przez interface
  - **Kontrola zatwierdzeń**: Konfiguracja kto może wprowadzać zmiany
  - **Synchronizacja statusów**: Real-time aktualizacje z GitHub Actions

#### 🚀 **CI/CD Pipeline Integration**
- **Webhooks**: Automatyczne powiadomienia o zmianach policy
- **Status checks**: Wyświetlanie statusu testów CI/CD w interfejsie
- **Deploy tracking**: Śledzenie wdrożeń policy w różnych środowiskach
- **Quality gates**: Automatyczne blokowanie deploy w przypadku failed testów

### **Faza 4: Zaawansowane funkcjonalności (priorytet niski)**

#### 👥 **Zarządzanie użytkownikami i uprawnieniami**
- Role i uprawnienia w ramach Policy Management
- Historia działań użytkowników (audit log)
- Notyfikacje o zmianach w policy
- LDAP/AD integration dla autoryzacji

#### ⚙️ **Konfiguracja i integracje**
- Konfiguracja połączenia z różnymi instancjami OPA
- Parametry testów (timeout, retry, environment)
- Eksport/import policy (backup/restore)
- Slack/Teams integracja dla notyfikacji
- Jira/Azure DevOps integracja dla śledzenia zmian

#### 🔗 **Multi-environment support**
- Testowanie policy w różnych środowiskach (dev/staging/prod)
- Porównywanie policy między środowiskami
- Zarządzanie konfiguracją per środowisko
- A/B testing policy

---

## 🎯 **Aktualny fokus: Testowanie z prawdziwymi danymi**

**Najbliższy cel** to implementacja **testowania policy z prawdziwymi danymi systemu** zamiast mock data. To będzie game-changer dla:

### **Korzyści biznesowe:**
- ✅ **Realistic testing**: Testowanie ze rzeczywistymi scenariuszami użytkowników
- ✅ **Early bug detection**: Wykrywanie problemów przed wdrożeniem na produkcję  
- ✅ **Compliance verification**: Sprawdzanie zgodności z politykami bezpieczeństwa
- ✅ **Impact analysis**: Analiza wpływu zmian policy na istniejących użytkowników

### **Implementacja techniczna:**
1. **API integration**: Połączenie z systemami HR/ERP/CRM dla danych użytkowników
2. **Data providers**: Stworzenie adapterów dla różnych źródeł danych
3. **Test scenarios**: Automatyczne generowanie scenariuszy testowych
4. **Results analysis**: Analiza i wizualizacja wyników testów

---

## 🛠️ Rozwiązywanie problemów

### **Problem: Błąd połączenia z serwerem walidacji**
**Objawy**: Przycisk "Waliduj" pokazuje błąd czerwony
**Rozwiązanie**:
1. Sprawdź czy backend działa: `curl http://localhost:8001/health`
2. Sprawdź logi backend: `cd policy-backend && tail -f app.log`
3. Sprawdź czy OPA CLI jest zainstalowane: `opa version`

### **Problem: Policy nie są zapisywane**
**Objawy**: Modal się zamyka ale policy nie pojawiają się na liście
**Rozwiązanie**:
1. Sprawdź logi w Developer Tools (F12) → Console
2. Sprawdź Network tab czy requests są wysyłane
3. Sprawdź czy wszystkie wymagane pola są wypełnione

### **Problem: Testowanie policy nie działa**
**Objawy**: "Błąd połączenia z serwerem testów"
**Rozwiązanie**:
1. Sprawdź konfigurację CORS w backend
2. Upewnij się że endpoint `/test` istnieje i działa
3. Sprawdź format danych JSON w modal testowania

### **Problem: AppSwitcher nie pokazuje Policy Management**
**Objawy**: Brak "PM Policy Management" na liście aplikacji
**Rozwiązanie**:
1. Sprawdź czy plik `app-switcher.tsx` zawiera Policy Management
2. Sprawdź czy portal został zrestartowany po zmianach
3. Wyczyść cache przeglądarki (Ctrl+F5)

---

## 📞 Wsparcie

Dla pytań technicznych lub problemów:
1. Sprawdź sekcję "Rozwiązywanie problemów" powyżej
2. Sprawdź logi aplikacji:
   - Backend: `policy-backend/app.log`
   - Frontend: Developer Tools → Console
3. Utwórz issue w repozytorium z opisem problemu i logami

---

## 📈 Historia zmian

### **v1.0.0** - Policy Management Portal Integration
- ✅ Integracja z portalem Symfonia
- ✅ AppSwitcher z ikoną "PM"  
- ✅ Dashboard z kartami statystyk
- ✅ Zarządzanie policy (CRUD)
- ✅ Wyszukiwanie i filtrowanie
- ✅ Walidacja składni policy
- ✅ Testowanie policy z danymi JSON
- ✅ Responsywny design z Tailwind CSS
- ✅ Integracja z FastAPI backend
- ✅ Obsługa CORS

---

*Dokumentacja dla Policy Management v1.0.0 - utworzona 2024* 