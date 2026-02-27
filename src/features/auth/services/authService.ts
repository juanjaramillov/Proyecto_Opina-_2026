import { supabase } from '../../../supabase/client';
import { computeAccountProfile } from './account';
import { AccountProfile, AccountTier, DemographicData } from '../types';
import { logger } from '../../../lib/logger';

interface UserProfileRow {
    user_id: string;
    nickname: string | null;
    gender: string | null;
    age_range: string | null; // Legacy
    birth_year: number | null;
    region: string | null;
    comuna: string | null;
    housing_type: string | null;
    education_level: string | null;
    employment_status: string | null;
    income_range: string | null;
    purchase_behavior: string | null;
    influence_level: string | null;
    interests: string[] | null;
    profile_completion_percentage: number | null;
    profile_stage: number;
    signal_weight: number;
    verified: boolean;
}

interface UserIdentityRow {
    id: string;
    is_identity_verified: boolean;
}

export const authService = {
    /**
     * Deterministic logic to load an account profile.
     * 1. Check for Real User session in Supabase.
     * 2. Fallback to Guest mode.
     */
    getEffectiveProfile: async (): Promise<AccountProfile> => {
        // 1. CHECK FOR REAL USER SESSION FIRST
        const { data: auth, error: authError } = await supabase.auth.getUser();

        if (authError) {
            logger.error("Auth GetUser Error:", authError);
        }

        // Load local demographics for persistence across reloads
        let localDemographics: DemographicData = {};
        try {
            const raw = localStorage.getItem('opina_demographics');
            if (raw) localDemographics = JSON.parse(raw);
        } catch { /* empty */ }

        // 2. REAL USER MODE (Continue if auth.user exists)
        if (auth?.user) {
            // Parallel fetch for speed: Profile, Identity, and Subscription
            const [profileRes, identityRes, subRes, userRes] = await Promise.all([
                supabase.from('user_profiles').select('*').eq('user_id', auth.user.id).maybeSingle(),
                supabase.from('users').select('is_identity_verified').eq('user_id', auth.user.id).maybeSingle(),
                (supabase as any).from('subscriptions').select('plan, status').eq('user_id', auth.user.id).eq('status', 'active').maybeSingle(),
                (supabase as any).from('users').select('role, invitation_code_id').eq('user_id', auth.user.id).maybeSingle()
            ]);

            if (profileRes.error) {
                logger.error("Fetch Profile Error:", profileRes.error);
            }

            const profileData = profileRes.data as UserProfileRow | null;
            const identityData = identityRes.data as UserIdentityRow | null;
            const subData = subRes.data;
            const role = userRes.data?.role as string | undefined;
            const invitationCodeId = userRes.data?.invitation_code_id as string | undefined;

            if (!profileData) {
                // If user exists in Auth but profiles fetch failed (new signup edge case before trigger finishes, or RLS block)
                logger.warn("Profile Missing for Auth User. Falling back to 'registered' tier.");
                return computeAccountProfile({
                    tier: 'registered',
                    profileCompleteness: 0,
                    isProfileComplete: false,
                    hasCI: false,
                    displayName: auth.user.user_metadata?.display_name || auth.user.email?.split('@')[0],
                    email: auth.user.email,
                    role: role,
                    invitation_code_id: invitationCodeId,
                    demographics: localDemographics
                });
            }

            // Business Logic: Subscription overrides Tier
            const isPro = subData?.plan === 'pro_user';
            const isEnterprise = subData?.plan === 'enterprise';

            const completionPercentage = profileData.profile_completion_percentage || 0;
            const profileStage = profileData.profile_stage || 0;
            const isProfileComplete = profileStage >= 1;
            const hasCI = identityData?.is_identity_verified || false;

            // Strict priority: Enterprise > Pro > Verified Identity > Basic Verified > Registered
            let finalTier: AccountTier = 'registered';

            if (isEnterprise || isPro) {
                finalTier = 'verified_full_ci';
            } else if (hasCI) {
                finalTier = 'verified_full_ci';
            } else if (isProfileComplete) {
                finalTier = 'verified_basic';
            }

            return computeAccountProfile({
                tier: finalTier,
                profileCompleteness: completionPercentage,
                isProfileComplete: isProfileComplete,
                hasCI: hasCI,
                displayName: profileData.nickname || auth.user.user_metadata?.display_name || auth.user.email?.split('@')[0],
                email: auth.user.email,
                role: role,
                invitation_code_id: invitationCodeId,
                demographics: {
                    ...localDemographics,
                    birthYear: profileData.birth_year || localDemographics.birthYear,
                    gender: profileData.gender || localDemographics.gender,
                    region: profileData.region || localDemographics.region,
                    commune: profileData.comuna || localDemographics.commune,
                    employmentStatus: profileData.employment_status || localDemographics.employmentStatus,
                    incomeRange: profileData.income_range || localDemographics.incomeRange,
                    educationLevel: profileData.education_level || localDemographics.educationLevel,
                    housingType: profileData.housing_type || localDemographics.housingType,
                    purchaseBehavior: profileData.purchase_behavior || localDemographics.purchaseBehavior,
                    influenceLevel: profileData.influence_level || localDemographics.influenceLevel,
                    profileStage: profileData.profile_stage || localDemographics.profileStage,
                    signalWeight: profileData.signal_weight || localDemographics.signalWeight,
                }
            });
        }

        // 3. GUEST MODE
        return computeAccountProfile({
            tier: 'guest',
            profileCompleteness: 0,
            isProfileComplete: false,
            hasCI: false,
            demographics: localDemographics
        });
    },

    saveDemographic: async (field: string, value: string): Promise<void> => {
        // Persist locally for now
        const raw = localStorage.getItem('opina_demographics');
        const current = raw ? JSON.parse(raw) : {};
        const next = { ...current, [field]: value };
        localStorage.setItem('opina_demographics', JSON.stringify(next));

        // Trigger update event
        window.dispatchEvent(new Event('storage'));
    },

    getBootstrapStatus: async (): Promise<{ needsBootstrap: boolean; hasInvite: boolean; hasProfile: boolean }> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { needsBootstrap: false, hasInvite: false, hasProfile: false };

        const [inviteRes, profileRes] = await Promise.all([
            supabase.from('users').select('invitation_code_id').eq('user_id', user.id).maybeSingle(),
            supabase.from('user_profiles').select('user_id').eq('user_id', user.id).maybeSingle()
        ]);

        const hasInvite = !!inviteRes.data?.invitation_code_id;
        const hasProfile = !!profileRes.data?.user_id;

        return {
            hasInvite,
            hasProfile,
            needsBootstrap: !(hasInvite && hasProfile)
        };
    },

    bootstrapUserAfterSignup: async (nickname: string, invitationCode: string): Promise<void> => {
        const cleanNickname = nickname.trim();
        const cleanCode = invitationCode.trim();

        if (cleanNickname.length < 3 || cleanCode.length < 4) {
            throw new Error("Falta nickname o el código de invitación es muy corto");
        }

        const appVersion = (import.meta as any).env?.VITE_APP_VERSION ?? 'unknown';
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';

        let rpcData: any = null;
        let rpcError: any = null;

        // Try v2 first
        const v2Response = await (supabase.rpc as any)('bootstrap_user_after_signup_v2', {
            p_nickname: cleanNickname,
            p_invitation_code: cleanCode,
            p_app_version: appVersion,
            p_user_agent: userAgent
        });

        if (v2Response.error && (v2Response.error.code === '42883' || v2Response.error.message.includes('No function matches the given name'))) {
            logger.warn('[authService] bootstrap_user_after_signup_v2 not found, falling back to v1');
            // Fallback to v1
            const v1Response = await (supabase.rpc as any)('bootstrap_user_after_signup', {
                p_nickname: cleanNickname,
                p_invitation_code: cleanCode
            });
            rpcData = v1Response.data;
            rpcError = v1Response.error;
        } else {
            rpcData = v2Response.data;
            rpcError = v2Response.error;
        }

        if (rpcError) {
            logger.error('[authService] Error on bootstrap RPC call:', rpcError);
            throw new Error("No se pudo validar el código. Intenta de nuevo.");
        }

        // Supabase RPC returns standard structure like { ok: boolean, error?: string } for custom logic
        const responseData = rpcData as { ok: boolean; error?: string } | null;
        if (responseData && responseData.ok !== true) {
            const errCode = responseData.error || '';
            switch (errCode) {
                case 'RATE_LIMITED':
                    throw new Error("Demasiados intentos. Espera 10 minutos y prueba de nuevo.");
                case 'INVITE_INVALID':
                case 'INVITE_ALREADY_USED':
                    throw new Error("Código inválido o expirado.");
                case 'NICKNAME_TOO_SHORT':
                    throw new Error("El nickname debe tener al menos 3 caracteres.");
                case 'UNAUTHORIZED':
                    throw new Error("Tu sesión expiró. Vuelve a iniciar.");
                case 'UNKNOWN_ERROR':
                default:
                    throw new Error("No se pudo validar el código. Intenta de nuevo.");
            }
        }
    },

    updateProfileDemographics: async (demographics: Partial<DemographicData>): Promise<void> => {
        // 1. Update local demographics
        const rawDemographics = localStorage.getItem('opina_demographics');
        const currentDemographics = rawDemographics ? JSON.parse(rawDemographics) : {};
        const nextDemographics = { ...currentDemographics, ...demographics };
        localStorage.setItem('opina_demographics', JSON.stringify(nextDemographics));

        // 2. Real Supabase update (if logged in)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Remove undefined fields so Supabase only updates what we pass
            const updatePayload: any = {
                updated_at: new Date().toISOString()
            };
            if (demographics.name !== undefined) updatePayload.nickname = demographics.name;
            if (demographics.birthYear !== undefined) updatePayload.birth_year = demographics.birthYear;
            if (demographics.gender !== undefined) updatePayload.gender = demographics.gender;
            if (demographics.region !== undefined) updatePayload.region = demographics.region;
            if (demographics.commune !== undefined) updatePayload.comuna = demographics.commune;
            if (demographics.employmentStatus !== undefined) updatePayload.employment_status = demographics.employmentStatus;
            if (demographics.incomeRange !== undefined) updatePayload.income_range = demographics.incomeRange;
            if (demographics.educationLevel !== undefined) updatePayload.education_level = demographics.educationLevel;
            if (demographics.housingType !== undefined) updatePayload.housing_type = demographics.housingType;
            if (demographics.purchaseBehavior !== undefined) updatePayload.purchase_behavior = demographics.purchaseBehavior;
            if (demographics.influenceLevel !== undefined) updatePayload.influence_level = demographics.influenceLevel;
            if (demographics.profileStage !== undefined) updatePayload.profile_stage = demographics.profileStage;
            if (demographics.signalWeight !== undefined) updatePayload.signal_weight = demographics.signalWeight;

            const { error } = await (supabase as any)
                .from('user_profiles')
                .update(updatePayload)
                .eq('user_id', user.id);

            if (error) {
                logger.error("[authService] Failed to update user profile:", error);
                throw error;
            }
        }

        // Trigger UI update
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('opina:verification_update'));
    },

    registerWithEmail: async (email: string, password: string): Promise<void> => {
        const { error, data } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) throw error;

        // Try to claim any guest activity prior to this official signup
        if (data.user) {
            const anonId = localStorage.getItem('opina_anon_id');
            if (anonId) {
                try {
                    await supabase.rpc('claim_guest_activity', { p_anon_id: anonId });
                } catch (err) {
                    logger.warn("[authService] Failed to claim guest activity on register:", err);
                }
            }
        }

        // Auto-sync after registration (Supabase might auto-login)
        await authService.syncProfileFromLocal();
    },

    loginWithEmail: async (email: string, password: string): Promise<void> => {
        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;

        // Try to claim any guest activity prior to this official login
        if (data.user) {
            const anonId = localStorage.getItem('opina_anon_id');
            if (anonId) {
                try {
                    await supabase.rpc('claim_guest_activity', { p_anon_id: anonId });
                } catch (err) {
                    logger.warn("[authService] Failed to claim guest activity on login:", err);
                }
            }
        }

        // Trigger UI update
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('opina:verification_update'));
    },

    resetPasswordForEmail: async (email: string): Promise<void> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    },

    updateUserPassword: async (password: string): Promise<void> => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    },

    signOut: async (): Promise<void> => {
        await supabase.auth.signOut();
        // Clear local caches
        localStorage.removeItem('opina_demographics');

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('opina:verification_update'));
    },

    // Utilities to fetch full models if needed
    fetchFullProfile: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) {
            logger.error("Failed to fetch full profile", error);
            return null;
        }

        return data;
    },

    syncProfileFromLocal: async (): Promise<void> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let localDemographics: Partial<DemographicData> = {};
        try {
            const raw = localStorage.getItem('opina_demographics');
            if (raw) localDemographics = JSON.parse(raw);
        } catch { /* empty */ }

        if (Object.keys(localDemographics).length > 0) {
            try {
                await authService.updateProfileDemographics(localDemographics);
            } catch (e) {
                logger.error("[authService] Error syncing demographics to cloud", e);
            }
        }
    }
};
