-- FinanzApp - Schema Supabase
-- Correr en el SQL Editor de tu proyecto Supabase

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLAS
-- ============================================================

create table accounts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    type text not null check (type in ('checking', 'savings', 'credit_card', 'debit_card', 'cash', 'investment', 'crypto', 'other')),
    currency text not null default 'MXN',
    balance numeric default 0,
    color text,
    icon text,
    is_active boolean default true,
    created_at timestamptz default now()
);

create table categories (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    type text not null check (type in ('income', 'expense')),
    icon text,
    color text,
    parent_category text,
    created_at timestamptz default now()
);

create table transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    date text not null,
    type text not null check (type in ('income', 'expense', 'transfer')),
    status text not null default 'confirmed' check (status in ('confirmed', 'installment', 'projected')),
    amount numeric not null,
    currency text not null default 'MXN',
    description text,
    account_id uuid,
    account_name text,
    to_account_id uuid,
    to_account_name text,
    category_id uuid,
    category_name text,
    notes text,
    is_recurring boolean default false,
    recurring_frequency text,
    installment_total integer,
    installment_current integer,
    project_name text,
    client_name text,
    probability numeric,
    due_date text,
    created_at timestamptz default now()
);

create table budgets (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    category_id uuid,
    category_name text,
    amount numeric not null,
    spent numeric default 0,
    currency text not null default 'MXN',
    period text default 'monthly' check (period in ('weekly', 'monthly', 'yearly')),
    month text,
    color text,
    created_at timestamptz default now()
);

create table investments (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    type text not null check (type in ('stocks', 'bonds', 'crypto', 'real_estate', 'mutual_fund', 'etf', 'cetes', 'other')),
    account_id uuid,
    platform text,
    amount_invested numeric not null,
    current_value numeric,
    currency text not null default 'MXN',
    purchase_date text,
    notes text,
    is_active boolean default true,
    created_at timestamptz default now()
);

create table exchange_rates (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    from_currency text not null,
    to_currency text not null,
    rate numeric not null,
    updated_at text,
    created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table investments enable row level security;
alter table exchange_rates enable row level security;

-- Políticas: cada usuario solo ve y modifica sus propios registros
create policy "accounts: own rows" on accounts
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "categories: own rows" on categories
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "transactions: own rows" on transactions
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "budgets: own rows" on budgets
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "investments: own rows" on investments
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "exchange_rates: own rows" on exchange_rates
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-poblar user_id en INSERT
-- ============================================================

create or replace function set_user_id()
returns trigger as $$
begin
    new.user_id := auth.uid();
    return new;
end;
$$ language plpgsql security definer;

create trigger set_user_id_accounts
    before insert on accounts for each row execute function set_user_id();

create trigger set_user_id_categories
    before insert on categories for each row execute function set_user_id();

create trigger set_user_id_transactions
    before insert on transactions for each row execute function set_user_id();

create trigger set_user_id_budgets
    before insert on budgets for each row execute function set_user_id();

create trigger set_user_id_investments
    before insert on investments for each row execute function set_user_id();

create trigger set_user_id_exchange_rates
    before insert on exchange_rates for each row execute function set_user_id();
