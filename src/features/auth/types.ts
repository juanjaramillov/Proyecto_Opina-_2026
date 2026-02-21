export type AccountTier = "guest" | "registered" | "verified_basic" | "verified_full_ci";

export type DemographicData = {
    // Block A
    ageRange?: string;
    gender?: string;
    region?: string;
    comuna?: string;

    // Block B
    educationLevel?: string;
    jobStatus?: string;
    incomeRange?: string;

    // Block C
    householdSize?: string;
    housingType?: string;
    jobSector?: string;

    // Block D (Health/Profile Wizard)
    healthSystem?: string;
    clinicalAttention12m?: boolean;
    name?: string; // Optional for profile sync
};

export type AccountProfile = {
    // Identity info
    displayName?: string;
    email?: string;

    // Completitud de perfil (0 a 100)
    profileCompleteness: number;
    isProfileComplete: boolean;

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

    // Demografía (Progresiva)
    demographics: DemographicData;
};
