export const CURRENCIES = ["MXN", "USD", "EUR", "ARS"];

export function formatCurrency(amount, currency = "MXN") {
    const locales = { MXN: "es-MX", USD: "en-US", EUR: "es-ES", ARS: "es-AR" };
    const loc = locales[currency] || "es-MX";
    return new Intl.NumberFormat(loc, {
        style: "currency",
        currency: currency || "MXN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount || 0);
}

export function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthLabel(yyyymm) {
    const [y, m] = yyyymm.split("-");
    return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("es-MX", { month: "short", year: "numeric" });
}

// Convert amount from one currency to another using rates map
// rates: { "USD_MXN": 17.5, "EUR_MXN": 19.2, ... }
export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amount || 0;
    if (!rates) return amount || 0;
    const key = `${fromCurrency}_${toCurrency}`;
    const reverseKey = `${toCurrency}_${fromCurrency}`;
    if (rates[key]) return (amount || 0) * rates[key];
    if (rates[reverseKey]) return (amount || 0) / rates[reverseKey];
    // Try via MXN as bridge
    const toMXN = `${fromCurrency}_MXN`;
    const fromMXN = `MXN_${toCurrency}`;
    if (rates[toMXN] && rates[fromMXN]) return (amount || 0) * rates[toMXN] * rates[fromMXN];
    return amount || 0;
}

export function buildRatesMap(exchangeRates) {
    const map = {};
    (exchangeRates || []).forEach((r) => {
        map[`${r.from_currency}_${r.to_currency}`] = r.rate;
    });
    return map;
}

export const ACCOUNT_TYPES = {
    checking: "Cuenta corriente",
    savings: "Ahorro",
    credit_card: "Tarjeta de crédito",
    cash: "Efectivo",
    investment: "Inversión",
    other: "Otro",
};

export const INVESTMENT_TYPES = {
    stocks: "Acciones",
    bonds: "Bonos",
    crypto: "Criptomonedas",
    real_estate: "Bienes raíces",
    mutual_fund: "Fondo mutuo",
    etf: "ETF",
    cetes: "CETES",
    other: "Otro",
};

export const TRANSACTION_STATUS = {
    confirmed: { label: "Confirmado", color: "bg-primary/15 text-primary border-primary/30" },
    installment: { label: "Cuota", color: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
    projected: { label: "Proyectado", color: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
};

export const TODAY = new Date().toISOString().split("T")[0];