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
            // Parallel fetch for speed: Profile, Identity, and Subscription
            const [profileRes, identityRes, subRes] = await Promise.all([
                (supabase as any).from('user_profiles').select('*').eq('user_id', auth.user.id).maybeSingle(),
                (supabase as any).from('users').select('is_identity_verified').eq('id', auth.user.id).maybeSingle(),
                supabase.from('subscriptions').select('plan, status').eq('user_id', auth.user.id).eq('status', 'active').maybeSingle()
            ]);

            if (profileRes.error) {
                logger.error("Fetch Profile Error:", profileRes.error);
            }

            const profileData = profileRes.data as UserProfileRow | null;
            const identityData = identityRes.data as UserIdentityRow | null;
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

            const completionPercentage = profileData.profile_completion_percentage || 0;
            const profileStage = profileData.profile_stage || 0;
            const isProfileComplete = profileStage >= 2;
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

    updateProfileDemographics: async (demographics: Partial<DemographicData>): Promise<void> => {
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
        const { data: profile, error } = await (supabase as any).from('user_profiles').select('*').eq('user_id', user.id).maybeSingle();
        const profileData = profile as UserProfileRow | null;

        if (error) {
            logger.error("[authService] Error checking user profile during sync:", error);
        }

        // 3. Update or Create if needed
        // Triggers handle basic creation, but we might need to sync local guest data upwards
        if (!profileData || profileData.profile_stage < 4) {
            const updatePayload: any = {
                updated_at: new Date().toISOString()
            };
            if (localDemographics.name) updatePayload.nickname = profileData?.nickname || localDemographics.name;
            if (localDemographics.birthYear) updatePayload.birth_year = profileData?.birth_year || localDemographics.birthYear;
            if (localDemographics.gender) updatePayload.gender = profileData?.gender || localDemographics.gender;
            if (localDemographics.region) updatePayload.region = profileData?.region || localDemographics.region;
            if (localDemographics.commune) updatePayload.commune = profileData?.comuna || localDemographics.commune;
            if (localDemographics.employmentStatus) updatePayload.employment_status = profileData?.employment_status || localDemographics.employmentStatus;

            if (Object.keys(updatePayload).length > 1) { // more than just updated_at
                await (supabase as any).from('user_profiles').update(updatePayload).eq('user_id', user.id);
            }
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
