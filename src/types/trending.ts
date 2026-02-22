export interface TrendingItem {
    id: string; // battle_id
    title: string; // battle_title
    slug: string; // battle_slug
    total_signals: number;
    trend_score: number; // total_weight
    snapshot_at: string;
    variation: number;
    variation_percent: number;
    direction: 'up' | 'down' | 'stable';
}
