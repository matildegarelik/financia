import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency-context";

const typeConfig = {
    income: { icon: ArrowDownLeft, label: "Ingreso", color: "text-primary", bg: "bg-primary/10" },
    expense: { icon: ArrowUpRight, label: "Gasto", color: "text-destructive", bg: "bg-destructive/10" },
    transfer: { icon: ArrowLeftRight, label: "Transferencia", color: "text-chart-2", bg: "bg-chart-2/10" },
};

export default function RecentTransactions({ transactions }) {
    const { displayCurrency, convert } = useCurrency();
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Transacciones recientes</CardTitle>
                <Link to="/transactions" className="text-sm text-primary hover:underline">Ver todas</Link>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">No hay transacciones aún</p>
                ) : (
                    <div className="space-y-1">
                        {transactions.map((tx) => {
                            const cfg = typeConfig[tx.type] || typeConfig.expense;
                            const Icon = cfg.icon;
                            return (
                                <div key={tx.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className={cn("p-2 rounded-lg", cfg.bg)}>
                                        <Icon className={cn("h-4 w-4", cfg.color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{tx.description || cfg.label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {tx.category_name && `${tx.category_name} · `}{tx.account_name || ""} · {formatDate(tx.date)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn("text-sm font-semibold block", cfg.color)}>
                                            {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                                            {formatCurrency(tx.amount, tx.currency || "MXN")}
                                        </span>
                                        {tx.currency && tx.currency !== displayCurrency && (
                                            <span className="text-xs text-muted-foreground">
                                                ≈ {formatCurrency(convert(tx.amount, tx.currency || "MXN"), displayCurrency)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}