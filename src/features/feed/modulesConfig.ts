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
    mockTitle?: string;
    mockSubtitle?: string;
    mockBullets?: string[];
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
        key: "progressive",
        slug: "torneo",
        title: "Versus Progresivo",
        description: "Modo torneo. Una opción sigue ganando hasta coronar al ganador invicto.",
        status: "active",
        icon: "rocket_launch",
        tone: "secondary",
        tags: ["Torneo", "Eliminación"],
    },
    {
        key: "insights",
        slug: "profundidad",
        title: "Profundidad",
        description: "5 preguntas rápidas para refinar la inteligencia colectiva sobre una opción.",
        status: "active",
        icon: "insights",
        tone: "emerald",
        tags: ["Analítico", "Contexto"],
    },
    {
        key: "personal",
        slug: "estado",
        title: "Estado & Contexto",
        description: "Sincroniza tu estado actual. Registra cómo te sientes hoy.",
        status: "soon",
        icon: "favorite",
        tone: "rose",
        tags: ["Privado", "Anónimo"],
        mockTitle: "Tu estado personal a un click",
        mockSubtitle: "Sincroniza tus dimensiones vitales del día a día.",
        mockBullets: [
            "Registra tu estado de ánimo, felicidad y finanzas en segundos.",
            "100% privado y desvinculado de tu identidad pública.",
            "Desbloquea análisis de tendencias según el estado anímico general."
        ]
    },
    {
        key: "places",
        slug: "lugares",
        title: "Lugares",
        description: "Califica y rankea ubicaciones físicas y espacios a tu alrededor.",
        status: "soon",
        icon: "location_on",
        tone: "slate",
        tags: ["Presencial", "Geo"],
        mockTitle: "Rankea lugares en el mundo real",
        mockSubtitle: "Evalúa parques, restaurantes o locales físicos al instante.",
        mockBullets: [
            "Checa la mejor ubicación valorada a pocos kilómetros.",
            "Registra tus visitas y valora experiencias in-situ.",
            "Mira mapas de calor basados en la opinión colectiva."
        ]
    },
    {
        key: "services",
        slug: "servicios",
        title: "Servicios",
        description: "Evalúa la calidad de atención y proveedores que facilitan tu vida.",
        status: "soon",
        icon: "support_agent",
        tone: "slate",
        tags: ["Atención", "Calidad"],
        mockTitle: "Inteligencia en Servicios Locales",
        mockSubtitle: "¿Quién da la mejor atención en tu zona?",
        mockBullets: [
            "Ranqueo de isapres, aseguradoras, telecomunicaciones y más.",
            "Comparador directo de beneficios y calidad percibida.",
            "Vota para influir cómo operan estas redes de servicio."
        ]
    },
    {
        key: "news",
        slug: "actualidad",
        title: "Actualidad",
        description: "Vota sobre temas del momento con dualidad opuesta rápida.",
        status: "soon",
        icon: "newspaper",
        tone: "slate",
        tags: ["Polémica", "A/B"],
        mockTitle: "Debate en tiempo real",
        mockSubtitle: "Participa en los grandes debates mientras ocurren.",
        mockBullets: [
            "Opiniones a favor / en contra de los temas calientes del día.",
            "Visualiza cómo opinan distintos rangos de edad en tiempo real.",
            "Entiende si vives en una burbuja ideológica o sigues la norma."
        ]
    },
    {
        key: "scanner",
        slug: "escaner",
        title: "Escáner",
        description: "Escanea un producto para ver su ficha y valoración comunitaria.",
        status: "soon",
        icon: "qr_code_scanner",
        tone: "slate",
        tags: ["Supermercado", "Cámara"],
        mockTitle: "Inteligencia colectiva de bolsillo",
        mockSubtitle: "Conoce lo que otros opinan escaneando el código de barras.",
        mockBullets: [
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
        mockTitle: "Descubriendo tu lealtad",
        mockSubtitle: "Métrica estándar para conocer marcas ultra recomendadas.",
        mockBullets: [
            "Responde en escala rápida del 1 al 10 si recomendarías la marca.",
            "Descubre si tu marca favorita realmente es amada u odiada.",
            "Ve listados Top de Lovemarks en tu industria preferida."
        ]
    }
];
