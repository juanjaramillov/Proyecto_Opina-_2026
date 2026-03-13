import { AccessState, AppRouteModule, PolicyResult } from '../types/policy';

export function resolveAccessPolicy(route: AppRouteModule, state: AccessState): PolicyResult {
    // If still resolving session, we don't block nor allow definitively, 
    // but the UI layer usually shows a loader. We return allowed: true to avoid premature redirects.
    if (state.isLoading) {
        return { allowed: true };
    }

    switch (route) {
        case 'public':
            return { allowed: true };

        case 'experience':
            if (!state.isAuthenticated) {
                return {
                    allowed: false,
                    reason: 'unauthenticated',
                    redirectTo: '/login', // Will be appended with ?next= in the Guard
                };
            }
            if (!state.isProfileComplete) {
                // Admins bypass profile completeness checks
                if (state.role !== 'admin') {
                    return {
                        allowed: false,
                        reason: 'incomplete_profile',
                        redirectTo: '/complete-profile'
                    };
                }
            }
            
            // Access gate logic for Experience: 
            // Users need a valid token (invite/pass) UNLESS they are admin, or already bound their invite (hasAccessGateToken is a generic flag we'll map)
            // But wait, the current logic says if gate is disabled it passes. We will handle gate config logic in the provider, 
            // so if `state.hasAccessGateToken` is true, it means they are cleared to pass the gate.
            if (!state.hasAccessGateToken && state.role !== 'admin') {
               return {
                   allowed: false,
                   reason: 'missing_invite',
                   redirectTo: '/access'
               }
            }

            return { allowed: true };

        case 'admin':
            if (!state.isAuthenticated) {
                return {
                    allowed: false,
                    reason: 'unauthenticated',
                    redirectTo: '/admin-login'
                };
            }
            if (state.role !== 'admin') {
                return {
                    allowed: false,
                    reason: 'insufficient_role',
                    redirectTo: '/',
                    uiMessage: 'Acceso restringido.'
                };
            }
            return { allowed: true };

        case 'b2b_dashboard':
            if (!state.isAuthenticated) {
                return {
                    allowed: false,
                    reason: 'unauthenticated',
                    redirectTo: '/login'
                };
            }
            if (state.role !== 'b2b' && state.role !== 'admin') {
                return {
                    allowed: false,
                    reason: 'insufficient_role',
                    redirectTo: '/',
                    uiMessage: 'Acceso restringido (requiere B2B).'
                };
            }
            return { allowed: true };
            
        default:
            return { allowed: false, reason: 'unknown_module', redirectTo: '/' };
    }
}
