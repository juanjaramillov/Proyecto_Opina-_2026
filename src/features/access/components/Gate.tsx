import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuthContext } from '../../auth/context/AuthContext';
import { AppRouteModule } from '../types/policy';
import { resolveAccessPolicy } from '../services/policyResolver';
import toast from 'react-hot-toast';
import { logger } from '../../../lib/logger';

interface GateProps {
    module: AppRouteModule;
    children: React.ReactNode;
}

export default function Gate({ module, children }: GateProps) {
    const { accessState } = useAuthContext();
    const location = useLocation();

    // 1. Resolve policy
    const policyResult = resolveAccessPolicy(module, accessState);

    // 2. Handle side effects predictably (only ONCE when access is denied)
    useEffect(() => {
        if (!accessState.isLoading && !policyResult.allowed && policyResult.uiMessage) {
            logger.info("Access denied by Gate policy", {
                domain: 'access_policy',
                origin: 'Gate',
                action: 'resolve_policy',
                state: 'blocked',
                module,
                reason: policyResult.reason
            });
            toast.error(policyResult.uiMessage, { id: `gate-denied-${module}`, duration: 4000 });
        }
    }, [accessState.isLoading, policyResult.allowed, policyResult.uiMessage, policyResult.reason, module]);

    // 3. Render logic
    if (accessState.isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!policyResult.allowed) {
        const nextParam = encodeURIComponent(location.pathname + location.search);
        
        let destination = policyResult.redirectTo || '/';
        
        // Append context parameters for smooth login UX
        if (destination.includes('/login') || destination.includes('/access')) {
            const separator = destination.includes('?') ? '&' : '?';
            destination += `${separator}next=${nextParam}`;
            if (policyResult.reason) {
                destination += `&reason=${policyResult.reason}`;
            }
        }

        // Evitar loop infinito si ya estamos en la ruta de destino (ej. /complete-profile)
        // Ocurre cuando policy redirige a /complete-profile por faltar completar el perfil, 
        // pero la ruta ya está intentando renderizar el ProfileWizard en /complete-profile.
        if (location.pathname === (policyResult.redirectTo || '/')) {
             return <>{children}</>;
        }

        return <Navigate to={destination} replace />;
    }

    return <>{children}</>;
}
