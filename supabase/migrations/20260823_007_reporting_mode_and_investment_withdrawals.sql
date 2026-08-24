-- Clasificacion general para controlar si un movimiento impacta reportes.
ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS reporting_mode text NOT NULL DEFAULT 'normal';

ALTER TABLE transactions
    DROP CONSTRAINT IF EXISTS transactions_reporting_mode_check;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_reporting_mode_check
    CHECK (reporting_mode IN ('normal', 'neutral', 'investment', 'credit_card_payment', 'exchange_difference'));

UPDATE transactions
SET reporting_mode = 'investment'
WHERE is_investment_transfer = true
  AND (reporting_mode IS NULL OR reporting_mode = 'normal');

UPDATE transactions
SET reporting_mode = 'credit_card_payment'
WHERE is_credit_card_payment = true
  AND (reporting_mode IS NULL OR reporting_mode = 'normal');

ALTER TABLE investments
    ADD COLUMN IF NOT EXISTS withdrawn_amount numeric DEFAULT 0;
