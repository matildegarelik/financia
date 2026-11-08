import { addDays, addMonths, addWeeks, format, parseISO } from "date-fns";

export const FREQUENCY_LABEL = {
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
    yearly: "Anual",
};

export function getNextChargeDate(dateStr, frequency) {
    const d = parseISO(dateStr);
    if (frequency === "weekly") return format(addWeeks(d, 1), "yyyy-MM-dd");
    if (frequency === "biweekly") return format(addDays(d, 14), "yyyy-MM-dd");
    if (frequency === "yearly") return format(addMonths(d, 12), "yyyy-MM-dd");
    return format(addMonths(d, 1), "yyyy-MM-dd");
}

// Suscripciones activas cuya próxima fecha de cobro ya llegó (<= hoy).
export function getDueSubscriptions(subscriptions = [], today) {
    return subscriptions.filter((s) => s.status === "active" && s.next_charge_date && s.next_charge_date <= today);
}

// Para una suscripción vencida, devuelve las fechas de cobro pendientes (por si pasaron
// varios períodos sin abrir la app) y la próxima fecha de cobro futura resultante.
export function buildDueOccurrences(subscription, today) {
    const dates = [];
    let cursor = subscription.next_charge_date;
    let guard = 0;
    while (cursor <= today && guard < 60) {
        dates.push(cursor);
        cursor = getNextChargeDate(cursor, subscription.frequency);
        guard += 1;
    }
    return { dates, nextChargeDate: cursor };
}

// Fechas de cobro futuras (todavía NO materializadas) de una suscripción dentro del
// rango [from, to] inclusive. Solo incluye fechas posteriores a `today`: las que ya
// vencieron (<= today) las convierte en transacción real useMaterializeDueSubscriptions,
// así que proyectarlas acá duplicaría el monto. Pensado para mostrar en el resumen de
// tarjeta lo que se va a cobrar antes del cierre, sin crear transacciones.
export function getSubscriptionOccurrencesInRange(subscription, from, to, today) {
    const dates = [];
    let cursor = subscription.next_charge_date;
    let guard = 0;
    while (cursor && cursor <= to && guard < 120) {
        if (cursor >= from && cursor > today) dates.push(cursor);
        cursor = getNextChargeDate(cursor, subscription.frequency);
        guard += 1;
    }
    return dates;
}

// Convierte una monthly/weekly/etc amount a un equivalente mensual aproximado, para el total del header.
export function toMonthlyEquivalent(amount, frequency) {
    if (frequency === "weekly") return amount * (52 / 12);
    if (frequency === "biweekly") return amount * (26 / 12);
    if (frequency === "yearly") return amount / 12;
    return amount;
}
