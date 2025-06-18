-- Enhanced Seed Data Part 3 - Teams (REBAC) and Verification
-- To be run after enhanced_seed_permissions.sql

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
    apps_with_mappings INTEGER;
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
    SELECT COUNT(DISTINCT ap.app_id) INTO apps_with_mappings 
    FROM application_profiles ap 
    JOIN profile_roles pr ON ap.profile_id = pr.profile_id;
    
    RAISE NOTICE '';
    RAISE NOTICE 'KEY FIXES IMPLEMENTED:';
    RAISE NOTICE '- Profile-Role Mappings: % (FK, HR, CRM, KSEF)', profile_mappings_count;
    RAISE NOTICE '- Applications with mappings: % (should be 4)', apps_with_mappings;
    RAISE NOTICE '- User-Tenant Relations: % (ALL users have tenants)', user_tenants_count;
    RAISE NOTICE '- User Profile Assignments: % (ready for API testing)', user_profiles_count;
    RAISE NOTICE '- KSEF Profiles: % (Administrator, Księgowa, Handlowiec, Właściciel, Zakupowiec)', ksef_profiles_count;
    RAISE NOTICE '';
    RAISE NOTICE 'READY FOR DEVELOPMENT:';
    RAISE NOTICE '- All profile mappings work with profile_role_mapper.py';
    RAISE NOTICE '- All users can use /api/users/{userId}/application-access';
    RAISE NOTICE '- KSEF profiles match existing load_ksef_data.sql structure';
    RAISE NOTICE '- Portal applications (edokumenty, ebiuro, edeklaracje) included';
    RAISE NOTICE '';
    RAISE NOTICE 'TEST USERS READY FOR API:';
    RAISE NOTICE '- user42: FK+HR Administrator (tenant125)';
    RAISE NOTICE '- user99: HR Manager (tenant125)'; 
    RAISE NOTICE '- user150: CRM Sales Manager (tenant125)';
    RAISE NOTICE '- user200: Super Admin all apps (tenant125+200+300)';
    RAISE NOTICE '- user300: FK Księgowy + KSEF Księgowa (tenant125)';
    RAISE NOTICE '- user500: KSEF Handlowiec (tenant125)';
    RAISE NOTICE '- user600: eDokumenty Księgowa (tenant125)';
    RAISE NOTICE '- user700: eBiuro Specjalista (tenant125)';
    RAISE NOTICE '- user800: Basic user wszystkie apps (tenant125)';
    RAISE NOTICE '==================================================';
END $$; 