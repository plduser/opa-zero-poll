-- Ładowanie przykładowych danych dla systemu profili
-- Aplikacje, role i profile dla KSEF

-- 1. Dodaj aplikację KSEF
INSERT INTO applications (app_id, app_name, description, status) 
VALUES ('ksef', 'KSEF', 'Krajowy System e-Faktur', 'active')
ON CONFLICT (app_id) DO UPDATE SET 
    app_name = EXCLUDED.app_name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Dodaj role KSEF
INSERT INTO roles (role_id, app_id, role_name, description, is_system_role) VALUES 
    (gen_random_uuid(), 'ksef', 'Administrator KSEF', 'Pełne uprawnienia administracyjne w systemie KSEF', false),
    (gen_random_uuid(), 'ksef', 'Wystawiający faktury', 'Uprawnienia do wystawiania faktur elektronicznych', false),
    (gen_random_uuid(), 'ksef', 'Odbierający faktury', 'Uprawnienia do odbierania i przeglądania faktur', false),
    (gen_random_uuid(), 'ksef', 'Przeglądający', 'Uprawnienia tylko do odczytu faktur i raportów', false)
ON CONFLICT (app_id, role_name) DO NOTHING;

-- 3. Dodaj role dla innych aplikacji (accounting, ecm, payroll)
INSERT INTO applications (app_id, app_name, description, status) VALUES
    ('accounting', 'Księgowość', 'System księgowości', 'active'),
    ('ecm', 'ECM', 'Enterprise Content Management', 'active'),
    ('payroll', 'Kadry i Płace', 'System kadrowo-płacowy', 'active')
ON CONFLICT (app_id) DO UPDATE SET 
    app_name = EXCLUDED.app_name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- Role dla accounting
INSERT INTO roles (role_id, app_id, role_name, description, is_system_role) VALUES 
    (gen_random_uuid(), 'accounting', 'CHIEF_ACCOUNTANT', 'Główny księgowy', false),
    (gen_random_uuid(), 'accounting', 'FINANCIAL_ADMIN', 'Administrator finansowy', false),
    (gen_random_uuid(), 'accounting', 'ACCOUNTANT', 'Księgowy', false),
    (gen_random_uuid(), 'accounting', 'INVOICE_MANAGER', 'Menedżer faktur', false),
    (gen_random_uuid(), 'accounting', 'AUDITOR', 'Audytor', false),
    (gen_random_uuid(), 'accounting', 'READONLY_ACCESS', 'Dostęp tylko do odczytu', false)
ON CONFLICT (app_id, role_name) DO NOTHING;

-- Role dla ECM
INSERT INTO roles (role_id, app_id, role_name, description, is_system_role) VALUES 
    (gen_random_uuid(), 'ecm', 'ADMIN', 'Administrator ECM', false),
    (gen_random_uuid(), 'ecm', 'DOCUMENT_MANAGER', 'Menedżer dokumentów', false)
ON CONFLICT (app_id, role_name) DO NOTHING;

-- Role dla payroll
INSERT INTO roles (role_id, app_id, role_name, description, is_system_role) VALUES 
    (gen_random_uuid(), 'payroll', 'HR_ADMIN', 'Administrator HR', false),
    (gen_random_uuid(), 'payroll', 'PAYROLL_MANAGER', 'Menedżer płac', false),
    (gen_random_uuid(), 'payroll', 'HR_AUDITOR', 'Audytor HR', false),
    (gen_random_uuid(), 'payroll', 'READONLY_ACCESS', 'Dostęp tylko do odczytu', false)
ON CONFLICT (app_id, role_name) DO NOTHING;

-- 4. Utwórz profile aplikacyjne
-- Profil Administrator (dla wszystkich aplikacji)
INSERT INTO application_profiles (profile_id, app_id, profile_name, description, is_default) VALUES
    (gen_random_uuid(), 'ksef', 'Administrator', 'Profil administratora z pełnymi uprawnieniami', false),
    (gen_random_uuid(), 'accounting', 'Administrator', 'Profil administratora z pełnymi uprawnieniami', false),
    (gen_random_uuid(), 'ecm', 'Administrator', 'Profil administratora z pełnymi uprawnieniami', false),
    (gen_random_uuid(), 'payroll', 'Administrator', 'Profil administratora z pełnymi uprawnieniami', false)
ON CONFLICT (app_id, profile_name) DO NOTHING;

-- Profil Księgowy (dla ksef i accounting)
INSERT INTO application_profiles (profile_id, app_id, profile_name, description, is_default) VALUES
    (gen_random_uuid(), 'ksef', 'Księgowy', 'Profil księgowego z uprawnieniami do fakturowania i raportów', false),
    (gen_random_uuid(), 'accounting', 'Księgowy', 'Profil księgowego z uprawnieniami do fakturowania i raportów', false)
ON CONFLICT (app_id, profile_name) DO NOTHING;

-- Profil Asystent księgowego (dla ksef)
INSERT INTO application_profiles (profile_id, app_id, profile_name, description, is_default) VALUES
    (gen_random_uuid(), 'ksef', 'Asystent księgowego', 'Profil asystenta z ograniczonymi uprawnieniami', false)
ON CONFLICT (app_id, profile_name) DO NOTHING;

-- Profil Audytor (dla wszystkich aplikacji)
INSERT INTO application_profiles (profile_id, app_id, profile_name, description, is_default) VALUES
    (gen_random_uuid(), 'ksef', 'Audytor', 'Profil audytora z uprawnieniami tylko do odczytu', false),
    (gen_random_uuid(), 'accounting', 'Audytor', 'Profil audytora z uprawnieniami tylko do odczytu', false),
    (gen_random_uuid(), 'payroll', 'Audytor', 'Profil audytora z uprawnieniami tylko do odczytu', false)
ON CONFLICT (app_id, profile_name) DO NOTHING;

-- 5. Mapowanie profili na role
-- Administrator KSEF -> Administrator KSEF
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = 'ksef' AND ap.profile_name = 'Administrator'
  AND r.app_id = 'ksef' AND r.role_name = 'Administrator KSEF'
ON CONFLICT (profile_id, role_id) DO NOTHING;

-- Administrator accounting -> CHIEF_ACCOUNTANT, FINANCIAL_ADMIN
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = 'accounting' AND ap.profile_name = 'Administrator'
  AND r.app_id = 'accounting' AND r.role_name IN ('CHIEF_ACCOUNTANT', 'FINANCIAL_ADMIN')
ON CONFLICT (profile_id, role_id) DO NOTHING;

-- Administrator ECM -> ADMIN, DOCUMENT_MANAGER
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = 'ecm' AND ap.profile_name = 'Administrator'
  AND r.app_id = 'ecm' AND r.role_name IN ('ADMIN', 'DOCUMENT_MANAGER')
ON CONFLICT (profile_id, role_id) DO NOTHING;

-- Administrator payroll -> HR_ADMIN, PAYROLL_MANAGER
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = 'payroll' AND ap.profile_name = 'Administrator'
  AND r.app_id = 'payroll' AND r.role_name IN ('HR_ADMIN', 'PAYROLL_MANAGER')
ON CONFLICT (profile_id, role_id) DO NOTHING;

-- Księgowy KSEF -> Wystawiający faktury, Odbierający faktury
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = 'ksef' AND ap.profile_name = 'Księgowy'
  AND r.app_id = 'ksef' AND r.role_name IN ('Wystawiający faktury', 'Odbierający faktury')
ON CONFLICT (profile_id, role_id) DO NOTHING;

-- Księgowy accounting -> ACCOUNTANT, INVOICE_MANAGER
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = 'accounting' AND ap.profile_name = 'Księgowy'
  AND r.app_id = 'accounting' AND r.role_name IN ('ACCOUNTANT', 'INVOICE_MANAGER')
ON CONFLICT (profile_id, role_id) DO NOTHING;

-- Asystent księgowego -> Odbierający faktury, Przeglądający
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = 'ksef' AND ap.profile_name = 'Asystent księgowego'
  AND r.app_id = 'ksef' AND r.role_name IN ('Odbierający faktury', 'Przeglądający')
ON CONFLICT (profile_id, role_id) DO NOTHING;

-- Audytor -> Przeglądający (wszystkie aplikacje)
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.profile_name = 'Audytor'
  AND ((ap.app_id = 'ksef' AND r.app_id = 'ksef' AND r.role_name = 'Przeglądający')
    OR (ap.app_id = 'accounting' AND r.app_id = 'accounting' AND r.role_name IN ('AUDITOR', 'READONLY_ACCESS'))
    OR (ap.app_id = 'payroll' AND r.app_id = 'payroll' AND r.role_name IN ('HR_AUDITOR', 'READONLY_ACCESS')))
ON CONFLICT (profile_id, role_id) DO NOTHING;

-- Sprawdź wyniki
SELECT 'APLIKACJE:' as info;
SELECT app_id, app_name FROM applications ORDER BY app_id;

SELECT 'ROLE:' as info;
SELECT app_id, role_name FROM roles ORDER BY app_id, role_name;

SELECT 'PROFILE:' as info;
SELECT ap.app_id, ap.profile_name, COUNT(pr.role_id) as roles_count
FROM application_profiles ap
LEFT JOIN profile_roles pr ON ap.profile_id = pr.profile_id
GROUP BY ap.app_id, ap.profile_name
ORDER BY ap.app_id, ap.profile_name; 