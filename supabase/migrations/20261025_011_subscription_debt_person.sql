-- Permite marcar una suscripción como un pago recurrente a/para un tercero: cada cobro
-- materializado queda `reporting_mode: 'neutral'` (no afecta presupuesto/proyectado propios)
-- y genera automáticamente una deuda en third_party_debts, igual que un préstamo puntual.
ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS debt_person_name text;
