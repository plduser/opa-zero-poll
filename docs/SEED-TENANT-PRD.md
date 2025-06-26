# SEED TENANT PRD - Product Requirements Document
## System Zarządzania Dostępem - Testowe Tenanci

### Cel projektu
Utworzenie kompleksowego zestawu testowych tenantów, które odzwierciedlają rzeczywiste scenariusze biznesowe różnych typów organizacji - od mikro firm przez duże przedsiębiorstwa po biura rachunkowe i grupy kapitałowe. Każdy tenant ma odzwierciedlać prawdopodobne wzorce uprawnień i dostępów występujące w rzeczywistych firmach.

### Model danych bazuje na Enhanced Model 1
System wykorzystuje hierarchiczną strukturę z następującymi elementami:
- **Tenanci** - izolowane przestrzenie dla organizacji
- **Firmy** - jednostki biznesowe w ramach tenanta
- **Zespoły** - grupy funkcjonalne agregujące profile dostępu
- **Użytkownicy** - osoby z przypisanymi rolami i dostępami
- **Aplikacje** - systemy Portal Symfonia (KSEF, eDeklaracje, FK, eBiuro, eDokumenty, HR, CRM)
- **Profile** - predefiniowane zestawy uprawnień per aplikacja

### Dostępne aplikacje i profile
1. **KSEF** - Profile: Administrator, Księgowa, Handlowiec, Właściciel, Zakupowiec
2. **eDeklaracje** - Profile: Administrator, Edytor, Użytkownik
3. **Finanse i Księgowość (FK)** - Profile: Administrator, Księgowy, Użytkownik
4. **eBiuro** - Profile: Administrator, Specjalista, Użytkownik
5. **eDokumenty** - Profile: Administrator, Księgowa, Użytkownik
6. **HR** - Profile: Administrator, HR Manager, Użytkownik
7. **CRM** - Profile: Administrator, Sales Manager, Użytkownik

### Specyfikacja 6 nowych tenantów

#### 1. TENANT_MIKRO: Jednoosobowa działalność
**Tenant ID**: `tenant_mikro_dzialal`
**Nazwa**: Mikro Przedsiębiorstwo

**Konfiguracja**:
- **1 firma**: "Consulting Services Jan Kowalski"
- **1 użytkownik**: user_1 (Jan Kowalski, jan.kowalski@consulting.pl)
- **Przypisane aplikacje**: KSEF (Właściciel), eDeklaracje (Administrator), FK (Administrator)
- **Zespoły**: Brak (jednoosobowa działalność)

**Uzasadnienie biznesowe**: Reprezentuje freelancera/konsultanta który sam zarządza wszystkimi aspektami działalności.

#### 2. TENANT_MALY: Mała firma
**Tenant ID**: `tenant_mala_firma` 
**Nazwa**: Mała Firma Handlowa

**Konfiguracja**:
- **1 firma**: "TechMart Sp. z o.o."
- **10 użytkowników**:
  - user_1: Anna Nowak (Prezes) - KSEF (Administrator), eDeklaracje (Administrator), FK (Administrator), eDokumenty (Administrator), HR (Administrator), CRM (Administrator)
  - user_2: Piotr Wiśniewski (Księgowy) - KSEF (Księgowa), eDeklaracje (Edytor), FK (Księgowy)
  - user_3: Maria Kowalczyk (HR Manager) - HR (HR Manager), eDokumenty (Użytkownik)
  - user_4: Tomasz Dąbrowski (Sales Manager) - CRM (Sales Manager), eDokumenty (Użytkownik)
  - user_5: Katarzyna Lewandowska (Handlowiec) - KSEF (Handlowiec), CRM (Użytkownik)
  - user_6: Marcin Wójcik (Handlowiec) - KSEF (Handlowiec), CRM (Użytkownik) 
  - user_7: Agnieszka Kamińska (Asystent) - eDokumenty (Użytkownik), eBiuro (Użytkownik)
  - user_8: Michał Zieliński (Magazynier) - eBiuro (Użytkownik)
  - user_9: Joanna Szymańska (Recepcja) - eBiuro (Użytkownik)
  - user_10: Paweł Woźniak (Praktykant) - eBiuro (Użytkownik)
- **Zespoły**: Brak (prosta struktura)

#### 3. TENANT_DUZY: Duża firma z zespołami funkcjonalnymi
**Tenant ID**: `tenant_duza_firma`
**Nazwa**: Duże Przedsiębiorstwo

**Konfiguracja**:
- **1 firma**: "InnovateTech S.A."
- **50 użytkowników** w zespołach funkcjonalnych
- **5 Zespołów**:
  
  **Zespół Księgowość** (12 użytkowników):
  - Profile zespołu: KSEF (Księgowa), eDeklaracje (Edytor), FK (Księgowy)
  - Użytkownicy: user_1 do user_12 (różne poziomy: Administrator, Księgowy, Użytkownik)
  
  **Zespół Kadry** (8 użytkowników):
  - Profile zespołu: HR (HR Manager), eDokumenty (Księgowa)
  - Użytkownicy: user_13 do user_20
  
  **Zespół Sales & Marketing** (15 użytkowników):
  - Profile zespołu: CRM (Sales Manager), eDokumenty (Użytkownik)
  - Użytkownicy: user_21 do user_35
  
  **Zespół IT** (10 użytkowników):
  - Profile zespołu: eBiuro (Administrator), eDokumenty (Administrator)
  - Użytkownicy: user_36 do user_45
  
  **Zespół Zarząd** (5 użytkowników):
  - Profile zespołu: Wszystkie aplikacje (Administrator)
  - Użytkownicy: user_46 do user_50

#### 4. TENANT_GRUPA: Grupa kapitałowa z centrum usług wspólnych
**Tenant ID**: `tenant_grupa_kapital`
**Nazwa**: Grupa Kapitałowa

**Konfiguracja**:
- **5 firm**: 
  - "Capital Group Holdings S.A." (firma matka)
  - "Tech Solutions Sp. z o.o." 
  - "Manufacturing Plus Sp. z o.o."
  - "Logistics Express Sp. z o.o."
  - "Retail Chain Sp. z o.o."
- **60 użytkowników** w 8 zespołach
- **Zespoły**:
  
  **Zarząd - Holdings** (5 użytkowników):
  - Dostęp: Capital Group Holdings S.A.
  - Profile: eDokumenty (Administrator), FK (Administrator)
  
  **Zarząd - Tech Solutions** (3 użytkowników):
  - Dostęp: Tech Solutions Sp. z o.o.
  - Profile: eDokumenty (Administrator)
  
  **Zarząd - Manufacturing** (3 użytkowników):
  - Dostęp: Manufacturing Plus Sp. z o.o.
  - Profile: eDokumenty (Administrator)
  
  **Zarząd - Logistics** (3 użytkowników):
  - Dostęp: Logistics Express Sp. z o.o.
  - Profile: eDokumenty (Administrator)
  
  **Zarząd - Retail** (3 użytkowników):
  - Dostęp: Retail Chain Sp. z o.o.
  - Profile: eDokumenty (Administrator)
  
  **Księgowość CUW** (15 użytkowników):
  - Dostęp: Wszystkie 5 firm
  - Profile: KSEF (Księgowa), eDeklaracje (Edytor), FK (Księgowy)
  
  **IT CUW** (10 użytkowników):
  - Dostęp: Wszystkie 5 firm
  - Profile: eBiuro (Administrator), eDokumenty (Administrator)
  
  **Kadry CUW** (12 użytkowników):
  - Dostęp: Wszystkie 5 firm
  - Profile: HR (HR Manager), eDokumenty (Księgowa)
  
  **Księgowość - Matka** (6 użytkowników):
  - Dostęp: Capital Group Holdings S.A.
  - Profile: KSEF (Administrator), eDeklaracje (Administrator), FK (Administrator)

#### 5. TENANT_BIURO: Biuro rachunkowe
**Tenant ID**: `tenant_biuro_rachunk`
**Nazwa**: Biuro Rachunkowe

**Konfiguracja**:
- **40 firm klientów**: Różnorodne nazwy firm z różnych branż
- **7 użytkowników** w zespołach specjalistycznych
- **6 Zespołów**:
  
  **Zespół Zarząd** (1 użytkownik):
  - user_1: Główny Księgowy
  - Dostęp: Wszystkie 40 firm
  - Profile: Wszystkie aplikacje (Administrator)
  
  **Zespół Główni Księgowi** (1 użytkownik):
  - user_2: Senior Księgowy
  - Dostęp: Wszystkie 40 firm
  - Profile: KSEF (Administrator), eDeklaracje (Administrator), FK (Administrator), eBiuro (Administrator)
  
  **Zespół Księgowi KPIR** (2 użytkowników):
  - user_3, user_4
  - Dostęp: 15 firm (KPIR)
  - Profile: KSEF (Księgowa), eDeklaracje (Edytor), FK (Księgowy), eBiuro (Specjalista)
  
  **Zespół Księgowi Spółki** (2 użytkowników):
  - user_5, user_6
  - Dostęp: 25 firm (spółki)
  - Profile: KSEF (Księgowa), eDeklaracje (Edytor), FK (Księgowy), eBiuro (Specjalista)
  
  **Zespół HR** (1 użytkownik):
  - user_7
  - Dostęp: Wszystkie 40 firm
  - Profile: HR (HR Manager), eDokumenty (Księgowa)
  
  **Zespół Specjaliści Branżowi** (zespół dla specjalizacji branżowych):
  - Członkowie: user_3, user_4 (dodatkowo)
  - Dostęp: 10 firm specjalizacyjnych
  - Profile: Wszystkie aplikacje księgowe

#### **🏢 Tenant 6: Duże Biuro Rachunkowe**
**Typ organizacji**: Duże zewnętrzne biuro rachunkowe obsługujące mikro firmy i spółki  
**Charakterystyka**: Profesjonalna firma świadcząca kompleksowe usługi księgowo-kadrowe

**📊 Struktura:**
- **Firma główna**: "Expert Tax Duże Biuro Rachunkowe Sp. z o.o."
- **Firmy klienckie**: 200 firm (150 mikro + 50 spółek)
- **Użytkownicy**: 30 pracowników biura
- **Zespoły funkcjonalne**: 5 zespołów specjalistycznych

**👥 Zespoły i role:**

1. **Zarząd** (3 osoby)
   - **Prezes/CEO**: Dostęp administracyjny do wszystkich aplikacji
   - **Dyrektor ds. Księgowych**: Nadzór nad zespołami księgowymi
   - **Dyrektor ds. Kadrowych**: Nadzór nad zespołem HR
   - **Aplikacje**: Wszystkie (eDokumenty, KSEF, eDeklaracje, FK, eBiuro, HR)
   - **Firmy**: Dostęp do wszystkich 200 firm

2. **Główni Księgowi** (5 osób)  
   - **Senior Księgowi**: Koordinacja i kontrola jakości
   - **Aplikacje**: eDokumenty, KSEF, eDeklaracje, FK, eBiuro
   - **Firmy**: Dostęp do wszystkich 200 firm

3. **Księgowi - KPIR** (10 osób)
   - **Specjaliści ds. mikro firm**: Obsługa ryczałtu i KPIR
   - **Aplikacje**: eBiuro, eDeklaracje, KSEF
   - **Firmy**: 150 mikro firm (ryczałt, KPIR)

4. **Księgowi - Spółki** (7 osób)
   - **Specjaliści ds. spółek**: Obsługa księgowości pełnej
   - **Aplikacje**: eDokumenty, KSEF, Finanse i Księgowość, eDeklaracje
   - **Firmy**: 50 spółek (S.A., Sp. z o.o.)

5. **HR** (5 osób)
   - **Specjaliści ds. kadrowo-płacowych**: Obsługa ZUS i kadr
   - **Aplikacje**: HR (Kadry), eDeklaracje
   - **Firmy**: 30 z 50 spółek (tylko te z umową kadrową)

**🏢 Struktura firm:**
- **150 mikro firm**: "Firma XYZ", "Salon ABC", "Sklep DEF" (ryczałt/KPIR)
- **50 spółek**: "Alpha Tech S.A.", "Beta Solutions Sp. z o.o." (pełna księgowość)
- **30 spółek z HR**: Podpięte pod zespół HR dla obsługi kadrowej

**📋 Wzorce dostępów:**
- **Zarząd**: Wszystkie aplikacje + wszystkie firmy
- **Główni Księgowi**: Nadzór nad wszystkimi firmami
- **Księgowi KPIR**: Tylko mikro firmy + uproszczone aplikacje
- **Księgowi Spółki**: Tylko spółki + zaawansowane aplikacje
- **HR**: Tylko spółki z umową kadrową + aplikacje kadrowe

#### Nazewnictwo użytkowników:
- Format: `user_[numer]` dla user_id
- Imiona i nazwiska: Typowe polskie imiona i nazwiska
- Email: `imie.nazwisko@[domena-firmy].pl`

#### Nazewnictwo firm:
- **Biura rachunkowe**: "[Miasto] Tax Services Sp. z o.o.", "[Nazwisko] Biuro Rachunkowe"
- **Grupy kapitałowe**: "[Nazwa] Capital Group S.A.", "[Nazwa] Holdings S.A."
- **Firmy standardowe**: Różnorodne nazwy z różnych branż (Tech, Manufacturing, Services, itp.)

### Implementacja techniczna

#### Kolejność tworzenia:
1. **Tenant** - utworzenie przestrzeni organizacyjnej
2. **Firmy** - dodanie firm do tenanta
3. **Użytkownicy** - utworzenie kont użytkowników
4. **Zespoły** - utworzenie grup funkcjonalnych
5. **Członkostwo w zespołach** - przypisanie użytkowników do zespołów
6. **Profile aplikacji** - przypisanie dostępów do aplikacji
7. **Dostępy do firm** - przypisanie dostępów do konkretnych firm

#### Struktura zadań:
Każdy tenant będzie realizowany jako osobne zadanie z możliwością weryfikacji kompletności przed przejściem do następnego.

#### Walidacja:
Po utworzeniu każdego tenanta przeprowadzana będzie weryfikacja:
- Wszystkich użytkowników
- Wszystkich zespołów i członkostw
- Wszystkich dostępów do aplikacji
- Wszystkich dostępów do firm
- Zgodności z rzeczywistymi wzorcami biznesowymi

### Oczekiwane rezultaty
System z 8 tenantami (6 nowych + 2 obecne) reprezentującymi:
- Pełne spektrum wielkości organizacji (od 1 do 60 użytkowników)
- Różne modele biznesowe (działalność, firma, grupa, biuro, holding)
- Rzeczywiste wzorce uprawnień i dostępów
- Wszystkie typy zespołów i ról funkcjonalnych
- Kompleksowe scenariusze testowe dla systemu uprawnień

Każdy tenant służy jako realistyczny przykład konkretnego typu organizacji, umożliwiając testowanie i demonstrację systemu w różnych kontekstach biznesowych. 

## **🎯 Oczekiwane rezultaty**

Po zaimplementowaniu wszystkich 6 tenantów system będzie zawierał:
- **~370 użytkowników** w różnych rolach
- **~270 firm** różnej wielkości  
- **~35 zespołów** z różnymi wzorcami dostępów
- **Pełny zakres** scenariuszy uprawnień od mikro firm po międzynarodowe korporacje

System pozwoli na testowanie wszystkich przypadków użycia systemu uprawnień, od prostych dostępów jednoosobowych firm po złożone struktury holdingów i biur rachunkowych. 