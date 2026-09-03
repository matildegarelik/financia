import { TODAY, getTransferDestinationAmount } from "@/lib/formatters";

export function isEffectiveTransaction(tx, untilDate = TODAY) {
    return tx.status !== "projected" && tx.date && (!untilDate || tx.date <= untilDate);
}

export function computeAccountBalance(account, transactions, { untilDate = TODAY } = {}) {
    return (transactions || [])
        .filter((tx) => isEffectiveTransaction(tx, untilDate))
        .reduce((sum, tx) => {
            if (tx.account_id === account.id) {
                if (tx.type === "income") return sum + (Number(tx.amount) || 0);
                if (tx.type === "expense") return sum - (Number(tx.amount) || 0);
                if (tx.type === "transfer") return sum - (Number(tx.amount) || 0);
            }

            if (tx.to_account_id === account.id && tx.type === "transfer") {
                return sum + getTransferDestinationAmount(tx, account.currency);
            }

            return sum;
        }, Number(account.balance) || 0);
}

/**
 * Calcula el patrimonio total de forma unificada.
 *
 * - liquidBalance: saldo efectivo de todas las cuentas que NO son tipo 'investment'
 * - investedTotal: current_value (o amount_invested si no hay) de todas las inversiones activas,
 *                  más el saldo efectivo de cuentas tipo 'investment' sin inversiones vinculadas
 * - totalSavings:  liquidBalance + investedTotal
 *
 * Nota: las inversiones vinculadas a cuentas no-investment (ej. Binance type=other)
 * aparecen en AMBOS lados; es responsabilidad del usuario tipificar correctamente las cuentas.
 *
 * @param {Array} accounts
 * @param {Array} investments
 * @param {Array} transactions
 * @param {Function} convert  (amount, currency) => number en moneda de display
 * @returns {{ liquidBalance: number, investedTotal: number, totalSavings: number }}
 */
export function computeTotalSavings(accounts, investments, transactions, convert = (a) => a) {
    const activeInvestments = (investments || []).filter((i) => !i.status || i.status === "activa");

    // IDs de cuentas tipo 'investment' que tienen al menos una inversión activa vinculada
    const investmentAccountsWithRows = new Set(
        activeInvestments.map((i) => i.account_id).filter(Boolean)
            .filter((id) => (accounts || []).find((a) => a.id === id)?.type === "investment")
    );

    // Líquido: todas las cuentas que no son tipo 'investment'
    // Las cuentas investment con registros vinculados quedan representadas por investedTotal
    const liquidBalance = (accounts || []).reduce((sum, acc) => {
        if (acc.type === "investment" && investmentAccountsWithRows.has(acc.id)) return sum;
        return sum + convert(computeAccountBalance(acc, transactions), acc.currency || "ARS");
    }, 0);

    // Invertido: current_value de todas las inversiones activas
    const investedFromRows = activeInvestments.reduce(
        (sum, i) => sum + convert(i.current_value || i.amount_invested || 0, i.currency || "ARS"),
        0
    );

    // Cuentas tipo 'investment' sin inversiones vinculadas → se suman a invertido
    const unlinkedInvestmentAccounts = (accounts || [])
        .filter((acc) => acc.type === "investment" && !investmentAccountsWithRows.has(acc.id))
        .reduce((sum, acc) => sum + convert(computeAccountBalance(acc, transactions), acc.currency || "ARS"), 0);

    const investedTotal = investedFromRows + unlinkedInvestmentAccounts;

    return { liquidBalance, investedTotal, totalSavings: liquidBalance + investedTotal };
}

export function getRelatedInstallments(transaction, transactions) {
    if (!transaction) return [];

    if (transaction.installment_group_id) {
        return (transactions || []).filter((tx) =>
            tx.id !== transaction.id &&
            tx.installment_group_id === transaction.installment_group_id
        );
    }

    return (transactions || []).filter((tx) =>
        tx.id !== transaction.id &&
        tx.is_recurring &&
        tx.type === transaction.type &&
        tx.recurring_frequency === transaction.recurring_frequency &&
        tx.description === transaction.description &&
        tx.account_id === transaction.account_id
    );
}
