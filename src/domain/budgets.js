import { getReportingDate, isRegularExpense, isRegularIncome } from "@/lib/formatters";
import { transactionMatchesReportPeriod } from "@/domain/reporting";

export function getMonthBudgets(budgets = [], monthKey) {
    return budgets.filter((budget) => budget.month === monthKey);
}

export function getBudgetCategory(budget, categories = []) {
    return categories.find((category) => category.id === budget.category_id) || null;
}

export function getBudgetType(budget, categories = []) {
    return getBudgetCategory(budget, categories)?.type === "income" ? "income" : "expense";
}

export function splitBudgetsByType(budgets = [], categories = []) {
    return {
        incomeBudgets: budgets.filter((budget) => getBudgetType(budget, categories) === "income"),
        expenseBudgets: budgets.filter((budget) => getBudgetType(budget, categories) === "expense"),
    };
}

export function getMatchingCategoryIds(budget, categories = []) {
    if (!budget?.category_id) return null;
    const ids = new Set([budget.category_id]);
    categories.forEach((category) => {
        if (category.parent_category === budget.category_id) ids.add(category.id);
    });
    return ids;
}

export function getChildCategoryCount(budget, categories = []) {
    if (!budget?.category_id) return 0;
    return categories.filter((category) => category.parent_category === budget.category_id).length;
}

export function transactionMatchesBudgetCategory(tx, budget, categories = []) {
    const matchingIds = getMatchingCategoryIds(budget, categories);
    if (matchingIds && tx.category_id && matchingIds.has(tx.category_id)) return true;
    if (!matchingIds && budget.category_name && tx.category_name === budget.category_name) return true;
    return false;
}

export function transactionMatchesBudget(tx, budget, { categories = [], from, to, context = {}, today, includeFuture = false } = {}) {
    const budgetType = getBudgetType(budget, categories);
    if (budgetType === "income" ? !isRegularIncome(tx) : !isRegularExpense(tx)) return false;
    if (tx.status === "projected") return false;
    if (!transactionMatchesReportPeriod(tx, { from, to, context, today, includeFuture })) return false;
    return transactionMatchesBudgetCategory(tx, budget, categories);
}

export function getBudgetProgress(budget, transactions = [], options = {}) {
    const convert = options.convert || ((amount) => amount);
    return transactions
        .filter((tx) => transactionMatchesBudget(tx, budget, options))
        .reduce((sum, tx) => sum + convert(tx.amount || 0, tx.currency || "ARS", budget.currency || "ARS"), 0);
}

export function sumConvertedBudgetAmounts(budgets = [], convert = (amount) => amount) {
    return budgets.reduce((sum, budget) => sum + convert(budget.amount || 0, budget.currency || "ARS"), 0);
}

export function sumConvertedBudgetProgress(budgets = [], transactions = [], options = {}) {
    const convert = options.convert || ((amount) => amount);
    return budgets.reduce((sum, budget) =>
        sum + convert(getBudgetProgress(budget, transactions, options), budget.currency || "ARS"),
        0
    );
}

function monthRange(monthKey) {
    const [year, month] = monthKey.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return { from: `${monthKey}-01`, to: `${monthKey}-${String(lastDay).padStart(2, "0")}` };
}

// Presupuestado vs. gastado real por mes, para una lista de meses (más vieja a más nueva).
// Reutiliza getBudgetProgress/sumConvertedBudgetAmounts — ningún cálculo nuevo, solo se
// itera sobre meses pasados en vez de uno solo.
export function getMonthlyBudgetCompliance(allBudgets = [], transactions = [], {
    categories = [],
    context = {},
    convert = (amount) => amount,
    months = [],
} = {}) {
    return months.map((monthKey) => {
        const { from, to } = monthRange(monthKey);
        const monthBudgets = getMonthBudgets(allBudgets, monthKey);
        const { expenseBudgets } = splitBudgetsByType(monthBudgets, categories);
        const budgeted = sumConvertedBudgetAmounts(expenseBudgets, convert);
        const spent = sumConvertedBudgetProgress(expenseBudgets, transactions, { categories, from, to, context, convert, includeFuture: true });
        return {
            monthKey,
            budgeted,
            spent,
            pct: budgeted > 0 ? (spent / budgeted) * 100 : null,
            hasBudgets: expenseBudgets.length > 0,
        };
    });
}

// Qué categorías se excedieron más seguido a lo largo de esos meses — candidatas a
// resubir el presupuesto (o a revisar el gasto). Comparación en la divisa del presupuesto,
// no hace falta convertir a divisa de display porque es solo gastado > presupuestado.
export function getCategoryOverBudgetFrequency(allBudgets = [], transactions = [], {
    categories = [],
    context = {},
    convert = (amount) => amount,
    months = [],
} = {}) {
    const stats = new Map();
    months.forEach((monthKey) => {
        const { from, to } = monthRange(monthKey);
        const { expenseBudgets } = splitBudgetsByType(getMonthBudgets(allBudgets, monthKey), categories);
        expenseBudgets.forEach((budget) => {
            const spent = getBudgetProgress(budget, transactions, { categories, from, to, context, convert, includeFuture: true });
            const key = budget.category_name || "Sin categoría";
            const entry = stats.get(key) || { category_name: key, monthsWithBudget: 0, overMonths: 0 };
            entry.monthsWithBudget += 1;
            if (spent > (Number(budget.amount) || 0)) entry.overMonths += 1;
            stats.set(key, entry);
        });
    });
    return [...stats.values()]
        .filter((s) => s.overMonths > 0)
        .map((s) => ({ ...s, overRate: s.overMonths / s.monthsWithBudget }))
        .sort((a, b) => b.overRate - a.overRate || b.overMonths - a.overMonths);
}

export function getUnplannedExpenses(transactions = [], budgets = [], {
    categories = [],
    from,
    to,
    context = {},
    includeFuture = true,
} = {}) {
    const { expenseBudgets } = splitBudgetsByType(budgets, categories);
    return transactions
        .filter((tx) => {
            if (!isRegularExpense(tx) || (tx.status !== "confirmed" && tx.status !== "installment")) return false;
            if (!transactionMatchesReportPeriod(tx, { from, to, context, includeFuture })) return false;

            const coveredByBudget = expenseBudgets.some((budget) =>
                transactionMatchesBudget(tx, budget, { categories, from, to, context, includeFuture })
            );
            if (coveredByBudget) return false;

            // Keep every real expense outside the budget visible. A projection
            // should not hide the actual movement from the deviation detail.
            return true;
        })
        .sort((a, b) => {
            const aDate = getReportingDate(a, context) || a.date || "";
            const bDate = getReportingDate(b, context) || b.date || "";
            return bDate.localeCompare(aDate);
        });
}
