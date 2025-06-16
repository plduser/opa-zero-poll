-- Role KSEF z tabeli uprawnień

-- 1. Dodaj aplikację KSEF
INSERT INTO applications (app_id, app_name, description, status) 
VALUES ('ksef', 'KSEF', 'Krajowy System e-Faktur', 'active')
ON CONFLICT (app_id) DO UPDATE SET 
    app_name = EXCLUDED.app_name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Dodaj role KSEF (według tabeli)
INSERT INTO roles (role_id, app_id, role_name, description, is_system_role) VALUES 
    (gen_random_uuid(), 'ksef', 'Ksiegowa', 'Pełne uprawnienia księgowe w KSEF', false),
    (gen_random_uuid(), 'ksef', 'Handlowiec', 'Uprawnienia handlowe w KSEF', false),
    (gen_random_uuid(), 'ksef', 'Zakupowiec', 'Uprawnienia zakupowe w KSEF', false),
    (gen_random_uuid(), 'ksef', 'Administrator', 'Pełne uprawnienia administracyjne w KSEF', false),
    (gen_random_uuid(), 'ksef', 'Wlasciciel_KA', 'Pełne uprawnienia właściciela - księgowe i administracyjne', false)
ON CONFLICT (app_id, role_name) DO NOTHING;

-- 3. Dodaj uprawnienia KSEF (według kolumn z tabeli, bez polskich znaków)
INSERT INTO permissions (permission_id, app_id, permission_name, description, resource_type, action) VALUES
    (gen_random_uuid(), 'ksef', 'zarzadzanie_uzytkownikami', 'Zarządzanie użytkownikami KSeF', 'users', 'manage'),
    (gen_random_uuid(), 'ksef', 'zmiana_ustawien_kontrahentow', 'Zmiana ustawień kontrahentów KSeF', 'contractors', 'update'),
    (gen_random_uuid(), 'ksef', 'zarzadzanie_kontrahentami', 'Zarządzanie kontrahentami KSeF', 'contractors', 'manage'),
    (gen_random_uuid(), 'ksef', 'zmiana_notyfikacji', 'Zmiana notyfikacji KSeF', 'notifications', 'update'),
    (gen_random_uuid(), 'ksef', 'dostep_do_danych_pelny', 'Dostęp do danych konta (pełny)', 'account_data', 'read_full'),
    (gen_random_uuid(), 'ksef', 'dane_konta_widok_uproszczony', 'Dane konta (widok uproszczony)', 'account_data', 'read_simple'),
    (gen_random_uuid(), 'ksef', 'widocznosc_webview', 'Widoczność WebView', 'webview', 'read'),
    (gen_random_uuid(), 'ksef', 'faktury_zakupowe', 'Faktury zakupowe', 'invoices_purchase', 'access'),
    (gen_random_uuid(), 'ksef', 'faktury_zakupowe_przegladanie', 'Faktury zakupowe (przeglądanie)', 'invoices_purchase', 'read'),
    (gen_random_uuid(), 'ksef', 'faktury_kosztowe', 'Faktury kosztowe', 'invoices_cost', 'access'),
    (gen_random_uuid(), 'ksef', 'pobieranie_faktur_do_hrm', 'Pobieranie faktur do HRM', 'invoices', 'download_hrm'),
    (gen_random_uuid(), 'ksef', 'pobieranie_faktur_przez_webview', 'Pobieranie faktur (przez WebView)', 'invoices', 'download_webview'),
    (gen_random_uuid(), 'ksef', 'operacje_na_dokumentach_h_upo', 'Operacje na dokumentach h (UPO)', 'documents_h', 'manage'),
    (gen_random_uuid(), 'ksef', 'operacje_na_dokumentach_na_bialej_liscie', 'Operacje na dokumentach na białej liście', 'documents_whitelist', 'manage'),
    (gen_random_uuid(), 'ksef', 'faktury_sprzedazowe_pobieranie_upo', 'Faktury sprzedażowe (Pobieranie UPO)', 'invoices_sales', 'download_upo'),
    (gen_random_uuid(), 'ksef', 'faktury_sprzedazowe_przegladanie', 'Faktury sprzedażowe (przeglądanie)', 'invoices_sales', 'read'),
    (gen_random_uuid(), 'ksef', 'wysylanie_do_symfonia', 'Wysyłanie do Symfonia', 'export', 'send_symfonia'),
    (gen_random_uuid(), 'ksef', 'zapis_do_pliku_ksef', 'Zapis do pliku KSeF (XML/PDF)', 'export', 'save_file'),
    (gen_random_uuid(), 'ksef', 'dodawanie_zalacznikow', 'Dodawanie załączników', 'attachments', 'add')
ON CONFLICT (app_id, permission_name) DO NOTHING;

-- 4. Utwórz profile aplikacyjne
INSERT INTO application_profiles (profile_id, app_id, profile_name, description, is_default) VALUES
    (gen_random_uuid(), 'ksef', 'Ksiegowa', 'Profil księgowej z pełnymi uprawnieniami księgowymi', false),
    (gen_random_uuid(), 'ksef', 'Handlowiec', 'Profil handlowca z uprawnieniami sprzedażowymi', false),
    (gen_random_uuid(), 'ksef', 'Zakupowiec', 'Profil zakupowca z uprawnieniami zakupowymi', false),
    (gen_random_uuid(), 'ksef', 'Administrator', 'Profil administratora z pełnymi uprawnieniami', false),
    (gen_random_uuid(), 'ksef', 'Wlasciciel', 'Profil właściciela z pełnymi uprawnieniami księgowymi i administracyjnymi', false)
ON CONFLICT (app_id, profile_name) DO NOTHING;

-- 5. Mapowanie ról na uprawnienia (na podstawie tabeli z X-ami)

-- Ksiegowa - ma wszystkie uprawnienia z tabeli
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.app_id = 'ksef' AND r.role_name = 'Ksiegowa'
  AND p.app_id = 'ksef' AND p.permission_name IN (
    'zmiana_ustawien_kontrahentow', 'zarzadzanie_kontrahentami', 'zmiana_notyfikacji',
    'dane_konta_widok_uproszczony', 'widocznosc_webview', 'faktury_zakupowe',
    'faktury_zakupowe_przegladanie', 'faktury_kosztowe', 'pobieranie_faktur_do_hrm',
    'pobieranie_faktur_przez_webview', 'operacje_na_dokumentach_h_upo',
    'operacje_na_dokumentach_na_bialej_liscie', 'faktury_sprzedazowe_pobieranie_upo',
    'faktury_sprzedazowe_przegladanie', 'wysylanie_do_symfonia', 'zapis_do_pliku_ksef',
    'dodawanie_zalacznikow'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Handlowiec - głównie sprzedaż
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.app_id = 'ksef' AND r.role_name = 'Handlowiec'
  AND p.app_id = 'ksef' AND p.permission_name IN (
    'dane_konta_widok_uproszczony', 'faktury_sprzedazowe_pobieranie_upo',
    'faktury_sprzedazowe_przegladanie', 'dodawanie_zalacznikow'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Zakupowiec - głównie zakupy
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.app_id = 'ksef' AND r.role_name = 'Zakupowiec'
  AND p.app_id = 'ksef' AND p.permission_name IN (
    'dane_konta_widok_uproszczony', 'widocznosc_webview', 'faktury_zakupowe',
    'pobieranie_faktur_do_hrm', 'pobieranie_faktur_przez_webview',
    'operacje_na_dokumentach_h_upo', 'operacje_na_dokumentach_na_bialej_liscie',
    'dodawanie_zalacznikow'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Administrator - pełne uprawnienia (wszystkie + zarządzanie)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.app_id = 'ksef' AND r.role_name = 'Administrator'
  AND p.app_id = 'ksef'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Wlasciciel - pełne uprawnienia (wszystkie + zarządzanie)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.app_id = 'ksef' AND r.role_name = 'Wlasciciel_KA'
  AND p.app_id = 'ksef'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 6. Mapowanie profili na role (1:1, bez polskich znaków)
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = 'ksef' AND r.app_id = 'ksef'
  AND ((ap.profile_name = 'Ksiegowa' AND r.role_name = 'Ksiegowa')
    OR (ap.profile_name = 'Handlowiec' AND r.role_name = 'Handlowiec')
    OR (ap.profile_name = 'Zakupowiec' AND r.role_name = 'Zakupowiec')
    OR (ap.profile_name = 'Administrator' AND r.role_name = 'Administrator')
    OR (ap.profile_name = 'Wlasciciel' AND r.role_name = 'Wlasciciel_KA'))
ON CONFLICT (profile_id, role_id) DO NOTHING;

-- Sprawdź wyniki
SELECT 'APLIKACJA KSEF:' as info;
SELECT app_id, app_name FROM applications WHERE app_id = 'ksef';

SELECT 'ROLE KSEF:' as info;
SELECT role_name FROM roles WHERE app_id = 'ksef' ORDER BY role_name;

SELECT 'UPRAWNIENIA KSEF (pierwsze 10):' as info;
SELECT permission_name FROM permissions WHERE app_id = 'ksef' ORDER BY permission_name LIMIT 10;

SELECT 'PROFILE KSEF:' as info;
SELECT ap.profile_name, COUNT(pr.role_id) as roles_count
FROM application_profiles ap
LEFT JOIN profile_roles pr ON ap.profile_id = pr.profile_id
WHERE ap.app_id = 'ksef'
GROUP BY ap.profile_name
ORDER BY ap.profile_name;
