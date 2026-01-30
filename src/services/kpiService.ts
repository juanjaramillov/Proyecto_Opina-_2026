import { supabase } from "../supabase/client";

export type KpiShareRow = {
    option_id: string;
    weighted_signals: number;
    weighted_total: number;
    share: number; // 0..1
};

export type KpiVelocityRow = {
    option_id: string;
    delta: number;
};

export type KpiQualityRow = {
    metric_key: string;
    metric_value: number;
    metric_label: string;
};

export type DateRange = { start: Date; end: Date };

const toIso = (d: Date) => d.toISOString();



export const kpiService = {
    async shareOfPreference(battleId: string, range: DateRange): Promise<KpiShareRow[]> {
        const { data, error } = await supabase.rpc("kpi_share_of_preference", {
            p_battle_id: battleId,
            p_start_date: toIso(range.start),
            p_end_date: toIso(range.end),
        });

        if (error) throw error;

        // Hotfix: returns { option_id, weighted_signals, weighted_total, share }
        const rows = (data ?? []) as any[];

        return rows.map((r) => ({
            option_id: String(r.option_id),
            weighted_signals: Number(r.weighted_signals ?? 0),
            weighted_total: Number(r.weighted_total ?? 0),
            share: Number(r.share ?? 0), // Already pct in hotfix sql
        }));
    },

    async trendVelocity(battleId: string): Promise<KpiVelocityRow[]> {
        const { data, error } = await supabase.rpc("kpi_trend_velocity", {
            p_battle_id: battleId,
        });

        if (error) throw error;

        // Hotfix returns: { option_id, delta_weighted_signals }
        const rows = (data ?? []) as any[];

        return rows.map((r) => ({
            option_id: String(r.option_id),
            delta: Number(r.delta_weighted_signals ?? 0),
        }));
    },

    async engagementQuality(battleId: string, _range: DateRange): Promise<KpiQualityRow[]> {
        // Hotfix SQL takes ONLY p_battle_id.
        const { data, error } = await supabase.rpc("kpi_engagement_quality", {
            p_battle_id: battleId,
        });

        if (error) throw error;

        // Hotfix returns: { option_id, weighted_signals }
        const rows = (data ?? []) as any[];

        return rows.map((r) => ({
            metric_key: String(r.option_id),
            metric_value: Number(r.weighted_signals ?? 0),
            metric_label: `Opción ${r.option_id}`,
        }));
    },
};
