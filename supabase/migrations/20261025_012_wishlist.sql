-- Wishlist: lista simple de cosas que la usuaria quiere comprar, sin relación con
-- cuentas/transacciones/categorías del resto de la app (categoría acá es texto libre).

CREATE TABLE IF NOT EXISTS wishlist_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    category text,
    price numeric,
    currency text NOT NULL DEFAULT 'ARS',
    is_purchased boolean NOT NULL DEFAULT false,
    purchased_at text,
    notes text,
    sort_order integer,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wishlist_items_user_purchased_idx
    ON wishlist_items (user_id, is_purchased);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlist_items: own rows" ON wishlist_items;
CREATE POLICY "wishlist_items: own rows" ON wishlist_items
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_user_id_wishlist_items ON wishlist_items;
CREATE TRIGGER set_user_id_wishlist_items
    BEFORE INSERT ON wishlist_items FOR EACH ROW EXECUTE FUNCTION set_user_id();
