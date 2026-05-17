import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function Register() {
    const [step, setStep] = useState("register");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [registerCode, setRegisterCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        if (registerCode !== import.meta.env.VITE_REGISTER_CODE) { setError("Código de acceso incorrecto"); return; }
        if (password !== confirmPassword) { setError("Las contraseñas no coinciden"); return; }
        setLoading(true);
        try {
            const { error: err } = await supabase.auth.signUp({ email, password });
            if (err) throw err;
            setStep("otp");
        } catch (err) {
            setError(err.message || "Error al registrarse");
        } finally { setLoading(false); }
    };

    const handleOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { error: err } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
            if (err) throw err;
            window.location.href = "/";
        } catch (err) {
            setError(err.message || "Código inválido");
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        const { error: err } = await supabase.auth.resend({ type: 'signup', email });
        if (err) setError(err.message);
    };

    const handleGoogle = () => {
        supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">Crear cuenta</CardTitle>
                    <CardDescription>{step === "otp" ? "Ingresa el código enviado a tu correo" : "Regístrate para comenzar"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-lg">{error}</p>}
                    {step === "register" ? (
                        <>
                            <form onSubmit={handleRegister} className="space-y-3">
                                <div><Label>Código de acceso</Label><Input type="password" value={registerCode} onChange={(e) => setRegisterCode(e.target.value)} placeholder="Solicitalo al administrador" required /></div>
                                <div><Label>Correo electrónico</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                                <div><Label>Contraseña</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                                <div><Label>Confirmar contraseña</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Registrarse
                                </Button>
                            </form>
                            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">o</span></div></div>
                            <Button variant="outline" className="w-full" onClick={handleGoogle}>
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Continuar con Google
                            </Button>
                        </>
                    ) : (
                        <form onSubmit={handleOtp} className="space-y-4">
                            <div className="flex justify-center">
                                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                    <InputOTPGroup>
                                        {[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} />)}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Verificar
                            </Button>
                            <Button type="button" variant="ghost" className="w-full text-sm" onClick={handleResend}>Reenviar código</Button>
                        </form>
                    )}
                    <p className="text-center text-sm text-muted-foreground">¿Ya tienes cuenta? <Link to="/sign-in" className="text-primary hover:underline">Inicia sesión</Link></p>
                </CardContent>
            </Card>
        </div>
    );
}
