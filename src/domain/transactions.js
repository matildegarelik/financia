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
