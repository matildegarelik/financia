import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, TrendingDown, Trash2, Pencil, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { formatCurrency, INVESTMENT_TYPES } from "@/lib/formatters";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Investments() {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const queryClient = useQueryClient();

    const { data: investments = [] } = useQuery({ queryKey: ["investments"], queryFn: () => base44.entities.Investment.list() });
    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });

    const createMut = useMutation({
        mutationFn: (d) => base44.entities.Investment.create(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["investments"] }); setShowForm(false); },
    });
    const updateMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Investment.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["investments"] }); setEditing(null); },
    });
    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.Investment.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investments"] }),
    });

    const totalInvested = investments.reduce((s, i) => s + (i.amount_invested || 0), 0);
    const totalCurrent = investments.reduce((s, i) => s + (i.current_value || i.amount_invested || 0), 0);
    const totalReturn = totalCurrent - totalInvested;
    const returnPct = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            <PageHeader title="Inversiones" description="Gestiona tu portafolio de inversiones"
                action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Nueva inversión</Button>}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total invertido" value={formatCurrency(totalInvested)} icon={TrendingUp} />
                <StatCard title="Valor actual" value={formatCurrency(totalCurrent)} icon={TrendingUp} />
                <StatCard title="Rendimiento" value={`${returnPct}%`} subtitle={formatCurrency(totalReturn)}
                    icon={totalReturn >= 0 ? TrendingUp : TrendingDown} trendUp={totalReturn >= 0} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {investments.map((inv, i) => {
                    const ret = (inv.current_value || inv.amount_invested) - inv.amount_invested;
                    const retPct = inv.amount_invested > 0 ? ((ret / inv.amount_invested) * 100).toFixed(1) : 0;
                    return (
                        <motion.div key={inv.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold">{inv.name}</p>
                                            <Badge variant="secondary" className="mt-1 text-xs">{INVESTMENT_TYPES[inv.type] || inv.type}</Badge>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditing(inv)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => deleteMut.mutate(inv.id)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">{formatCurrency(inv.current_value || inv.amount_invested, inv.currency)}</p>
                                        <p className="text-xs text-muted-foreground">Invertido: {formatCurrency(inv.amount_invested, inv.currency)}</p>
                                    </div>
                                    <div className={cn("text-sm font-medium", ret >= 0 ? "text-primary" : "text-destructive")}>
                                        {ret >= 0 ? "↑" : "↓"} {retPct}% ({formatCurrency(Math.abs(ret), inv.currency)})
                                    </div>
                                    {inv.platform && <p className="text-xs text-muted-foreground">Plataforma: {inv.platform}</p>}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <InvestmentFormDialog open={showForm || !!editing} onClose={() => { setShowForm(false); setEditing(null); }}
                initial={editing} accounts={accounts} onSubmit={(data) => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)} />
        </div>
    );
}

function InvestmentFormDialog({ open, onClose, onSubmit, initial, accounts = [] }) {
    const { activeCurrencies } = useCurrency();
    const defaultCurrency = activeCurrencies[0] || "MXN";
    const blank = { name: "", type: "stocks", amount_invested: "", current_value: "", currency: defaultCurrency, platform: "", purchase_date: "", notes: "", account_id: "" };
    const [form, setForm] = useState(blank);
    React.useEffect(() => {
        if (initial) setForm({ ...blank, ...initial, amount_invested: String(initial.amount_invested || ""), current_value: String(initial.current_value || ""), account_id: initial.account_id || "" });
        else setForm({ ...blank, currency: defaultCurrency });
    }, [initial, open]);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{initial ? "Editar" : "Nueva"} inversión</DialogTitle></DialogHeader>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit({ ...form, amount_invested: parseFloat(form.amount_invested) || 0, current_value: parseFloat(form.current_value) || parseFloat(form.amount_invested) || 0, account_id: form.account_id || null });
                }} className="space-y-4">
                    <div><Label>Nombre</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
                    <div><Label>Tipo</Label>
                        <Select value={form.type} onValueChange={(v) => set("type", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.entries(INVESTMENT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><Label>Monto invertido</Label><Input type="number" step="0.01" value={form.amount_invested} onChange={(e) => set("amount_invested", e.target.value)} required /></div>
                        <div><Label>Valor actual</Label><Input type="number" step="0.01" value={form.current_value} onChange={(e) => set("current_value", e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><Label>Moneda</Label>
                            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{activeCurrencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div><Label>Fecha de compra</Label><Input type="date" value={form.purchase_date} onChange={(e) => set("purchase_date", e.target.value)} /></div>
                    </div>
                    {accounts.length > 0 && (
                        <div>
                            <Label>Cuenta de origen <span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
                            <Select value={form.account_id || "none"} onValueChange={(v) => set("account_id", v === "none" ? "" : v)}>
                                <SelectTrigger><SelectValue placeholder="Sin cuenta asociada" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sin cuenta asociada</SelectItem>
                                    {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "MXN"})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div><Label>Plataforma</Label><Input value={form.platform} onChange={(e) => set("platform", e.target.value)} placeholder="GBM, Bitso, etc." /></div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1">{initial ? "Guardar" : "Crear"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}