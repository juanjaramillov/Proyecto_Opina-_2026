import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../features/auth/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { profile, loading } = useAuthContext();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile || (profile.tier === 'guest' && !profile.email)) {
        // Redirigir al login si no hay sesión real
        // Si tiene email y es guest, es un posible error de sincronización, pero permitimos el flujo de auth
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!profile.isProfileComplete) {
        // Evitar bucle si ya estamos en la página de completar perfil
        // O si intentamos explícitamente ir a login/register (para cambiar de cuenta)
        if (
            location.pathname === "/complete-profile" ||
            location.pathname === "/login" ||
            location.pathname === "/register"
        ) {
            return <>{children}</>;
        }
        return <Navigate to="/complete-profile" replace />;
    }

    return <>{children}</>;
}
