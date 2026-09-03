import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, getMonthLabel, TODAY, isRegularExpense, getTransferDifference, affectsReports } from "@/lib/formatters";
import {
    filterReportTransactions,
    getMonthKey,
    getPaymentMethodData,
    getTopExpenseCategories,
    groupIncomeExpenseByPeriod,
    transactionMatchesReportType,
} from "@/domain/reporting";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function toISODate(date) {
    return date.toISOString().split("T")[0];
}

function getMonthRange(offset = 0) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    const today = new Date(TODAY);
    return {
        from: toISODate(start),
        to: toISODate(end > today ? today : end),
    };
}

function getRollingRange(months) {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    return { from: toISODate(from), to: TODAY };
}

function getYearRange(offset = 0) {
    const now = new Date();
    const year = now.getFullYear() + offset;
    const end = new Date(year, 11, 31);
    const today = new Date(TODAY);
    return {
        from: `${year}-01-01`,
        to: toISODate(end > today ? today : end),
    };
}

function getDayLabel(dateStr) {
    const [, month, day] = dateStr.split("-");
    return `${day}/${month}`;
}

function daysBetween(from, to) {
    if (!from || !to) return 0;
    return Math.abs((new Date(to) - new Date(from)) / 86400000);
}

export default function Analytics() {
    const [chartType, setChartType] = useState("bar");
    const currentRange = getMonthRange(0);
    const [rangePreset, setRangePreset] = useState("current_month");
    const [dateFrom, setDateFrom] = useState(currentRange.from);
    const [dateTo, setDateTo] = useState(currentRange.to);
    const [categoryMode, setCategoryMode] = useState("all");
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const { displayCurrency, convert } = useCurrency();

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date"),
    });
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: () => base44.entities.Category.list(),
    });
    const { data: accounts = [] } = useQuery({
        queryKey: ["accounts"],
        queryFn: () => base44.entities.Account.list(),
    });
    const { data: statements = [] } = useQuery({
        queryKey: ["credit_card_statements"],
        queryFn: () => base44.entities.CreditCardStatement.list(),
    });

    const handleRangePreset = (value) => {
        setRangePreset(value);
        const ranges = {
            current_month: getMonthRange(0),
            previous_month: getMonthRange(-1),
            last_3_months: getRollingRange(3),
            last_6_months: getRollingRange(6),
            current_year: getYearRange(0),
            previous_year: getYearRange(-1),
        };
        if (ranges[value]) {
            const range = ranges[value];
            setDateFrom(range.from);
            setDateTo(range.to);
        }
    };

    const handleCategoryMode = (value) => {
        setCategoryMode(value);
        if (value !== "custom") setSelectedCategoryIds([]);
    };

    const toggleCategory = (id) => {
        setSelectedCategoryIds((current) =>
            current.includes(id) ? current.filter((catId) => catId !== id) : [...current, id]
        );
    };

    const selectedCategoryFilter = useMemo(() => {
        const selected = new Set(selectedCategoryIds);
        const expandedIds = new Set(selectedCategoryIds);
        const names = new Set();

        categories.forEach((cat) => {
            if (selected.has(cat.id)) names.add(cat.name);
            if (cat.parent_category && selected.has(cat.parent_category)) {
                expandedIds.add(cat.id);
                names.add(cat.name);
            }
        });

        return { ids: expandedIds, names };
    }, [categories, selectedCategoryIds]);

    const reportingContext = useMemo(() => ({ accounts, statements }), [accounts, statements]);

    const filteredTransactions = useMemo(() => {
        return filterReportTransactions(transactions, {
            from: dateFrom,
            to: dateTo,
            today: TODAY,
            context: reportingContext,
        }).filter((t) => {
            if (categoryMode === "income" || categoryMode === "expense") return transactionMatchesReportType(t, categoryMode, convert);
            if (categoryMode === "custom") {
                if (selectedCategoryIds.length === 0) return true;
                return selectedCategoryFilter.ids.has(t.category_id) || selectedCategoryFilter.names.has(t.category_name);
            }
            return true;
        });
    }, [transactions, dateFrom, dateTo, reportingContext, categoryMode, selectedCategoryIds, selectedCategoryFilter, convert]);

    const groupByDay = daysBetween(dateFrom, dateTo) <= 62;
    const selectedCategoryNames = selectedCategoryIds
        .map((id) => categories.find((cat) => cat.id === id)?.name)
        .filter(Boolean);
    const categorySummary = categoryMode === "custom"
        ? selectedCategoryIds.length > 0
            ? selectedCategoryIds.length === 1
                ? selectedCategoryNames[0] || "1 seleccionada"
                : `${selectedCategoryIds.length} seleccionadas`
            : "Todas las categorías"
        : categoryMode === "income"
            ? "Solo ingresos"
            : categoryMode === "expense"
                ? "Solo gastos"
                : "Todas";
    const periodLabel = groupByDay ? "día" : "mes";

    const data = useMemo(() => {
        const byPeriod = groupIncomeExpenseByPeriod(filteredTransactions, {
            context: reportingContext,
            convert,
            getKey: (reportingDate) => groupByDay ? reportingDate : getMonthKey(reportingDate),
        });

        const sortedKeys = Object.keys(byPeriod).sort();

        return sortedKeys.map((key) => ({
            month: groupByDay ? getDayLabel(key) : getMonthLabel(key),
            key,
            income: Math.round(byPeriod[key]?.income || 0),
            expense: Math.round(byPeriod[key]?.expense || 0),
            saving: Math.round((byPeriod[key]?.income || 0) - (byPeriod[key]?.expense || 0)),
        }));
    }, [filteredTransactions, reportingContext, convert, groupByDay]);

    // Cumulative savings
    const cumulativeData = useMemo(() => {
        let running = 0;
        return data.map((d) => {
            running += d.saving;
            return { ...d, cumulative: Math.round(running) };
        });
    }, [data]);

    // Averages
    const avgIncome = data.length ? data.reduce((s, d) => s + d.income, 0) / data.length : 0;
    const avgExpense = data.length ? data.reduce((s, d) => s + d.expense, 0) / data.length : 0;
    const avgSaving = data.length ? data.reduce((s, d) => s + d.saving, 0) / data.length : 0;

    // Top categories
    const byCat = useMemo(() => {
        const map = {};
        filteredTransactions.filter(isRegularExpense).forEach((t) => {
            const k = t.category_name || "Sin categoría";
            map[k] = (map[k] || 0) + convert(t.amount || 0, t.currency || "ARS");
        });
        filteredTransactions
            .filter((t) => t.type === "transfer" && affectsReports(t))
            .forEach((t) => {
                const diff = getTransferDifference(t, convert);
                if (diff < 0) map["Diferencia de transferencia"] = (map["Diferencia de transferencia"] || 0) + Math.abs(diff);
            });
        return getTopExpenseCategories(filteredTransactions, convert, { limit: 8, includeTransferDifferences: true });
    }, [filteredTransactions, convert]);

    const paymentMethodData = useMemo(() => {
        return getPaymentMethodData(filteredTransactions, accounts, convert);
    }, [filteredTransactions, accounts, convert]);

    const topDescriptions = useMemo(() => {
        const map = {};
        filteredTransactions.filter(isRegularExpense).forEach((t) => {
            const key = (t.description || "Sin descripcion").trim();
            map[key] = (map[key] || 0) + convert(t.amount || 0, t.currency || "ARS");
        });
        filteredTransactions
            .filter((t) => t.type === "transfer" && affectsReports(t))
            .forEach((t) => {
                const diff = getTransferDifference(t, convert);
                if (diff < 0) {
                    const key = t.description ? `Dif. transferencia: ${t.description}` : "Diferencia de transferencia";
                    map[key] = (map[key] || 0) + Math.abs(diff);
                }
            });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    }, [filteredTransactions, convert, displayCurrency]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
            </div>
        );
    }

    const ChartComponent = chartType === "bar" ? BarChart : LineChart;

    return (
        <div className="space-y-5">
            <PageHeader
                title="Estadísticas"
                description="Historial financiero por rango y categoría"
                action={<CurrencySelector />}
            />

            <Card>
                <CardContent className="p-3 sm:p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                        <div>
                            <Label className="text-xs">Rango</Label>
                            <Select value={rangePreset} onValueChange={handleRangePreset}>
                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="current_month">Este mes</SelectItem>
                                    <SelectItem value="previous_month">Mes anterior</SelectItem>
                                    <SelectItem value="last_3_months">Ultimos 3 meses</SelectItem>
                                    <SelectItem value="last_6_months">Ultimos 6 meses</SelectItem>
                                    <SelectItem value="current_year">Este ano</SelectItem>
                                    <SelectItem value="previous_year">Ano pasado</SelectItem>
                                    <SelectItem value="custom">Personalizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Categorías</Label>
                            <Select value={categoryMode} onValueChange={handleCategoryMode}>
                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    <SelectItem value="custom">Seleccionar una o varias</SelectItem>
                                    <SelectItem value="income">Solo ingresos</SelectItem>
                                    <SelectItem value="expense">Solo gastos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-xs text-muted-foreground lg:text-right">
                            <span className="font-medium text-foreground">{filteredTransactions.length}</span> movimientos
                            <span className="hidden lg:inline"> · {categorySummary}</span>
                        </div>
                    </div>

                    {rangePreset === "custom" && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Desde</Label>
                                <Input type="date" className="h-9" value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">Hasta</Label>
                                <Input type="date" className="h-9" value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {categoryMode === "custom" && (
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8">
                                        {categorySummary}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-80 p-2">
                                    <div className="max-h-72 overflow-y-auto space-y-1">
                                        {categories.length === 0 ? (
                                            <p className="text-sm text-muted-foreground p-2">No hay categorías</p>
                                        ) : categories
                                            .slice()
                                            .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
                                            .map((cat) => (
                                                <label key={cat.id}
                                                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer">
                                                    <Checkbox
                                                        checked={selectedCategoryIds.includes(cat.id)}
                                                        onCheckedChange={() => toggleCategory(cat.id)}
                                                    />
                                                    <span className="flex-1 truncate">{cat.name}</span>
                                                    <span className={cn(
                                                        "text-[10px] uppercase tracking-wide",
                                                        cat.type === "income" ? "text-primary" : "text-destructive"
                                                    )}>
                                                        {cat.type === "income" ? "ingreso" : "gasto"}
                                                    </span>
                                                </label>
                                            ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {selectedCategoryIds.length > 0 && (
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs"
                                    onClick={() => setSelectedCategoryIds([])}>
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Ingreso promedio", value: avgIncome, color: "text-primary" },
                    { label: "Gasto promedio", value: avgExpense, color: "text-destructive" },
                    { label: "Ahorro promedio", value: avgSaving, color: avgSaving >= 0 ? "text-primary" : "text-destructive" },
                ].map((s) => (
                    <Card key={s.label}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className={`text-lg font-bold ${s.color}`}>{formatCurrency(s.value, displayCurrency)}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main chart */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-base">Ingresos vs Gastos por {periodLabel}</CardTitle>
                        <Tabs value={chartType} onValueChange={setChartType}>
                            <TabsList className="h-7">
                                <TabsTrigger value="bar" className="text-xs px-3">Barras</TabsTrigger>
                                <TabsTrigger value="line" className="text-xs px-3">Líneas</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12 text-sm">No hay datos históricos aún</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <ChartComponent data={data}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                                <Tooltip formatter={(v) => formatCurrency(v, displayCurrency)} />
                                <Legend />
                                {chartType === "bar" ? (
                                    <>
                                        <Bar dataKey="income" name="Ingresos" fill="hsl(160, 84%, 28%)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" name="Gastos" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="saving" name="Ahorro" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                                    </>
                                ) : (
                                    <>
                                        <Line type="monotone" dataKey="income" name="Ingresos" stroke="hsl(160, 84%, 28%)" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="expense" name="Gastos" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="saving" name="Ahorro" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={false} />
                                    </>
                                )}
                            </ChartComponent>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Cumulative savings */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Ahorro acumulado</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={cumulativeData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                            <Tooltip formatter={(v) => formatCurrency(v, displayCurrency)} />
                            <Line type="monotone" dataKey="cumulative" name="Ahorro acumulado"
                                stroke="hsl(160, 84%, 28%)" strokeWidth={2} dot={false} fill="hsl(160, 84%, 28%)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top expense categories */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Top categorías de gasto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {byCat.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
                    ) : byCat.map(([cat, val], i) => {
                        const max = byCat[0][1];
                        const pct = (val / max) * 100;
                        return (
                            <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>{cat}</span>
                                    <span className="font-medium">{formatCurrency(val, displayCurrency)}</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Tarjeta vs otros medios</CardTitle>
                    </CardHeader>
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
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Top comercios/descripciones</CardTitle>
                    </CardHeader>
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
