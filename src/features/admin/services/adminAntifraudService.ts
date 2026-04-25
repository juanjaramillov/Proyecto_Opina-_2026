import { typedRpc } from '../../../supabase/typedRpc';

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
    details: Record<string, unknown>;
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

// #9 Media Drimo — multi-cuenta detectado vía user_sessions.device_hash
export type MultiAccountDeviceRow = {
    device_hash: string;
    distinct_users: number;
    total_sessions: number;
    first_seen_at: string;
    last_seen_at: string;
    has_active: boolean;
};

export type DeviceUserRow = {
    user_id: string;
    user_email: string | null;
    sessions_count: number;
    first_seen_at: string;
    last_seen_at: string;
    has_active: boolean;
};

export const adminAntifraudService = {
    listFlags: async (limit: number = 200): Promise<AntifraudFlagRow[]> => {
        const { data, error } = await typedRpc<AntifraudFlagRow[]>('admin_list_antifraud_flags', { p_limit: limit });
        if (error) throw error;
        return data ?? [];
    },

    setBan: async (deviceHash: string, banned: boolean, reason?: string): Promise<{ ok: boolean; error?: string }> => {
        const { data, error } = await typedRpc<{ ok: boolean; error?: string }>('admin_set_device_ban', {
            p_device_hash: deviceHash,
            p_banned: banned,
            p_reason: reason || null
        });
        if (error) throw error;
        return data ?? { ok: false, error: 'sin respuesta del servidor' };
    },

    getDeviceSummary: async (deviceHash: string): Promise<DeviceSummary> => {
        const { data, error } = await typedRpc<DeviceSummary>('admin_get_device_summary', { p_device_hash: deviceHash });
        if (error) throw error;
        return data ?? { ok: false, error: 'sin respuesta del servidor' };
    },

    /**
     * #9 Media — Lista device_hashes con N+ usuarios distintos en los
     * últimos N días (basado en user_sessions, NO en signal_events).
     */
    findMultiAccountDevices: async (
        minUsers: number = 3,
        sinceDays: number = 30
    ): Promise<MultiAccountDeviceRow[]> => {
        const { data, error } = await typedRpc<MultiAccountDeviceRow[]>(
            'admin_find_multi_account_devices',
            { p_min_users: minUsers, p_since_days: sinceDays }
        );
        if (error) throw error;
        return data ?? [];
    },

    /**
     * #9 Media — Dado un device_hash, retorna los usuarios que se
     * loguearon desde ese device (con counts y fechas).
     */
    listDeviceUsers: async (
        deviceHash: string,
        sinceDays: number = 30
    ): Promise<DeviceUserRow[]> => {
        const { data, error } = await typedRpc<DeviceUserRow[]>(
            'admin_list_device_users',
            { p_device_hash: deviceHash, p_since_days: sinceDays }
        );
        if (error) throw error;
        return data ?? [];
    }
};
