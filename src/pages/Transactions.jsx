import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Upload, ChevronDown, ChevronUp, Briefcase, Filter } from "lucide-react";
import { addMonths, addWeeks, addDays, format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import TransactionForm from "@/components/transactions/TransactionForm";
import { formatCurrency, formatCurrencyCode, formatDate, TRANSACTION_STATUS, TODAY } from "@/lib/formatters";
import { useCurrency } from "@/lib/currency-context";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImportModal from "@/components/transactions/ImportModal";

const typeConfig = {
    income: { icon: ArrowDownLeft, label: "Ingreso", color: "text-primary", bg: "bg-primary/10" },
    expense: { icon: ArrowUpRight, label: "Gasto", color: "text-destructive", bg: "bg-destructive/10" },
    transfer: { icon: ArrowLeftRight, label: "Transferencia", color: "text-chart-2", bg: "bg-chart-2/10" },
};

export default function Transactions() {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showImport, setShowImport] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusTab, setStatusTab] = useState("present");
    const [expanded, setExpanded] = useState({});
    const queryClient = useQueryClient();
    const { convert, displayCurrency } = useCurrency();

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date", 500),
    });
    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
    const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => base44.entities.Category.list() });

    function buildFutureOccurrences(data) {
        if (!data.is_recurring || !data.recurring_frequency) return [];
        // How many to generate: remaining installments or 6 by default
        const current = parseInt(data.installment_current) || 1;
        const total = parseInt(data.installment_total) || 0;
        const count = total > 0 ? total - current : 6;
        if (count <= 0) return [];

        const occurrences = [];
        let currentDate = data.date;
        for (let i = 1; i <= count; i++) {
            const d = parseISO(currentDate);
            let next;
            if (data.recurring_frequency === "weekly") next = format(addWeeks(d, 1), "yyyy-MM-dd");
            else if (data.recurring_frequency === "biweekly") next = format(addDays(d, 14), "yyyy-MM-dd");
            else if (data.recurring_frequency === "monthly") next = format(addMonths(d, 1), "yyyy-MM-dd");
            else if (data.recurring_frequency === "yearly") next = format(addMonths(d, 12), "yyyy-MM-dd");
            else break;
            occurrences.push({
                ...data,
                date: next,
                status: "installment",
                installment_current: current + i,
            });
            currentDate = next;
        }
        return occurrences;
    }

    const createMut = useMutation({
        mutationFn: async (data) => {
            const created = await base44.entities.Transaction.create(data);
            if (data.is_recurring && data.recurring_frequency) {
                const futures = buildFutureOccurrences(data);
                await Promise.all(futures.map((f) => base44.entities.Transaction.create(f)));
            }
            return created;
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); setShowForm(false); },
    });
    const updateMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); setEditing(null); },
    });
    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.Transaction.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    });

    // "present" = confirmed + past installments; "future" = future installments
    const filtered = transactions.filter((t) => {
        // Never show projected here
        if (t.status === "projected") return false;

        const matchSearch = !search ||
            t.description?.toLowerCase().includes(search.toLowerCase()) ||
            t.category_name?.toLowerCase().includes(search.toLowerCase()) ||
            t.project_name?.toLowerCase().includes(search.toLowerCase()) ||
            t.client_name?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || t.type === typeFilter;

        let matchTab = true;
        if (statusTab === "present") matchTab = t.status === "confirmed" || (t.status === "installment" && t.date <= TODAY);
        else if (statusTab === "future") matchTab = t.status === "installment" && t.date > TODAY;

        return matchSearch && matchType && matchTab;
    });

    const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

    return (
        <div className="space-y-5">
            <PageHeader title="Transacciones"
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
                            <Upload className="h-4 w-4 mr-1.5" />Importar
                        </Button>
                        <Button size="sm" onClick={() => setShowForm(true)}>
                            <Plus className="h-4 w-4 mr-1.5" />Nueva
                        </Button>
                    </div>
                }
            />

            {/* Status Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                <Tabs value={statusTab} onValueChange={setStatusTab} className="flex-1">
                    <TabsList className="h-9 w-full sm:w-auto">
                        <TabsTrigger value="present" className="flex-1 sm:flex-none text-xs px-4">Presente</TabsTrigger>
                        <TabsTrigger value="future" className="flex-1 sm:flex-none text-xs px-4">Cuotas futuras</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex gap-2 flex-1 sm:flex-none">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar..." className="pl-9 h-9 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-9 h-9 px-0 sm:w-36 sm:px-3">
                            <Filter className="h-4 w-4 sm:hidden" />
                            <span className="hidden sm:inline"><SelectValue /></span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            <SelectItem value="income">Ingresos</SelectItem>
                            <SelectItem value="expense">Gastos</SelectItem>
                            <SelectItem value="transfer">Transferencias</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="overflow-hidden">
                {isLoading ? (
                    <div className="divide-y divide-border">
                        {[...Array(5)].map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12" /></div>)}
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12 text-sm">No se encontraron transacciones</p>
                ) : (
                    <div className="divide-y divide-border">
                        {filtered.map((tx) => {
                            const cfg = typeConfig[tx.type] || typeConfig.expense;
                            const Icon = cfg.icon;
                            const statusCfg = TRANSACTION_STATUS[tx.status || "confirmed"];
                            const isFuture = tx.date > TODAY;
                            const hasExtra = tx.project_name || tx.client_name || tx.notes || tx.installment_total;
                            const isExpanded = expanded[tx.id];

                            return (
                                <div key={tx.id} className={cn("transition-colors", isFuture && "bg-muted/20")}>
                                    <div className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer"
                                        onClick={() => setEditing(tx)}>
                                        <div className={cn("p-2 rounded-lg flex-shrink-0", cfg.bg)}>
                                            <Icon className={cn("h-4 w-4", cfg.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-medium truncate">{tx.description || cfg.label}</p>
                                                <Badge variant="outline" className={cn("text-xs px-1.5 py-0", statusCfg?.color)}>
                                                    {statusCfg?.label}
                                                </Badge>
                                                {tx.project_name && (
                                                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                                        <Briefcase className="h-3 w-3 mr-1" />{tx.project_name}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {tx.category_name && `${tx.category_name} · `}
                                                {tx.account_name && `${tx.account_name} · `}
                                                {formatDate(tx.date)}
                                                {tx.installment_current && tx.installment_total && ` · Cuota ${tx.installment_current}/${tx.installment_total}`}
                                                {tx.status === "projected" && tx.probability && ` · ${tx.probability}%`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <div className="text-right">
                                                <p className={cn("text-sm font-semibold", cfg.color)}>
                                                    {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                                                    {formatCurrencyCode(tx.amount, tx.currency || "MXN")}
                                                </p>
                                                {tx.currency && tx.currency !== displayCurrency && (
                                                    <p className="text-xs text-muted-foreground">
                                                        ≈ {formatCurrencyCode(convert(tx.amount, tx.currency || "MXN"), displayCurrency)}
                                                    </p>
                                                )}
                                            </div>
                                            {hasExtra && (
                                                <button onClick={(e) => { e.stopPropagation(); toggleExpand(tx.id); }}
                                                    className="text-muted-foreground hover:text-foreground">
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => { e.stopPropagation(); deleteMut.mutate(tx.id); }}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Expandable detail */}
                                    {isExpanded && (
                                        <div className="px-14 pb-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground border-t bg-muted/10">
                                            {tx.client_name && <div className="pt-2"><span className="font-medium">Cliente:</span> {tx.client_name}</div>}
                                            {tx.due_date && <div className="pt-2"><span className="font-medium">Vencimiento:</span> {formatDate(tx.due_date)}</div>}
                                            {tx.notes && <div className="pt-2 col-span-2"><span className="font-medium">Notas:</span> {tx.notes}</div>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            <TransactionForm open={showForm} onClose={() => setShowForm(false)}
                accounts={accounts} categories={categories}
                onSubmit={(data) => createMut.mutate(data)} />

            {editing && (
                <TransactionForm open={!!editing} onClose={() => setEditing(null)}
                    accounts={accounts} categories={categories}
                    initial={editing}
                    onSubmit={(data) => updateMut.mutate({ id: editing.id, data })} />
            )}

            <ImportModal open={showImport} onClose={() => setShowImport(false)}
                accounts={accounts} categories={categories}
                onImported={() => queryClient.invalidateQueries({ queryKey: ["transactions"] })} />
        </div>
    );
}