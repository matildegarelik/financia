import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";

export default function TransactionForm({ open, onClose, onSubmit, accounts = [], categories = [], initial }) {
    const { activeCurrencies } = useCurrency();
    const [form, setForm] = useState(() => getDefault(initial));
    const [showExtra, setShowExtra] = useState(false);
    useEffect(() => { setForm(getDefault(initial)); setShowExtra(false); }, [initial, open]);

    function getDefault(init) {
        const defaultAcc = !init
            ? accounts
                .filter(a => a.is_visible !== false && a.is_favorite)
                .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))[0]
            : null;
        return {
            type: "expense",
            status: "confirmed",
            amount: "",
            amount_gross: "",
            currency: defaultAcc?.currency || activeCurrencies[0] || "ARS",
            description: "",
            category_id: "",
            category_name: "",
            account_id: defaultAcc?.id || "",
            account_name: defaultAcc?.name || "",
            to_account_id: "",
            to_account_name: "",
            date: new Date().toISOString().split("T")[0],
            notes: "",
            is_recurring: false,
            recurring_frequency: "",
            project_name: "",
            client_name: "",
            due_date: "",
            installment_total: "",
            installment_current: "",
            probability: 80,
            ...(init ? { ...init, amount: String(init.amount || ""), amount_gross: String(init.amount_gross || "") } : {}),
        };
    }

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleAccountChange = (accId, field = "account") => {
        const acc = accounts.find((a) => a.id === accId);
        if (field === "account") {
            set("account_id", accId);
            set("account_name", acc?.name || "");
            if (acc?.currency) set("currency", acc.currency);
        } else {
            set("to_account_id", accId);
            set("to_account_name", acc?.name || "");
        }
    };

    const handleCategoryChange = (catId) => {
        const cat = categories.find((c) => c.id === catId);
        set("category_id", catId);
        set("category_name", cat?.name || "");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const net = parseFloat(form.amount) || 0;
        const gross = parseFloat(form.amount_gross);
        onSubmit({
            ...form,
            amount: net,
            amount_gross: !isNaN(gross) && gross !== net ? gross : null,
            installment_total: form.installment_total ? parseInt(form.installment_total) : null,
            installment_current: form.installment_current ? parseInt(form.installment_current) : null,
            probability: form.probability ? parseInt(form.probability) : null,
            // Convert empty strings to null for UUID columns
            category_id: form.category_id || null,
            account_id: form.account_id || null,
            to_account_id: form.to_account_id || null,
        });
    };

    const filteredCategories = categories
        .filter((c) => form.type === "transfer" || c.type === form.type)
        .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

    // Build hierarchical order: parents first, then their children indented
    const catParents = filteredCategories.filter((c) => !c.parent_category);
    const catChildren = filteredCategories.filter((c) => !!c.parent_category);
    const orderedCats = [];
    catParents.forEach((p) => {
        orderedCats.push({ ...p, isParent: true });
        catChildren
            .filter((c) => c.parent_category === p.id)
            .forEach((c) => orderedCats.push({ ...c, isParent: false }));
    });
    catChildren
        .filter((c) => !catParents.find((p) => p.id === c.parent_category))
        .forEach((c) => orderedCats.push({ ...c, isParent: false }));

    const sortedAccounts = accounts
        .filter(a => a.is_visible !== false)
        .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

    const isFreelance = form.project_name || form.client_name;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initial ? "Editar" : "Nueva"} transacción</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Type */}
                    <div className="grid grid-cols-3 gap-2">
                        {["income", "expense", "transfer"].map((t) => (
                            <Button key={t} type="button" size="sm"
                                variant={form.type === t ? "default" : "outline"}
                                onClick={() => set("type", t)}>
                                {t === "income" ? "Ingreso" : t === "expense" ? "Gasto" : "Transferencia"}
                            </Button>
                        ))}
                    </div>

                    {/* Status */}
                    <div>
                        <Tabs value={form.status === "projected" ? "confirmed" : form.status}
                            onValueChange={(v) => setForm((p) => ({
                                ...p,
                                status: v,
                                is_recurring: v === "installment",
                                recurring_frequency: v === "installment" ? p.recurring_frequency : "",
                            }))}>
                            <TabsList className="w-full">
                                <TabsTrigger value="confirmed" className="flex-1 text-xs">Confirmado</TabsTrigger>
                                <TabsTrigger value="installment" className="flex-1 text-xs">Cuota/Recurrente</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Account — primero, determina la divisa */}
                    <div>
                        <Label>{form.type === "transfer" ? "Cuenta origen" : "Cuenta"}</Label>
                        <Select value={form.account_id} onValueChange={(v) => handleAccountChange(v, "account")}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar cuenta" /></SelectTrigger>
                            <SelectContent>
                                {sortedAccounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "MXN"})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount — divisa heredada de la cuenta */}
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="col-span-2">
                            <Label>Monto neto</Label>
                            <Input type="number" step="0.01" placeholder="0.00" value={form.amount}
                                onChange={(e) => set("amount", e.target.value)} required />
                        </div>
                        <div className="h-9 flex items-center justify-center rounded-md border border-input bg-muted/40 px-3 text-sm font-mono font-semibold text-muted-foreground">
                            {form.currency || "—"}
                        </div>
                    </div>

                    {/* Monto bruto — solo desktop */}
                    <div className="hidden md:block">
                        <Label>Monto bruto <span className="text-xs text-muted-foreground font-normal">(antes de comisión, opcional)</span></Label>
                        <Input type="number" step="0.01" placeholder={form.amount || "0.00"}
                            value={form.amount_gross}
                            onChange={(e) => set("amount_gross", e.target.value)} />
                    </div>

                    <div>
                        <Label>Descripción</Label>
                        <Input placeholder="Descripción" value={form.description}
                            onChange={(e) => set("description", e.target.value)} />
                    </div>

                    <div>
                        <Label>Fecha</Label>
                        <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
                    </div>

                    {form.type === "transfer" && (
                        <div>
                            <Label>Cuenta destino</Label>
                            <Select value={form.to_account_id} onValueChange={(v) => handleAccountChange(v, "to")}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar cuenta destino" /></SelectTrigger>
                                <SelectContent>
                                    {sortedAccounts.filter((a) => a.id !== form.account_id).map((a) => (
                                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {form.type !== "transfer" && (
                        <div>
                            <Label>Categoría</Label>
                            <Select value={form.category_id} onValueChange={handleCategoryChange}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                                <SelectContent>
                                    {orderedCats.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.isParent ? c.name : `  ↳ ${c.name}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Campos de cuota/recurrente — solo cuando status === installment */}
                    {form.status === "installment" && (
                        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                            <div>
                                <Label className="text-xs mb-1.5 block">Frecuencia</Label>
                                <Select value={form.recurring_frequency} onValueChange={(v) => set("recurring_frequency", v)}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar frecuencia" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Semanal</SelectItem>
                                        <SelectItem value="biweekly">Quincenal</SelectItem>
                                        <SelectItem value="monthly">Mensual</SelectItem>
                                        <SelectItem value="yearly">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Cuota nº actual</Label>
                                    <Input type="number" value={form.installment_current || ""}
                                        onChange={(e) => set("installment_current", e.target.value)} placeholder="1" />
                                </div>
                                <div>
                                    <Label className="text-xs">Total de cuotas</Label>
                                    <Input type="number" value={form.installment_total || ""}
                                        onChange={(e) => set("installment_total", e.target.value)} placeholder="12" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Extra fields collapsed */}
                    <button type="button" onClick={() => setShowExtra(!showExtra)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full">
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showExtra ? "rotate-180" : ""}`} />
                        {showExtra ? "Ocultar" : "Más opciones"} (fecha vto., proyecto, notas)
                    </button>

                    {showExtra && (
                        <div className="space-y-3 border-t pt-3">
                            <div>
                                <Label className="text-xs">Fecha vto.</Label>
                                <Input type="date" value={form.due_date || ""} onChange={(e) => set("due_date", e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Proyecto</Label>
                                    <Input placeholder="Nombre" value={form.project_name || ""}
                                        onChange={(e) => set("project_name", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">Cliente</Label>
                                    <Input placeholder="Nombre" value={form.client_name || ""}
                                        onChange={(e) => set("client_name", e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs">Notas</Label>
                                <Textarea placeholder="Notas adicionales..." value={form.notes}
                                    onChange={(e) => set("notes", e.target.value)} rows={2} />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1">{initial ? "Guardar" : "Crear"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}