import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Star, ChevronRight, Info } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import CurrencySelector from "@/components/shared/CurrencySelector";
import SpendingChart from "@/components/dashboard/SpendingChart";
import { formatCurrencyCode, formatDate, getCurrentMonth, TODAY, getTransferDestinationAmount } from "@/lib/formatters";
import { computeAccountBalance } from "@/domain/transactions";
import { getBudgetProgress, getMonthBudgets, splitBudgetsByType } from "@/domain/budgets";
import { filterReportTransactions, sumIncomeExpense } from "@/domain/reporting";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import { format as fnsFormat, startOfMonth, endOfMonth } from "date-fns";

const typeConfig = {
    income: { icon: ArrowDownLeft, label: "Ingreso", color: "text-primary", bg: "bg-primary/10" },
    expense: { icon: ArrowUpRight, label: "Gasto", color: "text-destructive", bg: "bg-destructive/10" },
    transfer: { icon: ArrowLeftRight, label: "Transferencia", color: "text-chart-2", bg: "bg-chart-2/10" },
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { displayCurrency, convert } = useCurrency();
    const [dashAccTab, setDashAccTab] = useState(null); // null = auto-selecciona primer favorito

    const { data: transactions = [], isLoading: loadingTx } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date", 500),
    });
    const { data: accounts = [], isLoading: loadingAcc } = useQuery({
        queryKey: ["accounts"],
        queryFn: () => base44.entities.Account.list(),
    });
    const { data: statements = [] } = useQuery({
        queryKey: ["credit_card_statements"],
        queryFn: () => base44.entities.CreditCardStatement.list(),
    });
    const { data: budgets = [] } = useQuery({
        queryKey: ["budgets"],
        queryFn: () => base44.entities.Budget.list(),
    });
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: () => base44.entities.Category.list(),
    });
    const { data: investments = [] } = useQuery({
        queryKey: ["investments"],
        queryFn: () => base44.entities.Investment.list(),
    });

    const currentMonth = getCurrentMonth();
    const monthLabel = format(new Date(), "MMMM yyyy", { locale: es });
    const monthStart = fnsFormat(startOfMonth(new Date()), "yyyy-MM-dd");
    const monthEnd = fnsFormat(endOfMonth(new Date()), "yyyy-MM-dd");

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

    const reportingContext = useMemo(() => ({ accounts, statements }), [accounts, statements]);
    const monthlyTx = useMemo(() =>
        filterReportTransactions(transactions, {
            from: monthStart,
            to: monthEnd,
            today: TODAY,
            context: reportingContext,
        }), [transactions, monthStart, monthEnd, reportingContext]);
    const monthTotals = useMemo(() => sumIncomeExpense(monthlyTx, convert), [monthlyTx, convert]);
    const monthlyIncome = monthTotals.income;
    const monthlyExpense = monthTotals.expense;
    const netMonth = monthlyIncome - monthlyExpense;

    const computeEffective = (acc) => computeAccountBalance(acc, transactions);

    const liquidAccounts = accounts.filter((a) => a.type !== "investment");
    const liquidBalance = useMemo(() =>
        liquidAccounts.reduce((s, a) => s + convert(computeEffective(a), a.currency || "ARS"), 0),
        [accounts, transactions, convert]);

    const investedTotal = useMemo(() =>
        investments
            .filter((i) => !i.status || i.status === "activa")
            .reduce((s, i) => s + convert(i.current_value || i.amount_invested || 0, i.currency || "ARS"), 0),
        [investments, convert]);

    const totalSavings = liquidBalance + investedTotal;

    const recentTx = useMemo(() =>
        transactions
            .filter((t) => t.status !== "projected" && t.date && t.date <= TODAY)
            .slice(0, 8),
        [transactions]);

    const favoriteAccounts = useMemo(() =>
        accounts
            .filter((a) => a.is_favorite && a.is_visible !== false)
            .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999)),
        [accounts]);

    // null = auto-selecciona primer favorito (sort_order más bajo)
    const effectiveDashTab = dashAccTab ?? favoriteAccounts[0]?.id ?? "all";
    const activeDashAcc = effectiveDashTab !== "all" ? accounts.find(a => a.id === effectiveDashTab) : null;
    const activeDashBalance = activeDashAcc ? computeEffective(activeDashAcc) : null;

    const mobileTx = useMemo(() => {
        if (effectiveDashTab === "all") return recentTx;
        return transactions
            .filter((t) =>
                t.status !== "projected" &&
                t.date &&
                t.date <= TODAY &&
                (t.account_id === effectiveDashTab || t.to_account_id === effectiveDashTab)
            )
            .slice(0, 8);
    }, [effectiveDashTab, recentTx, transactions]);

    const monthBudgets = useMemo(() =>
        splitBudgetsByType(getMonthBudgets(budgets, currentMonth), categories).expenseBudgets.slice(0, 6),
        [budgets, currentMonth, categories]);

    const getBudgetSpent = (b) => {
        return getBudgetProgress(b, transactions, {
            categories,
            from: monthStart,
            to: monthEnd,
            context: reportingContext,
        });
    };

    const isLoading = loadingTx || loadingAcc;

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
                </div>
                <Skeleton className="h-48 rounded-lg" />
            </div>
        );
    }

    const TxRow = ({ tx, compact = false }) => {
        const cfg = typeConfig[tx.type] || typeConfig.expense;
        const Icon = cfg.icon;
        const transferDestinationCurrency = tx.to_currency || accounts.find((a) => a.id === tx.to_account_id)?.currency || tx.currency || "ARS";
        const transferDestinationAmount = getTransferDestinationAmount(tx, transferDestinationCurrency);
        const transferAccountLine = tx.type === "transfer"
            ? `De ${tx.account_name || "cuenta origen"} a ${tx.to_account_name || "cuenta destino"}`
            : null;

        return (
            <div className={cn("flex items-center gap-3", compact ? "py-2 px-4" : "py-2.5 px-2 rounded-lg hover:bg-muted/40 transition-colors")}>
                <div className={cn("rounded-lg shrink-0", cfg.bg, compact ? "p-1.5" : "p-2")}>
                    <Icon className={cn(cfg.color, compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={cn("font-medium truncate", compact ? "text-sm" : "text-sm")}>
                        {tx.description || cfg.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {tx.category_name ? `${tx.category_name} · ` : ""}
                        {transferAccountLine ? `${transferAccountLine} · ` : ""}
                        {formatDate(tx.date)}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    {tx.type === "transfer" ? (
                        <div className="space-y-0.5">
                            <p className={cn("font-semibold text-destructive flex items-center justify-end gap-1", compact ? "text-sm" : "text-sm")}>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                -{formatCurrencyCode(tx.amount, tx.currency || "ARS")}
                            </p>
                            <p className={cn("font-semibold text-primary flex items-center justify-end gap-1", compact ? "text-sm" : "text-sm")}>
                                <ArrowDownLeft className="h-3.5 w-3.5" />
                                +{formatCurrencyCode(transferDestinationAmount, transferDestinationCurrency)}
                            </p>
                        </div>
                    ) : (
                        <p className={cn("font-semibold", cfg.color, compact ? "text-sm" : "text-sm")}>
                            {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : ""}
                            {formatCurrencyCode(tx.amount, tx.currency || "ARS")}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">

            {/* ── Mobile header ── */}
            <div className="lg:hidden space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xl font-bold">{greeting}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                    </div>
                    <Button onClick={() => navigate("/transactions?new=1")} size="sm">
                        <Plus className="h-4 w-4 mr-1.5" />Nueva
                    </Button>
                </div>

                {/* Cuentas + últimas transacciones — un solo bloque */}
                <Card className="overflow-hidden">
                    {/* Tabs de cuentas */}
                    {favoriteAccounts.length > 0 && (
                        <div className="px-4 pt-3 pb-2 space-y-2.5">
                            <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                                <button
                                    onClick={() => setDashAccTab("all")}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 transition-colors",
                                        effectiveDashTab === "all"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Todas
                                </button>
                                {favoriteAccounts.map(acc => (
                                    <button
                                        key={acc.id}
                                        onClick={() => setDashAccTab(acc.id)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 transition-colors",
                                            effectiveDashTab === acc.id
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {acc.name}
                                    </button>
                                ))}
                            </div>
                            <div>
                                {effectiveDashTab === "all" ? (
                                    <>
                                        <p className="text-xs text-muted-foreground">Total cuentas</p>
                                        <p className={cn("text-2xl font-bold", liquidBalance < 0 ? "text-destructive" : "text-foreground")}>
                                            {formatCurrencyCode(liquidBalance, displayCurrency)}
                                        </p>
                                    </>
                                ) : activeDashAcc && (
                                    <>
                                        <p className="text-xs text-muted-foreground">{activeDashAcc.name}</p>
                                        <p className={cn("text-2xl font-bold", activeDashBalance < 0 ? "text-destructive" : "text-foreground")}>
                                            {formatCurrencyCode(activeDashBalance, activeDashAcc.currency || "ARS")}
                                        </p>
                                        {(activeDashAcc.currency || "ARS") !== displayCurrency && (
                                            <p className="text-xs text-muted-foreground">
                                                ≈ {formatCurrencyCode(convert(activeDashBalance, activeDashAcc.currency || "ARS"), displayCurrency)}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Últimas transacciones */}
                    <div className="flex items-center justify-between px-4 pt-2 pb-2 border-t">
                        <p className="text-sm font-semibold">Últimas transacciones</p>
                        <Link to="/transactions" className="text-xs text-primary flex items-center gap-0.5">
                            Ver todas <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    {mobileTx.length === 0 ? (
                        <p className="text-sm text-muted-foreground px-4 pb-4">
                            {effectiveDashTab === "all" ? "No hay transacciones aún." : "Sin transacciones en esta cuenta."}
                        </p>
                    ) : (
                        <div className="divide-y">
                            {mobileTx.slice(0, 5).map((tx) => <TxRow key={tx.id} tx={tx} compact />)}
                        </div>
                    )}
                    <div className="px-4 py-2 border-t">
                        <Button variant="ghost" size="sm" className="w-full text-xs h-8"
                            onClick={() => navigate("/transactions?new=1")}>
                            <Plus className="h-3.5 w-3.5 mr-1" />Registrar transacción
                        </Button>
                    </div>
                </Card>
            </div>

            {/* ── Desktop header ── */}
            <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground capitalize mt-0.5">{monthLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                    <CurrencySelector />
                    <Button onClick={() => navigate("/transactions?new=1")} size="sm">
                        <Plus className="h-4 w-4 mr-1.5" />Nueva transacción
                    </Button>
                </div>
            </div>

            {/* ── Stats — solo desktop ── */}
            <TooltipProvider delayDuration={100}>
                <div className="hidden lg:grid grid-cols-4 gap-3">
                    {[
                        { label: "Ingresos", value: monthlyIncome, positive: true },
                        { label: "Gastos", value: monthlyExpense, positive: false },
                        { label: "Balance del mes", value: netMonth, positive: netMonth >= 0, colored: true },
                        {
                            label: "Ahorro total", value: totalSavings, positive: totalSavings >= 0, colored: true,
                            info: `Saldo disponible en cuentas líquidas (${formatCurrencyCode(liquidBalance, displayCurrency)}) más el valor actual de inversiones activas (${formatCurrencyCode(investedTotal, displayCurrency)}). Incluye fondos no disponibles para gastos inmediatos.`,
                        },
                    ].map(({ label, value, positive, colored, info }) => (
                        <Card key={label}>
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-1 mb-1">
                                    <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                                    {info && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3 w-3 text-muted-foreground/50 cursor-help shrink-0" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-64 text-xs leading-relaxed">
                                                {info}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                <p className={cn(
                                    "text-lg sm:text-xl font-bold leading-none",
                                    colored ? (positive ? "text-primary" : "text-destructive") : "text-foreground"
                                )}>
                                    {formatCurrencyCode(value, displayCurrency)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TooltipProvider>

            {/* ── Cuentas favoritas — solo desktop ── */}
            {favoriteAccounts.length > 0 && (
                <div className="hidden lg:block space-y-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-current text-chart-3" />
                        Cuentas favoritas
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {favoriteAccounts.map((acc) => {
                            const effective = computeEffective(acc);
                            return (
                                <Card key={acc.id}>
                                    <CardContent className="p-3">
                                        <p className="text-xs text-muted-foreground truncate">{acc.name}</p>
                                        <p className={cn("text-base font-bold mt-0.5 truncate", effective < 0 ? "text-destructive" : "text-foreground")}>
                                            {formatCurrencyCode(effective, acc.currency || "ARS")}
                                        </p>
                                        {(acc.currency || "ARS") !== displayCurrency && (
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                ≈ {formatCurrencyCode(convert(effective, acc.currency || "ARS"), displayCurrency)}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Budget ── */}
            {(() => {
                const budgetCard = (
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Presupuestos</CardTitle>
                            <Link to="/budgets" className="text-xs text-primary">Ver todos</Link>
                        </CardHeader>
                        <CardContent>
                            {monthBudgets.length === 0 ? (
                                <div className="h-24 flex items-center justify-center text-center text-muted-foreground text-sm">
                                    <div>
                                        <p>Sin presupuestos este mes</p>
                                        <Link to="/budgets" className="text-xs text-primary mt-1 block">Crear →</Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {monthBudgets.map((b) => {
                                        const spent = getBudgetSpent(b);
                                        const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
                                        const over = spent > b.amount;
                                        return (
                                            <div key={b.id} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium truncate max-w-[60%]">{b.category_name}</span>
                                                    <span className={cn("font-medium", over ? "text-destructive" : "text-muted-foreground")}>
                                                        {formatCurrencyCode(spent, b.currency || "ARS")} / {formatCurrencyCode(b.amount, b.currency || "ARS")}
                                                    </span>
                                                </div>
                                                <Progress value={pct}
                                                    className={cn(over ? "[&>div]:bg-destructive" : pct > 80 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-primary")} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
                return (
                    <>
                        <div className="lg:hidden">{budgetCard}</div>
                        <div className="hidden lg:grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <SpendingChart
                                    transactions={monthlyTx}
                                    convert={convert}
                                    displayCurrency={displayCurrency}
                                    monthLabel={monthLabel}
                                />
                            </div>
                            {budgetCard}
                        </div>
                    </>
                );
            })()}

            {/* ── Transacciones recientes — solo desktop ── */}
            <Card className="hidden lg:block overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-4 pb-3">
                    <p className="font-semibold">Transacciones recientes</p>
                    <Link to="/transactions" className="text-sm text-primary flex items-center gap-0.5">
                        Ver todas <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
                {recentTx.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-6 pb-6">No hay transacciones aún.</p>
                ) : (
                    <div className="divide-y px-4 pb-2">
                        {recentTx.map((tx) => <TxRow key={tx.id} tx={tx} />)}
                    </div>
                )}
            </Card>
        </div>
    );
}
