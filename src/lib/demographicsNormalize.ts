export const REGION_NAME_TO_CODE: Record<string, string> = {
    // Canon
    "RM": "RM",
    "V": "V",
    "VIII": "VIII",
    "I": "I",
    "II": "II",
    "III": "III",
    "IV": "IV",
    "VI": "VI",
    "VII": "VII",
    "IX": "IX",
    "X": "X",
    "XI": "XI",
    "XII": "XII",
    "XIV": "XIV",
    "XV": "XV",
    "XVI": "XVI",

    // Nombres comunes (UI)
    "Región Metropolitana": "RM",
    "Metropolitana": "RM",
    "Valparaíso": "V",
    "Biobío": "VIII",
    "Araucanía": "IX",
    "La Araucanía": "IX",
    "Los Lagos": "X",
    "Los Ríos": "XIV",
    "Aysén": "XI",
    "Magallanes": "XII",
    "Ñuble": "XVI",
    "O'Higgins": "VI",
    "Coquimbo": "IV",
    "Atacama": "III",
    "Antofagasta": "II",
    "Tarapacá": "I",
    "Arica y Parinacota": "XV",
    "Maule": "VII",

    // Legacy (Onboarding viejo)
    "rm": "RM",
    "valpo": "V",
    "biobio": "VIII",
};

export function normalizeRegion(input?: string): string | undefined {
    if (input === undefined) return undefined;
    const raw = String(input).trim();
    if (!raw) return undefined;
    return REGION_NAME_TO_CODE[raw] ?? REGION_NAME_TO_CODE[raw.toLowerCase()] ?? raw;
}

export function normalizeGender(input?: string): string | undefined {
    if (input === undefined) return undefined;
    const raw = String(input).trim();
    if (!raw) return undefined;

    // Canon
    if (raw === "male" || raw === "female" || raw === "other") return raw;

    // UI labels
    if (raw === "Hombre") return "male";
    if (raw === "Mujer") return "female";
    if (raw === "Otro") return "other";

    // Legacy
    if (raw === "non_binary") return "other";

    return raw;
}

export function normalizeAgeBucket(input?: string): string | undefined {
    if (input === undefined) return undefined;
    const raw = String(input).trim();
    if (!raw) return undefined;

    // Canon DB (lo que usan tus RPCs / signal_events)
    const allowed = new Set(["under_18", "18-24", "25-34", "35-44", "45-54", "55-64", "65_plus"]);
    if (allowed.has(raw)) return raw;

    // Legacy / UI
    if (raw === "55+") return "55-64";
    if (raw === "65+") return "65_plus";

    // Underscore legacy (por si quedó en algún lado)
    if (raw === "18_24") return "18-24";
    if (raw === "25_34") return "25-34";
    if (raw === "35_44") return "35-44";
    if (raw === "45_54") return "45-54";
    if (raw === "55_64") return "55-64";
    if (raw === "65_plus") return "65_plus";

    return raw;
}

export function computeAgeBucketFromBirthYear(birthYear?: number): string | undefined {
    if (birthYear === undefined || birthYear === null) return undefined;
    if (!Number.isFinite(birthYear)) return undefined;

    const age = new Date().getFullYear() - Number(birthYear);
    if (!Number.isFinite(age)) return undefined;

    if (age < 18) return "under_18";
    if (age <= 24) return "18-24";
    if (age <= 34) return "25-34";
    if (age <= 44) return "35-44";
    if (age <= 54) return "45-54";
    if (age <= 64) return "55-64";
    return "65_plus";
}
