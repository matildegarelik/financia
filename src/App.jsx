import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import ProtectedRoute from "@/components/ProtectedRoute";

import SignIn from "./pages/auth/SignIn";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Budgets from "./pages/Budgets";
import Investments from "./pages/Investments";
import Categories from "./pages/Categories";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Projected from "./pages/Projected";

const AuthenticatedApp = () => {
    const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

    if (isLoadingPublicSettings || isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (authError) {
        if (authError.type === "user_not_registered") return <UserNotRegisteredError />;
        if (authError.type === "auth_required") { navigateToLogin(); return null; }
    }

    return (
        <Routes>
            {/* Public auth routes */}
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/sign-in" replace />} />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/budgets" element={<Budgets />} />
                    <Route path="/investments" element={<Investments />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/projected" element={<Projected />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Route>

            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
                <Router>
                    <AuthenticatedApp />
                </Router>
                <Toaster />
                <Sonner richColors position="top-right" />
            </QueryClientProvider>
        </AuthProvider>
    );
}

export default App;