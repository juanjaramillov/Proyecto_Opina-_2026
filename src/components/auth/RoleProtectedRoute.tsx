import { Navigate } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
import React from "react";

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
    const { role, loading } = useRole();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!role || !allowedRoles.includes(role)) {
        console.warn(`[RoleProtectedRoute] Access denied. Current role: ${role}. Required: ${allowedRoles.join(", ")}`);
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
