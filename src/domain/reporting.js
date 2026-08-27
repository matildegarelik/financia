import {
    affectsReports,
    getReportingDate,
    getTransferDifference,
    isRegularExpense,
    isRegularIncome,
    TODAY,
} from "@/lib/formatters";

export function getMonthKey(dateStr) {
    return dateStr?.slice(0, 7) || "";
}

export function getReportDate(tx, context = {}) {
    return getReportingDate(tx, context);
}

export function isConfirmedForReports(tx) {
    return tx?.status === "confirmed" || tx?.status === "installment";
}

export function transactionMatchesReportPeriod(tx, { from, to, today = TODAY, context = {}, includeFuture = false } = {}) {
    const reportingDate = getReportDate(tx, context);
    if (!reportingDate) return false;
    if (!includeFuture && reportingDate > today) return false;
    if (from && reportingDate < from) return false;
    if (to && reportingDate > to) return false;
    return true;
}

export function filterReportTransactions(transactions = [], options = {}) {
    return transactions.filter((tx) =>
        isConfirmedForReports(tx) &&
        transactionMatchesReportPeriod(tx, options)
    );
}

export function transactionMatchesReportType(tx, type, convert = (amount) => amount) {
    if (type === "income") {
        return isRegularIncome(tx) || (tx.type === "transfer" && affectsReports(tx) && getTransferDifference(tx, convert) > 0);
    }
    if (type === "expense") {
        return isRegularExpense(tx) || (tx.type === "transfer" && affectsReports(tx) && getTransferDifference(tx, convert) < 0);
    }
    return true;
}

export function sumIncomeExpense(transactions = [], convert = (amount) => amount) {
    return transactions.reduce((totals, tx) => {
        if (isRegularIncome(tx)) {
            totals.income += convert(tx.amount || 0, tx.currency || "ARS");
        } else if (isRegularExpense(tx)) {
            totals.expense += convert(tx.amount || 0, tx.currency || "ARS");
        } else if (tx.type === "transfer" && affectsReports(tx)) {
            const diff = getTransferDifference(tx, convert);
            if (diff > 0) totals.income += diff;
            if (diff < 0) totals.expense += Math.abs(diff);
        }
        totals.net = totals.income - totals.expense;
        return totals;
    }, { income: 0, expense: 0, net: 0 });
}

export function groupIncomeExpenseByPeriod(transactions = [], { context = {}, convert = (amount) => amount, getKey } = {}) {
    const byPeriod = {};
    transactions.forEach((tx) => {
        const reportingDate = getReportDate(tx, context);
        const key = getKey ? getKey(reportingDate, tx) : getMonthKey(reportingDate);
        if (!key) return;
        if (!byPeriod[key]) byPeriod[key] = { income: 0, expense: 0 };
        const totals = sumIncomeExpense([tx], convert);
        byPeriod[key].income += totals.income;
        byPeriod[key].expense += totals.expense;
    });
    return byPeriod;
}

export function groupExpensesByCategory(transactions = [], convert = (amount) => amount, { includeTransferDifferences = false } = {}) {
    const map = {};
    transactions.filter(isRegularExpense).forEach((tx) => {
        const key = tx.category_name || "Sin categoria";
        map[key] = (map[key] || 0) + convert(tx.amount || 0, tx.currency || "ARS");
    });
    if (includeTransferDifferences) {
        transactions
            .filter((tx) => tx.type === "transfer" && affectsReports(tx))
            .forEach((tx) => {
                const diff = getTransferDifference(tx, convert);
                if (diff < 0) map["Diferencia de transferencia"] = (map["Diferencia de transferencia"] || 0) + Math.abs(diff);
            });
    }
    return map;
}

export function getTopExpenseCategories(transactions = [], convert = (amount) => amount, { limit = 8, includeTransferDifferences = false } = {}) {
    return Object.entries(groupExpensesByCategory(transactions, convert, { includeTransferDifferences }))
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
}

export function getTopExpenseDescriptions(transactions = [], convert = (amount) => amount, { limit = 6 } = {}) {
    const map = {};
    transactions.filter(isRegularExpense).forEach((tx) => {
        const key = (tx.description || "Sin descripcion").trim();
        map[key] = (map[key] || 0) + convert(tx.amount || 0, tx.currency || "ARS");
    });
    transactions
        .filter((tx) => tx.type === "transfer" && affectsReports(tx))
        .forEach((tx) => {
            const diff = getTransferDifference(tx, convert);
            if (diff < 0) {
                const key = tx.description ? `Dif. transferencia: ${tx.description}` : "Diferencia de transferencia";
                map[key] = (map[key] || 0) + Math.abs(diff);
            }
        });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export function getPaymentMethodData(transactions = [], accounts = [], convert = (amount) => amount) {
    const cardAccountIds = new Set(accounts.filter((account) => account.type === "credit_card").map((account) => account.id));
    const totals = { card: 0, other: 0 };
    transactions.filter(isRegularExpense).forEach((tx) => {
        const amount = convert(tx.amount || 0, tx.currency || "ARS");
        if (cardAccountIds.has(tx.account_id)) totals.card += amount;
        else totals.other += amount;
    });
    return [
        { name: "Tarjeta", value: Math.round(totals.card), color: "hsl(199, 89%, 48%)" },
        { name: "Otros medios", value: Math.round(totals.other), color: "hsl(160, 84%, 28%)" },
    ].filter((item) => item.value > 0);
}

export function groupAmountsByCurrency(items = []) {
    return items.reduce((acc, item) => {
        const currency = item.currency || "ARS";
        acc[currency] = (acc[currency] || 0) + (item.amount || 0);
        return acc;
    }, {});
}
