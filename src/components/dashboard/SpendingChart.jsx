import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrencyCode } from "@/lib/formatters";

const COLORS = ["#27b088", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#ef4444"];

export default function SpendingChart({ transactions = [], convert, displayCurrency, monthLabel }) {
    const data = useMemo(() => {
        const byCategory = {};
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                const key = t.category_name || "Sin categoría";
                byCategory[key] = (byCategory[key] || 0) + (convert ? convert(t.amount || 0, t.currency || "MXN") : (t.amount || 0));
            });
        return Object.entries(byCategory)
            .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [transactions, convert]);

    const chartHeight = Math.max(160, data.length * 36);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">
                    Gastos por categoría{monthLabel ? ` — ${monthLabel}` : ""}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                        Sin gastos registrados este mes
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={chartHeight}>
                        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40, top: 4, bottom: 4 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={110}
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                formatter={(v) => [formatCurrencyCode(v, displayCurrency || "MXN"), "Gasto"]}
                                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{
                                position: "right",
                                fontSize: 11,
                                fill: "hsl(var(--muted-foreground))",
                                formatter: (v) => formatCurrencyCode(v, displayCurrency || "MXN"),
                            }}>
                                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
