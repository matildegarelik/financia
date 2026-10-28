import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ReferenceLine } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, getCurrentMonth, getMonthLabel, TODAY, isRegularExpense, getTransferDifference, affectsReports } from "@/lib/formatters";
import { filterReportTransactions, getPaymentMethodData, getTopExpenseCategories } from "@/domain/reporting";
import { getCategoryOverBudgetFrequency, getMonthlyBudgetCompliance } from "@/domain/budgets";
import {
    daysInMonth,
    formatCompactNumber,
    getCategoryMonthlyTrend,
    getMonthlyIncomeExpense,
    getMonthOverMonthComparison,
    getSpendingPace,
    getTopParentExpenseCategoryIds,
    monthKeysBetween,
} from "@/domain/analytics";
import { buildCategoryTree } from "@/domain/categories";
import { addMonthsToKey } from "@/domain/creditCards";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const GREEN = "hsl(160, 84%, 28%)";
const RED = "hsl(0, 72%, 51%)";
const BLUE = "hsl(199, 89%, 48%)";
const TREND_COLORS = [BLUE, "hsl(262, 60%, 55%)", "hsl(35, 90%, 50%)", "hsl(330, 70%, 50%)", GREEN, "hsl(190, 70%, 35%)"];

// Rango de fechas de una lista de meses: del 1° del primero al último día del último
// (o hasta hoy, si el último es el mes en curso).
function rangeFromMonths(fromKey, toKey) {
    const end = `${toKey}-${String(daysInMonth(toKey)).padStart(2, "0")}`;
    return { from: `${fromKey}-01`, to: end > TODAY ? TODAY : end };
}

function getPeriodMonths(preset, customFrom, customTo) {
    const current = getCurrentMonth();
    const year = Number(current.slice(0, 4));
    switch (preset) {
        case "last_3_months": return [addMonthsToKey(current, -2), current];
        case "last_12_months": return [addMonthsToKey(current, -11), current];
        case "current_year": return [`${year}-01`, current];
        case "previous_year": return [`${year - 1}-01`, `${year - 1}-12`];
        case "custom": return customFrom && customTo && customFrom <= customTo ? [customFrom, customTo] : [addMonthsToKey(current, -5), current];
        case "last_6_months":
        default: return [addMonthsToKey(current, -5), current];
    }
}

const axisMoney = { tick: { fontSize: 11 }, tickFormatter: formatCompactNumber, width: 48 };

export default function Analytics() {
    const currentMonth = getCurrentMonth();
    const [mode, setMode] = useState("month");
    const [monthKey, setMonthKey] = useState(currentMonth);
    const [periodPreset, setPeriodPreset] = useState("last_6_months");
    const [customFrom, setCustomFrom] = useState(addMonthsToKey(currentMonth, -5));
    const [customTo, setCustomTo] = useState(currentMonth);
    const { displayCurrency, convert } = useCurrency();

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date"),
    });
    const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => base44.entities.Category.list() });
    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
    const { data: statements = [] } = useQuery({ queryKey: ["credit_card_statements"], queryFn: () => base44.entities.CreditCardStatement.list() });
    const { data: budgets = [] } = useQuery({ queryKey: ["budgets"], queryFn: () => base44.entities.Budget.list() });

    const context = useMemo(() => ({ accounts, statements }), [accounts, statements]);

    // Todo lo que se muestra sale de este rango: un mes, o los meses del período.
    const [fromKey, toKey] = mode === "month" ? [monthKey, monthKey] : getPeriodMonths(periodPreset, customFrom, customTo);
    const { from, to } = rangeFromMonths(fromKey, toKey);
    const monthKeys = useMemo(() => monthKeysBetween(fromKey, toKey), [fromKey, toKey]);

    const rangeTransactions = useMemo(
        () => filterReportTransactions(transactions, { from, to, today: TODAY, context }),
        [transactions, from, to, context]
    );

    const monthly = useMemo(
        () => getMonthlyIncomeExpense(transactions, { from, to, context, convert })
            .map((m) => ({ ...m, month: getMonthLabel(m.monthKey) })),
        [transactions, from, to, context, convert]
    );
    const totals = monthly.reduce((acc, m) => ({
        income: acc.income + m.income, expense: acc.expense + m.expense, saving: acc.saving + m.saving,
    }), { income: 0, expense: 0, saving: 0 });
    const divisor = mode === "month" ? 1 : Math.max(monthly.length, 1);

    const topCategories = useMemo(
        () => getTopExpenseCategories(rangeTransactions, convert, { limit: 8, includeTransferDifferences: true }),
        [rangeTransactions, convert]
    );
    const paymentMethodData = useMemo(() => getPaymentMethodData(rangeTransactions, accounts, convert), [rangeTransactions, accounts, convert]);
    const topDescriptions = useMemo(() => getTopDescriptions(rangeTransactions, convert), [rangeTransactions, convert]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <PageHeader title="Estadísticas" description="Un mes en detalle, o la evolución a lo largo de un período" action={<CurrencySelector />} />

            <Card>
                <CardContent className="p-3 sm:p-4 space-y-3">
                    <Tabs value={mode} onValueChange={setMode}>
                        <TabsList className="grid grid-cols-2 w-full sm:w-64">
                            <TabsTrigger value="month">Mes</TabsTrigger>
                            <TabsTrigger value="period">Período</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {mode === "month" ? (
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" size="icon" onClick={() => setMonthKey(addMonthsToKey(monthKey, -1))}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-center">
                                <p className="font-semibold capitalize">{getMonthLabel(monthKey)}</p>
                                {monthKey === currentMonth && <Badge variant="secondary" className="text-xs mt-0.5">Mes en curso</Badge>}
                            </div>
                            <Button variant="ghost" size="icon" disabled={monthKey >= currentMonth} onClick={() => setMonthKey(addMonthsToKey(monthKey, 1))}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <div>
                                <Label className="text-xs">Período</Label>
                                <Select value={periodPreset} onValueChange={setPeriodPreset}>
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                                        <SelectItem value="last_6_months">Últimos 6 meses</SelectItem>
                                        <SelectItem value="last_12_months">Últimos 12 meses</SelectItem>
                                        <SelectItem value="current_year">Este año</SelectItem>
                                        <SelectItem value="previous_year">Año pasado</SelectItem>
                                        <SelectItem value="custom">Personalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {periodPreset === "custom" && (
                                <>
                                    <div>
                                        <Label className="text-xs">Desde</Label>
                                        <Input type="month" className="h-9" value={customFrom} max={currentMonth} onChange={(e) => setCustomFrom(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Hasta</Label>
                                        <Input type="month" className="h-9" value={customTo} max={currentMonth} onChange={(e) => setCustomTo(e.target.value)} />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: mode === "month" ? "Ingresos" : "Ingreso promedio mensual", value: totals.income / divisor, color: "text-primary" },
                    { label: mode === "month" ? "Gastos" : "Gasto promedio mensual", value: totals.expense / divisor, color: "text-destructive" },
                    { label: mode === "month" ? "Ahorro" : "Ahorro promedio mensual", value: totals.saving / divisor, color: totals.saving >= 0 ? "text-primary" : "text-destructive" },
                ].map((s) => (
                    <Card key={s.label}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className={`text-lg font-bold ${s.color}`}>{formatCurrency(s.value, displayCurrency)}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {mode === "month" ? (
                <>
                    <MonthComparisonCard transactions={transactions} monthKey={monthKey} to={to} context={context} convert={convert} displayCurrency={displayCurrency} />
                    <SpendingPaceCard transactions={transactions} budgets={budgets} monthKey={monthKey} categories={categories} context={context} convert={convert} displayCurrency={displayCurrency} />
                </>
            ) : (
                <>
                    <IncomeExpenseCard monthly={monthly} displayCurrency={displayCurrency} />
                    <SavingsCard monthly={monthly} displayCurrency={displayCurrency} />
                    <BudgetComplianceCard budgets={budgets} transactions={transactions} categories={categories} context={context} convert={convert} monthKeys={monthKeys} currentMonth={currentMonth} displayCurrency={displayCurrency} />
                    <CategoryTrendCard transactions={transactions} categories={categories} from={from} to={to} context={context} convert={convert} displayCurrency={displayCurrency} />
                </>
            )}

            <TopCategoriesCard topCategories={topCategories} displayCurrency={displayCurrency} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Tarjeta vs otros medios</CardTitle></CardHeader>
                    <CardContent>
                        {paymentMethodData.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-10">Sin datos</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={paymentMethodData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={3}>
                                        {paymentMethodData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => formatCurrency(v, displayCurrency)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Top comercios/descripciones</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {topDescriptions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-10">Sin datos</p>
                        ) : topDescriptions.map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-3 text-sm">
                                <span className="truncate">{label}</span>
                                <span className="font-medium shrink-0">{formatCurrency(value, displayCurrency)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function getTopDescriptions(transactions, convert) {
    const map = {};
    transactions.filter(isRegularExpense).forEach((t) => {
        const key = (t.description || "Sin descripcion").trim();
        map[key] = (map[key] || 0) + convert(t.amount || 0, t.currency || "ARS");
    });
    transactions
        .filter((t) => t.type === "transfer" && affectsReports(t))
        .forEach((t) => {
            const diff = getTransferDifference(t, convert);
            if (diff < 0) {
                const key = t.description ? `Dif. transferencia: ${t.description}` : "Diferencia de transferencia";
                map[key] = (map[key] || 0) + Math.abs(diff);
            }
        });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
}

// ─── Modo Mes ────────────────────────────────────────────────────────────────

function MonthComparisonCard({ transactions, monthKey, to, context, convert, displayCurrency }) {
    const comparison = useMemo(
        () => getMonthOverMonthComparison(transactions, { monthKey, to, context, convert }),
        [transactions, monthKey, to, context, convert]
    );
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Gasto vs. <span className="capitalize">{getMonthLabel(comparison.prevKey)}</span></CardTitle>
                {comparison.isPartial && (
                    <p className="text-xs text-muted-foreground">
                        Mes en curso: se compara contra los primeros {comparison.cutoffDay} días del mes anterior.
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-xs text-muted-foreground capitalize">{getMonthLabel(monthKey)}</p>
                        <p className="text-lg font-bold">{formatCurrency(comparison.currentTotal, displayCurrency)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground capitalize">{getMonthLabel(comparison.prevKey)}</p>
                        <p className="text-lg font-bold text-muted-foreground">{formatCurrency(comparison.prevTotal, displayCurrency)}</p>
                    </div>
                </div>
                {comparison.pctChange !== null && (
                    <p className={cn("text-sm font-medium", comparison.pctChange > 0 ? "text-destructive" : "text-primary")}>
                        Gastaste {Math.abs(Math.round(comparison.pctChange))}% {comparison.pctChange > 0 ? "más" : "menos"} que el mes anterior
                    </p>
                )}
                {comparison.changes.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Lo que más cambió</p>
                        <div className="space-y-1.5">
                            {comparison.changes.map((c) => (
                                <div key={c.category} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="truncate">{c.category}</span>
                                    <span className={cn("font-medium shrink-0", c.diff > 0 ? "text-destructive" : "text-primary")}>
                                        {c.diff > 0 ? "+" : "−"}{formatCurrency(Math.abs(c.diff), displayCurrency)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function SpendingPaceCard({ transactions, budgets, monthKey, categories, context, convert, displayCurrency }) {
    const pace = useMemo(
        () => getSpendingPace(transactions, budgets, { monthKey, categories, context, convert, today: TODAY }),
        [transactions, budgets, monthKey, categories, context, convert]
    );
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Ritmo de gasto</CardTitle>
                <p className="text-xs text-muted-foreground">Gastado en categorías con presupuesto, contra el presupuesto repartido parejo en el mes.</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {!pace ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">No hay presupuestos de gasto para este mes.</p>
                ) : (
                    <>
                        {pace.lastDay > 0 && <PaceSummary pace={pace} displayCurrency={displayCurrency} />}
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={pace.days}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                <YAxis {...axisMoney} />
                                <Tooltip labelFormatter={(d) => `Día ${d}`} formatter={(v) => formatCurrency(v, displayCurrency)} />
                                <Legend />
                                <Line type="linear" dataKey="ideal" name="Ritmo planeado" stroke={BLUE} strokeWidth={2} strokeDasharray="5 4" dot={false} />
                                <Line type="stepAfter" dataKey="actual" name="Gastado real" stroke={RED} strokeWidth={2} dot={false} connectNulls={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function PaceSummary({ pace, displayCurrency }) {
    const diff = pace.spentSoFar - pace.expectedSoFar;
    const over = diff > 0;
    const money = (v) => <span className="font-semibold">{formatCurrency(v, displayCurrency)}</span>;
    if (pace.lastDay === pace.totalDays) {
        return (
            <p className="text-sm">
                Mes cerrado: gastaste {money(pace.spentSoFar)} de {money(pace.budgetTotal)} presupuestados.{" "}
                <span className={cn("font-medium", over ? "text-destructive" : "text-primary")}>
                    {over ? "Te pasaste por" : "Te sobraron"} {formatCurrency(Math.abs(diff), displayCurrency)}.
                </span>
            </p>
        );
    }
    return (
        <p className="text-sm">
            Día {pace.lastDay} de {pace.totalDays}: llevás {money(pace.spentSoFar)} y a este ritmo deberías llevar {money(pace.expectedSoFar)}.{" "}
            <span className={cn("font-medium", over ? "text-destructive" : "text-primary")}>
                {over ? "Vas más rápido" : "Vas más lento"} de lo planeado ({formatCurrency(Math.abs(diff), displayCurrency)}).
            </span>
        </p>
    );
}

// ─── Modo Período ────────────────────────────────────────────────────────────

function IncomeExpenseCard({ monthly, displayCurrency }) {
    const [chartType, setChartType] = useState("bar");
    const ChartComponent = chartType === "bar" ? BarChart : LineChart;
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">Ingresos vs Gastos por mes</CardTitle>
                    <Tabs value={chartType} onValueChange={setChartType}>
                        <TabsList className="h-7">
                            <TabsTrigger value="bar" className="text-xs px-3">Barras</TabsTrigger>
                            <TabsTrigger value="line" className="text-xs px-3">Líneas</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <ChartComponent data={monthly}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis {...axisMoney} />
                        <Tooltip formatter={(v) => formatCurrency(v, displayCurrency)} />
                        <Legend />
                        {chartType === "bar" ? (
                            <>
                                <Bar dataKey="income" name="Ingresos" fill={GREEN} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Gastos" fill={RED} radius={[4, 4, 0, 0]} />
                            </>
                        ) : (
                            <>
                                <Line type="monotone" dataKey="income" name="Ingresos" stroke={GREEN} strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="expense" name="Gastos" stroke={RED} strokeWidth={2} dot={false} />
                            </>
                        )}
                    </ChartComponent>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function SavingsCard({ monthly, displayCurrency }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Ahorro neto por mes</CardTitle>
                <p className="text-xs text-muted-foreground">Ingresos menos gastos de cada mes.</p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthly}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis {...axisMoney} />
                        <Tooltip formatter={(v) => formatCurrency(v, displayCurrency)} />
                        <ReferenceLine y={0} className="stroke-border" />
                        <Bar dataKey="saving" name="Ahorro neto" radius={[4, 4, 0, 0]}>
                            {monthly.map((m) => <Cell key={m.monthKey} fill={m.saving >= 0 ? GREEN : RED} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function BudgetComplianceCard({ budgets, transactions, categories, context, convert, monthKeys, currentMonth, displayCurrency }) {
    const rows = useMemo(() =>
        getMonthlyBudgetCompliance(budgets, transactions, { categories, context, convert, months: monthKeys })
            .map((m) => ({
                ...m,
                month: getMonthLabel(m.monthKey),
                pct: m.hasBudgets && m.pct !== null ? Math.round(m.pct) : null,
                inProgress: m.monthKey === currentMonth,
            })),
        [budgets, transactions, categories, context, convert, monthKeys, currentMonth]
    );
    const overCategories = useMemo(() =>
        getCategoryOverBudgetFrequency(budgets, transactions, { categories, context, convert, months: monthKeys }).slice(0, 6),
        [budgets, transactions, categories, context, convert, monthKeys]
    );

    const closed = rows.filter((r) => r.hasBudgets && !r.inProgress);
    const within = closed.filter((r) => r.pct <= 100).length;
    const running = rows.find((r) => r.hasBudgets && r.inProgress);
    const maxPct = Math.max(120, ...rows.map((r) => r.pct ?? 0));

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Cumplimiento de presupuesto</CardTitle>
                <p className="text-xs text-muted-foreground">Cuánto del presupuesto de gasto usaste cada mes. Por debajo de la línea de 100% está bien.</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {!rows.some((r) => r.hasBudgets) ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">No hay presupuestos de gasto configurados en este período.</p>
                ) : (
                    <>
                        <p className="text-sm">
                            {closed.length > 0 ? (
                                <>
                                    Te mantuviste dentro del presupuesto en{" "}
                                    <span className={cn("font-semibold", within === closed.length ? "text-primary" : within === 0 ? "text-destructive" : "")}>
                                        {within} de {closed.length}
                                    </span>{" "}
                                    mes{closed.length !== 1 ? "es" : ""} cerrado{closed.length !== 1 ? "s" : ""}.
                                </>
                            ) : "Todavía no hay meses cerrados con presupuesto en este período."}
                            {running && (
                                <span className="text-muted-foreground"> El mes en curso va en {running.pct}% hasta ahora.</span>
                            )}
                        </p>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={rows}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, Math.ceil(maxPct / 10) * 10]} width={44} />
                                <Tooltip content={<ComplianceTooltip displayCurrency={displayCurrency} />} />
                                <ReferenceLine y={100} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 4" label={{ value: "Presupuesto", position: "insideTopRight", fontSize: 11 }} />
                                <Bar dataKey="pct" name="% usado" radius={[4, 4, 0, 0]}>
                                    {rows.map((r) => (
                                        <Cell key={r.monthKey} fill={(r.pct ?? 0) > 100 ? RED : GREEN} fillOpacity={r.inProgress ? 0.4 : 1} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        {overCategories.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Categorías que más seguido se pasaron</p>
                                <div className="space-y-1.5">
                                    {overCategories.map((c) => (
                                        <div key={c.category_name} className="flex items-center justify-between text-sm">
                                            <span className="truncate">{c.category_name}</span>
                                            <span className="text-destructive font-medium shrink-0">se pasó {c.overMonths} de {c.monthsWithBudget} meses</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function ComplianceTooltip({ active, payload, displayCurrency }) {
    if (!active || !payload?.length) return null;
    const r = payload[0].payload;
    return (
        <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-sm space-y-0.5">
            <p className="font-medium capitalize">{r.month}{r.inProgress ? " (en curso)" : ""}</p>
            {r.hasBudgets ? (
                <>
                    <p>Gastado: {formatCurrency(r.spent, displayCurrency)}</p>
                    <p>Presupuesto: {formatCurrency(r.budgeted, displayCurrency)}</p>
                    <p className={cn("font-medium", r.pct > 100 ? "text-destructive" : "text-primary")}>
                        {r.pct > 100 ? `Te pasaste ${r.pct - 100}%` : `Usaste ${r.pct}%`}
                    </p>
                </>
            ) : <p className="text-muted-foreground">Sin presupuesto este mes</p>}
        </div>
    );
}

function CategoryTrendCard({ transactions, categories, from, to, context, convert, displayCurrency }) {
    // null = todavía no se eligió nada: se sugieren las 3 categorías con más gasto.
    const [selectedIds, setSelectedIds] = useState(null);
    const suggestedIds = useMemo(
        () => getTopParentExpenseCategoryIds(transactions, { from, to, context, convert, categories }),
        [transactions, from, to, context, convert, categories]
    );
    const categoryIds = (selectedIds ?? suggestedIds).filter((id) => categories.some((c) => c.id === id));
    const rows = useMemo(
        () => getCategoryMonthlyTrend(transactions, { from, to, context, convert, categories, categoryIds })
            .map((r) => ({ ...r, month: getMonthLabel(r.monthKey) })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [transactions, from, to, context, convert, categories, categoryIds.join(",")]
    );
    const tree = useMemo(() => buildCategoryTree(categories), [categories]);
    const nameOf = (id) => categories.find((c) => c.id === id)?.name || "—";
    const toggle = (id) => {
        const current = selectedIds ?? suggestedIds;
        setSelectedIds(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <CardTitle className="text-base">Evolución por categoría</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {selectedIds === null ? "Mostrando las 3 categorías con más gasto. " : ""}Incluye sus subcategorías.
                        </p>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                                {categoryIds.length === 0 ? "Elegir categorías" : `${categoryIds.length} categoría${categoryIds.length !== 1 ? "s" : ""}`}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-72 p-2">
                            <div className="max-h-72 overflow-y-auto space-y-0.5">
                                {tree.length === 0 ? (
                                    <p className="text-sm text-muted-foreground p-2">No hay categorías</p>
                                ) : tree.map((c) => (
                                    <label key={c.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer">
                                        <Checkbox checked={categoryIds.includes(c.id)} onCheckedChange={() => toggle(c.id)} />
                                        <span className={cn("flex-1 truncate", !c.isParent && "pl-3 text-muted-foreground")}>
                                            {c.isParent ? c.name : `↳ ${c.name}`}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {selectedIds !== null && (
                                <Button variant="ghost" size="sm" className="w-full mt-1 h-8 text-xs" onClick={() => setSelectedIds(null)}>
                                    Volver a la sugerencia
                                </Button>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent>
                {categoryIds.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">Elegí una o más categorías para ver cómo cambian mes a mes.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={rows}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis {...axisMoney} />
                            <Tooltip formatter={(v) => formatCurrency(v, displayCurrency)} />
                            <Legend />
                            {categoryIds.map((id, i) => (
                                <Line key={id} type="monotone" dataKey={id} name={nameOf(id)} stroke={TREND_COLORS[i % TREND_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Común ───────────────────────────────────────────────────────────────────

function TopCategoriesCard({ topCategories, displayCurrency }) {
    return (
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Top categorías de gasto</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                {topCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
                ) : topCategories.map(([cat, val]) => (
                    <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>{cat}</span>
                            <span className="font-medium">{formatCurrency(val, displayCurrency)}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(val / topCategories[0][1]) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
