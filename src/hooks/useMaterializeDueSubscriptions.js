import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { buildDueOccurrences, getDueSubscriptions } from "@/domain/subscriptions";
import { buildDebtPayload } from "@/domain/debts";
import { TODAY } from "@/lib/formatters";

// Genera las transacciones de las suscripciones activas vencidas (next_charge_date <= hoy)
// y avanza su próxima fecha de cobro. Se llama una sola vez por carga de página; cualquier
// pantalla que la invoque comparte el mismo resultado (misma queryKey de react-query).
// Cada transacción guarda el monto vigente al momento de materializarla, así que un cambio
// de precio posterior en la suscripción no modifica las transacciones ya creadas.
export function useMaterializeDueSubscriptions() {
    const queryClient = useQueryClient();
    const triggeredRef = useRef(false);

    const { data: subscriptions = [], isLoading } = useQuery({
        queryKey: ["subscriptions"],
        queryFn: () => base44.entities.Subscription.list("name"),
    });

    const materializeMut = useMutation({
        mutationFn: async (dueSubscriptions) => {
            for (const sub of dueSubscriptions) {
                const { dates, nextChargeDate } = buildDueOccurrences(sub, TODAY);
                for (const date of dates) {
                    const created = await base44.entities.Transaction.create({
                        type: "expense",
                        status: "confirmed",
                        amount: sub.amount,
                        currency: sub.currency || "ARS",
                        account_id: sub.account_id || null,
                        category_id: sub.debt_person_name ? null : (sub.category_id || null),
                        date,
                        description: sub.name,
                        subscription_id: sub.id,
                        // Si la suscripción es un pago a/para un tercero, no cuenta como gasto
                        // propio: mismo mecanismo que un préstamo puntual (ver domain/debts.js).
                        reporting_mode: sub.debt_person_name ? "neutral" : "normal",
                    });
                    if (sub.debt_person_name) {
                        await base44.entities.ThirdPartyDebt.create(buildDebtPayload(created, sub.debt_person_name));
                    }
                }
                await base44.entities.Subscription.update(sub.id, { next_charge_date: nextChargeDate });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["third_party_debts"] });
        },
    });

    useEffect(() => {
        if (triggeredRef.current) return;
        const due = getDueSubscriptions(subscriptions, TODAY);
        if (due.length > 0) {
            triggeredRef.current = true;
            materializeMut.mutate(due);
        }
    }, [subscriptions]);

    return { subscriptions, isLoading };
}
