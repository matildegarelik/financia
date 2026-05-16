import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Tag, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

export default function Categories() {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [tab, setTab] = useState("all");
    const [overrides, setOverrides] = useState({});
    const queryClient = useQueryClient();

    const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => base44.entities.Category.list() });

    // Reset manual overrides when tab changes
    useEffect(() => { setOverrides({}); }, [tab]);

    // Default: "all" → collapsed, specific tab → expanded. User toggles override.
    const isExpanded = (id) => (id in overrides ? overrides[id] : tab !== "all");
    const toggle = (id) => setOverrides((p) => ({ ...p, [id]: !isExpanded(id) }));

    const createMut = useMutation({
        mutationFn: (d) => base44.entities.Category.create(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setShowForm(false); },
    });
    const updateMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Category.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setEditing(null); },
    });
    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.Category.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });

    const typeFiltered = tab === "all" ? categories : categories.filter((c) => c.type === tab);
    const parents = typeFiltered.filter((c) => !c.parent_category);
    const childrenAll = typeFiltered.filter((c) => !!c.parent_category);
    const byParent = {};
    childrenAll.forEach((c) => {
        if (!byParent[c.parent_category]) byParent[c.parent_category] = [];
        byParent[c.parent_category].push(c);
    });
    const visibleParentIds = new Set(parents.map((p) => p.id));
    // Children whose parent is in another tab → show as standalone
    const orphans = childrenAll.filter((c) => !visibleParentIds.has(c.parent_category));

    const typeBadge = (type) => (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {type === "income" ? "Ingreso" : "Gasto"}
        </Badge>
    );

    const ActionBtns = ({ cat }) => (
        <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditing(cat); }}>
                <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deleteMut.mutate(cat.id); }}>
                <Trash2 className="h-3 w-3" />
            </Button>
        </div>
    );

    return (
        <div className="space-y-5">
            <PageHeader
                title="Categorías"
                description="Organiza tus transacciones por categorías"
                action={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1.5" />Nueva</Button>}
            />

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="income">Ingresos</TabsTrigger>
                    <TabsTrigger value="expense">Gastos</TabsTrigger>
                </TabsList>
            </Tabs>

            {typeFiltered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay categorías. Creá la primera.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Parent categories with collapsible children */}
                    {parents.map((parent) => {
                        const children = byParent[parent.id] || [];
                        const open = isExpanded(parent.id);
                        return (
                            <Card key={parent.id} className="overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => children.length > 0 && toggle(parent.id)}
                                    className="group w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                                    style={{ cursor: children.length > 0 ? "pointer" : "default" }}
                                >
                                    {children.length > 0
                                        ? open
                                            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        : <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                                    }
                                    <span className="font-semibold text-sm flex-1 truncate">{parent.name}</span>
                                    {typeBadge(parent.type)}
                                    <ActionBtns cat={parent} />
                                </button>

                                {open && children.length > 0 && (
                                    <div className="border-t divide-y">
                                        {children.map((child) => (
                                            <div key={child.id} className="group flex items-center gap-2 px-3 py-2 bg-muted/20 hover:bg-muted/40 transition-colors">
                                                <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                                <span className="text-sm text-muted-foreground flex-1 truncate">{child.name}</span>
                                                <ActionBtns cat={child} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        );
                    })}

                    {/* Orphan children (parent is in another tab) */}
                    {orphans.map((cat) => (
                        <Card key={cat.id}>
                            <div className="group flex items-center gap-2 px-3 py-2.5">
                                <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm flex-1 truncate">{cat.name}</span>
                                {typeBadge(cat.type)}
                                <ActionBtns cat={cat} />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <CategoryFormDialog
                open={showForm || !!editing}
                onClose={() => { setShowForm(false); setEditing(null); }}
                initial={editing}
                categories={categories}
                onSubmit={(data) => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)}
            />
        </div>
    );
}

function CategoryFormDialog({ open, onClose, onSubmit, initial, categories }) {
    const [form, setForm] = useState({ name: "", type: "expense", parent_category: "" });
    useEffect(() => {
        if (initial) setForm({ name: initial.name, type: initial.type, parent_category: initial.parent_category || "" });
        else setForm({ name: "", type: "expense", parent_category: "" });
    }, [initial, open]);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const parentOptions = categories.filter(
        (c) => c.type === form.type && !c.parent_category && c.id !== initial?.id
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{initial ? "Editar" : "Nueva"} categoría</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, parent_category: form.parent_category || null }); }} className="space-y-4">
                    <div><Label>Nombre</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
                    <div><Label>Tipo</Label>
                        <Select value={form.type} onValueChange={(v) => set("type", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Ingreso</SelectItem>
                                <SelectItem value="expense">Gasto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Categoría padre <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                        <Select value={form.parent_category || "none"} onValueChange={(v) => set("parent_category", v === "none" ? "" : v)}>
                            <SelectTrigger><SelectValue placeholder="Sin padre (raíz)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin padre (raíz)</SelectItem>
                                {parentOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
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
