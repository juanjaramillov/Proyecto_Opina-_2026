import { supabase } from '../supabase/client';
import { AccountProfile, computeAccountProfile } from '../auth/account';
import { readVerificationStatus } from '../hooks/useVerificationStatus';



export const profileService = {
    /**
     * Deterministic logic to load an account profile.
     * STRICT RULE: If no user session -> Guest (Demo).
     * STRICT RULE: If session -> Real Profile from DB.
     */
    getEffectiveProfile: async (): Promise<AccountProfile> => {
        const { data: auth } = await supabase.auth.getUser();

        // 1. GUEST / DEMO MODE
        if (!auth?.user) {
            // Here we read localStorage ONLY for demo continuity, NOT to mix with real data
            const localStatus = readVerificationStatus();
            const demoTier = localStatus === 'verified_strong'
                ? 'verified_full_ci'
                : localStatus === 'verified_basic'
                    ? 'verified_basic'
                    : 'guest';

            return computeAccountProfile({
                tier: demoTier,
                profileCompleteness: 0,
                hasCI: localStatus === 'verified_strong'
            });
        }

        // 2. REAL USER MODE
        // Parallel fetch for speed
        const [profileRes, subRes] = await Promise.all([
            supabase.from('user_profiles').select('*').eq('user_id', auth.user.id).single(),
            supabase.from('subscriptions').select('plan, status').eq('user_id', auth.user.id).eq('status', 'active').maybeSingle()
        ]);

        const profileData = profileRes.data;
        const subData = subRes.data;

        // Safety fallback if DB record is missing (should not happen in consistent state)
        if (!profileData) {
            return computeAccountProfile({
                tier: 'guest',
                profileCompleteness: 0,
                hasCI: false
            });
        }

        // Business Logic: Subscription overrides Tier
        const isPro = subData?.plan === 'pro_user';
        const isEnterprise = subData?.plan === 'enterprise';

        // Strict priority: Enterprise > Pro > DB Tier
        let finalTier = profileData.tier;
        if (isEnterprise || isPro) {
            finalTier = 'verified_full_ci';
        }

        return computeAccountProfile({
            tier: finalTier,
            profileCompleteness: profileData.profile_completeness,
            hasCI: profileData.has_ci
        });
    }
};
