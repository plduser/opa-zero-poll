-- Enhanced Seed Data Part 2 - Permissions and User Assignments

-- To be run after enhanced_seed_data.sql

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

-- Direct role assignments (które nie pochodzą z profile_mapper)
INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_by) 
SELECT ur.user_id, r.role_id, ur.tenant_id, 'system'
FROM (VALUES
    -- user400 (external_accountant) - FK admin w tenant200
    ('user400', 'fk', 'fk_admin', 'tenant200')
) AS ur(user_id, app_id, role_name, tenant_id)
JOIN roles r ON r.app_id = ur.app_id AND r.role_name = ur.role_name; 