export type ExperienceMode = "menu" | "versus" | "torneo" | "profundidad" | "actualidad" | "lugares" | "servicios";
export type ActiveTrackMode = Exclude<ExperienceMode, "menu" | "versus">;
export type TrackKey = ActiveTrackMode | "servicios" | "publicidad";

export interface TrackCard {
    key: TrackKey;
    mode?: ActiveTrackMode;
    title: string;
    subtitle: string;
    statement: string;
    bullets: string[];
    cta: string;
    status: string;
    meta?: string;
    icon: string;
    tone: "indigo" | "rose" | "sky" | "emerald" | "violet" | "slate";
    preview: "torneo" | "actualidad" | "lugares" | "profundidad" | "servicios" | "locked";
    available: boolean;
}


export const TRACKS: TrackCard[] = [
    // TIER 1
    {
        key: "torneo",
        mode: "torneo",
        title: "Torneos",
        subtitle: "Duelo tras duelo hasta que quede un ganador.",
        statement: "Sigue eliminatorias vivas y descubre qué opción domina cuando la comparación sube de nivel.",
        bullets: ["Vota cara a cara", "Desbloquea fases", "Ve cómo escala el ganador"],
        cta: "Entrar a la arena",
        status: "Competitivo",
        meta: "Fase de Grupos",
        icon: "emoji_events",
        tone: "indigo",
        preview: "torneo",
        available: true,
    },
    {
        key: "actualidad",
        mode: "actualidad",
        title: "Actualidad",
        subtitle: "Las decisiones de mercado del ecosistema.",
        statement: "Mide cómo reacciona la comunidad frente a noticias, temas calientes y cambios que impactan hoy.",
        bullets: ["Temas vivos", "Tendencias rápidas", "Lectura inmediata del contexto"],
        cta: "Analizar pulso",
        status: "En vivo",
        meta: "Urgente",
        icon: "bolt",
        tone: "rose",
        preview: "actualidad",
        available: true,
    },
    // TIER 2
    {
        key: "profundidad",
        mode: "profundidad",
        title: "Profundidad",
        subtitle: "Una mirada más completa que la señal rápida.",
        statement: "Entra más hondo en una marca, producto o tema con una evaluación más estructurada y reveladora.",
        bullets: ["Más contexto", "Más capas", "Más criterio comparativo"],
        cta: "Ver análisis Premium",
        status: "Premium",
        meta: "10 dimensiones",
        icon: "donut_large",
        tone: "sky",
        preview: "profundidad",
        available: true,
    },
    {
        key: "lugares",
        mode: "lugares",
        title: "Lugares",
        subtitle: "La experiencia real en espacios físicos.",
        statement: "Encuentra qué lugares destacan, fallan o sorprenden cerca de ti con señales de personas reales.",
        bullets: ["Cerca de ti", "Servicio real", "Comparación entre sedes"],
        cta: "Explorar mapa",
        status: "Territorial",
        meta: "Georreferenciado",
        icon: "my_location",
        tone: "emerald",
        preview: "lugares",
        available: true,
    },
    // TIER 3
    {
        key: "servicios",
        mode: "servicios",
        title: "Servicios",
        subtitle: "Evalúa proveedores y suscripciones.",
        statement: "Explora la oferta de servicios y decide con la visión de la comunidad.",
        bullets: ["Telecomunicaciones", "Servicios Financieros", "Salud y Seguros"],
        cta: "Abrir directorio",
        status: "Catálogo",
        meta: "Directorio",
        icon: "storefront",
        tone: "violet",
        preview: "servicios",
        available: true,
    }
];

export function toneClasses(tone: TrackCard["tone"]) {
    switch (tone) {
        case "indigo":
            return {
                border: "hover:border-indigo-400 border-transparent",
                shadow: "shadow-[inset_0_0_0_1px_rgba(79,70,229,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(79,70,229,0.4)]",
                glow: "from-indigo-600/15 via-indigo-400/5 to-transparent",
                wash: "from-indigo-50/50 via-white to-white",
                iconWrap: "bg-indigo-600 text-white border-indigo-700 shadow-md",
                badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
                meta: "bg-white text-slate-500 border-slate-200",
                titleHover: "group-hover:text-indigo-700",
                bullet: "text-indigo-500",
                cta: "from-indigo-600 to-blue-600",
                ctaText: "text-white",
                ctaGhost: "bg-indigo-50 text-indigo-700 border-indigo-100",
                previewRing: "border-indigo-100",
                previewBg: "from-indigo-50/75 via-white to-white",
                previewSoft: "bg-indigo-50/80",
                previewLine: "bg-indigo-500",
                previewLineSoft: "bg-indigo-100",
                softBlob: "bg-indigo-500/10",
                hairline: "from-indigo-100/0 via-indigo-200/80 to-indigo-100/0",
                accentText: "text-indigo-600",
                accentSoft: "bg-indigo-500",
            };
        case "emerald":
            return {
                border: "hover:border-emerald-400 border-transparent",
                shadow: "shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(16,185,129,0.35)]",
                glow: "from-emerald-500/12 via-teal-400/5 to-transparent",
                wash: "from-emerald-50/50 via-white to-white",
                iconWrap: "bg-emerald-600 text-white border-emerald-700 shadow-md",
                badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
                meta: "bg-white text-slate-500 border-slate-200",
                titleHover: "group-hover:text-emerald-700",
                bullet: "text-emerald-500",
                cta: "from-emerald-500 to-teal-500",
                ctaText: "text-white",
                ctaGhost: "bg-emerald-50 text-emerald-700 border-emerald-100",
                previewRing: "border-emerald-100",
                previewBg: "from-emerald-50/75 via-white to-white",
                previewSoft: "bg-emerald-50/80",
                previewLine: "bg-emerald-500",
                previewLineSoft: "bg-emerald-100",
                softBlob: "bg-emerald-500/10",
                hairline: "from-emerald-100/0 via-emerald-200/80 to-emerald-100/0",
                accentText: "text-emerald-600",
                accentSoft: "bg-emerald-500",
            };
        case "rose":
            return {
                border: "hover:border-rose-400 border-transparent",
                shadow: "shadow-[inset_0_0_0_1px_rgba(244,63,94,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(244,63,94,0.35)]",
                glow: "from-rose-500/15 via-red-400/5 to-transparent",
                wash: "from-rose-50/50 via-white to-white",
                iconWrap: "bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-700 shadow-md",
                badge: "bg-rose-50 text-rose-800 border-rose-200",
                meta: "bg-white text-slate-500 border-slate-200",
                titleHover: "group-hover:text-rose-700",
                bullet: "text-rose-500",
                cta: "from-rose-500 to-red-500",
                ctaText: "text-white",
                ctaGhost: "bg-rose-50 text-rose-700 border-rose-100",
                previewRing: "border-rose-100",
                previewBg: "from-rose-50/75 via-white to-white",
                previewSoft: "bg-rose-50/80",
                previewLine: "bg-rose-500",
                previewLineSoft: "bg-rose-100",
                softBlob: "bg-rose-500/10",
                hairline: "from-rose-100/0 via-rose-200/80 to-rose-100/0",
                accentText: "text-rose-600",
                accentSoft: "bg-rose-500",
            };
        case "sky":
            return {
                border: "hover:border-sky-400 border-transparent",
                shadow: "shadow-[inset_0_0_0_1px_rgba(14,165,233,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(14,165,233,0.35)]",
                glow: "from-sky-500/15 via-blue-400/5 to-transparent",
                wash: "from-sky-50/50 via-white to-white",
                iconWrap: "bg-slate-900 text-sky-400 border-slate-800 shadow-md",
                badge: "bg-slate-900 text-sky-300 border-slate-700",
                meta: "bg-white text-slate-500 border-slate-200",
                titleHover: "group-hover:text-blue-700",
                bullet: "text-sky-500",
                cta: "from-slate-900 to-slate-800",
                ctaText: "text-white",
                ctaGhost: "bg-sky-50 text-sky-700 border-sky-100",
                previewRing: "border-sky-100",
                previewBg: "from-sky-50/75 via-white to-white",
                previewSoft: "bg-sky-50/80",
                previewLine: "bg-sky-500",
                previewLineSoft: "bg-sky-100",
                softBlob: "bg-sky-500/10",
                hairline: "from-sky-100/0 via-sky-200/80 to-sky-100/0",
                accentText: "text-sky-600",
                accentSoft: "bg-sky-500",
            };
        case "violet":
            return {
                border: "hover:border-violet-300 border-transparent",
                shadow: "shadow-[inset_0_0_0_1px_rgba(139,92,246,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(139,92,246,0.3)]",
                glow: "from-violet-500/10 via-fuchsia-400/5 to-transparent",
                wash: "from-violet-50/30 via-white to-white",
                iconWrap: "bg-violet-100 text-violet-700 border-violet-200",
                badge: "bg-violet-50 text-violet-700 border-violet-100",
                meta: "bg-white text-slate-500 border-slate-200",
                titleHover: "group-hover:text-violet-700",
                bullet: "text-violet-500",
                cta: "from-violet-500 to-fuchsia-500",
                ctaText: "text-white",
                ctaGhost: "bg-violet-50 text-violet-700 border-violet-100",
                previewRing: "border-violet-100",
                previewBg: "from-violet-50/75 via-white to-white",
                previewSoft: "bg-violet-50/80",
                previewLine: "bg-violet-500",
                previewLineSoft: "bg-violet-100",
                softBlob: "bg-violet-500/10",
                hairline: "from-violet-100/0 via-violet-200/80 to-violet-100/0",
                accentText: "text-violet-600",
                accentSoft: "bg-violet-500",
            };
        case "slate":
            return {
                border: "border-dashed border-slate-300 hover:border-slate-400",
                shadow: "shadow-none",
                glow: "from-transparent via-transparent to-transparent",
                wash: "bg-slate-50/50",
                iconWrap: "bg-slate-200 text-slate-500 border-transparent",
                badge: "bg-slate-200 text-slate-600 border-transparent",
                meta: "bg-transparent text-slate-400 border-transparent",
                titleHover: "group-hover:text-slate-800",
                bullet: "text-slate-400",
                cta: "from-slate-300 to-slate-300",
                ctaText: "text-slate-500",
                ctaGhost: "bg-slate-100 text-slate-500 border-slate-200",
                previewRing: "border-slate-200",
                previewBg: "bg-slate-50",
                previewSoft: "bg-slate-100",
                previewLine: "bg-slate-300",
                previewLineSoft: "bg-slate-200",
                softBlob: "bg-transparent",
                hairline: "from-slate-200/0 via-slate-200/80 to-slate-200/0",
                accentText: "text-slate-500",
                accentSoft: "bg-slate-400",
            };
    }
}
