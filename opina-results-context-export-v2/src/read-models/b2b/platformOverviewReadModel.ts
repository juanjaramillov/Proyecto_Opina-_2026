import { supabase } from '../../supabase/client';
import { logger } from '../../lib/logger';
import { ThresholdPolicies } from '../shared/thresholdPolicies';
import { 
    PlatformOverviewSnapshot, 
    LeaderboardEntry, 
    TrendEntry, 
    TrendSummary, 
    DemographicInsight,
    ConfidenceLevel,
    SufficiencyState
} from '../types';

export const platformOverviewReadModel = {
    async getOverviewSnapshot(): Promise<PlatformOverviewSnapshot> {
        try {
            // Fetch multiple data points in parallel
            const [
                leaderboardData,
                trendData,
                kpisData,
                demographicsData
            ] = await Promise.all([
                this.fetchLeaderboard(),
                this.fetchTrends(),
                this.fetchGlobalKPIs(),
                this.fetchDemographics()
            ]);

            // Calculate confidence purely based on total volume of signals
            const totalSignals = kpisData.totalSignalsProcessed || 0;
            const confidence = ThresholdPolicies.evaluateConfidence(totalSignals);
            
            // Calculate sufficiency state
            let sufficiency: SufficiencyState = 'sufficient_data';
            if (totalSignals === 0) {
                sufficiency = 'insufficient_data';
            } else if (totalSignals < 50 || leaderboardData.length < 3) {
                sufficiency = 'partial_data';
            }

            return {
                calculatedAt: new Date().toISOString(),
                confidence,
                sufficiency,
                globalStats: {
                    totalSignalsProcessed: totalSignals,
                    activeUsers24h: kpisData.activeUsers24h || 0
                },
                leaderboardTop10: leaderboardData,
                demographicInsights: demographicsData,
                trendSummary: trendData
            };
        } catch (error) {
            logger.error('Failed to assemble PlatformOverviewSnapshot', { domain: 'b2b_read_model' }, error);
            
            // Fallback Degraded Snapshot to prevent UI hard break
            return {
                calculatedAt: new Date().toISOString(),
                confidence: 'none',
                sufficiency: 'insufficient_data',
                globalStats: { totalSignalsProcessed: 0, activeUsers24h: 0 },
                leaderboardTop10: [],
                demographicInsights: [],
                trendSummary: { trendingUp: [], trendingDown: [], stable: [] }
            };
        }
    },

    async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
        const { data, error } = await supabase
            .from('v_comparative_preference_summary')
            .select('entity_id, entity_name, wins_count, total_comparisons, win_rate')
            .order('win_rate', { ascending: false })
            .limit(10);

        if (error || !data) return [];

        return data
            .filter(r => ThresholdPolicies.isEligibleForGlobalRanking(r.total_comparisons || 0))
            .map(r => ({
                entityId: r.entity_id || '',
                entityName: r.entity_name || 'Desconocido',
                winsCount: r.wins_count || 0,
                totalComparisons: r.total_comparisons || 0,
                winRate: r.win_rate || 0
            }));
    },

    async fetchTrends(): Promise<TrendSummary> {
        const summary: TrendSummary = { trendingUp: [], trendingDown: [], stable: [] };
        
        const { data, error } = await supabase
            .from('v_trend_week_over_week')
            .select('entity_id, entity_name, current_signal_count, trend_status')
            .order('current_signal_count', { ascending: false });

        if (error || !data) return summary;

        for (const row of data) {
            const entry: TrendEntry = {
                entityId: row.entity_id || '',
                entityName: row.entity_name || 'Desconocido',
                signalCount: row.current_signal_count || 0
            };

            if (row.trend_status === 'acelerando') {
                summary.trendingUp.push(entry);
            } else if (row.trend_status === 'bajando') {
                summary.trendingDown.push(entry);
            } else if (row.trend_status === 'estable') {
                summary.stable.push(entry);
            }
        }

        return summary;
    },

    async fetchGlobalKPIs(): Promise<{ totalSignalsProcessed: number, activeUsers24h: number }> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase.rpc('get_results_kpis' as any);
        if (error || !data) {
            return { totalSignalsProcessed: 0, activeUsers24h: 0 };
        }
        const typedData = data as { total_signals?: number, active_users_24h?: number };
        return {
            totalSignalsProcessed: typedData.total_signals || 0,
            activeUsers24h: typedData.active_users_24h || 0
        };
    },

    async fetchDemographics(): Promise<DemographicInsight[]> {
        const { data, error } = await supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('v_demographic_preference_insights' as any)
            .select('*')
            .order('preference_percentage', { ascending: false })
            .filter('preference_percentage', 'gt', 50)
            .limit(6);

        if (error || !data) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((r: any) => {
            const isMaj = ThresholdPolicies.isMajority(r.preference_percentage);
            return {
                segmentName: `${r.gender || 'Genérico'} - ${r.age_bucket || 'General'}`,
                finding: `Prefiere ${r.entity_name} en un ${Math.round(r.preference_percentage)}%`,
                confidence: isMaj ? 'confident' : 'exploratory' as ConfidenceLevel
            };
        });
    }
};
