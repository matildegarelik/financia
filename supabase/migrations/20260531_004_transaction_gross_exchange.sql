-- Soporte para monto bruto/neto y cambios de moneda en transferencias
ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS amount_gross numeric DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS to_amount numeric DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS to_currency text DEFAULT NULL;

-- Permitir date NULL (para registros históricos sin fecha exacta)
ALTER TABLE transactions
    ALTER COLUMN date DROP NOT NULL;

-- Arreglar trigger para que respete user_id explícito cuando auth.uid() es NULL
-- (necesario para importar desde SQL Editor de Supabase)
-- Prioridad: user_id explícito > auth.uid() > user_id hardcodeado del dueño
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id := COALESCE(NEW.user_id, auth.uid(), '0e3bf7be-6abd-4da1-80ad-8f9032be6385'::uuid);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
