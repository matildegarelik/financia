import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/lib/currency-context";
import { Checkbox } from "@/components/ui/checkbox";
import { getReportingMode } from "@/lib/formatters";

export default function TransactionFormProjected({ open, onClose, onSubmit, accounts = [], categories = [], initial, defaultMonth }) {
    const { activeCurrencies } = useCurrency();
    const [form, setForm] = useState(getDefault(initial));
    useEffect(() => { setForm(getDefault(initial)); }, [initial, open]);

    function getDefault(init) {
        const defaultDate = defaultMonth
            ? (() => { const [y, m] = defaultMonth.split("-").map(Number); return new Date(y, m, 0).toISOString().split("T")[0]; })()
            : new Date().toISOString().split("T")[0];
        return {
            type: "income",
            status: "projected",
            amount: "",
            currency: activeCurrencies[0] || "ARS",
            description: "",
            category_id: "",
            category_name: "",
            account_id: "",
            date: defaultDate,
            project_name: "",
            client_name: "",
            reporting_mode: "normal",
            ...(init ? { ...init, amount: String(init.amount || ""), reporting_mode: getReportingMode(init) } : {}),
        };
    }

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleCategoryChange = (val) => {
        if (val === "none") {
            set("category_id", "");
            set("category_name", "");
        } else {
            const cat = categories.find((c) => c.id === val);
            set("category_id", val);
            set("category_name", cat?.name || "");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            amount: parseFloat(form.amount) || 0,
            status: "projected",
            category_id: form.category_id || null,
            account_id: form.account_id || null,
            reporting_mode: form.reporting_mode || "normal",
        });
    };

    const filteredCategories = categories
        .filter((c) => c.type === form.type)
        .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

    // Build hierarchical order: parents (sorted) then their children
    const catParents = filteredCategories.filter((c) => !c.parent_category);
    const catChildren = filteredCategories.filter((c) => !!c.parent_category);
    const orderedCats = [];
    catParents.forEach((p) => {
        orderedCats.push({ ...p, isParent: true });
        catChildren
            .filter((c) => c.parent_category === p.id)
            .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
            .forEach((c) => orderedCats.push({ ...c, isParent: false }));
    });
    catChildren.filter((c) => !catParents.find((p) => p.id === c.parent_category)).forEach((c) => orderedCats.push({ ...c, isParent: false }));

    const sortedAccounts = [...accounts].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initial ? "Editar" : "Nueva"} proyección</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-2 gap-2">
                        {["income", "expense"].map((t) => (
                            <Button key={t} type="button" size="sm"
                                variant={form.type === t ? "default" : "outline"}
                                onClick={() => { set("type", t); set("category_id", ""); set("category_name", ""); }}>
                                {t === "income" ? "Ingreso" : "Gasto"}
                            </Button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                            <Label>Monto estimado</Label>
                            <Input type="number" step="0.01" placeholder="0.00" value={form.amount}
                                onChange={(e) => set("amount", e.target.value)} required />
                        </div>
                        <div>
                            <Label>Divisa</Label>
                            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {activeCurrencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Descripción</Label>
                        <Input placeholder="¿Qué es?" value={form.description}
                            onChange={(e) => set("description", e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Mes</Label>
                            <Input type="month" value={form.date ? form.date.slice(0, 7) : ""}
                                onChange={(e) => {
                                    const [y, m] = e.target.value.split("-").map(Number);
                                    const lastDay = new Date(y, m, 0).toISOString().split("T")[0];
                                    set("date", lastDay);
                                }} required />
                        </div>
                        <div>
                            <Label>
                                Categoría <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                            </Label>
                            <Select value={form.category_id || "none"} onValueChange={handleCategoryChange}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        <span className="text-muted-foreground">General (sin categoría)</span>
                                    </SelectItem>
                                    {orderedCats.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.isParent ? c.name : `  ↳ ${c.name}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {sortedAccounts.length > 0 && (
                        <div>
                            <Label>Cuenta <span className="text-muted-foreground font-normal text-xs">(opcional)</span></Label>
                            <Select value={form.account_id || "none"} onValueChange={(v) => set("account_id", v === "none" ? "" : v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none"><span className="text-muted-foreground">Sin cuenta</span></SelectItem>
                                    {sortedAccounts.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "ARS"})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <label className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 cursor-pointer">
                        <Checkbox
                            checked={form.reporting_mode === "neutral"}
                            onCheckedChange={(checked) => set("reporting_mode", checked ? "neutral" : "normal")}
                        />
                        <span className="text-sm leading-tight">
                            No contar en ingresos/gastos
                            <span className="block text-xs text-muted-foreground mt-0.5">
                                Visible en proyecciones, pero fuera de los totales.
                            </span>
                        </span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs">Proyecto (opcional)</Label>
                            <Input placeholder="Proyecto" value={form.project_name || ""}
                                onChange={(e) => set("project_name", e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-xs">Cliente (opcional)</Label>
                            <Input placeholder="Cliente" value={form.client_name || ""}
                                onChange={(e) => set("client_name", e.target.value)} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1">{initial ? "Guardar" : "Crear"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
