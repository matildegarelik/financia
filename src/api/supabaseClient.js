import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const createEntityClient = (tableName) => ({
    list: async (sort, limit) => {
        let q = supabase.from(tableName).select('*');
        if (sort) {
            const ascending = !sort.startsWith('-');
            q = q.order(sort.replace(/^-/, ''), { ascending });
        }
        if (limit) q = q.limit(limit);
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    },
    create: async (data) => {
        const { data: row, error } = await supabase.from(tableName).insert(data).select().single();
        if (error) throw error;
        return row;
    },
    update: async (id, data) => {
        const { data: row, error } = await supabase.from(tableName).update(data).eq('id', id).select().single();
        if (error) throw error;
        return row;
    },
    delete: async (id) => {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
    },
});

export const entities = {
    Transaction: createEntityClient('transactions'),
    Account: createEntityClient('accounts'),
    Budget: createEntityClient('budgets'),
    Category: createEntityClient('categories'),
    Investment: createEntityClient('investments'),
    ExchangeRate: createEntityClient('exchange_rates'),
};
