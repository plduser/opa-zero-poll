-- ============================================================================
-- PROFILE MAPPINGS (Portal Symfonia concept)
-- ============================================================================

-- Map Application Profiles to Roles
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = r.app_id AND (
    -- FK Profile mappings
    (ap.app_id = 'fk' AND ap.profile_name = 'Administrator' AND r.role_name = 'fk_admin') OR
    (ap.app_id = 'fk' AND ap.profile_name = 'Księgowa' AND r.role_name = 'fk_editor') OR
    (ap.app_id = 'fk' AND ap.profile_name = 'Użytkownik' AND r.role_name = 'fk_viewer') OR
    -- HR Profile mappings
    (ap.app_id = 'hr' AND ap.profile_name = 'Administrator' AND r.role_name = 'hr_admin') OR
    (ap.app_id = 'hr' AND ap.profile_name = 'Specjalista HR' AND r.role_name = 'hr_editor') OR
    (ap.app_id = 'hr' AND ap.profile_name = 'Użytkownik' AND r.role_name = 'hr_viewer') OR
    -- CRM Profile mappings
    (ap.app_id = 'crm' AND ap.profile_name = 'Administrator' AND r.role_name = 'crm_admin') OR
    (ap.app_id = 'crm' AND ap.profile_name = 'Sprzedawca' AND r.role_name = 'crm_editor') OR
    (ap.app_id = 'crm' AND ap.profile_name = 'Użytkownik' AND r.role_name = 'crm_viewer')
);

-- Sample User Application Profile assignments (Portal Symfonia style)
INSERT INTO user_application_profiles (user_id, profile_id, tenant_id, assigned_by)
SELECT uap.user_id, ap.profile_id, uap.tenant_id, 'portal_admin'
FROM (VALUES
    -- user42 (admin_user) - FK Administrator, HR Użytkownik in tenant125
    ('user42', 'fk', 'Administrator', 'tenant125'),
    ('user42', 'hr', 'Użytkownik', 'tenant125'),
    -- user99 (hr_manager) - HR Specjalista HR in tenant125
    ('user99', 'hr', 'Specjalista HR', 'tenant125'),
    -- user150 (sales_rep) - FK Użytkownik, CRM Sprzedawca in tenant125
    ('user150', 'fk', 'Użytkownik', 'tenant125'),
    ('user150', 'crm', 'Sprzedawca', 'tenant125'),
    -- user200 (super_admin) - All Administrator profiles in tenant125
    ('user200', 'fk', 'Administrator', 'tenant125'),
    ('user200', 'hr', 'Administrator', 'tenant125'),
    ('user200', 'crm', 'Administrator', 'tenant125'),
    -- user300 (accountant) - FK Księgowa in tenant125
    ('user300', 'fk', 'Księgowa', 'tenant125'),
    -- user400 (external_accountant) - FK Administrator in tenant200
    ('user400', 'fk', 'Administrator', 'tenant200')
) AS uap(user_id, app_id, profile_name, tenant_id)
JOIN application_profiles ap ON ap.app_id = uap.app_id AND ap.profile_name = uap.profile_name;

-- ============================================================================
-- VERIFICATION QUERIES FOR PROFILES
-- ============================================================================

-- Uncomment these to verify the profile data after insertion:

-- SELECT 'Application Profiles' as entity, COUNT(*) as count FROM application_profiles
-- UNION ALL
-- SELECT 'Profile Role Mappings', COUNT(*) FROM profile_roles
-- UNION ALL
-- SELECT 'User Application Profiles', COUNT(*) FROM user_application_profiles;

-- Test profile-based permissions:
-- SELECT 
--     uap.user_id,
--     uap.tenant_id,
--     ap.app_id,
--     ap.profile_name,
--     r.role_name,
--     p.permission_name
-- FROM user_application_profiles uap
-- JOIN application_profiles ap ON uap.profile_id = ap.profile_id
-- JOIN profile_roles pr ON ap.profile_id = pr.profile_id
-- JOIN roles r ON pr.role_id = r.role_id
-- JOIN role_permissions rp ON r.role_id = rp.role_id
-- JOIN permissions p ON rp.permission_id = p.permission_id
-- WHERE uap.user_id = 'user42' AND uap.tenant_id = 'tenant125'
-- ORDER BY ap.app_id, p.permission_name; 