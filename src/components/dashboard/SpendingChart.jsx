import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/formatters";

const COLORS = ["#27b088", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function SpendingChart({ transactions = [] }) {
    const data = useMemo(() => {
        const expenses = transactions.filter((t) => t.type === "expense");
        const byCategory = {};
        expenses.forEach((t) => {
            const key = t.category_name || "Sin categoría";
            byCategory[key] = (byCategory[key] || 0) + (t.amount || 0);
        });
        return Object.entries(byCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [transactions]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Gastos por categoría</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                        Sin gastos este mes
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v) => formatCurrency(v)} />
                            <Legend iconSize={10} formatter={(v) => <span className="text-xs">{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
