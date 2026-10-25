import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pause, Play, Plus, Repeat, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { formatCurrencyCode, formatDate, TODAY } from "@/lib/formatters";
import { Checkbox } from "@/components/ui/checkbox";
import { FREQUENCY_LABEL, getNextChargeDate, toMonthlyEquivalent } from "@/domain/subscriptions";
import { getPersonSuggestions } from "@/domain/debts";
import { useCurrency } from "@/lib/currency-context";
import { useMaterializeDueSubscriptions } from "@/hooks/useMaterializeDueSubscriptions";

export default function Suscripciones() {
    const queryClient = useQueryClient();
    const { displayCurrency, convert, activeCurrencies } = useCurrency();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const { subscriptions, isLoading } = useMaterializeDueSubscriptions();
    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
    const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => base44.entities.Category.list() });
    const { data: debts = [] } = useQuery({ queryKey: ["third_party_debts"], queryFn: () => base44.entities.ThirdPartyDebt.list() });

    const createMut = useMutation({
        mutationFn: (data) => base44.entities.Subscription.create(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["subscriptions"] }); setShowForm(false); },
    });
    const updateMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["subscriptions"] }); setEditing(null); },
    });
    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.Subscription.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
    });

    const togglePause = (sub) => {
        if (sub.status === "paused") {
            // Al reanudar, saltamos a la próxima fecha futura — no se cobra retroactivo el tiempo pausado.
            let next = sub.next_charge_date;
            while (next <= TODAY) next = getNextChargeDate(next, sub.frequency);
            updateMut.mutate({ id: sub.id, data: { status: "active", next_charge_date: next } });
        } else {
            updateMut.mutate({ id: sub.id, data: { status: "paused" } });
        }
    };

    const activeSubs = subscriptions.filter((s) => s.status !== "cancelled");
    const totalMonthly = useMemo(() =>
        activeSubs
            .filter((s) => s.status === "active")
            .reduce((sum, s) => sum + convert(toMonthlyEquivalent(Number(s.amount) || 0, s.frequency), s.currency || "ARS"), 0),
        [activeSubs, convert]
    );

    return (
        <div className="space-y-5">
            <PageHeader
                title="Suscripciones"
                description="Gastos recurrentes que podés pausar sin perder el historial"
                action={
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <CurrencySelector className="w-20 sm:w-24 h-8 text-xs sm:text-sm" />
                        <Button size="sm" onClick={() => setShowForm(true)}>
                            <Plus className="h-4 w-4 mr-1.5" />Nueva
                        </Button>
                    </div>
                }
            />

            <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total mensual (activas)</p>
                <p className="text-xl font-bold text-destructive">{formatCurrencyCode(totalMonthly, displayCurrency)}</p>
            </CardContent></Card>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : activeSubs.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">
                    <Repeat className="h-7 w-7 mx-auto mb-2 opacity-30" />
                    <p>No hay suscripciones todavía.</p>
                </CardContent></Card>
            ) : (
                <div className="space-y-2">
                    {activeSubs.map((sub) => {
                        const account = accounts.find((a) => a.id === sub.account_id);
                        const category = categories.find((c) => c.id === sub.category_id);
                        const isPaused = sub.status === "paused";
                        return (
                            <Card key={sub.id}>
                                <CardContent className="p-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-medium truncate">{sub.name}</p>
                                            {isPaused && <Badge variant="outline" className="text-xs">Pausada</Badge>}
                                            {sub.debt_person_name && <Badge variant="outline" className="text-xs">Para {sub.debt_person_name}</Badge>}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {formatCurrencyCode(sub.amount, sub.currency || "ARS")} · {FREQUENCY_LABEL[sub.frequency]}
                                            {account && ` · ${account.name}`}{!sub.debt_person_name && category && ` · ${category.name}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {isPaused ? "Pausada" : `Próximo cobro: ${formatDate(sub.next_charge_date)}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePause(sub)}
                                            title={isPaused ? "Reanudar" : "Pausar"}>
                                            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(sub)}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => deleteMut.mutate(sub.id)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {(showForm || editing) && (
                <SubscriptionForm
                    open
                    initial={editing}
                    accounts={accounts}
                    categories={categories}
                    activeCurrencies={activeCurrencies}
                    debts={debts}
                    onClose={() => { setShowForm(false); setEditing(null); }}
                    onSubmit={(data) => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)}
                />
            )}
        </div>
    );
}

function SubscriptionForm({ open, initial, accounts, categories, activeCurrencies, debts, onClose, onSubmit }) {
    const expenseCategories = categories.filter((c) => c.type === "expense");
    const personSuggestions = getPersonSuggestions(debts);
    const [form, setForm] = useState(() => initial ? {
        ...initial,
        amount: String(initial.amount || ""),
    } : {
        name: "",
        amount: "",
        currency: activeCurrencies[0] || "ARS",
        category_id: "",
        account_id: "",
        frequency: "monthly",
        next_charge_date: TODAY,
        status: "active",
        debt_person_name: "",
    });
    const [isThirdParty, setIsThirdParty] = useState(Boolean(initial?.debt_person_name));
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    // Igual que en Investments.jsx/Accounts.jsx: no perder una divisa desactivada en
    // Configuración que ya estaba usando esta suscripción.
    const currencyOptions = activeCurrencies.includes(form.currency) ? activeCurrencies : [form.currency, ...activeCurrencies];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            amount: parseFloat(form.amount) || 0,
            category_id: isThirdParty ? null : (form.category_id || null),
            account_id: form.account_id || null,
            debt_person_name: isThirdParty ? (form.debt_person_name || "").trim() : null,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{initial ? "Editar" : "Nueva"} suscripción</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <Label>Nombre</Label>
                        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Netflix, Spotify..." required />
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="col-span-2">
                            <Label>Monto</Label>
                            <Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} required />
                        </div>
                        <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {currencyOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Frecuencia</Label>
                        <Select value={form.frequency} onValueChange={(v) => set("frequency", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="biweekly">Quincenal</SelectItem>
                                <SelectItem value="monthly">Mensual</SelectItem>
                                <SelectItem value="yearly">Anual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Próximo cobro</Label>
                        <Input type="date" value={form.next_charge_date} onChange={(e) => set("next_charge_date", e.target.value)} required />
                    </div>
                    <div>
                        <Label>Cuenta</Label>
                        <Select value={form.account_id || "none"} onValueChange={(v) => set("account_id", v === "none" ? "" : v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none"><span className="text-muted-foreground">Sin cuenta</span></SelectItem>
                                {accounts.filter((a) => a.is_visible !== false).map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "ARS"})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {!isThirdParty && (
                        <div>
                            <Label>Categoría</Label>
                            <Select value={form.category_id || "none"} onValueChange={(v) => set("category_id", v === "none" ? "" : v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none"><span className="text-muted-foreground">Sin categoría</span></SelectItem>
                                    {expenseCategories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
                        <label className="flex items-start gap-2 cursor-pointer">
                            <Checkbox checked={isThirdParty} onCheckedChange={(checked) => setIsThirdParty(Boolean(checked))} />
                            <span className="text-sm leading-tight">
                                Es un pago a/para un tercero
                                <span className="block text-xs text-muted-foreground mt-0.5">
                                    No cuenta como gasto propio en presupuestos/proyectado — se registra como deuda en "Terceros".
                                </span>
                            </span>
                        </label>
                        {isThirdParty && (
                            <div>
                                <Label className="text-xs">¿Quién?</Label>
                                <Input list="subscription-debt-person-suggestions" placeholder="Nombre de la persona"
                                    value={form.debt_person_name || ""} onChange={(e) => set("debt_person_name", e.target.value)} required />
                                <datalist id="subscription-debt-person-suggestions">
                                    {personSuggestions.map((name) => <option key={name} value={name} />)}
                                </datalist>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
