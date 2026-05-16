import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await base44.auth.resetPasswordRequest(email); } catch { }
        setSent(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
                    <CardDescription>{sent ? "Revisa tu correo electrónico" : "Ingresa tu correo para restablecer tu contraseña"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sent ? (
                        <p className="text-sm text-center text-muted-foreground">Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div><Label>Correo electrónico</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Enviar enlace
                            </Button>
                        </form>
                    )}
                    <Link to="/sign-in" className="flex items-center justify-center gap-1 text-sm text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4" />Volver al inicio de sesión
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}