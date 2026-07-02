-- Credit cards: statement metadata and payment tracking
ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS statement_close_day integer,
    ADD COLUMN IF NOT EXISTS statement_due_day integer,
    ADD COLUMN IF NOT EXISTS default_payment_account_id uuid,
    ADD COLUMN IF NOT EXISTS credit_limit numeric;

ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS credit_card_statement_id uuid,
    ADD COLUMN IF NOT EXISTS purchase_date text,
    ADD COLUMN IF NOT EXISTS installment_group_id text,
    ADD COLUMN IF NOT EXISTS is_credit_card_payment boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS credit_card_statements (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id uuid NOT NULL,
    period_start text NOT NULL,
    period_end text NOT NULL,
    close_date text NOT NULL,
    due_date text NOT NULL,
    total_amount numeric NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'ARS',
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paid')),
    payment_account_id uuid,
    payment_transaction_id uuid,
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS credit_card_statements_user_account_period_idx
    ON credit_card_statements (user_id, account_id, period_start, period_end);

ALTER TABLE credit_card_statements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credit_card_statements: own rows" ON credit_card_statements;
CREATE POLICY "credit_card_statements: own rows" ON credit_card_statements
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_user_id_credit_card_statements ON credit_card_statements;
CREATE TRIGGER set_user_id_credit_card_statements
    BEFORE INSERT ON credit_card_statements FOR EACH ROW EXECUTE FUNCTION set_user_id();
