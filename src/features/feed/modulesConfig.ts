export type ModuleStatus = "active" | "soon";

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
        status: "soon",
        icon: "insights",
        tone: "emerald",
        tags: ["Analítico", "Contexto"],
    },
    {
        key: "pulso",
        slug: "pulso",
        title: "Tu Pulso",
        description: "Sincroniza tu estado actual. Registra cómo te sientes hoy.",
        status: "soon",
        icon: "favorite",
        tone: "rose",
        tags: ["Privado", "Anónimo"],
        previewTitle: "Tu estado personal a un click",
        previewSubtitle: "Sincroniza tus dimensiones vitales del día a día.",
        previewBullets: [
            "Registra tu estado de ánimo, felicidad y finanzas en segundos.",
            "100% privado y desvinculado de tu identidad pública.",
            "Desbloquea análisis de tendencias según el estado anímico general."
        ]
    },
    {
        key: "lugares",
        slug: "lugares",
        title: "Lugares",
        description: "Califica y rankea ubicaciones físicas y espacios a tu alrededor.",
        status: "soon",
        icon: "location_on",
        tone: "slate",
        tags: ["Presencial", "Geo"],
        previewTitle: "Rankea lugares en el mundo real",
        previewSubtitle: "Evalúa parques, restaurantes o locales físicos al instante.",
        previewBullets: [
            "Checa la mejor ubicación valorada a pocos kilómetros.",
            "Registra tus visitas y valora experiencias in-situ.",
            "Mira mapas de calor basados en la opinión colectiva."
        ]
    },
    {
        key: "servicios",
        slug: "servicios",
        title: "Servicios",
        description: "Evalúa la calidad de atención y proveedores que facilitan tu vida.",
        status: "soon",
        icon: "support_agent",
        tone: "slate",
        tags: ["Atención", "Calidad"],
        previewTitle: "Inteligencia en Servicios Locales",
        previewSubtitle: "¿Quién da la mejor atención en tu zona?",
        previewBullets: [
            "Ranqueo de isapres, aseguradoras, telecomunicaciones y más.",
            "Comparador directo de beneficios y calidad percibida.",
            "Participa para generar inteligencia sobre estas redes de servicio."
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
        previewTitle: "Debate en tiempo real",
        previewSubtitle: "Participa en los grandes debates mientras ocurren.",
        previewBullets: [
            "Opiniones a favor / en contra de los temas calientes del día.",
            "Visualiza cómo opinan distintos rangos de edad en tiempo real.",
            "Entiende si vives en una burbuja ideológica o sigues la norma."
        ]
    },
    {
        key: "productos",
        slug: "productos",
        title: "Productos",
        description: "Escanea un producto para ver su ficha y valoración comunitaria.",
        status: "soon",
        icon: "qr_code_scanner",
        tone: "slate",
        tags: ["Supermercado", "Cámara"],
        previewTitle: "Inteligencia colectiva de bolsillo",
        previewSubtitle: "Conoce lo que otros opinan escaneando el código de barras.",
        previewBullets: [
            "Ve directo al supermercado: escanea y visualiza quién lo recomienda.",
            "Añade alternativas hiper-locales y descubre si es ecológico.",
            "Conoce la relación precio/calidad sin leer foros largos."
        ]
    },
    {
        key: "nps",
        slug: "nps",
        title: "NPS",
        description: "Evalúa en una escala rápida tu nivel de lealtad hacia ciertas marcas.",
        status: "soon",
        icon: "speed",
        tone: "slate",
        tags: ["Lealtad", "Puntuación"],
        previewTitle: "Descubriendo tu lealtad",
        previewSubtitle: "Métrica estándar para conocer marcas ultra recomendadas.",
        previewBullets: [
            "Responde en escala rápida del 1 al 10 si recomendarías la marca.",
            "Descubre si la opción preferida realmente es amada u odiada.",
            "Ve listados Top de Lovemarks en tu industria preferida."
        ]
    }
];
