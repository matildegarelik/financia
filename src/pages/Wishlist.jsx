import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Gift, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/shared/PageHeader";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { formatCurrencyCode, TODAY } from "@/lib/formatters";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";

export default function Wishlist() {
    const queryClient = useQueryClient();
    const { displayCurrency, convert, activeCurrencies } = useCurrency();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showPurchased, setShowPurchased] = useState(false);
    const [categoryTab, setCategoryTab] = useState("all");

    const { data: items = [], isLoading } = useQuery({
        queryKey: ["wishlist_items"],
        queryFn: () => base44.entities.WishlistItem.list("-created_at"),
    });

    // No hay tabla de categorías: son las distintas que ya se usaron en los items
    // (equivalente a un SELECT DISTINCT), más la posibilidad de tipear una nueva al crear.
    const existingCategories = useMemo(
        () => [...new Set(items.map((i) => i.category).filter(Boolean))].sort(),
        [items]
    );

    const createMut = useMutation({
        mutationFn: (data) => base44.entities.WishlistItem.create(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wishlist_items"] }); setShowForm(false); },
    });
    const updateMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.WishlistItem.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wishlist_items"] }); setEditing(null); },
    });
    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.WishlistItem.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist_items"] }),
    });

    const togglePurchased = (item) => {
        updateMut.mutate({
            id: item.id,
            data: item.is_purchased
                ? { is_purchased: false, purchased_at: null }
                : { is_purchased: true, purchased_at: TODAY },
        });
    };

    const visibleItems = items
        .filter((i) => showPurchased || !i.is_purchased)
        .filter((i) => categoryTab === "all" || i.category === categoryTab);
    const pendingTotal = useMemo(() =>
        items.filter((i) => !i.is_purchased && i.price).reduce((s, i) => s + convert(Number(i.price) || 0, i.currency || "ARS"), 0),
        [items, convert]
    );

    return (
        <div className="space-y-5">
            <PageHeader
                title="Wishlist"
                description="Cosas que querés comprar, organizadas por categoría"
                action={
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <CurrencySelector className="w-20 sm:w-24 h-8 text-xs sm:text-sm" />
                        <Button size="sm" onClick={() => setShowForm(true)}>
                            <Plus className="h-4 w-4 mr-1.5" />Nueva
                        </Button>
                    </div>
                }
            />

            {existingCategories.length > 0 && (
                <Tabs value={categoryTab} onValueChange={setCategoryTab}>
                    <TabsList className="flex-wrap h-auto">
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        {existingCategories.map((cat) => (
                            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}

            <div className="flex items-center justify-between gap-3">
                <Card className="flex-1"><CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total pendiente (estimado)</p>
                    <p className="text-xl font-bold">{formatCurrencyCode(pendingTotal, displayCurrency)}</p>
                </CardContent></Card>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer shrink-0">
                    <Checkbox checked={showPurchased} onCheckedChange={(v) => setShowPurchased(Boolean(v))} />
                    Mostrar compradas
                </label>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : visibleItems.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">
                    <Gift className="h-7 w-7 mx-auto mb-2 opacity-30" />
                    <p>{showPurchased ? "No hay nada todavía." : "No tenés nada pendiente."}</p>
                </CardContent></Card>
            ) : (
                <Card className="overflow-hidden">
                    <div className="divide-y divide-border">
                        {visibleItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                                <Checkbox checked={Boolean(item.is_purchased)} onCheckedChange={() => togglePurchased(item)} />
                                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setEditing(item)}>
                                    <p className={cn("text-sm font-medium truncate", item.is_purchased && "line-through text-muted-foreground")}>
                                        {item.name}
                                    </p>
                                    {item.category && <p className="text-xs text-muted-foreground truncate">{item.category}</p>}
                                </div>
                                {item.price != null && (
                                    <span className={cn("text-sm font-semibold shrink-0", item.is_purchased && "text-muted-foreground")}>
                                        {formatCurrencyCode(item.price, item.currency || "ARS")}
                                    </span>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => togglePurchased(item)}
                                    title={item.is_purchased ? "Marcar como pendiente" : "Marcar como comprada"}>
                                    {item.is_purchased ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => deleteMut.mutate(item.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {(showForm || editing) && (
                <WishlistItemForm
                    open
                    initial={editing}
                    activeCurrencies={activeCurrencies}
                    existingCategories={existingCategories}
                    onClose={() => { setShowForm(false); setEditing(null); }}
                    onSubmit={(data) => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)}
                />
            )}
        </div>
    );
}

const NEW_CATEGORY_VALUE = "__new__";

function WishlistItemForm({ open, initial, activeCurrencies, existingCategories, onClose, onSubmit }) {
    const [form, setForm] = useState(() => initial ? {
        ...initial,
        price: initial.price != null ? String(initial.price) : "",
    } : {
        name: "",
        category: "",
        price: "",
        currency: activeCurrencies[0] || "ARS",
        notes: "",
    });
    // La categoría es un conjunto cerrado derivado de los items existentes (no una tabla
    // propia) — se elige una ya usada, o se tipea una nueva si no hay ninguna que sirva.
    const [isNewCategory, setIsNewCategory] = useState(
        existingCategories.length === 0 || (form.category && !existingCategories.includes(form.category))
    );
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            category: form.category.trim() || null,
            price: form.price !== "" ? parseFloat(form.price) || 0 : null,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{initial ? "Editar" : "Nuevo"} item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <Label>Nombre</Label>
                        <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
                    </div>
                    <div>
                        <Label>Categoría <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                        {isNewCategory ? (
                            <div className="flex gap-2">
                                <Input value={form.category} onChange={(e) => set("category", e.target.value)}
                                    placeholder="Ropa, tecnología, hogar..." autoFocus />
                                {existingCategories.length > 0 && (
                                    <Button type="button" variant="outline" size="sm" className="shrink-0"
                                        onClick={() => { setIsNewCategory(false); set("category", ""); }}>
                                        Elegir existente
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Select value={form.category || "none"}
                                onValueChange={(v) => v === NEW_CATEGORY_VALUE ? (setIsNewCategory(true), set("category", "")) : set("category", v === "none" ? "" : v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none"><span className="text-muted-foreground">Sin categoría</span></SelectItem>
                                    {existingCategories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    <SelectItem value={NEW_CATEGORY_VALUE}>+ Nueva categoría</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="col-span-2">
                            <Label>Precio <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                            <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} />
                        </div>
                        <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {activeCurrencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
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
