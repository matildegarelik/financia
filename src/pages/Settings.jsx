import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import { RefreshCw, Save, AlertCircle, Loader2, Check, Plus, X, Star, Bitcoin } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/lib/currency-context";
import { navItems, loadFavPaths, saveFavPaths } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

// Pares se generan dinámicamente según monedas activas (ver abajo)

const CURRENCY_INFO = {
    MXN: { name: "Peso Mexicano", flag: "🇲🇽" },
    USD: { name: "Dólar Americano", flag: "🇺🇸" },
    EUR: { name: "Euro", flag: "🇪🇺" },
    ARS: { name: "Peso Argentino", flag: "🇦🇷" },
    COP: { name: "Peso Colombiano", flag: "🇨🇴" },
    CLP: { name: "Peso Chileno", flag: "🇨🇱" },
    PEN: { name: "Sol Peruano", flag: "🇵🇪" },
};

export default function Settings() {
    const queryClient = useQueryClient();
    const { activeCurrencies, setActiveCurrencies, allCurrencies, addCustomCurrency } = useCurrency();
    const { data: exchangeRates = [], isLoading } = useQuery({
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
    function computeEffectiveBalance(acc) {
        const initial = acc.balance || 0;
        return transactions
            .filter((tx) => tx.status !== "projected" && tx.date && tx.date <= today)
            .reduce((sum, tx) => {
                if (tx.account_id === acc.id) {
                    if (tx.type === "income") return sum + (tx.amount || 0);
                    if (tx.type === "expense") return sum - (tx.amount || 0);
                    if (tx.type === "transfer") return sum - (tx.amount || 0);
                }
                if (tx.to_account_id === acc.id && tx.type === "transfer") return sum + (tx.amount || 0);
                return sum;
            }, initial);
    }

    const [rateValues, setRateValues] = useState({});
    const [loadingRates, setLoadingRates] = useState(false);
    const [accountBalances, setAccountBalances] = useState({});

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

    const saveRateMut = useMutation({
        mutationFn: async ({ key, rate }) => {
            const [from, to] = key.split("_");
            const existing = exchangeRates.find((r) => r.from_currency === from && r.to_currency === to);
            if (existing) {
                return base44.entities.ExchangeRate.update(existing.id, { rate: parseFloat(rate), updated_at: new Date().toISOString().split("T")[0] });
            } else {
                return base44.entities.ExchangeRate.create({ from_currency: from, to_currency: to, rate: parseFloat(rate), updated_at: new Date().toISOString().split("T")[0] });
            }
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["exchangeRates"] }); toast.success("Tasa guardada"); },
    });

    const saveBalanceMut = useMutation({
        mutationFn: ({ id, balance }) => base44.entities.Account.update(id, { balance: parseFloat(balance) || 0 }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["accounts"] }); toast.success("Saldo actualizado"); },
    });

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
            toast.success("Tasas obtenidas. Guardá los cambios.");
        } catch {
            toast.error("No se pudieron obtener las tasas automáticamente");
        }
        setLoadingRates(false);
    };

    const [showAddCurrency, setShowAddCurrency] = useState(false);
    const [customCurrencyInput, setCustomCurrencyInput] = useState("");
    const [favPaths, setFavPathsState] = useState(loadFavPaths);

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
        if (!activeCurrencies.includes(cur)) {
            setActiveCurrencies([...activeCurrencies, cur]);
        }
        setShowAddCurrency(false);
        setCustomCurrencyInput("");
    };

    const addCustomCurrencyAndActivate = () => {
        const code = customCurrencyInput.trim().toUpperCase();
        if (code.length < 2 || code.length > 10 || !/^[A-Z0-9]+$/.test(code)) {
            toast.error("Código inválido. Usá letras y números, entre 2 y 10 caracteres.");
            return;
        }
        if (activeCurrencies.includes(code)) {
            toast.error("Esa moneda ya está activa");
            return;
        }
        addCustomCurrency(code);
        setActiveCurrencies([...activeCurrencies, code]);
        setShowAddCurrency(false);
        setCustomCurrencyInput("");
        toast.success(`${code} agregada`);
    };

    // Generar pares dinámicamente con las monedas activas
    const currencyPairs = [];
    for (let i = 0; i < activeCurrencies.length; i++) {
        for (let j = i + 1; j < activeCurrencies.length; j++) {
            currencyPairs.push([activeCurrencies[i], activeCurrencies[j]]);
            currencyPairs.push([activeCurrencies[j], activeCurrencies[i]]);
        }
    }

    const inactiveCurrencies = allCurrencies.filter((c) => !activeCurrencies.includes(c));

    return (
        <div className="space-y-6 max-w-3xl">
            <PageHeader title="Configuración" description="Monedas, tipos de cambio y saldos" />

            {/* Favoritos barra móvil */}
            <Card className="lg:hidden">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Star className="h-4 w-4 text-chart-3" />
                        Favoritos barra móvil
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Elegí hasta 5 secciones para la barra de navegación inferior.</p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                        {navItems.map((item) => {
                            const isFav = favPaths.includes(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => toggleFav(item.path)}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-sm",
                                        isFav
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border text-muted-foreground hover:border-primary/40"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                                    {isFav && <Star className="h-3 w-3 fill-primary text-primary" />}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">{favPaths.length}/5 seleccionados</p>
                </CardContent>
            </Card>

            {/* Active currencies */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Monedas activas</CardTitle>
                    <p className="text-sm text-muted-foreground">Solo estas aparecen en formularios y selectores.</p>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {activeCurrencies.map((cur) => {
                            const info = CURRENCY_INFO[cur] || { name: cur, flag: "💱" };
                            return (
                                <div key={cur} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/5">
                                    <span>{info.flag}</span>
                                    <span className="font-mono font-semibold text-sm">{cur}</span>
                                    <button onClick={() => removeCurrency(cur)} className="ml-1 text-muted-foreground hover:text-destructive transition-colors">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            );
                        })}

                        {/* Botón agregar */}
                        {!showAddCurrency ? (
                            <button
                                onClick={() => setShowAddCurrency(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-all"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Agregar
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3 w-full mt-1">
                                {inactiveCurrencies.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {inactiveCurrencies.map((cur) => {
                                            const info = CURRENCY_INFO[cur] || { name: cur, flag: "💱" };
                                            return (
                                                <button
                                                    key={cur}
                                                    onClick={() => addCurrency(cur)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-border hover:border-primary bg-muted/30 hover:bg-primary/5 transition-all"
                                                >
                                                    <span>{info.flag}</span>
                                                    <span className="font-mono font-semibold text-sm">{cur}</span>
                                                    <span className="text-xs text-muted-foreground">{info.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Bitcoin className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <Input
                                        placeholder="Código custom (ej: USDT, BTC, ETH)"
                                        value={customCurrencyInput}
                                        onChange={(e) => setCustomCurrencyInput(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => e.key === "Enter" && addCustomCurrencyAndActivate()}
                                        maxLength={10}
                                        className="h-8 text-sm font-mono w-56"
                                    />
                                    <Button size="sm" className="h-8 px-3" onClick={addCustomCurrencyAndActivate} disabled={!customCurrencyInput.trim()}>
                                        <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                    <button onClick={() => { setShowAddCurrency(false); setCustomCurrencyInput(""); }} className="text-xs text-muted-foreground hover:text-foreground px-2">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Exchange Rates */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Tipos de cambio</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Cuánto equivale 1 unidad de la moneda origen. Las tasas se obtienen automáticamente de exchangerate-api.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchRates} disabled={loadingRates || currencyPairs.length === 0}>
                            {loadingRates ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                            Obtener actuales
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {currencyPairs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Activá más de una moneda para configurar tasas.</p>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                            {currencyPairs.map(([from, to]) => {
                                const key = `${from}_${to}`;
                                const val = rateValues[key];
                                const fromInfo = CURRENCY_INFO[from] || { flag: "💱" };
                                const toInfo = CURRENCY_INFO[to] || { flag: "💱" };
                                return (
                                    <div key={key} className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 shrink-0 w-28">
                                            <span className="text-base">{fromInfo.flag}</span>
                                            <span className="font-mono font-semibold text-xs">{from}</span>
                                            <span className="text-muted-foreground text-xs">→</span>
                                            <span className="text-base">{toInfo.flag}</span>
                                            <span className="font-mono font-semibold text-xs">{to}</span>
                                        </div>
                                        <Input
                                            type="number" step="0.000001" placeholder="Tasa"
                                            value={val?.rate || ""}
                                            onChange={(e) => setRateValues((p) => ({ ...p, [key]: { ...(p[key] || {}), rate: e.target.value } }))}
                                            className="flex-1 h-8 text-sm"
                                        />
                                        <Button size="sm" className="h-8 px-3 shrink-0" variant="outline"
                                            onClick={() => saveRateMut.mutate({ key, rate: val?.rate || "0" })}
                                            disabled={!val?.rate}>
                                            <Save className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Account initial balances */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Saldos iniciales de cuentas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">El saldo inicial es el punto de partida. El saldo actual se calcula sumando las transacciones registradas.</p>
                    {accounts.map((acc) => {
                        const effective = computeEffectiveBalance(acc);
                        return (
                            <div key={acc.id} className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{acc.name}</p>
                                    <p className="text-xs text-muted-foreground">{acc.type} · {acc.currency || "MXN"}</p>
                                    <p className="text-xs text-primary font-medium">Saldo actual: {effective.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {acc.currency || "MXN"}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <p className="text-[10px] text-muted-foreground">Saldo inicial</p>
                                    <div className="flex items-center gap-1.5">
                                        <Input
                                            type="number" step="0.01"
                                            value={accountBalances[acc.id] ?? String(acc.balance || 0)}
                                            onChange={(e) => setAccountBalances((p) => ({ ...p, [acc.id]: e.target.value }))}
                                            className="w-32 h-8 text-sm"
                                        />
                                        <Button size="sm" className="h-8 px-3" variant="outline"
                                            onClick={() => saveBalanceMut.mutate({ id: acc.id, balance: accountBalances[acc.id] })}>
                                            <Save className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}