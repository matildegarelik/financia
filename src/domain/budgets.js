import { isRegularExpense, isRegularIncome } from "@/lib/formatters";
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
    return transactions
        .filter((tx) => transactionMatchesBudget(tx, budget, options))
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
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
