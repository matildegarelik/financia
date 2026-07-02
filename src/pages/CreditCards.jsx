import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, CalendarDays, CheckCircle2, Plus, WalletCards } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    TODAY,
    formatCurrencyCode,
    formatDate,
    getCreditCardStatementRange,
    getPreviousCreditCardStatementRange,
    getTransferDestinationAmount,
    transactionMatchesStatement,
} from "@/lib/formatters";

const STATUS_LABELS = {
    open: "Abierto",
    closed: "Cerrado",
    paid: "Pagado",
};

function computeEffectiveBalance(account, transactions) {
    return transactions
        .filter((tx) => tx.status !== "projected" && tx.date && tx.date <= TODAY)
        .reduce((sum, tx) => {
            if (tx.account_id === account.id) {
                if (tx.type === "income") return sum + (tx.amount || 0);
                if (tx.type === "expense") return sum - (tx.amount || 0);
                if (tx.type === "transfer") return sum - (tx.amount || 0);
            }
            if (tx.to_account_id === account.id && tx.type === "transfer") {
                return sum + getTransferDestinationAmount(tx, account.currency);
            }
            return sum;
        }, account.balance || 0);
}

function getStatementTotal(statement, transactions) {
    return transactions
        .filter((tx) => tx.status !== "projected" && transactionMatchesStatement(tx, statement))
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
}

function statementKey(statement) {
    return `${statement.account_id}:${statement.period_start}:${statement.period_end}`;
}

export default function CreditCards() {
    const queryClient = useQueryClient();
    const [editingStatement, setEditingStatement] = useState(null);

    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => base44.entities.Account.list() });
    const { data: transactions = [] } = useQuery({ queryKey: ["transactions"], queryFn: () => base44.entities.Transaction.list("-date", 5000) });
    const { data: statements = [] } = useQuery({
        queryKey: ["credit_card_statements"],
        queryFn: () => base44.entities.CreditCardStatement.list("-period_end", 1000),
    });

    const cardAccounts = useMemo(
        () => accounts.filter((a) => a.type === "credit_card" && a.is_active !== false),
        [accounts]
    );
    const paymentAccounts = useMemo(
        () => accounts.filter((a) => a.type !== "credit_card" && a.type !== "investment" && a.is_active !== false),
        [accounts]
    );

    const statementsByKey = useMemo(() => {
        const map = new Map();
        statements.forEach((s) => map.set(statementKey(s), s));
        return map;
    }, [statements]);

    const createStatementMut = useMutation({
        mutationFn: (data) => base44.entities.CreditCardStatement.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["credit_card_statements"] }),
    });

    const updateStatementMut = useMutation({
        mutationFn: ({ id, data }) => base44.entities.CreditCardStatement.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["credit_card_statements"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            setEditingStatement(null);
        },
    });

    const payStatementMut = useMutation({
        mutationFn: async ({ statement, card, paymentAccount, paymentAmount }) => {
            const sourceCurrency = paymentAccount.currency || "ARS";
            const cardCurrency = card.currency || statement.currency || "ARS";
            const isCrossCurrency = sourceCurrency !== cardCurrency;
            const amountPaid = isCrossCurrency ? Number(paymentAmount) : Number(statement.total_amount);

            const payment = await base44.entities.Transaction.create({
                type: "transfer",
                status: "confirmed",
                date: TODAY,
                amount: amountPaid,
                currency: sourceCurrency,
                to_amount: isCrossCurrency ? Number(statement.total_amount) : null,
                to_currency: isCrossCurrency ? cardCurrency : null,
                description: `Pago resumen ${card.name}`,
                account_id: paymentAccount.id,
                account_name: paymentAccount.name,
                to_account_id: card.id,
                to_account_name: card.name,
                is_credit_card_payment: true,
                credit_card_statement_id: statement.id,
            });
            await base44.entities.CreditCardStatement.update(statement.id, {
                status: "paid",
                payment_account_id: paymentAccount.id,
                payment_transaction_id: payment.id,
            });
            return payment;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["credit_card_statements"] });
        },
    });

    const ensureStatement = (card, range) => {
        const draft = {
            ...range,
            account_id: card.id,
            currency: card.currency || "ARS",
        };
        const existing = statementsByKey.get(statementKey(draft));
        if (existing) return existing;
        return {
            ...draft,
            total_amount: getStatementTotal(draft, transactions),
            status: "open",
            payment_account_id: card.default_payment_account_id || null,
        };
    };

    const createStatement = (statement) => {
        createStatementMut.mutate({
            account_id: statement.account_id,
            period_start: statement.period_start,
            period_end: statement.period_end,
            close_date: statement.close_date,
            due_date: statement.due_date,
            total_amount: statement.total_amount,
            currency: statement.currency,
            status: statement.status || "open",
            payment_account_id: statement.payment_account_id || null,
            notes: statement.notes || null,
        });
    };

    return (
        <div className="space-y-5">
            <PageHeader
                title="Tarjetas"
                description="Consumos, cierres, vencimientos y pagos de tarjetas de credito"
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
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {cardAccounts.map((card) => {
                        const effective = computeEffectiveBalance(card, transactions);
                        const debt = Math.max(0, -effective);
                        const limit = Number(card.credit_limit) || 0;
                        const usedPct = limit > 0 ? Math.min((debt / limit) * 100, 100) : 0;
                        const currentStatement = ensureStatement(card, getCreditCardStatementRange(card));
                        const previousStatement = ensureStatement(card, getPreviousCreditCardStatementRange(card));
                        const paymentAccount = paymentAccounts.find((a) => a.id === (previousStatement.payment_account_id || card.default_payment_account_id));

                        return (
                            <Card key={card.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                                <CreditCard className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <CardTitle className="text-base truncate">{card.name}</CardTitle>
                                                <p className="text-xs text-muted-foreground">
                                                    Cierra dia {card.statement_close_day || 25} · vence dia {card.statement_due_day || "auto"}
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
                                            <p className="text-xs text-muted-foreground">Disponible</p>
                                            <p className="text-xl font-bold">
                                                {limit > 0 ? formatCurrencyCode(Math.max(limit - debt, 0), card.currency || "ARS") : "Sin limite"}
                                            </p>
                                        </div>
                                    </div>

                                    {limit > 0 && (
                                        <div>
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>Uso del limite</span>
                                                <span>{Math.round(usedPct)}%</span>
                                            </div>
                                            <Progress value={usedPct} className={usedPct > 85 ? "[&>div]:bg-destructive" : ""} />
                                        </div>
                                    )}

                                    <StatementRow
                                        title="Resumen anterior"
                                        statement={previousStatement}
                                        persisted={Boolean(previousStatement.id)}
                                        paymentAccount={paymentAccount}
                                        paymentAccounts={paymentAccounts}
                                        onCreate={createStatement}
                                        onEdit={setEditingStatement}
                                        onPay={(statement, account, paymentAmount) => payStatementMut.mutate({ statement, card, paymentAccount: account, paymentAmount })}
                                        isPaying={payStatementMut.isPending}
                                    />
                                    <StatementRow
                                        title="Resumen actual"
                                        statement={currentStatement}
                                        persisted={Boolean(currentStatement.id)}
                                        paymentAccount={paymentAccounts.find((a) => a.id === (currentStatement.payment_account_id || card.default_payment_account_id))}
                                        paymentAccounts={paymentAccounts}
                                        onCreate={createStatement}
                                        onEdit={setEditingStatement}
                                        onPay={(statement, account, paymentAmount) => payStatementMut.mutate({ statement, card, paymentAccount: account, paymentAmount })}
                                        isPaying={payStatementMut.isPending}
                                    />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {editingStatement && (
                <StatementDialog
                    statement={editingStatement}
                    paymentAccounts={paymentAccounts}
                    onClose={() => setEditingStatement(null)}
                    onSubmit={(data) => updateStatementMut.mutate({ id: editingStatement.id, data })}
                />
            )}
        </div>
    );
}

function StatementRow({ title, statement, persisted, paymentAccount, paymentAccounts, onCreate, onEdit, onPay, isPaying }) {
    const [selectedPaymentAccountId, setSelectedPaymentAccountId] = useState(paymentAccount?.id || "");
    const [paymentAmount, setPaymentAmount] = useState("");
    const selectedPaymentAccount = paymentAccounts.find((a) => a.id === selectedPaymentAccountId) || paymentAccount;
    const paymentCurrency = selectedPaymentAccount?.currency || "ARS";
    const statementCurrency = statement.currency || "ARS";
    const isCrossCurrencyPayment = Boolean(selectedPaymentAccount && paymentCurrency !== statementCurrency);
    const parsedPaymentAmount = parseFloat(paymentAmount);
    const canPay = Boolean(
        selectedPaymentAccount &&
        !isPaying &&
        Number(statement.total_amount) > 0 &&
        (!isCrossCurrencyPayment || parsedPaymentAmount > 0)
    );

    useEffect(() => {
        setSelectedPaymentAccountId(paymentAccount?.id || "");
    }, [paymentAccount?.id]);

    useEffect(() => {
        setPaymentAmount(isCrossCurrencyPayment ? "" : String(statement.total_amount || ""));
    }, [isCrossCurrencyPayment, statement.total_amount, selectedPaymentAccount?.id]);

    return (
        <div className="rounded-lg border border-border/60 p-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDate(statement.period_start)} - {formatDate(statement.period_end)}
                    </p>
                </div>
                <Badge variant={statement.status === "paid" ? "default" : "secondary"}>{STATUS_LABELS[statement.status] || "Abierto"}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold">{formatCurrencyCode(statement.total_amount, statement.currency || "ARS")}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Vence</p>
                    <p className={cn("font-medium", statement.status !== "paid" && statement.due_date < TODAY && "text-destructive")}>
                        {formatDate(statement.due_date)}
                    </p>
                </div>
            </div>

            {!persisted ? (
                <Button variant="outline" size="sm" className="w-full" onClick={() => onCreate(statement)}>
                    <Plus className="h-4 w-4 mr-1.5" />Crear resumen editable
                </Button>
            ) : (
                <div className="space-y-2">
                    {statement.status !== "paid" && (
                        <div className="space-y-2">
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                <Select value={selectedPaymentAccountId || paymentAccount?.id || ""} onValueChange={setSelectedPaymentAccountId}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Cuenta de pago" /></SelectTrigger>
                                    <SelectContent>
                                        {paymentAccounts.map((a) => (
                                            <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "ARS"})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button size="sm" disabled={!canPay} onClick={() => onPay(statement, selectedPaymentAccount, isCrossCurrencyPayment ? parsedPaymentAmount : statement.total_amount)}>
                                    <CheckCircle2 className="h-4 w-4 mr-1" />Pagar
                                </Button>
                            </div>
                            {isCrossCurrencyPayment && (
                                <div className="grid grid-cols-[1fr_72px] gap-2 items-end">
                                    <div>
                                        <Label className="text-xs">Monto debitado</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                        />
                                    </div>
                                    <div className="h-8 flex items-center justify-center rounded-md border border-input bg-muted/40 px-2 text-xs font-mono font-semibold text-muted-foreground">
                                        {paymentCurrency}
                                    </div>
                                    <p className="col-span-2 text-xs text-muted-foreground">
                                        La tarjeta recibe {formatCurrencyCode(statement.total_amount, statementCurrency)}.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => onEdit(statement)}>
                        <CalendarDays className="h-4 w-4 mr-1.5" />Editar resumen
                    </Button>
                </div>
            )}
        </div>
    );
}

function StatementDialog({ statement, paymentAccounts, onClose, onSubmit }) {
    const [form, setForm] = useState({
        total_amount: String(statement.total_amount || 0),
        due_date: statement.due_date || "",
        status: statement.status || "open",
        payment_account_id: statement.payment_account_id || "",
        notes: statement.notes || "",
    });
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Editar resumen</DialogTitle></DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit({
                            total_amount: parseFloat(form.total_amount) || 0,
                            due_date: form.due_date,
                            status: form.status,
                            payment_account_id: form.payment_account_id || null,
                            notes: form.notes || null,
                        });
                    }}
                >
                    <div>
                        <Label>Total</Label>
                        <Input type="number" step="0.01" value={form.total_amount} onChange={(e) => set("total_amount", e.target.value)} />
                    </div>
                    <div>
                        <Label>Vencimiento</Label>
                        <Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} />
                    </div>
                    <div>
                        <Label>Estado</Label>
                        <Select value={form.status} onValueChange={(v) => set("status", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Abierto</SelectItem>
                                <SelectItem value="closed">Cerrado</SelectItem>
                                <SelectItem value="paid">Pagado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Cuenta de pago</Label>
                        <Select value={form.payment_account_id || "none"} onValueChange={(v) => set("payment_account_id", v === "none" ? "" : v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin cuenta</SelectItem>
                                {paymentAccounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency || "ARS"})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Notas</Label>
                        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="flex-1">Guardar</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
