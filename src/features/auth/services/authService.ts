import { supabase } from '../../../supabase/client';
import { computeAccountProfile } from './account';
import { AccountProfile, AccountTier, DemographicData } from '../types';
import { logger } from '../../../lib/logger';

interface ProfileRow {
    id: string;
    full_name: string | null;
    display_name: string | null;
    gender: string | null;
    age: number | null;
    commune: string | null;
    health_system: string | null;
    clinical_attention_12m: boolean | null;
    profile_completeness: number | null;
    profile_completed: boolean | null;
    has_ci: boolean | null;
    tier: string | null;
}

export const authService = {
    /**
     * Deterministic logic to load an account profile.
     * 1. Check for Demo/Local override.
     * 2. Check for Real User session in Supabase.
     * 3. Fallback to Guest mode.
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

        // If real user is logged in, use it and ignore demo mode
        if (auth?.user) {
            // ... (rest of real user logic handled below)
        } else {
            // 2. DEMO/LOCAL OVERRIDE (Only if no real session)
            const demoUserRaw = localStorage.getItem('opina_demo_user');
            if (demoUserRaw) {
                try {
                    const parsed = JSON.parse(demoUserRaw);
                    return computeAccountProfile({
                        tier: 'verified_basic',
                        profileCompleteness: 15,
                        isProfileComplete: parsed.isProfileComplete || false,
                        hasCI: false,
                        displayName: parsed.displayName,
                        email: parsed.email
                    });
                } catch { /* fail soft */ }
            }
        }

        // 3. REAL USER MODE (Continue if auth.user exists)
        if (auth?.user) {
            // Parallel fetch for speed: Profile and Subscription
            const [profileRes, subRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', auth.user.id).maybeSingle(),
                supabase.from('subscriptions').select('plan, status').eq('user_id', auth.user.id).eq('status', 'active').maybeSingle()
            ]);

            if (profileRes.error) {
                logger.error("Fetch Profile Error:", profileRes.error);
            }

            const profileData = profileRes.data as ProfileRow | null;
            const subData = subRes.data;

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
                    demographics: localDemographics
                });
            }

            // Business Logic: Subscription overrides Tier
            const isPro = subData?.plan === 'pro_user';
            const isEnterprise = subData?.plan === 'enterprise';

            // Evaluate completion based strictly on the new schema flags
            const isProfileComplete =
                profileData.profile_completed === true ||
                (!!profileData.full_name && !!profileData.age && !!profileData.commune && !!profileData.gender && !!profileData.health_system);

            // Strict priority: Enterprise > Pro > DB Tier > Derived Tier
            let finalTier: AccountTier = (profileData.tier as AccountTier) || 'registered';
            if (isEnterprise || isPro) {
                finalTier = 'verified_full_ci';
            } else if (finalTier === 'guest') {
                // If they are logged in and have a profile, they are AT LEAST registered
                finalTier = isProfileComplete ? 'verified_basic' : 'registered';
            }

            return computeAccountProfile({
                tier: finalTier,
                profileCompleteness: isProfileComplete ? 100 : (profileData.profile_completeness || 0),
                isProfileComplete: isProfileComplete,
                hasCI: profileData.has_ci || false,
                displayName: profileData.display_name || profileData.full_name || auth.user.user_metadata?.display_name || auth.user.email?.split('@')[0],
                email: auth.user.email,
                demographics: {
                    ...localDemographics,
                    ageRange: profileData.age ? `${profileData.age}` : localDemographics.ageRange,
                    gender: profileData.gender || localDemographics.gender,
                    commune: profileData.commune || localDemographics.commune,
                    healthSystem: profileData.health_system || localDemographics.healthSystem,
                    clinicalAttention12m: profileData.clinical_attention_12m !== null ? profileData.clinical_attention_12m : localDemographics.clinicalAttention12m,
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

    createSimpleProfile: async (name: string, email: string): Promise<void> => {
        const userData = {
            displayName: name,
            email: email,
            tier: 'guest',
            isVerified: false,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('opina_demo_user', JSON.stringify(userData));

        // Trigger UI update
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('opina:verification_update'));
    },

    updateProfileDemographics: async (demographics: Partial<{
        name: string;
        gender: string;
        ageRange: string;
        region: string;
        commune: string;
        healthSystem: string;
        clinicalAttention12m: boolean;
    }>): Promise<void> => {
        // 1. Update local demographics
        const rawDemographics = localStorage.getItem('opina_demographics');
        const currentDemographics = rawDemographics ? JSON.parse(rawDemographics) : {};
        const nextDemographics = { ...currentDemographics, ...demographics };
        localStorage.setItem('opina_demographics', JSON.stringify(nextDemographics));

        // 2. If in demo mode, persist to demo user as well
        const rawUser = localStorage.getItem('opina_demo_user');
        if (rawUser) {
            const user = JSON.parse(rawUser);
            localStorage.setItem('opina_demo_user', JSON.stringify({
                ...user,
                ...demographics
            }));
        }

        // 3. Real Supabase update (if logged in)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Map ageRange string (e.g. "30-45", "60+") to an integer for the 'age' field
            const ageInt = parseInt(demographics.ageRange?.split(/[-+]/)[0] || "0", 10);

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: demographics.name,
                    gender: demographics.gender,
                    age: ageInt,
                    commune: demographics.commune,
                    health_system: demographics.healthSystem,
                    clinical_attention_12m: demographics.clinicalAttention12m,
                    profile_completeness: 100,
                    profile_completed: true,
                    verification_level: 'basic',
                    tier: 'verified_basic'
                });

            if (error) {
                logger.error("[authService] Failed to update profile:", error);
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

        // Clear demo mode if it was active
        localStorage.removeItem('opina_demo_user');

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

        // Clear demo mode if it was active
        localStorage.removeItem('opina_demo_user');

        // Auto-sync after login
        await authService.syncProfileFromLocal();
    },

    syncProfileFromLocal: async (): Promise<void> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Get local demographics
        let localDemographics: DemographicData = {};
        try {
            const raw = localStorage.getItem('opina_demographics');
            if (raw) localDemographics = JSON.parse(raw);
        } catch { /* empty context is okay */ }

        // 2. Fetch current profile
        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        const profileData = profile as ProfileRow | null;

        if (error) {
            logger.error("[authService] Error checking profile during sync:", error);
        }

        // 3. Update or Create if needed
        // If profile doesn't exist, we MUST create it to avoid login loops
        if (!profileData) {
            const ageInt = parseInt(localDemographics.ageRange?.split(/[-+]/)[0] || "0", 10);

            await supabase.from('profiles').insert({
                id: user.id,
                full_name: localDemographics.name || user.user_metadata?.full_name,
                display_name: localDemographics.name || user.user_metadata?.display_name || user.email?.split('@')[0],
                gender: localDemographics.gender,
                age: ageInt,
                commune: localDemographics.commune,
                health_system: localDemographics.healthSystem,
                clinical_attention_12m: localDemographics.clinicalAttention12m,
                profile_completed: false,
                profile_completeness: 0,
                tier: 'registered'
            });
        } else if (!profileData.profile_completed && Object.keys(localDemographics).length > 0) {
            // Existing but incomplete profile, and we have local data to sync
            const ageInt = parseInt(localDemographics.ageRange?.split(/[-+]/)[0] || "0", 10);

            const willBeComplete = !!(
                (profileData.full_name || localDemographics.name) &&
                (profileData.age || ageInt > 0) &&
                (profileData.commune || localDemographics.commune) &&
                (profileData.gender || localDemographics.gender) &&
                (profileData.health_system || localDemographics.healthSystem)
            );

            await supabase.from('profiles').update({
                full_name: profileData.full_name || localDemographics.name,
                gender: profileData.gender || localDemographics.gender,
                age: profileData.age || (ageInt > 0 ? ageInt : undefined),
                commune: profileData.commune || localDemographics.commune,
                health_system: profileData.health_system || localDemographics.healthSystem,
                clinical_attention_12m: profileData.clinical_attention_12m ?? localDemographics.clinicalAttention12m,
                profile_completed: willBeComplete,
                profile_completeness: willBeComplete ? 100 : (profileData.profile_completeness || 0),
                tier: willBeComplete ? 'verified_basic' : 'registered'
            }).eq('id', user.id);
        }
    },

    resetPasswordForEmail: async (email: string): Promise<void> => {
        const redirectTo = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo
        });
        if (error) throw error;
    },

    updateUserPassword: async (password: string): Promise<void> => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    },

    signOut: async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        localStorage.removeItem('opina_demo_user');
        window.dispatchEvent(new Event('storage'));
    }
};
