export type AppRole = 'user' | 'admin' | 'b2b';

export interface AccessState {
    isAuthenticated: boolean;
    userId: string | null;
    role: AppRole;
    isProfileComplete: boolean;
    verificationLevel: string;
    hasAccessGateToken: boolean; // For invitation links
    isLoading: boolean;
}

export type AppRouteModule = 
    | 'public' 
    | 'experience' 
    | 'admin' 
    | 'b2b_dashboard';

export interface PolicyResult {
    allowed: boolean;
    reason?: string;
    redirectTo?: string;
    uiMessage?: string;
}
