import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Tag, ChevronDown, ChevronRight, Star, ChevronUp, GripVertical } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

    const toggleFavorite = (cat) => updateMut.mutate({ id: cat.id, data: { is_favorite: !cat.is_favorite } });

    const [localParents, setLocalParents] = useState([]);
    const reorderTimer = useRef(null);

    const typeFiltered = tab === "all" ? categories : categories.filter((c) => c.type === tab);
    const parents = [...typeFiltered.filter((c) => !c.parent_category)].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

    useEffect(() => { setLocalParents(parents); }, [categories, tab]);

    const persistOrder = (ordered) => {
        clearTimeout(reorderTimer.current);
        reorderTimer.current = setTimeout(async () => {
            for (let i = 0; i < ordered.length; i++) {
                await base44.entities.Category.update(ordered[i].id, { sort_order: i + 1 });
            }
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        }, 600);
    };

    const handleParentsReorder = (newOrder) => {
        setLocalParents(newOrder);
        persistOrder(newOrder);
    };

    const moveParent = (idx, dir) => {
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= localParents.length) return;
        const next = [...localParents];
        [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
        handleParentsReorder(next);
    };
    const childrenAll = typeFiltered.filter((c) => !!c.parent_category);
    const byParent = {};
    childrenAll.forEach((c) => {
        if (!byParent[c.parent_category]) byParent[c.parent_category] = [];
        byParent[c.parent_category].push(c);
    });
    Object.values(byParent).forEach((items) => items.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999) || a.name.localeCompare(b.name)));
    const visibleParentIds = new Set(parents.map((p) => p.id));
    // Children whose parent is in another tab → show as standalone
    const orphans = childrenAll.filter((c) => !visibleParentIds.has(c.parent_category));

    const typeBadge = (type) => (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {type === "income" ? "Ingreso" : "Gasto"}
        </Badge>
    );

    const ActionBtns = ({ cat, idx, total, onMoveUp, onMoveDown }) => (
        <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleFavorite(cat); }}>
                <Star className={cn("h-3 w-3", cat.is_favorite ? "fill-chart-3 text-chart-3" : "text-muted-foreground")} />
            </Button>
            {onMoveUp && (
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0}
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}>
                    <ChevronUp className="h-3 w-3" />
                </Button>
            )}
            {onMoveDown && (
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === total - 1}
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }}>
                    <ChevronDown className="h-3 w-3" />
                </Button>
            )}
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
                    <Reorder.Group as="div" values={localParents} onReorder={handleParentsReorder}
                        className="contents">
                        {localParents.map((parent, idx) => (
                            <SortableCategoryCard
                                key={parent.id}
                                parent={parent}
                                idx={idx}
                                total={localParents.length}
                                byParent={byParent}
                                isExpanded={isExpanded(parent.id)}
                                onToggle={() => toggle(parent.id)}
                                typeBadge={typeBadge}
                                ActionBtns={ActionBtns}
                                onMoveUp={() => moveParent(idx, -1)}
                                onMoveDown={() => moveParent(idx, 1)}
                            />
                        ))}
                    </Reorder.Group>

                    {/* Orphan children (parent is in another tab) */}
                    {orphans.map((cat) => (
                        <Card key={cat.id}>
                            <div className="group flex items-center gap-2 px-3 py-2.5">
                                <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm flex-1 truncate">{cat.name}</span>
                                {cat.is_favorite && <Star className="h-3 w-3 text-chart-3 fill-chart-3 shrink-0" />}
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

function SortableCategoryCard({ parent, idx, total, byParent, isExpanded, onToggle, typeBadge, ActionBtns, onMoveUp, onMoveDown }) {
    const dragControls = useDragControls();
    const subcategories = byParent[parent.id] || [];

    return (
        <Reorder.Item value={parent} as="div" dragControls={dragControls} dragListener={false}>
            <Card className="overflow-hidden">
                <div className="group flex items-center gap-1 px-2 py-2.5 hover:bg-muted/50 transition-colors">
                    <div
                        onPointerDown={(e) => { e.preventDefault(); dragControls.start(e); }}
                        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/25 hover:text-muted-foreground/60 transition-colors shrink-0 p-0.5"
                    >
                        <GripVertical className="h-3.5 w-3.5" />
                    </div>
                    <button
                        type="button"
                        onClick={() => subcategories.length > 0 && onToggle()}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                        style={{ cursor: subcategories.length > 0 ? "pointer" : "default" }}
                    >
                        {subcategories.length > 0
                            ? isExpanded
                                ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            : <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                        }
                        <span className="font-semibold text-sm flex-1 truncate">{parent.name}</span>
                        {parent.is_favorite && <Star className="h-3 w-3 text-chart-3 fill-chart-3 shrink-0" />}
                        {typeBadge(parent.type)}
                    </button>
                    <ActionBtns cat={parent} idx={idx} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
                </div>
                {isExpanded && subcategories.length > 0 && (
                    <div className="border-t divide-y">
                        {subcategories.map((child) => (
                            <CategoryChildRow
                                key={child.id}
                                category={child}
                                depth={1}
                                byParent={byParent}
                                ActionBtns={ActionBtns}
                            />
                        ))}
                    </div>
                )}
            </Card>
        </Reorder.Item>
    );
}

function CategoryChildRow({ category, depth, byParent, ActionBtns }) {
    const children = byParent[category.id] || [];
    return (
        <>
            <div
                className="group flex items-center gap-2 py-2 bg-muted/20 hover:bg-muted/40 transition-colors"
                style={{ paddingLeft: `${12 + depth * 14}px`, paddingRight: 12 }}
            >
                <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                <span className="text-sm text-muted-foreground flex-1 truncate">{category.name}</span>
                <ActionBtns cat={category} />
            </div>
            {children.map((child) => (
                <CategoryChildRow
                    key={child.id}
                    category={child}
                    depth={depth + 1}
                    byParent={byParent}
                    ActionBtns={ActionBtns}
                />
            ))}
        </>
    );
}

function getDescendantIds(categoryId, categories) {
    const childrenByParent = {};
    categories.forEach((category) => {
        if (!category.parent_category) return;
        if (!childrenByParent[category.parent_category]) childrenByParent[category.parent_category] = [];
        childrenByParent[category.parent_category].push(category);
    });

    const descendants = new Set();
    const visit = (id) => {
        (childrenByParent[id] || []).forEach((child) => {
            if (descendants.has(child.id)) return;
            descendants.add(child.id);
            visit(child.id);
        });
    };
    visit(categoryId);
    return descendants;
}

function getCategoryPath(category, categories) {
    const byId = new Map(categories.map((item) => [item.id, item]));
    const parts = [category.name];
    let parent = byId.get(category.parent_category);
    const visited = new Set([category.id]);

    while (parent && !visited.has(parent.id)) {
        visited.add(parent.id);
        parts.unshift(parent.name);
        parent = byId.get(parent.parent_category);
    }

    return parts.join(" / ");
}

function CategoryFormDialog({ open, onClose, onSubmit, initial, categories }) {
    const [form, setForm] = useState({ name: "", type: "expense", parent_category: "" });
    useEffect(() => {
        if (initial) setForm({ name: initial.name, type: initial.type, parent_category: initial.parent_category || "" });
        else setForm({ name: "", type: "expense", parent_category: "" });
    }, [initial, open]);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const descendantIds = initial ? getDescendantIds(initial.id, categories) : new Set();
    const parentOptions = categories
        .filter((c) =>
            c.type === form.type &&
            c.id !== initial?.id &&
            !descendantIds.has(c.id)
        )
        .sort((a, b) => getCategoryPath(a, categories).localeCompare(getCategoryPath(b, categories)));

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
                                {parentOptions.map((c) => <SelectItem key={c.id} value={c.id}>{getCategoryPath(c, categories)}</SelectItem>)}
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
