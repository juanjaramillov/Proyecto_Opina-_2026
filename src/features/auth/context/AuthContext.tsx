import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../../supabase/client';
import { AccountProfile } from '../types';
import { authService as profileService } from '../services/authService';
import { logger } from '../../../lib/logger';
import { AccessState, AppRole } from '../../access/types/policy';
import { accessGate } from '../../access/services/accessGate';

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

    const looksLikeUuid = (x: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
    const normalizeCodeToken = (tokenId: string) => (tokenId.startsWith("CODE:") ? tokenId.slice(5) : tokenId).trim().toUpperCase();

    const loadProfile = async () => {
        setLoading(true);
        try {
            const p = await profileService.getEffectiveProfile();
            setProfile(p);
            
            // Re-evaluate gate token validation
            let tokenIsValid = false;
            if (p?.role === 'admin' || p?.invitation_code_id || !accessGate.isEnabled()) {
                tokenIsValid = true;
            } else if (accessGate.hasAccess()) {
                const tokenId = accessGate.getTokenId();
                if (tokenId) {
                    if (looksLikeUuid(tokenId)) {
                        const { data: ok } = await (supabase as any).rpc("validate_invite_token", { p_invite_id: tokenId });
                        tokenIsValid = Boolean(ok);
                    } else {
                        const code = normalizeCodeToken(tokenId);
                        const { data: isValid } = await (supabase as any).rpc("validate_invitation", { p_code: code });
                        
                        // Auto-consume if recently signed up
                        if (isValid && p && p.tier !== 'guest' && !p.invitation_code_id) {
                            try {
                                const nickname = p.displayName || "user";
                                await profileService.bootstrapUserAfterSignup(nickname, code);
                                tokenIsValid = true;
                                // Need to refetch profile to get the invitation_code_id
                                setTimeout(() => loadProfile(), 500);
                            } catch (e) {
                                logger.warn("Early consume error", { domain: 'auth', origin: 'AuthContext', action: 'bootstrap_user', error_details: e });
                                tokenIsValid = Boolean(isValid);
                            }
                        } else {
                            tokenIsValid = Boolean(isValid);
                        }
                    }
                }
            }
            setGateValid(tokenIsValid);

        } catch (err) {
            logger.error("Error loading profile in context", { domain: 'auth', origin: 'AuthContext', action: 'load_profile' }, err);
            setGateValid(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            loadProfile();
        });

        const onUpdate = () => loadProfile();
        window.addEventListener('storage', onUpdate);
        window.addEventListener('opina:verification_update', onUpdate);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('storage', onUpdate);
            window.removeEventListener('opina:verification_update', onUpdate);
        };
    }, []);

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
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
