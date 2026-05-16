import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/shared/PageHeader";
import { motion } from "framer-motion";

export default function Categories() {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [tab, setTab] = useState("all");
    const queryClient = useQueryClient();

    const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => base44.entities.Category.list() });

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

    const filtered = tab === "all" ? categories : categories.filter((c) => c.type === tab);

    return (
        <div className="space-y-6">
            <PageHeader title="Categorías" description="Organiza tus transacciones por categorías"
                action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Nueva categoría</Button>}
            />

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="income">Ingresos</TabsTrigger>
                    <TabsTrigger value="expense">Gastos</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((cat, i) => (
                    <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Tag className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{cat.name}</p>
                                        <Badge variant="secondary" className="text-xs mt-0.5">
                                            {cat.type === "income" ? "Ingreso" : "Gasto"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMut.mutate(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <CategoryFormDialog open={showForm || !!editing} onClose={() => { setShowForm(false); setEditing(null); }}
                initial={editing} onSubmit={(data) => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)} />
        </div>
    );
}

function CategoryFormDialog({ open, onClose, onSubmit, initial }) {
    const [form, setForm] = useState(initial || { name: "", type: "expense" });
    React.useEffect(() => { if (initial) setForm(initial); else setForm({ name: "", type: "expense" }); }, [initial]);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{initial ? "Editar" : "Nueva"} categoría</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
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
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1">{initial ? "Guardar" : "Crear"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}