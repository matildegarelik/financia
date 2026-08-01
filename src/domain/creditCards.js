import { addDaysISO } from "@/lib/formatters";

function isoFromDate(date) {
    return date.toISOString().split("T")[0];
}

function dateFromMonthKey(monthKey, day = 1) {
    const [year, month] = monthKey.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
}

export function getMonthKey(dateStr) {
    return dateStr?.slice(0, 7) || "";
}

export function addMonthsToKey(monthKey, offset) {
    const d = dateFromMonthKey(monthKey);
    d.setMonth(d.getMonth() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getDefaultCloseDate(monthKey) {
    const [year, month] = monthKey.split("-").map(Number);
    const d = new Date(year, month, 0, 12);
    let thursdaysSeen = 0;

    while (d.getMonth() === month - 1) {
        if (d.getDay() === 4) {
            thursdaysSeen += 1;
            if (thursdaysSeen === 2) return isoFromDate(d);
        }
        d.setDate(d.getDate() - 1);
    }

    return isoFromDate(d);
}

export function getDefaultDueDate(monthKey) {
    const nextMonthKey = addMonthsToKey(monthKey, 1);
    const d = dateFromMonthKey(nextMonthKey);
    const day = d.getDay();
    const daysUntilMonday = (1 - day + 7) % 7;
    d.setDate(1 + daysUntilMonday);
    return isoFromDate(d);
}

export function getStatementMonthKey(statement) {
    return getMonthKey(statement?.close_date || statement?.period_end || statement?.due_date);
}

export function statementKey(statement) {
    return `${statement.account_id}:${getStatementMonthKey(statement)}`;
}

export function buildStatementsByMonth(statements, accountId) {
    const map = new Map();
    (statements || [])
        .filter((statement) => statement.account_id === accountId)
        .forEach((statement) => map.set(getStatementMonthKey(statement), statement));
    return map;
}

export function transactionMatchesStatement(tx, statement) {
    if (!tx || !statement) return false;
    if (statement.id && tx.credit_card_statement_id === statement.id) return true;
    const date = tx.date;
    return Boolean(
        tx.type === "expense" &&
        !tx.is_credit_card_payment &&
        tx.status !== "projected" &&
        date &&
        date >= statement.period_start &&
        date <= statement.period_end &&
        tx.account_id === statement.account_id
    );
}

export function getStatementTotal(statement, transactions) {
    return (transactions || [])
        .filter((tx) => transactionMatchesStatement(tx, statement))
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
}

export function buildCreditCardStatement(card, monthKey, transactions, statementsByMonth) {
    const persisted = statementsByMonth.get(monthKey);
    const previousMonthKey = addMonthsToKey(monthKey, -1);
    const previous = statementsByMonth.get(previousMonthKey);
    const closeDate = persisted?.close_date || persisted?.period_end || getDefaultCloseDate(monthKey);
    const previousCloseDate = previous?.close_date || previous?.period_end || getDefaultCloseDate(previousMonthKey);
    const draft = {
        id: persisted?.id,
        account_id: card.id,
        period_start: persisted?.period_start || addDaysISO(previousCloseDate, 1),
        period_end: persisted?.period_end || closeDate,
        close_date: closeDate,
        due_date: persisted?.due_date || getDefaultDueDate(monthKey),
        currency: persisted?.currency || card.currency || "ARS",
        notes: persisted?.notes || "",
        status: persisted?.status || "open",
        payment_account_id: persisted?.payment_account_id || null,
        payment_transaction_id: persisted?.payment_transaction_id || null,
    };

    return {
        ...draft,
        total_amount: getStatementTotal(draft, transactions),
        persisted_total_amount: persisted?.total_amount,
    };
}

export function getRelevantStatementMonths(card, transactions, { pastMonths = 1, futureMonths = 11, today } = {}) {
    const currentMonth = getMonthKey(today || new Date().toISOString().split("T")[0]);
    const firstMonth = addMonthsToKey(currentMonth, -pastMonths);
    const lastMonth = addMonthsToKey(currentMonth, futureMonths);
    const months = new Set();

    for (let i = -pastMonths; i <= futureMonths; i += 1) {
        months.add(addMonthsToKey(currentMonth, i));
    }

    (transactions || [])
        .filter((tx) =>
            tx.account_id === card.id &&
            tx.type === "expense" &&
            tx.status !== "projected" &&
            tx.date
        )
        .forEach((tx) => {
            const monthKey = getMonthKey(tx.date);
            if (monthKey >= firstMonth && monthKey <= lastMonth) months.add(monthKey);
        });

    return [...months].sort();
}
