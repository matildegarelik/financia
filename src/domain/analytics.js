import {
    filterReportTransactions,
    getReportDate,
    groupExpensesByCategory,
    groupIncomeExpenseByPeriod,
} from "@/domain/reporting";
import {
    getMonthBudgets,
    splitBudgetsByType,
    sumConvertedBudgetAmounts,
    transactionMatchesBudget,
} from "@/domain/budgets";
import { addMonthsToKey } from "@/domain/creditCards";
import { isRegularExpense, isRegularIncome } from "@/lib/formatters";

export function daysInMonth(monthKey) {
    const [year, month] = monthKey.split("-").map(Number);
    return new Date(year, month, 0).getDate();
}

function monthEnd(monthKey) {
    return `${monthKey}-${String(daysInMonth(monthKey)).padStart(2, "0")}`;
}

// Todos los meses entre dos claves "yyyy-MM", inclusive.
export function monthKeysBetween(fromKey, toKey) {
    const keys = [];
    for (let key = fromKey; key <= toKey && keys.length < 240; key = addMonthsToKey(key, 1)) keys.push(key);
    return keys;
}

// Ejes de gráficos: 350, 1,2k, 15k, 1,5M (redondear a miles dejaba todo en "0k"
// cuando los montos son chicos, ej. en USD).
export function formatCompactNumber(value) {
    const abs = Math.abs(value);
    const fmt = (n) => n.toLocaleString("es-AR", { maximumFractionDigits: 1 });
    if (abs >= 1_000_000) return `${fmt(value / 1_000_000)}M`;
    if (abs >= 1_000) return `${fmt(value / 1_000)}k`;
    return fmt(Math.round(value));
}

// Ingresos, gastos y ahorro neto por mes, con 0 en los meses sin movimientos.
export function getMonthlyIncomeExpense(transactions = [], { from, to, context = {}, convert = (a) => a } = {}) {
    const txs = filterReportTransactions(transactions, { from, to, context });
    const byMonth = groupIncomeExpenseByPeriod(txs, { context, convert });
    return monthKeysBetween(from.slice(0, 7), to.slice(0, 7)).map((monthKey) => {
        const totals = byMonth[monthKey] || { income: 0, expense: 0 };
        return {
            monthKey,
            income: Math.round(totals.income),
            expense: Math.round(totals.expense),
            saving: Math.round(totals.income - totals.expense),
        };
    });
}

// Ids de una categoría y sus subcategorías.
function withChildren(categoryId, categories = []) {
    return new Set([categoryId, ...categories.filter((c) => c.parent_category === categoryId).map((c) => c.id)]);
}

// Las N categorías padre con más gasto en el rango (sugerencia inicial para la evolución).
export function getTopParentExpenseCategoryIds(transactions = [], { from, to, context = {}, convert = (a) => a, categories = [], limit = 3 } = {}) {
    const parentOf = new Map(categories.map((c) => [c.id, c.parent_category || c.id]));
    const totals = {};
    filterReportTransactions(transactions, { from, to, context })
        .filter((tx) => isRegularExpense(tx) && tx.category_id && parentOf.has(tx.category_id))
        .forEach((tx) => {
            const parentId = parentOf.get(tx.category_id);
            totals[parentId] = (totals[parentId] || 0) + convert(tx.amount || 0, tx.currency || "ARS");
        });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
}

// Monto por mes de cada categoría elegida (incluye sus subcategorías). Para categorías
// de ingreso suma ingresos; para las de gasto, gastos.
export function getCategoryMonthlyTrend(transactions = [], { from, to, context = {}, convert = (a) => a, categories = [], categoryIds = [] } = {}) {
    const txs = filterReportTransactions(transactions, { from, to, context });
    const series = categoryIds.map((id) => {
        const category = categories.find((c) => c.id === id);
        const ids = withChildren(id, categories);
        const isIncome = category?.type === "income";
        const byMonth = {};
        txs.filter((tx) => ids.has(tx.category_id) && (isIncome ? isRegularIncome(tx) : isRegularExpense(tx)))
            .forEach((tx) => {
                const key = getReportDate(tx, context).slice(0, 7);
                byMonth[key] = (byMonth[key] || 0) + convert(tx.amount || 0, tx.currency || "ARS");
            });
        return { id, byMonth };
    });
    return monthKeysBetween(from.slice(0, 7), to.slice(0, 7)).map((monthKey) => {
        const row = { monthKey };
        series.forEach(({ id, byMonth }) => { row[id] = Math.round(byMonth[monthKey] || 0); });
        return row;
    });
}

// Gasto de un mes contra el anterior, total y por categoría. Si el mes está en curso
// (`to` antes de fin de mes), se compara contra el mismo tramo de días del mes anterior,
// para no comparar medio mes contra un mes entero.
export function getMonthOverMonthComparison(transactions = [], { monthKey, to, context = {}, convert = (a) => a, filter = () => true, limit = 5 } = {}) {
    const currentTo = to && to < monthEnd(monthKey) ? to : monthEnd(monthKey);
    const isPartial = currentTo < monthEnd(monthKey);
    const prevKey = addMonthsToKey(monthKey, -1);
    const cutoffDay = Math.min(Number(currentTo.slice(8, 10)), daysInMonth(prevKey));
    const prevTo = isPartial ? `${prevKey}-${String(cutoffDay).padStart(2, "0")}` : monthEnd(prevKey);

    const expensesByCategory = (from, until) => groupExpensesByCategory(
        filterReportTransactions(transactions, { from, to: until, context }).filter(filter),
        convert,
        { includeTransferDifferences: true }
    );
    const current = expensesByCategory(`${monthKey}-01`, currentTo);
    const previous = expensesByCategory(`${prevKey}-01`, prevTo);

    const sum = (map) => Object.values(map).reduce((s, v) => s + v, 0);
    const currentTotal = sum(current);
    const prevTotal = sum(previous);

    const changes = [...new Set([...Object.keys(current), ...Object.keys(previous)])]
        .map((category) => {
            const now = current[category] || 0;
            const before = previous[category] || 0;
            return { category, current: now, previous: before, diff: now - before };
        })
        .filter((c) => Math.round(c.diff) !== 0)
        .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
        .slice(0, limit);

    return {
        prevKey,
        isPartial,
        cutoffDay,
        currentTotal,
        prevTotal,
        pctChange: prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : null,
        changes,
    };
}

// Ritmo de gasto: acumulado real día a día de lo gastado en categorías con presupuesto,
// contra el presupuesto total repartido parejo en el mes. Suma transacciones (no
// presupuestos), así que un gasto cubierto por dos presupuestos no se cuenta dos veces.
// Devuelve null si el mes no tiene presupuestos de gasto.
export function getSpendingPace(transactions = [], budgets = [], { monthKey, categories = [], context = {}, convert = (a) => a, today } = {}) {
    const monthBudgets = getMonthBudgets(budgets, monthKey);
    const { expenseBudgets } = splitBudgetsByType(monthBudgets, categories);
    if (expenseBudgets.length === 0) return null;

    const totalDays = daysInMonth(monthKey);
    const from = `${monthKey}-01`;
    const to = monthEnd(monthKey);
    const budgetTotal = sumConvertedBudgetAmounts(expenseBudgets, convert);

    const spentByDay = {};
    transactions.forEach((tx) => {
        const matches = expenseBudgets.some((budget) =>
            transactionMatchesBudget(tx, budget, { categories, budgets: monthBudgets, from, to, context, includeFuture: true })
        );
        if (!matches) return;
        const day = Number(getReportDate(tx, context).slice(8, 10));
        spentByDay[day] = (spentByDay[day] || 0) + convert(tx.amount || 0, tx.currency || "ARS");
    });

    let running = 0;
    const days = [];
    for (let day = 1; day <= totalDays; day++) {
        running += spentByDay[day] || 0;
        const date = `${monthKey}-${String(day).padStart(2, "0")}`;
        days.push({
            day,
            actual: today && date > today ? null : Math.round(running),
            ideal: Math.round((budgetTotal * day) / totalDays),
        });
    }

    // Último día con dato real (hoy si el mes está en curso, fin de mes si ya pasó).
    const lastReal = [...days].reverse().find((d) => d.actual !== null);
    return {
        days,
        budgetTotal,
        spentSoFar: lastReal?.actual ?? 0,
        expectedSoFar: lastReal?.ideal ?? 0,
        lastDay: lastReal?.day ?? 0,
        totalDays,
    };
}
