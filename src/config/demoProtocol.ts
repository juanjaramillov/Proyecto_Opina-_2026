/**
 * PROTOCOLO DEMO READINESS: FUENTE DE VERDAD OFICIAL
 * ==================================================
 * Este archivo centraliza los criterios GO/NO-GO, escenarios y rutas 
 * de la Demo Layer para evitar divergencia entre el CLI (validate_demo) 
 * y la Interfaz (Pilot Launchpad).
 */

export const DEMO_THRESHOLDS = {
    MIN_ENTITIES: 3,
    MIN_SIGNALS: 10,
    MIN_DEMOGRAPHICS: 5
} as const;

export const DEMO_RECOMMENDED_SCENARIO = 'telecom';

export const DEMO_AVAILABLE_SCENARIOS = {
    telecom: { name: "Telecomunicaciones Demo", slug: "telecom-demo" },
    banking: { name: "Banca Retail Demo", slug: "banking-demo" }
} as const;

export type DemoScenarioKey = keyof typeof DEMO_AVAILABLE_SCENARIOS;

export const DEMO_OFFICIAL_TOUR = [
    { 
        step: 1, 
        title: "Home & Landing", 
        path: "/", 
        description: "Arranca aquí para sentar la premisa institucional. Narrativa de 'Lectura Estadística Continua'.",
        iconName: "Home"
    },
    { 
        step: 2, 
        title: "Access Gate", 
        path: "/access", 
        description: "Demuestra firmeza. Explica que es un 'Piloto Controlado' y muestra pasivamente los enlaces de Legal/Terms en el footer.",
        iconName: "LogIn"
    },
    { 
        step: 3, 
        title: "Signals Hub", 
        path: "/m/versus?slug={slug}", 
        description: "El core interactivo. Haz que el cliente participe en 2 o 3 batallas para experimentar la fricción nula del frontend asimétrico.",
        iconName: "ActivitySquare"
    },
    { 
        step: 4, 
        title: "Perfil y Progresión", 
        path: "/profile", 
        description: "Enseña cómo recolectamos Demografía de forma lúdica y no intrusiva usando el panel lateral de gamificación.",
        iconName: "User"
    },
    { 
        step: 5, 
        title: "Resultados B2C", 
        path: "/results?slug={slug}", 
        description: "Cierra la experiencia de usuario mostrando qué ganan: entendimiento social agregado. Haz zoom en la limitante estadística para generar credibilidad.",
        iconName: "BarChart3"
    },
    { 
        step: 6, 
        title: "Intelligence B2B", 
        path: "/b2b?slug={slug}", 
        description: "El clímax comercial. Muestra los cruces demográficos (Edad, GSE) probando que el input anónimo del Hub se vuelve analítica accionable mediante lectura probabilística.",
        iconName: "Building2"
    }
] as const;

export const DEMO_EXCLUDED_SURFACES = [
    "Tableros administrativos internos (/admin/* excepto el panel Launchpad)",
    "Modo Torneo B2C (/m/torneo) mientras no reciba sembrado",
    "Recuperación y reseteo de contraseñas",
    "Onboarding manual y Auth Email puro"
] as const;
