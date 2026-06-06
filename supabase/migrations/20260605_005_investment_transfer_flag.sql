ALTER TABLE transactions
  ADD COLUMN is_investment_transfer boolean NOT NULL DEFAULT false;

UPDATE transactions
SET is_investment_transfer = true
WHERE type = 'expense'
  AND category_name = 'Inversión'
  AND category_id IS NULL;
