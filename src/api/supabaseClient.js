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
            q = q.order("created_at", { ascending: false });
        }
        if (limit) q = q.limit(limit);
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    },
    listPaginated: async (applyFilters, page = 1, pageSize = 50) => {
        let q = supabase.from(tableName).select('*', { count: 'exact' });
        if (applyFilters) q = applyFilters(q);
        const from = (page - 1) * pageSize;
        q = q.range(from, from + pageSize - 1);
        const { data, error, count } = await q;
        if (error) throw error;
        return { data: data || [], count: count ?? 0 };
    },
    listForSubtotal: async (applyFilters) => {
        let q = supabase.from(tableName).select('type,amount,currency,reporting_mode,is_investment_transfer,is_credit_card_payment');
        if (applyFilters) q = applyFilters(q);
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
    CreditCardStatement: createEntityClient('credit_card_statements'),
};
