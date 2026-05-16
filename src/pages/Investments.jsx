import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Target, CloudLightning, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import TransactionFormProjected from "@/components/transactions/TransactionFormProjected";
import { formatCurrency, formatDate, getCurrentMonth, getMonthLabel } from "@/lib/formatters";
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

export default function Projected() {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
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
    const isPastOrCurrent = selectedMonth <= currentMonth;
    const isFuture = selectedMonth > currentMonth;

    // Transacciones del mes seleccionado
    const monthData = useMemo(() => {
        const projected = transactions.filter((t) => t.status === "projected" && txMonth(t) === selectedMonth);
        const real = transactions.filter((t) => t.status !== "projected" && txMonth(t) === selectedMonth);

        const projIncome = projected.filter((t) => t.type === "income").reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
        const projExpense = projected.filter((t) => t.type === "expense").reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
        const projSavings = projIncome - projExpense;

        const realIncome = real.filter((t) => t.type === "income").reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
        const realExpense = real.filter((t) => t.type === "expense").reduce((s, t) => s + convert(t.amount || 0, t.currency || "MXN"), 0);
        const realSavings = realIncome - realExpense;

        return { projected, real, projIncome, projExpense, projSavings, realIncome, realExpense, realSavings };
    }, [transactions, selectedMonth, convert]);

    const { projected, projIncome, projExpense, projSavings, realIncome, realExpense, realSavings } = monthData;

    const diffIncome = realIncome - projIncome;
    const diffExpense = realExpense - projExpense;
    const diffSavings = realSavings - projSavings;

    return (
        <div className="space-y-5">
            <PageHeader
                title="Proyectado"
                description="Seguimiento de metas vs realidad por mes"
                action={
                    <Button size="sm" onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-1.5" />Nueva proyección
                    </Button>
                }
            />

            {/* Navegación de mes */}
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

            {/* Tarjetas de resumen */}
            {isFuture ? (
                // Vista futura: solo proyectado
                <div className="grid grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Ingresos proyectados</p>
                            <p className="text-lg font-bold text-primary">{formatCurrency(projIncome, displayCurrency)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Gastos proyectados</p>
                            <p className="text-lg font-bold text-destructive">{formatCurrency(projExpense, displayCurrency)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Ahorro esperado</p>
                            <p className={cn("text-lg font-bold", projSavings >= 0 ? "text-primary" : "text-destructive")}>
                                {formatCurrency(projSavings, displayCurrency)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                // Vista actual/pasada: proyectado vs real con diferencias
                <div className="space-y-3">
                    {/* Header de comparativa */}
                    <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground px-1">
                        <span></span>
                        <span className="text-center font-medium">Proyectado</span>
                        <span className="text-center font-medium">Real</span>
                    </div>

                    {/* Ingresos */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                                    <span className="text-sm font-medium">Ingresos</span>
                                </div>
                                <p className="text-center text-sm font-semibold text-muted-foreground">{formatCurrency(projIncome, displayCurrency)}</p>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-primary">{formatCurrency(realIncome, displayCurrency)}</p>
                                    {diffIncome !== 0 && (
                                        <p className={cn("text-xs", diffIncome >= 0 ? "text-primary" : "text-destructive")}>
                                            {diffIncome >= 0 ? "+" : ""}{formatCurrency(diffIncome, displayCurrency)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gastos */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <div className="flex items-center gap-1.5">
                                    <TrendingDown className="h-4 w-4 text-destructive shrink-0" />
                                    <span className="text-sm font-medium">Gastos</span>
                                </div>
                                <p className="text-center text-sm font-semibold text-muted-foreground">{formatCurrency(projExpense, displayCurrency)}</p>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-destructive">{formatCurrency(realExpense, displayCurrency)}</p>
                                    {diffExpense !== 0 && (
                                        <p className={cn("text-xs", diffExpense <= 0 ? "text-primary" : "text-destructive")}>
                                            {diffExpense >= 0 ? "+" : ""}{formatCurrency(diffExpense, displayCurrency)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ahorro */}
                    <Card className={cn("border-2", diffSavings >= 0 ? "border-primary/30" : "border-destructive/30")}>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <div className="flex items-center gap-1.5">
                                    <Target className="h-4 w-4 text-chart-3 shrink-0" />
                                    <span className="text-sm font-medium">Ahorro</span>
                                </div>
                                <p className="text-center text-sm font-semibold text-muted-foreground">{formatCurrency(projSavings, displayCurrency)}</p>
                                <div className="text-center">
                                    <p className={cn("text-sm font-bold", realSavings >= 0 ? "text-primary" : "text-destructive")}>
                                        {formatCurrency(realSavings, displayCurrency)}
                                    </p>
                                    {diffSavings !== 0 && (
                                        <p className={cn("text-xs font-medium", diffSavings >= 0 ? "text-primary" : "text-destructive")}>
                                            {diffSavings >= 0 ? "+" : ""}{formatCurrency(diffSavings, displayCurrency)} vs meta
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Lista de proyecciones del mes */}
            <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Proyecciones de {getMonthLabel(selectedMonth)}
                </h3>
                {isLoading ? (
                    <p className="text-muted-foreground text-sm">Cargando...</p>
                ) : projected.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground text-sm">
                            <CloudLightning className="h-7 w-7 mx-auto mb-2 opacity-30" />
                            No hay proyecciones para este mes.
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden">
                        <div className="divide-y divide-border">
                            {projected.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center gap-3 p-3 hover:bg-muted/20 cursor-pointer"
                                    onClick={() => setEditing(tx)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-medium truncate">{tx.description || (tx.type === "income" ? "Ingreso" : "Gasto")}</p>
                                            {tx.probability != null && (
                                                <Badge variant="outline" className="text-xs">{tx.probability}%</Badge>
                                            )}
                                            {tx.project_name && <Badge variant="secondary" className="text-xs">{tx.project_name}</Badge>}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {tx.category_name && `${tx.category_name} · `}{formatDate(tx.date)}
                                            {tx.client_name && ` · ${tx.client_name}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <p className={cn("text-sm font-semibold", tx.type === "income" ? "text-primary" : "text-destructive")}>
                                            {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, tx.currency || "MXN")}
                                        </p>
                                        <Button
                                            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); deleteMut.mutate(tx.id); }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            <TransactionFormProjected
                open={showForm}
                onClose={() => setShowForm(false)}
                accounts={accounts}
                categories={categories}
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