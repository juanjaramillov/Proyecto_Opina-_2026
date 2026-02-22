export type BattleOption = {
    id: 'A' | 'B' | string;
    label: string;
    imageUrl?: string | null;
    image_url?: string | null; // Database mapping
    imageFit?: 'cover' | 'contain'; // Control image spread
    icon?: string;
    type?: 'image' | 'brand' | 'text' | 'icon';
    color?: string;
    bgColor?: string;
    imageClassName?: string;
    stats?: {
        totalAnswers: number;
        onlineCount: number;
        consensus?: number;
        trend?: 'up' | 'down' | 'stable';
    };
};

export type BattleMomentum = {
    total_signals: number;
    options: {
        id: string;
        percentage: number;
        variant_24h: number;
        total: number;
    }[];
};

export type Battle = {
    id: string;
    title: string;
    subtitle?: string;
    totalVotes?: number;
    options: BattleOption[];
    myVote?: 'A' | 'B';
    tags?: string[];
    showPercentage?: boolean;
    isHighSignal?: boolean;
    type?: 'versus' | 'separator';
    layout?: 'versus' | 'opinion' | 'topic'; // Visual layout control
    mainImageUrl?: string | null; // Primary subject image for 'opinion' layout
    separatorText?: string;
    industry?: string;
    category: string; // Tailored survey category
    isRepeatable?: boolean;
    insights?: InsightQuestion[];
};

export type InsightQuestion = {
    id: string;
    question: string;
    type?: string;
    options: { id: string; label: string }[];
};

export type ProgressiveBattle = {
    id: string;
    title: string;
    subtitle?: string;
    industry?: string;
    theme?: {
        primary: string;
        accent: string;
        bgGradient: string;
        icon: string;
    };
    candidates?: BattleOption[];
};

export type VoteResult = Record<string, number>;
