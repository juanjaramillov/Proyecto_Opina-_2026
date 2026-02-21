import { AccountTier, AccountProfile, DemographicData } from '../types';

// Consolidated Limits Logic (formerly in entitlements.ts)
const TIER_LIMITS = {
    guest: 3,
    verified_basic: 15,
    verified_full_ci: -1, // Unlimited
};

export function computeAccountProfile(input: {
    tier: AccountTier;
    profileCompleteness: number;
    isProfileComplete: boolean;
    hasCI: boolean;
    demographics?: DemographicData;
    displayName?: string;
    email?: string;
}): AccountProfile {
    const { tier, profileCompleteness, isProfileComplete, hasCI, demographics = {}, displayName, email } = input;
    if (tier === "guest") {
        return {
            tier,
            profileCompleteness,
            isProfileComplete,
            hasCI,
            displayName,
            email,
            canSeeInsights: false,
            canSeeHistory: false,
            canExport: false,
            signalsDailyLimit: TIER_LIMITS.guest,
            demographics,
        };
    }

    if (tier === "verified_basic") {
        return {
            tier,
            profileCompleteness,
            isProfileComplete,
            hasCI,
            displayName,
            email,
            canSeeInsights: true,
            canSeeHistory: false,
            canExport: false,
            signalsDailyLimit: TIER_LIMITS.verified_basic,
            demographics,
        };
    }

    // verified_full_ci
    return {
        tier,
        profileCompleteness,
        isProfileComplete,
        hasCI,
        displayName,
        email,
        canSeeInsights: true,
        canSeeHistory: true,
        canExport: true,
        signalsDailyLimit: TIER_LIMITS.verified_full_ci,
        demographics,
    };
}
