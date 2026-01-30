export type BattleOption = {
    id: 'A' | 'B' | string;
    label: string;
    imageUrl?: string;
    icon?: string;
    type?: 'image' | 'brand' | 'text' | 'icon';
    color?: string;
    bgColor?: string;
    imageClassName?: string;
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
    separatorText?: string;
    industry?: string; // For progressive
};

export type ProgressiveBattle = {
    id: string;
    title: string;
    subtitle?: string;
    industry?: string;
    candidates: BattleOption[];
};

export type VoteResult = Record<string, number>;
