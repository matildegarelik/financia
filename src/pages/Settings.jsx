import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import { RefreshCw, Save, Loader2, Plus, X, Star, Bitcoin, ChevronUp, ChevronDown, ArrowRight, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/lib/currency-context";
import { navItems, loadFavPaths, saveFavPaths } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { Reorder, useDragControls } from "framer-motion";

const CURRENCY_INFO = {
    MXN: { name: "Peso Mexicano", flag: "🇲🇽" },
    USD: { name: "Dólar Americano", flag: "🇺🇸" },
    EUR: { name: "Euro", flag: "🇪🇺" },
    ARS: { name: "Peso Argentino", flag: "🇦🇷" },
    COP: { name: "Peso Colombiano", flag: "🇨🇴" },
    CLP: { name: "Peso Chileno", flag: "🇨🇱" },
    PEN: { name: "Sol Peruano", flag: "🇵🇪" },
};

function CurrencyItem({ cur, idx, total, onMove, onRemove }) {
    const controls = useDragControls();
    const info = CURRENCY_INFO[cur] || { name: cur, flag: "💱" };
    return (
        <Reorder.Item key={cur} value={cur} as="div" dragControls={controls} dragListener={false}
            className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-muted/30 transition-colors select-none">
            <div
                onPointerDown={(e) => controls.start(e)}
                className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0">
                <GripVertical className="h-4 w-4" />
            </div>
            <span className="text-lg">{info.flag}</span>
            <div className="flex-1 min-w-0">
                <p className="font-mono font-semibold text-sm leading-none">{cur}</p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{info.name}</p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
                <button onClick={() => onMove(idx, -1)} disabled={idx === 0}
                    className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors">
                    <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onMove(idx, 1)} disabled={idx === total - 1}
                    className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors">
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onRemove(cur)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </Reorder.Item>
    );
}

export default function Settings() {
    const queryClient = useQueryClient();
    const { activeCurrencies, setActiveCurrencies, allCurrencies, addCustomCurrency } = useCurrency();

    const { data: exchangeRates = [] } = useQuery({
        queryKey: ["exchangeRates"],
        queryFn: () => base44.entities.ExchangeRate.list(),
    });
    const { data: accounts = [] } = useQuery({
        queryKey: ["accounts"],
        queryFn: () => base44.entities.Account.list(),
    });
    const { data: transactions = [] } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => base44.entities.Transaction.list("-date", 500),
    });

    const today = new Date().toISOString().split("T")[0];
    function computeEffective(acc) {
        return transactions
            .filter((tx) => tx.status !== "projected" && tx.date && tx.date <= today)
            .reduce((sum, tx) => {
                if (tx.account_id === acc.id) {
                    if (tx.type === "income") return sum + (tx.amount || 0);
                    if (tx.type === "expense") return sum - (tx.amount || 0);
                    if (tx.type === "transfer") return sum - (tx.amount || 0);
                }
                if (tx.to_account_id === acc.id && tx.type === "transfer") return sum + (tx.to_amount || tx.amount || 0);
                return sum;
            }, acc.balance || 0);
    }

    const [rateValues, setRateValues] = useState({});
    const [loadingRates, setLoadingRates] = useState(false);
    const [savingRates, setSavingRates] = useState(false);
    const [accountBalances, setAccountBalances] = useState({});
    const [savingBalances, setSavingBalances] = useState(false);
    const [showAddCurrency, setShowAddCurrency] = useState(false);
    const [customCurrencyInput, setCustomCurrencyInput] = useState("");
    const [favPaths, setFavPathsState] = useState(loadFavPaths);

    useEffect(() => {
        const map = {};
        exchangeRates.forEach((r) => {
            map[`${r.from_currency}_${r.to_currency}`] = { rate: String(r.rate), id: r.id };
        });
        setRateValues(map);
    }, [exchangeRates]);

    useEffect(() => {
        const map = {};
        accounts.forEach((a) => { map[a.id] = String(a.balance || 0); });
        setAccountBalances(map);
    }, [accounts]);

    // Generar pares dinámicamente
    const currencyPairs = [];
    for (let i = 0; i < activeCurrencies.length; i++) {
        for (let j = i + 1; j < activeCurrencies.length; j++) {
            currencyPairs.push([activeCurrencies[i], activeCurrencies[j]]);
            currencyPairs.push([activeCurrencies[j], activeCurrencies[i]]);
        }
    }

    async function persistAllRates(map) {
        const dateToday = new Date().toISOString().split("T")[0];
        for (const [from, to] of currencyPairs) {
            const key = `${from}_${to}`;
            const val = (map || rateValues)[key];
            if (!val?.rate) continue;
            const existing = exchangeRates.find((r) => r.from_currency === from && r.to_currency === to);
            if (existing) {
                await base44.entities.ExchangeRate.update(existing.id, { rate: parseFloat(val.rate), updated_at: dateToday });
            } else {
                await base44.entities.ExchangeRate.create({ from_currency: from, to_currency: to, rate: parseFloat(val.rate), updated_at: dateToday });
            }
        }
        queryClient.invalidateQueries({ queryKey: ["exchangeRates"] });
    }

    const fetchRates = async () => {
        setLoadingRates(true);
        try {
            const newMap = { ...rateValues };
            const fromCurrencies = [...new Set(currencyPairs.map(([from]) => from))];
            for (const from of fromCurrencies) {
                const res = await fetch(
                    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from.toLowerCase()}.json`
                );
                const data = await res.json();
                const rates = data[from.toLowerCase()];
                if (!rates) continue;
                for (const [f, to] of currencyPairs.filter(([f]) => f === from)) {
                    const rate = rates[to.toLowerCase()];
                    if (rate) newMap[`${from}_${to}`] = { ...(newMap[`${from}_${to}`] || {}), rate: String(rate) };
                }
            }
            setRateValues(newMap);
            await persistAllRates(newMap);
            toast.success("Tasas actualizadas y guardadas");
        } catch {
            toast.error("No se pudieron obtener las tasas");
        }
        setLoadingRates(false);
    };

    const handleSaveAllRates = async () => {
        setSavingRates(true);
        try {
            await persistAllRates(rateValues);
            toast.success("Tasas guardadas");
        } catch {
            toast.error("Error guardando tasas");
        }
        setSavingRates(false);
    };

    const handleSaveAllBalances = async () => {
        setSavingBalances(true);
        try {
            for (const acc of accounts) {
                const val = accountBalances[acc.id];
                if (val !== undefined) {
                    await base44.entities.Account.update(acc.id, { balance: parseFloat(val) || 0 });
                }
            }
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Saldos guardados");
        } catch {
            toast.error("Error guardando saldos");
        }
        setSavingBalances(false);
    };

    const toggleFav = (path) => {
        let next;
        if (favPaths.includes(path)) {
            if (favPaths.length <= 1) { toast.error("Debe haber al menos 1 favorito"); return; }
            next = favPaths.filter((p) => p !== path);
        } else {
            if (favPaths.length >= 5) { toast.error("Máximo 5 favoritos"); return; }
            next = [...favPaths, path];
        }
        setFavPathsState(next);
        saveFavPaths(next);
        toast.success("Favoritos actualizados");
    };

    const removeCurrency = (cur) => {
        if (activeCurrencies.length <= 1) { toast.error("Debe haber al menos una moneda activa"); return; }
        setActiveCurrencies(activeCurrencies.filter((c) => c !== cur));
    };

    const addCurrency = (cur) => {
        if (!activeCurrencies.includes(cur)) setActiveCurrencies([...activeCurrencies, cur]);
        setShowAddCurrency(false);
        setCustomCurrencyInput("");
    };

    const addCustomCurrencyAndActivate = () => {
        const code = customCurrencyInput.trim().toUpperCase();
        if (code.length < 2 || code.length > 10 || !/^[A-Z0-9]+$/.test(code)) {
            toast.error("Código inválido. Usá letras y números, entre 2 y 10 caracteres.");
            return;
        }
        if (activeCurrencies.includes(code)) { toast.error("Esa moneda ya está activa"); return; }
        addCustomCurrency(code);
        setActiveCurrencies([...activeCurrencies, code]);
        setShowAddCurrency(false);
        setCustomCurrencyInput("");
        toast.success(`${code} agregada`);
    };

    const moveCurrency = (idx, dir) => {
        const next = [...activeCurrencies];
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= next.length) return;
        [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
        setActiveCurrencies(next);
    };

    const inactiveCurrencies = allCurrencies.filter((c) => !activeCurrencies.includes(c));

    return (
        <div className="space-y-6 max-w-5xl">
            <PageHeader title="Configuración" description="Monedas, tipos de cambio y saldos" />

            {/* Top grid: currencies left, exchange rates right */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Left column */}
                <div className="space-y-6">

                    {/* Monedas activas */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Monedas activas</CardTitle>
                            <p className="text-xs text-muted-foreground">Solo estas aparecen en formularios. La primera es la moneda de visualización principal.</p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Reorder.Group as="div" axis="y" values={activeCurrencies} onReorder={setActiveCurrencies} className="space-y-2">
                                {activeCurrencies.map((cur, idx) => (
                                    <CurrencyItem
                                        key={cur}
                                        cur={cur}
                                        idx={idx}
                                        total={activeCurrencies.length}
                                        onMove={moveCurrency}
                                        onRemove={removeCurrency}
                                    />
                                ))}
                            </Reorder.Group>

                            {!showAddCurrency ? (
                                <button
                                    onClick={() => setShowAddCurrency(true)}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-all"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Agregar moneda
                                </button>
                            ) : (
                                <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                                    {inactiveCurrencies.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {inactiveCurrencies.map((cur) => {
                                                const info = CURRENCY_INFO[cur] || { name: cur, flag: "💱" };
                                                return (
                                                    <button key={cur} onClick={() => addCurrency(cur)}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-border hover:border-primary bg-background hover:bg-primary/5 text-sm transition-all">
                                                        <span>{info.flag}</span>
                                                        <span className="font-mono font-semibold text-xs">{cur}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Bitcoin className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <Input
                                            placeholder="Código custom (BTC, USDT…)"
                                            value={customCurrencyInput}
                                            onChange={(e) => setCustomCurrencyInput(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === "Enter" && addCustomCurrencyAndActivate()}
                                            maxLength={10}
                                            className="h-8 text-sm font-mono"
                                        />
                                        <Button size="sm" className="h-8 px-3 shrink-0" onClick={addCustomCurrencyAndActivate} disabled={!customCurrencyInput.trim()}>
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <button onClick={() => { setShowAddCurrency(false); setCustomCurrencyInput(""); }}
                                        className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1">
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Favoritos barra móvil — solo visible en mobile */}
                    <Card className="lg:hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Star className="h-4 w-4 text-chart-3" />
                                Barra de navegación
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">Elegí hasta 5 secciones para la barra inferior.</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2">
                                {navItems.map((item) => {
                                    const isFav = favPaths.includes(item.path);
                                    return (
                                        <button key={item.path} onClick={() => toggleFav(item.path)}
                                            className={cn(
                                                "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all",
                                                isFav
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border text-muted-foreground hover:border-primary/40"
                                            )}>
                                            <item.icon className="h-5 w-5" />
                                            <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                                            {isFav && <Star className="h-3 w-3 fill-primary text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">{favPaths.length}/5 seleccionados</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right column: exchange rates */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <CardTitle className="text-base">Tipos de cambio</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Cuánto equivale 1 unidad de la moneda origen en la moneda destino.
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button variant="outline" size="sm" onClick={fetchRates}
                                    disabled={loadingRates || savingRates || currencyPairs.length === 0}>
                                    {loadingRates
                                        ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                        : <RefreshCw className="h-4 w-4 mr-1.5" />}
                                    Obtener actuales
                                </Button>
                                <Button size="sm" onClick={handleSaveAllRates}
                                    disabled={savingRates || loadingRates || currencyPairs.length === 0}>
                                    {savingRates
                                        ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                        : <Save className="h-4 w-4 mr-1.5" />}
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {currencyPairs.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <p className="text-sm">Activá más de una moneda para configurar tipos de cambio.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-1.5">
                                {currencyPairs.map(([from, to]) => {
                                    const key = `${from}_${to}`;
                                    const val = rateValues[key];
                                    const fromInfo = CURRENCY_INFO[from] || { flag: "💱" };
                                    const toInfo = CURRENCY_INFO[to] || { flag: "💱" };
                                    const savedEntry = exchangeRates.find((r) => r.from_currency === from && r.to_currency === to);
                                    const lastUpdated = savedEntry?.updated_at;
                                    return (
                                        <div key={key} className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-1 shrink-0">
                                                <span className="text-sm">{fromInfo.flag}</span>
                                                <span className="font-mono font-bold text-xs text-muted-foreground">{from}</span>
                                                <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                                                <span className="text-sm">{toInfo.flag}</span>
                                                <span className="font-mono font-bold text-xs text-muted-foreground">{to}</span>
                                            </div>
                                            <Input
                                                type="number" step="0.000001" placeholder="—"
                                                value={val?.rate || ""}
                                                onChange={(e) => setRateValues((p) => ({ ...p, [key]: { ...(p[key] || {}), rate: e.target.value } }))}
                                                className="flex-1 h-8 text-sm font-mono min-w-0"
                                            />
                                            {lastUpdated && (
                                                <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap shrink-0 hidden sm:block">
                                                    {lastUpdated}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Account initial balances — full width */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">Saldos iniciales de cuentas</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                El saldo actual se calcula sumando las transacciones al saldo inicial.
                            </p>
                        </div>
                        <Button size="sm" onClick={handleSaveAllBalances} disabled={savingBalances} className="shrink-0">
                            {savingBalances
                                ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                : <Save className="h-4 w-4 mr-1.5" />}
                            Guardar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {accounts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No hay cuentas creadas.</p>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {accounts.map((acc) => {
                                const effective = computeEffective(acc);
                                const cur = acc.currency || "MXN";
                                return (
                                    <div key={acc.id} className="p-3 rounded-lg border bg-muted/10 space-y-3">
                                        <div>
                                            <p className="font-semibold text-sm truncate">{acc.name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{acc.type} · {cur}</p>
                                        </div>
                                        <div className="flex items-end gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-muted-foreground mb-1">Saldo inicial</p>
                                                <Input
                                                    type="number" step="0.01"
                                                    value={accountBalances[acc.id] ?? String(acc.balance || 0)}
                                                    onChange={(e) => setAccountBalances((p) => ({ ...p, [acc.id]: e.target.value }))}
                                                    className="h-8 text-sm w-full"
                                                />
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] text-muted-foreground mb-1">Saldo actual</p>
                                                <p className={cn("text-sm font-semibold", effective >= 0 ? "text-primary" : "text-destructive")}>
                                                    {effective.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {cur}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
