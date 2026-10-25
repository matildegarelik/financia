-- Terceros/Deudas: registrar préstamos a otras personas o pagos hechos por cuenta de otra
-- persona, de forma que quede vinculada su devolución (sin inflar ingresos/gastos reales).

CREATE TABLE IF NOT EXISTS third_party_debts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    person_name text NOT NULL,
    direction text NOT NULL CHECK (direction IN ('me_deben', 'debo')),
    amount numeric NOT NULL CHECK (amount > 0),
    currency text NOT NULL DEFAULT 'ARS',
    origin_transaction_id uuid,
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS third_party_debts_user_person_idx
    ON third_party_debts (user_id, person_name);

ALTER TABLE third_party_debts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "third_party_debts: own rows" ON third_party_debts;
CREATE POLICY "third_party_debts: own rows" ON third_party_debts
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_user_id_third_party_debts ON third_party_debts;
CREATE TRIGGER set_user_id_third_party_debts
    BEFORE INSERT ON third_party_debts FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TABLE IF NOT EXISTS debt_settlements (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    debt_id uuid REFERENCES third_party_debts(id) ON DELETE CASCADE NOT NULL,
    transaction_id uuid,
    amount numeric NOT NULL CHECK (amount > 0),
    currency text NOT NULL DEFAULT 'ARS',
    date text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS debt_settlements_debt_idx
    ON debt_settlements (debt_id);

ALTER TABLE debt_settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "debt_settlements: own rows" ON debt_settlements;
CREATE POLICY "debt_settlements: own rows" ON debt_settlements
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_user_id_debt_settlements ON debt_settlements;
CREATE TRIGGER set_user_id_debt_settlements
    BEFORE INSERT ON debt_settlements FOR EACH ROW EXECUTE FUNCTION set_user_id();
