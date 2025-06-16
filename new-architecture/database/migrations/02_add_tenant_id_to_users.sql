-- Skrypt do dodania kolumny tenant_id do tabeli users
-- Każdy użytkownik musi należeć do konkretnego tenant

-- Dodaj kolumnę tenant_id do tabeli users
ALTER TABLE users 
ADD COLUMN tenant_id VARCHAR(255);

-- Aktualizuj istniejących użytkowników - ustaw tenant_id na podstawie ich firm
UPDATE users 
SET tenant_id = (
    SELECT DISTINCT c.tenant_id 
    FROM user_companies uc 
    JOIN companies c ON uc.company_id = c.company_id 
    WHERE uc.user_id = users.user_id 
    AND uc.is_active = TRUE 
    LIMIT 1
)
WHERE users.user_id IN (
    SELECT DISTINCT uc.user_id 
    FROM user_companies uc 
    WHERE uc.is_active = TRUE
);

-- Dla użytkowników bez firm, ustaw domyślny tenant (można dostosować)
UPDATE users 
SET tenant_id = 'tenant-1125948988-1750065356019' 
WHERE tenant_id IS NULL;

-- Teraz ustaw kolumnę jako NOT NULL (po wypełnieniu danych)
ALTER TABLE users 
ALTER COLUMN tenant_id SET NOT NULL;

-- Dodaj foreign key constraint
ALTER TABLE users 
ADD CONSTRAINT fk_users_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE RESTRICT;

-- Dodaj indeks dla wydajności
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- Sprawdź rezultat
SELECT 
    u.user_id,
    u.username,
    u.tenant_id,
    COUNT(uc.company_id) as companies_count
FROM users u
LEFT JOIN user_companies uc ON u.user_id = uc.user_id AND uc.is_active = TRUE
GROUP BY u.user_id, u.username, u.tenant_id
ORDER BY u.username;

COMMIT; 