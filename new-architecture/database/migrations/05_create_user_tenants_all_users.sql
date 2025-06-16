-- Skrypt do utworzenia tabeli user_tenants
-- Relacja many-to-many między użytkownikami a tenantami

-- Usuń tabelę jeśli istnieje (dla powtórnego uruchomienia)
DROP TABLE IF EXISTS user_tenants CASCADE;

-- Utwórz tabelę user_tenants
CREATE TABLE user_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    assigned_by VARCHAR(255) DEFAULT 'system',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    -- Klucze obce
    CONSTRAINT fk_user_tenants_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_tenants_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    
    -- Unikalność przypisania użytkownik-tenant
    CONSTRAINT unique_user_tenant UNIQUE (user_id, tenant_id)
);

-- Indeksy dla wydajności
CREATE INDEX idx_user_tenants_user_id ON user_tenants(user_id);
CREATE INDEX idx_user_tenants_tenant_id ON user_tenants(tenant_id);
CREATE INDEX idx_user_tenants_default ON user_tenants(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX idx_user_tenants_active ON user_tenants(is_active) WHERE is_active = TRUE;

-- Ograniczenie: każdy użytkownik może mieć tylko jeden domyślny tenant
CREATE UNIQUE INDEX idx_user_tenants_one_default_per_user 
ON user_tenants(user_id) WHERE is_default = TRUE AND is_active = TRUE;

-- Komentarze dla dokumentacji
COMMENT ON TABLE user_tenants IS 'Tabela relacji many-to-many między użytkownikami a tenantami';
COMMENT ON COLUMN user_tenants.user_id IS 'ID użytkownika z tabeli users';
COMMENT ON COLUMN user_tenants.tenant_id IS 'ID tenanta z tabeli tenants';
COMMENT ON COLUMN user_tenants.is_default IS 'Czy to jest domyślny tenant dla użytkownika (tylko jeden może być TRUE)';
COMMENT ON COLUMN user_tenants.assigned_by IS 'Kto przypisał użytkownika do tenanta';
COMMENT ON COLUMN user_tenants.assigned_at IS 'Kiedy przypisano użytkownika do tenanta';
COMMENT ON COLUMN user_tenants.is_active IS 'Czy przypisanie jest aktywne';
COMMENT ON COLUMN user_tenants.notes IS 'Dodatkowe notatki dotyczące przypisania';

-- Dodaj WSZYSTKICH użytkowników którzy mają przypisane firmy do ich tenantów
INSERT INTO user_tenants (user_id, tenant_id, is_default, assigned_by, notes)
SELECT DISTINCT ON (uc.user_id)
    uc.user_id,
    c.tenant_id,
    TRUE as is_default,
    'migration' as assigned_by,
    'Automatyczne przypisanie na podstawie firm użytkownika' as notes
FROM user_companies uc
JOIN companies c ON uc.company_id = c.company_id
WHERE uc.is_active = TRUE
ORDER BY uc.user_id, uc.assigned_at ASC;

-- Sprawdź rezultat
SELECT 
    ut.*,
    u.username,
    u.email,
    t.tenant_name
FROM user_tenants ut
JOIN users u ON ut.user_id = u.user_id
LEFT JOIN tenants t ON ut.tenant_id = t.tenant_id
ORDER BY ut.assigned_at DESC;

COMMIT; 