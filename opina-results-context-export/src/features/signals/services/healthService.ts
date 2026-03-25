import { supabase as sb } from "../../../supabase/client";
import { logger } from "../../../lib/logger";

export interface SystemHealth {
    data_quality_score: number;
    profile_completeness_avg: number;
    signal_integrity_pct: number;
}

export interface SuspiciousUser {
    user_id: string;
    trust_score: number;
    suspicious_flag: boolean;
    last_signal_at?: string;
}

export interface PlatformAlert {
    id: string;
    type: 'volatility' | 'fraud' | 'system' | 'momentum';
    severity: 'info' | 'warning' | 'critical' | 'medium';
    title: string;
    message: string;
    metadata: Record<string, unknown>;
    is_read: boolean;
    created_at: string;
}

export const healthService = {
    getSystemHealthMetrics: async (): Promise<SystemHealth> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string) => Promise<{ data: SystemHealth | null, error: unknown }>)('get_system_health_metrics');
        if (error) {
            logger.error('[HealthService] Error fetching health metrics:', error);
            return { data_quality_score: 0, profile_completeness_avg: 0, signal_integrity_pct: 0 };
        }
        return data || { data_quality_score: 0, profile_completeness_avg: 0, signal_integrity_pct: 0 };
    },

    getSuspiciousUsers: async (): Promise<SuspiciousUser[]> => {
        const { data, error } = await sb
            .from("user_stats")
            .select("user_id, trust_score, suspicious_flag, last_signal_at")
            .eq("suspicious_flag", true)
            .order("last_signal_at", { ascending: false });

        if (error) {
            logger.error('[HealthService] Error fetching suspicious users:', error);
            return [];
        }

        return (data as unknown) as SuspiciousUser[];
    },

    getPlatformAlerts: async (limit: number = 10): Promise<PlatformAlert[]> => {
        const { data, error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ data: PlatformAlert[] | null, error: unknown }>)('get_platform_alerts', {
            p_limit: limit
        });

        if (error) {
            logger.error('[HealthService] Error fetching platform alerts:', error);
            return [];
        }

        return (data as PlatformAlert[]) || [];
    },

    markPlatformAlertRead: async (alertId: string): Promise<boolean> => {
        const { error } = await (sb.rpc as unknown as (fn: string, p: object) => Promise<{ error: unknown }>)('mark_platform_alert_read', {
            p_alert_id: alertId
        });

        if (error) {
            logger.error('[HealthService] Error marking alert as read:', alertId, error);
            return false;
        }

        return true;
    }
} as const;
