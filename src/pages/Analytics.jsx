import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/shared/PageHeader";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, getMonthLabel, TODAY, isRegularExpense } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

function getMonthKey(dateStr) {
    return dateStr?.slice(0, 7) || "";
}

export default function Analytics() {
    const [chartType, setChartType] = useState("bar");
    const [months, setMonths] = useState("12");
    const { displayCurrency, convert } = useCurrency();

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date", 1000),
    });

    const data = useMemo(() => {
        // Only past confirmed/installment transactions
        const past = transactions.filter(
            (t) => t.date <= TODAY && (t.status === "confirmed" || t.status === "installment")
        );

        const byMonth = {};
        past.forEach((t) => {
            const m = getMonthKey(t.date);
            if (!m) return;
            if (!byMonth[m]) byMonth[m] = { income: 0, expense: 0 };
            const amt = convert(t.amount || 0, t.currency || "MXN");
            if (t.type === "income") byMonth[m].income += amt;
            else if (isRegularExpense(t)) byMonth[m].expense += amt;
        });

        const numMonths = parseInt(months) || 12;
        const sortedKeys = Object.keys(byMonth).sort().slice(-numMonths);

        return sortedKeys.map((m) => ({
            month: getMonthLabel(m),
            key: m,
            income: Math.round(byMonth[m]?.income || 0),
            expense: Math.round(byMonth[m]?.expense || 0),
            saving: Math.round((byMonth[m]?.income || 0) - (byMonth[m]?.expense || 0)),
        }));
    }, [transactions, displayCurrency, months, convert]);

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
        const past = transactions.filter((t) => t.date <= TODAY && isRegularExpense(t));
        const map = {};
        past.forEach((t) => {
            const k = t.category_name || "Sin categoría";
            map[k] = (map[k] || 0) + convert(t.amount || 0, t.currency || "MXN");
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
    }, [transactions, displayCurrency, convert]);

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
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <PageHeader title="Estadísticas" description="Historial financiero mensual" />
                <div className="flex gap-2">
                    <CurrencySelector />
                    <select value={months} onChange={(e) => setMonths(e.target.value)}
                        className="h-8 text-sm border rounded-md px-2 bg-background">
                        <option value="6">6 meses</option>
                        <option value="12">12 meses</option>
                        <option value="24">24 meses</option>
                    </select>
                </div>
            </div>

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
                    <CardTitle className="text-base">Top categorías de gasto (historial)</CardTitle>
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
        </div>
    );
}