-- Account visibility flag
ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
