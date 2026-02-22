export type AccountTier = "guest" | "registered" | "verified_basic" | "verified_full_ci";

export type DemographicData = {
    // Stage 1
    name?: string;
    birthYear?: number;
    gender?: string;

    // Stage 2
    region?: string;
    commune?: string;

    // Stage 3
    employmentStatus?: string;
    incomeRange?: string;
    educationLevel?: string;
    housingType?: string;

    // Stage 4
    purchaseBehavior?: string;
    influenceLevel?: string;

    // System Props
    profileStage?: number;
    signalWeight?: number;
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
