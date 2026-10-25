import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, HandCoins, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/shared/PageHeader";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { formatCurrencyCode, TODAY } from "@/lib/formatters";
import { getDebtPendingAmount, getDebtSettledAmount, getDebtStatus, getNetBalanceByPerson } from "@/domain/debts";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_LABEL = {
    pendiente: "Pendiente",
    parcial: "Parcial",
    saldada: "Saldada",
};

// Si el préstamo/pago original se hizo con tarjeta de crédito, la devolución debería
// ir por defecto a la cuenta desde donde se paga esa tarjeta (no a la tarjeta en sí),
// porque es de ahí de donde realmente sale la plata.
function getOriginPaymentAccountId(debt, transactions, accounts) {
    const originTx = transactions.find((t) => t.id === debt.origin_transaction_id);
    const originAccount = accounts.find((a) => a.id === originTx?.account_id);
    if (!originAccount) return null;
    if (originAccount.type === "credit_card") return originAccount.default_payment_account_id || originAccount.id;
    return originAccount.id;
}

export default function Terceros() {
    const queryClient = useQueryClient();
    const { displayCurrency, convert } = useCurrency();
    const [expandedPerson, setExpandedPerson] = useState(null);
    const [settling, setSettling] = useState(null);

    const { data: debts = [], isLoading } = useQuery({
        queryKey: ["third_party_debts"],
        queryFn: () => base44.entities.ThirdPartyDebt.list("-created_at"),
    });
    const { data: settlements = [] } = useQuery({
        queryKey: ["debt_settlements"],
        queryFn: () => base44.entities.DebtSettlement.list(),
    });
    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
    const { data: transactions = [] } = useQuery({ queryKey: ["transactions"], queryFn: () => base44.entities.Transaction.list() });

    const deleteMut = useMutation({
        mutationFn: (id) => base44.entities.ThirdPartyDebt.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["third_party_debts"] });
            toast.success("Eliminado");
        },
    });

    const settleMut = useMutation({
        mutationFn: async ({ debt, amount, accountId, date, description }) => {
            const account = accounts.find((a) => a.id === accountId);
            const created = await base44.entities.Transaction.create({
                type: debt.direction === "me_deben" ? "income" : "expense",
                status: "confirmed",
                amount,
                currency: debt.currency || "ARS",
                account_id: accountId,
                date,
                description,
                reporting_mode: "neutral",
            });
            await base44.entities.DebtSettlement.create({
                debt_id: debt.id,
                transaction_id: created.id,
                amount,
                currency: debt.currency || "ARS",
                date,
            });
            return account;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["third_party_debts"] });
            queryClient.invalidateQueries({ queryKey: ["debt_settlements"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            setSettling(null);
            toast.success("Devolución registrada");
        },
    });

    const byPerson = useMemo(() => {
        const map = new Map();
        debts.forEach((debt) => {
            if (!map.has(debt.person_name)) map.set(debt.person_name, []);
            map.get(debt.person_name).push(debt);
        });
        return map;
    }, [debts]);

    const netBalances = useMemo(() => getNetBalanceByPerson(debts, settlements, convert), [debts, settlements, convert]);

    const people = [...byPerson.keys()].sort((a, b) => {
        const diff = Math.abs(netBalances.get(b) || 0) - Math.abs(netBalances.get(a) || 0);
        return diff !== 0 ? diff : a.localeCompare(b);
    });

    const totalOwedToMe = [...netBalances.values()].filter((v) => v > 0).reduce((s, v) => s + v, 0);
    const totalIOwe = [...netBalances.values()].filter((v) => v < 0).reduce((s, v) => s + Math.abs(v), 0);

    return (
        <div className="space-y-5">
            <PageHeader
                title="Terceros"
                description="Préstamos y pagos hechos por o para otras personas"
                action={<CurrencySelector className="w-20 sm:w-24 h-8 text-xs sm:text-sm" />}
            />

            <div className="grid grid-cols-2 gap-3">
                <Card><CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Te deben</p>
                    <p className="text-xl font-bold text-primary">{formatCurrencyCode(totalOwedToMe, displayCurrency)}</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Les debés</p>
                    <p className="text-xl font-bold text-destructive">{formatCurrencyCode(totalIOwe, displayCurrency)}</p>
                </CardContent></Card>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : people.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">
                    <HandCoins className="h-7 w-7 mx-auto mb-2 opacity-30" />
                    <p>No hay préstamos ni pagos a terceros registrados.</p>
                    <p className="mt-1 text-xs">Marcá "Es un préstamo o pago a/de un tercero" al crear una transacción de ingreso o gasto.</p>
                </CardContent></Card>
            ) : (
                <div className="space-y-3">
                    {people.map((person) => {
                        const personDebts = byPerson.get(person);
                        const net = netBalances.get(person) || 0;
                        const isExpanded = expandedPerson === person;
                        return (
                            <Card key={person} className="overflow-hidden">
                                <button type="button" className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/20"
                                    onClick={() => setExpandedPerson(isExpanded ? null : person)}>
                                    <span className="font-medium truncate">{person}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={cn("text-sm font-semibold", net > 0 ? "text-primary" : net < 0 ? "text-destructive" : "text-muted-foreground")}>
                                            {net === 0 ? "Saldado" : `${net > 0 ? "Te debe" : "Le debés"} ${formatCurrencyCode(Math.abs(net), displayCurrency)}`}
                                        </span>
                                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="divide-y divide-border border-t border-border/60">
                                        {personDebts.map((debt) => {
                                            const pending = getDebtPendingAmount(debt, settlements);
                                            const settled = getDebtSettledAmount(debt, settlements);
                                            const status = getDebtStatus(debt, settlements);
                                            return (
                                                <div key={debt.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {debt.direction === "me_deben" ? "Le prestaste / pagaste por ella" : "Te prestó / pagó por vos"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatCurrencyCode(debt.amount, debt.currency || "ARS")} · {STATUS_LABEL[status]}
                                                            {settled > 0 && status !== "saldada" && ` (devuelto ${formatCurrencyCode(settled, debt.currency || "ARS")})`}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {pending > 0 && (
                                                            <Button size="sm" variant="outline" onClick={() => setSettling(debt)}>
                                                                Registrar devolución
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => deleteMut.mutate(debt.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {settling && (
                <SettleDialog
                    debt={settling}
                    pending={getDebtPendingAmount(settling, settlements)}
                    accounts={accounts}
                    defaultAccountId={getOriginPaymentAccountId(settling, transactions, accounts)}
                    onClose={() => setSettling(null)}
                    onSubmit={(payload) => settleMut.mutate(payload)}
                />
            )}
        </div>
    );
}

function SettleDialog({ debt, pending, accounts, defaultAccountId, onClose, onSubmit }) {
    const [amount, setAmount] = useState(String(pending));
    const [accountId, setAccountId] = useState(
        (defaultAccountId && accounts.find((a) => a.id === defaultAccountId)?.id)
        || accounts.find((a) => a.currency === (debt.currency || "ARS") && a.is_visible !== false)?.id
        || ""
    );
    const [date, setDate] = useState(TODAY);
    const sortedAccounts = accounts.filter((a) => a.is_visible !== false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const amt = parseFloat(amount);
        if (!amt || amt <= 0 || !accountId) return;
        onSubmit({
            debt,
            amount: amt,
            accountId,
            date,
            description: debt.direction === "me_deben" ? `Devolución de ${debt.person_name}` : `Pago a ${debt.person_name}`,
        });
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Registrar devolución — {debt.person_name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <Label>Monto ({debt.currency || "ARS"})</Label>
                        <Input type="number" step="0.01" min="0" max={pending} value={amount}
                            onChange={(e) => setAmount(e.target.value)} required />
                        <p className="text-xs text-muted-foreground mt-1">Pendiente: {formatCurrencyCode(pending, debt.currency || "ARS")}</p>
                    </div>
                    <div>
                        <Label>{debt.direction === "me_deben" ? "Cuenta donde recibís el dinero" : "Cuenta desde donde pagás"}</Label>
                        <Select value={accountId} onValueChange={setAccountId}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar cuenta" /></SelectTrigger>
                            <SelectContent>
                                {sortedAccounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "ARS"})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Fecha</Label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Registrar</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
