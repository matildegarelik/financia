export default function UserNotRegisteredError() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
            <div className="text-center space-y-4 max-w-sm">
                <h2 className="text-xl font-semibold">Acceso no autorizado</h2>
                <p className="text-muted-foreground text-sm">Tu cuenta no tiene acceso a esta aplicación.</p>
                <button
                    onClick={() => window.location.href = '/sign-in'}
                    className="text-primary hover:underline text-sm"
                >
                    Volver al inicio de sesión
                </button>
            </div>
        </div>
    );
}
