-- Sort order and favorites for accounts and categories
ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS sort_order integer,
    ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS sort_order integer,
    ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;
