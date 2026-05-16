import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Loader2 } from "lucide-react";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
        setLoading(true);
        try {
            const { error: err } = await supabase.auth.updateUser({ password });
            if (err) throw err;
            window.location.href = "/sign-in";
        } catch (err) {
            setError(err.message || "Error al restablecer la contraseña");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
                    <CardDescription>Ingresa tu nueva contraseña</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-lg">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div><Label>Nueva contraseña</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                        <div><Label>Confirmar contraseña</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Restablecer contraseña
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
