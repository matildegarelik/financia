-- Suscripciones: igual que cuotas/recurrentes, pero sin cantidad total fija y pausable.

CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0),
    currency text NOT NULL DEFAULT 'ARS',
    category_id uuid,
    account_id uuid,
    frequency text NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'yearly')),
    next_charge_date text NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_status_idx
    ON subscriptions (user_id, status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions: own rows" ON subscriptions;
CREATE POLICY "subscriptions: own rows" ON subscriptions
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_user_id_subscriptions ON subscriptions;
CREATE TRIGGER set_user_id_subscriptions
    BEFORE INSERT ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_user_id();

ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS subscription_id uuid;
