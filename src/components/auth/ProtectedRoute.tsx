import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
    allowedRoles?: ('PARENT' | 'KID')[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const userRole = useAuthStore((state) => state.userRole);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // Redirect based on role if unauthorized for this specific route
        return <Navigate to={userRole === 'PARENT' ? '/dashboard' : '/stories'} replace />;
    }

    return <Outlet />;
}
