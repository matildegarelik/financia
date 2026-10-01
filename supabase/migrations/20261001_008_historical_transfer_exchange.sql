-- Snapshot the exchange terms used when a cross-currency transfer is recorded.
ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS transfer_calculation_mode text DEFAULT 'amounts_neutral',
    ADD COLUMN IF NOT EXISTS exchange_rate numeric,
    ADD COLUMN IF NOT EXISTS reference_rate numeric,
    ADD COLUMN IF NOT EXISTS exchange_difference numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS exchange_difference_currency text,
    ADD COLUMN IF NOT EXISTS exchange_rate_date text;

ALTER TABLE transactions
    DROP CONSTRAINT IF EXISTS transactions_transfer_calculation_mode_check;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_transfer_calculation_mode_check
    CHECK (transfer_calculation_mode IN ('amounts_neutral', 'rate'));

-- Keep existing cross-currency transfers on the legacy calculation until the
-- user explicitly edits them with one of the new modes.
UPDATE transactions
SET transfer_calculation_mode = NULL
WHERE type = 'transfer'
  AND currency IS NOT NULL
  AND to_currency IS NOT NULL
  AND currency <> to_currency
  AND exchange_difference_currency IS NULL;
