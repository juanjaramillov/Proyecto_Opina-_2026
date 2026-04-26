import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../../../supabase/client';
import { AccountProfile } from '../types';

import { profileService } from '../../profile/services/profileService';
import { logger } from '../../../lib/logger';
import { AccessState, AppRole } from '../../access/types/policy';
import { accessGate } from '../../access/services/accessGate';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { SessionSupersededBanner } from '../components/SessionSupersededBanner';

interface AuthContextType {
    profile: AccountProfile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    accessState: AccessState;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<AccountProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [gateValid, setGateValid] = useState<boolean>(false);

    // #5 Media Drimo: multi-session lock. Registra la sesión, revoca las
    // otras del mismo user, pingea cada 30s y hace signOut si fue superada.
    useSessionGuard();



    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const p = await profileService.getEffectiveProfile();
            setProfile(p);
            
            // Re-evaluate gate token validation
            let tokenIsValid = false;
            if (p?.role === 'admin' || p?.invitation_code_id || !accessGate.isEnabled()) {
                tokenIsValid = true;
            } else {
                // Check if user has the custom access_granted claim in their JWT session
                const { data: { session } } = await supabase.auth.getSession();
                if (session && session.user.app_metadata?.access_granted === true) {
                    tokenIsValid = true;
                }
            }
            setGateValid(tokenIsValid);

        } catch (err) {
            logger.error("Error loading profile in context", { domain: 'auth', origin: 'AuthContext', action: 'load_profile' }, err);
            setGateValid(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            // F-07: solo recargar profile cuando la identidad cambia realmente.
            // TOKEN_REFRESHED ocurre cada hora silenciosamente y antes
            // disparaba un getEffectiveProfile() + getSession() inútiles
            // por cada refresh, con re-render del árbol entero.
            // INITIAL_SESSION ya está cubierto por loadProfile() del mount.
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                loadProfile();
            }
        });

        const onUpdate = () => loadProfile();
        window.addEventListener('storage', onUpdate);
        window.addEventListener('opina:verification_update', onUpdate);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('storage', onUpdate);
            window.removeEventListener('opina:verification_update', onUpdate);
        };
    }, [loadProfile]);

    const accessState: AccessState = {
        isAuthenticated: !!profile && profile.tier !== 'guest',
        userId: null, // We'll map this via Supabase session directly here if needed, but we don't store userId in profile... wait. Let's just use email as a proxy or fetch it? Actually, AuthContext doesn't expose userId easily except via auth.user. Let's omit or keep it null unless requested. We'll grab it from supabase session under the hood if necessary, but AccessPolicy rarely blocks by userId exactly.
        role: (profile?.role as AppRole) || 'user',
        isProfileComplete: profile?.isProfileComplete || false,
        verificationLevel: profile?.tier || 'guest',
        hasAccessGateToken: gateValid,
        isLoading: loading
    };

    return (
        <AuthContext.Provider value={{ profile, loading, refreshProfile: loadProfile, accessState }}>
            {children}
            <SessionSupersededBanner />
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
