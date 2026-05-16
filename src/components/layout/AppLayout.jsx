import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { CurrencyProvider } from "@/lib/currency-context";

export default function AppLayout() {
    return (
        <CurrencyProvider>
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <main className="flex-1 min-h-screen overflow-x-hidden pb-20 lg:pb-0">
                    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </CurrencyProvider>
    );
}