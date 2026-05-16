import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrencyCode, getCurrentMonth } from "@/lib/formatters";
import { Link } from "react-router-dom";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function BudgetOverview({ budgets, transactions = [] }) {
    const now = new Date();
    const monthKey = format(now, "yyyy-MM");
    const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

    // Filter budgets for current month only
    const monthBudgets = budgets.filter((b) => b.month === monthKey).slice(0, 5);

    // Calculate real spent from transactions
    const getSpent = (b) =>
        transactions
            .filter((tx) => {
                if (tx.type !== "expense" || tx.status === "projected") return false;
                if (!tx.date || tx.date < monthStart || tx.date > monthEnd) return false;
                if (b.category_id && tx.category_id === b.category_id) return true;
                if (!b.category_id && b.category_name && tx.category_name === b.category_name) return true;
                return false;
            })
            .reduce((s, tx) => s + (tx.amount || 0), 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Presupuestos del mes</CardTitle>
                <Link to="/budgets" className="text-sm text-primary hover:underline">Ver todos</Link>
            </CardHeader>
            <CardContent>
                {monthBudgets.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                        No hay presupuestos para este mes
                    </div>
                ) : (
                    <div className="space-y-4">
                        {monthBudgets.map((b) => {
                            const spent = getSpent(b);
                            const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
                            const overBudget = spent > b.amount;
                            return (
                                <div key={b.id} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{b.category_name}</span>
                                        <span className="text-muted-foreground">
                                            {formatCurrencyCode(spent, b.currency || "MXN")} / {formatCurrencyCode(b.amount, b.currency || "MXN")}
                                        </span>
                                    </div>
                                    <Progress value={pct} className={overBudget ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}