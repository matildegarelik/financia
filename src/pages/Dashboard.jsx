import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Wallet, TrendingUp, TrendingDown, Calendar, ChevronRight } from "lucide-react";
import { formatCurrency, getCurrentMonth, TODAY } from "@/lib/formatters";
import { useCurrency } from "@/lib/currency-context";
import StatCard from "@/components/shared/StatCard";
import PageHeader from "@/components/shared/PageHeader";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SpendingChart from "@/components/dashboard/SpendingChart";
import BudgetOverview from "@/components/dashboard/BudgetOverview";
import BalanceCard from "@/components/dashboard/BalanceCard";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    const [horizon, setHorizon] = useState("now");
    const [projectedDate, setProjectedDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        return d.toISOString().split("T")[0];
    });
    const { displayCurrency, convert } = useCurrency();

    const { data: transactions = [], isLoading: loadingTx } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date", 500),
    });
    const { data: accounts = [], isLoading: loadingAcc } = useQuery({
        queryKey: ["accounts"],
        queryFn: () => base44.entities.Account.list(),
    });
    const { data: budgets = [] } = useQuery({
        queryKey: ["budgets"],
        queryFn: () => base44.entities.Budget.list(),
    });
    const { data: investments = [] } = useQuery({
        queryKey: ["investments"],
        queryFn: () => base44.entities.Investment.list(),
    });

    const currentMonth = getCurrentMonth();
    // Only confirmed past transactions for monthly stats
    const monthlyTx = transactions.filter(
        (t) => t.date?.startsWith(currentMonth) && t.date <= TODAY && t.status !== "projected"
    );
    const monthlyIncome = monthlyTx.filter((t) => t.type === "income").reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
    const monthlyExpense = monthlyTx.filter((t) => t.type === "expense").reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);

    const futureTx = transactions.filter((t) => t.date > TODAY);
    const isLoading = loadingTx || loadingAcc;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <PageHeader title="Dashboard" description="Resumen financiero personal" />
                <CurrencySelector />
            </div>

            {/* Horizon selector */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Tabs value={horizon} onValueChange={setHorizon}>
                    <TabsList className="h-9">
                        <TabsTrigger value="now" className="text-xs px-3">Hoy</TabsTrigger>
                        <TabsTrigger value="certain" className="text-xs px-3">Futuro certero</TabsTrigger>
                        <TabsTrigger value="projected" className="text-xs px-3">Proyectado</TabsTrigger>
                    </TabsList>
                </Tabs>
                {horizon !== "now" && (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input type="date" value={projectedDate} onChange={(e) => setProjectedDate(e.target.value)}
                            className="h-8 w-40 text-sm" min={TODAY} />
                    </div>
                )}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard title="Ingresos del mes" value={formatCurrency(monthlyIncome, displayCurrency)} icon={TrendingUp} trendUp />
                <StatCard title="Gastos del mes" value={formatCurrency(monthlyExpense, displayCurrency)} icon={TrendingDown} />
                <StatCard title="Saldo neto" value={formatCurrency(monthlyIncome - monthlyExpense, displayCurrency)}
                    icon={Wallet} trendUp={monthlyIncome >= monthlyExpense} />
                <StatCard title="Mov. futuros" value={futureTx.length} icon={Calendar} subtitle="programados" />
            </div>

            {/* Balance cards por horizonte */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <BalanceCard
                        accounts={accounts}
                        transactions={transactions}
                        investments={investments}
                        horizon={horizon}
                        projectedDate={projectedDate}
                    />
                </div>
                <BudgetOverview budgets={budgets} transactions={transactions} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SpendingChart transactions={monthlyTx} />
                <RecentTransactions transactions={transactions.filter((t) => t.date <= TODAY).slice(0, 6)} />
            </div>
        </div>
    );
}