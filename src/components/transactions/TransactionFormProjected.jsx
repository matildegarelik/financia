import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/lib/currency-context";

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
            currency: activeCurrencies[0] || "MXN",
            description: "",
            category_id: "",
            category_name: "",
            account_id: "",
            date: defaultDate,
            project_name: "",
            client_name: "",
            ...(init ? { ...init, amount: String(init.amount || "") } : {}),
        };
    }

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleCategoryChange = (catId) => {
        const cat = categories.find((c) => c.id === catId);
        set("category_id", catId);
        set("category_name", cat?.name || "");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...form,
            amount: parseFloat(form.amount) || 0,
            status: "projected",
            // Convert empty strings to null for UUID columns
            category_id: form.category_id || null,
            account_id: form.account_id || null,
        };
        onSubmit(data);
    };

    const filteredCategories = categories.filter((c) => c.type === form.type);

    // Build hierarchical order: parents then their children indented
    const catParents = filteredCategories.filter((c) => !c.parent_category);
    const catChildren = filteredCategories.filter((c) => !!c.parent_category);
    const orderedCats = [];
    catParents.forEach((p) => {
        orderedCats.push({ ...p, isParent: true });
        catChildren.filter((c) => c.parent_category === p.id).forEach((c) => orderedCats.push({ ...c, isParent: false }));
    });
    catChildren.filter((c) => !catParents.find((p) => p.id === c.parent_category)).forEach((c) => orderedCats.push({ ...c, isParent: false }));

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
                                onClick={() => set("type", t)}>
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
                            <Label>Categoría</Label>
                            <Select value={form.category_id || ""} onValueChange={handleCategoryChange}>
                                <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                                <SelectContent>
                                    {orderedCats.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.isParent ? c.name : `  ↳ ${c.name}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

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
