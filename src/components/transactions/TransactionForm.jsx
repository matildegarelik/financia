import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown } from "lucide-react";

export default function TransactionForm({ open, onClose, onSubmit, accounts = [], categories = [], initial }) {
    const [form, setForm] = useState(getDefault(initial));
    const [showExtra, setShowExtra] = useState(false);
    useEffect(() => { setForm(getDefault(initial)); setShowExtra(false); }, [initial, open]);

    function getDefault(init) {
        return {
            type: "expense",
            status: "confirmed",
            amount: "",
            currency: "MXN",
            description: "",
            category_id: "",
            category_name: "",
            account_id: "",
            account_name: "",
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
            ...(init ? { ...init, amount: String(init.amount || "") } : {}),
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
        onSubmit({
            ...form,
            amount: parseFloat(form.amount) || 0,
            installment_total: form.installment_total ? parseInt(form.installment_total) : undefined,
            installment_current: form.installment_current ? parseInt(form.installment_current) : undefined,
            probability: form.probability ? parseInt(form.probability) : 80,
        });
    };

    const filteredCategories = categories.filter(
        (c) => form.type === "transfer" || c.type === form.type
    );

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
                        <Tabs value={form.status === "projected" ? "confirmed" : form.status} onValueChange={(v) => set("status", v)}>
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
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "MXN"})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount — divisa heredada de la cuenta */}
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="col-span-2">
                            <Label>Monto</Label>
                            <Input type="number" step="0.01" placeholder="0.00" value={form.amount}
                                onChange={(e) => set("amount", e.target.value)} required />
                        </div>
                        <div className="h-9 flex items-center justify-center rounded-md border border-input bg-muted/40 px-3 text-sm font-mono font-semibold text-muted-foreground">
                            {form.currency || "—"}
                        </div>
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
                                    {accounts.filter((a) => a.id !== form.account_id).map((a) => (
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
                                    {filteredCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Installment fields — only when installment status */}
                    {form.status === "installment" && (
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
                    )}

                    {/* Recurrente toggle */}
                    <div className="flex items-center gap-3">
                        <Switch checked={form.is_recurring} onCheckedChange={(v) => set("is_recurring", v)} id="recurring" />
                        <Label htmlFor="recurring" className="cursor-pointer">Recurrente</Label>
                    </div>

                    {form.is_recurring && (
                        <Select value={form.recurring_frequency} onValueChange={(v) => set("recurring_frequency", v)}>
                            <SelectTrigger><SelectValue placeholder="Frecuencia" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="biweekly">Quincenal</SelectItem>
                                <SelectItem value="monthly">Mensual</SelectItem>
                                <SelectItem value="yearly">Anual</SelectItem>
                            </SelectContent>
                        </Select>
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