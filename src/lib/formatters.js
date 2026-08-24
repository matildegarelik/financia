export const CURRENCIES = ["ARS", "USD", "EUR"];

export function formatCurrencyCode(amount, currency = "ARS") {
    try {
        const locales = { USD: "en-US", EUR: "es-ES", ARS: "es-AR", COP: "es-CO", CLP: "es-CL", PEN: "es-PE" };
        const loc = locales[currency] || "en-US";
        return new Intl.NumberFormat(loc, {
            style: "currency",
            currency,
            currencyDisplay: "code",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    } catch {
        return `${(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 })} ${currency}`;
    }
}

export function formatCurrency(amount, currency = "ARS") {
    try {
        const locales = {USD: "en-US", EUR: "es-ES", ARS: "es-AR", COP: "es-CO", CLP: "es-CL", PEN: "es-PE" };
        const loc = locales[currency] || "en-US";
        return new Intl.NumberFormat(loc, {
            style: "currency",
            currency: currency || "ARS",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    } catch {
        return `${(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 })} ${currency}`;
    }
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
export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amount || 0;
    if (!rates) return amount || 0;
    const key = `${fromCurrency}_${toCurrency}`;
    const reverseKey = `${toCurrency}_${fromCurrency}`;
    if (rates[key]) return (amount || 0) * rates[key];
    if (rates[reverseKey]) return (amount || 0) / rates[reverseKey];
    // Try via ARS as bridge
    const toARS = `${fromCurrency}_ARS`;
    const fromARS = `ARS_${toCurrency}`;
    if (rates[toARS] && rates[fromARS]) return (amount || 0) * rates[toARS] * rates[fromARS];
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
    debit_card: "Tarjeta de débito",
    cash: "Efectivo",
    investment: "Inversión",
    crypto: "Cuenta cripto",
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

export function getReportingMode(tx) {
    if (!tx) return "normal";
    if (tx.reporting_mode) return tx.reporting_mode;
    if (tx.is_investment_transfer) return "investment";
    if (tx.is_credit_card_payment) return "credit_card_payment";
    return "normal";
}

export const affectsReports = (tx) => getReportingMode(tx) === "normal" || getReportingMode(tx) === "exchange_difference";

export const isRegularIncome = (tx) => tx.type === "income" && affectsReports(tx);

export const isRegularExpense = (tx) => tx.type === "expense" && affectsReports(tx);

export const isCreditCardAccount = (account) => account?.type === "credit_card";

export const isCreditCardPayment = (tx) => Boolean(tx?.is_credit_card_payment);

function clampDay(year, monthIndex, day) {
    const last = new Date(year, monthIndex + 1, 0).getDate();
    return Math.min(Math.max(parseInt(day) || 1, 1), last);
}

function isoFromParts(year, monthIndex, day) {
    const d = new Date(year, monthIndex, clampDay(year, monthIndex, day));
    return d.toISOString().split("T")[0];
}

export function addDaysISO(dateStr, days) {
    const d = new Date(`${dateStr}T12:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
}

export function addMonthsISO(dateStr, months) {
    const d = new Date(`${dateStr}T12:00:00`);
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return d.toISOString().split("T")[0];
}

export function getCreditCardStatementRange(account, referenceDate = TODAY) {
    const closeDay = parseInt(account?.statement_close_day) || 25;
    const dueDay = parseInt(account?.statement_due_day) || Math.min(closeDay + 10, 28);
    const ref = new Date(`${referenceDate}T12:00:00`);
    const refDay = ref.getDate();
    const closeMonthOffset = refDay <= closeDay ? 0 : 1;
    const closeBase = new Date(ref.getFullYear(), ref.getMonth() + closeMonthOffset, 1);
    const closeDate = isoFromParts(closeBase.getFullYear(), closeBase.getMonth(), closeDay);
    const prevCloseBase = new Date(closeBase.getFullYear(), closeBase.getMonth() - 1, 1);
    const prevCloseDate = isoFromParts(prevCloseBase.getFullYear(), prevCloseBase.getMonth(), closeDay);
    const periodStart = addDaysISO(prevCloseDate, 1);
    const dueBaseOffset = dueDay <= closeDay ? 1 : 0;
    const dueBase = new Date(closeBase.getFullYear(), closeBase.getMonth() + dueBaseOffset, 1);

    return {
        period_start: periodStart,
        period_end: closeDate,
        close_date: closeDate,
        due_date: isoFromParts(dueBase.getFullYear(), dueBase.getMonth(), dueDay),
    };
}

export function getPreviousCreditCardStatementRange(account, referenceDate = TODAY) {
    const current = getCreditCardStatementRange(account, referenceDate);
    return getCreditCardStatementRange(account, addDaysISO(current.period_start, -1));
}

export function transactionMatchesStatement(tx, statement) {
    const date = tx.date;
    return Boolean(
        tx.type === "expense" &&
        !isCreditCardPayment(tx) &&
        date &&
        date >= statement.period_start &&
        date <= statement.period_end &&
        tx.account_id === statement.account_id
    );
}

export function getTransferDestinationAmount(tx, destinationCurrency) {
    if (!tx || tx.type !== "transfer") return 0;
    if (tx.to_amount != null) return Number(tx.to_amount) || 0;
    const sourceCurrency = tx.currency || destinationCurrency;
    const targetCurrency = tx.to_currency || destinationCurrency || sourceCurrency;
    return sourceCurrency === targetCurrency ? (Number(tx.amount) || 0) : 0;
}

export function getTransferDifference(tx, convert = (amount) => amount) {
    if (!tx || tx.type !== "transfer") return 0;

    const sourceCurrency = tx.currency || "ARS";
    const destinationCurrency = tx.to_currency || sourceCurrency;
    const destinationAmount = getTransferDestinationAmount(tx, destinationCurrency);

    const sourceValue = convert(Number(tx.amount) || 0, sourceCurrency);
    const destinationValue = convert(destinationAmount, destinationCurrency);
    let difference = destinationValue - sourceValue;

    const gross = Number(tx.amount_gross);
    const net = Number(tx.amount);
    if (!Number.isNaN(gross) && gross > net) {
        difference -= convert(gross - net, sourceCurrency);
    }

    return difference;
}

export function sumRegularIncome(transactions, convert = (amount) => amount) {
    return (transactions || [])
        .filter(isRegularIncome)
        .reduce((sum, tx) => sum + convert(tx.amount || 0, tx.currency || "ARS"), 0);
}

export function sumRegularExpense(transactions, convert = (amount) => amount) {
    return (transactions || [])
        .filter(isRegularExpense)
        .reduce((sum, tx) => sum + convert(tx.amount || 0, tx.currency || "ARS"), 0);
}

export function sumTransferDifferences(transactions, convert = (amount) => amount) {
    return (transactions || [])
        .filter((tx) => tx.type === "transfer" && affectsReports(tx))
        .reduce((sum, tx) => sum + getTransferDifference(tx, convert), 0);
}
