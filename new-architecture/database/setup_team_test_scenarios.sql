-- ==================================================
-- SCENARIUSZE TESTOWE DLA UPRAWNIEŃ ZESPOŁOWYCH
-- ==================================================

-- Scenariusz testowy: Różne uprawnienia w różnych firmach
-- Cel: Sprawdzenie czy system prawidłowo obsługuje konteksty firm

BEGIN;

-- 1. Stwórzmy nowego użytkownika testowego
INSERT INTO users (user_id, username, email, full_name, status, created_at, updated_at)
VALUES ('user_test_context', 'test_context', 'test.context@symfonia.pl', 'Testowy Kontekstowy', 'active', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Dodaj użytkownika do tenant125
INSERT INTO user_tenants (user_id, tenant_id, is_default, is_active, assigned_at)
VALUES ('user_test_context', 'tenant125', true, true, NOW())
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- 2. Sprawdźmy jakie zespoły i role już istnieją
-- KSEF Pólnoc: company1 (ABC), role: Administrator + Księgowa
-- KSEF Południe: company2 (DEF) + company30 (Test Company A), role: Administrator

-- 3. Dodajmy nowy zespół "KSEF Test Różnych Ról" dla firmy MNO (company12)
INSERT INTO teams (team_id, tenant_id, team_name, team_type, description, status, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'tenant125', 'KSEF Test Różnych Ról', 'functional', 'Zespół testowy dla różnych ról w różnych firmach', 'active', NOW(), NOW())
ON CONFLICT (team_name, tenant_id) DO NOTHING;

-- Pobierz ID tego zespołu
DO $$
DECLARE
    test_team_id UUID;
    mno_company_exists BOOLEAN;
BEGIN
    -- Sprawdź czy firma MNO istnieje
    SELECT EXISTS(SELECT 1 FROM companies WHERE company_id = 'company12') INTO mno_company_exists;
    
    IF NOT mno_company_exists THEN
        -- Dodaj firmę MNO jeśli nie istnieje
        INSERT INTO companies (company_id, tenant_id, company_name, company_code, description, status, created_at)
        VALUES ('company12', 'tenant125', 'MNO S.A.', 'MNO012', 'Firma MNO - test różnych ról', 'active', NOW());
        
        RAISE NOTICE 'Utworzono firmę MNO S.A. (company12)';
    END IF;
    
    -- Pobierz ID zespołu
    SELECT team_id INTO test_team_id 
    FROM teams 
    WHERE team_name = 'KSEF Test Różnych Ról' AND tenant_id = 'tenant125'
    LIMIT 1;
    
    IF test_team_id IS NOT NULL THEN
        -- Przypisz firmę MNO do zespołu
        INSERT INTO team_companies (team_id, company_id, access_type, created_at)
        VALUES (test_team_id, 'company12', 'manage', NOW())
        ON CONFLICT (team_id, company_id) DO NOTHING;
        
        -- Przypisz rolę "Księgowa" (tylko faktury sprzedaży) do zespołu w aplikacji KSEF
        INSERT INTO team_roles (team_id, role_id, context_type, context_value, created_at)
        SELECT test_team_id, r.role_id, 'company', 'company12', NOW()
        FROM roles r 
        WHERE r.role_name = 'Księgowa' AND r.app_id = 'ksef'
        ON CONFLICT (team_id, role_id, context_type, context_value) DO NOTHING;
        
        -- Dodaj użytkownika testowego do zespołu
        INSERT INTO team_memberships (team_id, user_id, role_in_team, joined_at)
        VALUES (test_team_id, 'user_test_context', 'member', NOW())
        ON CONFLICT (team_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Skonfigurowano zespół KSEF Test Różnych Ról dla użytkownika user_test_context';
    END IF;
END $$;

-- 4. Dodajmy drugi zespół dla tego samego użytkownika ale z pełnymi uprawnieniami w innej firmie
INSERT INTO teams (team_id, tenant_id, team_name, team_type, description, status, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'tenant125', 'KSEF Admin PQR', 'functional', 'Zespół administratorów KSEF dla firmy PQR', 'active', NOW(), NOW())
ON CONFLICT (team_name, tenant_id) DO NOTHING;

-- Konfiguracja dla firmy PQR
DO $$
DECLARE
    admin_team_id UUID;
    pqr_company_exists BOOLEAN;
BEGIN
    -- Sprawdź czy firma PQR istnieje
    SELECT EXISTS(SELECT 1 FROM companies WHERE company_id = 'company_pqr') INTO pqr_company_exists;
    
    IF NOT pqr_company_exists THEN
        -- Dodaj firmę PQR
        INSERT INTO companies (company_id, tenant_id, company_name, company_code, description, status, created_at)
        VALUES ('company_pqr', 'tenant125', 'PQR Sp. z o.o.', 'PQR999', 'Firma PQR - test pełnych uprawnień', 'active', NOW());
        
        RAISE NOTICE 'Utworzono firmę PQR Sp. z o.o. (company_pqr)';
    END IF;
    
    -- Pobierz ID zespołu
    SELECT team_id INTO admin_team_id 
    FROM teams 
    WHERE team_name = 'KSEF Admin PQR' AND tenant_id = 'tenant125'
    LIMIT 1;
    
    IF admin_team_id IS NOT NULL THEN
        -- Przypisz firmę PQR do zespołu
        INSERT INTO team_companies (team_id, company_id, access_type, created_at)
        VALUES (admin_team_id, 'company_pqr', 'admin', NOW())
        ON CONFLICT (team_id, company_id) DO NOTHING;
        
        -- Przypisz rolę "Administrator" (pełne uprawnienia) do zespołu w aplikacji KSEF
        INSERT INTO team_roles (team_id, role_id, context_type, context_value, created_at)
        SELECT admin_team_id, r.role_id, 'company', 'company_pqr', NOW()
        FROM roles r 
        WHERE r.role_name = 'Administrator' AND r.app_id = 'ksef'
        ON CONFLICT (team_id, role_id, context_type, context_value) DO NOTHING;
        
        -- Dodaj tego samego użytkownika testowego do zespołu
        INSERT INTO team_memberships (team_id, user_id, role_in_team, joined_at)
        VALUES (admin_team_id, 'user_test_context', 'lead', NOW())
        ON CONFLICT (team_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Skonfigurowano zespół KSEF Admin PQR dla użytkownika user_test_context';
    END IF;
END $$;

-- 5. Podobnie skonfigurujmy Katarzynę Dąbrowską dla zespołu KSEF Pólnoc z ograniczonymi uprawnieniami
-- Usuńmy jej obecne członkostwo w KSEF Południe
DELETE FROM team_memberships 
WHERE user_id = 'user400' AND team_id IN (
    SELECT team_id FROM teams WHERE team_name = 'KSEF Południe'
);

-- Dodajmy ją do KSEF Pólnoc
DO $$
DECLARE
    north_team_id UUID;
BEGIN
    -- Pobierz ID zespołu KSEF Pólnoc
    SELECT team_id INTO north_team_id 
    FROM teams 
    WHERE team_name = 'KSEF Pólnoc' AND tenant_id = 'tenant125'
    LIMIT 1;
    
    IF north_team_id IS NOT NULL THEN
        -- Dodaj Katarzynę Dąbrowską do zespołu KSEF Pólnoc
        INSERT INTO team_memberships (team_id, user_id, role_in_team, joined_at)
        VALUES (north_team_id, 'user400', 'member', NOW())
        ON CONFLICT (team_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Dodano Katarzynę Dąbrowską do zespołu KSEF Pólnoc';
    END IF;
END $$;

COMMIT;

-- ==================================================
-- PODSUMOWANIE SCENARIUSZY TESTOWYCH
-- ==================================================

-- SCENARIUSZ 1: Anna Nowak (user99)
-- - Zespół: KSEF Południe 
-- - Firmy: DEF S.A. (company2), Test Company A (company30)
-- - Role: Administrator KSEF (pełne uprawnienia - faktury sprzedaży + zakupu)
-- - Brak bezpośrednich dostępów do firm

-- SCENARIUSZ 2: Katarzyna Dąbrowska (user400)  
-- - Zespół: KSEF Północ (przesunięta z Południe)
-- - Firmy: ABC Sp. z o.o. (company1)
-- - Role: Administrator + Księgowa KSEF
-- - Test dostępu tylko przez zespół

-- SCENARIUSZ 3: Testowy Kontekstowy (user_test_context) - RÓŻNE ROLE W RÓŻNYCH FIRMACH
-- - Zespół 1: "KSEF Test Różnych Ról" w firmie MNO S.A. (company12) 
--   * Rola: Księgowa (tylko faktury sprzedaży)
-- - Zespół 2: "KSEF Admin PQR" w firmie PQR Sp. z o.o. (company_pqr)
--   * Rola: Administrator (pełne uprawnienia - faktury sprzedaży + zakupu)

-- TESTOWANIE:
-- 1. Zaloguj się jako Anna Nowak → przełącz firmę → sprawdź czy widzisz obie zakładki
-- 2. Zaloguj się jako Katarzyna Dąbrowska → sprawdź dostęp tylko do ABC
-- 3. Zaloguj się jako Testowy Kontekstowy → przełącz firmy → sprawdź różne zakładki 