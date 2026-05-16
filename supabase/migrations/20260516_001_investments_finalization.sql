-- Finalization fields for investments
ALTER TABLE investments
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'activa' CHECK (status IN ('activa', 'finalizada')),
    ADD COLUMN IF NOT EXISTS final_amount numeric,
    ADD COLUMN IF NOT EXISTS target_account_id uuid,
    ADD COLUMN IF NOT EXISTS finalization_date text;
