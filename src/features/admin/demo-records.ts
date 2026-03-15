export type DemoScenarioType = 'BATTLE' | 'NEWS' | 'BRAND' | 'TRENDING';

export interface GoldenRecord {
    id: string; // The UUID or identifier of the specific poll/battle/news in the DB
    slug: string; // The specific slug to pass to the API
    type: DemoScenarioType;
    title: string;
    description: string;
    commercialBullet: string; // Presenter notes: what to highlight during the pitch
    isReady: boolean; // Flag to indicate if this record was manually validated
}

// TODO: Replace these placeholders with actual stable Database IDs before a demo.
export const PILOT_DEMO_RECORDS: GoldenRecord[] = [
    {
        id: '7b0d8320-118f-4e82-b8c4-d47c7b76b4cb',
        slug: 'clinica-alemana-vs-clinica-las-condes',
        type: 'BATTLE',
        title: 'Versus Competitivo Premium (Salud)',
        description: 'Muestra una batalla altamente fragmentada con cruce de intervalos de Wilson.',
        commercialBullet: 'Destacar: "Opina+ no miente declarando ganadores donde hay empate técnico estadístico. Protegemos la integridad de tu marca."',
        isReady: true
    },
    {
        id: '29c3c4cf-92b3-4429-87b1-45f16c98a59f',
        slug: 'donde-disfrutas-mas-del-cine',
        type: 'NEWS',
        title: 'Actualidad / Topic Analytics (Cine)',
        description: 'Análisis de sentimiento sobre una noticia de coyuntura.',
        commercialBullet: 'Destacar: "Convertimos ruido orgánico en una postura medible con entropía. Sabemos si la audiencia está dividida o hay consenso."',
        isReady: true
    },
    {
        id: 'e370722b-e7ee-482c-9435-75dfd956f76a',
        slug: 'motorola',
        type: 'BRAND',
        title: 'Radiografía de Marca (Motorola)',
        description: 'Análisis en profundidad de la percepción y confianza de un ente/marca.',
        commercialBullet: 'Destacar: "No vendemos una encuesta transaccional, vendemos un activo de datos continuo (Time-Decay) que mide la confianza estructural."',
        isReady: true
    },
    {
        id: 'f4c40a89-858b-4f8e-a1be-16a65abfe3a6',
        slug: 'xiaomi-smartphones',
        type: 'TRENDING',
        title: 'Ranking Global / Evolución (Xiaomi)',
        description: 'El muro de validación general con aplicación de anti-fraude y decaimiento.',
        commercialBullet: 'Destacar: "Nuestro score es bayesiano y está protegido. Si una granja de bots ataca a tu competencia, el sistema frena la manipulación automáticamente."',
        isReady: true
    }
];

export const isDemoHubReady = (): boolean => {
    return PILOT_DEMO_RECORDS.every(record => record.isReady);
};
