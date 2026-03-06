import { SEG_GENDERS, SEG_AGE_BUCKETS, SEG_REGIONS, SegmentOption } from "./segmentation";

function labelFor(opts: SegmentOption[], value?: string): string | undefined {
    if (!value) return undefined;
    return opts.find(o => o.value === value)?.label;
}

const AGE_ALIASES: Record<string, string> = {
    "18_24": "18-24",
    "25_34": "25-34",
    "35_44": "35-44",
    "45_54": "45-54",
    "55_64": "55-64",
    "65+": "65_plus",
    "65_plus": "65_plus"
};

const REGION_ALIASES: Record<string, string> = {
    "Metropolitana": "RM",
    "Región Metropolitana": "RM",
    "rm": "RM"
};

export function labelGender(v?: string): string | undefined {
    if (!v || v === "all") return undefined;
    // soporta legacy
    if (v === "Hombre") v = "male";
    if (v === "Mujer") v = "female";
    if (v === "Otro" || v === "non_binary") v = "other";
    return labelFor(SEG_GENDERS, v) ?? v;
}

export function labelAgeBucket(v?: string): string | undefined {
    if (!v || v === "all") return undefined;
    const normalized = AGE_ALIASES[v] ?? v;
    return labelFor(SEG_AGE_BUCKETS, normalized) ?? normalized;
}

export function labelRegion(v?: string): string | undefined {
    if (!v || v === "all") return undefined;
    const normalized = REGION_ALIASES[v] ?? v;
    return labelFor(SEG_REGIONS, normalized) ?? normalized;
}

export type SegmentPart = { key: string; value: string; label: string };

export function parseSegmentId(segmentId: string): SegmentPart[] {
    if (!segmentId || segmentId === "global") return [];
    const parts = segmentId.split("|").map(p => p.trim()).filter(Boolean);

    const out: SegmentPart[] = [];
    for (const p of parts) {
        const [key, value] = p.split(":");
        if (!key || !value) continue;

        let label = `${key}:${value}`;
        if (key === "gender") label = `Género: ${labelGender(value) ?? value}`;
        if (key === "region") label = `Región: ${labelRegion(value) ?? value}`;
        if (key === "age" || key === "age_bucket") label = `Edad: ${labelAgeBucket(value) ?? value}`;

        out.push({ key, value, label });
    }
    return out;
}

export function removeSegmentPart(segmentId: string, keyToRemove: string): string {
    if (!segmentId || segmentId === "global") return "global";
    const parts = segmentId.split("|").map(p => p.trim()).filter(Boolean);
    const next = parts.filter(p => !p.startsWith(`${keyToRemove}:`));
    return next.length ? next.join("|") : "global";
}
