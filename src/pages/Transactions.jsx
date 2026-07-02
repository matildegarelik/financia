import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Plus, Search, Trash2, Upload, ChevronDown, ChevronUp, Briefcase, Filter, Star, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, addWeeks, addDays, format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import PageHeader from "@/components/shared/PageHeader";
import TransactionForm from "@/components/transactions/TransactionForm";
import { formatCurrency, formatCurrencyCode, formatDate, TRANSACTION_STATUS, TODAY, getTransferDestinationAmount } from "@/lib/formatters";
import { useCurrency } from "@/lib/currency-context";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImportModal from "@/components/transactions/ImportModal";

const PAGE_SIZE = 50;

const typeConfig = {
    income: { icon: ArrowDownLeft, label: "Ingreso", color: "text-primary", bg: "bg-primary/10" },
    expense: { icon: ArrowUpRight, label: "Gasto", color: "text-destructive", bg: "bg-destructive/10" },
    transfer: { icon: ArrowLeftRight, label: "Transferencia", color: "text-chart-2", bg: "bg-chart-2/10" },
};

const DATE_PRESETS = [
    { value: "all",      label: "Todo" },
    { value: "month",    label: "Último mes" },
    { value: "3months",  label: "Últimos 3 meses" },
    { value: "year",     label: "Último año" },
    { value: "no_date",  label: "Sin fecha" },
    { value: "custom",   label: "Personalizado" },
];

export default function Transactions() {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showImport, setShowImport] = useState(false);
    const [accountTab, setAccountTab] = useState("all");
    const [deleteConfirmSimple, setDeleteConfirmSimple] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [expanded, setExpanded] = useState({});

    // Basic filters
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusTab, setStatusTab] = useState("present");

    // Advanced filter state
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [datePreset, setDatePreset] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [advAccFilter, setAdvAccFilter] = useState("all");
    const [advCatFilter, setAdvCatFilter] = useState("all");

    // Pagination
    const [page, setPage] = useState(1);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("new") === "1") {
            setShowForm(true);
            window.history.replaceState({}, "", "/transactions");
        }
    }, []);

    // Reset page when any filter changes
    useEffect(() => {
        setPage(1);
    }, [statusTab, accountTab, advAccFilter, advCatFilter, datePreset, dateFrom, dateTo, typeFilter, search]);

    const queryClient = useQueryClient();
    const { convert, displayCurrency } = useCurrency();

    // All transactions — for balance computation and installment lookups
    const { data: allTx = [] } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date", 5000),
        staleTime: 30000,
    });
    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
    const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => base44.entities.Category.list() });

    const sortedAccounts = useMemo(() => {
        const visible = accounts.filter(a => a.is_visible !== false);
        const favs = visible.filter(a => a.is_favorite).sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
        const rest = visible.filter(a => !a.is_favorite).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        return [...favs, ...rest];
    }, [accounts]);

    const allAccountsSorted = useMemo(() =>
        [...accounts].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999)),
        [accounts]
    );

    const orderedCategories = useMemo(() => {
        const parents = categories.filter(c => !c.parent_category).sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
        const children = categories.filter(c => !!c.parent_category);
        const result = [];
        parents.forEach(p => {
            result.push({ ...p, isParent: true });
            children.filter(c => c.parent_category === p.id).forEach(c => result.push({ ...c, isParent: false }));
        });
        children.filter(c => !parents.find(p => p.id === c.parent_category)).forEach(c => result.push({ ...c, isParent: false }));
        return result;
    }, [categories]);

    const matchingCategoryIds = useMemo(() => {
        if (advCatFilter === "all" || advCatFilter === "no_category") return null;
        const childIds = categories.filter(c => c.parent_category === advCatFilter).map(c => c.id);
        return [advCatFilter, ...childIds];
    }, [advCatFilter, categories]);

    const activeDateRange = useMemo(() => {
        if (datePreset === "all" || datePreset === "no_date") return null;
        const to = TODAY;
        if (datePreset === "month") { const d = new Date(TODAY); d.setMonth(d.getMonth() - 1); return { from: d.toISOString().split("T")[0], to }; }
        if (datePreset === "3months") { const d = new Date(TODAY); d.setMonth(d.getMonth() - 3); return { from: d.toISOString().split("T")[0], to }; }
        if (datePreset === "year") { const d = new Date(TODAY); d.setFullYear(d.getFullYear() - 1); return { from: d.toISOString().split("T")[0], to }; }
        if (datePreset === "custom") return { from: dateFrom || null, to: dateTo || null };
        return null;
    }, [datePreset, dateFrom, dateTo]);

    const isAdvancedActive = datePreset !== "all" || advAccFilter !== "all" || advCatFilter !== "all";
    // Subtotal only makes sense for a single-currency context (specific account selected)
    const singleAccountSelected = accountTab !== "all" || advAccFilter !== "all";
    const showSubtotal = isAdvancedActive && singleAccountSelected;

    function clearAdvanced() {
        setDatePreset("all"); setDateFrom(""); setDateTo("");
        setAdvAccFilter("all"); setAdvCatFilter("all");
    }

    // Build server-side filter function
    function makeFilters() {
        return (q) => {
            q = q.neq("status", "projected");

            if (statusTab === "present") {
                q = q.or(`status.eq.confirmed,and(status.eq.installment,date.lte.${TODAY})`);
            } else if (statusTab === "future") {
                q = q.eq("status", "installment").gt("date", TODAY);
            }

            if (advAccFilter !== "all") {
                q = q.or(`account_id.eq.${advAccFilter},to_account_id.eq.${advAccFilter}`);
            } else if (accountTab !== "all") {
                q = q.or(`account_id.eq.${accountTab},to_account_id.eq.${accountTab}`);
            }

            if (datePreset === "no_date") {
                q = q.is("date", null);
            } else if (activeDateRange) {
                if (activeDateRange.from) q = q.gte("date", activeDateRange.from);
                if (activeDateRange.to) q = q.lte("date", activeDateRange.to);
            }

            if (advCatFilter === "no_category") {
                q = q.neq("type", "transfer").is("category_id", null).is("category_name", null);
            } else if (matchingCategoryIds && matchingCategoryIds.length > 0) {
                if (typeFilter === "all") {
                    q = q.or(`type.eq.transfer,category_id.in.(${matchingCategoryIds.join(",")})`);
                } else {
                    q = q.in("category_id", matchingCategoryIds);
                }
            }

            if (typeFilter !== "all") q = q.eq("type", typeFilter);

            if (search.trim()) {
                const s = search.trim();
                q = q.or(`description.ilike.%${s}%,category_name.ilike.%${s}%,project_name.ilike.%${s}%,client_name.ilike.%${s}%`);
            }

            q = q.order("date", { ascending: false, nullsFirst: false });
            q = q.order("created_at", { ascending: false });
            return q;
        };
    }

    const filterKeys = [statusTab, accountTab, advAccFilter, advCatFilter, typeFilter, search, datePreset, dateFrom, dateTo];

    // Paginated display query
    const { data: pagedResult = { data: [], count: 0 }, isLoading } = useQuery({
        queryKey: ["transactions", "paged", page, ...filterKeys],
        queryFn: () => base44.entities.Transaction.listPaginated(makeFilters(), page, PAGE_SIZE),
        placeholderData: keepPreviousData,
    });

    // Subtotal query (all matching rows, no pagination, just amounts)
    const { data: subtotalRows = [] } = useQuery({
        queryKey: ["transactions", "subtotal", ...filterKeys],
        queryFn: () => base44.entities.Transaction.listForSubtotal(makeFilters()),
        enabled: showSubtotal,
    });

    const pageData = pagedResult.data || [];
    const totalCount = pagedResult.count || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const pageStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const pageEnd = Math.min(page * PAGE_SIZE, totalCount);

    const periodSubtotal = useMemo(() => {
        const income = subtotalRows.filter(t => t.type === "income").reduce((s, t) => s + convert(t.amount || 0, t.currency || displayCurrency), 0);
        const expense = subtotalRows.filter(t => t.type === "expense").reduce((s, t) => s + convert(t.amount || 0, t.currency || displayCurrency), 0);
        return { income, expense, net: income - expense };
    }, [subtotalRows, convert, displayCurrency]);

    function computeEffective(acc) {
        return allTx
            .filter((tx) => tx.status !== "projected" && tx.date && tx.date <= TODAY)
            .reduce((sum, tx) => {
                if (tx.account_id === acc.id) {
                    if (tx.type === "income") return sum + (tx.amount || 0);
                    if (tx.type === "expense") return sum - (tx.amount || 0);
                    if (tx.type === "transfer") return sum - (tx.amount || 0);
                }
                if (tx.to_account_id === acc.id && tx.type === "transfer") return sum + getTransferDestinationAmount(tx, acc.currency);
                return sum;
            }, acc.balance || 0);
    }

    const selectedAccount = accountTab !== "all" ? accounts.find(a => a.id === accountTab) : null;
    const selectedBalance = selectedAccount ? computeEffective(selectedAccount) : null;

    function buildFutureOccurrences(data) {
        if (!data.is_recurring || !data.recurring_frequency) return [];
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
            occurrences.push({ ...data, date: next, status: "installment", installment_current: current + i });
            currentDate = next;
        }
        return occurrences;
    }

    const getRelatedInstallments = (tx) =>
        allTx.filter(t => t.id !== tx.id && t.is_recurring && t.type === tx.type &&
            t.recurring_frequency === tx.recurring_frequency &&
            t.description === tx.description && t.account_id === tx.account_id);

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
    const deleteAllMut = useMutation({
        mutationFn: (ids) => Promise.all(ids.map((id) => base44.entities.Transaction.delete(id))),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    });

    const handleDeleteClick = (e, tx) => {
        e.stopPropagation();
        if (tx.status === "installment") setDeleteConfirm(tx);
        else setDeleteConfirmSimple(tx);
    };

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

            {/* Status tabs + advanced toggle + search/type */}
            <div className="flex items-center gap-2 flex-wrap">
                <Tabs value={statusTab} onValueChange={setStatusTab}>
                    <TabsList className="h-9">
                        <TabsTrigger value="present" className="text-xs px-4">Presente</TabsTrigger>
                        <TabsTrigger value="future" className="text-xs px-4">Cuotas futuras</TabsTrigger>
                    </TabsList>
                </Tabs>

                <button
                    onClick={() => setAdvancedOpen(v => !v)}
                    className={cn(
                        "flex items-center gap-1.5 h-9 px-3 rounded-md text-xs border transition-colors",
                        advancedOpen || isAdvancedActive
                            ? "border-primary text-primary bg-primary/5"
                            : "border-border text-muted-foreground hover:text-foreground"
                    )}
                >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filtros
                    {isAdvancedActive && <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 ml-0.5">activo</Badge>}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", advancedOpen && "rotate-180")} />
                </button>

                <div className="flex gap-2 flex-1 sm:flex-none ml-auto">
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

            {/* Advanced filter panel */}
            {advancedOpen && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3">
                    <div>
                        <Label className="text-xs text-muted-foreground">Período</Label>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {DATE_PRESETS.map(({ value, label }) => (
                                <button key={value} onClick={() => setDatePreset(value)}
                                    className={cn("px-2.5 py-1 text-xs rounded-full transition-colors",
                                        datePreset === value
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-background border border-border text-muted-foreground hover:text-foreground"
                                    )}>
                                    {label}
                                </button>
                            ))}
                        </div>
                        {datePreset === "custom" && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div><Label className="text-xs">Desde</Label><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-xs mt-1" /></div>
                                <div><Label className="text-xs">Hasta</Label><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-xs mt-1" /></div>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Cuenta (incluye ocultas)</Label>
                        <Select value={advAccFilter} onValueChange={setAdvAccFilter}>
                            <SelectTrigger className="h-8 text-xs mt-1.5"><SelectValue placeholder="Todas las cuentas" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las cuentas</SelectItem>
                                {allAccountsSorted.map(a => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.name} · {a.currency}{a.is_visible === false ? " · oculta" : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Categoría</Label>
                        <Select value={advCatFilter} onValueChange={setAdvCatFilter}>
                            <SelectTrigger className="h-8 text-xs mt-1.5"><SelectValue placeholder="Todas las categorías" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                <SelectItem value="no_category">Sin categoría</SelectItem>
                                {orderedCategories.map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.isParent ? c.name : `  ↳ ${c.name}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isAdvancedActive && (
                        <button onClick={clearAdvanced} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <X className="h-3.5 w-3.5" />Limpiar filtros
                        </button>
                    )}
                </div>
            )}

            {/* Account tabs */}
            {sortedAccounts.length > 0 && (
                <div className="space-y-1.5">
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
                        <button onClick={() => setAccountTab("all")}
                            className={cn("px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 transition-colors",
                                accountTab === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
                            Todas
                        </button>
                        {sortedAccounts.map(acc => (
                            <button key={acc.id} onClick={() => setAccountTab(acc.id)}
                                className={cn("flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 transition-colors",
                                    accountTab === acc.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
                                {acc.is_favorite && <Star className="h-3 w-3 fill-current" />}
                                {acc.name}
                                <span className={cn("opacity-60", accountTab === acc.id && "opacity-80")}>{acc.currency}</span>
                            </button>
                        ))}
                    </div>
                    {selectedAccount && (
                        <p className="text-xs text-muted-foreground px-0.5">
                            Total:{" "}
                            <span className={cn("font-semibold", selectedBalance < 0 ? "text-destructive" : "text-foreground")}>
                                {formatCurrencyCode(selectedBalance, selectedAccount.currency || "ARS")}
                            </span>
                            {(selectedAccount.currency || "ARS") !== displayCurrency && (
                                <span className="ml-1 text-muted-foreground/70">
                                    ≈ {formatCurrencyCode(convert(selectedBalance, selectedAccount.currency || "ARS"), displayCurrency)}
                                </span>
                            )}
                        </p>
                    )}
                </div>
            )}

            {/* Period subtotal — only when advanced active AND a specific account is selected */}
            {showSubtotal && (
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3 grid grid-cols-3 divide-x divide-border/60 text-center">
                    <div className="px-2">
                        <p className="text-xs text-muted-foreground">Ingresos</p>
                        <p className="text-sm font-semibold text-primary">+{formatCurrency(periodSubtotal.income, displayCurrency)}</p>
                    </div>
                    <div className="px-2">
                        <p className="text-xs text-muted-foreground">Gastos</p>
                        <p className="text-sm font-semibold text-destructive">-{formatCurrency(periodSubtotal.expense, displayCurrency)}</p>
                    </div>
                    <div className="px-2">
                        <p className="text-xs text-muted-foreground">Neto</p>
                        <p className={cn("text-sm font-semibold", periodSubtotal.net >= 0 ? "text-primary" : "text-destructive")}>
                            {formatCurrency(periodSubtotal.net, displayCurrency)}
                        </p>
                    </div>
                </div>
            )}

            <Card className="overflow-hidden">
                {isLoading ? (
                    <div className="divide-y divide-border">
                        {[...Array(5)].map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12" /></div>)}
                    </div>
                ) : pageData.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12 text-sm">No se encontraron transacciones</p>
                ) : (
                    <>
                        <div className="divide-y divide-border">
                            {pageData.map((tx) => {
                                const cfg = typeConfig[tx.type] || typeConfig.expense;
                                const Icon = cfg.icon;
                                const statusCfg = TRANSACTION_STATUS[tx.status || "confirmed"];
                                const isFuture = tx.date && tx.date > TODAY;
                                const hasExtra = tx.project_name || tx.client_name || tx.notes || tx.installment_total;
                                const isExpanded = expanded[tx.id];
                                const transferDestinationCurrency = tx.to_currency || accounts.find((a) => a.id === tx.to_account_id)?.currency || tx.currency || "ARS";
                                const transferDestinationAmount = getTransferDestinationAmount(tx, transferDestinationCurrency);
                                const transferAccountLine = tx.type === "transfer"
                                    ? `De ${tx.account_name || "cuenta origen"} a ${tx.to_account_name || "cuenta destino"}`
                                    : null;

                                return (
                                    <div key={tx.id} className={cn("transition-colors", isFuture && "bg-muted/20")}>
                                        <div className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer" onClick={() => setEditing(tx)}>
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
                                                    <span className={cn("font-medium", !tx.date && "italic opacity-50")}>
                                                        {tx.date ? formatDate(tx.date) : "Sin fecha"}
                                                    </span>
                                                    {tx.category_name && ` · ${tx.category_name}`}
                                                    {transferAccountLine ? ` · ${transferAccountLine}` : tx.account_name && ` · ${tx.account_name}`}
                                                    {tx.installment_current && tx.installment_total && ` · Cuota ${tx.installment_current}/${tx.installment_total}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="text-right">
                                                    {tx.type === "transfer" ? (
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-semibold text-destructive flex items-center justify-end gap-1">
                                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                                                -{formatCurrencyCode(tx.amount, tx.currency || "ARS")}
                                                            </p>
                                                            <p className="text-sm font-semibold text-primary flex items-center justify-end gap-1">
                                                                <ArrowDownLeft className="h-3.5 w-3.5" />
                                                                +{formatCurrencyCode(transferDestinationAmount, transferDestinationCurrency)}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className={cn("text-sm font-semibold", cfg.color)}>
                                                            {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                                                            {formatCurrencyCode(tx.amount, tx.currency || "ARS")}
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
                                                    onClick={(e) => handleDeleteClick(e, tx)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
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

                        {/* Pagination footer */}
                        <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
                            <span>
                                {totalCount === 0 ? "Sin resultados" : `${pageStart}–${pageEnd} de ${totalCount} transacciones`}
                            </span>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="px-2 font-medium tabular-nums">{page} / {totalPages}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages}
                                        onClick={() => setPage(p => p + 1)}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
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

            <AlertDialog open={!!deleteConfirmSimple} onOpenChange={() => setDeleteConfirmSimple(null)}>
                <AlertDialogContent className="max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar transacción</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Eliminar "{deleteConfirmSimple?.description || (deleteConfirmSimple?.type === "income" ? "Ingreso" : "Gasto")}"? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => { deleteMut.mutate(deleteConfirmSimple.id); setDeleteConfirmSimple(null); }}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {deleteConfirm && (() => {
                const related = getRelatedInstallments(deleteConfirm);
                const total = related.length + 1;
                return (
                    <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                        <DialogContent className="max-w-sm">
                            <DialogHeader><DialogTitle>Eliminar cuota</DialogTitle></DialogHeader>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {deleteConfirm.description || (deleteConfirm.type === "income" ? "Ingreso" : "Gasto")}
                                </span>{" "}
                                es parte de una serie recurrente.
                                {total > 1 && ` Hay ${total} cuotas en total.`}
                            </p>
                            <div className="flex flex-col gap-2 pt-1">
                                <Button variant="outline" className="justify-start"
                                    onClick={() => { deleteMut.mutate(deleteConfirm.id); setDeleteConfirm(null); }}>
                                    Eliminar solo esta cuota
                                </Button>
                                {total > 1 && (
                                    <Button variant="destructive" className="justify-start"
                                        onClick={() => { deleteAllMut.mutate([deleteConfirm.id, ...related.map(t => t.id)]); setDeleteConfirm(null); }}>
                                        Eliminar todas las cuotas ({total})
                                    </Button>
                                )}
                                <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            })()}
        </div>
    );
}
