export const TRANSFER_CALCULATION_MODES = {
    AMOUNTS_NEUTRAL: "amounts_neutral",
    RATE: "rate",
    LEGACY: "legacy",
};

export function calculateTransferExchangeSnapshot({
    amount,
    currency,
    toAmount,
    toCurrency,
    mode = TRANSFER_CALCULATION_MODES.AMOUNTS_NEUTRAL,
    referenceRate = null,
    date = null,
} = {}) {
    const sourceAmount = Number(amount) || 0;
    const destinationAmount = Number(toAmount) || 0;
    const isCrossCurrency = currency && toCurrency && currency !== toCurrency;

    if (!isCrossCurrency || sourceAmount <= 0 || destinationAmount <= 0) {
        return {
            transfer_calculation_mode: mode,
            exchange_rate: null,
            reference_rate: null,
            exchange_difference: 0,
            exchange_difference_currency: isCrossCurrency ? toCurrency : null,
            exchange_rate_date: isCrossCurrency ? date : null,
        };
    }

    const executionRate = destinationAmount / sourceAmount;
    const hasReferenceRate = Number(referenceRate) > 0;
    const difference = mode === TRANSFER_CALCULATION_MODES.RATE && hasReferenceRate
        ? destinationAmount - (sourceAmount * Number(referenceRate))
        : 0;

    return {
        transfer_calculation_mode: mode,
        exchange_rate: executionRate,
        reference_rate: hasReferenceRate ? Number(referenceRate) : null,
        exchange_difference: difference,
        exchange_difference_currency: toCurrency,
        exchange_rate_date: date || null,
    };
}
