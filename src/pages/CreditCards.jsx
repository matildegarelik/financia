import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, ChevronDown, CreditCard, Pencil, WalletCards } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import CurrencySelector from "@/components/shared/CurrencySelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TODAY, formatCurrencyCode, formatDate } from "@/lib/formatters";
import { computeAccountBalance } from "@/domain/transactions";
import { toast } from "sonner";
import {
    buildCreditCardStatement,
    buildStatementsByMonth,
    getRelevantStatementMonths,
    getStatementTotal,
    getStatementMonthKey,
    transactionMatchesStatement,
} from "@/domain/creditCards";

export default function CreditCards() {
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState(null);
    const [selectedCardId, setSelectedCardId] = useState("");

    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
    const { data: transactions = [] } = useQuery({ queryKey: ["transactions"], queryFn: () => base44.entities.Transaction.list("-date", 5000) });
    const { data: statements = [] } = useQuery({
        queryKey: ["credit_card_statements"],
        queryFn: () => base44.entities.CreditCardStatement.list("-period_end", 1000),
    });

    const cardAccounts = useMemo(
        () => accounts.filter((account) => account.type === "credit_card" && account.is_active !== false),
        [accounts]
    );
    const selectedCard = cardAccounts.find((card) => card.id === selectedCardId) || cardAccounts[0] || null;

    useEffect(() => {
        if (!selectedCardId && cardAccounts[0]?.id) setSelectedCardId(cardAccounts[0].id);
        else if (selectedCardId && cardAccounts.length > 0 && !cardAccounts.some((card) => card.id === selectedCardId)) {
            setSelectedCardId(cardAccounts[0].id);
        }
    }, [cardAccounts, selectedCardId]);

    const saveStatementMut = useMutation({
        mutationFn: async ({ statement, data }) => {
            const nextStatement = {
                ...statement,
                period_start: data.period_start,
                period_end: data.close_date,
                close_date: data.close_date,
                due_date: data.due_date,
            };
            const payload = {
                account_id: statement.account_id,
                period_start: data.period_start,
                period_end: data.close_date,
                close_date: data.close_date,
                due_date: data.due_date,
                total_amount: getStatementTotal(nextStatement, transactions),
                currency: statement.currency,
                status: statement.status || "open",
                payment_account_id: statement.payment_account_id || null,
                notes: data.notes || null,
            };

            if (statement.id) {
                return base44.entities.CreditCardStatement.update(statement.id, payload);
            }

            return base44.entities.CreditCardStatement.create(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["credit_card_statements"] });
            setEditing(null);
        },
    });

    const payStatementMut = useMutation({
        mutationFn: async ({ statement, paymentAccount }) => {
            if (!paymentAccount) throw new Error("Selecciona una cuenta de pago.");
            const payment = await base44.entities.Transaction.create({
                type: "transfer",
                status: "confirmed",
                date: statement.due_date || TODAY,
                amount: statement.total_amount,
                currency: paymentAccount.currency || statement.currency || "ARS",
                to_amount: (paymentAccount.currency || statement.currency || "ARS") === (statement.currency || "ARS") ? null : statement.total_amount,
                to_currency: (paymentAccount.currency || statement.currency || "ARS") === (statement.currency || "ARS") ? null : statement.currency || "ARS",
                account_id: paymentAccount.id,
                account_name: paymentAccount.name || "",
                to_account_id: statement.account_id,
                to_account_name: statement.card_name || "Tarjeta",
                description: `Pago tarjeta ${statement.card_name || ""}`.trim(),
                is_credit_card_payment: true,
                reporting_mode: "credit_card_payment",
            });

            const payload = {
                account_id: statement.account_id,
                period_start: statement.period_start,
                period_end: statement.period_end,
                close_date: statement.close_date,
                due_date: statement.due_date,
                total_amount: statement.total_amount,
                currency: statement.currency,
                status: "paid",
                payment_account_id: paymentAccount.id,
                payment_transaction_id: payment.id,
                notes: statement.notes || null,
            };

            if (statement.id) return base44.entities.CreditCardStatement.update(statement.id, payload);
            return base44.entities.CreditCardStatement.create(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["credit_card_statements"] });
            toast.success("Pago de tarjeta registrado");
        },
        onError: (error) => toast.error(error.message || "No se pudo registrar el pago"),
    });

    return (
        <div className="space-y-5">
            <PageHeader
                title="Tarjetas"
                description="Cierres, vencimientos y totales mensuales a pagar"
                action={<CurrencySelector />}
            />

            {cardAccounts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <WalletCards className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No hay tarjetas de credito configuradas.</p>
                        <p className="text-xs mt-1">Crea una cuenta tipo tarjeta de credito desde Cuentas.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 max-w-sm">
                        <Select value={selectedCard?.id || ""} onValueChange={setSelectedCardId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tarjeta" />
                            </SelectTrigger>
                            <SelectContent>
                                {cardAccounts.map((card) => (
                                    <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedCard && (
                        <CreditCardPanel
                            card={selectedCard}
                            transactions={transactions}
                            statements={statements}
                            accounts={accounts}
                            onEdit={(statement) => setEditing({ card: selectedCard, statement })}
                            onPay={(statement, paymentAccount) => payStatementMut.mutate({ statement, paymentAccount })}
                            paying={payStatementMut.isPending}
                        />
                    )}
                </div>
            )}

            {editing && (
                <StatementDatesDialog
                    card={editing.card}
                    statement={editing.statement}
                    saving={saveStatementMut.isPending}
                    onClose={() => setEditing(null)}
                    onSubmit={(data) => saveStatementMut.mutate({ statement: editing.statement, data })}
                />
            )}
        </div>
    );
}

function CreditCardPanel({ card, transactions, statements, accounts, onEdit, onPay, paying }) {
    const statementsByMonth = useMemo(
        () => buildStatementsByMonth(statements, card.id),
        [statements, card.id]
    );
    const months = useMemo(
        () => getRelevantStatementMonths(card, transactions, { pastMonths: 1, futureMonths: 3, today: TODAY }),
        [card, transactions]
    );
    const monthlyStatements = useMemo(
        () => months
            .map((monthKey) => buildCreditCardStatement(card, monthKey, transactions, statementsByMonth))
            .filter((statement) => statement.total_amount > 0 || statement.id || statement.due_date >= TODAY),
        [card, months, statementsByMonth, transactions]
    );

    const nextDueStatement = useMemo(
        () => monthlyStatements
            .filter((statement) => statement.due_date >= TODAY && statement.close_date < TODAY)
            .sort((a, b) => a.due_date.localeCompare(b.due_date))[0]
            || monthlyStatements
                .filter((statement) => statement.due_date >= TODAY && statement.total_amount > 0)
                .sort((a, b) => a.due_date.localeCompare(b.due_date))[0],
        [monthlyStatements]
    );
    const nextCloseStatement = useMemo(
        () => monthlyStatements
            .filter((statement) => statement.close_date >= TODAY)
            .sort((a, b) => a.close_date.localeCompare(b.close_date))[0],
        [monthlyStatements]
    );
    const visibleStatements = [nextDueStatement, nextCloseStatement]
        .filter(Boolean)
        .filter((statement, index, all) => all.findIndex((item) => getStatementMonthKey(item) === getStatementMonthKey(statement)) === index);
    const effective = computeAccountBalance(card, transactions);
    const debt = Math.max(0, -effective);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                            <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-base truncate">{card.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Cierre por defecto: penultimo jueves. Vence: primer lunes del mes siguiente.
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="font-mono">{card.currency || "ARS"}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Deuda actual</p>
                        <p className={cn("text-xl font-bold", debt > 0 ? "text-destructive" : "text-primary")}>
                            {formatCurrencyCode(debt, card.currency || "ARS")}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Tarjeta</p>
                        <p className="text-xl font-bold">
                            {card.name}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {visibleStatements.length === 0 ? (
                        <div className="rounded-lg border border-border/60 p-4 text-center text-sm text-muted-foreground">
                            No hay consumos ni vencimientos proximos.
                        </div>
                    ) : visibleStatements.map((statement) => (
                        <StatementMonthRow
                            key={`${statement.account_id}:${getStatementMonthKey(statement)}`}
                            label={statement === nextDueStatement ? "Proximo a vencer" : "Proximo a cerrar"}
                            statement={statement}
                            transactions={transactions}
                            card={card}
                            accounts={accounts}
                            onEdit={() => onEdit(statement)}
                            onPay={onPay}
                            paying={paying}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function StatementMonthRow({ label, statement, transactions, card, accounts, onEdit, onPay, paying }) {
    const [expanded, setExpanded] = useState(false);
    const monthKey = getStatementMonthKey(statement);
    const statementTransactions = useMemo(
        () => transactions
            .filter((tx) => transactionMatchesStatement(tx, statement))
            .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.created_at || "").localeCompare(b.created_at || "")),
        [transactions, statement]
    );
    const isPastDue = statement.total_amount > 0 && statement.due_date < TODAY;
    const hasCustomDates = Boolean(statement.id);
    const paymentAccount = accounts.find((account) => account.id === (statement.payment_account_id || card.default_payment_account_id));
    const paymentBalance = paymentAccount ? computeAccountBalance(paymentAccount, transactions) : null;
    const sameCurrency = paymentAccount && (paymentAccount.currency || "ARS") === (statement.currency || "ARS");
    const hasEnoughBalance = sameCurrency && paymentBalance >= statement.total_amount;
    const isPaid = statement.status === "paid";
    const enrichedStatement = { ...statement, card_name: card.name };

    return (
        <div className={cn("rounded-lg border p-3 space-y-3", isPastDue ? "border-destructive/40 bg-destructive/5" : "border-border/60")}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{label}</Badge>
                        <p className="text-sm font-semibold">{monthKey}</p>
                        {hasCustomDates && <Badge variant="secondary" className="text-xs">fechas guardadas</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Cierra {formatDate(statement.close_date)} · vence {formatDate(statement.due_date)}
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded((value) => !value)}>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Total a pagar al vencimiento</span>
                </div>
                <p className={cn("text-sm font-bold", statement.total_amount > 0 ? "text-destructive" : "text-muted-foreground")}>
                    {formatCurrencyCode(statement.total_amount, statement.currency || "ARS")}
                </p>
            </div>

            <div className="rounded-md border border-border/60 px-3 py-2 space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">Cuenta de pago</span>
                    <span className="font-medium text-right">
                        {paymentAccount ? `${paymentAccount.name} (${paymentAccount.currency || "ARS"})` : "Sin configurar"}
                    </span>
                </div>
                {paymentAccount && (
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-muted-foreground">Saldo disponible</span>
                        <span className={cn("font-medium", sameCurrency && !hasEnoughBalance ? "text-destructive" : "text-foreground")}>
                            {formatCurrencyCode(paymentBalance, paymentAccount.currency || "ARS")}
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between gap-2">
                    <Badge variant={isPaid ? "secondary" : hasEnoughBalance ? "outline" : "destructive"} className="text-xs">
                        {isPaid ? "Pagado" : !paymentAccount ? "Falta cuenta" : !sameCurrency ? "Revisar moneda" : hasEnoughBalance ? "Saldo suficiente" : "Saldo insuficiente"}
                    </Badge>
                    {!isPaid && statement.total_amount > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={!paymentAccount || !sameCurrency || paying}
                            onClick={() => onPay(enrichedStatement, paymentAccount)}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Registrar pago
                        </Button>
                    )}
                </div>
            </div>

            {expanded && statementTransactions.length > 0 && (
                <div className="space-y-1.5">
                    {statementTransactions.map((tx) => (
                        <div key={tx.id} className="grid grid-cols-[1fr_auto] gap-3 text-xs">
                            <div className="min-w-0 text-muted-foreground">
                                <span>{formatDate(tx.date)}</span>
                                <span> · </span>
                                <span className="text-foreground">{tx.description || "Consumo"}</span>
                                {tx.installment_current && tx.installment_total && (
                                    <span> · cuota {tx.installment_current}/{tx.installment_total}</span>
                                )}
                            </div>
                            <span className="font-medium">{formatCurrencyCode(tx.amount, tx.currency || statement.currency || "ARS")}</span>
                        </div>
                    ))}
                </div>
            )}
            {expanded && statementTransactions.length === 0 && (
                <p className="text-xs text-muted-foreground">No hay consumos dentro de este periodo.</p>
            )}
        </div>
    );
}

function StatementDatesDialog({ card, statement, saving, onClose, onSubmit }) {
    const [form, setForm] = useState({
        period_start: statement.period_start || "",
        close_date: statement.close_date || "",
        due_date: statement.due_date || "",
        notes: statement.notes || "",
    });
    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Fechas de {card.name}</DialogTitle>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit(form);
                    }}
                >
                    <div>
                        <Label>Inicio del periodo</Label>
                        <Input type="date" value={form.period_start} onChange={(event) => set("period_start", event.target.value)} required />
                    </div>
                    <div>
                        <Label>Cierre</Label>
                        <Input type="date" value={form.close_date} onChange={(event) => set("close_date", event.target.value)} required />
                    </div>
                    <div>
                        <Label>Vencimiento</Label>
                        <Input type="date" value={form.due_date} onChange={(event) => set("due_date", event.target.value)} required />
                    </div>
                    <div>
                        <Label>Notas</Label>
                        <Textarea value={form.notes} onChange={(event) => set("notes", event.target.value)} rows={2} />
                    </div>
                    <div className="rounded-md bg-muted/30 px-3 py-2 text-sm flex justify-between gap-3">
                        <span className="text-muted-foreground">Total calculado</span>
                        <span className="font-semibold">{formatCurrencyCode(statement.total_amount, statement.currency || "ARS")}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1" disabled={saving}>Guardar</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
