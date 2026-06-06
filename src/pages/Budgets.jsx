import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import { formatCurrency, formatCurrencyCode, isRegularExpense } from "@/lib/formatters";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

function toMonthKey(date) {
    return format(date, "yyyy-MM");
}

export default function Budgets() {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const queryClient = useQueryClient();
    const { displayCurrency, convert } = useCurrency();

    const monthKey = toMonthKey(currentMonth);
    const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const { data: allBudgets = [] } = useQuery({ queryKey: ["budgets"], queryFn: () => base44.entities.Budget.list() });
    const { data: transactions = [] } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list(),
    });
    const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => base44.entities.Category.list() });

    // Budgets for current month (month matches OR budget has no month = template)
    const budgets = allBudgets.filter((b) => b.month === monthKey);

    // Collect all category IDs that match the budget (parent + all its children)
    const getMatchingCategoryIds = (budget) => {
        if (!budget.category_id) return null;
        const ids = new Set([budget.category_id]);
        categories.forEach((c) => { if (c.parent_category === budget.category_id) ids.add(c.id); });
        return ids;
    };

    // Calculate actual amount for a budget (spent for expense budgets, received for income budgets)
    const getBudgetProgress = (budget) => {
        const cat = categories.find((c) => c.id === budget.category_id);
        const isIncome = cat?.type === "income";
        const matchIds = getMatchingCategoryIds(budget);
        return transactions
            .filter((tx) => {
                if (isIncome ? tx.type !== "income" : !isRegularExpense(tx)) return false;
                if (!tx.date) return false;
                if (tx.date < monthStart || tx.date > monthEnd) return false;
                if (tx.status === "projected") return false;
                if (matchIds && tx.category_id && matchIds.has(tx.category_id)) return true;
                if (!matchIds && budget.category_name && tx.category_name === budget.category_name) return true;
                return false;
            })
            .reduce((s, tx) => s + (tx.amount || 0), 0);
    };

    const createMut = useMutation({
        mutationFn: (d) => base44.entities.Budget.create(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); setShowForm(false); },
    });
    const updateMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Budget.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); setEditing(null); },
    });
    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.Budget.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
    });

    // Copy last month budgets to current month
    const prevMonthKey = toMonthKey(subMonths(currentMonth, 1));
    const prevBudgets = allBudgets.filter((b) => b.month === prevMonthKey);

    const copyFromLastMonth = async () => {
        if (prevBudgets.length === 0) { toast.error("No hay presupuestos del mes anterior"); return; }
        for (const b of prevBudgets) {
            await base44.entities.Budget.create({ ...b, id: undefined, month: monthKey, spent: 0 });
        }
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        toast.success(`${prevBudgets.length} presupuestos copiados`);
    };

    const expBudgets = budgets.filter((b) => categories.find((c) => c.id === b.category_id)?.type !== "income");
    const incBudgets = budgets.filter((b) => categories.find((c) => c.id === b.category_id)?.type === "income");
    const totalBudget = expBudgets.reduce((s, b) => s + convert(b.amount || 0, b.currency || "MXN"), 0);
    const totalSpent = expBudgets.reduce((s, b) => s + convert(getBudgetProgress(b), b.currency || "MXN"), 0);
    const isCurrentMonth = monthKey === toMonthKey(new Date());

    return (
        <div className="space-y-5">
            <PageHeader
                title="Presupuestos"
                action={
                    budgets.length > 0 ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                            {prevBudgets.length > 0 && (
                                <Button variant="outline" size="sm" onClick={copyFromLastMonth}>
                                    <RefreshCw className="h-4 w-4 mr-1.5" />Copiar del mes anterior
                                </Button>
                            )}
                            <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1.5" />Nuevo</Button>
                        </div>
                    ) : null
                }
            />

            {/* Month navigator */}
            <div className="flex items-center justify-between bg-card border rounded-xl px-4 py-3">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                    <p className="font-semibold capitalize">{format(currentMonth, "MMMM yyyy", { locale: es })}</p>
                    {isCurrentMonth && <Badge variant="secondary" className="text-xs mt-0.5">Mes actual</Badge>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Summary bar — expense budgets only */}
            {expBudgets.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Total gastado</span>
                            <span className="font-medium">
                                {formatCurrencyCode(totalSpent, displayCurrency)} / {formatCurrencyCode(totalBudget, displayCurrency)}
                            </span>
                        </div>
                        <Progress
                            value={totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}
                            className={cn(totalSpent > totalBudget ? "[&>div]:bg-destructive" : "[&>div]:bg-primary")}
                        />
                        <p className={cn("text-xs mt-1.5 text-right font-medium", totalSpent > totalBudget ? "text-destructive" : "text-muted-foreground")}>
                            {totalSpent > totalBudget
                                ? `Excedido ${formatCurrencyCode(totalSpent - totalBudget, displayCurrency)}`
                                : `${formatCurrencyCode(totalBudget - totalSpent, displayCurrency)} restante`}
                        </p>
                    </CardContent>
                </Card>
            )}

            {budgets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium mb-1">Sin presupuestos este mes</p>
                    <p className="text-sm mb-4">
                        {prevBudgets.length > 0 ? "Puedes copiar los del mes anterior o crear nuevos." : "Crea tu primer presupuesto."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                        {prevBudgets.length > 0 && (
                            <Button variant="outline" onClick={copyFromLastMonth}>
                                <RefreshCw className="h-4 w-4 mr-1.5" />Copiar del mes anterior
                            </Button>
                        )}
                        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1.5" />Nuevo presupuesto</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    {expBudgets.length > 0 && (
                        <div className="space-y-3">
                            {budgets.length !== expBudgets.length && (
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gastos</p>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {expBudgets.map((b, i) => {
                                    const progress = getBudgetProgress(b);
                                    const pct = b.amount > 0 ? Math.min((progress / b.amount) * 100, 100) : 0;
                                    const over = progress > b.amount;
                                    const remaining = b.amount - progress;
                                    return (
                                        <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                            <Card className="hover:shadow-lg transition-shadow">
                                                <CardContent className="p-5 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold truncate">{b.category_name}</p>
                                                            {b.category_id && (() => {
                                                                const childCount = categories.filter((c) => c.parent_category === b.category_id).length;
                                                                return childCount > 0
                                                                    ? <p className="text-xs text-muted-foreground">incluye {childCount} subcategoría{childCount > 1 ? "s" : ""}</p>
                                                                    : null;
                                                            })()}
                                                        </div>
                                                        <div className="flex gap-1 shrink-0">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMut.mutate(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                                        </div>
                                                    </div>
                                                    <Progress value={pct} className={cn(over ? "[&>div]:bg-destructive" : pct > 80 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-primary")} />
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{formatCurrencyCode(progress, b.currency || "MXN")} gastado</span>
                                                        <span className={cn("font-medium", over ? "text-destructive" : "text-primary")}>
                                                            {over ? `Excedido ${formatCurrencyCode(Math.abs(remaining), b.currency || "MXN")}` : `${formatCurrencyCode(remaining, b.currency || "MXN")} restante`}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground text-right">{pct.toFixed(0)}% de {formatCurrencyCode(b.amount, b.currency || "MXN")}</p>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {incBudgets.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ingresos esperados</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {incBudgets.map((b, i) => {
                                    const received = getBudgetProgress(b);
                                    const pct = b.amount > 0 ? Math.min((received / b.amount) * 100, 100) : 0;
                                    const reached = received >= b.amount;
                                    const remaining = b.amount - received;
                                    return (
                                        <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                            <Card className="hover:shadow-lg transition-shadow">
                                                <CardContent className="p-5 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold truncate">{b.category_name}</p>
                                                        <div className="flex gap-1 shrink-0">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMut.mutate(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                                        </div>
                                                    </div>
                                                    <Progress value={pct} className="[&>div]:bg-primary" />
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{formatCurrencyCode(received, b.currency || "MXN")} recibido</span>
                                                        <span className={cn("font-medium", reached ? "text-primary" : "text-muted-foreground")}>
                                                            {reached ? "Meta alcanzada" : `${formatCurrencyCode(remaining, b.currency || "MXN")} por recibir`}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground text-right">{pct.toFixed(0)}% de {formatCurrencyCode(b.amount, b.currency || "MXN")}</p>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <BudgetFormDialog
                open={showForm || !!editing}
                onClose={() => { setShowForm(false); setEditing(null); }}
                initial={editing}
                categories={categories}
                monthKey={monthKey}
                onSubmit={(data) => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate({ ...data, month: monthKey })}
            />
        </div>
    );
}

function BudgetFormDialog({ open, onClose, onSubmit, initial, categories, monthKey }) {
    const { activeCurrencies } = useCurrency();
    const defaultCurrency = activeCurrencies[0] || "MXN";
    const [form, setForm] = useState({ category_name: "", amount: "", period: "monthly", spent: 0, currency: defaultCurrency });
    useEffect(() => {
        if (initial) setForm({ ...initial, amount: String(initial.amount || ""), currency: initial.currency || defaultCurrency });
        else setForm({ category_name: "", amount: "", period: "monthly", spent: 0, currency: defaultCurrency });
    }, [initial, open]);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleCat = (id) => {
        const cat = categories.find((c) => c.id === id);
        set("category_id", id);
        set("category_name", cat?.name || "");
    };

    // Build ordered list: parents first (by sort_order), then their children indented
    const parents = [...categories.filter((c) => !c.parent_category)].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
    const children = [...categories.filter((c) => !!c.parent_category)].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
    const orderedCats = [];
    parents.forEach((p) => {
        orderedCats.push({ ...p, isParent: true });
        children.filter((c) => c.parent_category === p.id).forEach((c) => orderedCats.push({ ...c, isParent: false }));
    });
    // Orphan children (parent not found in list)
    children.filter((c) => !parents.find((p) => p.id === c.parent_category)).forEach((c) => orderedCats.push({ ...c, isParent: false }));

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{initial ? "Editar" : "Nuevo"} presupuesto</DialogTitle></DialogHeader>
                <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!form.category_id && !form.category_name.trim()) return;
                        onSubmit({ ...form, amount: parseFloat(form.amount) || 0 });
                    }} className="space-y-4">
                    <div>
                        <Label>Categoría <span className="text-destructive">*</span></Label>
                        <p className="text-xs text-muted-foreground mb-1.5">
                            Si elegís una categoría padre, se suman los gastos de todas sus subcategorías.
                        </p>
                        {categories.length === 0 ? (
                            <p className="text-sm text-muted-foreground border rounded-md px-3 py-2">
                                Primero creá categorías de gasto en la sección <strong>Categorías</strong>.
                            </p>
                        ) : (
                            <Select value={form.category_id || ""} onValueChange={handleCat} required>
                                <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                                <SelectContent>
                                    {orderedCats.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.isParent ? c.name : `  ↳ ${c.name}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><Label>Monto</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} required /></div>
                        <div><Label>Moneda</Label>
                            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{activeCurrencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1">{initial ? "Guardar" : "Crear"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}