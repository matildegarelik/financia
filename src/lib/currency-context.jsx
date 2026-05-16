import React, { createContext, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { buildRatesMap, convertCurrency, CURRENCIES } from "./formatters";

const ALL_CURRENCIES = ["MXN", "USD", "EUR", "ARS", "COP", "CLP", "PEN"];

const CurrencyContext = createContext({
    rates: {},
    displayCurrency: "MXN",
    setDisplayCurrency: () => { },
    convert: (amount, from, to) => amount,
    exchangeRates: [],
    activeCurrencies: ["MXN", "USD"],
    setActiveCurrencies: () => { },
    allCurrencies: ALL_CURRENCIES,
});

function loadActiveCurrencies() {
    try {
        const saved = localStorage.getItem("activeCurrencies");
        if (saved) return JSON.parse(saved);
    } catch { }
    return ["MXN", "USD", "EUR", "ARS"];
}

export function CurrencyProvider({ children }) {
    const [displayCurrency, setDisplayCurrency] = useState("MXN");
    const [activeCurrencies, setActiveCurrenciesState] = useState(loadActiveCurrencies);

    const setActiveCurrencies = (currencies) => {
        setActiveCurrenciesState(currencies);
        localStorage.setItem("activeCurrencies", JSON.stringify(currencies));
        // If current display currency is no longer active, switch to first active
        if (!currencies.includes(displayCurrency) && currencies.length > 0) {
            setDisplayCurrency(currencies[0]);
        }
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
        <CurrencyContext.Provider value={{ rates, displayCurrency, setDisplayCurrency, convert, exchangeRates, CURRENCIES, activeCurrencies, setActiveCurrencies, allCurrencies: ALL_CURRENCIES }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export { ALL_CURRENCIES };

export function useCurrency() {
    return useContext(CurrencyContext);
}