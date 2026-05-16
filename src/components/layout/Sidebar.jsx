import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, ArrowLeftRight, Wallet, PiggyBank,
    TrendingUp, Tag, BarChart2, Settings, LogOut, X, Wallet as WalletIcon, CloudLightning, MoreHorizontal
} from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/transactions", label: "Transacciones", icon: ArrowLeftRight },
    { path: "/accounts", label: "Cuentas", icon: Wallet },
    { path: "/budgets", label: "Presupuestos", icon: PiggyBank },
    { path: "/investments", label: "Inversiones", icon: TrendingUp },
    { path: "/categories", label: "Categorías", icon: Tag },
    { path: "/projected", label: "Proyectado", icon: CloudLightning },
    { path: "/analytics", label: "Estadísticas", icon: BarChart2 },
    { path: "/settings", label: "Configuración", icon: Settings },
];

const DEFAULT_FAVS = ["/", "/transactions", "/accounts", "/budgets", "/projected"];

export function loadFavPaths() {
    try {
        const s = localStorage.getItem("mobileNavFavs");
        if (s) return JSON.parse(s);
    } catch { }
    return DEFAULT_FAVS;
}

export function saveFavPaths(paths) {
    localStorage.setItem("mobileNavFavs", JSON.stringify(paths));
}

export default function Sidebar() {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const favPaths = loadFavPaths();
    const favItems = navItems.filter((n) => favPaths.includes(n.path));

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
                <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                    <WalletIcon className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-sidebar-foreground">FinanzApp</span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                                isActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-sidebar-border">
                <button
                    onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/sign-in'; })}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex fixed top-0 left-0 h-full w-60 bg-sidebar z-40 flex-col border-r border-sidebar-border">
                <NavContent />
            </aside>
            <div className="hidden lg:block w-60 flex-shrink-0" />

            {/* Mobile drawer sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 h-full w-72 bg-sidebar z-50 transition-transform duration-300 lg:hidden border-r border-sidebar-border",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="absolute top-4 right-3">
                    <Button variant="ghost" size="icon" className="text-sidebar-foreground" onClick={() => setMobileOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <NavContent />
            </aside>

            {/* Mobile bottom nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 lg:hidden">
                <div className="flex items-center">
                    {favItems.slice(0, 5).map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path}
                                className={cn("flex flex-col items-center gap-0.5 py-2 flex-1",
                                    isActive ? "text-primary" : "text-muted-foreground")}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium leading-none truncate max-w-[50px] text-center">{item.label.split(" ")[0]}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setMoreOpen(true)}
                        className="flex flex-col items-center gap-0.5 py-2 flex-1 text-muted-foreground"
                    >
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="text-[10px] font-medium leading-none">Más</span>
                    </button>
                </div>
            </nav>

            {/* Mobile "Más" bottom sheet */}
            {moreOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMoreOpen(false)}>
                    <div className="absolute inset-0 bg-black/40" />
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl border-t border-border pb-safe"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border">
                            <span className="font-semibold text-sm">Menú</span>
                            <button onClick={() => setMoreOpen(false)} className="text-muted-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-1 p-4">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMoreOpen(false)}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-colors",
                                            isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="text-[10px] font-medium leading-none text-center">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="px-4 pb-4">
                            <button
                                onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/sign-in'; })}
                                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}