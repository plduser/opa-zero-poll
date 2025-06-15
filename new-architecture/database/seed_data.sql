-- Seed Data for OPA Zero Poll - Model 2 (RBAC + REBAC)
-- Test data for development and testing

-- ============================================================================
-- CORE DATA
-- ============================================================================

-- Insert tenants
INSERT INTO tenants (tenant_id, tenant_name, description, status) VALUES
('tenant125', 'Symfonia Sp. z o.o.', 'Główny tenant dla systemu Symfonia', 'active'),
('tenant200', 'Biuro Rachunkowe XYZ', 'Zewnętrzne biuro rachunkowe', 'active'),
('tenant300', 'Test Company Ltd.', 'Tenant testowy dla rozwoju', 'active');

-- Insert users
INSERT INTO users (user_id, username, email, full_name, status) VALUES
('user42', 'admin_user', 'admin@symfonia.pl', 'Jan Kowalski', 'active'),
('user99', 'hr_manager', 'hr@symfonia.pl', 'Anna Nowak', 'active'),
('user150', 'sales_rep', 'sales@symfonia.pl', 'Piotr Wiśniewski', 'active'),
('user200', 'super_admin', 'superadmin@symfonia.pl', 'Maria Zielińska', 'active'),
('user300', 'accountant', 'ksiegowosc@symfonia.pl', 'Tomasz Lewandowski', 'active'),
('user400', 'external_accountant', 'external@xyz.pl', 'Katarzyna Dąbrowska', 'active');

-- Insert applications
INSERT INTO applications (app_id, app_name, description, status) VALUES
('fk', 'Finanse i Księgowość', 'Moduł finansowo-księgowy', 'active'),
('hr', 'Zasoby Ludzkie', 'Moduł zarządzania zasobami ludzkimi', 'active'),
('crm', 'Customer Relationship Management', 'Moduł zarządzania relacjami z klientami', 'active');

-- Insert companies
INSERT INTO companies (company_id, tenant_id, company_name, company_code, description, status) VALUES
-- Tenant125 companies
('company1', 'tenant125', 'ABC Sp. z o.o.', 'ABC001', 'Firma ABC - główny klient', 'active'),
('company2', 'tenant125', 'DEF S.A.', 'DEF002', 'Firma DEF - duży klient', 'active'),
('company7', 'tenant125', 'GHI Sp. z o.o.', 'GHI007', 'Firma GHI - średni klient', 'active'),
('company8', 'tenant125', 'JKL Sp. z o.o.', 'JKL008', 'Firma JKL - mały klient', 'active'),
('company12', 'tenant125', 'MNO S.A.', 'MNO012', 'Firma MNO - nowy klient', 'active'),
-- Tenant200 companies
('company20', 'tenant200', 'PQR Sp. z o.o.', 'PQR020', 'Firma PQR - klient biura rachunkowego', 'active'),
('company21', 'tenant200', 'STU S.A.', 'STU021', 'Firma STU - klient biura rachunkowego', 'active'),
-- Tenant300 companies (test)
('company30', 'tenant300', 'Test Company A', 'TEST030', 'Firma testowa A', 'active'),
('company31', 'tenant300', 'Test Company B', 'TEST031', 'Firma testowa B', 'active');

-- ============================================================================
-- RBAC DATA
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
('crm', 'crm_viewer', 'Przeglądający modułu CRM - tylko odczyt', true);

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
('crm', 'generate_basic_crm_reports', 'Generowanie podstawowych raportów CRM', 'report', 'generate_basic');

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
    ))
);

-- ============================================================================
-- USER ASSIGNMENTS
-- ============================================================================

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_by) 
SELECT ur.user_id, r.role_id, ur.tenant_id, 'system'
FROM (VALUES
    -- user42 (admin_user) - FK admin, HR viewer in tenant125
    ('user42', 'fk', 'fk_admin', 'tenant125'),
    ('user42', 'hr', 'hr_viewer', 'tenant125'),
    -- user99 (hr_manager) - HR editor in tenant125
    ('user99', 'hr', 'hr_editor', 'tenant125'),
    -- user150 (sales_rep) - FK viewer, CRM editor in tenant125
    ('user150', 'fk', 'fk_viewer', 'tenant125'),
    ('user150', 'crm', 'crm_editor', 'tenant125'),
    -- user200 (super_admin) - All admin roles in tenant125
    ('user200', 'fk', 'fk_admin', 'tenant125'),
    ('user200', 'hr', 'hr_admin', 'tenant125'),
    ('user200', 'crm', 'crm_admin', 'tenant125'),
    -- user300 (accountant) - FK viewer in tenant125
    ('user300', 'fk', 'fk_viewer', 'tenant125'),
    -- user400 (external_accountant) - FK admin in tenant200
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
-- user300 access
('user300', 'company1', 'tenant125', 'direct', 'system'),
-- user400 access (external accountant in tenant200)
('user400', 'company20', 'tenant200', 'direct', 'system'),
('user400', 'company21', 'tenant200', 'direct', 'system');

-- ============================================================================
-- TEAMS (REBAC)
-- ============================================================================

-- Insert teams
INSERT INTO teams (tenant_id, team_name, description, team_type, status) VALUES
('tenant125', 'Zespół Kadr', 'Zespół HR obsługujący zarządzanie zasobami ludzkimi', 'department', 'active'),
('tenant125', 'Księgowi ABC Sp. z o.o.', 'Zespół księgowy obsługujący księgowość firmy ABC', 'functional', 'active'),
('tenant125', 'Sprzedaż Region Północ', 'Zespół sprzedażowy obsługujący region północny', 'functional', 'active'),
('tenant125', 'Administratorzy Systemu', 'Zespół administratorów z pełnymi uprawnieniami', 'functional', 'active'),
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
    -- Biuro Rachunkowe XYZ
    ('Biuro Rachunkowe XYZ', 'company20', 'admin'),
    ('Biuro Rachunkowe XYZ', 'company21', 'admin')
) AS tc(team_name, company_id, access_type)
JOIN teams t ON t.team_name = tc.team_name
JOIN companies c ON c.company_id = tc.company_id;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment these to verify the data after insertion:

-- SELECT 'Tenants' as entity, COUNT(*) as count FROM tenants
-- UNION ALL
-- SELECT 'Users', COUNT(*) FROM users
-- UNION ALL
-- SELECT 'Applications', COUNT(*) FROM applications
-- UNION ALL
-- SELECT 'Companies', COUNT(*) FROM companies
-- UNION ALL
-- SELECT 'Roles', COUNT(*) FROM roles
-- UNION ALL
-- SELECT 'Permissions', COUNT(*) FROM permissions
-- UNION ALL
-- SELECT 'Role Permissions', COUNT(*) FROM role_permissions
-- UNION ALL
-- SELECT 'User Roles', COUNT(*) FROM user_roles
-- UNION ALL
-- SELECT 'User Access', COUNT(*) FROM user_access
-- UNION ALL
-- SELECT 'Teams', COUNT(*) FROM teams
-- UNION ALL
-- SELECT 'Team Memberships', COUNT(*) FROM team_memberships
-- UNION ALL
-- SELECT 'Team Roles', COUNT(*) FROM team_roles
-- UNION ALL
-- SELECT 'Team Companies', COUNT(*) FROM team_companies;

-- Test effective permissions view:
-- SELECT * FROM user_effective_permissions WHERE user_id = 'user42' AND tenant_id = 'tenant125';

-- Test effective access view:
-- SELECT * FROM user_effective_access WHERE user_id = 'user150' AND tenant_id = 'tenant125'; 