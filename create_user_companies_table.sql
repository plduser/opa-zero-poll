-- Skrypt do utworzenia tabeli user_companies
-- Wspólny słownik firm dla użytkowników (niezależnie od aplikacji)

-- Usuń tabelę jeśli istnieje (dla powtórnego uruchomienia)
DROP TABLE IF EXISTS user_companies CASCADE;

-- Utwórz tabelę user_companies
CREATE TABLE user_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    company_id VARCHAR(255) NOT NULL,
    assigned_by VARCHAR(255) DEFAULT 'system',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Klucze obce
    CONSTRAINT fk_user_companies_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_companies_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    
    -- Unikalność przypisania użytkownik-firma
    CONSTRAINT unique_user_company UNIQUE (user_id, company_id)
);

-- Indeksy dla wydajności
CREATE INDEX idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX idx_user_companies_assigned_at ON user_companies(assigned_at);
CREATE INDEX idx_user_companies_active ON user_companies(is_active) WHERE is_active = TRUE;

-- Komentarze dla dokumentacji
COMMENT ON TABLE user_companies IS 'Tabela przypisań firm do użytkowników - wspólny słownik dla wszystkich aplikacji';
COMMENT ON COLUMN user_companies.user_id IS 'ID użytkownika z tabeli users';
COMMENT ON COLUMN user_companies.company_id IS 'ID firmy z tabeli companies';
COMMENT ON COLUMN user_companies.assigned_by IS 'Kto przypisał firmę użytkownikowi';
COMMENT ON COLUMN user_companies.assigned_at IS 'Kiedy przypisano firmę';
COMMENT ON COLUMN user_companies.notes IS 'Dodatkowe notatki dotyczące przypisania';
COMMENT ON COLUMN user_companies.is_active IS 'Czy przypisanie jest aktywne';

-- Przykładowe dane testowe
INSERT INTO user_companies (user_id, company_id, assigned_by, notes) VALUES
-- Użytkownik z bazy danych + firmy z NIP
('user_1750076665', 'company_1750082610', 'admin', 'Główna firma użytkownika'),
('user_1750076665', 'company_1750082310', 'admin', 'Dodatkowa firma testowa'),

-- Dodaj więcej przypisań dla testów
('user_1750076665', 'company_1750081608', 'system', 'Automatyczne przypisanie przez system');

-- Sprawdź rezultat
SELECT 
    uc.*,
    u.username,
    c.company_name,
    c.nip
FROM user_companies uc
JOIN users u ON uc.user_id = u.user_id
JOIN companies c ON uc.company_id = c.company_id
ORDER BY uc.assigned_at DESC;

COMMIT; 