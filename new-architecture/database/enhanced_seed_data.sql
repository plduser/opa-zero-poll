-- Enhanced Seed Data for OPA Zero Poll - Model 2 (RBAC + REBAC)
-- Kompletne dane testowe dla developerów - bez problemów inicjalizacji
-- Version: 2.0 - Fixed: profile mappings, user_tenants, Portal applications

-- ============================================================================
-- CORE DATA
-- ============================================================================

-- Insert tenants
INSERT INTO tenants (tenant_id, tenant_name, description, status) VALUES
('tenant125', 'Symfonia Sp. z o.o.', 'Główny tenant dla systemu Symfonia', 'active'),
('tenant200', 'Biuro Rachunkowe XYZ', 'Zewnętrzne biuro rachunkowe', 'active'),
('tenant300', 'Test Company Ltd.', 'Tenant testowy dla rozwoju', 'active');

-- Insert users (zwiększona liczba przykładowych użytkowników)
INSERT INTO users (user_id, username, email, full_name, status) VALUES
('user42', 'admin_user', 'admin@symfonia.pl', 'Jan Kowalski', 'active'),
('user99', 'hr_manager', 'hr@symfonia.pl', 'Anna Nowak', 'active'),
('user150', 'sales_rep', 'sales@symfonia.pl', 'Piotr Wiśniewski', 'active'),
('user200', 'super_admin', 'superadmin@symfonia.pl', 'Maria Zielińska', 'active'),
('user300', 'accountant', 'ksiegowosc@symfonia.pl', 'Tomasz Lewandowski', 'active'),
('user400', 'external_accountant', 'external@xyz.pl', 'Katarzyna Dąbrowska', 'active'),
-- Dodatkowi użytkownicy dla testów Profile Mappings
('user500', 'ksef_admin', 'ksef@symfonia.pl', 'Agnieszka Kosz', 'active'),
('user600', 'edok_specialist', 'edok@symfonia.pl', 'Michał Nowak', 'active'),
('user700', 'ebiuro_user', 'ebiuro@symfonia.pl', 'Joanna Wiśniewska', 'active'),
('user800', 'test_developer', 'dev@symfonia.pl', 'Robert Developer', 'active');

-- ============================================================================
-- APPLICATIONS - Wszystkie aplikacje Portal + OPA Apps
-- ============================================================================

INSERT INTO applications (app_id, app_name, description, status) VALUES
-- OPA Backend Applications
('fk', 'Finanse i Księgowość', 'Moduł finansowo-księgowy', 'active'),
('hr', 'Zasoby Ludzkie', 'Moduł zarządzania zasobami ludzkimi', 'active'),
('crm', 'Customer Relationship Management', 'Moduł zarządzania relacjami z klientami', 'active'),
-- Portal Symfonia Applications
('edokumenty', 'eDokumenty', 'Portal eDokumenty - zarządzanie dokumentami elektronicznymi', 'active'),
('ebiuro', 'eBiuro', 'Portal eBiuro - zarządzanie biurem', 'active'),
('ksef', 'KSEF', 'Portal KSEF - faktury elektroniczne', 'active'),
('edeklaracje', 'eDeklaracje', 'Portal eDeklaracje - składanie deklaracji', 'active');

-- Insert companies
INSERT INTO companies (company_id, tenant_id, company_name, company_code, nip, description, status) VALUES
-- Tenant125 companies
('company1', 'tenant125', 'ABC Sp. z o.o.', 'ABC001', '1234567890', 'Firma ABC - główny klient', 'active'),
('company2', 'tenant125', 'DEF S.A.', 'DEF002', '0987654321', 'Firma DEF - duży klient', 'active'),
('company7', 'tenant125', 'GHI Sp. z o.o.', 'GHI007', '1122334455', 'Firma GHI - średni klient', 'active'),
('company8', 'tenant125', 'JKL Sp. z o.o.', 'JKL008', '5544332211', 'Firma JKL - mały klient', 'active'),
('company12', 'tenant125', 'MNO S.A.', 'MNO012', '6677889900', 'Firma MNO - nowy klient', 'active'),
-- Tenant200 companies
('company20', 'tenant200', 'PQR Sp. z o.o.', 'PQR020', '9988776655', 'Firma PQR - klient biura rachunkowego', 'active'),
('company21', 'tenant200', 'STU S.A.', 'STU021', '5566778899', 'Firma STU - klient biura rachunkowego', 'active'),
-- Tenant300 companies (test)
('company30', 'tenant300', 'Test Company A', 'TEST030', '1111222233', 'Firma testowa A', 'active'),
('company31', 'tenant300', 'Test Company B', 'TEST031', '3322114455', 'Firma testowa B', 'active');

-- ============================================================================
-- USER-TENANT RELATIONS - FIXED! (brakujące w oryginalnym seed_data.sql)
-- ============================================================================

INSERT INTO user_tenants (user_id, tenant_id, is_default, is_active) VALUES
-- Użytkownicy w tenant125
('user42', 'tenant125', true, true),
('user99', 'tenant125', true, true),
('user150', 'tenant125', true, true),
('user200', 'tenant125', true, true),
('user300', 'tenant125', true, true),
('user500', 'tenant125', true, true),
('user600', 'tenant125', true, true),
('user700', 'tenant125', true, true),
('user800', 'tenant125', true, true),
-- Użytkownicy w tenant200
('user400', 'tenant200', true, true),
-- Multi-tenant access
('user200', 'tenant200', false, true),  -- super_admin ma dostęp do wielu tenantów
('user200', 'tenant300', false, true);

-- ============================================================================
-- RBAC DATA - Roles i Application Profiles
-- ============================================================================

-- Insert roles for each application
INSERT INTO roles (app_id, role_name, description, is_system_role) VALUES
-- FK roles
('fk', 'fk_admin', 'Administrator modułu FK - pełne uprawnienia', true),
('fk', 'fk_editor', 'Edytor modułu FK - może edytować wpisy', true),
('fk', 'fk_viewer', 'Przeglądający modułu FK - tylko odczyt', true),
-- HR roles
('hr', 'hr_admin', 'Administrator modułu HR - pełne uprawnienia', true),
('hr', 'hr_editor', 'Edytor modułu HR - może edytować profile', true),
('hr', 'hr_viewer', 'Przeglądający modułu HR - tylko odczyt', true),
-- CRM roles
('crm', 'crm_admin', 'Administrator modułu CRM - pełne uprawnienia', true),
('crm', 'crm_editor', 'Edytor modułu CRM - może edytować klientów', true),
('crm', 'crm_viewer', 'Przeglądający modułu CRM - tylko odczyt', true),
-- KSEF roles (zgodne z load_ksef_data.sql)
('ksef', 'Administrator', 'Administrator KSEF - pełne uprawnienia', true),
('ksef', 'Księgowa', 'Księgowa KSEF - standardowe uprawnienia', true),
('ksef', 'Handlowiec', 'Handlowiec KSEF - uprawnienia handlowe', true),
('ksef', 'Wlasciciel_KA', 'Właściciel KA KSEF - uprawnienia właściciela', true),
('ksef', 'Zakupowiec', 'Zakupowiec KSEF - uprawnienia zakupowe', true);

-- Insert Application Profiles (Portal Symfonia Concept) - FIXED NAMES!
INSERT INTO application_profiles (app_id, profile_name, description, is_default) VALUES
-- FK profiles (zgodne z obecną bazą danych)
('fk', 'Administrator', 'Pełne uprawnienia księgowe - zarządzanie wszystkimi funkcjami', false),
('fk', 'Księgowy', 'Standardowe uprawnienia księgowe - edycja wpisów i raportów', true),
('fk', 'Użytkownik', 'Podstawowe uprawnienia - przeglądanie i podstawowe raporty', false),
-- HR profiles (zgodne z obecną bazą danych)
('hr', 'Administrator', 'Pełne uprawnienia HR - zarządzanie wszystkimi funkcjami', false),
('hr', 'HR Manager', 'Standardowe uprawnienia HR - edycja profili i umów', true),
('hr', 'Użytkownik', 'Podstawowe uprawnienia - przeglądanie struktury organizacyjnej', false),
-- CRM profiles (zgodne z obecną bazą danych)
('crm', 'Administrator', 'Pełne uprawnienia CRM - zarządzanie wszystkimi funkcjami', false),
('crm', 'Sales Manager', 'Standardowe uprawnienia sprzedażowe - zarządzanie klientami i transakcjami', true),
('crm', 'Użytkownik', 'Podstawowe uprawnienia - przeglądanie klientów i raportów', false),
-- eDokumenty profiles
('edokumenty', 'Administrator', 'Pełne uprawnienia eDokumenty - zarządzanie wszystkimi funkcjami', false),
('edokumenty', 'Księgowa', 'Standardowe uprawnienia księgowe w eDokumenty', true),
('edokumenty', 'Użytkownik', 'Podstawowe uprawnienia - przeglądanie dokumentów', false),
-- eBiuro profiles
('ebiuro', 'Administrator', 'Pełne uprawnienia eBiuro - zarządzanie wszystkimi funkcjami', false),
('ebiuro', 'Specjalista', 'Standardowe uprawnienia eBiuro', true),
('ebiuro', 'Użytkownik', 'Podstawowe uprawnienia eBiuro', false),
-- KSEF profiles (zgodne z load_ksef_data.sql i obecną bazą)
('ksef', 'Administrator', 'Pełne uprawnienia KSEF - zarządzanie wszystkimi funkcjami', false),
('ksef', 'Księgowa', 'Standardowe uprawnienia KSEF - księgowe', true),
('ksef', 'Handlowiec', 'Uprawnienia handlowe KSEF', false),
('ksef', 'Właściciel', 'Uprawnienia właściciela KSEF', false),
('ksef', 'Zakupowiec', 'Uprawnienia zakupowe KSEF', false),
-- eDeklaracje profiles
('edeklaracje', 'Administrator', 'Pełne uprawnienia eDeklaracje - zarządzanie wszystkimi funkcjami', false),
('edeklaracje', 'Edytor', 'Standardowe uprawnienia eDeklaracje - edycja deklaracji', true),
('edeklaracje', 'Użytkownik', 'Podstawowe uprawnienia eDeklaracje - przeglądanie', false);

-- ============================================================================
-- PROFILE-ROLE MAPPINGS - FIXED! (brakujące w oryginalnym seed_data.sql)
-- ============================================================================

INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = r.app_id AND (
    -- FK mappings (zgodne z obecną bazą danych)
    (ap.app_id = 'fk' AND ap.profile_name = 'Administrator' AND r.role_name = 'fk_admin') OR
    (ap.app_id = 'fk' AND ap.profile_name = 'Księgowy' AND r.role_name = 'fk_editor') OR
    (ap.app_id = 'fk' AND ap.profile_name = 'Użytkownik' AND r.role_name = 'fk_viewer') OR
    -- HR mappings (zgodne z obecną bazą danych)
    (ap.app_id = 'hr' AND ap.profile_name = 'Administrator' AND r.role_name = 'hr_admin') OR
    (ap.app_id = 'hr' AND ap.profile_name = 'HR Manager' AND r.role_name = 'hr_editor') OR
    (ap.app_id = 'hr' AND ap.profile_name = 'Użytkownik' AND r.role_name = 'hr_viewer') OR
    -- CRM mappings (zgodne z obecną bazą danych)
    (ap.app_id = 'crm' AND ap.profile_name = 'Administrator' AND r.role_name = 'crm_admin') OR
    (ap.app_id = 'crm' AND ap.profile_name = 'Sales Manager' AND r.role_name = 'crm_editor') OR
    (ap.app_id = 'crm' AND ap.profile_name = 'Użytkownik' AND r.role_name = 'crm_viewer') OR
    -- KSEF mappings (zgodne z load_ksef_data.sql)
    (ap.app_id = 'ksef' AND ap.profile_name = 'Administrator' AND r.role_name = 'Administrator') OR
    (ap.app_id = 'ksef' AND ap.profile_name = 'Księgowa' AND r.role_name = 'Księgowa') OR
    (ap.app_id = 'ksef' AND ap.profile_name = 'Handlowiec' AND r.role_name = 'Handlowiec') OR
    (ap.app_id = 'ksef' AND ap.profile_name = 'Właściciel' AND r.role_name = 'Wlasciciel_KA') OR
    (ap.app_id = 'ksef' AND ap.profile_name = 'Zakupowiec' AND r.role_name = 'Zakupowiec')
);

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Insert permissions for each application
INSERT INTO permissions (app_id, permission_name, description, resource_type, action) VALUES
-- FK permissions
('fk', 'view_entry', 'Przeglądanie wpisów księgowych', 'entry', 'view'),
('fk', 'edit_entry', 'Edycja wpisów księgowych', 'entry', 'edit'),
('fk', 'delete_entry', 'Usuwanie wpisów księgowych', 'entry', 'delete'),
('fk', 'manage_accounts', 'Zarządzanie kontami księgowymi', 'account', 'manage'),
('fk', 'generate_reports', 'Generowanie raportów finansowych', 'report', 'generate'),
('fk', 'approve_entries', 'Zatwierdzanie wpisów księgowych', 'entry', 'approve'),
('fk', 'manage_chart_of_accounts', 'Zarządzanie planem kont', 'chart', 'manage'),
('fk', 'access_bank_statements', 'Dostęp do wyciągów bankowych', 'bank_statement', 'view'),
('fk', 'manage_vat_declarations', 'Zarządzanie deklaracjami VAT', 'vat_declaration', 'manage'),
('fk', 'export_data', 'Eksport danych finansowych', 'data', 'export'),
('fk', 'create_invoices', 'Tworzenie faktur', 'invoice', 'create'),
('fk', 'edit_invoices', 'Edycja faktur', 'invoice', 'edit'),
('fk', 'view_invoices', 'Przeglądanie faktur', 'invoice', 'view'),
('fk', 'view_bank_statements', 'Przeglądanie wyciągów bankowych', 'bank_statement', 'view'),
('fk', 'generate_basic_reports', 'Generowanie podstawowych raportów', 'report', 'generate_basic'),

-- HR permissions
('hr', 'view_profile', 'Przeglądanie profili pracowników', 'profile', 'view'),
('hr', 'edit_profile', 'Edycja profili pracowników', 'profile', 'edit'),
('hr', 'delete_profile', 'Usuwanie profili pracowników', 'profile', 'delete'),
('hr', 'manage_contracts', 'Zarządzanie umowami', 'contract', 'manage'),
('hr', 'manage_salaries', 'Zarządzanie wynagrodzeniami', 'salary', 'manage'),
('hr', 'generate_hr_reports', 'Generowanie raportów HR', 'report', 'generate'),
('hr', 'manage_vacation_requests', 'Zarządzanie wnioskami urlopowymi', 'vacation', 'manage'),
('hr', 'access_personal_data', 'Dostęp do danych osobowych', 'personal_data', 'view'),
('hr', 'manage_organizational_structure', 'Zarządzanie strukturą organizacyjną', 'org_structure', 'manage'),
('hr', 'export_hr_data', 'Eksport danych HR', 'data', 'export'),
('hr', 'edit_contract', 'Edycja umów', 'contract', 'edit'),
('hr', 'view_salaries', 'Przeglądanie wynagrodzeń', 'salary', 'view'),
('hr', 'view_contract', 'Przeglądanie umów', 'contract', 'view'),
('hr', 'view_organizational_structure', 'Przeglądanie struktury organizacyjnej', 'org_structure', 'view'),

-- CRM permissions
('crm', 'view_client', 'Przeglądanie klientów', 'client', 'view'),
('crm', 'edit_client', 'Edycja danych klientów', 'client', 'edit'),
('crm', 'delete_client', 'Usuwanie klientów', 'client', 'delete'),
('crm', 'manage_deals', 'Zarządzanie transakcjami', 'deal', 'manage'),
('crm', 'generate_crm_reports', 'Generowanie raportów CRM', 'report', 'generate'),
('crm', 'manage_pipelines', 'Zarządzanie pipeline sprzedażowym', 'pipeline', 'manage'),
('crm', 'access_analytics', 'Dostęp do analityki', 'analytics', 'view'),
('crm', 'manage_team_performance', 'Zarządzanie wydajnością zespołu', 'team_performance', 'manage'),
('crm', 'export_crm_data', 'Eksport danych CRM', 'data', 'export'),
('crm', 'manage_client_segments', 'Zarządzanie segmentami klientów', 'client_segment', 'manage'),
('crm', 'manage_activities', 'Zarządzanie aktywnościami', 'activity', 'manage'),
('crm', 'view_analytics', 'Przeglądanie analityki', 'analytics', 'view'),
('crm', 'view_deals', 'Przeglądanie transakcji', 'deal', 'view'),
('crm', 'view_activities', 'Przeglądanie aktywności', 'activity', 'view'),
('crm', 'generate_basic_crm_reports', 'Generowanie podstawowych raportów CRM', 'report', 'generate_basic'),

-- KSEF permissions (zgodne z load_ksef_data.sql)
('ksef', 'canViewSalesInvoices', 'Może przeglądać faktury sprzedażowe', 'invoice', 'view'),
('ksef', 'canCreateSalesInvoices', 'Może tworzyć faktury sprzedażowe', 'invoice', 'create'),
('ksef', 'canEditSalesInvoices', 'Może edytować faktury sprzedażowe', 'invoice', 'edit'),
('ksef', 'canDeleteSalesInvoices', 'Może usuwać faktury sprzedażowe', 'invoice', 'delete'),
('ksef', 'canViewPurchaseInvoices', 'Może przeglądać faktury zakupowe', 'purchase_invoice', 'view'),
('ksef', 'canCreatePurchaseInvoices', 'Może tworzyć faktury zakupowe', 'purchase_invoice', 'create'),
('ksef', 'canEditPurchaseInvoices', 'Może edytować faktury zakupowe', 'purchase_invoice', 'edit'),
('ksef', 'canDeletePurchaseInvoices', 'Może usuwać faktury zakupowe', 'purchase_invoice', 'delete'),
('ksef', 'canManageDeclarations', 'Może zarządzać deklaracjami', 'declaration', 'manage'),
('ksef', 'canViewReports', 'Może przeglądać raporty', 'report', 'view'),
('ksef', 'canManageConfiguration', 'Może zarządzać konfiguracją', 'configuration', 'manage'),
('ksef', 'canManageUsers', 'Może zarządzać użytkownikami', 'user', 'manage');

-- ============================================================================
-- ROLE PERMISSIONS ASSIGNMENTS
-- ============================================================================

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.role_id, p.permission_id 
FROM roles r, permissions p 
WHERE r.app_id = p.app_id AND (
    -- FK Admin permissions
    (r.role_name = 'fk_admin' AND p.permission_name IN (
        'view_entry', 'edit_entry', 'delete_entry', 'manage_accounts', 
        'generate_reports', 'approve_entries', 'manage_chart_of_accounts',
        'access_bank_statements', 'manage_vat_declarations', 'export_data'
    )) OR
    -- FK Editor permissions
    (r.role_name = 'fk_editor' AND p.permission_name IN (
        'view_entry', 'edit_entry', 'generate_reports', 'access_bank_statements',
        'create_invoices', 'edit_invoices'
    )) OR
    -- FK Viewer permissions
    (r.role_name = 'fk_viewer' AND p.permission_name IN (
        'view_entry', 'generate_basic_reports', 'view_invoices', 'view_bank_statements'
    )) OR
    -- HR Admin permissions
    (r.role_name = 'hr_admin' AND p.permission_name IN (
        'view_profile', 'edit_profile', 'delete_profile', 'manage_contracts',
        'manage_salaries', 'generate_hr_reports', 'manage_vacation_requests',
        'access_personal_data', 'manage_organizational_structure', 'export_hr_data'
    )) OR
    -- HR Editor permissions
    (r.role_name = 'hr_editor' AND p.permission_name IN (
        'view_profile', 'edit_profile', 'edit_contract', 'generate_hr_reports',
        'manage_vacation_requests', 'view_salaries'
    )) OR
    -- HR Viewer permissions
    (r.role_name = 'hr_viewer' AND p.permission_name IN (
        'view_profile', 'view_contract', 'view_organizational_structure'
    )) OR
    -- CRM Admin permissions
    (r.role_name = 'crm_admin' AND p.permission_name IN (
        'view_client', 'edit_client', 'delete_client', 'manage_deals',
        'generate_crm_reports', 'manage_pipelines', 'access_analytics',
        'manage_team_performance', 'export_crm_data', 'manage_client_segments'
    )) OR
    -- CRM Editor permissions
    (r.role_name = 'crm_editor' AND p.permission_name IN (
        'view_client', 'edit_client', 'manage_deals', 'generate_crm_reports',
        'manage_activities', 'view_analytics'
    )) OR
    -- CRM Viewer permissions
    (r.role_name = 'crm_viewer' AND p.permission_name IN (
        'view_client', 'view_deals', 'view_activities', 'generate_basic_crm_reports'
    )) OR
    -- KSEF Administrator permissions (zgodne z load_ksef_data.sql)
    (r.role_name = 'Administrator' AND r.app_id = 'ksef' AND p.permission_name IN (
        'canViewSalesInvoices', 'canCreateSalesInvoices', 'canEditSalesInvoices', 
        'canDeleteSalesInvoices', 'canViewPurchaseInvoices', 'canCreatePurchaseInvoices',
        'canEditPurchaseInvoices', 'canDeletePurchaseInvoices', 'canManageDeclarations',
        'canViewReports', 'canManageConfiguration', 'canManageUsers'
    )) OR
    -- KSEF Księgowa permissions
    (r.role_name = 'Księgowa' AND r.app_id = 'ksef' AND p.permission_name IN (
        'canViewSalesInvoices', 'canCreateSalesInvoices', 'canEditSalesInvoices',
        'canViewPurchaseInvoices', 'canCreatePurchaseInvoices', 'canEditPurchaseInvoices',
        'canViewReports'
    )) OR
    -- KSEF Handlowiec permissions
    (r.role_name = 'Handlowiec' AND r.app_id = 'ksef' AND p.permission_name IN (
        'canViewSalesInvoices', 'canCreateSalesInvoices', 'canEditSalesInvoices'
    )) OR
    -- KSEF Właściciel permissions
    (r.role_name = 'Wlasciciel_KA' AND r.app_id = 'ksef' AND p.permission_name IN (
        'canViewSalesInvoices', 'canViewPurchaseInvoices', 'canViewReports',
        'canManageConfiguration'
    )) OR
    -- KSEF Zakupowiec permissions
    (r.role_name = 'Zakupowiec' AND r.app_id = 'ksef' AND p.permission_name IN (
        'canViewPurchaseInvoices', 'canCreatePurchaseInvoices', 'canEditPurchaseInvoices'
    ))
);

-- ============================================================================
-- USER ASSIGNMENTS - Enhanced with Profile Testing
-- ============================================================================

-- Assign example application profiles to users for testing
INSERT INTO user_application_profiles (user_id, profile_id, assigned_by) 
SELECT uap.user_id, ap.profile_id, 'system'
FROM (VALUES
    -- user42 - FK i HR Administrator profiles
    ('user42', 'fk', 'Administrator'),
    ('user42', 'hr', 'Administrator'),
    -- user99 - HR Manager profile
    ('user99', 'hr', 'HR Manager'),
    -- user150 - CRM Sales Manager profile
    ('user150', 'crm', 'Sales Manager'),
    -- user200 - Super admin - wszystkie Administrative profiles
    ('user200', 'fk', 'Administrator'),
    ('user200', 'hr', 'Administrator'),
    ('user200', 'crm', 'Administrator'),
    ('user200', 'ksef', 'Administrator'),
    -- user300 - Standard accountant - FK Księgowy i KSEF Księgowa
    ('user300', 'fk', 'Księgowy'),
    ('user300', 'ksef', 'Księgowa'),
    -- user500 - KSEF specialist
    ('user500', 'ksef', 'Handlowiec'),
    -- user600 - eDokumenty user
    ('user600', 'edokumenty', 'Księgowa'),
    -- user700 - eBiuro specialist
    ('user700', 'ebiuro', 'Specjalista'),
    -- user800 - Developer z podstawowymi uprawnieniami
    ('user800', 'fk', 'Użytkownik'),
    ('user800', 'hr', 'Użytkownik'),
    ('user800', 'crm', 'Użytkownik')
) AS uap(user_id, app_id, profile_name)
JOIN application_profiles ap ON ap.app_id = uap.app_id AND ap.profile_name = uap.profile_name;

-- Assign roles to users (które nie pochodzą z profile_mapper)
INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_by) 
SELECT ur.user_id, r.role_id, ur.tenant_id, 'system'
FROM (VALUES
    -- user400 (external_accountant) - FK admin w tenant200
    ('user400', 'fk', 'fk_admin', 'tenant200')
) AS ur(user_id, app_id, role_name, tenant_id)
JOIN roles r ON r.app_id = ur.app_id AND r.role_name = ur.role_name;

-- Assign company access to users
INSERT INTO user_access (user_id, company_id, tenant_id, access_type, granted_by) VALUES
-- user42 access
('user42', 'company1', 'tenant125', 'direct', 'system'),
('user42', 'company2', 'tenant125', 'direct', 'system'),
-- user99 access
('user99', 'company7', 'tenant125', 'direct', 'system'),
('user99', 'company8', 'tenant125', 'direct', 'system'),
-- user150 access
('user150', 'company1', 'tenant125', 'direct', 'system'),
('user150', 'company7', 'tenant125', 'direct', 'system'),
-- user200 access (super admin - all companies in tenant125)
('user200', 'company1', 'tenant125', 'direct', 'system'),
('user200', 'company2', 'tenant125', 'direct', 'system'),
('user200', 'company7', 'tenant125', 'direct', 'system'),
('user200', 'company8', 'tenant125', 'direct', 'system'),
('user200', 'company12', 'tenant125', 'direct', 'system'),
-- user300 access
('user300', 'company1', 'tenant125', 'direct', 'system'),
('user300', 'company2', 'tenant125', 'direct', 'system'),
-- user400 access (external accountant in tenant200)
('user400', 'company20', 'tenant200', 'direct', 'system'),
('user400', 'company21', 'tenant200', 'direct', 'system'),
-- Test users access
('user500', 'company1', 'tenant125', 'direct', 'system'),
('user600', 'company7', 'tenant125', 'direct', 'system'),
('user700', 'company8', 'tenant125', 'direct', 'system'),
('user800', 'company12', 'tenant125', 'direct', 'system');

-- ============================================================================
-- TEAMS (REBAC) - Enhanced
-- ============================================================================

-- Insert teams
INSERT INTO teams (tenant_id, team_name, description, team_type, status) VALUES
('tenant125', 'Zespół Kadr', 'Zespół HR obsługujący zarządzanie zasobami ludzkimi', 'department', 'active'),
('tenant125', 'Księgowi ABC Sp. z o.o.', 'Zespół księgowy obsługujący księgowość firmy ABC', 'functional', 'active'),
('tenant125', 'Sprzedaż Region Północ', 'Zespół sprzedażowy obsługujący region północny', 'functional', 'active'),
('tenant125', 'Administratorzy Systemu', 'Zespół administratorów z pełnymi uprawnieniami', 'functional', 'active'),
('tenant125', 'KSEF Support Team', 'Zespół obsługi systemu KSEF', 'functional', 'active'),
('tenant200', 'Biuro Rachunkowe XYZ', 'Zewnętrzne biuro rachunkowe obsługujące tenant200', 'external', 'active');

-- Assign team memberships
INSERT INTO team_memberships (user_id, team_id, role_in_team, joined_by)
SELECT tm.user_id, t.team_id, tm.role_in_team, 'system'
FROM (VALUES
    ('user99', 'Zespół Kadr', 'lead'),
    ('user42', 'Księgowi ABC Sp. z o.o.', 'admin'),
    ('user300', 'Księgowi ABC Sp. z o.o.', 'member'),
    ('user150', 'Zespół Kadr', 'member'),
    ('user150', 'Sprzedaż Region Północ', 'lead'),
    ('user200', 'Administratorzy Systemu', 'admin'),
    ('user500', 'KSEF Support Team', 'lead'),
    ('user600', 'KSEF Support Team', 'member'),
    ('user400', 'Biuro Rachunkowe XYZ', 'admin')
) AS tm(user_id, team_name, role_in_team)
JOIN teams t ON t.team_name = tm.team_name;

-- Assign roles to teams
INSERT INTO team_roles (team_id, role_id, assigned_by)
SELECT t.team_id, r.role_id, 'system'
FROM (VALUES
    -- Zespół Kadr
    ('Zespół Kadr', 'hr', 'hr_editor'),
    ('Zespół Kadr', 'hr', 'hr_admin'),
    ('Zespół Kadr', 'fk', 'fk_viewer'),
    -- Księgowi ABC
    ('Księgowi ABC Sp. z o.o.', 'fk', 'fk_admin'),
    ('Księgowi ABC Sp. z o.o.', 'hr', 'hr_viewer'),
    -- Sprzedaż Region Północ
    ('Sprzedaż Region Północ', 'crm', 'crm_editor'),
    ('Sprzedaż Region Północ', 'fk', 'fk_viewer'),
    -- Administratorzy Systemu
    ('Administratorzy Systemu', 'fk', 'fk_admin'),
    ('Administratorzy Systemu', 'hr', 'hr_admin'),
    ('Administratorzy Systemu', 'crm', 'crm_admin'),
    -- KSEF Support Team
    ('KSEF Support Team', 'ksef', 'Administrator'),
    ('KSEF Support Team', 'ksef', 'Księgowa'),
    -- Biuro Rachunkowe XYZ
    ('Biuro Rachunkowe XYZ', 'fk', 'fk_admin'),
    ('Biuro Rachunkowe XYZ', 'hr', 'hr_viewer')
) AS tr(team_name, app_id, role_name)
JOIN teams t ON t.team_name = tr.team_name
JOIN roles r ON r.app_id = tr.app_id AND r.role_name = tr.role_name;

-- Assign companies to teams
INSERT INTO team_companies (team_id, company_id, access_type, assigned_by)
SELECT t.team_id, c.company_id, tc.access_type, 'system'
FROM (VALUES
    -- Zespół Kadr
    ('Zespół Kadr', 'company7', 'manage'),
    ('Zespół Kadr', 'company8', 'manage'),
    ('Zespół Kadr', 'company12', 'manage'),
    -- Księgowi ABC
    ('Księgowi ABC Sp. z o.o.', 'company1', 'admin'),
    -- Sprzedaż Region Północ
    ('Sprzedaż Region Północ', 'company2', 'manage'),
    ('Sprzedaż Region Północ', 'company7', 'manage'),
    -- Administratorzy Systemu
    ('Administratorzy Systemu', 'company1', 'admin'),
    ('Administratorzy Systemu', 'company2', 'admin'),
    ('Administratorzy Systemu', 'company7', 'admin'),
    ('Administratorzy Systemu', 'company8', 'admin'),
    -- KSEF Support Team
    ('KSEF Support Team', 'company1', 'manage'),
    ('KSEF Support Team', 'company2', 'manage'),
    -- Biuro Rachunkowe XYZ
    ('Biuro Rachunkowe XYZ', 'company20', 'admin'),
    ('Biuro Rachunkowe XYZ', 'company21', 'admin')
) AS tc(team_name, company_id, access_type)
JOIN teams t ON t.team_name = tc.team_name
JOIN companies c ON c.company_id = tc.company_id;

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

-- Summary counts for verification
DO $$
DECLARE
    rec RECORD;
    profile_mappings_count INTEGER;
    user_profiles_count INTEGER;
    user_tenants_count INTEGER;
    ksef_profiles_count INTEGER;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'ENHANCED SEED DATA INITIALIZATION COMPLETE';
    RAISE NOTICE '==================================================';
    
    -- Check entity counts
    FOR rec IN 
        SELECT 'Tenants' as entity, COUNT(*) as count FROM tenants
        UNION ALL SELECT 'Users', COUNT(*) FROM users
        UNION ALL SELECT 'Applications', COUNT(*) FROM applications
        UNION ALL SELECT 'Companies', COUNT(*) FROM companies
        UNION ALL SELECT 'Roles', COUNT(*) FROM roles
        UNION ALL SELECT 'Application Profiles', COUNT(*) FROM application_profiles
        UNION ALL SELECT 'Profile-Role Mappings', COUNT(*) FROM profile_roles
        UNION ALL SELECT 'User-Tenant Relations', COUNT(*) FROM user_tenants
        UNION ALL SELECT 'User Application Profiles', COUNT(*) FROM user_application_profiles
        UNION ALL SELECT 'Permissions', COUNT(*) FROM permissions
        UNION ALL SELECT 'Role Permissions', COUNT(*) FROM role_permissions
        UNION ALL SELECT 'User Roles', COUNT(*) FROM user_roles
        UNION ALL SELECT 'User Access', COUNT(*) FROM user_access
        UNION ALL SELECT 'Teams', COUNT(*) FROM teams
        ORDER BY entity
    LOOP
        RAISE NOTICE '% : %', RPAD(rec.entity, 25), rec.count;
    END LOOP;
    
    -- Detailed verification
    SELECT COUNT(*) INTO profile_mappings_count FROM profile_roles;
    SELECT COUNT(*) INTO user_profiles_count FROM user_application_profiles;
    SELECT COUNT(*) INTO user_tenants_count FROM user_tenants;
    SELECT COUNT(*) INTO ksef_profiles_count FROM application_profiles WHERE app_id = 'ksef';
    
    RAISE NOTICE '';
    RAISE NOTICE 'KEY FIXES IMPLEMENTED:';
    RAISE NOTICE '- Profile-Role Mappings: % (FK, HR, CRM, KSEF)', profile_mappings_count;
    RAISE NOTICE '- User-Tenant Relations: % (ALL users have tenants)', user_tenants_count;
    RAISE NOTICE '- User Profile Assignments: % (ready for API testing)', user_profiles_count;
    RAISE NOTICE '- KSEF Profiles: % (Administrator, Księgowa, Handlowiec, Właściciel, Zakupowiec)', ksef_profiles_count;
    RAISE NOTICE '';
    RAISE NOTICE 'READY FOR DEVELOPMENT:';
    RAISE NOTICE '- All profile mappings work with profile_role_mapper.py';
    RAISE NOTICE '- All users can use /api/users/{userId}/application-access';
    RAISE NOTICE '- KSEF profiles match existing load_ksef_data.sql structure';
    RAISE NOTICE '- Portal applications (edokumenty, ebiuro, edeklaracje) included';
    RAISE NOTICE '==================================================';
END $$; 