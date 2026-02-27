import { AccountTier, AccountProfile, DemographicData } from '../types';

// Consolidated Limits Logic (formerly in entitlements.ts)
const TIER_LIMITS = {
    guest: -1,
    registered: -1,
    verified_basic: -1,
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
    role?: string;
    invitation_code_id?: string;
}): AccountProfile {
    const { tier, profileCompleteness, isProfileComplete, hasCI, demographics = {}, displayName, email, role, invitation_code_id } = input;

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
            role,
            invitation_code_id,
        };
    }

    if (tier === "registered") {
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
            // @ts-ignore - Ignorar chequeo para flag canSegmentResults no presente en tipos
            canSegmentResults: false,
            signalsDailyLimit: TIER_LIMITS.registered,
            demographics,
            role,
            invitation_code_id,
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
            role,
            invitation_code_id,
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
        role,
        invitation_code_id,
    };
}
