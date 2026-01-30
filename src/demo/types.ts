export type UserTier = 'rookie' | 'verified' | 'influencer';

// 15 Master Topics
export type MasterTopic =
    | 'Costo de vida'
    | 'Experiencia de usuario'
    | 'Confianza'
    | 'Consumo y hábitos'
    | 'Tecnología'
    | 'Trabajo y carrera'
    | 'Calidad de servicios'
    | 'Educación y desarrollo'
    | 'Salud y bienestar'
    | 'Sostenibilidad'
    | 'Movilidad y ciudad'
    | 'Entretenimiento y cultura'
    | 'Finanzas personales'
    | 'Marcas y reputación'
    | 'Sociedad y convivencia';

export interface DemoUser {
    id: string;
    name: string;
    avatar: string; // URL or initial
    location: string;
    tier: UserTier;
    joinedAt: string; // ISO date
    stats: {
        votes: number;
        reviews: number;
        signals: number;
    };
}

export interface DemoComment {
    id: string;
    userId: string;
    text: string;
    createdAt: string;
    likes: number;
}

export interface DemoBattle {
    id: string;
    topics: MasterTopic[]; // 1-2 topics
    title: string;
    description: string;
    optionA: string;
    optionAImage?: string; // New: Image for Option A
    optionB: string;
    optionBImage?: string; // New: Image for Option B
    votesA: number;
    votesB: number;
    totalVotes: number;
    winner?: 'A' | 'B';
    comments: DemoComment[];
    participants: string[]; // userIds
    isHot?: boolean;
    subtitle?: string; // HOOK (Pillar 4)
}


export interface DemoSignal {
    id: string;
    topics: MasterTopic[]; // 1-2 topics
    title: string;
    description: string;
    type: 'binary' | 'scale' | 'multiple';
    options: { label: string; votes: number }[];
    totalVotes: number;
    participants: string[]; // userIds
    trend: 'up' | 'down' | 'stable' | 'split'; // Added 'split'
    change24h?: number; // Added 24h change
}

export interface DemoReview {
    id: string;
    targetId: string; // Product or Place ID
    targetName: string;
    targetImage: string; // URL
    targetType: 'product' | 'place' | 'service';
    topics?: MasterTopic[]; // 1-2 topics
    userId: string;
    rating: number; // 1-5
    text: string;
    createdAt: string;
    photos?: string[];
    helpfulCount: number;
}

export interface DemoStats {
    totalUsers: number;
    activeNow: number;
    totalVotes: number;
    totalReviews: number;
    totalBattles: number;
    totalSignals: number;
    totalComments: number;
    trendingTopics: { topic: string; growth: number }[];
}

export interface DemoProduct {
    id: string;
    barcode?: string; // EAN-13
    name: string;
    brand: string;
    category: string;
    type: 'product' | 'place' | 'service';
    image: string;
    defaultTopics?: string[]; // For seed generation
    signal?: number; // 0-100
    votesCount?: number;
}

export interface DemoDataState {
    currentUser: DemoUser | null; // For simulating "my" view
    users: DemoUser[];
    products: DemoProduct[];
    battles: DemoBattle[];
    signals: DemoSignal[];
    reviews: DemoReview[];
    stats: DemoStats;
}
