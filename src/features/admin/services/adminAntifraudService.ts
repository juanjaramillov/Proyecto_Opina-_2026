import { supabase } from '../../../supabase/client';

export type AntifraudFlagRow = {
    id: string;
    created_at: string;
    updated_at: string;
    device_hash: string;
    flag_type: string;
    severity: string;
    is_active: boolean;
    banned: boolean;
    banned_at: string | null;
    banned_reason: string | null;
    details: any;
};

export type DeviceSummary = {
    ok: boolean;
    error?: string;
    device_hash?: string;
    last_signal_at?: string | null;
    signals_24h?: number;
    signals_10m?: number;
    distinct_users_24h?: number;
    distinct_battles_24h?: number;
};

export const adminAntifraudService = {
    listFlags: async (limit: number = 200): Promise<AntifraudFlagRow[]> => {
        const { data, error } = await supabase.rpc('admin_list_antifraud_flags' as any, { p_limit: limit });

        if (error) {
            throw error;
        }

        return data as AntifraudFlagRow[];
    },

    setBan: async (deviceHash: string, banned: boolean, reason?: string): Promise<{ ok: boolean; error?: string }> => {
        const { data, error } = await supabase.rpc('admin_set_device_ban' as any, {
            p_device_hash: deviceHash,
            p_banned: banned,
            p_reason: reason || null
        });

        if (error) {
            throw error;
        }

        return data as { ok: boolean; error?: string };
    },

    getDeviceSummary: async (deviceHash: string): Promise<DeviceSummary> => {
        const { data, error } = await supabase.rpc('admin_get_device_summary' as any, { p_device_hash: deviceHash });

        if (error) {
            throw error;
        }

        return data as DeviceSummary;
    }
};
