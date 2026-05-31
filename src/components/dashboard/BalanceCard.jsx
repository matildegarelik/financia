import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrency, TODAY } from "@/lib/formatters";
import { Wallet, TrendingUp, CreditCard, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

// horizon: "now" | "certain" | "projected"
// projectedDate: string YYYY-MM-DD
export default function BalanceCard({ accounts, transactions, investments, horizon, projectedDate }) {
    const { displayCurrency, convert } = useCurrency();

    // Base account balances (liquid) — compute effective = initial + past transactions
    const liquidAccounts = accounts.filter((a) => a.type !== "investment" && a.is_active !== false);

    function computeEffective(acc) {
        return transactions
            .filter((tx) => tx.status !== "projected" && tx.date && tx.date <= TODAY)
            .reduce((sum, tx) => {
                if (tx.account_id === acc.id) {
                    if (tx.type === "income") return sum + (tx.amount || 0);
                    if (tx.type === "expense") return sum - (tx.amount || 0);
                    if (tx.type === "transfer") return sum - (tx.amount || 0);
                }
                if (tx.to_account_id === acc.id && tx.type === "transfer") return sum + (tx.to_amount || tx.amount || 0);
                return sum;
            }, acc.balance || 0);
    }

    let liquidBalance = liquidAccounts.reduce(
        (s, a) => s + convert(computeEffective(a), a.currency || "MXN"), 0
    );

    // Investment value from Investment entity — only active ones
    const activeInvestments = investments.filter((i) => !i.status || i.status === "activa");
    const investedValue = activeInvestments.reduce(
        (s, i) => s + convert(i.current_value || i.amount_invested || 0, i.currency || "MXN"), 0
    );

    // Future transactions to add based on horizon
    const cutoff = horizon === "now" ? TODAY
        : horizon === "certain" ? (projectedDate || "2099-12-31")
            : (projectedDate || "2099-12-31");

    const futureTx = transactions.filter((t) => {
        if (!t.date || t.date <= TODAY) return false;
        if (t.date > cutoff) return false;
        if (horizon === "certain") return t.status === "confirmed" || t.status === "installment";
        if (horizon === "projected") return true;
        return false;
    });

    let futureImpact = futureTx.reduce((s, t) => {
        const amt = convert(t.amount || 0, t.currency || "MXN");
        const prob = horizon === "projected" && t.status === "projected" ? (t.probability || 80) / 100 : 1;
        if (t.type === "income") return s + amt * prob;
        if (t.type === "expense") return s - amt * prob;
        return s;
    }, 0);

    const projectedLiquid = liquidBalance + futureImpact;

    const rows = [
        { label: "Disponible (cuentas)", value: liquidBalance, icon: Wallet, color: "text-primary" },
        { label: "En inversiones", value: investedValue, icon: Lock, color: "text-chart-2", note: "no disponible" },
    ];

    if (horizon !== "now") {
        rows.push({ label: "Impacto futuro estimado", value: futureImpact, icon: TrendingUp, color: futureImpact >= 0 ? "text-primary" : "text-destructive" });
        rows.push({ label: "Proyectado disponible", value: projectedLiquid, icon: Wallet, color: projectedLiquid >= 0 ? "text-primary" : "text-destructive", bold: true });
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Balance en {displayCurrency}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                        {horizon === "now" ? "Actual" : horizon === "certain" ? "Certero" : "Proyectado"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {rows.map((row) => (
                    <div key={row.label} className={cn("flex items-center justify-between", row.bold && "border-t pt-3 mt-1")}>
                        <div className="flex items-center gap-2">
                            <row.icon className={cn("h-4 w-4", row.color)} />
                            <span className={cn("text-sm", row.bold ? "font-semibold" : "text-muted-foreground")}>{row.label}</span>
                            {row.note && <span className="text-xs text-muted-foreground">({row.note})</span>}
                        </div>
                        <span className={cn("font-semibold text-sm", row.color, row.bold && "text-base")}>
                            {formatCurrency(row.value, displayCurrency)}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}