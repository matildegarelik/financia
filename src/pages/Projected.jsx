import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight, ChevronDown, TrendingUp, TrendingDown, Target, CloudLightning, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/shared/PageHeader";
import CurrencySelector from "@/components/shared/CurrencySelector";
import TransactionFormProjected from "@/components/transactions/TransactionFormProjected";
import { formatCurrency, formatCurrencyCode, formatDate, getCurrentMonth, getMonthLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency-context";
import { toast } from "sonner";

function addMonths(yyyymm, n) {
    const [y, m] = yyyymm.split("-").map(Number);
    const d = new Date(y, m - 1 + n, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function txMonth(tx) {
    return tx.date ? tx.date.slice(0, 7) : null;
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function Projected() {
    const [view, setView] = useState("monthly");
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [expandedMonths, setExpandedMonths] = useState(new Set());
    const [expandedYears, setExpandedYears] = useState(new Set());

    const toggleMonth = (yyyymm) => setExpandedMonths((prev) => {
        const next = new Set(prev);
        next.has(yyyymm) ? next.delete(yyyymm) : next.add(yyyymm);
        return next;
    });
    const toggleYear = (year) => setExpandedYears((prev) => {
        const next = new Set(prev);
        next.has(year) ? next.delete(year) : next.add(year);
        return next;
    });
    const queryClient = useQueryClient();
    const { convert, displayCurrency } = useCurrency();

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date", 500),
    });
    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
    const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => base44.entities.Category.list() });

    const createMut = useMutation({
        mutationFn: (data) => base44.entities.Transaction.create({ ...data, status: "projected" }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); setShowForm(false); toast.success("Proyección creada"); },
    });
    const updateMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); setEditing(null); },
    });
    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.Transaction.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    });

    const currentMonth = getCurrentMonth();
    const isFuture = selectedMonth > currentMonth;
    const isPast = selectedMonth < currentMonth;
    const isCurrent = selectedMonth === currentMonth;

    const [pastExpanded, setPastExpanded] = useState({});
    const togglePast = (key) => setPastExpanded((p) => ({ ...p, [key]: !p[key] }));

    // Balance líquido actual (cuentas no-inversión, calculado desde transacciones)
    const todayDate = new Date().toISOString().split("T")[0];
    const currentLiquidBalance = useMemo(() => {
        const liquidAccts = accounts.filter((a) => a.type !== "investment");
        return liquidAccts.reduce((sum, acc) => {
            const eff = transactions
                .filter((tx) => tx.status !== "projected" && tx.date && tx.date <= todayDate)
                .reduce((s, tx) => {
                    if (tx.account_id === acc.id) {
                        if (tx.type === "income") return s + (tx.amount || 0);
                        if (tx.type === "expense") return s - (tx.amount || 0);
                        if (tx.type === "transfer") return s - (tx.amount || 0);
                    }
                    if (tx.to_account_id === acc.id && tx.type === "transfer") return s + (tx.amount || 0);
                    return s;
                }, acc.balance || 0);
            return sum + convert(eff, acc.currency || "MXN");
        }, 0);
    }, [accounts, transactions, convert]);

    // Balance acumulado al final de un mes dado
    // Pasado: usa ahorro real; futuro: usa ahorro proyectado
    function getBalanceAtMonth(targetMonth) {
        if (targetMonth === currentMonth) return currentLiquidBalance;
        if (targetMonth > currentMonth) {
            let bal = currentLiquidBalance;
            let m = addMonths(currentMonth, 1);
            while (m <= targetMonth) { bal += computeMonth(m).projSavings; m = addMonths(m, 1); }
            return bal;
        } else {
            let bal = currentLiquidBalance;
            let m = currentMonth;
            while (m > targetMonth) { bal -= computeMonth(m).realSavings; m = addMonths(m, -1); }
            return bal;
        }
    }

    function byCurrency(txs) {
        return txs.reduce((acc, t) => {
            const c = t.currency || "MXN";
            acc[c] = (acc[c] || 0) + (t.amount || 0);
            return acc;
        }, {});
    }

    function computeMonth(yyyymm) {
        const projected = transactions.filter((t) => t.status === "projected" && txMonth(t) === yyyymm);
        const real = transactions.filter((t) => t.status !== "projected" && txMonth(t) === yyyymm);
        const projIncomeTxs = projected.filter((t) => t.type === "income");
        const projExpenseTxs = projected.filter((t) => t.type === "expense");
        const realIncomeTxs = real.filter((t) => t.type === "income");
        const realExpenseTxs = real.filter((t) => t.type === "expense");
        const projIncome = projIncomeTxs.reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
        const projExpense = projExpenseTxs.reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
        const realIncome = realIncomeTxs.reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
        const realExpense = realExpenseTxs.reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
        return {
            projected, real,
            projIncome, projExpense, projSavings: projIncome - projExpense,
            realIncome, realExpense, realSavings: realIncome - realExpense,
            projIncomeByC: byCurrency(projIncomeTxs),
            projExpenseByC: byCurrency(projExpenseTxs),
            realIncomeByC: byCurrency(realIncomeTxs),
            realExpenseByC: byCurrency(realExpenseTxs),
        };
    }

    const monthData = useMemo(() => computeMonth(selectedMonth), [transactions, selectedMonth, convert]);
    const { projected, projIncome, projExpense, projSavings, realIncome, realExpense, realSavings,
        projIncomeByC, projExpenseByC, realIncomeByC, realExpenseByC } = monthData;

    const diffIncome = realIncome - projIncome;
    const diffExpense = realExpense - projExpense;
    const diffSavings = realSavings - projSavings;

    const yearMonths = useMemo(() => Array.from({ length: 12 }, (_, i) => {
        const m = String(i + 1).padStart(2, "0");
        const yyyymm = `${selectedYear}-${m}`;
        return { yyyymm, monthName: MONTH_NAMES[i], ...computeMonth(yyyymm) };
    }), [transactions, selectedYear, convert]);

    const yearTotal = useMemo(() => yearMonths.reduce((acc, m) => ({
        projIncome: acc.projIncome + m.projIncome,
        projExpense: acc.projExpense + m.projExpense,
        projSavings: acc.projSavings + m.projSavings,
        realIncome: acc.realIncome + m.realIncome,
        realExpense: acc.realExpense + m.realExpense,
        realSavings: acc.realSavings + m.realSavings,
    }), { projIncome: 0, projExpense: 0, projSavings: 0, realIncome: 0, realExpense: 0, realSavings: 0 }), [yearMonths]);

    const allYears = useMemo(() => {
        const years = [...new Set(transactions.map((t) => t.date?.slice(0, 4)).filter(Boolean))].sort();
        const thisYear = String(new Date().getFullYear());
        if (!years.includes(thisYear)) years.push(thisYear);
        return years.map((year) => {
            const txsOfYear = transactions.filter((t) => t.date?.startsWith(year));
            const projTxs = txsOfYear.filter((t) => t.status === "projected");
            const realTxs = txsOfYear.filter((t) => t.status !== "projected");
            const projInc = projTxs.filter((t) => t.type === "income").reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
            const projExp = projTxs.filter((t) => t.type === "expense").reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
            const realInc = realTxs.filter((t) => t.type === "income").reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
            const realExp = realTxs.filter((t) => t.type === "expense").reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
            return {
                year,
                projIncome: projInc, projExpense: projExp, projSavings: projInc - projExp,
                realIncome: realInc, realExpense: realExp, realSavings: realInc - realExp,
                isCurrent: year === thisYear,
            };
        });
    }, [transactions, convert]);

    function CurrencyLines({ byC, total, colorClass = "" }) {
        const [expanded, setExpanded] = useState(false);
        const entries = Object.entries(byC).filter(([, v]) => v !== 0);

        if (entries.length === 0) {
            return <p className={cn("text-sm font-semibold", colorClass)}>{formatCurrencyCode(0, displayCurrency)}</p>;
        }

        // Single currency matching displayCurrency — no expansion needed
        const needsExpansion = entries.length > 1 || entries[0][0] !== displayCurrency;
        if (!needsExpansion) {
            return <p className={cn("text-sm font-semibold", colorClass)}>{formatCurrencyCode(entries[0][1], entries[0][0])}</p>;
        }

        return (
            <div>
                <button type="button" className="inline-flex items-center gap-1" onClick={() => setExpanded((e) => !e)}>
                    <span className={cn("text-sm font-semibold", colorClass)}>{formatCurrencyCode(total, displayCurrency)}</span>
                    <ChevronDown className={cn("h-3 w-3 text-muted-foreground shrink-0 transition-transform", expanded && "rotate-180")} />
                </button>
                {expanded && (
                    <div className="mt-1 space-y-0.5">
                        {entries.map(([c, v]) => (
                            <p key={c} className="text-xs text-muted-foreground leading-tight">{formatCurrencyCode(v, c)}</p>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <PageHeader
                title="Proyectado"
                description="Seguimiento de metas vs realidad"
                action={
                    <div className="flex items-center gap-2">
                        <CurrencySelector />
                        <Button size="sm" onClick={() => setShowForm(true)}>
                            <Plus className="h-4 w-4 mr-1.5" />Nueva proyección
                        </Button>
                    </div>
                }
            />

            <Tabs value={view} onValueChange={setView}>
                <TabsList>
                    <TabsTrigger value="monthly">Mensual</TabsTrigger>
                    <TabsTrigger value="yearly">Anual</TabsTrigger>
                    <TabsTrigger value="summary">Resumen</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* ── Patrimonio estimado — persistente en todas las vistas ── */}
            {(() => {
                const refMonth = view === "monthly" ? selectedMonth
                    : view === "yearly" ? `${selectedYear}-12`
                        : currentMonth;
                const balance = getBalanceAtMonth(refMonth);
                const delta = balance - currentLiquidBalance;
                const isRefPast = refMonth < currentMonth;
                const isRefFuture = refMonth > currentMonth;
                const label = isRefPast ? `al fin de ${getMonthLabel(refMonth)}`
                    : isRefFuture ? `estimado al fin de ${getMonthLabel(refMonth)}`
                        : "actual";
                return (
                    <Card className={cn("border-2", balance >= 0 ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5")}>
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Ahorro {label}</p>
                                <p className={cn("text-2xl font-bold mt-0.5", balance >= 0 ? "text-primary" : "text-destructive")}>
                                    {formatCurrencyCode(balance, displayCurrency)}
                                </p>
                            </div>
                            {delta !== 0 && (
                                <div className="text-right shrink-0">
                                    <p className="text-xs text-muted-foreground">vs hoy</p>
                                    <p className={cn("text-sm font-semibold", delta >= 0 ? "text-primary" : "text-destructive")}>
                                        {delta >= 0 ? "+" : ""}{formatCurrencyCode(delta, displayCurrency)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })()}

            {/* ── MONTHLY VIEW ── */}
            {view === "monthly" && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(addMonths(selectedMonth, -1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-center">
                            <p className="font-semibold capitalize">{getMonthLabel(selectedMonth)}</p>
                            {selectedMonth === currentMonth && <Badge variant="secondary" className="text-xs mt-0.5">Mes actual</Badge>}
                            {isFuture && <Badge variant="outline" className="text-xs mt-0.5">Futuro</Badge>}
                            {selectedMonth < currentMonth && <Badge variant="outline" className="text-xs mt-0.5 text-muted-foreground">Pasado</Badge>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {isFuture ? (
                        /* ── Futuro: solo proyectado ── */
                        <div className="grid grid-cols-3 gap-3">
                            <Card><CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-1.5">Ingresos proy.</p>
                                <CurrencyLines byC={projIncomeByC} total={projIncome} colorClass="text-primary" />
                            </CardContent></Card>
                            <Card><CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-1.5">Gastos proy.</p>
                                <CurrencyLines byC={projExpenseByC} total={projExpense} colorClass="text-destructive" />
                            </CardContent></Card>
                            <Card><CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-1.5">Ahorro esperado</p>
                                <p className={cn("text-sm font-semibold", projSavings >= 0 ? "text-primary" : "text-destructive")}>
                                    {formatCurrencyCode(projSavings, displayCurrency)}
                                </p>
                            </CardContent></Card>
                        </div>
                    ) : isPast ? (
                        /* ── Pasado: real es primario, proyectado colapsable ── */
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { key: "income", label: "Ingresos", byC: realIncomeByC, total: realIncome, projByC: projIncomeByC, projTotal: projIncome, diff: diffIncome, colorClass: "text-primary", diffGood: diffIncome >= 0 },
                                { key: "expense", label: "Gastos", byC: realExpenseByC, total: realExpense, projByC: projExpenseByC, projTotal: projExpense, diff: diffExpense, colorClass: "text-destructive", diffGood: diffExpense <= 0 },
                                { key: "savings", label: "Ahorro", byC: null, total: realSavings, projTotal: projSavings, diff: diffSavings, colorClass: realSavings >= 0 ? "text-primary" : "text-destructive", diffGood: diffSavings >= 0 },
                            ].map(({ key, label, byC, total, projByC, projTotal, diff, colorClass, diffGood }) => (
                                <Card key={key} className="cursor-pointer" onClick={() => togglePast(key)}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-xs text-muted-foreground">{label}</p>
                                            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0", pastExpanded[key] && "rotate-180")} />
                                        </div>
                                        {byC
                                            ? <CurrencyLines byC={byC} total={total} colorClass={colorClass} />
                                            : <p className={cn("text-sm font-semibold", colorClass)}>{formatCurrencyCode(total, displayCurrency)}</p>
                                        }
                                        {pastExpanded[key] && (
                                            <div className="mt-2 pt-2 border-t border-border/50 space-y-0.5">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Proyectado</p>
                                                {projByC
                                                    ? <CurrencyLines byC={projByC} total={projTotal} colorClass="text-muted-foreground" />
                                                    : <p className="text-xs text-muted-foreground font-medium">{formatCurrencyCode(projTotal, displayCurrency)}</p>
                                                }
                                                {diff !== 0 && (
                                                    <p className={cn("text-xs font-semibold pt-0.5", diffGood ? "text-primary" : "text-destructive")}>
                                                        {diff >= 0 ? "+" : ""}{formatCurrencyCode(diff, displayCurrency)} vs meta
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        /* ── Mes actual: proyectado vs real lado a lado ── */
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground px-1">
                                <span></span>
                                <span className="text-center font-medium">Proyectado</span>
                                <span className="text-center font-medium">Real</span>
                            </div>
                            <Card><CardContent className="p-4">
                                <div className="grid grid-cols-3 gap-2 items-start">
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                                        <span className="text-sm font-medium">Ingresos</span>
                                    </div>
                                    <div className="text-center"><CurrencyLines byC={projIncomeByC} total={projIncome} colorClass="text-muted-foreground" /></div>
                                    <div className="text-center">
                                        <CurrencyLines byC={realIncomeByC} total={realIncome} colorClass="text-primary" />
                                        {diffIncome !== 0 && <p className={cn("text-xs mt-0.5", diffIncome >= 0 ? "text-primary" : "text-destructive")}>{diffIncome >= 0 ? "+" : ""}{formatCurrencyCode(diffIncome, displayCurrency)}</p>}
                                    </div>
                                </div>
                            </CardContent></Card>
                            <Card><CardContent className="p-4">
                                <div className="grid grid-cols-3 gap-2 items-start">
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        <TrendingDown className="h-4 w-4 text-destructive shrink-0" />
                                        <span className="text-sm font-medium">Gastos</span>
                                    </div>
                                    <div className="text-center"><CurrencyLines byC={projExpenseByC} total={projExpense} colorClass="text-muted-foreground" /></div>
                                    <div className="text-center">
                                        <CurrencyLines byC={realExpenseByC} total={realExpense} colorClass="text-destructive" />
                                        {diffExpense !== 0 && <p className={cn("text-xs mt-0.5", diffExpense <= 0 ? "text-primary" : "text-destructive")}>{diffExpense >= 0 ? "+" : ""}{formatCurrencyCode(diffExpense, displayCurrency)}</p>}
                                    </div>
                                </div>
                            </CardContent></Card>
                            <Card className={cn("border-2", diffSavings >= 0 ? "border-primary/30" : "border-destructive/30")}>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-3 gap-2 items-center">
                                        <div className="flex items-center gap-1.5">
                                            <Target className="h-4 w-4 text-chart-3 shrink-0" />
                                            <span className="text-sm font-medium">Ahorro</span>
                                        </div>
                                        <p className="text-center text-sm font-semibold text-muted-foreground">{formatCurrencyCode(projSavings, displayCurrency)}</p>
                                        <div className="text-center">
                                            <p className={cn("text-sm font-bold", realSavings >= 0 ? "text-primary" : "text-destructive")}>{formatCurrencyCode(realSavings, displayCurrency)}</p>
                                            {diffSavings !== 0 && <p className={cn("text-xs font-medium", diffSavings >= 0 ? "text-primary" : "text-destructive")}>{diffSavings >= 0 ? "+" : ""}{formatCurrencyCode(diffSavings, displayCurrency)} vs meta</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Proyecciones de {getMonthLabel(selectedMonth)}</h3>
                        {isLoading ? (
                            <p className="text-muted-foreground text-sm">Cargando...</p>
                        ) : projected.length === 0 ? (
                            <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">
                                <CloudLightning className="h-7 w-7 mx-auto mb-2 opacity-30" />
                                No hay proyecciones para este mes.
                            </CardContent></Card>
                        ) : (
                            <Card className="overflow-hidden">
                                <div className="divide-y divide-border">
                                    {projected.map((tx) => (
                                        <div key={tx.id} className="flex items-center gap-3 p-3 hover:bg-muted/20 cursor-pointer" onClick={() => setEditing(tx)}>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-medium truncate">{tx.description || (tx.type === "income" ? "Ingreso" : "Gasto")}</p>
                                                    {tx.project_name && <Badge variant="secondary" className="text-xs">{tx.project_name}</Badge>}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{tx.category_name && `${tx.category_name} · `}{formatDate(tx.date)}{tx.client_name && ` · ${tx.client_name}`}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <p className={cn("text-sm font-semibold", tx.type === "income" ? "text-primary" : "text-destructive")}>
                                                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, tx.currency || "MXN")}
                                                </p>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    onClick={(e) => { e.stopPropagation(); deleteMut.mutate(tx.id); }}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* ── YEARLY VIEW ── */}
            {view === "yearly" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedYear((y) => y - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                        <div className="text-center">
                            <p className="font-semibold">{selectedYear}</p>
                            {selectedYear === new Date().getFullYear() && <Badge variant="secondary" className="text-xs mt-0.5">Año actual</Badge>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedYear((y) => y + 1)}><ChevronRight className="h-4 w-4" /></Button>
                    </div>

                    <Card className="overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-[2.5rem_1fr_1fr_1.25rem] gap-2 px-4 py-2 border-b bg-muted/30 text-xs text-muted-foreground font-medium">
                            <span></span>
                            <span className="text-right">Del mes</span>
                            <span className="text-right">Ahorro total</span>
                            <span></span>
                        </div>
                        <div className="divide-y divide-border">
                            {yearMonths.map(({ yyyymm, monthName, realIncome, realExpense, realSavings, projSavings }) => {
                                const isCurrentM = yyyymm === currentMonth;
                                const isFutureM = yyyymm > currentMonth;
                                const monthlySavings = isFutureM ? projSavings : realSavings;
                                const accBalance = getBalanceAtMonth(yyyymm);
                                const isExpanded = expandedMonths.has(yyyymm);
                                const hasData = realIncome > 0 || realExpense > 0 || projSavings !== 0;
                                return (
                                    <div key={yyyymm} className={cn(isCurrentM && "bg-primary/5")}>
                                        <div className="grid grid-cols-[2.5rem_1fr_1fr_1.25rem] gap-2 items-center px-4 py-2.5 cursor-pointer hover:bg-muted/20 select-none"
                                            onClick={() => hasData && toggleMonth(yyyymm)}>
                                            <span className={cn("text-xs font-medium", isCurrentM ? "text-primary font-bold" : "text-muted-foreground")}>{monthName}</span>
                                            {/* Del mes */}
                                            <span className={cn("text-right text-sm font-semibold",
                                                !hasData ? "text-muted-foreground/30"
                                                    : isFutureM ? "text-muted-foreground/70 italic"
                                                        : monthlySavings >= 0 ? "text-primary" : "text-destructive")}>
                                                {!hasData ? "—"
                                                    : isFutureM && projSavings !== 0 ? `≈ ${formatCurrencyCode(projSavings, displayCurrency)}`
                                                        : isFutureM ? "—"
                                                            : formatCurrencyCode(realSavings, displayCurrency)}
                                            </span>
                                            {/* Ahorro total acumulado */}
                                            <span className={cn("text-right text-sm font-bold",
                                                accBalance >= 0 ? (isFutureM ? "text-primary/70" : "text-primary") : (isFutureM ? "text-destructive/70" : "text-destructive"))}>
                                                {isFutureM ? `≈ ${formatCurrencyCode(accBalance, displayCurrency)}` : formatCurrencyCode(accBalance, displayCurrency)}
                                            </span>
                                            {hasData
                                                ? <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform", isExpanded && "rotate-180")} />
                                                : <span />}
                                        </div>
                                        {isExpanded && (
                                            <div className="px-4 pb-3 space-y-1.5 bg-muted/10 border-t border-border/40">
                                                <div className="flex justify-between text-xs pt-2">
                                                    <span className="text-muted-foreground">Ingresos</span>
                                                    <span className="text-primary font-medium">{formatCurrencyCode(isFutureM ? 0 : realIncome, displayCurrency)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Gastos</span>
                                                    <span className="text-destructive font-medium">{formatCurrencyCode(isFutureM ? 0 : realExpense, displayCurrency)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs border-t border-border/40 pt-1.5">
                                                    <button className="text-muted-foreground underline-offset-2 hover:underline"
                                                        onClick={(e) => { e.stopPropagation(); setSelectedMonth(yyyymm); setView("monthly"); }}>
                                                        Ver detalle →
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Total row */}
                        <div className="grid grid-cols-[2.5rem_1fr_1fr_1.25rem] gap-2 items-center px-4 py-3 bg-muted/30 border-t-2">
                            <span className="text-xs font-bold text-muted-foreground">Total</span>
                            <span />
                            <span className={cn("text-right text-sm font-bold", getBalanceAtMonth(`${selectedYear}-12`) >= 0 ? "text-primary" : "text-destructive")}>
                                {formatCurrencyCode(getBalanceAtMonth(`${selectedYear}-12`), displayCurrency)}
                            </span>
                            <span />
                        </div>
                    </Card>
                    <p className="text-xs text-muted-foreground text-center">Expandí cada mes para ver el desglose.</p>
                </div>
            )}

            {/* ── SUMMARY VIEW ── */}
            {view === "summary" && (
                <div className="space-y-4">
                    <Card className="overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-[3rem_1fr_1fr_1.25rem] gap-2 px-4 py-2 border-b bg-muted/30 text-xs text-muted-foreground font-medium">
                            <span></span>
                            <span className="text-right">Del año</span>
                            <span className="text-right">Ahorro total</span>
                            <span></span>
                        </div>
                        <div className="divide-y divide-border">
                            {allYears.map(({ year, realIncome, realExpense, realSavings, isCurrent }) => {
                                const isExpanded = expandedYears.has(year);
                                const hasData = realIncome > 0 || realExpense > 0;
                                const accBalance = getBalanceAtMonth(`${year}-12`);
                                const isYearFuture = String(year) > String(new Date().getFullYear());
                                return (
                                    <div key={year} className={cn(isCurrent && "bg-primary/5")}>
                                        <div className="grid grid-cols-[3rem_1fr_1fr_1.25rem] gap-2 items-center px-4 py-3 cursor-pointer hover:bg-muted/20 select-none"
                                            onClick={() => toggleYear(year)}>
                                            <div className="shrink-0">
                                                <p className={cn("font-bold text-sm", isCurrent && "text-primary")}>{year}</p>
                                                {isCurrent && <p className="text-[10px] text-muted-foreground leading-none">en curso</p>}
                                            </div>
                                            <span className={cn("text-right text-sm font-semibold",
                                                !hasData ? "text-muted-foreground/30"
                                                    : realSavings >= 0 ? "text-primary" : "text-destructive")}>
                                                {hasData ? formatCurrencyCode(realSavings, displayCurrency) : "—"}
                                            </span>
                                            <span className={cn("text-right text-sm font-bold",
                                                accBalance >= 0 ? (isYearFuture ? "text-primary/70" : "text-primary") : (isYearFuture ? "text-destructive/70" : "text-destructive"))}>
                                                {isYearFuture ? `≈ ${formatCurrencyCode(accBalance, displayCurrency)}` : formatCurrencyCode(accBalance, displayCurrency)}
                                            </span>
                                            {hasData
                                                ? <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform", isExpanded && "rotate-180")} />
                                                : <span className="w-4 shrink-0" />}
                                        </div>
                                        {isExpanded && (
                                            <div className="px-4 pb-3.5 space-y-1.5 bg-muted/10 border-t border-border/40">
                                                <div className="flex justify-between text-sm pt-2">
                                                    <span className="text-muted-foreground">Ingresos</span>
                                                    <span className="text-primary font-medium">{formatCurrencyCode(realIncome, displayCurrency)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Gastos</span>
                                                    <span className="text-destructive font-medium">{formatCurrencyCode(realExpense, displayCurrency)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs border-t border-border/40 pt-1.5">
                                                    <button className="text-muted-foreground underline-offset-2 hover:underline"
                                                        onClick={(e) => { e.stopPropagation(); setSelectedYear(parseInt(year)); setView("yearly"); }}>
                                                        Ver meses →
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                    <p className="text-xs text-muted-foreground text-center">Expandí cada año para ver el desglose o clic en "Ver meses".</p>
                </div>
            )}

            <TransactionFormProjected
                open={showForm}
                onClose={() => setShowForm(false)}
                accounts={accounts}
                categories={categories}
                defaultMonth={selectedMonth}
                onSubmit={(d) => createMut.mutate(d)}
            />
            {editing && (
                <TransactionFormProjected
                    open={!!editing}
                    onClose={() => setEditing(null)}
                    accounts={accounts}
                    categories={categories}
                    initial={editing}
                    onSubmit={(d) => updateMut.mutate({ id: editing.id, data: d })}
                />
            )}
        </div>
    );
}
