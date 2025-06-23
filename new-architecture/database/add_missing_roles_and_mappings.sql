-- ============================================================================
-- ADD MISSING ROLES AND MAPPINGS FOR EDEKLARACJE AND EDOKUMENTY
-- ============================================================================

-- Add missing roles for eDokumenty
INSERT INTO roles (app_id, role_name, description, is_system_role) VALUES
('edokumenty', 'edokumenty_admin', 'Administrator eDokumenty - pełne uprawnienia', true),
('edokumenty', 'edokumenty_ksiegowa', 'Księgowa eDokumenty - standardowe uprawnienia księgowe', true),
('edokumenty', 'edokumenty_user', 'Użytkownik eDokumenty - podstawowe uprawnienia', true);

-- Add missing roles for eDeklaracje
INSERT INTO roles (app_id, role_name, description, is_system_role) VALUES
('edeklaracje', 'edeklaracje_admin', 'Administrator eDeklaracje - pełne uprawnienia', true),
('edeklaracje', 'edeklaracje_edytor', 'Edytor eDeklaracje - standardowe uprawnienia edycji', true),
('edeklaracje', 'edeklaracje_user', 'Użytkownik eDeklaracje - podstawowe uprawnienia', true);

-- Add missing profile-role mappings for eDokumenty
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = r.app_id AND ap.app_id = 'edokumenty' AND (
    (ap.profile_name = 'Administrator' AND r.role_name = 'edokumenty_admin') OR
    (ap.profile_name = 'Księgowa' AND r.role_name = 'edokumenty_ksiegowa') OR
    (ap.profile_name = 'Użytkownik' AND r.role_name = 'edokumenty_user')
);

-- Add missing profile-role mappings for eDeklaracje
INSERT INTO profile_roles (profile_id, role_id)
SELECT ap.profile_id, r.role_id
FROM application_profiles ap, roles r
WHERE ap.app_id = r.app_id AND ap.app_id = 'edeklaracje' AND (
    (ap.profile_name = 'Administrator' AND r.role_name = 'edeklaracje_admin') OR
    (ap.profile_name = 'Edytor' AND r.role_name = 'edeklaracje_edytor') OR
    (ap.profile_name = 'Użytkownik' AND r.role_name = 'edeklaracje_user')
);

-- Verify the added mappings
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'ADDED MISSING ROLES AND MAPPINGS';
    RAISE NOTICE '==================================================';
    
    RAISE NOTICE 'New roles added:';
    FOR rec IN 
        SELECT app_id, role_name, description FROM roles 
        WHERE app_id IN ('edokumenty', 'edeklaracje')
        ORDER BY app_id, role_name
    LOOP
        RAISE NOTICE '- % : % (%)', rec.app_id, rec.role_name, rec.description;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'New profile-role mappings:';
    FOR rec IN
        SELECT ap.app_id, ap.profile_name, r.role_name
        FROM application_profiles ap
        JOIN profile_roles pr ON ap.profile_id = pr.profile_id
        JOIN roles r ON pr.role_id = r.role_id
        WHERE ap.app_id IN ('edokumenty', 'edeklaracje')
        ORDER BY ap.app_id, ap.profile_name
    LOOP
        RAISE NOTICE '- % : % → %', rec.app_id, rec.profile_name, rec.role_name;
    END LOOP;
    
    RAISE NOTICE '==================================================';
END $$; 