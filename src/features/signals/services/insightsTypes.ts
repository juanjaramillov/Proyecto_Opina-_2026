export interface DepthInsight {
    question_id: string;
    total_responses: number;
    average_score: number;
}

export interface TemporalComparison {
    option_id: string;
    current_score: number;
    past_score: number;
    variation: number;
    variation_percent: number;
}

export interface B2BAnalyticsOption {
    option_id: string;
    option_label?: string;
    is_winner?: boolean;
    normalized_score?: number;
    raw_win_rate?: number;
    raw_score?: number;
    effective_score?: number;
    lower_bound?: number;
    upper_bound?: number;
    technical_tie_flag?: boolean;
    [key: string]: unknown;
}

export interface B2BBattleAnalytics {
    battle_id: string;
    stats_version: string;
    total_effective_weight: number;
    n_eff: number;
    options_count: number;
    analytics_payload: B2BAnalyticsOption[];
    global_entropy_normalized: number;
    global_fragmentation_label: string;
}

export interface B2BEligibility {
    entity_id: string;
    opinascore_value: number;
    opinascore_base: number;
    integrity_multiplier: number;
    opinascore_version: string;
    opinascore_context: string;
    eligibility_status: 'PUBLISHABLE' | 'EXPLORATORY' | 'INTERNAL_ONLY';
    eligibility_reasons: string[];
    integrity_score: number;
    integrity_flags: string[];
    n_eff: number;
    technical_tie_flag: boolean;
    stability_label: string;
    entropy_normalized: number;
    decay_applied: boolean;
    stats_version: string;
}

export interface IntegrityFlags {
    integrity_score: number;
    flag_device_concentration: boolean;
    flag_velocity_burst: boolean;
    flag_repetitive_pattern: boolean;
    analysis_warning_label: string;
}

export interface VolatilityData {
    volatility_score: number;
    volatility_index: number;
    classification: 'stable' | 'moderate' | 'volatile';
}

export interface PolarizationData {
    top_share: number;
    second_share: number;
    polarization_index: number;
    classification: string;
}

export interface SegmentInfluence {
    age_range: string;
    gender: string;
    commune: string;
    segment_variation: number;
    contribution_percent: number;
}

export interface EarlySignal {
    option_id: string;
    option_label: string;
    recent_score: number;
    historical_avg: number;
    momentum_ratio: number;
    classification: 'emerging' | 'cooling' | 'stable';
}

export interface EnterpriseRanking {
    option_id: string;
    option_label: string;
    total_weight: number;
    rank_position: number;
    snapshot_at: string;
}

export interface ClientPlanStatus {
    plan_name: string;
    monthly_price: number;
    request_limit: number;
    requests_used: number;
    features: {
        segment_access: boolean;
        depth_access: boolean;
        [key: string]: unknown;
    };
}
