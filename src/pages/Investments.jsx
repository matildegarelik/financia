import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, TrendingDown, Trash2, Pencil, MoreHorizontal, CheckCircle2 } from "lucide-react";
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
import { formatCurrency, formatCurrencyCode, INVESTMENT_TYPES, TODAY } from "@/lib/formatters";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Investments() {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [finalizing, setFinalizing] = useState(null);
    const [withdrawing, setWithdrawing] = useState(null);
    const queryClient = useQueryClient();
    const { convert, displayCurrency } = useCurrency();

    const { data: investments = [] } = useQuery({ queryKey: ["investments"], queryFn: () => base44.entities.Investment.list() });
    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });

    const activeInvestments = investments.filter((i) => !i.status || i.status === "activa");
    const finalizedInvestments = investments.filter((i) => i.status === "finalizada");

    const totalInvested = activeInvestments.reduce((s, i) => s + convert(i.amount_invested || 0, i.currency || "ARS"), 0);
    const totalCurrent = activeInvestments.reduce((s, i) => s + convert(i.current_value || i.amount_invested || 0, i.currency || "ARS"), 0);
    const totalReturn = totalCurrent - totalInvested;
    const returnPct = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(1) : 0;

    const createMut = useMutation({
        mutationFn: async (d) => {
            const inv = await base44.entities.Investment.create({ ...d, status: "activa" });
            if (d.account_id) {
                const acc = accounts.find((a) => a.id === d.account_id);
                await base44.entities.Transaction.create({
                    type: "expense",
                    status: "confirmed",
                    date: d.purchase_date || TODAY,
                    amount: d.amount_invested,
                    currency: d.currency || "ARS",
                    account_id: d.account_id,
                    account_name: acc?.name || "",
                    description: `Inversión: ${d.name}`,
                    category_name: "Inversión",
                    is_investment_transfer: true,
                    reporting_mode: "investment",
                });
            }
            return inv;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investments"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            setShowForm(false);
            toast.success("Inversión creada");
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Investment.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investments"] });
            setEditing(null);
            toast.success("Inversión actualizada");
        },
    });

    const finalizeMut = useMutation({
        mutationFn: async ({ inv, finalAmount, targetAccountId, finalizationDate }) => {
            await base44.entities.Investment.update(inv.id, {
                status: "finalizada",
                final_amount: finalAmount,
                target_account_id: targetAccountId || null,
                finalization_date: finalizationDate,
                current_value: finalAmount,
            });
            if (targetAccountId) {
                const acc = accounts.find((a) => a.id === targetAccountId);
                await base44.entities.Transaction.create({
                    type: "income",
                    status: "confirmed",
                    date: finalizationDate || TODAY,
                    amount: finalAmount,
                    currency: inv.currency || "ARS",
                    account_id: targetAccountId,
                    account_name: acc?.name || "",
                    description: `Inversión finalizada: ${inv.name}`,
                    category_name: "Inversión",
                    reporting_mode: "investment",
                    is_investment_transfer: true,
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investments"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            setFinalizing(null);
            toast.success("Inversión finalizada y monto acreditado");
        },
    });

    const withdrawMut = useMutation({
        mutationFn: async ({ inv, amount, targetAccountId, withdrawalDate, remainingValue, countAsIncome }) => {
            const nextCurrentValue = Number.isFinite(remainingValue)
                ? remainingValue
                : Math.max(0, (Number(inv.current_value || inv.amount_invested) || 0) - amount);
            await base44.entities.Investment.update(inv.id, {
                current_value: nextCurrentValue,
                withdrawn_amount: (Number(inv.withdrawn_amount) || 0) + amount,
            });

            const acc = accounts.find((a) => a.id === targetAccountId);
            await base44.entities.Transaction.create({
                type: "income",
                status: "confirmed",
                date: withdrawalDate || TODAY,
                amount,
                currency: inv.currency || "ARS",
                account_id: targetAccountId,
                account_name: acc?.name || "",
                description: `Retiro inversión: ${inv.name}`,
                category_name: "Inversión",
                reporting_mode: countAsIncome ? "normal" : "investment",
                is_investment_transfer: !countAsIncome,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investments"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            setWithdrawing(null);
            toast.success("Retiro registrado");
        },
    });

    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.Investment.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investments"] }),
    });

    return (
        <div className="space-y-6">
            <PageHeader title="Inversiones" description="Gestiona tu portafolio de inversiones"
                action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Nueva inversión</Button>}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total invertido" value={formatCurrencyCode(totalInvested, displayCurrency)} icon={TrendingUp} />
                <StatCard title="Valor actual" value={formatCurrencyCode(totalCurrent, displayCurrency)} icon={TrendingUp} />
                <StatCard title="Rendimiento" value={`${returnPct}%`} subtitle={formatCurrencyCode(totalReturn, displayCurrency)}
                    icon={totalReturn >= 0 ? TrendingUp : TrendingDown} trendUp={totalReturn >= 0} />
            </div>

            {/* Active investments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeInvestments.map((inv, i) => (
                    <InvestmentCard key={inv.id} inv={inv} index={i}
                        onEdit={() => setEditing(inv)}
                        onWithdraw={() => setWithdrawing(inv)}
                        onFinalize={() => setFinalizing(inv)}
                        onDelete={() => deleteMut.mutate(inv.id)}
                    />
                ))}
            </div>

            {/* Finalized investments */}
            {finalizedInvestments.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Finalizadas</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {finalizedInvestments.map((inv, i) => (
                            <InvestmentCard key={inv.id} inv={inv} index={i}
                                onEdit={() => setEditing(inv)}
                                onDelete={() => deleteMut.mutate(inv.id)}
                                finalized
                            />
                        ))}
                    </div>
                </div>
            )}

            <InvestmentFormDialog
                open={showForm || !!editing}
                onClose={() => { setShowForm(false); setEditing(null); }}
                initial={editing}
                accounts={accounts}
                onSubmit={(data) => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)}
            />

            {finalizing && (
                <FinalizeDialog
                    inv={finalizing}
                    accounts={accounts}
                    onClose={() => setFinalizing(null)}
                    onSubmit={(params) => finalizeMut.mutate({ inv: finalizing, ...params })}
                    isPending={finalizeMut.isPending}
                />
            )}

            {withdrawing && (
                <WithdrawDialog
                    inv={withdrawing}
                    accounts={accounts}
                    onClose={() => setWithdrawing(null)}
                    onSubmit={(params) => withdrawMut.mutate({ inv: withdrawing, ...params })}
                    isPending={withdrawMut.isPending}
                />
            )}
        </div>
    );
}

function InvestmentCard({ inv, index, onEdit, onWithdraw, onFinalize, onDelete, finalized = false }) {
    const ret = (inv.current_value || inv.amount_invested) - inv.amount_invested;
    const retPct = inv.amount_invested > 0 ? ((ret / inv.amount_invested) * 100).toFixed(1) : 0;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className={cn("hover:shadow-lg transition-shadow", finalized && "opacity-60")}>
                <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-semibold">{inv.name}</p>
                            <div className="flex gap-1.5 mt-1">
                                <Badge variant="secondary" className="text-xs">{INVESTMENT_TYPES[inv.type] || inv.type}</Badge>
                                {finalized && (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />Finalizada
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                {!finalized && onWithdraw && (
                                    <DropdownMenuItem onClick={onWithdraw}>
                                        <TrendingDown className="h-4 w-4 mr-2" />Retirar
                                    </DropdownMenuItem>
                                )}
                                {!finalized && onFinalize && (
                                    <DropdownMenuItem onClick={onFinalize}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />Finalizar
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                                    <Trash2 className="h-4 w-4 mr-2" />Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div>
                        <p className="text-xl font-bold">{formatCurrency(inv.current_value || inv.amount_invested, inv.currency)}</p>
                        <p className="text-xs text-muted-foreground">Invertido: {formatCurrency(inv.amount_invested, inv.currency)}</p>
                        {finalized && inv.final_amount && (
                            <p className="text-xs text-muted-foreground">Monto final: {formatCurrency(inv.final_amount, inv.currency)}</p>
                        )}
                    </div>
                    {!finalized && (
                        <div className={cn("text-sm font-medium", ret >= 0 ? "text-primary" : "text-destructive")}>
                            {ret >= 0 ? "↑" : "↓"} {retPct}% ({formatCurrency(Math.abs(ret), inv.currency)})
                        </div>
                    )}
                    {inv.platform && <p className="text-xs text-muted-foreground">Plataforma: {inv.platform}</p>}
                </CardContent>
            </Card>
        </motion.div>
    );
}

function WithdrawDialog({ inv, accounts, onClose, onSubmit, isPending }) {
    const currentValue = Number(inv.current_value || inv.amount_invested) || 0;
    const [amount, setAmount] = useState("");
    const [targetAccountId, setTargetAccountId] = useState("");
    const [withdrawalDate, setWithdrawalDate] = useState(TODAY);
    const [remainingValue, setRemainingValue] = useState(String(currentValue));
    const [countAsIncome, setCountAsIncome] = useState(false);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Retirar inversión</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground -mt-2">{inv.name}</p>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit({
                        amount: parseFloat(amount) || 0,
                        targetAccountId,
                        withdrawalDate,
                        remainingValue: parseFloat(remainingValue),
                        countAsIncome,
                    });
                }} className="space-y-4">
                    <div>
                        <Label>Monto a retirar ({inv.currency || "ARS"})</Label>
                        <Input type="number" step="0.01" min="0" value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                const parsed = parseFloat(e.target.value) || 0;
                                setRemainingValue(String(Math.max(0, currentValue - parsed)));
                            }} required />
                    </div>
                    <div>
                        <Label>Valor actual restante</Label>
                        <Input type="number" step="0.01" min="0" value={remainingValue}
                            onChange={(e) => setRemainingValue(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Acreditar a cuenta</Label>
                        <Select value={targetAccountId} onValueChange={setTargetAccountId} required>
                            <SelectTrigger><SelectValue placeholder="Seleccionar cuenta" /></SelectTrigger>
                            <SelectContent>
                                {[...accounts].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999)).map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "ARS"})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Fecha</Label>
                        <Input type="date" value={withdrawalDate}
                            onChange={(e) => setWithdrawalDate(e.target.value)} required />
                    </div>
                    <label className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1"
                            checked={countAsIncome}
                            onChange={(e) => setCountAsIncome(e.target.checked)}
                        />
                        <span className="text-sm leading-tight">
                            Contar como ingreso
                            <span className="block text-xs text-muted-foreground mt-0.5">
                                Si no, acredita saldo pero queda fuera de ingresos/gastos.
                            </span>
                        </span>
                    </label>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1" disabled={isPending || !targetAccountId}>
                            {isPending ? "Guardando..." : "Retirar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function FinalizeDialog({ inv, accounts, onClose, onSubmit, isPending }) {
    const [finalAmount, setFinalAmount] = useState(String(inv.current_value || inv.amount_invested || ""));
    const [targetAccountId, setTargetAccountId] = useState("");
    const [finalizationDate, setFinalizationDate] = useState(TODAY);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Finalizar inversión</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground -mt-2">{inv.name}</p>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit({
                        finalAmount: parseFloat(finalAmount) || 0,
                        targetAccountId: targetAccountId || null,
                        finalizationDate,
                    });
                }} className="space-y-4">
                    <div>
                        <Label>Monto final recibido ({inv.currency || "ARS"})</Label>
                        <Input type="number" step="0.01" value={finalAmount}
                            onChange={(e) => setFinalAmount(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Acreditar a cuenta</Label>
                        <p className="text-xs text-muted-foreground mb-1.5">El monto se suma como ingreso a esta cuenta.</p>
                        <Select value={targetAccountId || "none"} onValueChange={(v) => setTargetAccountId(v === "none" ? "" : v)}>
                            <SelectTrigger><SelectValue placeholder="Sin cuenta (solo cerrar)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin cuenta (solo cerrar)</SelectItem>
                                {[...accounts].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999)).map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "ARS"})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Fecha de finalización</Label>
                        <Input type="date" value={finalizationDate}
                            onChange={(e) => setFinalizationDate(e.target.value)} required />
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1" disabled={isPending}>
                            {isPending ? "Guardando..." : "Finalizar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function InvestmentFormDialog({ open, onClose, onSubmit, initial, accounts = [] }) {
    const { activeCurrencies } = useCurrency();
    const defaultCurrency = activeCurrencies[0] || "ARS";
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
                    onSubmit({
                        ...form,
                        amount_invested: parseFloat(form.amount_invested) || 0,
                        current_value: parseFloat(form.current_value) || parseFloat(form.amount_invested) || 0,
                        account_id: form.account_id || null,
                    });
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
                            <Label>Cuenta de origen</Label>
                            {!initial && (
                                <p className="text-xs text-muted-foreground mb-1.5">
                                    Si seleccionás una cuenta, se registrará automáticamente un egreso por el monto invertido.
                                </p>
                            )}
                            <Select value={form.account_id || "none"} onValueChange={(v) => set("account_id", v === "none" ? "" : v)}>
                                <SelectTrigger><SelectValue placeholder="Sin cuenta asociada" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sin cuenta asociada</SelectItem>
                                    {[...accounts].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999)).map((a) => (
                                        <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "ARS"})</SelectItem>
                                    ))}
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
