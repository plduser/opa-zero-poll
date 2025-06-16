-- Migration: Add NIP field to companies table
-- Date: 2024
-- Description: Dodaje pole nip (Numer Identyfikacji Podatkowej) do tabeli companies

-- Add NIP column to companies table
ALTER TABLE companies 
ADD COLUMN nip VARCHAR(15);

-- Add comment for documentation
COMMENT ON COLUMN companies.nip IS 'Numer Identyfikacji Podatkowej (NIP) firmy';

-- Add index for NIP lookups (optional but recommended for performance)
CREATE INDEX idx_companies_nip ON companies(nip) WHERE nip IS NOT NULL;

-- Add constraint to ensure NIP format if needed (optional - can be validated in application)
-- ALTER TABLE companies ADD CONSTRAINT chk_companies_nip_format 
-- CHECK (nip IS NULL OR nip ~ '^[0-9]{10}$|^[0-9]{3}-[0-9]{3}-[0-9]{2}-[0-9]{2}$|^[0-9]{3}-[0-9]{2}-[0-9]{2}-[0-9]{3}$'); 