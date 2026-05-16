import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
    <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
);

export default function ProtectedRoute({ unauthenticatedElement }) {
    const { isAuthenticated, isLoadingAuth } = useAuth();

    if (isLoadingAuth) return <Spinner />;
    if (!isAuthenticated) return unauthenticatedElement;
    return <Outlet />;
}
