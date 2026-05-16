import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const TEMPLATE_HEADERS = [
    "type", "status", "amount", "currency", "description",
    "date", "category_name", "account_name", "notes",
    "project_name", "client_name", "due_date",
    "installment_current", "installment_total", "probability"
];

const EXAMPLE_ROWS = [
    ["income", "confirmed", "35000", "MXN", "Salario junio", "2026-06-01", "Salario", "Cuenta BBVA", "", "", "", "", "", "", ""],
    ["expense", "confirmed", "1200", "MXN", "Supermercado", "2026-06-03", "Alimentación", "Cuenta BBVA", "", "", "", "", "", "", ""],
    ["income", "installment", "5000", "USD", "Proyecto web", "2026-07-01", "Freelance", "Cuenta BBVA", "", "App Móvil", "Acme Corp", "2026-07-15", "2", "4", ""],
    ["expense", "projected", "800", "MXN", "Salida cine", "2026-06-20", "Entretenimiento", "Efectivo", "Estimado", "", "", "", "", "", "70"],
];

function downloadTemplate() {
    const rows = [TEMPLATE_HEADERS, ...EXAMPLE_ROWS];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_transacciones.csv";
    a.click();
}

export default function ImportModal({ open, onClose, accounts, categories, onImported }) {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleFile = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const text = await file.text();
            const lines = text.split("\n").filter((l) => l.trim());
            const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

            const rows = lines.slice(1).map((line) => {
                const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
                const obj = {};
                headers.forEach((h, i) => { if (vals[i] !== undefined) obj[h] = vals[i]; });
                return obj;
            }).filter((r) => r.type && r.amount && r.date);

            let success = 0, errors = [];
            for (const row of rows) {
                try {
                    // Find account id
                    const acc = accounts.find((a) => a.name.toLowerCase() === (row.account_name || "").toLowerCase());
                    const cat = categories.find((c) => c.name.toLowerCase() === (row.category_name || "").toLowerCase());
                    await base44.entities.Transaction.create({
                        type: row.type || "expense",
                        status: row.status || "confirmed",
                        amount: parseFloat(row.amount) || 0,
                        currency: row.currency || "MXN",
                        description: row.description || "",
                        date: row.date,
                        category_name: row.category_name || "",
                        category_id: cat?.id || "",
                        account_name: row.account_name || "",
                        account_id: acc?.id || "",
                        notes: row.notes || "",
                        project_name: row.project_name || "",
                        client_name: row.client_name || "",
                        due_date: row.due_date || "",
                        installment_current: row.installment_current ? parseInt(row.installment_current) : undefined,
                        installment_total: row.installment_total ? parseInt(row.installment_total) : undefined,
                        probability: row.probability ? parseInt(row.probability) : undefined,
                    });
                    success++;
                } catch (e) {
                    errors.push(row.description || "fila");
                }
            }
            setResult({ success, errors, total: rows.length });
            if (success > 0) { onImported(); queryClient.invalidateQueries({ queryKey: ["transactions"] }); }
        } catch (e) {
            setResult({ error: e.message });
        }
        setLoading(false);
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Importar transacciones desde CSV</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                        <p className="font-medium">Formato requerido:</p>
                        <p className="text-muted-foreground text-xs">type, status, amount, currency, description, date (YYYY-MM-DD), category_name, account_name, notes, project_name, client_name, due_date, installment_current, installment_total, probability</p>
                    </div>

                    <Button variant="outline" className="w-full" onClick={downloadTemplate}>
                        <Download className="h-4 w-4 mr-2" />Descargar plantilla CSV con ejemplos
                    </Button>

                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        {file ? (
                            <div className="space-y-2">
                                <CheckCircle className="h-8 w-8 text-primary mx-auto" />
                                <p className="text-sm font-medium">{file.name}</p>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Cambiar archivo</Button>
                            </div>
                        ) : (
                            <label className="cursor-pointer space-y-2 block">
                                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                                <p className="text-sm text-muted-foreground">Haz clic para seleccionar un archivo CSV</p>
                                <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
                            </label>
                        )}
                    </div>

                    {result && (
                        <div className={cn("p-3 rounded-lg text-sm", result.error ? "bg-destructive/10" : "bg-primary/10")}>
                            {result.error ? (
                                <p className="text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" />{result.error}</p>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-primary font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" />{result.success} de {result.total} importadas</p>
                                    {result.errors.length > 0 && <p className="text-muted-foreground text-xs">Errores: {result.errors.join(", ")}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={handleClose}>Cerrar</Button>
                        <Button className="flex-1" onClick={handleImport} disabled={!file || loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Importar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}