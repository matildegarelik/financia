import React, { createContext, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { buildRatesMap, convertCurrency, CURRENCIES } from "./formatters";

const ALL_CURRENCIES = ["ARS", "USD", "EUR", "MXN", "COP", "CLP", "PEN"];

const CurrencyContext = createContext({
    rates: {},
    displayCurrency: "ARS",
    setDisplayCurrency: () => { },
    convert: (amount, from, to) => amount,
    exchangeRates: [],
    activeCurrencies: ["ARS", "USD"],
    setActiveCurrencies: () => { },
    allCurrencies: ALL_CURRENCIES,
    addCustomCurrency: () => { },
});

function loadActiveCurrencies() {
    try {
        const saved = localStorage.getItem("activeCurrencies");
        if (saved) return JSON.parse(saved);
    } catch { }
    return ["ARS", "USD", "EUR", "MXN"];
}

function loadDisplayCurrency(activeCurrencies) {
    try {
        const saved = localStorage.getItem("displayCurrency");
        if (saved && activeCurrencies.includes(saved)) return saved;
    } catch { }
    return activeCurrencies[0] || "ARS";
}

function loadCustomCurrencies() {
    try {
        const saved = localStorage.getItem("customCurrencies");
        if (saved) return JSON.parse(saved);
    } catch { }
    return [];
}

export function CurrencyProvider({ children }) {
    const [activeCurrencies, setActiveCurrenciesState] = useState(loadActiveCurrencies);
    const [displayCurrency, setDisplayCurrencyState] = useState(() => loadDisplayCurrency(loadActiveCurrencies()));

    const setDisplayCurrency = (currency) => {
        setDisplayCurrencyState(currency);
        localStorage.setItem("displayCurrency", currency);
    };
    const [customCurrencies, setCustomCurrenciesState] = useState(loadCustomCurrencies);

    const allCurrencies = useMemo(() => {
        const extra = customCurrencies.filter((c) => !ALL_CURRENCIES.includes(c));
        return [...ALL_CURRENCIES, ...extra];
    }, [customCurrencies]);

    const setActiveCurrencies = (currencies) => {
        setActiveCurrenciesState(currencies);
        localStorage.setItem("activeCurrencies", JSON.stringify(currencies));
        if (!currencies.includes(displayCurrency) && currencies.length > 0) {
            setDisplayCurrencyState(currencies[0]);
            localStorage.setItem("displayCurrency", currencies[0]);
        }
    };

    const addCustomCurrency = (code) => {
        const upper = code.toUpperCase();
        if (allCurrencies.includes(upper)) return;
        const next = [...customCurrencies, upper];
        setCustomCurrenciesState(next);
        localStorage.setItem("customCurrencies", JSON.stringify(next));
    };

    const { data: exchangeRates = [] } = useQuery({
        queryKey: ["exchangeRates"],
        queryFn: () => base44.entities.ExchangeRate.list(),
        staleTime: 5 * 60 * 1000,
    });

    const rates = useMemo(() => buildRatesMap(exchangeRates), [exchangeRates]);

    const convert = (amount, fromCurrency, toCurrency) => {
        const target = toCurrency || displayCurrency;
        return convertCurrency(amount, fromCurrency, target, rates);
    };

    return (
        <CurrencyContext.Provider value={{ rates, displayCurrency, setDisplayCurrency, convert, exchangeRates, CURRENCIES, activeCurrencies, setActiveCurrencies, allCurrencies, addCustomCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export { ALL_CURRENCIES };

export function useCurrency() {
    return useContext(CurrencyContext);
}