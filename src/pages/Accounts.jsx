import React, { useState, useEffect, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Wallet, CreditCard, Banknote, PiggyBank, MoreHorizontal, Trash2, Pencil, Lock, Bitcoin, Star, ChevronUp, ChevronDown, GripVertical, Info, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { formatCurrency, formatCurrencyCode, ACCOUNT_TYPES } from "@/lib/formatters";
import { computeAccountBalance, computeTotalSavings } from "@/domain/transactions";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";

const iconMap = {
    checking: Wallet, savings: PiggyBank, credit_card: CreditCard,
    debit_card: CreditCard, cash: Banknote, investment: Lock, crypto: Bitcoin, other: Wallet,
};

export default function Accounts() {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const queryClient = useQueryClient();
    const { displayCurrency, convert } = useCurrency();

    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ["accounts"],
        queryFn: () => base44.entities.Account.list(),
    });
    const { data: investments = [] } = useQuery({
        queryKey: ["investments"],
        queryFn: () => base44.entities.Investment.list(),
    });
    const { data: transactions = [] } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date"),
    });

    const computeEffectiveBalance = (acc) => computeAccountBalance(acc, transactions);

    const createMut = useMutation({
        mutationFn: (d) => base44.entities.Account.create(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["accounts"] }); setShowForm(false); },
    });
    const updateMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Account.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["accounts"] }); setEditing(null); },
    });
    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.Account.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
    });

    const [localAccounts, setLocalAccounts] = useState([]);
    const localAccountsRef = useRef([]);
    const reorderTimer = useRef(null);
    const draggingId = useRef(null);
    const dragArmedId = useRef(null);

    useEffect(() => {
        const ordered = [...accounts].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
        localAccountsRef.current = ordered;
        setLocalAccounts(ordered);
    }, [accounts]);

    const persistOrder = (ordered) => {
        clearTimeout(reorderTimer.current);
        reorderTimer.current = setTimeout(async () => {
            for (let i = 0; i < ordered.length; i++) {
                await base44.entities.Account.update(ordered[i].id, { sort_order: i + 1 });
            }
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        }, 600);
    };

    const handleReorder = (newOrder) => {
        localAccountsRef.current = newOrder;
        setLocalAccounts(newOrder);
        persistOrder(newOrder);
    };

    const toggleFavorite = (acc) => {
        updateMut.mutate({ id: acc.id, data: { is_favorite: !acc.is_favorite } });
    };

    const toggleVisible = (acc) => {
        updateMut.mutate({ id: acc.id, data: { is_visible: acc.is_visible === false ? true : false } });
    };

    const moveAccount = (idx, dir) => {
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= localAccounts.length) return;
        const next = [...localAccounts];
        [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
        handleReorder(next);
    };

    const moveDraggedAccount = (targetId, placement = "before") => {
        const draggedId = draggingId.current;
        if (!draggedId || draggedId === targetId) return;

        setLocalAccounts((current) => {
            if (localAccountsRef.current !== current) {
                localAccountsRef.current = current;
            }

            const dragged = current.find((a) => a.id === draggedId);
            if (!dragged) return current;

            const withoutDragged = current.filter((a) => a.id !== draggedId);
            const targetIndex = withoutDragged.findIndex((a) => a.id === targetId);
            if (targetIndex < 0) return current;

            const insertIndex = placement === "after" ? targetIndex + 1 : targetIndex;
            const next = [...withoutDragged];
            next.splice(insertIndex, 0, dragged);

            const didChange = next.some((a, idx) => a.id !== current[idx]?.id);
            if (!didChange) return current;

            localAccountsRef.current = next;
            return next;
        });
    };

    const handleDragOverCard = (e, acc) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const rect = e.currentTarget.getBoundingClientRect();
        const relativeX = (e.clientX - rect.left) / rect.width;
        const relativeY = (e.clientY - rect.top) / rect.height;
        const placement = relativeY > 0.55 || (relativeY > 0.25 && relativeY < 0.75 && relativeX > 0.5) ? "after" : "before";

        moveDraggedAccount(acc.id, placement);
    };

    const handleDragStart = (e, acc) => {
        if (dragArmedId.current !== acc.id) {
            e.preventDefault();
            return;
        }
        draggingId.current = acc.id;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", acc.id);
    };

    const handleDragEnd = () => {
        draggingId.current = null;
        dragArmedId.current = null;
        persistOrder(localAccountsRef.current);
    };

    const handleDragHandlePointerDown = (acc) => {
        dragArmedId.current = acc.id;
    };

    // Totales centralizados: usa computeTotalSavings para no doble-contar inversiones
    const { liquidBalance: totalInDisplayCurrency, investedTotal } = useMemo(
        () => computeTotalSavings(accounts, investments, transactions, convert),
        [accounts, investments, transactions, convert]
    );

    // Desglose por moneda para los badges de "Total disponible"
    const byCurrency = useMemo(() => {
        const activeInvAccountIds = new Set(
            (investments || [])
                .filter((i) => !i.status || i.status === "activa")
                .map((i) => i.account_id)
                .filter((id) => !!id && accounts.find((a) => a.id === id)?.type === "investment")
        );
        return accounts
            .filter((a) => !(a.type === "investment" && activeInvAccountIds.has(a.id)))
            .reduce((map, a) => {
                const c = a.currency || "ARS";
                map[c] = (map[c] || 0) + computeEffectiveBalance(a);
                return map;
            }, {});
    }, [accounts, investments, transactions]);

    return (
        <div className="space-y-5">
            <PageHeader title="Cuentas" action={
                <div className="flex items-center gap-2">
                    <CurrencySelector />
                    <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1.5" />Nueva</Button>
                </div>
            } />

            {/* Balance summary */}
            <TooltipProvider delayDuration={100}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total disponible</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(totalInDisplayCurrency, displayCurrency)}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {Object.entries(byCurrency).map(([c, v]) => (
                                    <Badge key={c} variant="outline" className="text-xs font-mono">
                                        {formatCurrencyCode(v, c)}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total invertido</p>
                            <p className="text-2xl font-bold text-chart-2">{formatCurrency(investedTotal, displayCurrency)}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {(() => {
                                    const byC = investments.reduce((acc, i) => {
                                        const c = i.currency || "ARS";
                                        acc[c] = (acc[c] || 0) + (i.current_value || i.amount_invested || 0);
                                        return acc;
                                    }, {});
                                    return Object.entries(byC).map(([c, v]) => (
                                        <Badge key={c} variant="outline" className="text-xs font-mono">{formatCurrencyCode(v, c)}</Badge>
                                    ));
                                })()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">No disponible para gastos</p>
                        </CardContent>
                    </Card>
                    <Card className="border-chart-3/30">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <p className="text-sm text-muted-foreground">Ahorro total</p>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help shrink-0" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-64 text-xs leading-relaxed">
                                        Suma del saldo disponible en cuentas líquidas más el valor actual de inversiones activas. Representa tu patrimonio financiero total, incluyendo fondos no disponibles para gastos inmediatos.
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <p className="text-2xl font-bold text-chart-3">
                                {formatCurrency(totalInDisplayCurrency + investedTotal, displayCurrency)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Disponible {formatCurrency(totalInDisplayCurrency, displayCurrency)} + Invertido {formatCurrency(investedTotal, displayCurrency)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>

            {/* Account cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {localAccounts.map((acc, i) => (
                    <SortableAccountCard
                        key={acc.id}
                        acc={acc}
                        i={i}
                        totalCount={localAccounts.length}
                        investments={investments}
                        computeEffectiveBalance={computeEffectiveBalance}
                        displayCurrency={displayCurrency}
                        convert={convert}
                        onEdit={() => setEditing(acc)}
                        onFavorite={() => toggleFavorite(acc)}
                        onToggleVisible={() => toggleVisible(acc)}
                        onMoveUp={() => moveAccount(i, -1)}
                        onMoveDown={() => moveAccount(i, 1)}
                        onDelete={() => deleteMut.mutate(acc.id)}
                        onDragHandlePointerDown={() => handleDragHandlePointerDown(acc)}
                        onDragStart={(e) => handleDragStart(e, acc)}
                        onDragOver={(e) => handleDragOverCard(e, acc)}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>

            <AccountFormDialog open={showForm || !!editing} onClose={() => { setShowForm(false); setEditing(null); }}
                accounts={accounts}
                initial={editing} onSubmit={(data) => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)} />
        </div>
    );
}

function SortableAccountCard({ acc, i, totalCount, investments, computeEffectiveBalance, displayCurrency, convert, onEdit, onFavorite, onToggleVisible, onMoveUp, onMoveDown, onDelete, onDragHandlePointerDown, onDragStart, onDragOver, onDragEnd }) {
    const Icon = iconMap[acc.type] || Wallet;
    const isInvestment = acc.type === "investment";
    const effective = computeEffectiveBalance(acc);
    const linkedInvs = investments.filter((inv) => inv.account_id === acc.id && (!inv.status || inv.status === "activa"));
    const investedAmt = linkedInvs.reduce((s, inv) => s + (inv.current_value || inv.amount_invested || 0), 0);

    const isHidden = acc.is_visible === false;

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            className="min-w-0"
        >
            <Card className={cn("relative group hover:shadow-lg transition-shadow", isInvestment && "border-chart-2/30", isHidden && "opacity-60")}>
                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                                data-drag-handle
                                onPointerDown={onDragHandlePointerDown}
                                className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/25 hover:text-muted-foreground/60 transition-colors shrink-0"
                                title="Arrastrar para ordenar"
                            >
                                <GripVertical className="h-4 w-4" />
                            </div>
                            <div className={cn("p-2.5 rounded-xl shrink-0", isInvestment ? "bg-chart-2/10" : "bg-primary/10")}>
                                <Icon className={cn("h-5 w-5", isInvestment ? "text-chart-2" : "text-primary")} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <p className="font-semibold text-sm truncate">{acc.name}</p>
                                    {acc.is_favorite && <Star className="h-3 w-3 text-chart-3 fill-chart-3 shrink-0" />}
                                    {isHidden && <EyeOff className="h-3 w-3 text-muted-foreground shrink-0" />}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Badge variant="secondary" className="text-xs">{ACCOUNT_TYPES[acc.type]}</Badge>
                                    <Badge variant="outline" className="text-xs font-mono">{acc.currency || "ARS"}</Badge>
                                </div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                <DropdownMenuItem onClick={onFavorite}>
                                    <Star className={cn("h-4 w-4 mr-2", acc.is_favorite ? "fill-chart-3 text-chart-3" : "")} />
                                    {acc.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onToggleVisible}>
                                    {isHidden
                                        ? <><Eye className="h-4 w-4 mr-2" />Mostrar en filtros</>
                                        : <><EyeOff className="h-4 w-4 mr-2" />Ocultar de filtros</>
                                    }
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onMoveUp} disabled={i === 0}>
                                    <ChevronUp className="h-4 w-4 mr-2" />Subir
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onMoveDown} disabled={i === totalCount - 1}>
                                    <ChevronDown className="h-4 w-4 mr-2" />Bajar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                                    <Trash2 className="h-4 w-4 mr-2" />Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <p className={cn("text-2xl font-bold mt-4", effective >= 0 ? "text-foreground" : "text-destructive")}>
                        {formatCurrency(effective, acc.currency || "ARS")}
                    </p>
                    {(acc.currency || "ARS") !== displayCurrency && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            ≈ {formatCurrency(convert(effective, acc.currency || "ARS"), displayCurrency)}
                        </p>
                    )}
                    {linkedInvs.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50 grid grid-cols-2 gap-x-2 text-xs">
                            <span className="text-muted-foreground">Inversiones activas</span>
                            <span className="text-right font-medium text-chart-2">{formatCurrency(investedAmt, acc.currency || "ARS")}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function AccountFormDialog({ open, onClose, onSubmit, initial, accounts = [] }) {
    const { activeCurrencies } = useCurrency();
    const defaultCurrency = activeCurrencies[0] || "ARS";
    const [form, setForm] = useState({
        name: "",
        type: "checking",
        currency: defaultCurrency,
        balance: 0,
        statement_close_day: "",
        statement_due_day: "",
        default_payment_account_id: "",
        credit_limit: "",
    });
    useEffect(() => {
        if (initial) setForm({
            ...initial,
            balance: String(initial.balance || 0),
            statement_close_day: initial.statement_close_day ? String(initial.statement_close_day) : "",
            statement_due_day: initial.statement_due_day ? String(initial.statement_due_day) : "",
            default_payment_account_id: initial.default_payment_account_id || "",
            credit_limit: initial.credit_limit ? String(initial.credit_limit) : "",
        });
        else setForm({
            name: "",
            type: "checking",
            currency: defaultCurrency,
            balance: 0,
            statement_close_day: "",
            statement_due_day: "",
            default_payment_account_id: "",
            credit_limit: "",
        });
    }, [initial, open]);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const paymentAccounts = accounts.filter((a) => a.id !== initial?.id && a.type !== "credit_card" && a.type !== "investment");

    const submit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            balance: parseFloat(form.balance) || 0,
            statement_close_day: form.type === "credit_card" && form.statement_close_day ? parseInt(form.statement_close_day) : null,
            statement_due_day: form.type === "credit_card" && form.statement_due_day ? parseInt(form.statement_due_day) : null,
            default_payment_account_id: form.type === "credit_card" ? (form.default_payment_account_id || null) : null,
            credit_limit: form.type === "credit_card" && form.credit_limit ? parseFloat(form.credit_limit) : null,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{initial ? "Editar" : "Nueva"} cuenta</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div><Label>Nombre</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
                    <div><Label>Tipo</Label>
                        <Select value={form.type} onValueChange={(v) => set("type", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(ACCOUNT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div><Label>Moneda</Label>
                        <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {activeCurrencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Saldo inicial</Label>
                        <p className="text-xs text-muted-foreground mb-1">Saldo antes de tus primeras transacciones registradas</p>
                        <Input type="number" step="0.01" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
                    </div>
                    {form.type === "credit_card" && (
                        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground">
                                Las fechas de cierre y vencimiento se ajustan por mes desde Tarjetas. Si no guardas fechas, se usa penultimo jueves y primer lunes del mes siguiente.
                            </p>
                            <div>
                                <Label className="text-xs">Cuenta de pago</Label>
                                <Select value={form.default_payment_account_id || "none"} onValueChange={(v) => set("default_payment_account_id", v === "none" ? "" : v)}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar cuenta" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin cuenta predeterminada</SelectItem>
                                        {paymentAccounts.map((a) => (
                                            <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "ARS"})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs">Limite opcional</Label>
                                <Input type="number" step="0.01" value={form.credit_limit}
                                    onChange={(e) => set("credit_limit", e.target.value)} placeholder="0.00" />
                            </div>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1">{initial ? "Guardar" : "Crear"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
