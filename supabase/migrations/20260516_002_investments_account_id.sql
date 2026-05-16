-- Vincular inversiones a cuentas de origen
ALTER TABLE investments ADD COLUMN IF NOT EXISTS account_id uuid;
