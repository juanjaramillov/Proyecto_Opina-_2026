import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export interface InviteRow {
    id: string;
    code: string;
    assigned_alias: string | null;
    status: string;
    expires_at: string | null;
    used_at: string | null;
    used_by_user_id: string | null;
    created_at: string;
}

export type RedemptionRow = {
    id: string;
    created_at: string;
    invite_code_entered: string;
    result: string;
    nickname: string | null;
    user_id: string | null;
    anon_id: string | null;
    invite_id: string | null;
    app_version: string | null;
    user_agent: string | null;
};

export const adminInvitesService = {
    /**
     * Generates multiple invites.
     */
    async generateInvites(count: number, prefix?: string): Promise<InviteRow[]> {
        const { data, error } = await (supabase.rpc as any)('admin_generate_invites', {
            p_count: count,
            p_prefix: prefix ?? 'OP'
        });

        if (error) {
            logger.error('Error in admin_generate_invites RPC:', error);
            throw error;
        }

        return (data as unknown as InviteRow[]) || [];
    },

    /**
     * Retrieves the current list of invites.
     */
    async listInvites(limit?: number): Promise<InviteRow[]> {
        const { data, error } = await (supabase.rpc as any)('admin_list_invites', {
            p_limit: limit ?? 200
        });

        if (error) {
            logger.error('Error in admin_list_invites RPC:', error);
            throw error;
        }

        return (data as unknown as InviteRow[]) || [];
    },

    /**
     * Revokes a specific invite by code.
     */
    async revokeInvite(code: string): Promise<{ ok: boolean; error?: string }> {
        const { data, error } = await (supabase.rpc as any)('admin_revoke_invite', {
            p_code: code
        });

        if (error) {
            logger.error('Error in admin_revoke_invite RPC:', error);
            throw error;
        }

        return (data as unknown) as { ok: boolean; error?: string };
    },

    /**
     * Retrieves the current list of invite redemptions.
     */
    async listRedemptions(limit?: number): Promise<RedemptionRow[]> {
        const { data, error } = await (supabase.rpc as any)('admin_list_invite_redemptions', {
            p_limit: limit ?? 200
        });

        if (error) {
            logger.error('Error in admin_list_invite_redemptions RPC:', error);
            throw error;
        }

        return (data as unknown as RedemptionRow[]) || [];
    }
};
