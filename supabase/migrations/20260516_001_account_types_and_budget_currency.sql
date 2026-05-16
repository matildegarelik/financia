-- Migración: nuevos tipos de cuenta + moneda en presupuestos
-- Fecha: 2026-05-16
-- Correr en el SQL Editor de Supabase

-- 1. Actualizar constraint de tipos de cuenta
--    Agrega: debit_card (tarjeta de débito) y crypto (cuenta cripto)
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_type_check;
ALTER TABLE accounts ADD CONSTRAINT accounts_type_check
    CHECK (type IN ('checking', 'savings', 'credit_card', 'debit_card', 'cash', 'investment', 'crypto', 'other'));

-- 2. Agregar columna currency a budgets (si no existe)
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'MXN';
