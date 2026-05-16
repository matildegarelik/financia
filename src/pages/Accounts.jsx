import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Wallet, CreditCard, Banknote, PiggyBank, TrendingUp, MoreHorizontal, Trash2, Pencil, Lock, Bitcoin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { formatCurrency, formatCurrencyCode, ACCOUNT_TYPES, CURRENCIES } from "@/lib/formatters";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const iconMap = {
    checking: Wallet, savings: PiggyBank, credit_card: CreditCard,
    debit_card: CreditCard, cash: Banknote, investment: Lock, crypto: Bitcoin, other: Wallet,
};

export default function Accounts() {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const queryClient = useQueryClient();
    const { displayCurrency, convert } = useCurrency();

    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ["accounts"],
        queryFn: () => base44.entities.Account.list(),
    });
    const { data: investments = [] } = useQuery({
        queryKey: ["investments"],
        queryFn: () => base44.entities.Investment.list(),
    });
    const { data: transactions = [] } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date", 500),
    });

    const today = new Date().toISOString().split("T")[0];

    function computeEffectiveBalance(acc) {
        const initial = acc.balance || 0;
        return transactions
            .filter((tx) => tx.status !== "projected" && tx.date && tx.date <= today)
            .reduce((sum, tx) => {
                if (tx.account_id === acc.id) {
                    if (tx.type === "income") return sum + (tx.amount || 0);
                    if (tx.type === "expense") return sum - (tx.amount || 0);
                    if (tx.type === "transfer") return sum - (tx.amount || 0);
                }
                if (tx.to_account_id === acc.id && tx.type === "transfer") {
                    return sum + (tx.amount || 0);
                }
                return sum;
            }, initial);
    }

    const createMut = useMutation({
        mutationFn: (d) => base44.entities.Account.create(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["accounts"] }); setShowForm(false); },
    });
    const updateMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Account.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["accounts"] }); setEditing(null); },
    });
    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.Account.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
    });

    // Balance by currency (liquid only), using computed effective balance
    const liquidAccounts = accounts.filter((a) => a.type !== "investment");
    const byCurrency = liquidAccounts.reduce((acc, a) => {
        const c = a.currency || "MXN";
        acc[c] = (acc[c] || 0) + computeEffectiveBalance(a);
        return acc;
    }, {});

    const totalInDisplayCurrency = liquidAccounts.reduce(
        (s, a) => s + convert(computeEffectiveBalance(a), a.currency || "MXN"), 0
    );
    const investedTotal = investments.reduce(
        (s, i) => s + convert(i.current_value || i.amount_invested || 0, i.currency || "MXN"), 0
    );

    return (
        <div className="space-y-5">
            <PageHeader title="Cuentas" action={
                <div className="flex items-center gap-2">
                    <CurrencySelector />
                    <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1.5" />Nueva</Button>
                </div>
            } />

            {/* Balance summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="col-span-2 lg:col-span-2">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total disponible</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(totalInDisplayCurrency, displayCurrency)}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(byCurrency).map(([c, v]) => (
                                <Badge key={c} variant="outline" className="text-xs font-mono">
                                    {formatCurrencyCode(v, c)}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-2 lg:col-span-2">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total invertido</p>
                        <p className="text-2xl font-bold text-chart-2">{formatCurrency(investedTotal, displayCurrency)}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {(() => {
                                const byC = investments.reduce((acc, i) => {
                                    const c = i.currency || "MXN";
                                    acc[c] = (acc[c] || 0) + (i.current_value || i.amount_invested || 0);
                                    return acc;
                                }, {});
                                return Object.entries(byC).map(([c, v]) => (
                                    <Badge key={c} variant="outline" className="text-xs font-mono">{formatCurrencyCode(v, c)}</Badge>
                                ));
                            })()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">No disponible para gastos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Account cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((acc, i) => {
                    const Icon = iconMap[acc.type] || Wallet;
                    const isInvestment = acc.type === "investment";
                    return (
                        <motion.div key={acc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className={cn("relative group hover:shadow-lg transition-shadow", isInvestment && "border-chart-2/30")}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2.5 rounded-xl", isInvestment ? "bg-chart-2/10" : "bg-primary/10")}>
                                                <Icon className={cn("h-5 w-5", isInvestment ? "text-chart-2" : "text-primary")} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{acc.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Badge variant="secondary" className="text-xs">{ACCOUNT_TYPES[acc.type]}</Badge>
                                                    <Badge variant="outline" className="text-xs font-mono">{acc.currency || "MXN"}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditing(acc)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => deleteMut.mutate(acc.id)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    {(() => {
                                        const effective = computeEffectiveBalance(acc);
                                        const linkedInvs = investments.filter((i) => i.account_id === acc.id);
                                        const investedAmt = linkedInvs.reduce((s, i) => s + (i.current_value || i.amount_invested || 0), 0);
                                        const liquid = effective - investedAmt;
                                        return (
                                            <>
                                                <p className={cn("text-2xl font-bold mt-4", effective >= 0 ? "text-foreground" : "text-destructive")}>
                                                    {formatCurrency(effective, acc.currency || "MXN")}
                                                </p>
                                                {(acc.currency || "MXN") !== displayCurrency && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        ≈ {formatCurrency(convert(effective, acc.currency || "MXN"), displayCurrency)}
                                                    </p>
                                                )}
                                                {linkedInvs.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-border/50 grid grid-cols-2 gap-x-2 text-xs">
                                                        <span className="text-muted-foreground">Disponible</span>
                                                        <span className="text-right font-medium text-primary">{formatCurrency(liquid, acc.currency || "MXN")}</span>
                                                        <span className="text-muted-foreground">Invertido</span>
                                                        <span className="text-right font-medium text-chart-2">{formatCurrency(investedAmt, acc.currency || "MXN")}</span>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <AccountFormDialog open={showForm || !!editing} onClose={() => { setShowForm(false); setEditing(null); }}
                initial={editing} onSubmit={(data) => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)} />
        </div>
    );
}

function AccountFormDialog({ open, onClose, onSubmit, initial }) {
    const { activeCurrencies } = useCurrency();
    const defaultCurrency = activeCurrencies[0] || "MXN";
    const [form, setForm] = useState({ name: "", type: "checking", currency: defaultCurrency, balance: 0 });
    useEffect(() => {
        if (initial) setForm({ ...initial, balance: String(initial.balance || 0) });
        else setForm({ name: "", type: "checking", currency: defaultCurrency, balance: 0 });
    }, [initial, open]);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{initial ? "Editar" : "Nueva"} cuenta</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, balance: parseFloat(form.balance) || 0 }); }} className="space-y-4">
                    <div><Label>Nombre</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
                    <div><Label>Tipo</Label>
                        <Select value={form.type} onValueChange={(v) => set("type", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(ACCOUNT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div><Label>Moneda</Label>
                        <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {activeCurrencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Saldo inicial</Label>
                        <p className="text-xs text-muted-foreground mb-1">Saldo antes de tus primeras transacciones registradas</p>
                        <Input type="number" step="0.01" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
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