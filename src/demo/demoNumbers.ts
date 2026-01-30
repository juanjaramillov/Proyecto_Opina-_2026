// src/demo/demoNumbers.ts

export type DemoSectionKey = "versus" | "directo" | "recomendados" | "vitrina";

function getSeed(): number {
    const key = "opina_demo_seed_v1";
    const existing = localStorage.getItem(key);
    if (existing) return Number(existing);

    const seed = Math.floor(Math.random() * 10_000_000) + 1;
    localStorage.setItem(key, String(seed));
    return seed;
}

// PRNG simple, estable
function mulberry32(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function formatCompact(n: number): string {
    if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`;
    if (n >= 1_000) return `${Math.round(n / 100) / 10}k`;
    return String(n);
}

function rangeInt(rand: () => number, min: number, max: number): number {
    return Math.floor(rand() * (max - min + 1)) + min;
}

export type DemoKpi = { label: string; value: string };

export function getDemoKpis(section: DemoSectionKey): DemoKpi[] {
    const seed = getSeed();
    const rand = mulberry32(seed + hashSection(section));

    // Rangos "end game"
    // Ajusta libremente, pero mantén coherencia:
    // Versus más alto, vitrinas menos, etc.
    const presets: Record<DemoSectionKey, { now: [number, number]; day: [number, number]; points: string; dayLabel: string }> = {
        versus: { now: [120, 420], day: [8_000, 65_000], points: "+15", dayLabel: "Señales 24h" },
        directo: { now: [60, 220], day: [2_000, 18_000], points: "+25", dayLabel: "Respuestas 24h" },
        recomendados: { now: [40, 160], day: [900, 9_000], points: "+10", dayLabel: "Evaluaciones 24h" },
        vitrina: { now: [25, 120], day: [600, 7_500], points: "+20", dayLabel: "Escaneos 24h" },
    };

    const p = presets[section];

    const activosAhora = rangeInt(rand, p.now[0], p.now[1]);
    const dayMetric = rangeInt(rand, p.day[0], p.day[1]);

    return [
        { label: "Activos ahora", value: String(activosAhora) },
        { label: p.dayLabel, value: formatCompact(dayMetric) },
        { label: "Puntos", value: p.points },
    ];
}

function hashSection(section: string): number {
    let h = 2166136261;
    for (let i = 0; i < section.length; i++) {
        h ^= section.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
