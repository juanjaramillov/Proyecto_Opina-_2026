export type LoyaltyTierId = "observador" | "senalador" | "analista" | "influenciador" | "oraculo";

export type LoyaltyTier = {
    id: LoyaltyTierId;
    name: string;
    minSignals: number;
    badgeClass: string;  // Tailwind
    accentClass: string; // Tailwind
    benefits: string[];
    upcomingBenefits: string[];
};

export const LOYALTY_TIERS: LoyaltyTier[] = [
    {
        id: "observador",
        name: "Observador",
        minSignals: 0,
        badgeClass: "bg-slate-100 text-slate-800 border border-slate-200",
        accentClass: "from-slate-300/30 to-transparent",
        benefits: ["Participar en señales"],
        upcomingBenefits: ["Ver resultados segmentados"]
    },
    {
        id: "senalador",
        name: "Señalador",
        minSignals: 20,
        badgeClass: "bg-brand/10 text-brand border border-brand/30",
        accentClass: "from-brand/12 to-transparent",
        benefits: ["Participar en señales", "Ver resultados segmentados"],
        upcomingBenefits: ["Acceso a rankings avanzados"]
    },
    {
        id: "analista",
        name: "Analista",
        minSignals: 50,
        badgeClass: "bg-accent/10 text-accent-900 border border-accent-200",
        accentClass: "from-accent-400/18 to-transparent",
        benefits: ["Participar en señales", "Resultados segmentados", "Acceso a rankings avanzados"],
        upcomingBenefits: ["Participar en versus especiales"]
    },
    {
        id: "influenciador",
        name: "Influenciador",
        minSignals: 120,
        badgeClass: "bg-warning-50 text-warning-900 border border-warning-200",
        accentClass: "from-warning-400/18 to-transparent",
        benefits: ["Todos los anteriores", "Participar en versus especiales"],
        upcomingBenefits: ["Acceso anticipado a nuevas secciones"]
    },
    {
        id: "oraculo",
        name: "Oráculo",
        minSignals: 300,
        badgeClass: "bg-brand-50 text-brand-900 border border-brand-200",
        accentClass: "from-brand-500/18 to-transparent",
        benefits: ["Todos los anteriores", "Acceso anticipado a nuevas secciones"],
        upcomingBenefits: []
    }
];

export function clamp01(n: number) {
    return Math.max(0, Math.min(1, n));
}

export function getTierForSignals(signals: number): { current: LoyaltyTier; next?: LoyaltyTier } {
    const sorted = [...LOYALTY_TIERS].sort((a, b) => a.minSignals - b.minSignals);
    let current = sorted[0];
    for (const t of sorted) {
        if (signals >= t.minSignals) current = t;
    }
    const idx = sorted.findIndex(t => t.id === current.id);
    const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined;
    return { current, next };
}

export function formatPoints(n: number) {
    return new Intl.NumberFormat("es-CL").format(Math.round(n));
}
