import { useAuthContext } from '../context/AuthContext';

/**
 * Main hook to access authentication and user profile state.
 * Consumes the global AuthContext.
 */
export function useAuth() {
    const { profile, loading, refreshProfile } = useAuthContext();

    return {
        profile,
        loading,
        refreshProfile,
        // Computed helpers for quick access
        isAuthenticated: !!profile && profile.tier !== 'guest',
        isGuest: !profile || profile.tier === 'guest',
        isVerified: !!profile && (profile.tier === 'verified_basic' || profile.tier === 'verified_full_ci'),
    };
}
