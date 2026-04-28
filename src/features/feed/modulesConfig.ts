export type ModuleStatus = "active" | "soon";

/**
 * Tipos de preview disponibles para módulos en estado "soon".
 * Cada uno corresponde a un case en ComingSoonModule.renderPreviewContent().
 */
export type PreviewType =
    | "context_check"
    | "lugares"
    | "servicios"
    | "news_opinion"
    | "productos"
    | "nps_survey";

/**
 * Shape opcional de data para los previews. Cada key alimenta a un componente
 * hijo específico en ComingSoonModule.renderPreviewContent(). Los tipos se
 * alinean con las props de esos componentes.
 */
export interface PreviewDataShape {
    checkins?: Array<{ label: string; value: number; type?: string; icon: string }>;
    categories?: string[];
    communes?: string[];
    items?: Array<{ name: string; category: string; rating: number }>;
    news?: Array<{ title: string; source: string; date: string; question: string }>;
    product?: {
        name: string;
        brand: string;
        category: string;
        rating: number;
        pros: string[];
        cons: string[];
        conclusions: string[];
    };
    nps_question?: string;
    follow_ups?: Array<{ question: string; placeholder?: string; options?: string[] }>;
}

export interface OpinaModule {
    key: string;
    slug: string;
    title: string;
    description: string;
    status: ModuleStatus;
    icon: string;
    tone: "primary" | "secondary" | "emerald" | "rose" | "slate";
    tags: string[];
    previewTitle?: string;
    previewSubtitle?: string;
    previewBullets?: string[];
    previewType?: PreviewType;
    previewData?: PreviewDataShape;
}

export const MODULES: OpinaModule[] = [
    {
        key: "versus",
        slug: "versus",
        title: "Versus",
        description: "Toma decisiones rápidas entre dos opciones que compiten cara a cara.",
        status: "active",
        icon: "compare_arrows",
        tone: "primary",
        tags: ["Dinámico", "1vs1"],
    },
    {
        key: "torneo",
        slug: "torneo",
        title: "Torneo",
        description: "Modo torneo. Una opción avanza hasta definir la preferencia invicta.",
        status: "active",
        icon: "rocket_launch",
        tone: "secondary",
        tags: ["Torneo", "Eliminación"],
    },
    {
        key: "profundidad",
        slug: "profundidad",
        title: "Profundidad",
        description: "10 preguntas rápidas para refinar la inteligencia colectiva sobre una opción.",
        status: "active",
        icon: "insights",
        tone: "emerald",
        tags: ["Analítico", "Contexto"],
    },
    {
        key: "pulso",
        slug: "pulso",
        title: "Tu Tendencia",
        description: "Disponible Q3 2026 — película temporal personal: tu estado anímico vs. el agregado.",
        status: "soon",
        icon: "favorite",
        tone: "rose",
        tags: ["Q3 2026", "Privado"],
        previewTitle: "Tu película temporal personal — Q3 2026",
        previewSubtitle: "Tendencia, aceleración, volatilidad y persistencia de tu propio estado anímico.",
        previewBullets: [
            "Registra ánimo, felicidad y finanzas en segundos. Tu identidad permanece anónima.",
            "Compara tu evolución contra tu generación, comuna y país.",
            "Marco metodológico: las 4 dimensiones temporales aplicadas a ti, no solo al agregado."
        ]
    },
    {
        key: "lugares",
        slug: "lugares",
        title: "Lugares",
        description: "Disponible Q3 2026 — ranking presencial geo-localizado de espacios físicos.",
        status: "soon",
        icon: "location_on",
        tone: "slate",
        tags: ["Q3 2026", "Geo"],
        previewTitle: "Inteligencia de lugares — Q3 2026",
        previewSubtitle: "Aplicar el marco metodológico de Opina+ a parques, restaurantes y locales físicos.",
        previewBullets: [
            "Checa la mejor ubicación valorada cerca de ti, con n_eff y freshness reales.",
            "Mapas de calor basados en duelos efectivos, no estrellas vanidosas.",
            "Misma capa universal de calidad (integridad + masa para revertir) aplicada a geo."
        ]
    },
    {
        key: "servicios",
        slug: "servicios",
        title: "Servicios",
        description: "Disponible Q3 2026 — comparador de calidad de atención en servicios locales.",
        status: "soon",
        icon: "support_agent",
        tone: "slate",
        tags: ["Q3 2026", "Calidad"],
        previewTitle: "Inteligencia de servicios — Q3 2026",
        previewSubtitle: "Isapres, telcos, aseguradoras evaluadas con el marco metodológico Opina+.",
        previewBullets: [
            "Ranqueo de proveedores con Wilson CI + n_eff visible.",
            "Comparador directo de beneficios y calidad percibida (no solo precio).",
            "OpinaScore por servicio para decisiones reales (cambiar de isapre, telco, banco)."
        ]
    },
    {
        key: "actualidad",
        slug: "actualidad",
        title: "Actualidad",
        description: "Participa sobre debates del momento con dualidad opuesta rápida.",
        status: "active",
        icon: "newspaper",
        tone: "slate",
        tags: ["Polémica", "A/B"],
        previewTitle: "Debate dinámico",
        previewSubtitle: "Participa en los grandes debates mientras ocurren.",
        previewBullets: [
            "Opiniones a favor / en contra de los temas calientes del día.",
            "Visualiza tendencias de percepción con actualizaciones continuas.",
            "Entiende si vives en una burbuja ideológica o sigues la norma."
        ]
    },
    {
        key: "productos",
        slug: "productos",
        title: "Productos",
        description: "Disponible Q3 2026 — scanner de barcode con ficha y ranking comunitario.",
        status: "soon",
        icon: "qr_code_scanner",
        tone: "slate",
        tags: ["Q3 2026", "Cámara"],
        previewTitle: "Inteligencia de productos — Q3 2026",
        previewSubtitle: "Escanea el código de barras y aplica el marco metodológico al producto en tu mano.",
        previewBullets: [
            "OpinaScore del producto + alternativas hiper-locales con n_eff visible.",
            "Relación precio/calidad ponderada por integridad y muestra efectiva.",
            "Detección de patrones cross-módulo (precio cae, NPS sube → señal real)."
        ]
    },
    {
        key: "nps",
        slug: "nps",
        title: "NPS",
        description: "Disponible Q3 2026 — Top Lovemarks por industria con NPS sano (n_eff + freshness).",
        status: "soon",
        icon: "speed",
        tone: "slate",
        tags: ["Q3 2026", "Lealtad"],
        previewTitle: "NPS con rigor estadístico — Q3 2026",
        previewSubtitle: "Lealtad medida con la misma capa universal de Opina+: nada de promedios sin masa.",
        previewBullets: [
            "Escala 0-10 estándar, pero con guardrails de muestra mínima y freshness.",
            "Top Lovemarks por industria, ponderado por n_eff y consistencia temporal.",
            "Cross-check trust_vs_choice: ¿la marca elegida coincide con la marca recomendada?"
        ]
    }
];
