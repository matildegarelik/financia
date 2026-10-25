export function getDebtSettlements(debt, settlements = []) {
    return settlements.filter((s) => s.debt_id === debt.id);
}

export function getDebtSettledAmount(debt, settlements = []) {
    return getDebtSettlements(debt, settlements).reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
}

export function getDebtPendingAmount(debt, settlements = []) {
    const pending = (Number(debt.amount) || 0) - getDebtSettledAmount(debt, settlements);
    return pending > 0.005 ? pending : 0;
}

export function getDebtStatus(debt, settlements = []) {
    const settled = getDebtSettledAmount(debt, settlements);
    if (settled <= 0.005) return "pendiente";
    if (settled >= (Number(debt.amount) || 0) - 0.005) return "saldada";
    return "parcial";
}

// Saldo neto por persona, convertido a una sola divisa.
// Positivo = la persona me debe a mí. Negativo = yo le debo a esa persona.
export function getNetBalanceByPerson(debts = [], settlements = [], convert = (amount) => amount) {
    const byPerson = new Map();
    debts.forEach((debt) => {
        const pending = getDebtPendingAmount(debt, settlements);
        if (pending <= 0) return;
        const converted = convert(pending, debt.currency || "ARS");
        const sign = debt.direction === "me_deben" ? 1 : -1;
        byPerson.set(debt.person_name, (byPerson.get(debt.person_name) || 0) + sign * converted);
    });
    return byPerson;
}

export function getPersonSuggestions(debts = []) {
    return [...new Set(debts.map((d) => d.person_name).filter(Boolean))].sort();
}

// Payload de third_party_debts a partir de la transacción que generó el préstamo/pago
// a un tercero. Una sola fuente de verdad para no repetir esto en cada lugar que crea
// una deuda (alta manual en Transacciones, cobro automático de una suscripción, etc.).
export function buildDebtPayload(transaction, personName) {
    return {
        person_name: personName,
        direction: transaction.type === "income" ? "debo" : "me_deben",
        amount: transaction.amount,
        currency: transaction.currency || "ARS",
        origin_transaction_id: transaction.id,
    };
}
