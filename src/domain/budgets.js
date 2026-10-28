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

// Subcategorías que cubre el presupuesto de una categoría padre. Si una subcategoría tiene
// presupuesto propio ese mes, queda afuera del padre (funciona como "override") para no
// contar sus gastos dos veces. `budgets` son los demás presupuestos (se filtran por mes acá).
function getCoveredChildCategories(budget, categories = [], budgets = []) {
    const ownBudgetCategoryIds = new Set(
        budgets
            .filter((other) => other.id !== budget.id && other.month === budget.month && other.category_id)
            .map((other) => other.category_id)
    );
    return categories.filter((category) =>
        category.parent_category === budget.category_id && !ownBudgetCategoryIds.has(category.id)
    );
}

export function getMatchingCategoryIds(budget, categories = [], budgets = []) {
    if (!budget?.category_id) return null;
    const ids = new Set([budget.category_id]);
    getCoveredChildCategories(budget, categories, budgets).forEach((category) => ids.add(category.id));
    return ids;
}

export function getChildCategoryCount(budget, categories = [], budgets = []) {
    if (!budget?.category_id) return 0;
    return getCoveredChildCategories(budget, categories, budgets).length;
}

// Ya existe otro presupuesto para esta misma categoría en este mes (duplicado exacto).
export function findDuplicateBudget(candidate, budgets = []) {
    if (!candidate?.category_id) return null;
    return budgets.find((other) =>
        other.id !== candidate.id &&
        other.month === candidate.month &&
        other.category_id === candidate.category_id
    ) || null;
}

export function transactionMatchesBudgetCategory(tx, budget, categories = [], budgets = []) {
    const matchingIds = getMatchingCategoryIds(budget, categories, budgets);
    if (matchingIds && tx.category_id && matchingIds.has(tx.category_id)) return true;
    if (!matchingIds && budget.category_name && tx.category_name === budget.category_name) return true;
    return false;
}

// `budgets`: todos los presupuestos del mes, para aplicar el override padre/subcategoría.
export function transactionMatchesBudget(tx, budget, { categories = [], budgets = [], from, to, context = {}, today, includeFuture = false } = {}) {
    const budgetType = getBudgetType(budget, categories);
    if (budgetType === "income" ? !isRegularIncome(tx) : !isRegularExpense(tx)) return false;
    if (tx.status === "projected") return false;
    if (!transactionMatchesReportPeriod(tx, { from, to, context, today, includeFuture })) return false;
    return transactionMatchesBudgetCategory(tx, budget, categories, budgets);
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
        const spent = sumConvertedBudgetProgress(expenseBudgets, transactions, { categories, budgets: monthBudgets, from, to, context, convert, includeFuture: true });
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
        const monthBudgets = getMonthBudgets(allBudgets, monthKey);
        const { expenseBudgets } = splitBudgetsByType(monthBudgets, categories);
        expenseBudgets.forEach((budget) => {
            const spent = getBudgetProgress(budget, transactions, { categories, budgets: monthBudgets, from, to, context, convert, includeFuture: true });
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
