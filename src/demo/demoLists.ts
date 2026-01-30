import { DEMO_MODE } from "../config/demoMode";

type Item = { id: string; name: string; score: number; trend: number };

function getSeededRand(key: string) {
    const seedKey = `opina_demo_seed_${key}`;
    const existing = localStorage.getItem(seedKey);
    let seed = existing ? Number(existing) : Math.floor(Math.random() * 10_000_000) + 1;
    if (!existing) localStorage.setItem(seedKey, String(seed));

    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function getDemoRanking(key: string, count = 12): Item[] {
    const rand = getSeededRand(key);

    const baseNames = [
        "Café Don Pancho",
        "La Picá del Barrio",
        "Farmacia Central",
        "Sushi Ninja",
        "Tacos No Tan Tacos",
        "Peluquería “Me Corté Solo”",
        "Lavandería Express",
        "Hamburguesas Serias",
        "Gym del Lunes",
        "Panadería La Crónica",
        "Pizzería 24/7",
        "Minimarket Salvavidas",
    ];

    const items: Item[] = Array.from({ length: count }).map((_, i) => {
        const name = baseNames[i % baseNames.length] + (i >= baseNames.length ? ` #${i + 1}` : "");
        const score = Math.round((3.8 + rand() * 1.2) * 10) / 10; // 3.8–5.0
        const trend = Math.round((rand() * 2 - 1) * 100) / 10; // -10.0 a +10.0
        return { id: `${key}-${i}`, name, score, trend };
    });

    // ordena por score
    items.sort((a, b) => b.score - a.score);
    return items;
}

export function demoOrReal<T>(demo: T, real: T): T {
    return DEMO_MODE ? demo : real;
}
