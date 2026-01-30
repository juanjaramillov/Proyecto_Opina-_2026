import { SIGNAL_LIMITS } from "../domain/entitlements";
export type AccountTier = "guest" | "verified_basic" | "verified_full_ci";

export type AccountProfile = {
    // Completitud de perfil (0 a 100)
    profileCompleteness: number;

    // Verificación
    tier: AccountTier;

    // Identidad (cuando aplica)
    hasCI: boolean;

    // Flags de acceso (se calculan, no se guardan)
    canSeeInsights: boolean;
    canSeeHistory: boolean;
    canExport: boolean;

    // Límites de señales
    signalsDailyLimit: number; // -1 = ilimitado
};

export function computeAccountProfile(input: {
    tier: AccountTier;
    profileCompleteness: number;
    hasCI: boolean;
}): AccountProfile {
    const { tier, profileCompleteness, hasCI } = input;

    // Reglas de producto (ajustables) - Sincronizado con src/domain/entitlements.ts
    // guest: puede jugar, pero no ver insights ni historial -> Límite guest (unverified)
    // verified_basic: puede ver algo de insights (limitado) -> Límite basic
    // verified_full_ci: acceso completo -> Límite unlimited

    if (tier === "guest") {
        return {
            tier,
            profileCompleteness,
            hasCI,
            canSeeInsights: false,
            canSeeHistory: false,
            canExport: false,
            signalsDailyLimit: SIGNAL_LIMITS.unverified,
        };
    }

    if (tier === "verified_basic") {
        return {
            tier,
            profileCompleteness,
            hasCI,
            canSeeInsights: true,
            canSeeHistory: false,
            canExport: false,
            signalsDailyLimit: SIGNAL_LIMITS.verified_basic,
        };
    }

    // verified_full_ci
    return {
        tier,
        profileCompleteness,
        hasCI,
        canSeeInsights: true,
        canSeeHistory: true,
        canExport: true,
        signalsDailyLimit: SIGNAL_LIMITS.verified_strong,
    };
}
