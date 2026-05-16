import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/lib/currency-context";

export default function CurrencySelector({ className }) {
    const { displayCurrency, setDisplayCurrency, activeCurrencies } = useCurrency();
    return (
        <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
            <SelectTrigger className={className || "w-24 h-8 text-sm"}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {activeCurrencies.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}