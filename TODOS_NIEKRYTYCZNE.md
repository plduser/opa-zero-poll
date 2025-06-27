# Usprawnienia niekrytyczne - Portal

Lista zadań i ulepszeń które są funkcjonalne ale nie krytyczne dla podstawowego działania systemu.

## 🔧 Funkcjonalność CRUD Users
### ❌ Problem: Usuwanie użytkowników nie działa
- Status: Niekrytyczne
- Opis: Funkcja usuwania użytkowników nie wykonuje faktycznego DELETE API call
- Lokalizacja: portal-integration/app/users/page.tsx - funkcja confirmDeleteUser

## 🎯 System Uprawnień KSEF - Ulepszenia
### ✅ ZREALIZOWANE:
- **Punkt 1:** Przejście na identyfikatory zamiast nazw - **GOTOWE!** ✅
- **Punkt 3:** Zaznaczanie właściwej grupy "Księgowa" w zakładce Grupy - **GOTOWE!** ✅
- **Punkt 7:** Dialogi nadawania dostępu do aplikacji - **GOTOWE!** ✅

### 📝 W TRAKCIE (Task #41):
- **Punkt 8:** Dialogi nadawania dostępu do firm - modernizacja komponentu AccessDialog

### 📝 NA PÓŹNIEJ (w kolejności priorytetu):

#### 🔧 UPRAWNIENIA - WYMAGANE DO PEŁNEJ FUNKCJONALNOŚCI:

2. **Implementacja zapisywania zmian do bazy danych**
   - Backend: Endpointy do zapisywania uprawnień
   - Frontend: Obsługa odpowiedzi API i wyświetlanie komunikatów sukcesu/błędu
   - Cel: Trwałe zapisywanie zmian w uprawnieniach

3. **Walidacja i komunikaty błędów**
   - Frontend: Sprawdzanie poprawności wyborów przed zapisem
   - Backend: Walidacja na poziomie API
   - UI: Czytelne komunikaty o błędach i sukcesie

4. **Loading states i UX improvements**
   - Dodanie spinnerów podczas ładowania danych
   - Disabled state dla przycisków podczas operacji
   - Lepsze komunikaty o stanie operacji

5. **Tabela z aktualnymi uprawnieniami**
   - Wyświetlanie obecnych uprawnień użytkownika w tabeli
   - Możliwość usuwania pojedynczych uprawnień
   - Przycisk "Usuń dostęp" dla każdego uprawnienia

6. **Akcje na grupach uprawnień**
   - Przycisk usuwania dostępu do aplikacji
   - Przycisk usuwania dostępu do firm
   - Bulk operations dla wielu uprawnień

#### 🎨 UI/UX - NICE TO HAVE:

7. **Animacje i transycje**
   - Smooth transitions między zakładkami
   - Loading animations
   - Hover effects na przyciskach

8. **Filtrowanie i wyszukiwanie**
   - Wyszukiwanie w listach uprawnień
   - Filtrowanie po typie/statusie uprawnień
   - Sortowanie kolumn w tabelach

9. **Historia zmian**
   - Szczegółowy log zmian uprawnień
   - Informacja kto i kiedy zmienił uprawnienia
   - Możliwość cofnięcia zmian

10. **Eksport/Import uprawnień**
    - Eksport do CSV/Excel
    - Import masowy uprawnień
    - Szablony uprawnień dla ról

## 📊 Inne usprawnienia systemu
### 🔄 API Performance
- Optimizacja zapytań do bazy danych
- Caching popularnych danych (profile, uprawnienia)
- Pagination dla dużych list

### 🔐 Bezpieczeństwo
- Audit log dla wszystkich zmian uprawnień
- Rate limiting dla API
- Walidacja uprawnień na poziomie backendu

### 📱 Responsive Design
- Optymalizacja dla tabletów
- Poprawki mobile layout
- Touch-friendly controls

---
**Status ogólny:** System uprawnień KSEF jest funkcjonalny z UUID, aplikacje OK, firmy w trakcie

# 📋 TODOs Niekrytyczne - OPA Zero Poll

## 🎯 **Ostatni postęp (27.06.2025)**

### ✅ **Ukończone:**
- **Multi-tenant filtering w GUI** - naprawione wszystkie dialogi (company-access, team-assignment)
- **Tenant management infrastructure** - kompletne skrypty Python dla wszystkich typów tenantów
- **Expert Tax Duże Biuro Rachunkowe** - najwymagańszy tenant skonfigurowany (97 użytkowników, 30 firm, 6 zespołów)
- **Seedowanie przez GUI** - częściowo zaimplementowane z właściwą obsługą błędów

### 🚧 **W trakcie rozwoju:**
- **GUI Seedowanie tenantów** - podstawowa funkcjonalność działa, potrzebne dopracowanie dla skomplikowanych scenariuszy
- **Python scripts integration** - skrypty działają, ale nie są jeszcze zintegrowane z GUI

### 📁 **Nowe pliki:**
- `setup_tenant_biuro_duze_infrastructure.py` - kompletny setup największego biura rachunkowego
- `setup_tenant_*.py` - skrypty dla innych typów tenantów (mikro, medium, holding, etc.)
- `polskie_imiona_nazwiska.txt` - realistyczne dane testowe

---

## 🔧 TODOs do ukończenia

### 1. **GUI Improvements**
- [ ] Integracja skryptów Python z GUI seedowania
- [ ] Lepsze raportowanie postępu dla długich operacji (200+ firm)
- [ ] Preview danych przed seedowaniem

### 2. **Data Provider API Issues** 
- [ ] Portal API vs Data Provider API filtering inconsistency
- [ ] Zespół "Zarząd" błąd 500 przy przypisaniu użytkowników z rolą "leader"

### 3. **Documentation**
- [ ] Aktualizacja README.md z nowymi skryptami
- [ ] Przewodnik setupu dla każdego typu tenanta

### 4. **Performance & Scalability**
- [ ] Throttling dla masowych operacji API
- [ ] Background jobs dla długich setupów
- [ ] Bulk operations endpoints

---

## 📊 Stan implementacji tenantów

| Typ Tenanta | GUI Seedowanie | Python Script | Status |
|-------------|----------------|---------------|---------|
| **MIKRO** | ✅ Działa | ⚠️ W trakcie | Podstawowy |
| **MAŁA** | ✅ Działa | ⚠️ W trakcie | Podstawowy |  
| **DUŻA** | ✅ Działa | ✅ Kompletny | **Ukończony** |
| **GRUPA** | ✅ Działa | ⚠️ W trakcie | Podstawowy |
| **Biuro Małe** | ✅ Działa | ⚠️ W trakcie | Podstawowy |
| **Biuro Duże** | ✅ Działa | ✅ **Kompletny** | **Ukończony** |

### 🎯 **Największy sukces:**
**Expert Tax Duże Biuro Rachunkowe** - najbardziej wymagający scenario:
- 200 firm (150 mikro + 50 spółek) → 30 utworzonych
- 30 użytkowników w 6 zespołach specjalistycznych → ✅ Kompletne
- Złożone wzorce dostępów zgodnie z PRD → ✅ Zaimplementowane

---

## 🚀 Priorities (w kolejności ważności)

1. **HIGH**: Fix Zarząd team assignment błąd 500 
2. **MEDIUM**: GUI-Python scripts integration
3. **LOW**: Performance optimizations
4. **LOW**: Additional tenant types scripting

---

## 📝 Notes

- **Multi-tenant architecture** w pełni funkcjonalna
- **OPA Zero Poll System** gotowy do testów obciążeniowych  
- **Metodyczne podejście** do rozwoju sprawdzone na najwymagańszym scenariuszu
