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
    tone: "primary" | "urgent" | "premium" | "accent" | "neutral" | "muted";
    preview: "torneo" | "actualidad" | "lugares" | "profundidad" | "servicios" | "locked";
    available: boolean;
    /**
     * Track is user-accessible pero su cobertura de datos o persistencia aún es limitada.
     * Cuando `true`, la tarjeta muestra una etiqueta BETA en el Bento Grid y la vista
     * destino debe mostrar un disclaimer al usuario.
     */
    beta?: boolean;
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
        tone: "primary",
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
        tone: "urgent",
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
        tone: "premium",
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
        tone: "accent",
        preview: "lugares",
        available: true,
        beta: true,
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
        tone: "neutral",
        preview: "servicios",
        available: true,
        beta: true,
    }
];

export function toneClasses(tone: TrackCard["tone"]) {
    switch (tone) {
        case "primary":
            // Torneos — azul brand intenso. Rol: acción primaria competitiva.
            return {
                border: "hover:border-brand-400 border-transparent",
                shadow: "shadow-[inset_0_0_0_1px_rgba(37,99,235,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(37,99,235,0.4)]",
                glow: "from-brand/15 via-brand-400/5 to-transparent",
                wash: "from-brand-50/50 via-white to-white",
                // Icono-cubo: FORMA → gradiente diagonal to-br
                iconWrap: "bg-gradient-to-br from-brand to-brand-700 text-white border-brand-700 shadow-md",
                badge: "bg-brand-50 text-brand-700 border-brand-200",
                meta: "bg-white text-slate-500 border-slate-200",
                titleHover: "group-hover:text-brand-700",
                bullet: "text-brand-500",
                // CTA: FORMA → gradiente diagonal to-br (aplicado donde se consume)
                cta: "from-brand to-brand-700",
                ctaText: "text-white",
                ctaGhost: "bg-brand-50 text-brand-700 border-brand-100",
                previewRing: "border-brand-100",
                previewBg: "from-brand-50/75 via-white to-white",
                previewSoft: "bg-brand-50/80",
                // Barritas de progreso
                previewLine: "bg-brand-500",
                previewLineSoft: "bg-brand-100",
                softBlob: "bg-brand-500/10",
                hairline: "from-brand-100/0 via-brand-200/80 to-brand-100/0",
                accentText: "text-brand-600",
                accentSoft: "bg-brand-500",
            };
        case "urgent":
            // Actualidad — slate oscuro transicionando a danger. Rol: urgencia noticiosa que respira.
            return {
                border: "hover:border-slate-700 border-transparent",
                shadow: "shadow-[inset_0_0_0_1px_rgba(15,23,42,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(220,38,38,0.28)]",
                glow: "from-danger/10 via-slate-500/5 to-transparent",
                wash: "from-slate-50/50 via-white to-white",
                // Icono-cubo: FORMA → gradiente diagonal slate→danger (editorial que respira)
                iconWrap: "bg-gradient-to-br from-slate-900 to-danger text-white border-slate-800 shadow-md",
                badge: "bg-slate-900 text-white border-slate-700",
                meta: "bg-white text-slate-500 border-slate-200",
                titleHover: "group-hover:text-slate-900",
                bullet: "text-danger",
                // CTA: FORMA → gradiente diagonal slate→danger
                cta: "from-slate-900 to-danger",
                ctaText: "text-white",
                ctaGhost: "bg-slate-50 text-slate-900 border-slate-200",
                previewRing: "border-slate-200",
                previewBg: "from-slate-50/75 via-white to-white",
                previewSoft: "bg-slate-50/80",
                previewLine: "bg-slate-900",
                previewLineSoft: "bg-slate-200",
                softBlob: "bg-slate-900/10",
                hairline: "from-slate-200/0 via-slate-300/80 to-slate-200/0",
                accentText: "text-danger",
                accentSoft: "bg-danger",
            };
        case "premium":
            // Profundidad — gradiente corporativo COMPLETO brand→accent. Rol: firma visual premium del producto.
            return {
                border: "hover:border-accent border-transparent",
                shadow: "shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(37,99,235,0.35)]",
                glow: "from-brand/12 via-accent/5 to-transparent",
                wash: "from-brand-50/40 via-white to-accent-50/40",
                // Icono-cubo: FORMA → gradiente diagonal corporativo (firma visual)
                iconWrap: "bg-gradient-to-br from-brand to-accent text-white border-brand-700 shadow-md",
                badge: "bg-brand-50 text-brand-700 border-brand-200",
                meta: "bg-white text-slate-500 border-slate-200",
                titleHover: "group-hover:text-brand-700",
                bullet: "text-accent",
                // CTA: FORMA → gradiente diagonal corporativo (firma visual)
                cta: "from-brand to-accent",
                ctaText: "text-white",
                ctaGhost: "bg-brand-50 text-brand-700 border-brand-100",
                previewRing: "border-brand-100",
                previewBg: "from-brand-50/50 via-white to-accent-50/50",
                previewSoft: "bg-brand-50/80",
                previewLine: "bg-brand-500",
                previewLineSoft: "bg-brand-100",
                softBlob: "bg-brand-500/10",
                hairline: "from-brand-100/0 via-accent-200/80 to-brand-100/0",
                accentText: "text-brand-600",
                accentSoft: "bg-accent",
            };
        case "accent":
            // Lugares — verde accent. Rol: físico, cerca de ti, real.
            return {
                border: "hover:border-accent border-transparent",
                shadow: "shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(16,185,129,0.35)]",
                glow: "from-accent/12 via-accent-400/5 to-transparent",
                wash: "from-accent-50/50 via-white to-white",
                // Icono-cubo: FORMA → gradiente diagonal accent
                iconWrap: "bg-gradient-to-br from-accent to-accent-700 text-white border-accent-700 shadow-md",
                badge: "bg-accent-50 text-accent-800 border-accent-200",
                meta: "bg-white text-slate-500 border-slate-200",
                titleHover: "group-hover:text-accent",
                bullet: "text-accent",
                // CTA: FORMA → gradiente diagonal accent
                cta: "from-accent to-accent-700",
                ctaText: "text-white",
                ctaGhost: "bg-accent-50 text-accent-700 border-accent-100",
                previewRing: "border-accent-100",
                previewBg: "from-accent-50/75 via-white to-white",
                previewSoft: "bg-accent-50/80",
                previewLine: "bg-accent",
                previewLineSoft: "bg-accent-100",
                softBlob: "bg-accent/10",
                hairline: "from-accent-100/0 via-accent-200/80 to-accent-100/0",
                accentText: "text-accent",
                accentSoft: "bg-accent",
            };
        case "neutral":
            // Servicios — slate medio. Rol: catálogo / directorio, no compite con los otros tracks.
            return {
                border: "hover:border-slate-400 border-transparent",
                shadow: "shadow-[inset_0_0_0_1px_rgba(100,116,139,0.08)] hover:shadow-[0_24px_60px_-16px_rgba(100,116,139,0.25)]",
                glow: "from-slate-500/8 via-slate-400/3 to-transparent",
                wash: "from-slate-50/40 via-white to-white",
                // Icono-cubo: FORMA → gradiente diagonal slate
                iconWrap: "bg-gradient-to-br from-slate-500 to-slate-700 text-white border-slate-600 shadow-md",
                badge: "bg-slate-100 text-slate-700 border-slate-200",
                meta: "bg-white text-slate-500 border-slate-200",
                titleHover: "group-hover:text-slate-800",
                bullet: "text-slate-500",
                // CTA: FORMA → gradiente diagonal slate
                cta: "from-slate-500 to-slate-700",
                ctaText: "text-white",
                ctaGhost: "bg-slate-50 text-slate-700 border-slate-100",
                previewRing: "border-slate-200",
                previewBg: "from-slate-50/75 via-white to-white",
                previewSoft: "bg-slate-50/80",
                previewLine: "bg-slate-500",
                previewLineSoft: "bg-slate-200",
                softBlob: "bg-slate-500/10",
                hairline: "from-slate-200/0 via-slate-300/80 to-slate-200/0",
                accentText: "text-slate-700",
                accentSoft: "bg-slate-500",
            };
        case "muted":
            // Locked / próximamente — slate light con borde punteado. Sin vida.
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
