export type SegmentOption = { value: string; label: string };

export const SEG_GENDERS: SegmentOption[] = [
    { value: "all", label: "Todos" },
    { value: "male", label: "Hombre" },
    { value: "female", label: "Mujer" },
    { value: "non_binary", label: "No binario" },
];

export const SEG_AGE_BUCKETS: SegmentOption[] = [
    { value: "all", label: "Todas" },
    { value: "18_24", label: "18–24" },
    { value: "25_34", label: "25–34" },
    { value: "35_44", label: "35–44" },
    { value: "45_54", label: "45–54" },
    { value: "55_64", label: "55–64" },
    { value: "65_plus", label: "65+" },
];

/**
 * Regiones (Chile). Mantener values estables para analítica.
 * Nota: si tu DB usa otros códigos, aquí es donde se normaliza.
 */
export const SEG_REGIONS: SegmentOption[] = [
    { value: "all", label: "Todas" },
    { value: "RM", label: "Región Metropolitana" },
    { value: "V", label: "Valparaíso" },
    { value: "VIII", label: "Biobío" },
    { value: "IX", label: "La Araucanía" },
    { value: "X", label: "Los Lagos" },
    { value: "II", label: "Antofagasta" },
    { value: "IV", label: "Coquimbo" },
    { value: "VI", label: "O'Higgins" },
    { value: "VII", label: "Maule" },
    { value: "XIV", label: "Los Ríos" },
    { value: "I", label: "Tarapacá" },
    { value: "III", label: "Atacama" },
    { value: "XI", label: "Aysén" },
    { value: "XII", label: "Magallanes" },
    { value: "XVI", label: "Ñuble" },
    { value: "XV", label: "Arica y Parinacota" },
];

/**
 * Helpers: convierte UI selections a parámetros RPC, si aplica.
 */
export function normalizeAllToNull(v: string): string | null {
    return v === "all" ? null : v;
}
